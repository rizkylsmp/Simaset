import dotenv from "dotenv";
dotenv.config();

import sequelize from "./src/config/database.js";

async function migrate() {
  try {
    // Rename ENUM value "Aktif" to "Disewakan" in sewa_aset status
    await sequelize.query(`
      ALTER TYPE "enum_sewa_aset_status" RENAME VALUE 'Aktif' TO 'Disewakan';
    `);
    console.log('✅ Renamed status "Aktif" to "Disewakan"');

    // Update existing records
    await sequelize.query(`
      UPDATE sewa_aset SET status = 'Disewakan' WHERE status = 'Disewakan';
    `);
    console.log("✅ Updated existing records");

    console.log("\n🎉 Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
