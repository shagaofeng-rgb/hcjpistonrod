import type { NewsArticle } from "../../data/news";
import { unstable_cache } from "next/cache";
import { hasDatabaseConfig, query } from "@/lib/admin/db";
import { site } from "@/lib/site";
import { sanitizeArticleHtml } from "@/lib/content-html";
import { historicalNoindexNewsSlugs, newsToBlogRedirects } from "@/lib/news-rules";

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  author: string | null;
  image_url: string;
  image_alt: string | null;
  category: string | null;
  tags: string[] | null;
  related_products: string[] | null;
  published_at: Date;
  updated_at: Date;
  source_title: string | null;
  source_publisher: string | null;
  source_author: string | null;
  source_url: string | null;
  source_published_at: Date | null;
  source_fetched_at: Date | null;
  source_language: string | null;
  geo_summary: string | null;
  key_takeaways: string[] | null;
  content_channel: "news" | "blog";
};

function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

function toArticle(row: NewsRow): NewsArticle {
  const publishedAt = toIso(row.published_at);
  const sourcePublishedAt = row.source_published_at ? toIso(row.source_published_at) : publishedAt;
  const sourceUrl = row.source_url || `${site.domain}/news/${row.slug}`;
  const sourceType = new URL(sourceUrl, site.domain).hostname === new URL(site.domain).hostname ? "original" : "external";
  return {
    slug: row.slug,
    title: row.title,
    date: publishedAt.slice(0, 10),
    updatedAt: toIso(row.updated_at).slice(0, 10),
    category: row.category || "Industry News",
    author: row.author || "XIJIU Editorial Team",
    excerpt: row.excerpt,
    geoSummary: row.geo_summary || row.excerpt,
    keyTakeaways: Array.isArray(row.key_takeaways) ? row.key_takeaways : [],
    image: row.image_url.startsWith("https://") ? `/api/media/news-image/${row.id}` : row.image_url,
    imageAlt: row.image_alt || row.title,
    source: {
      title: row.source_title || row.title,
      publisher: row.source_publisher || site.brandName,
      author: row.source_author || row.author || "Editorial Team",
      url: sourceUrl,
      publishedAt: sourcePublishedAt,
      fetchedAt: row.source_fetched_at ? toIso(row.source_fetched_at) : publishedAt,
      language: row.source_language || "en",
      type: sourceType,
    },
    relatedProducts: Array.isArray(row.related_products) ? row.related_products : [],
    sections: [],
    faqs: [],
    bodyHtml: sanitizeArticleHtml(row.body_html),
  };
}

async function getDatabaseNews(slug?: string, includeNoindex = false) {
  const values: unknown[] = [];
  const slugSql = slug ? "and na.slug = $1" : "";
  const indexSql = includeNoindex ? "" : "and na.robots not ilike '%noindex%'";
  if (slug) values.push(slug);
  const result = await query<NewsRow>(
    `select na.id, na.slug, coalesce(na.english_title, na.title) as title, na.excerpt, na.body_html, na.author,
      coalesce(na.cover_image_url, ma.url) as image_url, na.image_alt,
      coalesce(nc.english_name, nc.name, 'Industry News') as category, na.tags, na.related_products,
      na.published_at, na.updated_at, na.source_title, na.source_publisher, na.source_author, na.source_url,
      na.source_published_at, na.source_fetched_at, na.source_language, na.geo_summary, na.key_takeaways, na.content_channel
     from news_articles na
     left join news_categories nc on nc.id = na.category_id
     left join media_assets ma on ma.id = na.cover_image_id
     where na.deleted_at is null and na.content_channel = 'news' and na.status = 'published' and na.published_at is not null and na.published_at <= now()
       ${indexSql} and na.body_html is not null and na.excerpt is not null
       and coalesce(na.cover_image_url, ma.url) is not null ${slugSql}
     order by na.published_at desc`,
    values,
  );
  return result.rows.map(toArticle);
}

async function getDatabaseBlog(slug?: string) {
  const values: unknown[] = [];
  const slugSql = slug ? "and na.slug = $1" : "";
  if (slug) values.push(slug);
  const result = await query<NewsRow>(
    `select na.id, na.slug, coalesce(na.english_title, na.title) as title, na.excerpt, na.body_html, na.author,
      coalesce(na.cover_image_url, ma.url) as image_url, na.image_alt,
      coalesce(nc.english_name, nc.name, 'Industry News') as category, na.tags, na.related_products,
      na.published_at, na.updated_at, na.source_title, na.source_publisher, na.source_author, na.source_url,
      na.source_published_at, na.source_fetched_at, na.source_language, na.geo_summary, na.key_takeaways, na.content_channel
     from news_articles na
     left join news_categories nc on nc.id = na.category_id
     left join media_assets ma on ma.id = na.cover_image_id
     where na.deleted_at is null and na.content_channel = 'blog' and na.status = 'published' and na.published_at is not null and na.published_at <= now()
       and na.robots not ilike '%noindex%' and na.body_html is not null and na.excerpt is not null
       and coalesce(na.cover_image_url, ma.url) is not null
       and coalesce(na.automation_notes, '') not ilike 'Automatically generated%' ${slugSql}
     order by na.published_at desc`,
    values,
  );
  return result.rows.map(toArticle);
}

const getCachedDatabaseNews = unstable_cache(
  () => getDatabaseNews(),
  ["hcj", "published-news"],
  { revalidate: 300, tags: ["hcj-published-content"] },
);

const getCachedDatabaseBlog = unstable_cache(
  () => getDatabaseBlog(),
  ["hcj", "published-blog"],
  { revalidate: 300, tags: ["hcj-published-content"] },
);

export async function getPublishedNewsArticles() {
  if (!hasDatabaseConfig()) return [];
  try {
    const databaseArticles = await getCachedDatabaseNews();
    return databaseArticles.filter((article) => !newsToBlogRedirects[article.slug] && !historicalNoindexNewsSlugs.has(article.slug));
  } catch (error) {
    console.error("[news] database read failed", { message: error instanceof Error ? error.message : "unknown error" });
    return [];
  }
}

export async function getPublishedNewsArticle(slug: string) {
  if (hasDatabaseConfig()) {
    try {
      const rows = historicalNoindexNewsSlugs.has(slug)
        ? await getDatabaseNews(slug, true)
        : await getCachedDatabaseNews();
      const article = rows.find((row) => row.slug === slug);
      if (article) return article;
    } catch (error) {
      console.error("[news] article read failed", { slug, message: error instanceof Error ? error.message : "unknown error" });
    }
  }
  return undefined;
}

export async function getPublishedBlogArticles() {
  if (!hasDatabaseConfig()) return [];
  try {
    return await getCachedDatabaseBlog();
  } catch (error) {
    console.error("[blog] database read failed", { message: error instanceof Error ? error.message : "unknown error" });
    return [];
  }
}

export async function getPublishedBlogArticle(slug: string) {
  if (hasDatabaseConfig()) {
    try {
      const rows = await getCachedDatabaseBlog();
      const article = rows.find((row) => row.slug === slug);
      if (article) return article;
    } catch (error) {
      console.error("[blog] article read failed", { slug, message: error instanceof Error ? error.message : "unknown error" });
    }
  }
  return undefined;
}
