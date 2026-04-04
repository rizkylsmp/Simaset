import XLSX from "xlsx";
import sequelize from "./src/config/database.js";

const wb = XLSX.readFile("D:/DOWNLOADS/Data Aset (1).xlsx");
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

const [dbRows] = await sequelize.query(`
  SELECT id_aset, nomor_sertifikat, desa_kelurahan, jenis_hak, luas,
         koordinat_lat, koordinat_long, kode_aset
  FROM aset WHERE kode_aset LIKE 'BPKA-%' AND koordinat_lat IS NOT NULL
`);

// Build lookup by kelurahan
const dbByKel = {};
for (const r of dbRows) {
  const k = (r.desa_kelurahan || "").toUpperCase();
  if (!dbByKel[k]) dbByKel[k] = [];
  dbByKel[k].push({ ...r, used: false });
}

console.log("DB kelurahan groups:", Object.keys(dbByKel));
console.log("DB total geo records:", dbRows.length);

let matched = 0,
  unmatched = 0;
const matchDetails = [];

for (let r = 4; r < data.length; r++) {
  if (!data[r] || !data[r].length) continue;
  const kel = (data[r][2] || "").toUpperCase();
  const luas = parseFloat(data[r][6]) || 0;

  if (!dbByKel[kel]) {
    unmatched++;
    continue;
  }

  let best = null,
    bestDiff = Infinity;
  for (const db of dbByKel[kel]) {
    if (db.used) continue;
    const dbLuas = parseFloat(db.luas) || 0;
    if (dbLuas === 0 || luas === 0) continue;
    const diff = Math.abs(dbLuas - luas) / Math.max(dbLuas, luas);
    if (diff < 0.2 && diff < bestDiff) {
      bestDiff = diff;
      best = db;
    }
  }

  if (best) {
    best.used = true;
    matched++;
    if (matchDetails.length < 10) {
      matchDetails.push({
        xl_sert: data[r][4],
        xl_luas: luas,
        xl_kel: kel,
        db_sert: best.nomor_sertifikat,
        db_luas: parseFloat(best.luas),
        diff: (bestDiff * 100).toFixed(1) + "%",
      });
    }
  } else {
    unmatched++;
  }
}

console.log("\nMatched (kel+luas 20%):", matched);
console.log("Unmatched:", unmatched);
console.log("\nSample matches:");
matchDetails.forEach((m) => console.log(JSON.stringify(m)));

let dbUsed = 0,
  dbUnused = 0;
Object.values(dbByKel).forEach((arr) =>
  arr.forEach((r) => (r.used ? dbUsed++ : dbUnused++)),
);
console.log("\nDB matched:", dbUsed, "/ Orphaned:", dbUnused);

await sequelize.close();
