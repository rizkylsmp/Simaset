import dotenv from "dotenv";
dotenv.config();

import sequelize from "./src/config/database.js";

async function migrate() {
  try {
    // 1. Add "Tersedia" to status ENUM
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'Tersedia'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_sewa_aset_status')
        ) THEN
          ALTER TYPE "enum_sewa_aset_status" ADD VALUE 'Tersedia' BEFORE 'Aktif';
        END IF;
      END
      $$;
    `);
    console.log("✅ Added 'Tersedia' to status ENUM");

    // 2. Add polygon_sewa column
    const [cols] = await sequelize.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'sewa_aset' AND column_name = 'polygon_sewa'
    `);
    if (cols.length === 0) {
      await sequelize.query(
        `ALTER TABLE sewa_aset ADD COLUMN polygon_sewa JSON`,
      );
      console.log("✅ Added polygon_sewa column");
    } else {
      console.log("⏭️ polygon_sewa column already exists");
    }

    // 3. Make nama_penyewa nullable
    await sequelize.query(
      `ALTER TABLE sewa_aset ALTER COLUMN nama_penyewa DROP NOT NULL`,
    );
    console.log("✅ Made nama_penyewa nullable");

    // 4. Make tanggal_mulai nullable
    await sequelize.query(
      `ALTER TABLE sewa_aset ALTER COLUMN tanggal_mulai DROP NOT NULL`,
    );
    console.log("✅ Made tanggal_mulai nullable");

    // 5. Make tanggal_berakhir nullable
    await sequelize.query(
      `ALTER TABLE sewa_aset ALTER COLUMN tanggal_berakhir DROP NOT NULL`,
    );
    console.log("✅ Made tanggal_berakhir nullable");

    // 6. Make nilai_sewa nullable
    await sequelize.query(
      `ALTER TABLE sewa_aset ALTER COLUMN nilai_sewa DROP NOT NULL`,
    );
    console.log("✅ Made nilai_sewa nullable");

    console.log("\n🎉 Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
