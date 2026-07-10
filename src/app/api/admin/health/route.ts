import { adminError, adminOk } from "@/lib/admin/api";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { databaseHealth, hasObjectStorageConfig } from "@/lib/admin/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentAdminUser().catch(() => null);
  if (!user) return adminError("请先登录后台。", 401, "ADMIN_UNAUTHORIZED");
  if (!hasPermission(user, "settings.manage")) return adminError("当前账号无权查看系统状态。", 403, "ADMIN_FORBIDDEN");
  const db = await databaseHealth();
  return adminOk({
    database: db,
    objectStorage: {
      configured: hasObjectStorageConfig(),
      message: hasObjectStorageConfig() ? "对象存储已连接。" : "未连接对象存储。",
    },
    externalSources: {
      seo: Boolean(process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY),
      analytics: Boolean(process.env.ANALYTICS_PROVIDER && process.env.ANALYTICS_API_KEY),
      news: Boolean(process.env.NEWS_FEED_URLS && (process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)),
    },
  });
}
