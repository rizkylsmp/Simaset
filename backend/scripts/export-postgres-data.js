import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const outputDir = path.join(backendRoot, "backups");

const databaseUrl = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
const outputPrefix =
  process.env.BACKUP_PREFIX ||
  `postgres-backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const appOnly = String(process.env.APP_ONLY || "false").toLowerCase() === "true";
const appTables = new Set(
  (process.env.APP_TABLES ||
    "SequelizeMeta,aset,ekasmat_responses,notifikasi,permintaan_sewa,pusat_data,riwayat,sewa_aset,users")
    .split(",")
    .map((table) => table.trim())
    .filter(Boolean),
);

if (!databaseUrl) {
  console.error("SOURCE_DATABASE_URL atau DATABASE_URL wajib diisi.");
  process.exit(1);
}

function quoteIdent(identifier) {
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function escapeSqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (Buffer.isBuffer(value)) return `decode('${value.toString("hex")}', 'hex')`;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function toInsertSql(table, columns, rows) {
  if (!rows.length) return "";
  const tableName = `${quoteIdent(table.table_schema)}.${quoteIdent(table.table_name)}`;
  const columnNames = columns.map((column) => quoteIdent(column.column_name)).join(", ");
  const values = rows
    .map((row) => {
      const rowValues = columns
        .map((column) => escapeSqlValue(row[column.column_name]))
        .join(", ");
      return `(${rowValues})`;
    })
    .join(",\n");
  return `INSERT INTO ${tableName} (${columnNames}) VALUES\n${values};`;
}

const client = new Client({
  connectionString: databaseUrl,
  ssl:
    String(process.env.SOURCE_DB_SSL || "true").toLowerCase() === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

await client.connect();

try {
  fs.mkdirSync(outputDir, { recursive: true });

  const tablesResult = await client.query(
    `
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND ($1::boolean = false OR (table_schema = 'public' AND table_name = ANY($2::text[])))
      ORDER BY table_schema, table_name
    `,
    [appOnly, [...appTables]],
  );

  const backup = {
    created_at: new Date().toISOString(),
    source: "postgres",
    tables: [],
  };

  const sqlParts = [
    "-- SIMASET PostgreSQL data backup",
    `-- Created at: ${backup.created_at}`,
    "-- Restore after the target schema/migrations are ready.",
    "SET session_replication_role = replica;",
    "",
  ];

  for (const table of tablesResult.rows) {
    const columnsResult = await client.query(
      `
        SELECT column_name, data_type, udt_name, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
        ORDER BY ordinal_position
      `,
      [table.table_schema, table.table_name],
    );

    const tableName = `${quoteIdent(table.table_schema)}.${quoteIdent(table.table_name)}`;
    const rowsResult = await client.query(`SELECT * FROM ${tableName}`);
    const rows = rowsResult.rows;
    const columns = columnsResult.rows;

    backup.tables.push({
      schema: table.table_schema,
      name: table.table_name,
      row_count: rows.length,
      columns,
      rows,
    });

    sqlParts.push(`-- ${table.table_schema}.${table.table_name} (${rows.length} rows)`);
    sqlParts.push(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
    const insertSql = toInsertSql(table, columns, rows);
    if (insertSql) sqlParts.push(insertSql);
    sqlParts.push("");

    console.log(`${table.table_schema}.${table.table_name}: ${rows.length} rows`);
  }

  sqlParts.push("SET session_replication_role = DEFAULT;");
  sqlParts.push("");

  const jsonPath = path.join(outputDir, `${outputPrefix}.json`);
  const sqlPath = path.join(outputDir, `${outputPrefix}.sql`);

  fs.writeFileSync(jsonPath, JSON.stringify(backup, null, 2), "utf8");
  fs.writeFileSync(sqlPath, sqlParts.join("\n"), "utf8");

  console.log(`JSON backup: ${jsonPath}`);
  console.log(`SQL backup: ${sqlPath}`);
} finally {
  await client.end();
}
