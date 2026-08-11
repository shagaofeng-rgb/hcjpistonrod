import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import process from "node:process";
import pg, { type PoolClient } from "pg";
import { productCategories } from "../data/categories";
import { company } from "../data/company";
import { factoryPhotos } from "../data/factory-photos";
import { imageCredits } from "../data/image-credits";
import { newsArticles } from "../data/news";
import { products } from "../data/products";

const { Pool } = pg;
const publicCategories = new Set(["chrome-plated-rod", "honed-tube"]);

function productSku(slug: string) {
  return `XIJIU-${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function syncMedia(client: PoolClient) {
  const descriptors = new Map<string, { title: string; alt: string; caption: string; category: string }>();
  for (const item of factoryPhotos) {
    descriptors.set(item.file, { title: item.title, alt: item.description, caption: item.use, category: "factory" });
  }
  for (const item of imageCredits) {
    descriptors.set(item.file, { title: item.title, alt: item.title, caption: `${item.license}; ${item.artist}; ${item.sourceUrl}`, category: "licensed-site" });
  }
  for (const item of [...products, ...productCategories]) {
    if (!descriptors.has(item.image)) {
      descriptors.set(item.image, { title: item.name, alt: item.name, caption: "Website product visual", category: "product" });
    }
  }

  const ids = new Map<string, string>();
  for (const [url, descriptor] of descriptors) {
    const filePath = join(process.cwd(), "public", url.replace(/^\//, ""));
    const [info, buffer] = await Promise.all([stat(filePath), readFile(filePath)]);
    const extension = extname(filePath).slice(1).toLowerCase();
    const result = await client.query<{ id: string }>(
      `insert into media_assets
        (storage_key, url, original_name, safe_name, mime_type, extension, size_bytes, alt_text, caption, category, checksum, updated_at)
       values ($1,$2,$3,$3,$4,$5,$6,$7,$8,$9,$10,now())
       on conflict (storage_key) do update set url=excluded.url, original_name=excluded.original_name,
         safe_name=excluded.safe_name, mime_type=excluded.mime_type, extension=excluded.extension,
         size_bytes=excluded.size_bytes, alt_text=excluded.alt_text, caption=excluded.caption,
         category=excluded.category, checksum=excluded.checksum, deleted_at=null, updated_at=now()
       returning id`,
      [url.replace(/^\//, ""), url, basename(filePath), extension === "jpg" ? "image/jpeg" : `image/${extension}`, extension,
        info.size, descriptor.alt, descriptor.caption, descriptor.category, createHash("sha256").update(buffer).digest("hex")],
    );
    ids.set(url, result.rows[0].id);
  }
  return ids;
}

async function syncCategories(client: PoolClient, mediaIds: Map<string, string>) {
  const ids = new Map<string, string>();
  for (const [index, category] of productCategories.entries()) {
    const published = publicCategories.has(category.slug);
    const result = await client.query<{ id: string }>(
      `insert into product_categories_cms
        (name, english_name, slug, level, summary, description, image_id, sort_order, is_enabled,
         show_in_navigation, seo_title, seo_description, seo_keywords, canonical_url, updated_at)
       values ($1,$1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10,$11,$12,now())
       on conflict (slug) do update set name=excluded.name, english_name=excluded.english_name,
         level=excluded.level, summary=excluded.summary, description=excluded.description,
         image_id=excluded.image_id, sort_order=excluded.sort_order, is_enabled=excluded.is_enabled,
         show_in_navigation=excluded.show_in_navigation, seo_title=excluded.seo_title,
         seo_description=excluded.seo_description, seo_keywords=excluded.seo_keywords,
         canonical_url=excluded.canonical_url, deleted_at=null, updated_at=now()
       returning id`,
      [category.name, category.slug, category.parent ? 2 : 1, category.intro, category.description,
        mediaIds.get(category.image) || null, index + 1, published, category.title, category.description,
        category.keywords.join(", "), `${company.domain}/products/${category.slug}`],
    );
    ids.set(category.slug, result.rows[0].id);
  }
  for (const category of productCategories) {
    await client.query("update product_categories_cms set parent_id=$1 where slug=$2", [category.parent ? ids.get(category.parent) || null : null, category.slug]);
  }
  return ids;
}

async function syncProducts(client: PoolClient, categoryIds: Map<string, string>, mediaIds: Map<string, string>) {
  for (const [index, product] of products.entries()) {
    const published = publicCategories.has(product.category);
    await client.query(
      `insert into products_cms
        (primary_category_id, name, english_name, sku, slug, status, short_description, full_description,
         selling_points, applications, features, specifications, attributes, tags, main_image_id, moq,
         lead_time, price_display, is_featured, sort_order, published_at, seo_title, seo_description,
         seo_keywords, canonical_url, robots, structured_data, sitemap_enabled, updated_at)
       values ($1,$2,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15,$16,
         'quote',$17,$18,$19,$2,$6,$20,$21,$22,$23::jsonb,$24,now())
       on conflict (slug) do update set primary_category_id=excluded.primary_category_id, name=excluded.name,
         english_name=excluded.english_name, status=excluded.status,
         short_description=excluded.short_description, full_description=excluded.full_description,
         selling_points=excluded.selling_points, applications=excluded.applications, features=excluded.features,
         specifications=excluded.specifications, attributes=excluded.attributes, tags=excluded.tags,
         main_image_id=excluded.main_image_id, moq=excluded.moq, lead_time=excluded.lead_time,
         is_featured=excluded.is_featured, sort_order=excluded.sort_order,
         published_at=excluded.published_at, seo_title=excluded.seo_title,
         seo_description=excluded.seo_description, seo_keywords=excluded.seo_keywords,
         canonical_url=excluded.canonical_url, robots=excluded.robots,
         structured_data=excluded.structured_data, sitemap_enabled=excluded.sitemap_enabled,
         deleted_at=null, updated_at=now()`,
      [categoryIds.get(product.category) || null, product.name, productSku(product.slug), product.slug,
        published ? "published" : "draft", product.shortDescription, product.definition,
        JSON.stringify(product.advantages), JSON.stringify(product.applications), JSON.stringify(product.process),
        JSON.stringify(product.specs), JSON.stringify({ model: product.model, image: product.image, customization: product.customization, quality: product.quality, faqs: product.faqs }),
        JSON.stringify([product.category, ...product.applications]), mediaIds.get(product.image) || null,
        product.availability, product.specs["Lead Time"] || "To be confirmed by order", published, index + 1,
        published ? new Date("2026-07-06T06:04:59.000Z") : null,
        [product.name, product.category, "XIJIU", "hydraulic components"].join(", "),
        `${company.domain}/products/${product.slug}`, published ? "index,follow" : "noindex,follow",
        JSON.stringify({ "@type": "Product", brand: "XIJIU", manufacturer: company.factoryName }), published],
    );
  }
}

function categorySlug(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" })[character] || character);
}

function repositoryBlogHtml(article: (typeof newsArticles)[number]) {
  const sections = article.sections
    .map((section) => `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`)
    .join("");
  const faqs = article.faqs.length
    ? `<section><h2>FAQ</h2>${article.faqs.map((faq) => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</section>`
    : "";
  return `${sections}${faqs}`;
}

async function syncBlogArticles(client: PoolClient) {
  const categories = new Map<string, string>();
  for (const [index, name] of [...new Set(newsArticles.map((article) => article.category))].entries()) {
    const result = await client.query<{ id: string }>(
      `insert into news_categories (name, english_name, slug, sort_order, is_enabled, updated_at)
       values ($1, $1, $2, $3, true, now())
       on conflict (slug) do update set name = excluded.name, english_name = excluded.english_name,
       sort_order = excluded.sort_order, is_enabled = true, deleted_at = null, updated_at = now()
       returning id`,
      [name, categorySlug(name), index + 1],
    );
    categories.set(name, result.rows[0].id);
  }

  for (const article of newsArticles) {
    const bodyHtml = repositoryBlogHtml(article);
    const canonicalUrl = `${company.domain}/blog/${article.slug}`;
    const contentHash = createHash("sha256").update(bodyHtml).digest("hex");
    await client.query(
      `insert into news_articles
        (category_id, title, english_title, slug, author, excerpt, body_html, image_alt, tags, related_products,
         related_articles, status, published_at, seo_title, seo_description, seo_keywords, canonical_url, robots,
         og_fields, language, updated_source_at, source_title, source_publisher, source_author, source_url,
         canonical_source_url, source_language, source_published_at, source_fetched_at, source_timezone,
         source_fingerprint, event_fingerprint, content_hash, cover_image_url, cover_image_source_url,
         cover_image_page_url, cover_image_fetched_at, geo_summary, key_takeaways, primary_keyword,
         secondary_keywords, automation_notes, content_channel, updated_at)
       values
        ($1,$2,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,'[]'::jsonb,'published',$10,$2,$5,$11,$12,
         'index,follow',$13::jsonb,'en',$14,$15,$16,$4,$17,$17,'en',$18,$19,'Asia/Shanghai',$20,$21,$22,
         $23,$17,$17,$19,$24,$25::jsonb,$26,$27::jsonb,'Repository blog synchronization','blog',$19)
       on conflict (slug) do update set
         category_id = excluded.category_id, title = excluded.title, english_title = excluded.english_title,
         author = excluded.author, excerpt = excluded.excerpt, body_html = excluded.body_html,
         image_alt = excluded.image_alt, tags = excluded.tags, related_products = excluded.related_products,
         status = excluded.status, published_at = excluded.published_at, seo_title = excluded.seo_title,
         seo_description = excluded.seo_description, seo_keywords = excluded.seo_keywords,
         canonical_url = excluded.canonical_url, robots = excluded.robots, og_fields = excluded.og_fields,
         updated_source_at = excluded.updated_source_at, source_title = excluded.source_title,
         source_publisher = excluded.source_publisher, source_author = excluded.source_author,
         source_url = excluded.source_url, canonical_source_url = excluded.canonical_source_url,
         source_language = excluded.source_language, source_published_at = excluded.source_published_at,
         source_fetched_at = excluded.source_fetched_at, source_timezone = excluded.source_timezone,
         source_fingerprint = excluded.source_fingerprint, event_fingerprint = excluded.event_fingerprint,
         content_hash = excluded.content_hash, cover_image_url = excluded.cover_image_url,
         cover_image_source_url = excluded.cover_image_source_url, cover_image_page_url = excluded.cover_image_page_url,
         cover_image_fetched_at = excluded.cover_image_fetched_at, geo_summary = excluded.geo_summary,
         key_takeaways = excluded.key_takeaways, primary_keyword = excluded.primary_keyword,
         secondary_keywords = excluded.secondary_keywords, content_channel = excluded.content_channel,
         automation_notes = excluded.automation_notes, deleted_at = null, updated_at = excluded.updated_at
       where news_articles.automation_notes = 'Repository blog synchronization'
          or (news_articles.content_channel = 'news' and news_articles.canonical_url = $28)`,
      [
        categories.get(article.category) || null,
        article.title,
        article.slug,
        article.author,
        article.excerpt,
        bodyHtml,
        article.imageAlt,
        JSON.stringify([article.category, ...article.relatedProducts]),
        JSON.stringify(article.relatedProducts),
        article.source.publishedAt,
        [article.category, "hydraulic components", "XIJIU"].join(", "),
        canonicalUrl,
        JSON.stringify({ title: article.title, description: article.excerpt, image: article.image }),
        article.source.fetchedAt,
        article.source.title,
        article.source.publisher,
        canonicalUrl,
        article.source.publishedAt,
        article.source.fetchedAt,
        `repository-blog:${article.slug}`,
        `repository-blog:${contentHash}`,
        contentHash,
        article.image,
        article.geoSummary,
        JSON.stringify(article.keyTakeaways),
        article.category,
        JSON.stringify(article.relatedProducts),
        `${company.domain}/news/${article.slug}`,
      ],
    );
  }
}

async function syncSystemState(client: PoolClient) {
  const settings: Record<string, unknown> = {
    "site.identity": { brand: company.brandName, factory: company.factoryName, exporter: company.exportCompanyName },
    "site.contact": { email: company.email, phone: company.phoneLabel, address: company.address },
    "site.domain": company.domain,
  };
  for (const [key, value] of Object.entries(settings)) {
    await client.query(
      `insert into system_settings (key, value, is_sensitive, updated_at) values ($1,$2::jsonb,false,now())
       on conflict (key) do update set value=excluded.value, is_sensitive=false, updated_at=now()`,
      [key, JSON.stringify(value)],
    );
  }
  const sources = [
    ["repository-content", "网站仓库内容", "repository", "configured", "connected"],
    ["postgres-database", "生产数据库", "postgres", "configured", "connected"],
  ];
  for (const source of sources) {
    await client.query(
      `insert into sync_sources (code,name,source_type,config_status,connection_status,last_success_at,updated_at)
       values ($1,$2,$3,$4,$5,now(),now()) on conflict (code) do update set name=excluded.name,
       source_type=excluded.source_type, config_status=excluded.config_status,
       connection_status=excluded.connection_status, last_success_at=now(), updated_at=now()`,
      source,
    );
  }
}

async function main() {
  const pool = new Pool({ connectionString: requiredEnv("DATABASE_URL") });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const mediaIds = await syncMedia(client);
    const categoryIds = await syncCategories(client, mediaIds);
    await syncProducts(client, categoryIds, mediaIds);
    await syncBlogArticles(client);
    await syncSystemState(client);
    await client.query("commit");
    const counts = await client.query(
      `select
        (select count(*)::int from product_categories_cms where deleted_at is null) categories,
        (select count(*)::int from products_cms where deleted_at is null) products,
        (select count(*)::int from news_articles where deleted_at is null) news,
        (select count(*)::int from media_assets where deleted_at is null) media`,
    );
    console.log(JSON.stringify({ ok: true, ...counts.rows[0] }, null, 2));
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
