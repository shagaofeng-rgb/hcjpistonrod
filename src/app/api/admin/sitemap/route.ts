import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { adminError, adminOk } from "@/lib/admin/api";
import { runSitemapMaintenance } from "@/lib/sitemap/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) return adminError("请先登录后台。", 401, "ADMIN_UNAUTHORIZED");
  if (!hasPermission(user, "seo.manage")) return adminError("当前账号无权执行 Sitemap 维护。", 403, "ADMIN_FORBIDDEN");
  const body = await request.json().catch(() => ({})) as { force?: boolean; dryRun?: boolean; submit?: boolean; verbose?: boolean };
  const result = await runSitemapMaintenance({ trigger: "manual", ...body });
  return adminOk(result);
}
