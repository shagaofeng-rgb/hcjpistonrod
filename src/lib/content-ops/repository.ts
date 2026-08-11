import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { hasDatabaseConfig, query } from "@/lib/admin/db";
import { site } from "@/lib/site";
import { approvedProductFacts, ownedAssets } from "./catalog";
import { renderControlledMarkdown } from "./markdown";
import type { ArticleBrief, ArticleDraft, ContentChannel, DraftValidation, NewsSource, Topic } from "./types";

type StoredArticle = { title: string; markdown: string; topic: Topic; status: "draft" | "approved" | "published" };

export async function recentContentArticles(limit = 50): Promise<StoredArticle[]> {
  if (!hasDatabaseConfig()) return [];
  const result = await query<{ title: string; markdown: string; brief: ArticleBrief; status: StoredArticle["status"] }>(
    `select title, markdown, brief, status
     from content_ops_article_records
     where status in ('draft', 'approved', 'published')
     order by created_at desc
     limit $1`,
    [limit],
  );
  return result.rows.map((row) => ({ title: row.title, markdown: row.markdown, topic: row.brief, status: row.status }));
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

type PublishResult = { ok: true; articleId: string; publicArticleId: string; url: string } | { ok: false; reason: string };

async function technicalGuidesCategoryId() {
  const result = await query<{ id: string }>(
    `insert into news_categories (name, english_name, slug, sort_order, is_enabled)
     values ('Technical Guides', 'Technical Guides', 'technical-guides', 80, true)
     on conflict (slug) do update set english_name = excluded.english_name, is_enabled = true, updated_at = now()
     returning id`,
  );
  return result.rows[0]?.id ?? null;
}

export async function publishControlledArticle(input: { articleId: string; draft: ArticleDraft; contentHash: string; titleHash: string; channel: ContentChannel }): Promise<PublishResult> {
  if (!hasDatabaseConfig()) return { ok: false, reason: "Database publishing is not configured" };

  try {
    const categoryId = await technicalGuidesCategoryId();
    const image = input.draft.imagePlan[0];
    const asset = image ? ownedAssets.find((item) => item.id === image.assetId) : null;
    if (!image || !asset) return { ok: false, reason: "A verified owned cover image is required" };

    const publicUrl = `${site.domain}/${input.channel}/${input.draft.slug}`;
    const published = await query<{ id: string }>(
      `insert into news_articles (
        category_id, title, english_title, slug, author, excerpt, body_html, cover_image_url, image_alt,
        tags, related_products, status, published_at, seo_title, seo_description, seo_keywords, canonical_url,
        robots, og_fields, language, source_title, source_publisher, source_author, source_url,
        canonical_source_url, source_language, source_published_at, source_fetched_at, source_timezone,
        source_fingerprint, content_hash, geo_summary, key_takeaways, primary_keyword, secondary_keywords,
        automation_notes, content_channel, auto_publish_approved, auto_published_at
      ) values (
        $1, $2, $2, $3, 'XIJIU Editorial Team', $4, $5, $6, $7,
        $8::jsonb, $9::jsonb, 'published', now(), $2, $10, $11, $12,
        'index,follow', $13::jsonb, 'en', $2, $14, 'XIJIU Editorial Team', $12,
        $12, 'en', now(), now(), 'Asia/Shanghai',
        $15, $16, $17, $18::jsonb, $19, $20::jsonb,
        'Controlled content operations: published only after deterministic source, claims, duplication, link, image and SEO checks.',
        $21, true, now()
      )
      on conflict (slug) do update set
        title = excluded.title, english_title = excluded.english_title, excerpt = excluded.excerpt,
        body_html = excluded.body_html, cover_image_url = excluded.cover_image_url, image_alt = excluded.image_alt,
        tags = excluded.tags, related_products = excluded.related_products, status = 'published', published_at = coalesce(news_articles.published_at, now()),
        seo_title = excluded.seo_title, seo_description = excluded.seo_description, seo_keywords = excluded.seo_keywords,
        canonical_url = excluded.canonical_url, robots = excluded.robots, og_fields = excluded.og_fields,
        source_fingerprint = excluded.source_fingerprint, content_hash = excluded.content_hash,
        geo_summary = excluded.geo_summary, key_takeaways = excluded.key_takeaways,
        primary_keyword = excluded.primary_keyword, secondary_keywords = excluded.secondary_keywords,
        automation_notes = excluded.automation_notes, content_channel = excluded.content_channel, auto_publish_approved = true,
        auto_published_at = now(), updated_at = now()
      returning id`,
      [
        categoryId, input.draft.title, input.draft.slug, input.draft.excerpt, renderControlledMarkdown(input.draft.markdown), asset.path, image.alt,
        JSON.stringify([input.draft.brief.primaryKeyword, ...input.draft.brief.secondaryKeywords]), JSON.stringify([input.draft.brief.productSlug]),
        input.draft.description, input.draft.brief.primaryKeyword, publicUrl,
        JSON.stringify({ title: input.draft.title, description: input.draft.description, image: asset.path }), site.brandName,
        input.titleHash, input.contentHash, input.draft.excerpt,
        JSON.stringify([input.draft.brief.uniqueAngle, "Project-specific technical confirmation is required before production."]),
        input.draft.brief.primaryKeyword, JSON.stringify(input.draft.brief.secondaryKeywords), input.channel,
      ],
    );
    const publicArticleId = published.rows[0]?.id;
    if (!publicArticleId) return { ok: false, reason: "The CMS did not return a published article id" };

    await query(
      `update content_ops_article_records
       set status = 'published', published_at = coalesce(published_at, now()), published_article_id = $2, source_commit = $3, updated_at = now()
       where id = $1`,
      [input.articleId, publicArticleId, `cms:news_articles:${publicArticleId}`],
    );
    let cacheRevalidated = true;
    try {
      revalidatePath(`/${input.channel}`);
      revalidatePath(`/${input.channel}/${input.draft.slug}`);
      revalidatePath("/sitemap.xml");
      revalidatePath("/sitemap-posts.xml");
    } catch (error) {
      cacheRevalidated = false;
      console.warn("[content-ops] CMS article was published but cache invalidation was unavailable", {
        slug: input.draft.slug,
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
    await query(
      `insert into content_ops_publishing_logs (article_id, action, status, details)
       values ($1, 'cms_publish', 'success', $2::jsonb)`,
      [input.articleId, JSON.stringify({ publicArticleId, publicUrl, channel: input.channel, mode: "controlled-auto", cacheRevalidated })],
    );
    return { ok: true, articleId: input.articleId, publicArticleId, url: publicUrl };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown CMS publishing error";
    try {
      await query(
        `insert into content_ops_publishing_logs (article_id, action, status, details)
         values ($1, 'cms_publish', 'failed', $2::jsonb)`,
        [input.articleId, JSON.stringify({ reason })],
      );
    } catch {
      // Preserve the original publishing error when audit logging is unavailable.
    }
    return { ok: false, reason };
  }
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
