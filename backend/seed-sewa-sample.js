import dotenv from "dotenv";
dotenv.config();

import sequelize from "./src/config/database.js";
import SewaAset from "./src/models/SewaAset.js";

const sampleData = [
  {
    nama_aset: "Tanah Kavling Blok A - Tigaraksa",
    lokasi_aset: "Jl. Raya Tigaraksa No. 12, Kec. Tigaraksa, Kab. Tangerang",
    no_lot: "LOT-001",
    catatan:
      "Lahan strategis dekat pusat pemerintahan Kab. Tangerang. Cocok untuk perkantoran atau komersial.",
    foto_sewa: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    ],
    polygon_sewa: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.4295, -6.3465],
            [106.4305, -6.3465],
            [106.4305, -6.3475],
            [106.4295, -6.3475],
            [106.4295, -6.3465],
          ],
        ],
      },
      properties: { luas: 2500 },
    },
    status: "Tersedia",
  },
  {
    nama_aset: "Lahan Ex-Pasar Balaraja",
    lokasi_aset: "Jl. Raya Serang KM 24, Kec. Balaraja, Kab. Tangerang",
    no_lot: "LOT-002",
    catatan:
      "Lahan bekas pasar yang telah direlokasi. Akses jalan utama lebar, dekat exit tol.",
    foto_sewa: [
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
    ],
    polygon_sewa: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.4412, -6.3338],
            [106.4428, -6.3338],
            [106.4428, -6.3352],
            [106.4412, -6.3352],
            [106.4412, -6.3338],
          ],
        ],
      },
      properties: { luas: 4800 },
    },
    status: "Tersedia",
  },
  {
    nama_aset: "Tanah Pemda Cikupa Industrial",
    lokasi_aset: "Jl. Cikupa Mas Raya, Kec. Cikupa, Kab. Tangerang",
    no_lot: "LOT-003",
    catatan:
      "Kawasan industri ringan. Infrastruktur jalan dan drainase sudah tersedia.",
    foto_sewa: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    ],
    polygon_sewa: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.505, -6.2645],
            [106.5068, -6.2645],
            [106.5068, -6.266],
            [106.505, -6.266],
            [106.505, -6.2645],
          ],
        ],
      },
      properties: { luas: 6200 },
    },
    status: "Tersedia",
  },
  {
    nama_aset: "Lahan Terbuka Kronjo",
    lokasi_aset: "Jl. Raya Kronjo, Kec. Kronjo, Kab. Tangerang",
    no_lot: "LOT-004",
    catatan:
      "Lahan terbuka zona pertanian/agro. Dekat dengan kawasan pesisir Tangerang.",
    foto_sewa: [
      "https://images.unsplash.com/photo-1586621700547-c50bc3e7fe19?w=800",
    ],
    polygon_sewa: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.4755, -6.142],
            [106.4775, -6.142],
            [106.4775, -6.1438],
            [106.4755, -6.1438],
            [106.4755, -6.142],
          ],
        ],
      },
      properties: { luas: 3500 },
    },
    status: "Tersedia",
  },
  {
    nama_aset: "Kavling Strategis Cisoka",
    lokasi_aset: "Jl. Cisoka - Solear, Kec. Cisoka, Kab. Tangerang",
    no_lot: "LOT-005",
    catatan:
      "Lokasi pengembangan baru dekat rencana jalan tol Serpong-Balaraja. Potensi tinggi.",
    foto_sewa: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    ],
    polygon_sewa: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.4118, -6.3125],
            [106.4135, -6.3125],
            [106.4135, -6.314],
            [106.4118, -6.314],
            [106.4118, -6.3125],
          ],
        ],
      },
      properties: { luas: 3100 },
    },
    status: "Tersedia",
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    for (const item of sampleData) {
      await SewaAset.create(item);
      console.log(`  ✔ Created: ${item.nama_aset}`);
    }

    console.log("\n✅ 5 sample sewa aset (Tersedia) with polygon seeded!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
}

seed();
