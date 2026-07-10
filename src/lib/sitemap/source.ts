import { productCategories } from "../../../data/categories";
import { newsArticles } from "../../../data/news";
import { products } from "../../../data/products";
import { hasDatabaseConfig, query } from "@/lib/admin/db";
import { site } from "@/lib/site";
import { normalizeCanonicalUrl, normalizeLastmod, shouldIncludeCmsPage, type SitemapEntry } from "./core";

const STATIC_PAGE_LASTMOD = "2026-07-08T13:13:04.000Z";
const STATIC_PRODUCT_LASTMOD = "2026-07-06T06:04:59.000Z";
const STATIC_CATEGORY_LASTMOD = "2026-07-03T11:19:38.000Z";

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
  "/image-credits",
];

const primaryCategorySlugs = new Set(["chrome-plated-rod", "honed-tube"]);
const primaryProductCategories = new Set(["chrome-plated-rod", "honed-tube"]);

function absolute(pathname: string) {
  return new URL(pathname || "/", site.domain).toString();
}

function staticEntries(): SitemapEntry[] {
  const categorySlugs = new Set(productCategories.map((category) => category.slug));
  return [
    ...indexablePages.map((path) => ({ loc: absolute(path), lastmod: STATIC_PAGE_LASTMOD, kind: "pages" as const })),
    ...productCategories
      .filter((category) => primaryCategorySlugs.has(category.slug))
      .map((category) => ({ loc: absolute(`/products/${category.slug}`), lastmod: STATIC_CATEGORY_LASTMOD, kind: "categories" as const })),
    ...products
      .filter((product) => !categorySlugs.has(product.slug) && primaryProductCategories.has(product.category))
      .map((product) => ({ loc: absolute(`/products/${product.slug}`), lastmod: STATIC_PRODUCT_LASTMOD, kind: "products" as const })),
    ...newsArticles.flatMap((article) => [
      { loc: absolute(`/news/${article.slug}`), lastmod: normalizeLastmod(article.updatedAt), kind: "posts" as const },
      { loc: absolute(`/blog/${article.slug}`), lastmod: normalizeLastmod(article.updatedAt), kind: "posts" as const },
    ]),
  ];
}

type ProductRow = { slug: string; status: string; robots: string; canonical_url: string | null; sitemap_enabled: boolean; published_at: Date | null; updated_at: Date };
type CategoryRow = { slug: string; canonical_url: string | null; is_enabled: boolean; updated_at: Date };
type ArticleRow = { slug: string; status: string; robots: string; canonical_url: string | null; published_at: Date | null; updated_at: Date };

async function databaseEntries() {
  const [productResult, categoryResult, articleResult] = await Promise.all([
    query<ProductRow>(`select slug, status, robots, canonical_url, sitemap_enabled, published_at, updated_at from products_cms where deleted_at is null and status = 'published'`),
    query<CategoryRow>(`select slug, canonical_url, is_enabled, updated_at from product_categories_cms where deleted_at is null and is_enabled = true`),
    query<ArticleRow>(`select slug, status, robots, canonical_url, published_at, updated_at from news_articles where deleted_at is null and status = 'published' and published_at is not null and published_at <= now()`),
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
    const expectedUrl = absolute(`/news/${encodeURIComponent(row.slug)}`);
    if (shouldIncludeCmsPage({ status: row.status, robots: row.robots, canonicalUrl: row.canonical_url, expectedUrl, sitemapEnabled: true })) {
      entries.push({ loc: expectedUrl, lastmod: normalizeLastmod(row.updated_at || row.published_at || STATIC_PAGE_LASTMOD), kind: "posts" });
    }
  }
  return entries;
}

export async function getPublicSitemapEntries() {
  const fallback = staticEntries();
  if (!hasDatabaseConfig()) return { entries: fallback, source: "static" as const, warnings: [] as string[] };
  try {
    const entries = await databaseEntries();
    return { entries: [...fallback, ...entries], source: "database+static" as const, warnings: [] as string[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database sitemap error";
    return { entries: fallback, source: "static-fallback" as const, warnings: [message] };
  }
}
