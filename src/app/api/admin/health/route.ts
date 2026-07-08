import { adminOk } from "@/lib/admin/api";
import { databaseHealth, hasObjectStorageConfig } from "@/lib/admin/db";

export const runtime = "nodejs";

export async function GET() {
  const db = await databaseHealth();

  return adminOk({
    database: db,
    objectStorage: {
      configured: hasObjectStorageConfig(),
      message: hasObjectStorageConfig() ? "对象存储已配置。" : "对象存储尚未配置。",
    },
    externalSources: {
      seo: Boolean(process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY),
      analytics: Boolean(process.env.ANALYTICS_PROVIDER && process.env.ANALYTICS_API_KEY),
    },
  });
}
