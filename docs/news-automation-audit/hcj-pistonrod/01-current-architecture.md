# HCJ News Automation: Current Architecture Audit

Audit timestamp: 2026-08-11 11:41 Asia/Shanghai (03:41 UTC)

## Scope and evidence

- Repository: `shagaofeng-rgb/hcjpistonrod`, branch `main`, baseline commit `a501f09`.
- Rollback tag: `pre-news-unification-audit-20260811-1125`.
- Logical PostgreSQL snapshot: `backups/hcj-admin-logical-20260811T033928032Z.json`.
- Production deployment has **not** been changed as part of this audit.
- Database connection succeeded. Database time zone was `GMT`; the site content configuration currently uses `Asia/Shanghai`.

## Current public content design

The public site has distinct routes and server queries for `/news/*` and `/blog/*`, but both read `news_articles` and use `content_channel` (`news` or `blog`) as their boundary. This is an acceptable temporary storage mechanism only if every query, cache key, sitemap and automation path carries both `site_id` and `content_channel`; the current implementation does not yet have `site_id`.

| Layer | Current implementation | Audit result |
| --- | --- | --- |
| News routes | `/news`, `/news/[slug]`, `/api/news/*`, `/news/rss.xml` | Channel-filtered, but no `site_id` filter |
| Blog routes | `/blog`, `/blog/[slug]` | Channel-filtered, but no dedicated API |
| News data | `news_articles` with `content_channel='news'` | Shares table/cache with Blog |
| Blog data | `news_articles` with `content_channel='blog'` | Shares table/cache with News |
| Candidate data | `content_ops_news_items` | No source fingerprint, score, lock, or site partition |
| Automation records | `content_ops_*` tables | No explicit ingest/publish state machines |
| Public sitemaps | combined `sitemap-posts.xml` plus `news-sitemap.xml` | No independent Blog sitemap; News sitemap uses the source date rather than a controlled News publication rule |
| RSS | `/news/rss.xml`; `/blog/rss.xml` re-exports the News route | **Defect:** Blog RSS currently emits News entries |

## Current automation design

- `runNewsIngest()` fetches four code-owned RSS sources and stores minimal candidates. It does not currently write public articles, but it accepts items up to `NEWS_MAX_AGE_DAYS` (default 90 days), applies no industry score, and has no `site_id` scope.
- `runArticleCycle()` selects a hard-coded HCJ product topic, generates a deterministic internal selection guide, and can publish it to an environment-selected channel. This violates the required News definition because the output is not based on a selected verified external candidate.
- The publisher writes a successful CMS log before any HTTP/browser delivery verification. The latest published News run recorded `cacheRevalidated: false` while still reporting success.
- The publisher can be switched to `blog` by `CONTENT_OPS_CHANNEL`; the recent run log proves that it published a Blog entry on 2026-08-11. This conflicts with the new requirement that News automation never invokes Blog publication.

## Database baseline

The applied migration ledger contains `001_admin_foundation` through `010_product_category_content`. Relevant current counts:

| Channel | Status / robots | Count |
| --- | --- | ---: |
| Blog | published / index,follow | 6 |
| News | published / index,follow | 1 |
| News | published / noindex,follow | 3 |
| News | draft / index,follow | 1 |

There are 19 rows in `content_ops_news_items`, all `candidate`; their observed range is 2026-05-13 through 2026-08-06. None meets the required default 72-hour freshness window at audit time. `content_ops_news_sources` has four enabled rows, but two have no RSS endpoint and two entries share the NIST domain.

## Confirmed defects and design gaps

1. The production schedule is daily ingest plus a calendar-based every-second-day publishing run, not a 12-hour ingest and rolling 48-hour publication controller.
2. Publishing is driven by a hard-coded product catalog rather than a verified external News candidate.
3. `site_id` does not exist on content, candidates, sources, logs, caches or publication records, so cross-site isolation cannot be proven.
4. News and Blog share one table, public cache tag and combined sitemap. The table may remain shared only with strict `site_id`, `content_channel`, independent query paths and independent sitemap/RSS outputs.
5. Blog RSS is incorrectly aliased to News RSS.
6. The existing release state machine has no distributed lock, bounded retry ledger, frontend delivery check, or `published_success` state that depends on public visibility.
7. The ingest collector currently accepts stale candidate dates and records no normalized URL hash, title hash, content fingerprint, quality score, rejection reason, copyright status or source-health result.
8. The current News detail template contains inquiry CTA and related-product controls. Automated external News must use a dedicated editorial rendering path without promotion or inquiry CTA.

## Retained components

- Existing public `/news` and `/blog` routes and historical content.
- Existing PostgreSQL content store and migration ledger.
- Protected cron authentication through `CRON_SECRET`.
- Existing sitemap maintenance and its 72-hour Google Search Console submission guard.
- Existing owned image registry, where an owned neutral image is suitable only as a clearly non-event supporting asset.
