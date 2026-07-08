import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export class AdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminConfigError";
  }
}

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasObjectStorageConfig() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      (process.env.S3_ENDPOINT || process.env.S3_REGION),
  );
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new AdminConfigError("后台数据库尚未配置，请先设置 DATABASE_URL。");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX ?? 8),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export async function databaseHealth() {
  if (!hasDatabaseConfig()) {
    return {
      configured: false,
      ok: false,
      message: "未配置 DATABASE_URL，后台数据功能暂不可用。",
    };
  }

  try {
    await query("select 1 as ok");
    return {
      configured: true,
      ok: true,
      message: "数据库连接正常。",
    };
  } catch {
    return {
      configured: true,
      ok: false,
      message: "数据库连接失败，请检查 DATABASE_URL、网络和 SSL 设置。",
    };
  }
}
