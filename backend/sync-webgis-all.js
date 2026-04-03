/**
 * sync-webgis-all.js
 *
 * Sync semua data WebGIS ke tabel aset:
 *   - BPN  : bidang_tanah.geojson  → kode_aset = BPN-{NIB}
 *   - BPKA: bidang_tanah1.geojson → kode_aset = BPKA-{NIB}
 *
 * Jalankan dari folder backend:
 *   node sync-webgis-all.js
 *
 * Field NIB disimpan di kolom `nib` untuk pencocokan polygon di peta.
 */

import { access, readFile } from "fs/promises";
import path from "path";
import { sequelize, Aset, User } from "./src/models/index.js";
import { Op } from "sequelize";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getGeometryPoints = (geometry) => {
  if (!geometry?.type || !geometry?.coordinates) return [];
  if (geometry.type === "Point") return [geometry.coordinates];
  if (geometry.type === "Polygon") return geometry.coordinates?.[0] || [];
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates?.[0]?.[0] || [];
  return [];
};

const getCentroidFromGeometry = (geometry) => {
  const points = getGeometryPoints(geometry);
  if (!points.length) return { lat: null, lng: null };

  let sumLng = 0,
    sumLat = 0,
    count = 0;
  for (const point of points) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const lng = toNumber(point[0]);
    const lat = toNumber(point[1]);
    if (lng === null || lat === null) continue;
    sumLng += lng;
    sumLat += lat;
    count += 1;
  }
  if (!count) return { lat: null, lng: null };
  return { lat: sumLat / count, lng: sumLng / count };
};

const getPolygonLatLng = (geometry) => {
  const points = getGeometryPoints(geometry);
  if (!points.length) return null;

  const ring = points
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null;
      const lng = toNumber(point[0]);
      const lat = toNumber(point[1]);
      if (lng === null || lat === null) return null;
      return [lat, lng]; // simpan sebagai [lat, lng] → normalizePolygonRing di frontend handles ini
    })
    .filter(Boolean);

  return ring.length >= 3 ? ring : null;
};

