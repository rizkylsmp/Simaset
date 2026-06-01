"use strict";

const path = require("path");
const dotenv = require("dotenv");

const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const baseConfig = {
  dialect: "postgres",
  use_env_variable: "DATABASE_URL",
};

if (process.env.DB_SSL === "true" || process.env.NODE_ENV === "production") {
  baseConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
