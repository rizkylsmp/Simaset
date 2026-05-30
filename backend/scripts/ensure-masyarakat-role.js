import sequelize from "../src/config/database.js";

async function main() {
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
        ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'masyarakat';
      END IF;

      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Users_role') THEN
        ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'masyarakat';
      END IF;
    END $$;
  `);

  const [rows] = await sequelize.query(`
    SELECT enumlabel
    FROM pg_enum
    WHERE enumtypid = 'enum_users_role'::regtype
    ORDER BY enumsortorder;
  `);

  console.log(rows.map((row) => row.enumlabel).join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
