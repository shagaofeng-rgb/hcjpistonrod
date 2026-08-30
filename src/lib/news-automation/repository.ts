import { revalidatePath, revalidateTag } from "next/cache";
import { getPool, hasDatabaseConfig, query } from "@/lib/admin/db";
import { normalizeUrl } from "./rules";
import type { NewsDraft, ScoredCandidate, SiteConfig } from "./types";

type DatabaseCandidate = ScoredCandidate & { id: string };

export async function recordAuditEvent(siteId: string, eventType: string, payload: Record<string, unknown>, severity = "info") {
  if (!hasDatabaseConfig()) return;
  await query(
    `insert into news_audit_events (site_id, event_type, severity, payload)
     values ($1, $2, $3, $4::jsonb)`,
    [siteId, eventType, severity, JSON.stringify(payload)],
  );
}

export async function startIngestRun(siteId: string, cycleStart: string) {
  const result = await query<{ id: string }>(
    `insert into news_ingest_runs (site_id, cycle_start, status, started_at)
     values ($1, $2::timestamptz, 'running', now())
     on conflict (site_id, cycle_start) do update set started_at = excluded.started_at, status = 'running', updated_at = now()
     returning id`,
    [siteId, cycleStart],
  );
  return result.rows[0]?.id;
}

export async function finishIngestRun(id: string | undefined, status: "success" | "failed", details: Record<string, unknown>) {
  if (!id) return;
  await query(
    `update news_ingest_runs set status = $2, details = $3::jsonb, finished_at = now(), updated_at = now() where id = $1`,
    [id, status, JSON.stringify(details)],
  );
}

export async function getRecentSuccessfulIngests(siteId: string, notBefore: string, limit = 4) {
  const result = await query<{ cycle_start: Date; finished_at: Date | null }>(
    `select cycle_start, finished_at from news_ingest_runs
     where site_id = $1 and status = 'success' and finished_at is not null
       and cycle_start >= $2::timestamptz - interval '48 hours'
     order by cycle_start desc limit $3`,
    [siteId, notBefore, limit],
  );
  return result.rows;
}

export async function upsertNewsSource(siteId: string, source: SiteConfig["sources"]["primaryWhitelist"][number]) {
  await query(
    `insert into news_sources (site_id, name, domain, feed_url, source_type, language, priority, is_enabled, terms_note)
     values ($1, $2, $3, $4, $5, 'en', $6, true, 'Allowlisted RSS/API metadata only; no image reuse or full-text republication.')
     on conflict (site_id, domain) where deleted_at is null do update set name = excluded.name, feed_url = excluded.feed_url, source_type = excluded.source_type,
       priority = excluded.priority, is_enabled = true, updated_at = now()`,
    [siteId, source.name, source.domain, source.rssOrApiUrl, source.type, source.sourceTrustScore],
  );
}

export async function updateNewsSourceHealth(siteId: string, domain: string, result: { ok: true } | { ok: false; error: string }) {
  await query(
    `update news_sources set
       last_success_at = case when $3::boolean then now() else last_success_at end,
       last_error = case when $3::boolean then null else $4 end,
       updated_at = now()
     where site_id = $1 and domain = $2 and deleted_at is null`,
    [siteId, domain, result.ok, result.ok ? null : result.error.slice(0, 1000)],
  );
}

