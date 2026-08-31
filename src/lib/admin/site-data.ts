import { appendDateOnlyRangeCondition, appendDateRangeCondition, type AdminDateRange } from "./date-range";
import {
  databaseHealth,
  getObjectStorageMessage,
  hasGoogleSearchConsoleConfig,
  hasObjectStorageConfig,
  hasVercelAnalyticsConfig,
  query,
} from "./db";
import { getSiteConfig } from "@/lib/news-automation/config";
import { getAdminSyncSourceRecords } from "./sync-status";

export type AdminTableRow = {
  id: string;
  cells: string[];
};

export async function getAdminOverview(range: AdminDateRange) {
  const db = await databaseHealth();
  let productCount = "-";
  let categoryCount = "-";
  let newsCount = "-";
  let seoIssueCount = "-";
  let metricsAvailable = db.ok;

  if (metricsAvailable) {
    const productWhere = ["deleted_at is null", "status = 'published'"];
    const categoryWhere = ["deleted_at is null", "is_enabled = true"];
    const newsWhere = ["deleted_at is null", "status = 'published'", "published_at <= now()", "site_id = $1", "content_channel = 'news'"];
    const seoWhere = ["deleted_at is null"];
    const productValues: unknown[] = [];
    const categoryValues: unknown[] = [];
    const newsValues: unknown[] = [getSiteConfig().siteId];
    const seoValues: unknown[] = [];
    appendDateRangeCondition(productWhere, productValues, "updated_at", range);
    appendDateRangeCondition(categoryWhere, categoryValues, "updated_at", range);
    appendDateRangeCondition(newsWhere, newsValues, "published_at", range);
    appendDateRangeCondition(seoWhere, seoValues, "detected_at", range);

    try {
      const [productsResult, categoriesResult, newsResult, seoResult] = await Promise.all([
        query<{ count: string }>(`select count(*)::text as count from products_cms where ${productWhere.join(" and ")}`, productValues),
        query<{ count: string }>(`select count(*)::text as count from product_categories_cms where ${categoryWhere.join(" and ")}`, categoryValues),
        query<{ count: string }>(`select count(*)::text as count from news_articles where ${newsWhere.join(" and ")}`, newsValues),
        query<{ count: string }>(`select count(*)::text as count from seo_issues where ${seoWhere.join(" and ")}`, seoValues),
      ]);
      productCount = productsResult.rows[0]?.count || "0";
      categoryCount = categoriesResult.rows[0]?.count || "0";
      newsCount = newsResult.rows[0]?.count || "0";
      seoIssueCount = seoResult.rows[0]?.count || "0";
    } catch {
      metricsAvailable = false;
    }
  }

  return {
    cards: [
      { label: "已发布产品", value: productCount, detail: metricsAvailable ? `${range.label}内更新的数据库记录` : "数据库不可用，未显示替代数据" },
      { label: "启用产品分类", value: categoryCount, detail: metricsAvailable ? `${range.label}内更新的数据库记录` : "数据库不可用，未显示替代数据" },
      { label: "已发布新闻", value: newsCount, detail: metricsAvailable ? `${range.label}内发布的数据库记录` : "数据库不可用，未显示替代数据" },
      { label: "SEO问题", value: seoIssueCount, detail: metricsAvailable ? "SEO 问题库中的真实记录" : "数据库不可用，未显示替代数据" },
    ],
    status: [
      { label: "内容数据", ok: metricsAvailable, message: metricsAvailable ? "CMS 数据库读取正常；前台产品内容同步状态见“数据同步”。" : "数据库读取异常，未显示静态或模拟替代数据。" },
      { label: "客户表单数据库", ok: db.ok, message: db.ok ? "数据库连接正常。" : "数据库连接失败。" },
      { label: "对象存储", ok: hasObjectStorageConfig(), message: getObjectStorageMessage() },
      {
        label: "外部SEO/分析",
        ok: hasExternalMetrics(),
        message: hasVercelAnalyticsConfig()
          ? hasGoogleSearchConsoleConfig()
            ? "Vercel 分析与 Google Search Console 已连接。"
            : "Vercel Web Analytics 已连接；Google Search Console 待授权。"
          : "未连接外部数据源。",
      },
    ],
  };
}

export function hasExternalMetrics() {
  return hasVercelAnalyticsConfig() || hasGoogleSearchConsoleConfig() || Boolean(process.env.ANALYTICS_PROVIDER && process.env.ANALYTICS_API_KEY);
}

export async function getAdminModuleDataStatus() {
  const db = await databaseHealth();
  return db.ok ? null : "数据库当前不可读取。为避免误导，本页面未显示静态缓存或模拟替代数据。";
}

function dateCell(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : String(value);
}

export async function getAdminModuleRows(moduleKey: string, range: AdminDateRange): Promise<AdminTableRow[]> {
  const db = await databaseHealth();
  if (!db.ok) return [];

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

    if (moduleKey === "news" || moduleKey === "blog") {
      const channel = moduleKey;
      const where = ["deleted_at is null", "site_id = $1", "content_channel = $2"];
      const values: unknown[] = [getSiteConfig().siteId, channel];
      appendDateRangeCondition(where, values, "coalesce(published_at, updated_at)", range);
      const result = await query<{ id: string; title: string; category: string | null; source_name: string | null; author: string | null; status: string; published_at: Date | null; view_count: string }>(
        `select id, coalesce(english_title, title) as title, category, source_name, author, status, published_at, view_count::text from news_articles where ${where.join(" and ")} order by updated_at desc limit 200`, values,
      );
      return result.rows.map((row) => ({ id: row.id, cells: [row.title, channel === "news" ? row.source_name || "-" : row.category || "-", row.author || "-", row.status, dateCell(row.published_at), row.view_count] }));
    }

    if (moduleKey === "content-ops") {
      const where: string[] = [];
      const values: unknown[] = [];
      appendDateRangeCondition(where, values, "created_at", range);
      const result = await query<{ id: string; title: string; slug: string; status: string; validation: Record<string, { passed?: boolean }> | null; created_at: Date; updated_at: Date }>(
        `select id, title, slug, status, validation, created_at, updated_at from content_ops_article_records ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc limit 200`,
        values,
      );
      return result.rows.map((row) => {
        const values = Object.values(row.validation || {});
        const checksPassed = values.length > 0 && values.every((value) => value.passed === true);
        return {
          id: row.id,
          cells: [
            row.title,
            row.slug,
            row.status,
            checksPassed ? "自动校验通过" : "自动校验未通过",
            dateCell(row.created_at),
            dateCell(row.updated_at),
          ],
        };
      });
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
      const rows = await getAdminSyncSourceRecords();
      return rows.map((row) => ({ id: row.id, cells: [row.name, row.source_type, row.config_status, row.connection_status, dateCell(row.last_success_at), dateCell(row.next_run_at)] }));
    }

    return [];
  } catch (error) {
    console.error("[admin] module database read failed", { moduleKey, message: error instanceof Error ? error.message : "unknown error" });
    return [];
  }
}
