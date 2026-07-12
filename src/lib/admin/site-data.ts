import { productCategories } from "../../../data/categories";
import { factoryPhotos } from "../../../data/factory-photos";
import { imageCredits } from "../../../data/image-credits";
import { newsArticles } from "../../../data/news";
import { products } from "../../../data/products";
import { site } from "@/lib/site";
import { appendDateOnlyRangeCondition, appendDateRangeCondition, type AdminDateRange } from "./date-range";
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

export async function getAdminOverview(range: AdminDateRange) {
  const [db] = await Promise.all([databaseHealth()]);
  let productCount = getPublishedProducts().length;
  let categoryCount = getPublishedCategories().length;
  let newsCount = getPublishedNews().length;
  if (db.ok) {
    const productWhere = ["deleted_at is null", "status = 'published'"];
    const categoryWhere = ["deleted_at is null", "is_enabled = true"];
    const newsWhere = ["deleted_at is null", "status = 'published'", "published_at <= now()"];
    const productValues: unknown[] = [];
    const categoryValues: unknown[] = [];
    const newsValues: unknown[] = [];
    appendDateRangeCondition(productWhere, productValues, "updated_at", range);
    appendDateRangeCondition(categoryWhere, categoryValues, "updated_at", range);
    appendDateRangeCondition(newsWhere, newsValues, "published_at", range);
    const [productsResult, categoriesResult, newsResult] = await Promise.all([
      query<{ count: string }>(`select count(*)::text as count from products_cms where ${productWhere.join(" and ")}`, productValues),
      query<{ count: string }>(`select count(*)::text as count from product_categories_cms where ${categoryWhere.join(" and ")}`, categoryValues),
      query<{ count: string }>(`select count(*)::text as count from news_articles where ${newsWhere.join(" and ")}`, newsValues),
    ]);
    productCount = Number(productsResult.rows[0]?.count || 0);
    categoryCount = Number(categoriesResult.rows[0]?.count || 0);
    newsCount = Number(newsResult.rows[0]?.count || 0);
  }
  const seoIssues = getSeoIssueRows();

  return {
    cards: [
      { label: "已发布产品", value: String(productCount), detail: db.ok ? `${range.label}内更新的已发布产品` : "当前仓库公开产品" },
      { label: "前台产品分类", value: String(categoryCount), detail: db.ok ? `${range.label}内更新的启用分类` : "当前导航公开分类" },
      { label: "已发布新闻", value: String(newsCount), detail: db.ok ? `${range.label}内发布的新闻` : "当前仓库公开文章" },
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

export async function getAdminModuleRows(moduleKey: string, range: AdminDateRange): Promise<AdminTableRow[]> {
  if (!hasDatabaseConfig()) return getModuleRows(moduleKey);
  try {
    if (moduleKey === "products") {
      const where = ["deleted_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "updated_at", range);
      const result = await query<{ id: string; english_name: string; sku: string | null; slug: string; status: string; category_name: string | null }>(
        `select p.id, p.english_name, p.sku, p.slug, p.status, c.english_name as category_name
         from products_cms p left join product_categories_cms c on c.id = p.primary_category_id
         where ${where.map((condition) => condition.replaceAll("updated_at", "p.updated_at").replaceAll("deleted_at", "p.deleted_at")).join(" and ")} order by p.updated_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.english_name, row.sku || "-", row.slug, row.status, `/products/${row.slug}`, row.category_name || "-"] }));
    }
    if (moduleKey === "categories") {
      const where = ["deleted_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "updated_at", range);
      const result = await query<{ id: string; name: string; english_name: string; slug: string; level: number; is_enabled: boolean; sort_order: number }>(
        `select id, name, english_name, slug, level, is_enabled, sort_order from product_categories_cms where ${where.join(" and ")} order by sort_order, updated_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.name, row.english_name, row.slug, String(row.level), row.is_enabled ? "启用" : "停用", String(row.sort_order)] }));
    }
    if (moduleKey === "news") {
      const where = ["deleted_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "coalesce(published_at, updated_at)", range);
      const result = await query<{ id: string; title: string; author: string | null; status: string; published_at: Date | null; view_count: string }>(
        `select id, coalesce(english_title, title) as title, author, status, published_at, view_count::text from news_articles where ${where.join(" and ")} order by updated_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.title, "News", row.author || "-", row.status, dateCell(row.published_at), row.view_count] }));
    }
    if (moduleKey === "leads") {
      const where = ["archived_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "submitted_at", range);
      const result = await query<{ id: string; form_number: string; name: string | null; company_name: string | null; email: string | null; country: string | null; status: string; submitted_at: Date }>(
        `select id, form_number, name, company_name, email, country, status, submitted_at from form_submissions where ${where.join(" and ")} order by submitted_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.form_number, row.name || "-", row.company_name || "-", row.email || "-", row.country || "-", row.status, dateCell(row.submitted_at)] }));
    }
    if (moduleKey === "analytics") {
      const where: string[] = [];
      const values: unknown[] = [];
      appendDateOnlyRangeCondition(where, values, "summary_date", range);
      const result = await query<{ id: string; summary_date: string; dimension: string; dimension_value: string; page_views: string; unique_visitors: string; conversions: string }>(
        `select id, summary_date::text, dimension, dimension_value, page_views::text, unique_visitors::text, conversions::text from analytics_daily_summary ${where.length ? `where ${where.join(" and ")}` : ""} order by summary_date desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.dimension, row.page_views, row.unique_visitors, row.dimension_value, row.conversions, row.summary_date] }));
    }
    if (moduleKey === "seo") {
      const where = ["deleted_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "detected_at", range);
      const result = await query<{ id: string; issue_type: string; severity: string; page_url: string; status: string; suggestion: string | null; detected_at: Date }>(
        `select id, issue_type, severity, page_url, status, suggestion, detected_at from seo_issues where ${where.join(" and ")} order by detected_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.issue_type, row.severity, row.page_url, row.status, row.suggestion || "-", dateCell(row.detected_at)] }));
    }
    if (moduleKey === "media") {
      const where = ["deleted_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "created_at", range);
      const result = await query<{ id: string; original_name: string; mime_type: string; url: string; category: string | null; alt_text: string | null; created_at: Date }>(
        `select id, original_name, mime_type, url, category, alt_text, created_at from media_assets where ${where.join(" and ")} order by created_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.original_name, row.mime_type, row.url, "网站素材", row.category || "-", row.alt_text || "-", dateCell(row.created_at)] }));
    }
    if (moduleKey === "users") {
      const where = ["u.deleted_at is null"];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "u.created_at", range);
      const result = await query<{ id: string; name: string; email: string; roles: string[]; status: string; last_login_at: Date | null; created_at: Date }>(
        `select u.id, u.name, u.email, coalesce(array_agg(r.code) filter (where r.code is not null), '{}') as roles, u.status, u.last_login_at, u.created_at
         from admin_users u left join admin_user_roles ur on ur.user_id = u.id left join admin_roles r on r.id = ur.role_id
         where ${where.join(" and ")} group by u.id order by u.created_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.name, row.email, row.roles.join(", ") || "-", row.status, dateCell(row.last_login_at), dateCell(row.created_at)] }));
    }
    if (moduleKey === "settings") {
      const values: unknown[] = [];
      const where: string[] = [];
      appendDateRangeCondition(where, values, "updated_at", range);
      const result = await query<{ key: string; value: unknown; is_sensitive: boolean; updated_at: Date }>(
        `select key, case when is_sensitive then '***'::jsonb else value end as value, is_sensitive, updated_at from system_settings ${where.length ? `where ${where.join(" and ")}` : ""} order by updated_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.key, cells: [row.key, typeof row.value === "string" ? row.value : JSON.stringify(row.value), row.is_sensitive ? "是" : "否", dateCell(row.updated_at)] }));
    }
    if (moduleKey === "audit-logs") {
      const where: string[] = [];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "created_at", range);
      const result = await query<{ id: string; action: string; module: string; object_type: string | null; object_id: string | null; result: string; created_at: Date }>(
        `select id, action, module, object_type, object_id, result, created_at from audit_logs ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.action, row.module, row.object_type || "-", row.object_id || "-", row.result, dateCell(row.created_at)] }));
    }
    if (moduleKey === "sync") {
      const where: string[] = [];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "coalesce(last_success_at, updated_at)", range);
      const result = await query<{ id: string; name: string; source_type: string; config_status: string; connection_status: string; last_success_at: Date | null; next_run_at: Date | null }>(
        `select id, name, source_type, config_status, connection_status, last_success_at, next_run_at from sync_sources ${where.length ? `where ${where.join(" and ")}` : ""} order by updated_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.name, row.source_type, row.config_status, row.connection_status, dateCell(row.last_success_at), dateCell(row.next_run_at)] }));
    }
    return getModuleRows(moduleKey);
  } catch (error) {
    console.error("[admin] module database read failed", { moduleKey, message: error instanceof Error ? error.message : "unknown error" });
    return getModuleRows(moduleKey);
  }
}