export async function upsertCandidate(siteId: string, candidate: ScoredCandidate) {
  const result = await query<{ id: string; status: string }>(
    `insert into news_candidates (
      site_id, source_id, source_name, source_domain, title, normalized_url, source_url, source_published_at,
      source_updated_at, source_author, language, summary, image_url, image_rights, url_hash, title_hash,
      content_fingerprint, score, score_breakdown, status, reject_reason
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19::jsonb, $20, $21
    ) on conflict (site_id, normalized_url) do update set
      title = excluded.title, source_published_at = excluded.source_published_at, source_updated_at = excluded.source_updated_at,
      source_author = excluded.source_author, language = excluded.language, summary = excluded.summary, image_url = excluded.image_url,
      image_rights = excluded.image_rights, title_hash = excluded.title_hash, content_fingerprint = excluded.content_fingerprint,
      score = excluded.score, score_breakdown = excluded.score_breakdown, status = case when news_candidates.status = 'used' then 'used' else excluded.status end,
      reject_reason = excluded.reject_reason, updated_at = now()
    returning id, status`,
    [siteId, candidate.sourceId, candidate.sourceName, candidate.sourceDomain, candidate.title, candidate.normalizedUrl, candidate.url,
      candidate.publishedAt, candidate.updatedAt ?? null, candidate.author ?? null, candidate.language, candidate.summary,
      candidate.imageUrl ?? null, candidate.imageRights, candidate.urlHash, candidate.titleHash, candidate.contentFingerprint,
      candidate.score, JSON.stringify(candidate.scoreBreakdown), candidate.rejectReason ? "rejected" : "candidate", candidate.rejectReason ?? null],
  );
  return result.rows[0];
}

export async function reserveBestCandidate(config: SiteConfig, cycleStart: string, maxAgeHours: number): Promise<DatabaseCandidate | null> {
  const result = await query<DatabaseCandidate>(
    `with selected as (
      select id from news_candidates
      where site_id = $1 and (status = 'candidate' or (status = 'reserved_for_cycle' and reserved_cycle_start = $3::timestamptz))
        and reject_reason is null and source_published_at >= now() - ($2::int || ' hours')::interval
      order by score desc, source_published_at desc, created_at asc limit 1 for update skip locked
    )
    update news_candidates c set status = 'reserved_for_cycle', reserved_cycle_start = $3::timestamptz, updated_at = now()
    from selected where c.id = selected.id
    returning c.id, c.source_id as "sourceId", c.source_name as "sourceName", c.source_domain as "sourceDomain", c.title,
      c.source_url as url, c.normalized_url as "normalizedUrl", c.source_published_at as "publishedAt", c.source_updated_at as "updatedAt",
      c.source_author as author, c.language, c.summary, c.image_url as "imageUrl", c.image_rights as "imageRights",
      c.url_hash as "urlHash", c.title_hash as "titleHash", c.content_fingerprint as "contentFingerprint", c.score, c.score_breakdown as "scoreBreakdown"`,
    [config.siteId, maxAgeHours, cycleStart],
  );
  return result.rows[0] ?? null;
}

export async function getCandidateById(siteId: string, candidateId: string): Promise<DatabaseCandidate | null> {
  const result = await query<DatabaseCandidate>(
    `select id, source_id as "sourceId", source_name as "sourceName", source_domain as "sourceDomain", title,
       source_url as url, normalized_url as "normalizedUrl", source_published_at as "publishedAt", source_updated_at as "updatedAt",
       source_author as author, language, summary, image_url as "imageUrl", image_rights as "imageRights",
       url_hash as "urlHash", title_hash as "titleHash", content_fingerprint as "contentFingerprint", score,
       score_breakdown as "scoreBreakdown"
     from news_candidates where id = $2 and site_id = $1 and deleted_at is null limit 1`,
    [siteId, candidateId],
  );
  return result.rows[0] ?? null;
}

export async function startPublicationRun(siteId: string, cycleStart: string, candidateId: string | null) {
  const result = await query<{ id: string }>(
    `insert into news_publication_runs (site_id, cycle_start, candidate_id, status, started_at)
     values ($1, $2::timestamptz, $3, 'selecting', now())
     on conflict (site_id, cycle_start) do update set candidate_id = coalesce(news_publication_runs.candidate_id, excluded.candidate_id), updated_at = now()
     returning id`,
    [siteId, cycleStart, candidateId],
  );
  return result.rows[0]?.id;
}

export async function getPublicationRun(siteId: string, cycleStart: string) {
  const result = await query<{ id: string; status: string; candidate_id: string | null }>(
    `select id, status, candidate_id from news_publication_runs where site_id = $1 and cycle_start = $2::timestamptz limit 1`,
    [siteId, cycleStart],
  );
  return result.rows[0] ?? null;
}

