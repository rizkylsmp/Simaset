import { Sequelize } from "sequelize";
import pg from "pg";
import dotenv from "dotenv";

// Load .env file
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
dotenv.config({ path: envFile });

// Database configuration
const isServerless = !!process.env.VERCEL;
const dbConfig = {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  pool: isServerless
    ? {
        max: 1,
        min: 0,
        acquire: 15000,
        idle: 0,
        evict: 1000,
      }
    : {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
};

// Add SSL for production
if (process.env.NODE_ENV === "production" || process.env.DB_SSL === "true") {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

// Create Sequelize instance
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, dbConfig);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || "simaset",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      ...dbConfig,
    },
  );
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const [results] = await sequelize.query(
      "SELECT COUNT(*) as total_assets, COUNT(kw) as assets_with_kw FROM aset",
    );
    console.log("Total assets:", results[0].total_assets);
    console.log("Assets with KW:", results[0].assets_with_kw);

    const [samples] = await sequelize.query(
      "SELECT id_aset, nib, kw FROM aset WHERE kw IS NOT NULL LIMIT 5",
    );
    console.log("Sample assets with KW:");
    samples.forEach((asset) =>
      console.log(`ID: ${asset.id_aset}, NIB: ${asset.nib}, KW: ${asset.kw}`),
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await sequelize.close();
  }
})();
