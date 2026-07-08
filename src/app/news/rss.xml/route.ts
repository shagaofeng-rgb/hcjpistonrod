import { newsArticles } from "../../../../data/news";
import { site } from "@/lib/site";

export const revalidate = 1800;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = newsArticles
    .map((article) => {
      const url = `${site.domain}/news/${article.slug}`;
      return `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description>${escapeXml(article.excerpt)}</description>
          <category>${escapeXml(article.category)}</category>
          <pubDate>${new Date(article.source.publishedAt).toUTCString()}</pubDate>
          <source url="${escapeXml(article.source.url)}">${escapeXml(article.source.publisher)}</source>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(site.brandName)} News and Insights</title>
        <link>${site.domain}/news</link>
        <description>Hydraulic piston rod, chrome plated rod, honed tube, and export manufacturing insights from XIJIU.</description>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