export async function updatePublicationRun(id: string | undefined, status: string, details: Record<string, unknown>) {
  if (!id) return;
  await query(
    `update news_publication_runs set status = $2, details = $3::jsonb, finished_at = case when $2 in ('published_success','failed') then now() else null end, updated_at = now() where id = $1`,
    [id, status, JSON.stringify(details)],
  );
}

export async function assignPublicationCandidate(id: string | undefined, candidateId: string) {
  if (!id) return;
  await query(
    `update news_publication_runs set candidate_id = $2, updated_at = now() where id = $1`,
    [id, candidateId],
  );
}

export async function clearPublicationCandidate(id: string | undefined) {
  if (!id) return;
  await query(`update news_publication_runs set candidate_id = null, updated_at = now() where id = $1`, [id]);
}

export async function publishNewsArticle(config: SiteConfig, candidate: DatabaseCandidate, draft: NewsDraft, publicationRunId: string) {
  const publicUrl = new URL(`/news/${draft.slug}`, config.siteUrl).toString();
  const result = await query<{ id: string }>(
    `insert into news_articles (
      site_id, title, english_title, slug, author, excerpt, body_html, cover_image_url, image_alt, tags, related_products,
      status, published_at, seo_title, seo_description, canonical_url, robots, og_fields, language, source_title, source_publisher,
      source_author, source_url, canonical_source_url, source_language, source_published_at, source_fetched_at, source_timezone, cover_image_source_url,
      source_fingerprint, content_hash, geo_summary, key_takeaways, automation_notes, content_channel, auto_publish_approved,
      auto_published_at, editorial_disclaimer, news_publication_run_id
    ) values (
      $1, $2, $2, $3, $4, $5, $6, '/images/factory/chrome-rod-stock.jpg', $2, $7::jsonb, $8::jsonb,
      'published', now(), $2, $9, $10, 'index,follow', $11::jsonb, $12, $13, $13, $14, $15, $15, $12, $16::timestamptz, now(), $17,
      'owned:hcj-factory-asset', $18, $19, $20, $21::jsonb, 'news-automation-v2', 'news', true, now(), $22, $23
    ) on conflict (site_id, slug) where news_articles.deleted_at is null do update set
      title = excluded.title, english_title = excluded.english_title, excerpt = excluded.excerpt, body_html = excluded.body_html,
      seo_title = excluded.seo_title, seo_description = excluded.seo_description, canonical_url = excluded.canonical_url, og_fields = excluded.og_fields,
      source_title = excluded.source_title, source_publisher = excluded.source_publisher, source_author = excluded.source_author,
      source_url = excluded.source_url, canonical_source_url = excluded.canonical_source_url, source_published_at = excluded.source_published_at,
      source_fetched_at = excluded.source_fetched_at, source_fingerprint = excluded.source_fingerprint, content_hash = excluded.content_hash,
      geo_summary = excluded.geo_summary, key_takeaways = excluded.key_takeaways, editorial_disclaimer = excluded.editorial_disclaimer,
      cover_image_source_url = excluded.cover_image_source_url,
      news_publication_run_id = excluded.news_publication_run_id, content_channel = 'news', status = 'published', updated_at = now()
    returning id`,
    [config.siteId, draft.title, draft.slug, config.news.defaultAuthorType, draft.excerpt, draft.bodyHtml,
      JSON.stringify(["industry news", candidate.sourceDomain]), JSON.stringify(draft.relatedProductSlug ? [draft.relatedProductSlug] : []), draft.description,
      publicUrl, JSON.stringify({ title: draft.title, description: draft.description, image: "/images/factory/chrome-rod-stock.jpg" }), config.publicationLanguage,
      candidate.sourceName, candidate.author ?? null, candidate.normalizedUrl, candidate.publishedAt, config.timezone,
      candidate.contentFingerprint, candidate.contentFingerprint, draft.excerpt, JSON.stringify(["Independent editorial summary", "Original source and publication date are displayed on this page."]),
      draft.editorialDisclaimer, publicationRunId],
  );
  const articleId = result.rows[0]?.id;
  if (!articleId) throw new Error("News CMS did not return an article id");
  return { articleId, publicUrl };
}

