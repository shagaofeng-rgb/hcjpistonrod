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
  return getObjectStorageProvider() !== null;
}

export function getObjectStorageProvider() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob" as const;
  if (
      process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      (process.env.S3_ENDPOINT || process.env.S3_REGION)
  ) {
    return "s3" as const;
  }
  return null;
}

export function getObjectStorageMessage() {
  const provider = getObjectStorageProvider();
  if (provider === "vercel-blob") return "Vercel Blob 私有文件库已连接。";
  if (provider === "s3") return "S3 兼容对象存储已连接。";
  return "未连接对象存储。";
}

export function hasVercelAnalyticsConfig() {
  return process.env.VERCEL_ANALYTICS_ENABLED === "true";
}

export function hasGoogleSearchConsoleConfig() {
  const hasCredentials = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      || process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH
      || (process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY),
  );
  return process.env.GOOGLE_SEARCH_CONSOLE_ENABLED === "true" && hasCredentials;
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new AdminConfigError("后台数据库未连接。");
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

export async function closeDatabasePool() {
  if (!pool) return;
  const current = pool;
  pool = null;
  await current.end();
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}

export async function databaseHealth() {
  if (!hasDatabaseConfig()) {
    return {
      configured: false,
      ok: false,
      message: "后台数据库未连接。",
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
      message: "数据库连接失败。",
    };
  }
}
