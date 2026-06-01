import { access, readFile } from "fs/promises";
import path from "path";
import { sequelize, Aset, User } from "./src/models/index.js";

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

  let sumLng = 0;
  let sumLat = 0;
  let count = 0;

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

  const polygon = points
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) return null;
      const lng = toNumber(point[0]);
      const lat = toNumber(point[1]);
      if (lng === null || lat === null) return null;
      return [lat, lng];
    })
    .filter(Boolean);

  return polygon.length >= 3 ? polygon : null;
};

const resolveGeojsonPath = async () => {
  const candidates = [
    path.resolve(
      process.cwd(),
      "../frontend/public/data/bidang_tanah1.geojson",
    ),
    path.resolve(process.cwd(), "frontend/public/data/bidang_tanah1.geojson"),
    path.resolve(process.cwd(), "src/data/webgis/bidang_tanah1.geojson"),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error("File bidang_tanah1.geojson tidak ditemukan");
};

async function run() {
  const geojsonPath = await resolveGeojsonPath();
  const admin = await User.findOne({ where: { role: "admin_bpka" } });
  if (!admin) {
    throw new Error(
      "User admin_bpka tidak ditemukan. Jalankan seed user terlebih dahulu.",
    );
  }

  const raw = await readFile(geojsonPath, "utf8");
  const geojson = JSON.parse(raw);
  const features = Array.isArray(geojson?.features) ? geojson.features : [];

  if (!features.length) {
    throw new Error("Feature GeoJSON kosong");
  }

  const tx = await sequelize.transaction();
  try {
    const deletedCount = await Aset.destroy({
      where: sequelize.or(
        { kode_aset: { [sequelize.Sequelize.Op.like]: "BPKA-%" } },
        { jenis_aset: "Bidang Tanah" },
        { opd_pengguna: { [sequelize.Sequelize.Op.iLike]: "%BPKA%" } },
        {
          atas_nama: {
            [sequelize.Sequelize.Op.iLike]: "%Pemerintah Kota Pasuruan%",
          },
        },
      ),
      transaction: tx,
    });

    const usedCodes = new Set();
    const now = new Date();
    const rows = [];

    for (let i = 0; i < features.length; i += 1) {
      const feature = features[i] || {};
      const props = feature.properties || {};
      const geometry = feature.geometry || null;

      const nibRaw = String(props.NIB || "").trim();
      const nibClean = nibRaw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const baseCode = nibClean
        ? `BPKA-${nibClean}`
        : `BPKA-${String(i + 1).padStart(4, "0")}`;
      let kodeAset = baseCode;
      let suffix = 1;
      while (usedCodes.has(kodeAset)) {
        kodeAset = `${baseCode}-${suffix}`;
        suffix += 1;
      }
      usedCodes.add(kodeAset);

      const kecamatan = (props.KECAMATAN || "").toString().trim() || null;
      const kelurahan = (props.KELURAHAN || "").toString().trim() || null;
      const penggunaan = (props.PENGGUNAAN || "").toString().trim() || null;
      const tipeHak = (props["TIPE HAK"] || "").toString().trim() || null;
      const keterangan = (props.KETERANGAN || "").toString().trim() || null;
      const luas = toNumber(props.LUAS);
      const { lat, lng } = getCentroidFromGeometry(geometry);
      const polygon = getPolygonLatLng(geometry);
      const lokasi = [kelurahan, kecamatan, "Kota Pasuruan"]
        .filter(Boolean)
        .join(", ");

      rows.push({
        kode_aset: kodeAset,
        nama_aset: penggunaan ? `Aset ${penggunaan}` : `Bidang Tanah ${i + 1}`,
        lokasi: lokasi || "Kota Pasuruan",
        koordinat_lat: lat,
        koordinat_long: lng,
        luas,
        status: "Aktif",
        jenis_aset: "Bidang Tanah",
        keterangan,
        jenis_hak: tipeHak,
        kecamatan,
        desa_kelurahan: kelurahan,
        luas_lapangan: luas,
        penggunaan_saat_ini: penggunaan,
        opd_pengguna: "BPKA",
        atas_nama: "Pemerintah Kota Pasuruan",
        nomor_sertifikat: nibRaw || null,
        polygon_bidang: polygon,
        created_by: admin.id_user,
        created_at: now,
        updated_at: now,
      });
    }

    await Aset.bulkCreate(rows, { transaction: tx });
    await tx.commit();

    console.log("✅ Sinkronisasi BPKA berhasil");
    console.log("File:", geojsonPath);
    console.log("Deleted:", deletedCount);
    console.log("Imported:", rows.length);
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

run()
  .catch((err) => {
    console.error("❌ Gagal sinkronisasi BPKA:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await sequelize.close();
  });