export async function markCandidateUsed(siteId: string, candidateId: string, articleId: string) {
  await query(
    `update news_candidates set status = 'used', used_article_id = $3, updated_at = now()
     where id = $1 and site_id = $2 and status = 'reserved_for_cycle'`,
    [candidateId, siteId, articleId],
  );
}

export async function markCandidateRetry(siteId: string, candidateId: string, reason: string) {
  await query(`update news_candidates set status = 'retry_pending', reject_reason = $3, updated_at = now() where id = $1 and site_id = $2`, [candidateId, siteId, reason]);
}

export async function recordDeliveryCheck(input: { siteId: string; publicationRunId: string; articleId: string; listUrl: string; detailUrl: string; listStatus: number; detailStatus: number; verified: boolean; details: Record<string, unknown> }) {
  await query(
    `insert into news_delivery_checks (site_id, publication_run_id, article_id, list_url, detail_url, list_status, detail_status, verified, details, checked_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,now())`,
    [input.siteId, input.publicationRunId, input.articleId, input.listUrl, input.detailUrl, input.listStatus, input.detailStatus, input.verified, JSON.stringify(input.details)],
  );
}

export async function verifyPublicNewsDelivery(config: SiteConfig, draft: NewsDraft, articleId: string, publicationRunId: string, fetchImpl: typeof fetch = fetch) {
  const listUrl = new URL(config.news.listRoute, config.siteUrl).toString();
  const detailUrl = new URL(`/news/${draft.slug}`, config.siteUrl).toString();
  const attempts = 4;
  let last = { listStatus: 0, detailStatus: 0, titleInList: false, titleInDetail: false, sourceVisible: false, disclaimerVisible: false };

  // Vercel can serve the previous list response for a moment after a tag/path
  // revalidation. A single immediate check creates a false failure even when
  // the published page is already correct, so verify the public delivery over
  // a short bounded window before asking the retry worker to run again.
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const [list, detail] = await Promise.all([fetchImpl(listUrl, { cache: "no-store" }), fetchImpl(detailUrl, { cache: "no-store" })]);
    const [listHtml, detailHtml] = await Promise.all([list.text(), detail.text()]);
    last = {
      listStatus: list.status,
      detailStatus: detail.status,
      titleInList: listHtml.includes(draft.title),
      titleInDetail: detailHtml.includes(draft.title),
      sourceVisible: detailHtml.includes(draft.sourcePanel.url),
      disclaimerVisible: detailHtml.includes(draft.editorialDisclaimer),
    };
    const verified = list.ok && detail.ok && last.titleInList && last.titleInDetail && last.sourceVisible && last.disclaimerVisible;
    if (verified || attempt === attempts) {
      await recordDeliveryCheck({
        siteId: config.siteId,
        publicationRunId,
        articleId,
        listUrl,
        detailUrl,
        listStatus: last.listStatus,
        detailStatus: last.detailStatus,
        verified,
        details: { ...last, attempts: attempt },
      });
      return { verified, listUrl, detailUrl, listStatus: last.listStatus, detailStatus: last.detailStatus };
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
  }

  throw new Error("unreachable_news_delivery_verification_state");
}

export async function invalidateNewsCaches(config: SiteConfig, slug: string) {
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/news-sitemap.xml");
  revalidatePath("/sitemap.xml");
  revalidateTag(`site:${config.siteId}:news`, { expire: 0 });
}

export async function withPublicationLock<T>(siteId: string, cycleStart: string, work: () => Promise<T>) {
  if (!hasDatabaseConfig()) throw new Error("Database is not configured");
  const client = await getPool().connect();
  const key = `news:publish:${siteId}:${cycleStart}`;
  try {
    const lock = await client.query<{ locked: boolean }>("select pg_try_advisory_lock(hashtextextended($1, 0)) as locked", [key]);
    if (!lock.rows[0]?.locked) throw new Error("news_publish_lock_unavailable");
    return await work();
  } finally {
    await client.query("select pg_advisory_unlock(hashtextextended($1, 0))", [key]).catch(() => undefined);
    client.release();
  }
}

export { normalizeUrl };
