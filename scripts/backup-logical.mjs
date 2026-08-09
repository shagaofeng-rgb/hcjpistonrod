import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

try {
  const tables = await pool.query(
    "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name",
  );
  const snapshot = {
    generatedAt: new Date().toISOString(),
    format: "hcj-logical-json-v2",
    schema: {
      columns: (await pool.query("select table_name, column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position")).rows,
      indexes: (await pool.query("select tablename, indexname, indexdef from pg_indexes where schemaname = 'public' order by tablename, indexname")).rows,
    },
    tables: {},
  };

  for (const { table_name: tableName } of tables.rows) {
    if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) throw new Error(`Unexpected table name: ${tableName}`);
    snapshot.tables[tableName] = (await pool.query(`select * from "${tableName}"`)).rows;
  }

  const backupDirectory = join(process.cwd(), "backups");
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "").replace("Z", "Z");
  const file = join(backupDirectory, `hcj-admin-logical-${timestamp}.json`);
  await mkdir(backupDirectory, { recursive: true });
  await writeFile(file, JSON.stringify(snapshot), "utf8");
  console.log(`Logical backup written to ${file}`);
} finally {
  await pool.end();
}
