import { appendDateRangeCondition, type AdminDateRange } from "@/lib/admin/date-range";
import { query } from "@/lib/admin/db";
import { getSiteConfig } from "@/lib/news-automation/config";

type CountRow = { count: string };

export type AnalyticsFilters = {
  page: number;
  pageSize: number;
  country?: string;
  channel?: string;
  classification?: string;
  device?: string;
  keyword?: string;
};

export type AnalyticsMetric = {
  label: string;
  value: number;
  detail: string;
};

function count(value: string | number | null | undefined) {
  return Number(value || 0);
}

function siteId() {
  return getSiteConfig().siteId;
}

function rangeWhere(range: AdminDateRange, column: string, initial: string[], values: unknown[]) {
  appendDateRangeCondition(initial, values, column, range);
  return initial;
}

export function parseAnalyticsFilters(searchParams: Record<string, string | string[] | undefined>): AnalyticsFilters {
  const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const page = Math.max(1, Number(one(searchParams.page) || 1));
  const requestedPageSize = Number(one(searchParams.pageSize) || 20);
  return {
    page,
    pageSize: [20, 50, 100].includes(requestedPageSize) ? requestedPageSize : 20,
    country: one(searchParams.country)?.slice(0, 8),
    channel: one(searchParams.channel)?.slice(0, 40),
    classification: one(searchParams.classification)?.slice(0, 40),
    device: one(searchParams.device)?.slice(0, 40),
    keyword: one(searchParams.keyword)?.trim().slice(0, 120),
  };
}

