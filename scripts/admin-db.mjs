import { readdir, readFile } from "node:fs/promises";
import { createHash, randomBytes, scryptSync } from "node:crypto";
import { join } from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;
const command = process.argv[2];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPool() {
  return new Pool({
    connectionString: requiredEnv("DATABASE_URL"),
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${key}`;
}

function tokenHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function migrate() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(`
      create table if not exists admin_schema_migrations (
        id text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )
    `);

    const migrationDir = join(process.cwd(), "db/migrations");
    const migrationFiles = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();

    for (const file of migrationFiles) {
      const migrationId = file.replace(/\.sql$/, "");
      const filePath = join(migrationDir, file);
      const sql = await readFile(filePath, "utf8");
      const checksum = tokenHash(sql);
      const existing = await client.query("select checksum from admin_schema_migrations where id = $1", [migrationId]);

      if (existing.rows[0]) {
        if (existing.rows[0].checksum !== checksum) {
          throw new Error(`Migration ${migrationId} was changed after being applied.`);
        }
        console.log(`Migration ${migrationId} already applied.`);
      } else {
        await client.query(sql);
        await client.query("insert into admin_schema_migrations (id, checksum) values ($1, $2)", [migrationId, checksum]);
        console.log(`Applied migration ${migrationId}.`);
      }
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function createUser() {
  const pool = getPool();
  const email = requiredEnv("ADMIN_EMAIL").toLowerCase();
  const password = requiredEnv("ADMIN_PASSWORD");
  const name = process.env.ADMIN_NAME || "超级管理员";
  const username = process.env.ADMIN_USERNAME || email.split("@")[0];

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = hashPassword(password);
  const client = await pool.connect();

  try {
    await client.query("begin");
    const userResult = await client.query(
      `
      insert into admin_users (email, username, name, password_hash, status, must_change_password)
      values ($1, $2, $3, $4, 'active', true)
      on conflict (email)
      do update set name = excluded.name, password_hash = excluded.password_hash, status = 'active', updated_at = now()
      returning id
      `,
      [email, username, name, passwordHash],
    );
    const roleResult = await client.query("select id from admin_roles where code = 'super_admin' limit 1");

    if (!roleResult.rows[0]) {
      throw new Error("Role super_admin not found. Run migration first.");
    }

    await client.query(
      "insert into admin_user_roles (user_id, role_id) values ($1, $2) on conflict do nothing",
      [userResult.rows[0].id, roleResult.rows[0].id],
    );
    await client.query("commit");
    console.log(`Admin user ready: ${email}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  if (command === "migrate") {
    await migrate();
    return;
  }

  if (command === "create-user") {
    await createUser();
    return;
  }

  console.log("Usage: node scripts/admin-db.mjs migrate|create-user");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
