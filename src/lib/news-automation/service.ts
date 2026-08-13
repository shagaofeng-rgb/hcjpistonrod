import { XMLParser } from "fast-xml-parser";
import { composeEditorialNews, validateNewsDraft } from "./composer";
import { getActiveProductTheme, getSiteConfig, validateSiteConfig } from "./config";
import { currentWindowStart, scoreCandidate } from "./rules";
import { assignPublicationCandidate, finishIngestRun, getPublicationRun, getRecentSuccessfulIngests, invalidateNewsCaches, markCandidateRetry, markCandidateUsed, publishNewsArticle, recordAuditEvent, reserveBestCandidate, startIngestRun, startPublicationRun, updatePublicationRun, upsertCandidate, upsertNewsSource, verifyPublicNewsDelivery, withPublicationLock } from "./repository";
import type { CandidateInput, SiteConfig, SiteNewsSource } from "./types";

type RunResult = { ok: boolean; skipped?: boolean; reason?: string; details: Record<string, unknown> };

function automationEnabled(config: SiteConfig) {
  return config.enabled && config.news.enabled && process.env.NEWS_AUTOMATION_ENABLED === "true";
}

function rssRequestHeaders(config: SiteConfig) {
  return {
    "user-agent": `${config.brandName} News Collector/2.0 (+${config.siteUrl})`,
    accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
    "accept-language": `${config.locale},en;q=0.9`,
  };
}

