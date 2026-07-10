import { runSitemapMaintenance } from "@/lib/sitemap/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ ok: false, error: "Cron secret is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized cron request" }, { status: 401 });
  }
  const result = await runSitemapMaintenance({ trigger: "cron", submit: true });
  return Response.json(result, { status: result.ok ? 200 : result.skipped ? 409 : 500 });
}
