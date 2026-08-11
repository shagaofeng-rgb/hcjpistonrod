import { site } from "@/lib/site";
import { getPublishedBlogArticles } from "@/lib/news-content";

export const revalidate = 1800;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getPublishedBlogArticles();
  const items = articles.map((article) => {
    const url = `${site.domain}/blog/${article.slug}`;
    return `<item><title>${escapeXml(article.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${escapeXml(article.excerpt)}</description><pubDate>${new Date(article.date).toUTCString()}</pubDate></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(site.brandName)} Technical Blog</title><link>${site.domain}/blog</link><description>Original technical guidance and sourcing knowledge.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=1800, s-maxage=1800" } });
}