export function countryLabel(code: string | null) {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export async function getAnalyticsDashboard(range: AdminDateRange) {
  const values: unknown[] = [siteId()];
  const eventWhere = rangeWhere(range, "occurred_at", ["site_id = $1"], values);
  const sessionValues: unknown[] = [siteId()];
  const sessionWhere = rangeWhere(range, "last_seen_at", ["site_id = $1"], sessionValues);

  const [pageViewsResult, visitorsResult, sessionsResult, conversionsResult, trendResult, countriesResult, channelsResult, pagesResult, qualityResult] = await Promise.all([
    query<CountRow>(`select count(*)::text as count from analytics_events where ${eventWhere.join(" and ")} and event_name = 'page_view'`, values),
    query<CountRow>(`select count(distinct visitor_id_hash)::text as count from analytics_events where ${eventWhere.join(" and ")} and event_name = 'page_view'`, values),
    query<CountRow>(`select count(*)::text as count from analytics_sessions where ${sessionWhere.join(" and ")}`, sessionValues),
    query<CountRow>(`select count(*)::text as count from analytics_events where ${eventWhere.join(" and ")} and event_name = 'rfq_submitted'`, values),
    query<{ day: string; page_views: string; visitors: string }>(
      `select (occurred_at at time zone 'Asia/Shanghai')::date::text as day, count(*) filter (where event_name='page_view')::text as page_views, count(distinct visitor_id_hash) filter (where event_name='page_view')::text as visitors from analytics_events where ${eventWhere.join(" and ")} group by 1 order by 1`,
      values,
    ),
    query<{ value: string | null; page_views: string; visitors: string }>(
      `select country as value, count(*) filter (where event_name='page_view')::text as page_views, count(distinct visitor_id_hash) filter (where event_name='page_view')::text as visitors from analytics_events where ${eventWhere.join(" and ")} group by country order by count(*) filter (where event_name='page_view') desc nulls last limit 8`,
      values,
    ),
    query<{ value: string | null; page_views: string; visitors: string }>(
      `select source_channel as value, count(*) filter (where event_name='page_view')::text as page_views, count(distinct visitor_id_hash) filter (where event_name='page_view')::text as visitors from analytics_events where ${eventWhere.join(" and ")} group by source_channel order by count(*) filter (where event_name='page_view') desc nulls last limit 8`,
      values,
    ),
    query<{ value: string | null; page_views: string }>(
      `select page_url as value, count(*)::text as page_views from analytics_events where ${eventWhere.join(" and ")} and event_name='page_view' group by page_url order by count(*) desc limit 8`,
      values,
    ),
    query<{ outcome: string; reason: string; count: string }>(
      `select outcome, reason, sum(event_count)::text as count from analytics_collection_rollups where site_id=$1 ${range.startDate && range.endDate ? "and (rollup_hour at time zone 'Asia/Shanghai')::date between $2::date and $3::date" : ""} group by outcome, reason order by sum(event_count) desc limit 10`,
      range.startDate && range.endDate ? [siteId(), range.startDate, range.endDate] : [siteId()],
    ),
  ]);

  return {
    hasData: count(pageViewsResult.rows[0]?.count) > 0,
    metrics: [
      { label: "页面浏览", value: count(pageViewsResult.rows[0]?.count), detail: `${range.label}内已过滤的真实页面访问` },
      { label: "独立访客", value: count(visitorsResult.rows[0]?.count), detail: "按匿名访客标识去重" },
      { label: "访问会话", value: count(sessionsResult.rows[0]?.count), detail: "同一浏览器会话只计一次访问" },
      { label: "已识别询盘", value: count(conversionsResult.rows[0]?.count), detail: "仅统计成功写入的官网表单" },
    ] satisfies AnalyticsMetric[],
    trend: trendResult.rows.map((row) => ({ day: row.day, pageViews: count(row.page_views), visitors: count(row.visitors) })),
    countries: countriesResult.rows.map((row) => ({ label: countryLabel(row.value), code: row.value || "--", pageViews: count(row.page_views), visitors: count(row.visitors) })),
    channels: channelsResult.rows.map((row) => ({ label: row.value || "direct", pageViews: count(row.page_views), visitors: count(row.visitors) })),
    pages: pagesResult.rows.map((row) => ({ path: row.value || "/", pageViews: count(row.page_views) })),
    quality: qualityResult.rows.map((row) => ({ outcome: row.outcome, reason: row.reason, count: count(row.count) })),
  };
}

export async function getVisitorSessions(range: AdminDateRange, filters: AnalyticsFilters) {
  const values: unknown[] = [siteId()];
  const where = rangeWhere(range, "s.last_seen_at", ["s.site_id = $1"], values);
  if (filters.country) {
    values.push(filters.country.toUpperCase());
    where.push(`s.country = $${values.length}`);
  }
  if (filters.channel) {
    values.push(filters.channel);
    where.push(`s.source_channel = $${values.length}`);
  }
  if (filters.classification) {
    values.push(filters.classification);
    where.push(`s.classification = $${values.length}`);
  }
  if (filters.device) {
    values.push(filters.device);
    where.push(`s.device_type = $${values.length}`);
  }
  if (filters.keyword) {
    values.push(`%${filters.keyword}%`);
    where.push(`(s.ip_masked ilike $${values.length} or s.landing_path ilike $${values.length} or s.last_page_path ilike $${values.length} or coalesce(s.referrer_host,'') ilike $${values.length})`);
  }
  const whereSql = where.join(" and ");
  const [totalResult, rowsResult] = await Promise.all([
    query<CountRow>(`select count(*)::text as count from analytics_sessions s where ${whereSql}`, values),
    query<{ id: string; first_seen_at: Date; last_seen_at: Date; visit_number: number; landing_path: string | null; last_page_path: string | null; country: string | null; source_channel: string | null; referrer_host: string | null; device_type: string | null; browser: string | null; page_views: number; conversion_count: number; classification: string; ip_masked: string | null }>(
      `select s.id,s.first_seen_at,s.last_seen_at,s.visit_number,s.landing_path,s.last_page_path,s.country,s.source_channel,s.referrer_host,s.device_type,s.browser,s.page_views,s.conversion_count,s.classification,s.ip_masked from analytics_sessions s where ${whereSql} order by s.last_seen_at desc limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, filters.pageSize, (filters.page - 1) * filters.pageSize],
    ),
  ]);
  return {
    total: count(totalResult.rows[0]?.count),
    rows: rowsResult.rows.map((row) => ({ ...row, countryLabel: countryLabel(row.country) })),
  };
}

export async function getVisitorSessionDetail(id: string) {
  const sessionResult = await query<{ id: string; visitor_id_hash: string; first_seen_at: Date; last_seen_at: Date; visit_number: number; landing_path: string | null; last_page_path: string | null; country: string | null; source_channel: string | null; referrer_host: string | null; device_type: string | null; browser: string | null; os: string | null; language: string | null; page_views: number; conversion_count: number; classification: string; ip_masked: string | null }>(
    `select id,visitor_id_hash,first_seen_at,last_seen_at,visit_number,landing_path,last_page_path,country,source_channel,referrer_host,device_type,browser,os,language,page_views,conversion_count,classification,ip_masked from analytics_sessions where id=$1 and site_id=$2 limit 1`,
    [id, siteId()],
  );
  const session = sessionResult.rows[0];
  if (!session) return null;
  const events = await query<{ id: string; event_name: string; page_url: string | null; occurred_at: Date; source_channel: string | null; referrer_host: string | null }>(
    `select id,event_name,page_url,occurred_at,source_channel,referrer_host from analytics_events where site_id=$1 and session_id_hash=(select session_id_hash from analytics_sessions where id=$2) order by occurred_at asc`,
    [siteId(), id],
  );
  return { ...session, countryLabel: countryLabel(session.country), events: events.rows };
}

export async function getAnalyticsOptions(range: AdminDateRange) {
  const values: unknown[] = [siteId()];
  const where = rangeWhere(range, "last_seen_at", ["site_id = $1"], values);
  const result = await query<{ country: string | null; source_channel: string | null; classification: string | null; device_type: string | null }>(
    `select distinct country, source_channel, classification, device_type from analytics_sessions where ${where.join(" and ")} order by country nulls last`,
    values,
  );
  return {
    countries: [...new Set(result.rows.map((row) => row.country).filter(Boolean) as string[])],
    channels: [...new Set(result.rows.map((row) => row.source_channel).filter(Boolean) as string[])],
    classifications: [...new Set(result.rows.map((row) => row.classification).filter(Boolean) as string[])],
    devices: [...new Set(result.rows.map((row) => row.device_type).filter(Boolean) as string[])],
  };
}

export async function getAnalyticsCollectionStatus() {
  const [events, sessions, latest, rules] = await Promise.all([
    query<CountRow>("select count(*)::text as count from analytics_events where site_id=$1", [siteId()]),
    query<CountRow>("select count(*)::text as count from analytics_sessions where site_id=$1", [siteId()]),
    query<{ latest: Date | null }>("select max(occurred_at) as latest from analytics_events where site_id=$1", [siteId()]),
    query<{ id: string; rule_type: string; label: string; created_at: Date; expires_at: Date | null }>("select id,rule_type,label,created_at,expires_at from analytics_exclusion_rules where site_id=$1 and enabled=true order by created_at desc", [siteId()]),
  ]);
  return {
    eventCount: count(events.rows[0]?.count),
    sessionCount: count(sessions.rows[0]?.count),
    latestEventAt: latest.rows[0]?.latest || null,
    rules: rules.rows,
  };
}
