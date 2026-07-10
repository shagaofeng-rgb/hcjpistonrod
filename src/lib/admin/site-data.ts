import { productCategories } from "../../../data/categories";
import { factoryPhotos } from "../../../data/factory-photos";
import { imageCredits } from "../../../data/image-credits";
import { newsArticles } from "../../../data/news";
import { products } from "../../../data/products";
import { site } from "@/lib/site";
import { databaseHealth, hasDatabaseConfig, hasObjectStorageConfig, query } from "./db";

const primaryProductCategories = new Set(["chrome-plated-rod", "honed-tube"]);
const publicProductSlugs = new Set(products.filter((item) => primaryProductCategories.has(item.category)).map((item) => item.slug));
const publicCategorySlugs = new Set(["chrome-plated-rod", "honed-tube"]);

export type AdminTableRow = {
  id: string;
  cells: string[];
};

export function getPublishedProducts() {
  return products.filter((item) => publicProductSlugs.has(item.slug));
}

export function getPublishedCategories() {
  return productCategories.filter((item) => publicCategorySlugs.has(item.slug));
}

export function getPublishedNews() {
  return newsArticles;
}

export function getMediaAssets() {
  return [
    ...factoryPhotos.map((item) => ({
      id: item.file,
      file: item.file,
      title: item.title,
      type: item.file.split(".").pop()?.toUpperCase() ?? "IMAGE",
      source: "Factory",
      use: item.use,
    })),
    ...imageCredits.map((item) => ({
      id: item.file,
      file: item.file,
      title: item.title,
      type: item.file.split(".").pop()?.toUpperCase() ?? "IMAGE",
      source: item.license,
      use: item.artist,
    })),
    {
      id: "/images/site/hollow-chrome-plated-rod.jpg",
      file: "/images/site/hollow-chrome-plated-rod.jpg",
      title: "Hollow Chrome Plated Rod",
      type: "JPG",
      source: "Generated product visual",
      use: "Hollow chrome plated rod product page",
    },
  ];
}

export function getSeoIssueRows(): AdminTableRow[] {
  const issues: AdminTableRow[] = [];

  for (const product of getPublishedProducts()) {
    if (!product.shortDescription) {
      issues.push({
        id: `product-description-${product.slug}`,
        cells: ["Meta Description", "高", `/products/${product.slug}`, "待处理", "产品缺少简短描述", "内容"],
      });
    }
    if (!product.image) {
      issues.push({
        id: `product-image-${product.slug}`,
        cells: ["OG Image", "中", `/products/${product.slug}`, "待处理", "产品缺少主图", "内容"],
      });
    }
  }

  for (const article of getPublishedNews()) {
    if (!article.excerpt) {
      issues.push({
        id: `news-description-${article.slug}`,
        cells: ["Meta Description", "中", `/news/${article.slug}`, "待处理", "新闻缺少摘要", "内容"],
      });
    }
  }

  return issues;
}

export async function getAdminOverview() {
  const [db] = await Promise.all([databaseHealth()]);
  let productCount = getPublishedProducts().length;
  let categoryCount = getPublishedCategories().length;
  let newsCount = getPublishedNews().length;
  if (db.ok) {
    const [productsResult, categoriesResult, newsResult] = await Promise.all([
      query<{ count: string }>("select count(*)::text as count from products_cms where deleted_at is null and status = 'published'"),
      query<{ count: string }>("select count(*)::text as count from product_categories_cms where deleted_at is null and is_enabled = true"),
      query<{ count: string }>("select count(*)::text as count from news_articles where deleted_at is null and status = 'published' and published_at <= now()"),
    ]);
    productCount = Number(productsResult.rows[0]?.count || 0);
    categoryCount = Number(categoriesResult.rows[0]?.count || 0);
    newsCount = Number(newsResult.rows[0]?.count || 0);
  }
  const seoIssues = getSeoIssueRows();

  return {
    cards: [
      { label: "已发布产品", value: String(productCount), detail: db.ok ? "数据库已发布产品" : "当前仓库公开产品" },
      { label: "前台产品分类", value: String(categoryCount), detail: db.ok ? "数据库启用分类" : "当前导航公开分类" },
      { label: "已发布新闻", value: String(newsCount), detail: db.ok ? "数据库已发布新闻" : "当前仓库公开文章" },
      { label: "SEO问题", value: String(seoIssues.length), detail: "站内内容基础检查" },
    ],
    status: [
      { label: "内容数据", ok: true, message: "已读取当前网站发布内容。" },
      { label: "客户表单数据库", ok: db.ok, message: db.ok ? "数据库连接正常。" : "未连接数据库。" },
      { label: "对象存储", ok: hasObjectStorageConfig(), message: hasObjectStorageConfig() ? "对象存储已连接。" : "未连接对象存储。" },
      { label: "外部SEO/分析", ok: hasExternalMetrics(), message: hasExternalMetrics() ? "外部数据源已连接。" : "未连接外部数据源。" },
    ],
  };
}

export function hasExternalMetrics() {
  return Boolean((process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY) || (process.env.ANALYTICS_PROVIDER && process.env.ANALYTICS_API_KEY));
}

