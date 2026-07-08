import { NextResponse } from "next/server";
import { getNewsAutomationReadiness, runNewsAutomation } from "@/lib/news-automation";

export const runtime = "nodejs";

function isAdminAutomationRequest(request: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization === `Bearer ${secret}`) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

export function GET(request: Request) {
  if (!isAdminAutomationRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, readiness: getNewsAutomationReadiness() });
}

export async function POST(request: Request) {
  if (!isAdminAutomationRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runNewsAutomation();
  return NextResponse.json({ ok: result.status !== "failed", ...result });
}
