import { NextResponse } from "next/server";
import { adminApiError, adminError } from "@/lib/admin/api";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { getNewsAutomationReadiness, runNewsAutomation } from "@/lib/news-automation";

export const runtime = "nodejs";

async function requireNewsManager() {
  const user = await getCurrentAdminUser();

  if (!user) {
    return adminError("请先登录后台。", 401, "ADMIN_UNAUTHORIZED");
  }

  if (!hasPermission(user, "news.manage")) {
    return adminError("当前账号无权管理新闻自动化。", 403, "ADMIN_FORBIDDEN");
  }

  return null;
}

export async function GET() {
  try {
    const denied = await requireNewsManager();
    if (denied) return denied;

    return NextResponse.json({ ok: true, readiness: getNewsAutomationReadiness() });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function POST() {
  try {
    const denied = await requireNewsManager();
    if (denied) return denied;

    const result = await runNewsAutomation();
    return NextResponse.json({ ok: result.status !== "failed", ...result });
  } catch (error) {
    return adminApiError(error);
  }
}
