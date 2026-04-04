/**
 * Re-match GeoJSON coordinates to imported BPKA Excel records
 * Match by KELURAHAN + LUAS (20% tolerance)
 */

import fs from "fs";
import sequelize from "./src/config/database.js";

async function run() {
  const geo = JSON.parse(
    fs.readFileSync("../frontend/public/data/bidang_tanah1.geojson", "utf8"),
  );
  console.log(`📍 GeoJSON features: ${geo.features.length}`);

  // Parse GeoJSON features
  const geoFeatures = geo.features.map((f) => {
    const props = f.properties;
    const coords = f.geometry.coordinates;
    // Calculate centroid from first polygon ring
    let ring;
    if (f.geometry.type === "MultiPolygon") {
      ring = coords[0][0];
    } else {
      ring = coords[0];
    }
    let sumLat = 0,
      sumLng = 0;
    ring.forEach(([lng, lat]) => {
      sumLat += lat;
      sumLng += lng;
    });
    const centLat = sumLat / ring.length;
    const centLng = sumLng / ring.length;

    // Build polygon in [lat,lng] format for DB
    const polygon = ring.map(([lng, lat]) => [lat, lng]);

    return {
      kelurahan: (props.KELURAHAN || "").toUpperCase(),
      luas: parseFloat(props.LUAS) || 0,
      hak: props["TIPE HAK"] || "",
      nib: props.NIB || "",
      lat: centLat,
      lng: centLng,
      polygon,
      used: false,
    };
  });

  // Build lookup by kelurahan
  const geoByKel = {};
  for (const f of geoFeatures) {
    if (!geoByKel[f.kelurahan]) geoByKel[f.kelurahan] = [];
    geoByKel[f.kelurahan].push(f);
  }
  console.log("Geo kelurahan:", Object.keys(geoByKel).join(", "));

  // Get all BPKA records from DB
  const [dbRows] = await sequelize.query(`
    SELECT id_aset, desa_kelurahan, luas, jenis_hak, koordinat_lat 
    FROM aset WHERE kode_aset LIKE 'BPKA-%'
    ORDER BY desa_kelurahan, luas
  `);
  console.log(`\nDB BPKA records: ${dbRows.length}`);

  let matched = 0,
    unmatched = 0;
  const updates = [];

  for (const row of dbRows) {
    const kel = (row.desa_kelurahan || "").toUpperCase();
    const luas = parseFloat(row.luas) || 0;

    if (!geoByKel[kel]) {
      unmatched++;
      continue;
    }

    let best = null,
      bestDiff = Infinity;
    for (const f of geoByKel[kel]) {
      if (f.used) continue;
      if (f.luas === 0 || luas === 0) continue;
      const diff = Math.abs(f.luas - luas) / Math.max(f.luas, luas);
      if (diff < 0.2 && diff < bestDiff) {
        bestDiff = diff;
        best = f;
      }
    }

    if (best) {
      best.used = true;
      matched++;
      updates.push({
        id: row.id_aset,
        lat: best.lat,
        lng: best.lng,
        polygon: best.polygon,
        nib: best.nib,
      });
    } else {
      unmatched++;
    }
  }

  console.log(`\n✅ Matched: ${matched}`);
  console.log(`❌ No match: ${unmatched}`);

  // Apply updates in batch
  console.log(`\n📥 Updating ${updates.length} records with coordinates...`);
  let updated = 0;
  for (const u of updates) {
    await sequelize.query(
      `UPDATE aset SET koordinat_lat = :lat, koordinat_long = :lng, polygon_bidang = :polygon, nib = :nib WHERE id_aset = :id`,
      {
        replacements: {
          lat: u.lat,
          lng: u.lng,
          polygon: JSON.stringify(u.polygon),
          nib: u.nib,
          id: u.id,
        },
      },
    );
    updated++;
    if (updated % 50 === 0)
      process.stdout.write(`   ${updated}/${updates.length}\r`);
  }

  console.log(`\n✅ Updated ${updated} records with coordinates`);

  // Final check
  const [withGeo] = await sequelize.query(
    `SELECT COUNT(*) as c FROM aset WHERE kode_aset LIKE 'BPKA-%' AND koordinat_lat IS NOT NULL`,
  );
  console.log(`\n📊 BPKA with coordinates: ${withGeo[0].c}`);

  // Orphaned geo features
  let orphaned = 0;
  Object.values(geoByKel).forEach((arr) =>
    arr.forEach((f) => {
      if (!f.used) orphaned++;
    }),
  );
  console.log(`🏚️  GeoJSON features not matched: ${orphaned}`);

  // Unmatched by kelurahan
  const unmatchByKel = {};
  for (const row of dbRows) {
    const kel = (row.desa_kelurahan || "").toUpperCase();
    if (!geoByKel[kel]) {
      unmatchByKel[kel] = (unmatchByKel[kel] || 0) + 1;
    }
  }
  // Also count those where luas didn't match
  console.log(
    `\n📋 Records without coordinates by kelurahan (no geo data for these areas):`,
  );
  const noGeoKels = Object.keys(unmatchByKel).sort();
  noGeoKels.forEach((k) => console.log(`   ${k}: ${unmatchByKel[k]}`));

  await sequelize.close();
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
