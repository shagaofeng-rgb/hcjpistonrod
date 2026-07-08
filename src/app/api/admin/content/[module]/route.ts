import { adminApiError, adminError, adminOk, pageParams } from "@/lib/admin/api";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { query } from "@/lib/admin/db";

export const runtime = "nodejs";

const modules = {
  products: {
    table: "products_cms",
    permission: "products.view",
    search: ["name", "english_name", "sku", "slug"],
    fields: "id, name, english_name, sku, slug, status, published_at, updated_at",
  },
  categories: {
    table: "product_categories_cms",
    permission: "categories.manage",
    search: ["name", "english_name", "slug"],
    fields: "id, name, english_name, slug, level, is_enabled, sort_order, updated_at",
  },
  news: {
    table: "news_articles",
    permission: "news.manage",
    search: ["title", "english_title", "slug", "author"],
    fields: "id, title, english_title, slug, author, status, published_at, view_count, updated_at",
  },
  leads: {
    table: "form_submissions",
    permission: "leads.manage",
    search: ["form_number", "name", "company_name", "email", "phone", "country"],
    fields: "id, form_number, name, company_name, email, country, status, submitted_at, updated_at",
  },
  analytics: {
    table: "analytics_daily_summary",
    permission: "analytics.view",
    search: ["dimension", "dimension_value"],
    fields: "id, summary_date, dimension, dimension_value, page_views, unique_visitors, conversions, updated_at",
  },
  seo: {
    table: "seo_issues",
    permission: "seo.manage",
    search: ["issue_type", "page_url", "severity", "status"],
    fields: "id, issue_type, severity, page_url, status, detected_at, fixed_at",
  },
  media: {
    table: "media_assets",
    permission: "media.manage",
    search: ["original_name", "safe_name", "mime_type", "alt_text"],
    fields: "id, original_name, safe_name, mime_type, size_bytes, alt_text, created_at",
  },
  users: {
    table: "admin_users",
    permission: "users.manage",
    search: ["name", "email", "username", "status"],
    fields: "id, name, email, username, status, last_login_at, created_at",
  },
  "audit-logs": {
    table: "audit_logs",
    permission: "audit.view",
    search: ["action", "module", "object_type", "object_id", "result"],
    fields: "id, action, module, object_type, object_id, result, created_at",
  },
  settings: {
    table: "system_settings",
    permission: "settings.manage",
    search: ["key"],
    fields: "key, value, is_sensitive, updated_at",
  },
  sync: {
    table: "sync_sources",
    permission: "sync.manage",
    search: ["code", "name", "source_type", "config_status", "connection_status"],
    fields: "id, code, name, source_type, config_status, connection_status, last_success_at, next_run_at",
  },
} as const;

type ModuleKey = keyof typeof modules;

export async function GET(request: Request, context: { params: Promise<{ module: string }> }) {
  try {
    const { module } = await context.params;
    const config = modules[module as ModuleKey];

    if (!config) {
      return adminError("未知后台模块。", 404, "ADMIN_MODULE_NOT_FOUND");
    }

    const user = await getCurrentAdminUser();

    if (!user) {
      return adminError("请先登录后台。", 401, "ADMIN_UNAUTHORIZED");
    }

    if (!hasPermission(user, config.permission)) {
      return adminError("当前账号无权访问该模块。", 403, "ADMIN_FORBIDDEN");
    }

    const { page, pageSize, keyword, offset } = pageParams(request.url);
    const where: string[] = ["deleted_at is null"];
    const values: unknown[] = [];

    if (config.table === "analytics_daily_summary" || config.table === "audit_logs" || config.table === "system_settings" || config.table === "sync_sources") {
      where.pop();
    }

    if (keyword) {
      values.push(`%${keyword}%`);
      const searchSql = config.search.map((column) => `${column}::text ilike $${values.length}`).join(" or ");
      where.push(`(${searchSql})`);
    }

    const whereSql = where.length ? `where ${where.join(" and ")}` : "";
    const totalResult = await query<{ count: string }>(`select count(*)::text as count from ${config.table} ${whereSql}`, values);
    const dataResult = await query(
      `select ${config.fields} from ${config.table} ${whereSql} order by updated_at desc nulls last, created_at desc nulls last limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, pageSize, offset],
    );

    return adminOk({
      rows: dataResult.rows,
      pagination: {
        page,
        pageSize,
        total: Number(totalResult.rows[0]?.count ?? 0),
      },
    });
  } catch (error) {
    return adminApiError(error);
  }
}
