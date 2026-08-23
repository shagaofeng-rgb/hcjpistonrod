import { createHmac } from "node:crypto";
import { query } from "@/lib/admin/db";
import { getSiteConfig } from "@/lib/news-automation/config";

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|lighthouse|pagespeed|headless|playwright|puppeteer|selenium|codex/i;
const TEST_PATTERN = /(^|[-_./\s])(test|qa|dev|staging|preview|codex|playwright|puppeteer|collect)([-_./\s]|$)/i;
const INTERNAL_PATH_PATTERN = /^(?:\/admin(?:\/|$)|\/api(?:\/|$)|\/_next(?:\/|$))/;
const PRODUCTION_HOSTS = new Set(["hcjpistonrod.com", "www.hcjpistonrod.com"]);

export type VisitorEventInput = {
  eventName: "page_view" | "rfq_open" | "contact_click";
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  language?: string;
  visitorId: string;
  sessionId: string;
  utm?: Record<string, string>;
  webdriver?: boolean;
};

export type VisitorRequestContext = {
  host: string;
  ip: string;
  userAgent: string;
  country?: string;
};

export type ExclusionRule = {
  rule_type: string;
  match_value: string;
};

function clean(value: string | undefined, length = 500) {
  return (value || "").trim().slice(0, length);
}

function safePath(value: string) {
  try {
    const parsed = new URL(value, "https://www.hcjpistonrod.com");
    return `${parsed.pathname}${parsed.search}`.slice(0, 700);
  } catch {
    return "/";
  }
}

