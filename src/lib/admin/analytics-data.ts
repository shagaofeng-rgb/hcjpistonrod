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
  const where = rangeWhere(range, "v.last_seen_at", ["v.site_id = $1"], values);
  if (filters.country) {
    values.push(filters.country.toUpperCase());
    where.push(`v.country = $${values.length}`);
  }
  if (filters.channel) {
    values.push(filters.channel);
    where.push(`v.source_channel = $${values.length}`);
  }
  if (filters.classification) {
    values.push(filters.classification);
    where.push(`v.classification = $${values.length}`);
  }
  if (filters.device) {
    values.push(filters.device);
    where.push(`v.device_type = $${values.length}`);
  }
  if (filters.keyword) {
    values.push(`%${filters.keyword}%`);
    where.push(`(v.ip_masked ilike $${values.length} or coalesce(v.referrer_host,'') ilike $${values.length} or exists (select 1 from analytics_sessions s where s.site_id=v.site_id and s.visitor_id_hash=v.visitor_id_hash and (s.landing_path ilike $${values.length} or s.last_page_path ilike $${values.length})))`);
  }
  const whereSql = where.join(" and ");
  const [totalResult, rowsResult] = await Promise.all([
    query<CountRow>(`select count(*)::text as count from analytics_visitors v where ${whereSql}`, values),
    query<{ id: string; first_seen_at: Date; last_seen_at: Date; visit_number: number; landing_path: string | null; last_page_path: string | null; country: string | null; source_channel: string | null; initial_source_channel: string | null; referrer_host: string | null; device_type: string | null; browser: string | null; page_views: string; conversion_count: number; classification: string; ip_masked: string | null; session_count: string }>(
      `with selected_visitors as (
         select v.id,v.site_id,v.visitor_id_hash,v.first_seen_at,v.last_seen_at,v.visit_count,v.country,v.source_channel,v.referrer_host,v.device_type,v.browser,v.conversion_count,v.classification,v.ip_masked
         from analytics_visitors v where ${whereSql} order by v.last_seen_at desc limit $${values.length + 1} offset $${values.length + 2}
       ), session_rollup as (
         select s.site_id,s.visitor_id_hash,
           (array_agg(s.landing_path order by s.first_seen_at asc))[1] as landing_path,
           (array_agg(s.last_page_path order by s.last_seen_at desc))[1] as last_page_path,
           (array_agg(s.source_channel order by s.first_seen_at asc))[1] as initial_source_channel,
           sum(s.page_views)::text as page_views,count(*)::text as session_count
         from analytics_sessions s join selected_visitors v on v.site_id=s.site_id and v.visitor_id_hash=s.visitor_id_hash
         group by s.site_id,s.visitor_id_hash
       ) select v.id,v.first_seen_at,v.last_seen_at,v.visit_count as visit_number,r.landing_path,r.last_page_path,v.country,v.source_channel,r.initial_source_channel,v.referrer_host,v.device_type,v.browser,coalesce(r.page_views,'0') as page_views,v.conversion_count,v.classification,v.ip_masked,coalesce(r.session_count,'0') as session_count
       from selected_visitors v left join session_rollup r on r.site_id=v.site_id and r.visitor_id_hash=v.visitor_id_hash order by v.last_seen_at desc`,
      [...values, filters.pageSize, (filters.page - 1) * filters.pageSize],
    ),
  ]);
  return {
    total: count(totalResult.rows[0]?.count),
    rows: rowsResult.rows.map((row) => ({ ...row, page_views: count(row.page_views), session_count: count(row.session_count), countryLabel: countryLabel(row.country) })),
  };
}

export async function getVisitorSessionDetail(id: string) {
  let visitorResult = await query<{ id: string; visitor_id_hash: string; first_seen_at: Date; last_seen_at: Date; visit_count: number; country: string | null; source_channel: string | null; referrer_host: string | null; device_type: string | null; browser: string | null; os: string | null; language: string | null; conversion_count: number; classification: string; ip_masked: string | null }>(
    `select id,visitor_id_hash,first_seen_at,last_seen_at,visit_count,country,source_channel,referrer_host,device_type,browser,os,language,conversion_count,classification,ip_masked from analytics_visitors where id=$1 and site_id=$2 limit 1`,
    [id, siteId()],
  );
  if (!visitorResult.rows[0]) {
    const legacySession = await query<{ visitor_id_hash: string }>("select visitor_id_hash from analytics_sessions where id=$1 and site_id=$2 limit 1", [id, siteId()]);
    if (legacySession.rows[0]) {
      visitorResult = await query("select id,visitor_id_hash,first_seen_at,last_seen_at,visit_count,country,source_channel,referrer_host,device_type,browser,os,language,conversion_count,classification,ip_masked from analytics_visitors where visitor_id_hash=$1 and site_id=$2 limit 1", [legacySession.rows[0].visitor_id_hash, siteId()]);
    }
  }
  const visitor = visitorResult.rows[0];
  if (!visitor) return null;
  const [sessions, events, inquiries] = await Promise.all([
    query<{ id: string; first_seen_at: Date; last_seen_at: Date; visit_number: number; landing_path: string | null; last_page_path: string | null; page_views: number; conversion_count: number; source_channel: string | null; referrer_host: string | null; device_type: string | null; browser: string | null }>(
      `select id,first_seen_at,last_seen_at,visit_number,landing_path,last_page_path,page_views,conversion_count,source_channel,referrer_host,device_type,browser from analytics_sessions where site_id=$1 and visitor_id_hash=$2 order by first_seen_at asc`,
      [siteId(), visitor.visitor_id_hash],
    ),
    query<{ id: string; event_name: string; page_url: string | null; occurred_at: Date; source_channel: string | null; referrer_host: string | null; session_id_hash: string | null; utm: Record<string, string> }>(
      `select id,event_name,page_url,occurred_at,source_channel,referrer_host,session_id_hash,coalesce(utm, '{}'::jsonb) as utm from analytics_events where site_id=$1 and visitor_id_hash=$2 order by occurred_at asc`,
      [siteId(), visitor.visitor_id_hash],
    ),
    query<{ id: string; form_number: string; status: string; submitted_at: Date }>(
      `select id,form_number,status,submitted_at from form_submissions where visitor_id_hash=$1 and archived_at is null order by submitted_at asc`,
      [visitor.visitor_id_hash],
    ),
  ]);
  const pageViews = sessions.rows.reduce((total, session) => total + session.page_views, 0);
  return {
    ...visitor,
    visit_number: visitor.visit_count,
    page_views: pageViews,
    session_count: sessions.rows.length,
    countryLabel: countryLabel(visitor.country),
    sessions: sessions.rows,
    events: events.rows,
    inquiries: inquiries.rows,
  };
}

export async function getAnalyticsOptions(range: AdminDateRange) {
  const values: unknown[] = [siteId()];
  const where = rangeWhere(range, "last_seen_at", ["site_id = $1"], values);
  const result = await query<{ country: string | null; source_channel: string | null; classification: string | null; device_type: string | null }>(
    `select distinct country, source_channel, classification, device_type from analytics_visitors where ${where.join(" and ")} order by country nulls last`,
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
