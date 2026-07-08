import { newsArticles } from "../../../data/news";
import { site } from "@/lib/site";

export const revalidate = 1800;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function GET() {
  const urls = newsArticles
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
            <news:publication_date>${article.date}</news:publication_date>
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