export function analyticsHash(value: string) {
  const secret = process.env.ANALYTICS_HASH_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Analytics hashing is not configured.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function maskIp(value: string) {
  const ip = clean(value, 128);
  if (!ip) return null;
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return parts.length >= 3 ? `${parts.slice(0, 3).join(":")}:*` : "IPv6:*";
  }
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.*` : null;
}

export function parseUserAgent(userAgent: string) {
  const normalized = clean(userAgent, 1000);
  const device = /ipad|tablet/i.test(normalized) ? "tablet" : /mobile|android|iphone|ipod/i.test(normalized) ? "mobile" : "desktop";
  const browser = /edg\//i.test(normalized) ? "Edge" : /firefox\//i.test(normalized) ? "Firefox" : /chrome\//i.test(normalized) && !/edg\//i.test(normalized) ? "Chrome" : /safari\//i.test(normalized) && !/chrome\//i.test(normalized) ? "Safari" : "Other";
  const os = /windows/i.test(normalized) ? "Windows" : /android/i.test(normalized) ? "Android" : /iphone|ipad|ios/i.test(normalized) ? "iOS" : /mac os/i.test(normalized) ? "macOS" : /linux/i.test(normalized) ? "Linux" : "Other";
  return { device, browser, os };
}

export function classifyTraffic(referrer: string | undefined, utm: Record<string, string>, host: string) {
  const source = clean(utm.utm_source || utm.source, 120).toLowerCase();
  if (source) return { channel: "campaign", referrerHost: null };
  if (!referrer) return { channel: "direct", referrerHost: null };
  try {
    const url = new URL(referrer);
    const referrerHost = url.hostname.toLowerCase();
    if (referrerHost === host.toLowerCase() || referrerHost === "www." + host.replace(/^www\./, "")) return { channel: "direct", referrerHost: null };
    if (/google\.|bing\.com|yahoo\.|duckduckgo\.com|baidu\.com|yandex\./i.test(referrerHost)) return { channel: "organic_search", referrerHost };
    if (/linkedin\.com|facebook\.com|instagram\.com|youtube\.com|x\.com|twitter\.com/i.test(referrerHost)) return { channel: "social", referrerHost };
    return { channel: "referral", referrerHost };
  } catch {
    return { channel: "direct", referrerHost: null };
  }
}

export function exclusionReason(input: VisitorEventInput, context: VisitorRequestContext, rules: ExclusionRule[] = []) {
  const path = safePath(input.pagePath);
  const userAgent = clean(context.userAgent, 1000);
  const host = clean(context.host).toLowerCase();
  const utmSource = clean(input.utm?.utm_source || input.utm?.source).toLowerCase();
  const visitorHash = analyticsHash(clean(input.visitorId, 200));
  const ipHash = context.ip ? analyticsHash(context.ip) : "";

  if (!PRODUCTION_HOSTS.has(host)) return "non_production_host";
  if (INTERNAL_PATH_PATTERN.test(path)) return "internal_path";
  if (input.webdriver || BOT_PATTERN.test(userAgent)) return "automated_client";
  if (TEST_PATTERN.test(utmSource) || TEST_PATTERN.test(userAgent)) return "test_marker";

  const active = rules.some((rule) => {
    if (rule.rule_type === "ip_hash") return rule.match_value === ipHash;
    if (rule.rule_type === "visitor_hash") return rule.match_value === visitorHash;
    if (rule.rule_type === "user_agent") return userAgent.toLowerCase().includes(rule.match_value.toLowerCase());
    if (rule.rule_type === "host") return host === rule.match_value.toLowerCase();
    if (rule.rule_type === "utm_source") return utmSource === rule.match_value.toLowerCase();
    if (rule.rule_type === "path") return path.startsWith(rule.match_value);
    return false;
  });
  return active ? "admin_exclusion_rule" : null;
}

function classificationFor(visitNumber: number, pageViews: number, conversions: number) {
  if (conversions > 0) return "lead";
  if (pageViews >= 3) return "engaged";
  return visitNumber > 1 ? "returning" : "new";
}

async function incrementCollectionRollup(outcome: "accepted" | "excluded", reason: string, eventName: string) {
  const siteId = getSiteConfig().siteId;
  await query(
    `insert into analytics_collection_rollups (site_id, rollup_hour, outcome, reason, event_name, event_count)
     values ($1, date_trunc('hour', now()), $2, $3, $4, 1)
     on conflict (site_id, rollup_hour, outcome, reason, event_name)
     do update set event_count = analytics_collection_rollups.event_count + 1, updated_at = now()`,
    [siteId, outcome, reason, eventName],
  );
}

export async function collectVisitorEvent(input: VisitorEventInput, context: VisitorRequestContext) {
  const siteId = getSiteConfig().siteId;
  const rules = await query<ExclusionRule>(
    "select rule_type, match_value from analytics_exclusion_rules where site_id = $1 and enabled = true and (expires_at is null or expires_at > now())",
    [siteId],
  );
  const reason = exclusionReason(input, context, rules.rows);
  if (reason) {
    await incrementCollectionRollup("excluded", reason, input.eventName);
    return { accepted: false as const, reason };
  }

  const pagePath = safePath(input.pagePath);
  const visitorHash = analyticsHash(clean(input.visitorId, 200));
  const sessionHash = analyticsHash(clean(input.sessionId, 200));
  const ipHash = analyticsHash(context.ip);
  const ipMasked = maskIp(context.ip);
  const traffic = classifyTraffic(input.referrer, input.utm || {}, context.host);
  const agent = parseUserAgent(context.userAgent);
  const country = clean(context.country, 8).toUpperCase() || null;
  const language = clean(input.language, 30) || null;

  const sessionInsert = await query<{ id: string }>(
    `insert into analytics_sessions
      (site_id, visitor_id_hash, session_id_hash, visit_number, landing_path, last_page_path, country, source_channel, referrer_host, device_type, browser, os, language, ip_hash, ip_masked)
     values ($1,$2,$3,0,$4,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     on conflict (site_id, session_id_hash) do nothing
     returning id`,
    [siteId, visitorHash, sessionHash, pagePath, country, traffic.channel, traffic.referrerHost, agent.device, agent.browser, agent.os, language, ipHash, ipMasked],
  );
  const isNewSession = Boolean(sessionInsert.rows[0]);
  let visitNumber = 1;
  let conversionCount = 0;

  if (isNewSession) {
    const visitor = await query<{ visit_count: number; conversion_count: number }>(
      `insert into analytics_visitors
        (site_id, visitor_id_hash, first_seen_at, last_seen_at, visit_count, country, source_channel, referrer_host, device_type, browser, os, language, ip_hash, ip_masked)
       values ($1,$2,now(),now(),1,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       on conflict (site_id, visitor_id_hash)
       do update set last_seen_at = now(), visit_count = analytics_visitors.visit_count + 1, country = coalesce(excluded.country, analytics_visitors.country), source_channel = coalesce(excluded.source_channel, analytics_visitors.source_channel), referrer_host = coalesce(excluded.referrer_host, analytics_visitors.referrer_host), device_type = excluded.device_type, browser = excluded.browser, os = excluded.os, language = coalesce(excluded.language, analytics_visitors.language), ip_hash = excluded.ip_hash, ip_masked = excluded.ip_masked, updated_at = now()
       returning visit_count, conversion_count`,
      [siteId, visitorHash, country, traffic.channel, traffic.referrerHost, agent.device, agent.browser, agent.os, language, ipHash, ipMasked],
    );
    visitNumber = visitor.rows[0]?.visit_count || 1;
    conversionCount = visitor.rows[0]?.conversion_count || 0;
    const classification = classificationFor(visitNumber, 1, conversionCount);
    await query("update analytics_sessions set visit_number=$3, classification=$4, page_views=1, updated_at=now() where site_id=$1 and session_id_hash=$2", [siteId, sessionHash, visitNumber, classification]);
    await query("update analytics_visitors set classification=$3, updated_at=now() where site_id=$1 and visitor_id_hash=$2", [siteId, visitorHash, classification]);
  } else {
    const current = await query<{ visit_number: number; page_views: number; conversion_count: number }>(
      "update analytics_sessions set last_seen_at=now(), last_page_path=$3, page_views=page_views+1, updated_at=now() where site_id=$1 and session_id_hash=$2 returning visit_number, page_views, conversion_count",
      [siteId, sessionHash, pagePath],
    );
    visitNumber = current.rows[0]?.visit_number || 1;
    conversionCount = current.rows[0]?.conversion_count || 0;
    const classification = classificationFor(visitNumber, current.rows[0]?.page_views || 1, conversionCount);
    await query("update analytics_sessions set classification=$3 where site_id=$1 and session_id_hash=$2", [siteId, sessionHash, classification]);
    await query("update analytics_visitors set last_seen_at=now(), classification=$3, updated_at=now() where site_id=$1 and visitor_id_hash=$2", [siteId, visitorHash, classification]);
  }

  await query(
    `insert into analytics_events
      (site_id, event_name, page_url, visitor_id_hash, session_id_hash, visitor_sequence, landing_path, referrer_host, ip_hash, ip_masked, request_host, country, language, device_type, os, browser, source_channel, utm, consent_status, event_source)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,'legitimate_interest','first-party')`,
    [siteId, input.eventName, pagePath, visitorHash, sessionHash, visitNumber, pagePath, traffic.referrerHost, ipHash, ipMasked, context.host, country, language, agent.device, agent.os, agent.browser, traffic.channel, JSON.stringify(input.utm || {})],
  );
  await incrementCollectionRollup("accepted", "accepted", input.eventName);
  return { accepted: true as const, visitNumber };
}

export async function recordInquiryConversion(ipHash: string | null, submissionId: string) {
  if (!ipHash) return;
  const siteId = getSiteConfig().siteId;
  const visitor = await query<{ visitor_id_hash: string; conversion_count: number }>(
    "update analytics_visitors set conversion_count=conversion_count+1, classification='lead', updated_at=now() where site_id=$1 and ip_hash=$2 and last_seen_at > now() - interval '30 days' returning visitor_id_hash, conversion_count",
    [siteId, ipHash],
  );
  if (!visitor.rows[0]) return;
  await query(
    "update analytics_sessions set conversion_count=conversion_count+1, classification='lead', updated_at=now() where id = (select id from analytics_sessions where site_id=$1 and visitor_id_hash=$2 order by last_seen_at desc limit 1)",
    [siteId, visitor.rows[0].visitor_id_hash],
  );
  await query(
    `insert into analytics_events (site_id,event_name,visitor_id_hash,ip_hash,event_source,consent_status,utm)
     values ($1,'rfq_submitted',$2,$3,'rfq','legitimate_interest',$4::jsonb)`,
    [siteId, visitor.rows[0].visitor_id_hash, ipHash, JSON.stringify({ submission_id: submissionId })],
  );
}
