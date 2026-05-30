import sequelize from "../src/config/database.js";

async function main() {
  await sequelize.query(`
    ALTER TABLE "permintaan_sewa"
      ADD COLUMN IF NOT EXISTS "pemohon_user_id" INTEGER REFERENCES "users" ("id_user"),
      ADD COLUMN IF NOT EXISTS "pemohon_username" VARCHAR(50);
  `);

  const [rows] = await sequelize.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'permintaan_sewa'
      AND column_name IN ('pemohon_user_id', 'pemohon_username')
    ORDER BY column_name;
  `);

  console.log(rows.map((row) => row.column_name).join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