export function getModuleRows(moduleKey: string): AdminTableRow[] {
  if (moduleKey === "products") {
    return getPublishedProducts().map((item) => ({
      id: item.slug,
      cells: [item.name, item.model, item.slug, "已发布", `/products/${item.slug}`, item.category],
    }));
  }

  if (moduleKey === "categories") {
    return getPublishedCategories().map((item, index) => ({
      id: item.slug,
      cells: [item.name, item.title, item.slug, item.parent ? "二级" : "一级", "启用", String(index + 1)],
    }));
  }

  if (moduleKey === "news") {
    return getPublishedNews().map((item) => ({
      id: item.slug,
      cells: [item.title, item.category, "XIJIU", "已发布", item.date, "0"],
    }));
  }

  if (moduleKey === "media") {
    return getMediaAssets().map((item) => ({
      id: item.id,
      cells: [item.title, item.type, item.file, item.source, "网站素材", item.use],
    }));
  }

  if (moduleKey === "analytics") {
    return [
      {
        id: "internal-content",
        cells: ["当前内容", "已发布产品", String(getPublishedProducts().length), "已发布新闻", String(getPublishedNews().length), "内容概览"],
      },
    ];
  }

  if (moduleKey === "seo") {
    return getSeoIssueRows();
  }

  if (moduleKey === "settings") {
    return [
      { id: "site-name", cells: ["网站名称", site.brandName, "否", "当前配置"] },
      { id: "timezone", cells: ["默认时区", "Asia/Shanghai", "否", "当前配置"] },
      { id: "email", cells: ["询盘接收邮箱", site.email, "否", "当前配置"] },
      { id: "domain", cells: ["网站域名", site.domain, "否", "当前配置"] },
    ];
  }

  if (moduleKey === "sync") {
    return [
      { id: "website-content", cells: ["网站内容", "已连接", "正常", "实时读取", "当前版本", "无"] },
      { id: "lead-database", cells: ["客户表单", "未连接", "未连接", "暂停", "无", "数据库未连接"] },
      { id: "external-seo", cells: ["外部SEO", "未连接", "未连接", "暂停", "无", "外部数据源未连接"] },
    ];
  }

  return [];
}

function dateCell(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : String(value);
}

export async function getAdminModuleRows(moduleKey: string): Promise<AdminTableRow[]> {
  if (!hasDatabaseConfig()) return getModuleRows(moduleKey);
  try {
    if (moduleKey === "products") {
      const result = await query<{ id: string; english_name: string; sku: string | null; slug: string; status: string; published_at: Date | null; updated_at: Date }>(
        "select id, english_name, sku, slug, status, published_at, updated_at from products_cms where deleted_at is null order by updated_at desc limit 200",
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.english_name, row.sku || "-", row.slug, row.status, dateCell(row.published_at), dateCell(row.updated_at)] }));
    }
    if (moduleKey === "categories") {
      const result = await query<{ id: string; name: string; english_name: string; slug: string; level: number; is_enabled: boolean; sort_order: number }>(
        "select id, name, english_name, slug, level, is_enabled, sort_order from product_categories_cms where deleted_at is null order by sort_order, updated_at desc limit 200",
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.name, row.english_name, row.slug, String(row.level), row.is_enabled ? "启用" : "停用", String(row.sort_order)] }));
    }
    if (moduleKey === "news") {
      const result = await query<{ id: string; title: string; author: string | null; status: string; published_at: Date | null; view_count: string }>(
        "select id, coalesce(english_title, title) as title, author, status, published_at, view_count::text from news_articles where deleted_at is null order by updated_at desc limit 200",
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.title, "News", row.author || "-", row.status, dateCell(row.published_at), row.view_count] }));
    }
    if (moduleKey === "leads") {
      const result = await query<{ id: string; form_number: string; name: string | null; company_name: string | null; email: string | null; country: string | null; status: string; submitted_at: Date }>(
        "select id, form_number, name, company_name, email, country, status, submitted_at from form_submissions where deleted_at is null order by submitted_at desc limit 200",
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.form_number, row.name || "-", row.company_name || "-", row.email || "-", row.country || "-", row.status, dateCell(row.submitted_at)] }));
    }
    if (moduleKey === "audit-logs") {
      const result = await query<{ id: string; action: string; module: string; object_type: string | null; object_id: string | null; result: string; created_at: Date }>(
        "select id, action, module, object_type, object_id, result, created_at from audit_logs order by created_at desc limit 200",
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.action, row.module, row.object_type || "-", row.object_id || "-", row.result, dateCell(row.created_at)] }));
    }
    if (moduleKey === "sync") {
      const result = await query<{ id: string; name: string; source_type: string; config_status: string; connection_status: string; last_success_at: Date | null; next_run_at: Date | null }>(
        "select id, name, source_type, config_status, connection_status, last_success_at, next_run_at from sync_sources order by updated_at desc limit 200",
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.name, row.source_type, row.config_status, row.connection_status, dateCell(row.last_success_at), dateCell(row.next_run_at)] }));
    }
    return getModuleRows(moduleKey);
  } catch (error) {
    console.error("[admin] module database read failed", { moduleKey, message: error instanceof Error ? error.message : "unknown error" });
    return getModuleRows(moduleKey);
  }
}