const resolveGeojsonPath = async (...relCandidates) => {
  for (const rel of relCandidates) {
    const candidate = path.resolve(process.cwd(), rel);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  throw new Error(`File GeoJSON tidak ditemukan: ${relCandidates.join(", ")}`);
};

const ensureNibColumn = async () => {
  try {
    await sequelize.query(
      `ALTER TABLE aset ADD COLUMN IF NOT EXISTS nib VARCHAR(50);`,
    );
    console.log("✅ Kolom nib sudah ada / berhasil ditambahkan");
  } catch (err) {
    console.warn("⚠️  ensureNibColumn:", err.message);
  }
};

// ─── BPN Builder ──────────────────────────────────────────────────────────────

const buildBpnRow = (feature, index, usedCodes, createdBy, now) => {
  const props = feature.properties || {};
  const geometry = feature.geometry || null;

  const nibRaw = String(props.NIB || "").trim();
  const nibClean = nibRaw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const baseCode = nibClean
    ? `BPN-${nibClean}`
    : `BPN-${String(index + 1).padStart(5, "0")}`;

  let kodeAset = baseCode;
  let suffix = 1;
  while (usedCodes.has(kodeAset)) {
    kodeAset = `${baseCode}-${suffix}`;
    suffix += 1;
  }
  usedCodes.add(kodeAset);

  const kecamatan = (props.KECAMATAN || "").toString().trim() || null;
  const kelurahan = (props.KELURAHAN || "").toString().trim() || null;
  const tipeHak = (props["TIPE HAK"] || "").toString().trim() || null;
  const penggunaan = (props.PENGGUNAAN || "").toString().trim() || null;
  const nomorHak = (props["NOMOR HAK"] || "").toString().trim() || null;
  const suratUkur = (props["SURAT UKUR"] || "").toString().trim() || null;
  const statusSertif =
    (props["STATUS SERTIFIKAT"] || "").toString().trim() || null;
  const pemilik = (props["PEMILIK AKHIR"] || "").toString().trim() || null;
  const luas = toNumber(props.LUAS);

  const { lat, lng } = getCentroidFromGeometry(geometry);
  const polygon = getPolygonLatLng(geometry);
  const lokasi = [kelurahan, kecamatan, "Kota Pasuruan"]
    .filter(Boolean)
    .join(", ");

  // Status: jika "Belum Bersertifikat" → lihat apakah ada masalah lain
  const statusAset =
    statusSertif && statusSertif.toLowerCase().includes("sengketa")
      ? "Bermasalah"
      : "Aktif";

  const namaBidang = penggunaan
    ? `Bidang ${penggunaan} (${nibRaw || kodeAset})`
    : `Bidang Tanah BPN ${nibRaw || String(index + 1)}`;

  return {
    kode_aset: kodeAset,
    nib: nibRaw || null,
    nama_aset: namaBidang,
    lokasi: lokasi || "Kota Pasuruan",
    koordinat_lat: lat,
    koordinat_long: lng,
    luas,
    status: statusAset,
    jenis_aset: "Aset BPN",
    nomor_sertifikat: nomorHak || nibRaw || null,
    status_sertifikat: statusSertif || null,
    keterangan: suratUkur ? `Surat Ukur: ${suratUkur}` : null,
    jenis_hak: tipeHak,
    atas_nama: pemilik || "Pemerintah Kota Pasuruan",
    kecamatan,
    desa_kelurahan: kelurahan,
    luas_lapangan: luas,
    penggunaan_saat_ini: penggunaan,
    opd_pengguna: "BPN",
    polygon_bidang: polygon,
    created_by: createdBy,
    created_at: now,
    updated_at: now,
  };
};

// ─── BPKA Builder ────────────────────────────────────────────────────────────

const buildBpkadRow = (feature, index, usedCodes, createdBy, now) => {
  const props = feature.properties || {};
  const geometry = feature.geometry || null;

  const nibRaw = String(props.NIB || "").trim();
  const nibClean = nibRaw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const baseCode = nibClean
    ? `BPKA-${nibClean}`
    : `BPKA-${String(index + 1).padStart(5, "0")}`;

  let kodeAset = baseCode;
  let suffix = 1;
  while (usedCodes.has(kodeAset)) {
    kodeAset = `${baseCode}-${suffix}`;
    suffix += 1;
  }
  usedCodes.add(kodeAset);

  const kecamatan = (props.KECAMATAN || "").toString().trim() || null;
  const kelurahan = (props.KELURAHAN || "").toString().trim() || null;
  const tipeHak = (props["TIPE HAK"] || "").toString().trim() || null;
  const penggunaan = (props.PENGGUNAAN || "").toString().trim() || null;
  const keterangan = (props.KETERANGAN || "").toString().trim() || null;
  const luas = toNumber(props.LUAS);

  const { lat, lng } = getCentroidFromGeometry(geometry);
  const polygon = getPolygonLatLng(geometry);
  const lokasi = [kelurahan, kecamatan, "Kota Pasuruan"]
    .filter(Boolean)
    .join(", ");

  const namaBidang = penggunaan
    ? `Aset ${penggunaan} (${nibRaw || kodeAset})`
    : `Aset Pemkot BPKA ${nibRaw || String(index + 1)}`;

  return {
    kode_aset: kodeAset,
    nib: nibRaw || null,
    nama_aset: namaBidang,
    lokasi: lokasi || "Kota Pasuruan",
    koordinat_lat: lat,
    koordinat_long: lng,
    luas,
    status: "Aktif",
    jenis_aset: "Aset Pemkot (BPKA)",
    nomor_sertifikat: nibRaw || null,
    status_sertifikat: null,
    keterangan,
    jenis_hak: tipeHak,
    atas_nama: "Pemerintah Kota Pasuruan",
    kecamatan,
    desa_kelurahan: kelurahan,
    luas_lapangan: luas,
    penggunaan_saat_ini: penggunaan,
    opd_pengguna: "BPKA",
    polygon_bidang: polygon,
    created_by: createdBy,
    created_at: now,
    updated_at: now,
  };
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log("🗺️  Sync WebGIS → Sistem dimulai...\n");

  // 1. Cari user admin untuk created_by
  const adminUser =
    (await User.findOne({ where: { role: "admin_bpka" } })) ||
    (await User.findOne({ where: { role: "admin_bpn" } })) ||
    (await User.findOne({ where: { role: { [Op.like]: "admin%" } } }));

  if (!adminUser) {
    throw new Error(
      "User admin tidak ditemukan. Jalankan seed user terlebih dahulu.",
    );
  }
  console.log(`👤 Using user: ${adminUser.username} (${adminUser.role})`);

  // 2. Pastikan kolom nib ada di database
  await ensureNibColumn();

  // 3. Resolve paths GeoJSON
  const bpnPath = await resolveGeojsonPath(
    "../frontend/public/data/bidang_tanah.geojson",
    "frontend/public/data/bidang_tanah.geojson",
  );
  const bpkaPath = await resolveGeojsonPath(
    "../frontend/public/data/bidang_tanah1.geojson",
    "frontend/public/data/bidang_tanah1.geojson",
  );

  console.log(`📂 BPN   : ${bpnPath}`);
  console.log(`📂 BPKA : ${bpkaPath}`);

  // 4. Parse GeoJSON
  const bpnGeoJson = JSON.parse(await readFile(bpnPath, "utf8"));
  const bpkaGeoJson = JSON.parse(await readFile(bpkaPath, "utf8"));

  const bpnFeatures = Array.isArray(bpnGeoJson?.features)
    ? bpnGeoJson.features
    : [];
  const bpkaFeatures = Array.isArray(bpkaGeoJson?.features)
    ? bpkaGeoJson.features
    : [];

  if (!bpnFeatures.length) throw new Error("BPN GeoJSON kosong / tidak valid");
  if (!bpkaFeatures.length)
    throw new Error("BPKA GeoJSON kosong / tidak valid");

  console.log(`\n📊 BPN features   : ${bpnFeatures.length}`);
  console.log(`📊 BPKA features : ${bpkaFeatures.length}`);

  // 5. Jalankan dalam satu transaksi
  const tx = await sequelize.transaction();
  try {
    // Hapus aset BPN dan BPKA lama
    const deletedBPN = await Aset.destroy({
      where: {
        [Op.or]: [
          { kode_aset: { [Op.like]: "BPN-%" } },
          { jenis_aset: "Aset BPN" },
          { opd_pengguna: "BPN" },
        ],
      },
      transaction: tx,
    });

    const deletedBPKA = await Aset.destroy({
      where: {
        [Op.or]: [
          { kode_aset: { [Op.like]: "BPKA-%" } },
          { jenis_aset: "Aset Pemkot (BPKA)" },
          { opd_pengguna: { [Op.iLike]: "%BPKA%" } },
          { atas_nama: { [Op.iLike]: "%Pemerintah Kota Pasuruan%" } },
        ],
      },
      transaction: tx,
    });

    console.log(
      `\n🗑️  Dihapus: ${deletedBPN} BPN + ${deletedBPKA} BPKA lama`,
    );

    // Build rows (usedCodes global agar tidak ada duplikat lintas BPN/BPKA)
    const usedCodes = new Set();
    const now = new Date();

    const bpnRows = bpnFeatures.map((feature, i) =>
      buildBpnRow(feature, i, usedCodes, adminUser.id_user, now),
    );

    const bpkaRows = bpkaFeatures.map((feature, i) =>
      buildBpkadRow(feature, i, usedCodes, adminUser.id_user, now),
    );

    const allRows = [...bpnRows, ...bpkaRows];

    // Bulk insert
    await Aset.bulkCreate(allRows, { transaction: tx });

    await tx.commit();

    // Ringkasan
    const bpnWithPolygon = bpnRows.filter((r) => r.polygon_bidang).length;
    const bpkaWithPolygon = bpkaRows.filter((r) => r.polygon_bidang).length;
    const bpnWithCoord = bpnRows.filter((r) => r.koordinat_lat).length;
    const bpkaWithCoord = bpkaRows.filter((r) => r.koordinat_lat).length;

    console.log("\n✅ Sinkronisasi berhasil!");
    console.log(
      `   BPN   : ${bpnRows.length} aset (${bpnWithPolygon} polygon, ${bpnWithCoord} koordinat)`,
    );
    console.log(
      `   BPKA : ${bpkaRows.length} aset (${bpkaWithPolygon} polygon, ${bpkaWithCoord} koordinat)`,
    );
    console.log(`   Total : ${allRows.length} aset`);
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

run()
  .catch((err) => {
    console.error("\n❌ Gagal sinkronisasi:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await sequelize.close();
  });
