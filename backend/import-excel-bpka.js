/**
 * Import Data Aset BPKA from Excel
 *
 * Strategy:
 * 1. Read all 1595 records from Excel
 * 2. Get existing 552 BPKA records from DB (have coordinates from WebGIS)
 * 3. Match Excel↔DB by kelurahan + luas (20% tolerance) to transfer coordinates
 * 4. Delete all old BPKA records
 * 5. Insert all Excel records as new BPKA records
 * 6. Report matching results
 *
 * Usage: node import-excel-bpka.js
 */

import XLSX from "xlsx";
import sequelize from "./src/config/database.js";
import { Aset } from "./src/models/index.js";

const EXCEL_PATH = "D:/DOWNLOADS/Data Aset (1).xlsx";
const HEADER_ROW = 3; // 0-indexed
const DATA_START = 4;

// Column indices (0-based)
const COL = {
  FILE_PATH: 0,
  MARKER: 1,
  KELURAHAN: 2,
  HAK: 3,
  NO_SERTIFIKAT: 4,
  PENGUNAAN_SERT: 5,
  LUAS: 6,
  NOTES: 7,
  TGL_SERTIFIKAT: 8,
  TAHUN_SCAN: 9,
  IDPEMDA: 10,
  NIBAR: 11,
  KODE_BARANG: 12,
  NO_REGISTER: 13,
  UPT: 14,
  LUAS_KIB: 15,
  ALAMAT: 16,
  PENGGUNAAN: 17,
  HARGA_PEROLEHAN: 18,
  ACCESS_FILE: 19,
  PLOTTING: 20,
};

// Map HAK values
const normalizeHak = (hak) => {
  const map = {
    "HAK PAKAI": "Hak Pakai",
    "HAK MILIK": "Hak Milik",
    "HAK GUNA BANGUNAN": "Hak Guna Bangunan",
    "HAK PENGELOLAAN": "Hak Pengelolaan",
  };
  return map[(hak || "").toUpperCase().trim()] || hak || null;
};

// Convert Excel serial date to JS Date
const excelDateToISO = (serial) => {
  if (!serial || typeof serial !== "number") return null;
  const utcDays = Math.floor(serial - 25569);
  const d = new Date(utcDays * 86400 * 1000);
  return d.toISOString().split("T")[0];
};

