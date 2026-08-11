import { hasDatabaseConfig, query } from "@/lib/admin/db";
import { site } from "@/lib/site";
import { isIndexableNewsSlug } from "@/lib/news-rules";
import { normalizeCanonicalUrl, normalizeLastmod, shouldIncludeCmsPage, type SitemapEntry } from "./core";

const STATIC_PAGE_LASTMOD = "2026-07-08T13:13:04.000Z";
const STATIC_PRODUCT_LASTMOD = "2026-07-06T06:04:59.000Z";

const indexablePages = [
  "",
  "/products",
  "/why-xijiu",
  "/about",
  "/industries",
  "/news",
  "/blog",
  "/contact",
  "/privacy-policy",
];

function absolute(pathname: string) {
  return new URL(pathname || "/", site.domain).toString();
}

function sitePageEntries(): SitemapEntry[] {
  return indexablePages.map((path) => ({ loc: absolute(path), lastmod: STATIC_PAGE_LASTMOD, kind: "pages" as const }));
}

type ProductRow = { slug: string; status: string; robots: string; canonical_url: string | null; sitemap_enabled: boolean; published_at: Date | null; updated_at: Date };
type CategoryRow = { slug: string; canonical_url: string | null; is_enabled: boolean; updated_at: Date };
type ArticleRow = { slug: string; content_channel: "news" | "blog"; status: string; robots: string; canonical_url: string | null; published_at: Date | null; updated_at: Date };

async function databaseEntries() {
  const [productResult, categoryResult, articleResult] = await Promise.all([
    query<ProductRow>(`select slug, status, robots, canonical_url, sitemap_enabled, published_at, updated_at from products_cms where deleted_at is null and status = 'published'`),
    query<CategoryRow>(`select slug, canonical_url, is_enabled, updated_at from product_categories_cms where deleted_at is null and is_enabled = true`),
    query<ArticleRow>(`select slug, content_channel, status, robots, canonical_url, published_at, updated_at from news_articles where deleted_at is null and status = 'published' and published_at is not null and published_at <= now()`),
  ]);

  const entries: SitemapEntry[] = [];
  for (const row of productResult.rows) {
    const expectedUrl = absolute(`/products/${encodeURIComponent(row.slug)}`);
    if (shouldIncludeCmsPage({ status: row.status, robots: row.robots, canonicalUrl: row.canonical_url, expectedUrl, sitemapEnabled: row.sitemap_enabled })) {
      entries.push({ loc: expectedUrl, lastmod: normalizeLastmod(row.updated_at || row.published_at || STATIC_PRODUCT_LASTMOD), kind: "products" });
    }
  }
  for (const row of categoryResult.rows) {
    const expectedUrl = absolute(`/products/${encodeURIComponent(row.slug)}`);
    const canonical = row.canonical_url ? normalizeCanonicalUrl(row.canonical_url, site.domain) : expectedUrl;
    if (row.is_enabled && canonical === expectedUrl) entries.push({ loc: expectedUrl, lastmod: normalizeLastmod(row.updated_at), kind: "categories" });
  }
  for (const row of articleResult.rows) {
    if (row.content_channel === "news" && !isIndexableNewsSlug(row.slug)) continue;
    const expectedUrl = absolute(`/${row.content_channel}/${encodeURIComponent(row.slug)}`);
    if (shouldIncludeCmsPage({ status: row.status, robots: row.robots, canonicalUrl: row.canonical_url, expectedUrl, sitemapEnabled: true })) {
      entries.push({ loc: expectedUrl, lastmod: normalizeLastmod(row.updated_at || row.published_at || STATIC_PAGE_LASTMOD), kind: "posts" });
    }
  }
  return entries;
}

export async function getPublicSitemapEntries() {
  if (!hasDatabaseConfig()) {
    return {
      entries: sitePageEntries(),
      source: "site-pages-only" as const,
      warnings: ["CMS database is not configured; dynamic URLs were intentionally omitted."],
    };
  }
  try {
    const entries = await databaseEntries();
    return { entries: [...sitePageEntries(), ...entries], source: "database+site-pages" as const, warnings: [] as string[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database sitemap error";
    return {
      entries: sitePageEntries(),
      source: "site-pages-only" as const,
      warnings: [`CMS sitemap read failed; dynamic URLs were intentionally omitted. ${message}`],
    };
  }
}
