import { randomUUID } from "node:crypto";
import { hasDatabaseConfig, query } from "@/lib/admin/db";
import { approvedProductFacts, ownedAssets } from "./catalog";
import type { ArticleBrief, ArticleDraft, DraftValidation, NewsSource, Topic } from "./types";

type StoredArticle = { title: string; markdown: string; topic: Topic };

export async function recentContentArticles(limit = 50): Promise<StoredArticle[]> {
  if (!hasDatabaseConfig()) return [];
  const result = await query<{ title: string; markdown: string; brief: ArticleBrief }>(
    `select title, markdown, brief
     from content_ops_article_records
     where status in ('draft', 'approved', 'published')
     order by created_at desc
     limit $1`,
    [limit],
  );
  return result.rows.map((row) => ({ title: row.title, markdown: row.markdown, topic: row.brief }));
}

export async function storeRun(kind: "news_ingest" | "article_cycle", status: "success" | "skipped" | "failed", details: Record<string, unknown>) {
  if (!hasDatabaseConfig()) return null;
  const result = await query<{ id: string }>(
    `insert into content_ops_runs (run_type, status, details, started_at, finished_at)
     values ($1, $2, $3::jsonb, now(), now()) returning id`,
    [kind, status, JSON.stringify(details)],
  );
  return result.rows[0]?.id ?? null;
}

export async function storeNewsSources(sources: NewsSource[]) {
  if (!hasDatabaseConfig()) return;
  for (const source of sources) {
    await query(
      `insert into content_ops_news_sources (id, name, url, feed_url, source_type, allowlisted, is_enabled)
       values ($1, $2, $3, $4, $5, $6, true)
       on conflict (url) do update set name = excluded.name, source_type = excluded.source_type,
       allowlisted = excluded.allowlisted, updated_at = now()`,
      [source.id, source.name, source.url, source.feedUrl ?? null, source.sourceType, source.allowlisted],
    );
  }
}

export async function syncGovernedCatalog() {
  if (!hasDatabaseConfig()) return;
  for (const fact of approvedProductFacts) {
    await query(
      `insert into content_ops_product_facts (id, product_id, claim, source_document_id, source_location, approved)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set claim = excluded.claim, source_document_id = excluded.source_document_id,
       source_location = excluded.source_location, approved = excluded.approved, updated_at = now()`,
      [fact.id, fact.productId, fact.claim, fact.sourceDocumentId, fact.sourceLocation, fact.approved],
    );
  }
  for (const asset of ownedAssets) {
    await query(
      `insert into content_ops_assets (id, path, ownership, alt)
       values ($1, $2, $3, $4)
       on conflict (id) do update set path = excluded.path, ownership = excluded.ownership, alt = excluded.alt, updated_at = now()`,
      [asset.id, asset.path, asset.ownership, asset.alt],
    );
  }
}

export async function storeDraft(draft: ArticleDraft, validation: DraftValidation, contentHash: string, titleHash: string) {
  if (!hasDatabaseConfig()) return { id: randomUUID(), stored: false };
  const result = await query<{ id: string }>(
    `insert into content_ops_article_records
      (slug, title, description, excerpt, markdown, brief, faq, claims, citations, internal_links, image_plan, validation, status, content_hash, title_hash, source_commit)
     values
      ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, 'draft', $13, $14, 'dry-run')
     on conflict (slug) do update set title = excluded.title, description = excluded.description, excerpt = excluded.excerpt,
      markdown = excluded.markdown, brief = excluded.brief, faq = excluded.faq, claims = excluded.claims,
      citations = excluded.citations, internal_links = excluded.internal_links, image_plan = excluded.image_plan,
      validation = excluded.validation, content_hash = excluded.content_hash, title_hash = excluded.title_hash,
      updated_at = now()
     returning id`,
    [
      draft.slug, draft.title, draft.description, draft.excerpt, draft.markdown, JSON.stringify(draft.brief), JSON.stringify(draft.faq),
      JSON.stringify(draft.claims), JSON.stringify(draft.citations), JSON.stringify(draft.internalLinks), JSON.stringify(draft.imagePlan),
      JSON.stringify(validation), contentHash, titleHash,
    ],
  );
  return { id: result.rows[0]?.id ?? randomUUID(), stored: true };
}

export async function addCandidate(input: { sourceId: string; title: string; url: string; publishedAt: string; summary: string; relevanceReason: string; industries: string[]; productFamilies: string[] }) {
  if (!hasDatabaseConfig()) return null;
  const result = await query<{ id: string }>(
    `insert into content_ops_news_items
      (source_id, title, url, published_at, summary, industries, product_families, relevance_reason, status)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, 'candidate')
     on conflict (url) do update set summary = excluded.summary, relevance_reason = excluded.relevance_reason, updated_at = now()
     returning id`,
    [input.sourceId, input.title, input.url, input.publishedAt, input.summary, JSON.stringify(input.industries), JSON.stringify(input.productFamilies), input.relevanceReason],
  );
  return result.rows[0]?.id ?? null;
}

export async function rollbackDraft(articleId: string) {
  if (!hasDatabaseConfig()) return false;
  const result = await query(
    `update content_ops_article_records set status = 'draft', published_at = null, source_commit = null, updated_at = now() where id = $1`,
    [articleId],
  );
  return result.rowCount === 1;
}
