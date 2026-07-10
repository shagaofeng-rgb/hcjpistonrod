import { site } from "@/lib/site";
import { getPublishedNewsArticles } from "@/lib/news-content";

export const revalidate = 1800;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const newsArticles = await getPublishedNewsArticles();
  const recentCutoff = Date.now() - 48 * 60 * 60 * 1000;
  const urls = newsArticles
    .filter((article) => new Date(article.source.publishedAt).getTime() >= recentCutoff)
    .map((article) => {
      const url = `${site.domain}/news/${article.slug}`;
      return `
        <url>
          <loc>${escapeXml(url)}</loc>
          <lastmod>${article.updatedAt}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.75</priority>
          <news:news>
            <news:publication>
              <news:name>${escapeXml(site.brandName)}</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:publication_date>${escapeXml(article.source.publishedAt)}</news:publication_date>
            <news:title>${escapeXml(article.title)}</news:title>
          </news:news>
        </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      ${urls}
    </urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