function itemValue(item: Record<string, unknown>, key: string) {
  const value = item[key];
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "#text" in value && typeof value["#text"] === "string") return value["#text"];
  return "";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function sourceDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`;
}

function parseWordPressItems(payload: string, source: SiteNewsSource, config: SiteConfig): CandidateInput[] | null {
  try {
    const raw = JSON.parse(payload) as unknown;
    if (!Array.isArray(raw)) return null;
    return raw.map((item) => {
      const record = item as { link?: unknown; date_gmt?: unknown; modified_gmt?: unknown; title?: { rendered?: unknown }; excerpt?: { rendered?: unknown } };
      return {
        sourceId: source.id,
        sourceName: source.name,
        sourceDomain: source.domain,
        title: stripHtml(typeof record.title?.rendered === "string" ? record.title.rendered : ""),
        url: typeof record.link === "string" ? record.link.trim() : "",
        publishedAt: sourceDate(record.date_gmt),
        updatedAt: sourceDate(record.modified_gmt) || undefined,
        author: null,
        language: config.publicationLanguage,
        summary: stripHtml(typeof record.excerpt?.rendered === "string" ? record.excerpt.rendered : "").slice(0, 3000),
        imageRights: "not-used" as const,
      };
    }).filter((item) => Boolean(item.title && item.url && item.publishedAt));
  } catch {
    return null;
  }
}

export function parseFeedItems(payload: string, source: SiteNewsSource, config: SiteConfig): CandidateInput[] {
  const wordPressItems = parseWordPressItems(payload, source, config);
  if (wordPressItems) return wordPressItems;
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(payload) as { rss?: { channel?: { item?: Record<string, unknown>[] | Record<string, unknown> } }; feed?: { entry?: Record<string, unknown>[] | Record<string, unknown> } };
  const raw = parsed.rss?.channel?.item ?? parsed.feed?.entry ?? [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items.map((item) => {
    const link = itemValue(item, "link") || (typeof item.link === "object" && item.link && "@_href" in item.link && typeof item.link["@_href"] === "string" ? item.link["@_href"] : "");
    return {
      sourceId: source.id,
      sourceName: source.name,
      sourceDomain: source.domain,
      title: itemValue(item, "title").trim(),
      url: link.trim(),
      publishedAt: sourceDate(itemValue(item, "pubDate") || itemValue(item, "published") || itemValue(item, "updated")),
      updatedAt: sourceDate(itemValue(item, "updated")) || undefined,
      author: itemValue(item, "author") || null,
      language: config.publicationLanguage,
      summary: stripHtml(itemValue(item, "description") || itemValue(item, "summary")).slice(0, 3000),
      imageRights: "not-used" as const,
    };
  }).filter((item) => Boolean(item.title && item.url && item.publishedAt));
}

export async function runNewsIngest(siteId?: string, fetchImpl: typeof fetch = fetch): Promise<RunResult> {
  const config = getSiteConfig(siteId);
  const configCheck = validateSiteConfig(config);
  if (!configCheck.valid) return { ok: false, reason: "invalid_site_configuration", details: { errors: configCheck.errors } };
  if (!automationEnabled(config)) return { ok: true, skipped: true, reason: "NEWS_AUTOMATION_ENABLED is false", details: { siteId: config.siteId, candidates: 0 } };
  const cycleStart = currentWindowStart(new Date(), config.news.ingestIntervalHours, config.timezone);
  const runId = await startIngestRun(config.siteId, cycleStart);
  const sources = config.sources.primaryWhitelist;
  let retained = 0;
  let rejected = 0;
  const errors: string[] = [];
  try {
    for (const source of sources) {
      await upsertNewsSource(config.siteId, source);
      try {
        const response = await fetchImpl(source.rssOrApiUrl, { headers: rssRequestHeaders(config), signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        for (const raw of parseFeedItems(await response.text(), source, config)) {
          const candidate = scoreCandidate(raw, config);
          await upsertCandidate(config.siteId, candidate);
          if (candidate.rejectReason) rejected += 1; else retained += 1;
        }
      } catch (error) {
        errors.push(`${source.id}: ${error instanceof Error ? error.message : "unknown_error"}`);
      }
    }
    const healthySources = sources.length - errors.length;
    const details = { siteId: config.siteId, cycleStart, sources: sources.length, healthySources, retained, rejected, errors, publishCalled: false };
    const status = healthySources > 0 ? "success" : "failed";
    await finishIngestRun(runId, status, details);
    await recordAuditEvent(config.siteId, "news_ingest_completed", details, errors.length ? "warning" : "info");
    return { ok: healthySources > 0, details };
  } catch (error) {
    const details = { siteId: config.siteId, cycleStart, retained, rejected, errors: [...errors, error instanceof Error ? error.message : "unknown_error"], publishCalled: false };
    await finishIngestRun(runId, "failed", details);
    await recordAuditEvent(config.siteId, "news_ingest_failed", details, "error");
    return { ok: false, details };
  }
}

async function collectFallbackCandidates(config: SiteConfig, fetchImpl: typeof fetch) {
  let retained = 0;
  let rejected = 0;
  const errors: string[] = [];
  for (const source of config.sources.fallbackWhitelist) {
    await upsertNewsSource(config.siteId, source);
    try {
      const response = await fetchImpl(source.rssOrApiUrl, { headers: rssRequestHeaders(config), signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      for (const raw of parseFeedItems(await response.text(), source, config)) {
        const candidate = scoreCandidate(raw, config);
        await upsertCandidate(config.siteId, candidate);
        if (candidate.rejectReason) rejected += 1; else retained += 1;
      }
    } catch (error) {
      errors.push(`${source.id}: ${error instanceof Error ? error.message : "unknown_error"}`);
    }
  }
  const details = { siteId: config.siteId, sourceTier: "fallback", sources: config.sources.fallbackWhitelist.length, retained, rejected, errors, publishCalled: false };
  await recordAuditEvent(config.siteId, "news_fallback_collection_completed", details, errors.length ? "warning" : "info");
  return details;
}

export async function runNewsPublish(siteId?: string, fetchImpl: typeof fetch = fetch): Promise<RunResult> {
  const config = getSiteConfig(siteId);
  const configCheck = validateSiteConfig(config);
  if (!configCheck.valid) return { ok: false, reason: "invalid_site_configuration", details: { errors: configCheck.errors } };
  if (!automationEnabled(config) || !config.publishing.productionEnabled) return { ok: true, skipped: true, reason: "News publication is not enabled for production", details: { siteId: config.siteId } };
  const cycleStart = currentWindowStart(new Date(), config.news.publishIntervalHours, config.timezone);
  return withPublicationLock(config.siteId, cycleStart, async () => {
    const existing = await getPublicationRun(config.siteId, cycleStart);
    if (existing?.status === "published_success") {
      return { ok: true, skipped: true, reason: "cycle_already_published", details: { siteId: config.siteId, cycleStart, publicationRunId: existing.id } };
    }
    const theme = getActiveProductTheme(config);
    if (!theme) return { ok: false, reason: "no_active_product_theme", details: { siteId: config.siteId, cycleStart } };
    const publicationRunId = await startPublicationRun(config.siteId, cycleStart, existing?.candidate_id ?? null);
    const recentIngests = await getRecentSuccessfulIngests(config.siteId, cycleStart);
    if (recentIngests.length < 4) {
      const details = { siteId: config.siteId, cycleStart, reason: "insufficient_successful_ingest_coverage", successfulIngests: recentIngests.length };
      await updatePublicationRun(publicationRunId, "retry_pending", details);
      await recordAuditEvent(config.siteId, "news_publish_waiting_for_ingest_coverage", details, "warning");
      return { ok: false, reason: "insufficient_successful_ingest_coverage", details };
    }
    let candidate = await reserveBestCandidate(config, cycleStart);
    if (!candidate) {
      const fallbackDetails = await collectFallbackCandidates(config, fetchImpl);
      candidate = await reserveBestCandidate(config, cycleStart);
      if (!candidate) {
        const details = { siteId: config.siteId, cycleStart, reason: "no_eligible_candidate", themeId: theme.themeId, fallback: fallbackDetails };
        await updatePublicationRun(publicationRunId, "failed", details);
        await recordAuditEvent(config.siteId, "news_publish_failed", details, "critical");
        return { ok: false, reason: "no_eligible_candidate", details };
      }
    }
    await assignPublicationCandidate(publicationRunId, candidate.id);
    try {
      await updatePublicationRun(publicationRunId, "composing", { candidateId: candidate.id, themeId: theme.themeId });
      const draft = await composeEditorialNews(candidate, config, fetchImpl);
      const quality = validateNewsDraft(draft, candidate, config);
      if (!quality.passed) {
        const details = { candidateId: candidate.id, themeId: theme.themeId, qualityFailures: quality.failures };
        await markCandidateRetry(config.siteId, candidate.id, quality.failures.join(","));
        await updatePublicationRun(publicationRunId, "failed", details);
        await recordAuditEvent(config.siteId, "news_publish_preflight_failed", details, "critical");
        return { ok: false, reason: "preflight_failed", details };
      }
      await updatePublicationRun(publicationRunId, "publishing", { candidateId: candidate.id, slug: draft.slug });
      const published = await publishNewsArticle(config, candidate, draft, publicationRunId!);
      await invalidateNewsCaches(config, draft.slug);
      await updatePublicationRun(publicationRunId, "frontend_verifying", { ...published });
      const delivery = await verifyPublicNewsDelivery(config, draft, published.articleId, publicationRunId!, fetchImpl);
      if (!delivery.verified) {
        const details = { ...published, delivery };
        await updatePublicationRun(publicationRunId, "retry_pending", details);
        await recordAuditEvent(config.siteId, "news_frontend_verification_failed", details, "critical");
        return { ok: false, reason: "frontend_verification_failed", details };
      }
      const details = { ...published, delivery, candidateId: candidate.id, themeId: theme.themeId };
      await markCandidateUsed(config.siteId, candidate.id, published.articleId);
      await updatePublicationRun(publicationRunId, "published_success", details);
      await recordAuditEvent(config.siteId, "news_publish_success", details);
      return { ok: true, details };
    } catch (error) {
      const details = { candidateId: candidate.id, error: error instanceof Error ? error.message : "unknown_error" };
      await markCandidateRetry(config.siteId, candidate.id, details.error);
      await updatePublicationRun(publicationRunId, "retry_pending", details);
      await recordAuditEvent(config.siteId, "news_publish_exception", details, "critical");
      return { ok: false, details };
    }
  });
}
