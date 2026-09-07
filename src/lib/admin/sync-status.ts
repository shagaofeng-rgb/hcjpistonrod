import { getSiteConfig, validateSiteConfig } from "@/lib/news-automation/config";
import { getSearchConsoleConfiguration } from "@/lib/sitemap/google";
import { query } from "./db";

export type AdminSyncSourceRecord = {
  id: string;
  code: string;
  name: string;
  source_type: string;
  config_status: string;
  connection_status: string;
  last_success_at: Date | null;
  next_run_at: Date | null;
  updated_at: Date;
  created_at: Date;
};

type NewsRunStatusRow = {
  latest_ingest_status: string | null;
  latest_ingest_at: Date | null;
  last_ingest_success_at: Date | null;
  latest_publication_status: string | null;
  latest_publication_at: Date | null;
  last_publication_success_at: Date | null;
};

type SitemapRunStatusRow = {
  status: string;
  finished_at: Date | null;
  search_console_attempted: boolean;
  search_console_success: boolean;
  search_console_result: string | null;
};

function nextIntervalAfter(value: Date | null, intervalHours: number, now = new Date()) {
  if (!value) return null;
  const intervalMs = intervalHours * 3_600_000;
  let timestamp = value.getTime() + intervalMs;
  while (timestamp <= now.getTime()) timestamp += intervalMs;
  return new Date(timestamp);
}

function ageHours(value: Date | null, now = new Date()) {
  return value ? (now.getTime() - value.getTime()) / 3_600_000 : Number.POSITIVE_INFINITY;
}

export async function getNewsAutomationRuntimeStatus(now = new Date()): Promise<AdminSyncSourceRecord> {
  const config = getSiteConfig();
  const validation = validateSiteConfig(config);
  const enabled = validation.valid
    && config.enabled
    && config.news.enabled
    && process.env.NEWS_AUTOMATION_ENABLED === "true"
    && config.publishing.productionEnabled;

  const result = await query<NewsRunStatusRow>(
    `select
       (select status from news_ingest_runs where site_id = $1 order by cycle_start desc limit 1) as latest_ingest_status,
       (select coalesce(finished_at, updated_at) from news_ingest_runs where site_id = $1 order by cycle_start desc limit 1) as latest_ingest_at,
       (select finished_at from news_ingest_runs where site_id = $1 and status = 'success' and finished_at is not null order by cycle_start desc limit 1) as last_ingest_success_at,
       (select status from news_publication_runs where site_id = $1 order by cycle_start desc limit 1) as latest_publication_status,
       (select coalesce(finished_at, updated_at) from news_publication_runs where site_id = $1 order by cycle_start desc limit 1) as latest_publication_at,
       (select finished_at from news_publication_runs where site_id = $1 and status = 'published_success' and finished_at is not null order by cycle_start desc limit 1) as last_publication_success_at`,
    [config.siteId],
  );
  const row = result.rows[0];
  const ingestSuccess = row?.last_ingest_success_at ? new Date(row.last_ingest_success_at) : null;
  const publicationSuccess = row?.last_publication_success_at ? new Date(row.last_publication_success_at) : null;
  const latestIngestAt = row?.latest_ingest_at ? new Date(row.latest_ingest_at) : null;
  const latestPublicationAt = row?.latest_publication_at ? new Date(row.latest_publication_at) : null;
  const successes = [ingestSuccess, publicationSuccess].filter((value): value is Date => Boolean(value));
  const lastSuccessAt = successes.length ? new Date(Math.max(...successes.map((value) => value.getTime()))) : null;

  let connectionStatus = "connected";
  if (!validation.valid) connectionStatus = "configuration_error";
  else if (!enabled) connectionStatus = "disabled";
  else if (!ingestSuccess || !publicationSuccess) connectionStatus = "waiting_for_first_success";
  else if (row?.latest_ingest_status === "failed" || row?.latest_publication_status === "failed") connectionStatus = "degraded";
  else if (ageHours(ingestSuccess, now) > config.news.ingestIntervalHours * 2.2
    || ageHours(publicationSuccess, now) > config.news.publishIntervalHours * 1.5) connectionStatus = "stale";

  return {
    id: "news-automation-runtime",
    code: "news-automation",
    name: "行业新闻自动化",
    source_type: "rss-to-news",
    config_status: validation.valid && enabled ? "configured" : validation.valid ? "disabled" : "invalid",
    connection_status: connectionStatus,
    last_success_at: lastSuccessAt,
    next_run_at: enabled ? nextIntervalAfter(latestIngestAt || ingestSuccess, config.news.ingestIntervalHours, now) : null,
    updated_at: latestIngestAt || latestPublicationAt || now,
    created_at: latestIngestAt || latestPublicationAt || now,
  };
}

export async function getSearchConsoleRuntimeStatus(now = new Date()): Promise<AdminSyncSourceRecord> {
  const configuration = getSearchConsoleConfiguration();
  const result = await query<SitemapRunStatusRow>(
    `select status, finished_at, search_console_attempted, search_console_success, search_console_result
     from sitemap_runs
     order by finished_at desc nulls last, started_at desc
     limit 8`,
  );
  const runs = result.rows;
  const latestRun = runs[0] || null;
  const latestSuccessfulSubmission = runs.find((row) => row.search_console_attempted && row.search_console_success) || null;
  const latestFailedSubmission = runs.find((row) => row.search_console_attempted && !row.search_console_success) || null;
  const lastSuccessAt = latestSuccessfulSubmission?.finished_at ? new Date(latestSuccessfulSubmission.finished_at) : null;
  const latestAt = latestRun?.finished_at ? new Date(latestRun.finished_at) : now;
  const threeDaysMs = 72 * 3_600_000;
  let connectionStatus = "connected";
  let configStatus = "configured";

  if (!configuration.enabled) {
    connectionStatus = "disabled";
    configStatus = "disabled";
  } else if (!configuration.ready) {
    connectionStatus = configuration.productionSafe ? "configuration_error" : "unsafe_credential_path";
    configStatus = "invalid";
  } else if (latestFailedSubmission && (!lastSuccessAt || new Date(latestFailedSubmission.finished_at || 0) > lastSuccessAt)) {
    connectionStatus = "degraded";
  } else if (!lastSuccessAt) {
    connectionStatus = "waiting_for_first_submission";
  } else if (now.getTime() - lastSuccessAt.getTime() > threeDaysMs * 2) {
    connectionStatus = "stale";
  } else if (!latestRun?.search_console_attempted) {
    connectionStatus = "waiting_for_sitemap_change";
  }

  return {
    id: "google-search-console-runtime",
    code: "google-search-console",
    name: "Google Search Console 站点地图提交",
    source_type: "search-console-sitemap",
    config_status: configStatus,
    connection_status: connectionStatus,
    last_success_at: lastSuccessAt,
    next_run_at: configuration.enabled ? new Date(latestAt.getTime() + threeDaysMs) : null,
    updated_at: latestAt,
    created_at: latestAt,
  };
}

export async function getAdminSyncSourceRecords() {
  const [stored, news, searchConsole] = await Promise.all([
    query<AdminSyncSourceRecord>(
      `select id::text, code, name, source_type, config_status, connection_status,
         last_success_at, next_run_at, updated_at, created_at
       from sync_sources where code <> 'news-automation' order by updated_at desc`,
    ),
    getNewsAutomationRuntimeStatus(),
    getSearchConsoleRuntimeStatus(),
  ]);
  return [news, searchConsole, ...stored.rows.filter((row) => row.code !== "google-search-console")];
}