// Parse luas (handle "-" and text)
const parseLuas = (val) => {
  if (!val || val === "-") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

// Parse harga (handle "-" and text)
const parseHarga = (val) => {
  if (!val || val === "-") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

async function run() {
  console.log("📂 Reading Excel file...");
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Parse Excel rows
  const excelRecords = [];
  for (let r = DATA_START; r < data.length; r++) {
    const row = data[r];
    if (!row || !row.length) continue;
    const kel = (row[COL.KELURAHAN] || "").trim();
    if (!kel || kel === "SCAN SERTIFIKAT HGB HM") continue; // Skip non-kelurahan rows

    excelRecords.push({
      rowNum: r + 1,
      kelurahan: kel.toUpperCase(),
      hak: row[COL.HAK],
      no_sertifikat: row[COL.NO_SERTIFIKAT]
        ? String(row[COL.NO_SERTIFIKAT]).trim()
        : null,
      pengunaan_sert: row[COL.PENGUNAAN_SERT]
        ? String(row[COL.PENGUNAAN_SERT]).trim()
        : null,
      luas: parseLuas(row[COL.LUAS]),
      notes: row[COL.NOTES] ? String(row[COL.NOTES]).trim() : null,
      tgl_sertifikat: excelDateToISO(row[COL.TGL_SERTIFIKAT]),
      tahun_scan: excelDateToISO(row[COL.TAHUN_SCAN]),
      id_pemda: row[COL.IDPEMDA] ? String(row[COL.IDPEMDA]).trim() : null,
      nibar: row[COL.NIBAR] ? String(row[COL.NIBAR]).trim() : null,
      kode_barang: row[COL.KODE_BARANG]
        ? String(row[COL.KODE_BARANG]).trim()
        : null,
      no_register: row[COL.NO_REGISTER]
        ? String(row[COL.NO_REGISTER]).trim()
        : null,
      upt: row[COL.UPT] ? String(row[COL.UPT]).trim() : null,
      luas_kib: parseLuas(row[COL.LUAS_KIB]),
      alamat: row[COL.ALAMAT] ? String(row[COL.ALAMAT]).trim() : null,
      penggunaan: row[COL.PENGGUNAAN]
        ? String(row[COL.PENGGUNAAN]).trim()
        : null,
      harga_perolehan: parseHarga(row[COL.HARGA_PEROLEHAN]),
      file_path: row[COL.FILE_PATH] ? String(row[COL.FILE_PATH]).trim() : null,
      plotting: row[COL.PLOTTING] ? String(row[COL.PLOTTING]).trim() : null,
    });
  }
  console.log(`✅ Parsed ${excelRecords.length} Excel records`);

  // Get existing BPKA records with coordinates
  console.log("\n📍 Fetching existing BPKA records with geo data...");
  const existingBpka = await Aset.findAll({
    where: {
      kode_aset: { [sequelize.constructor.Op.like]: "BPKA-%" },
    },
    raw: true,
  });
  console.log(`   Found ${existingBpka.length} existing BPKA records`);

  const geoRecords = existingBpka.filter(
    (r) => r.koordinat_lat && r.koordinat_long,
  );
  console.log(`   ${geoRecords.length} with coordinates`);

  // Build geo lookup by kelurahan
  const geoByKel = {};
  for (const r of geoRecords) {
    const k = (r.desa_kelurahan || "").toUpperCase();
    if (!geoByKel[k]) geoByKel[k] = [];
    geoByKel[k].push({ ...r, used: false });
  }

  // Match Excel records to geo records
  console.log("\n🔗 Matching Excel ↔ WebGIS coordinates...");
  let matchCount = 0;
  const matched = [];
  const unmatched = [];

  for (const excel of excelRecords) {
    const kel = excel.kelurahan;
    const luas = excel.luas || 0;
    let best = null,
      bestDiff = Infinity;

    if (geoByKel[kel]) {
      for (const db of geoByKel[kel]) {
        if (db.used) continue;
        const dbLuas = parseFloat(db.luas) || 0;
        if (dbLuas === 0 || luas === 0) continue;
        const diff = Math.abs(dbLuas - luas) / Math.max(dbLuas, luas);
        if (diff < 0.2 && diff < bestDiff) {
          bestDiff = diff;
          best = db;
        }
      }
    }

    if (best) {
      best.used = true;
      matchCount++;
      excel._geo = {
        lat: best.koordinat_lat,
        lng: best.koordinat_long,
        polygon: best.polygon_bidang,
        nib: best.nib,
      };
      matched.push(excel);
    } else {
      unmatched.push(excel);
    }
  }

  console.log(`   ✅ Matched: ${matchCount}`);
  console.log(`   ❌ No coordinates: ${unmatched.length}`);

  // Count orphaned DB records (have geo but no Excel match)
  let orphaned = 0;
  Object.values(geoByKel).forEach((arr) =>
    arr.forEach((r) => {
      if (!r.used) orphaned++;
    }),
  );
  console.log(`   🗑️  DB records without Excel match (orphaned): ${orphaned}`);

  // Delete all old BPKA records (already deleted in previous run, safe to re-run)
  console.log("\n🗑️  Deleting old BPKA records...");
  const deleteCount = await Aset.destroy({
    where: { kode_aset: { [sequelize.constructor.Op.like]: "BPKA-%" } },
    force: true,
  });
  console.log(`   Deleted ${deleteCount} old records`);

  // Get admin user for created_by
  const [adminRows] = await sequelize.query(
    `SELECT id_user FROM users WHERE role = 'admin_bpka' LIMIT 1`,
  );
  const createdBy = adminRows.length > 0 ? adminRows[0].id_user : 1;

  // Insert all Excel records
  console.log("\n📥 Inserting Excel records...");
  let inserted = 0,
    errors = 0;

  for (let i = 0; i < excelRecords.length; i++) {
    const rec = excelRecords[i];
    const paddedSert = rec.no_sertifikat
      ? String(rec.no_sertifikat).replace(/\s+/g, "-")
      : String(i + 1);
    const kodeAset = `BPKA-${rec.kelurahan}-${paddedSert}`;

    // Build nama_aset from available data
    const penggunaan = rec.pengunaan_sert || rec.penggunaan || rec.alamat || "";
    const namaAset =
      `${rec.hak || "Tanah"} No.${rec.no_sertifikat || "?"} - ${rec.kelurahan} - ${penggunaan}`.substring(
        0,
        150,
      );

    const geo = rec._geo || {};

    try {
      await Aset.create({
        kode_aset: kodeAset,
        nama_aset: namaAset,
        lokasi:
          rec.alamat && rec.alamat !== "-"
            ? rec.alamat
            : rec.pengunaan_sert || rec.kelurahan,
        koordinat_lat: geo.lat || null,
        koordinat_long: geo.lng || null,
        luas: rec.luas,
        status: "Aktif",
        jenis_aset: "Tanah",
        jenis_hak: normalizeHak(rec.hak),
        nomor_sertifikat: rec.no_sertifikat,
        tanggal_sertifikat: rec.tgl_sertifikat,
        desa_kelurahan: rec.kelurahan,
        penggunaan_saat_ini:
          rec.penggunaan && rec.penggunaan !== "-"
            ? rec.penggunaan
            : rec.pengunaan_sert || null,
        polygon_bidang: geo.polygon || null,
        nib: geo.nib || null,
        nibar: rec.nibar,
        id_pemda: rec.id_pemda,
        kode_barang: rec.kode_barang,
        no_register: rec.no_register,
        luas_kib: rec.luas_kib,
        harga_perolehan: rec.harga_perolehan,
        penggunaan_kib:
          rec.penggunaan && rec.penggunaan !== "-" ? rec.penggunaan : null,
        tanggal_scan: rec.tahun_scan,
        file_sertifikat: rec.file_path,
        notes: rec.notes,
        plotting_status: rec.plotting,
        opd_pengguna: rec.upt && rec.upt !== "-" ? rec.upt : null,
        nilai_aset: rec.harga_perolehan,
        created_by: createdBy,
      });
      inserted++;
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`   Error row ${rec.rowNum}: ${err.message}`);
      }
    }

    if ((inserted + errors) % 200 === 0) {
      process.stdout.write(
        `   Progress: ${inserted + errors}/${excelRecords.length}\r`,
      );
    }
  }

  console.log(`\n\n========== IMPORT COMPLETE ==========`);
  console.log(`📊 Total Excel records: ${excelRecords.length}`);
  console.log(`✅ Inserted: ${inserted}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`🗺️  With coordinates (matched): ${matchCount}`);
  console.log(`📍 Without coordinates: ${unmatched.length}`);
  console.log(`🗑️  Old DB records deleted: ${deleteCount}`);
  console.log(`🏚️  Old DB records not matched (geo data lost): ${orphaned}`);

  // Show unmatched by kelurahan
  const unmatchByKel = {};
  unmatched.forEach((r) => {
    unmatchByKel[r.kelurahan] = (unmatchByKel[r.kelurahan] || 0) + 1;
  });
  console.log(`\n📋 Unmatched by kelurahan:`);
  Object.entries(unmatchByKel)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`   ${k}: ${v}`));

  await sequelize.close();
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
