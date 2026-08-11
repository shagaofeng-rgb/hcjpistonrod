# HCJ Controlled Content Operations

## Purpose and storage

This system is for HCJ piston rods, chrome plated rods, honed tubes and related hydraulic components. It uses the existing PostgreSQL database, not the Vercel filesystem, and does not alter existing public News or Blog content. Its single code-owned catalog is `src/lib/content-ops/catalog.ts`; it maps approved product facts, existing product URLs and owned image assets. Runtime copies are recorded in the `content_ops_*` tables for auditability.

The collector stores only minimal allowlisted source metadata. It does not bypass robots, credentials, paywalls or anti-bot controls, and it does not copy articles or hotlink outside images. A generated draft is stored only in `content_ops_article_records` with `status = draft`; that table is not read by the public content routes or sitemap builder.

## Schedule and safeguards

Vercel runs `news-ingest` daily at `01:15 UTC` and `article-cycle` every second day at `01:25 UTC`. These are 09:15 and 09:25 in Asia/Shanghai while China Standard Time remains UTC+8. Each route requires `Authorization: Bearer $CRON_SECRET`.

The default production state is deliberately inert:

```text
CONTENT_OPS_ENABLED=false
CONTENT_OPS_DRY_RUN=true
PUBLISH_MODE=draft_only
AUTO_PUBLISH=false
CONTENT_OPS_CHANNEL=news
```

All four conditions must be explicitly changed before any publication adapter can run. In this site, a validated record is published through the existing PostgreSQL content CMS to `CONTENT_OPS_CHANNEL` (`news` by default), which keeps the public page, canonical URL and sitemap in the same content source. A generated draft must also pass source, product-scope, factual-claim, duplication, content-quality, link, image-rights and SEO validation. Product performance, certification, dimensions, standards and customer claims are not generated without an approved product fact and a project-specific source.

## Local dry run and review

```bash
pnpm content:dry-run
pnpm test:content
```

The dry run writes three HCJ examples and audit JSON files to `content/operations/dry-runs/`. They remain outside public routes and sitemaps. Review them in the protected `/admin/content-ops` view after the database migration, then use the existing manual editorial review procedure before public publication.

## Source and asset governance

Add a source only after verifying its official/public URL, permitted access, date metadata and B2B relevance. Company announcements may be stored as context but cannot independently prove an HCJ claim. All images require an HCJ-owned, licensed or explicitly verified-open-license asset record; external-news images fail validation.

## Publishing, rollback and emergency stop

The optional GitHub adapter is server-only and needs a GitHub fine-grained token limited to repository Contents read/write. It is not the active publishing path because this site already has a PostgreSQL content CMS. The CMS publisher is idempotent by article slug, records the public CMS ID in `content_ops_article_records`, writes a publishing log, and revalidates the configured public channel and sitemap paths after a successful production request.

To stop every content task immediately, set `CONTENT_OPS_ENABLED=false` in Vercel. To return a record to a non-public state, change the linked `news_articles.status` to `draft`, then set its `content_ops_article_records.status` to `draft` and clear `published_at`/`published_article_id`/`source_commit`; no audit record is deleted. The pre-change Git tag and logical database snapshot recorded in the deployment report provide rollback references.

## Search Console

Search Console remains optional and uses the existing sitemap integration only when real authorized credentials exist. No Google Indexing API is used for articles, and the system never claims that a page has been indexed without verified Search Console data.
