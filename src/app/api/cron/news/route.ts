import { NextResponse } from "next/server";
import { runNewsAutomation } from "@/lib/news-automation";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization === `Bearer ${secret}`) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is required in production" }, { status: 503 });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized cron request" }, { status: 401 });
  }

  const result = await runNewsAutomation();
  return NextResponse.json({
    ok: result.status !== "failed",
    generatedAt: new Date().toISOString(),
    ...result,
  });
}
