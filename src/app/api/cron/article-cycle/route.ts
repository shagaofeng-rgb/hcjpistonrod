export const runtime = "nodejs";
export const maxDuration = 60;

// Retained as an explicit dead endpoint so an old platform schedule cannot
// silently publish Blog or product-guide content after this migration.
export async function GET() {
  return Response.json({ ok: false, error: "This legacy automatic article cycle has been retired. Use /api/cron/news-publish." }, { status: 410 });
}
