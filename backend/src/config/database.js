import { Sequelize } from "sequelize";
import pg from "pg";
import dotenv from "dotenv";

// Load .env file only when not in Vercel (Vercel injects env vars directly)
if (!process.env.VERCEL) {
  const envFile =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env";
  dotenv.config({ path: envFile });
}

// Database configuration
const isServerless = !!process.env.VERCEL;
const dbConfig = {
  dialect: "postgres",
  dialectModule: pg,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
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

// Add SSL for production (cloud databases)
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
  // Use DATABASE_URL if available
  sequelize = new Sequelize(process.env.DATABASE_URL, dbConfig);
} else {
  // Use individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      ...dbConfig,
    },
  );
}

// Only authenticate eagerly in local dev; on Vercel it happens on first query
if (!process.env.VERCEL) {
  sequelize
    .authenticate()
    .then(() => console.log("✅ Database connected"))
    .catch((err) =>
      console.error("❌ Database connection failed:", err.message),
    );
}

export default sequelize;
