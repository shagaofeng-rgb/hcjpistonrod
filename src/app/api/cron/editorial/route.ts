import { runScheduledBlogPublication } from "@/lib/editorial-autopublish";
import { runSitemapMaintenance } from "@/lib/sitemap/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ ok: false, error: "Cron secret is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized cron request" }, { status: 401 });
  }

  const publication = await runScheduledBlogPublication();
  if (!publication.ok) return Response.json(publication, { status: 500 });

  const sitemap = publication.published
    ? await runSitemapMaintenance({ trigger: "content-change", submit: false })
    : null;
  return Response.json({ ...publication, sitemap }, { status: 200 });
}
