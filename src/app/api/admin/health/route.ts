import { adminError, adminOk } from "@/lib/admin/api";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { databaseHealth, getObjectStorageMessage, hasGoogleSearchConsoleConfig, hasObjectStorageConfig, hasVercelAnalyticsConfig } from "@/lib/admin/db";
import { getNewsAutomationRuntimeStatus, getSearchConsoleRuntimeStatus } from "@/lib/admin/sync-status";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentAdminUser().catch(() => null);
  if (!user) return adminError("请先登录后台。", 401, "ADMIN_UNAUTHORIZED");
  if (!hasPermission(user, "settings.manage")) return adminError("当前账号无权查看系统状态。", 403, "ADMIN_FORBIDDEN");
  const [db, newsAutomation, searchConsole] = await Promise.all([databaseHealth(), getNewsAutomationRuntimeStatus(), getSearchConsoleRuntimeStatus()]);
  return adminOk({
    database: db,
    objectStorage: {
      configured: hasObjectStorageConfig(),
      message: getObjectStorageMessage(),
    },
    externalSources: {
      seo: hasGoogleSearchConsoleConfig() && ["connected", "waiting_for_sitemap_change"].includes(searchConsole.connection_status),
      analytics: hasVercelAnalyticsConfig() || Boolean(process.env.ANALYTICS_PROVIDER && process.env.ANALYTICS_API_KEY),
      news: newsAutomation.connection_status === "connected",
    },
    newsAutomation,
    searchConsole,
  });
}
