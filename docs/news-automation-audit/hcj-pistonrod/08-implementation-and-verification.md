# News Automation Implementation and Verification

Implementation timestamp: 2026-08-11 Asia/Shanghai.

## Scope completed in the working tree

- Replaced the former generic content-operation publisher with a site-scoped `src/lib/news-automation/` workflow.
- Added an additive, unexecuted migration: `db/migrations/011_news_site_isolation.sql`.
- Added the stable `hcj-pistonrod` configuration, isolated News and Blog routes, cache tags, admin filters, APIs, RSS and sitemaps.
- Retired the legacy `/api/cron/article-cycle` publisher with an explicit HTTP 410 response. It cannot publish a Blog or News entry.
- Changed Vercel schedule source code to two 12-hour ingest ticks and 12-hour publish-controller ticks. The controller has a 48-hour site-timezone cycle gate, so a successful cycle cannot publish twice.
- Kept all historical `news_articles` and `content_ops_*` records. No historical publication, redirect, noindex decision or source field was changed.

## New task contract

| Task | Source code | Schedule when deployed | Permitted effects |
| --- | --- | --- | --- |
| Ingest | `src/app/api/cron/news-ingest/route.ts` | `15 1,13 * * *` UTC | Fetch primary allowlisted RSS metadata, validate, normalize, deduplicate, score and store candidates/audit events only |
| Publish controller | `src/app/api/cron/news-publish/route.ts` | `25 1,13 * * *` UTC | Requires four successful recent ingests, uses 48-hour `Asia/Shanghai` cycle lock, selects one candidate, uses fallback sources only when needed, publishes News only, then verifies public list/detail HTML |
| Sitemap | `src/app/api/cron/sitemap/route.ts` | `20 2 */3 * *` UTC | Maintains sitemap data and respects its independent 72-hour Search Console submission guard |

The publish controller exits successfully without creating another article when the current 48-hour cycle is already `published_success`. It records `retry_pending` rather than a false success if public delivery cannot be verified.

## Frontend acceptance built into the publish path

`verifyPublicNewsDelivery()` records list/detail URLs, HTTP status, timestamp and the visibility of title, original-source URL and editorial disclaimer in `news_delivery_checks`. It is the only transition path to `published_success`.

The published News template now includes an original-source panel, original publication/fetch dates, author, owned-neutral image-rights statement for new automated articles and an editorial disclaimer. JSON-LD now uses the site publication date for `datePublished` and the external URL for `isBasedOn`.

## Test evidence

| Check | Command / result |
| --- | --- |
| Lint | `pnpm lint` passed |
| Existing content safety tests | `pnpm test:content`: 5 passed |
| New configuration/window/scoring tests | `pnpm exec tsx --test tests/news-automation.test.ts`: 7 passed |
| Sitemap tests | `pnpm test:sitemap`: 10 passed |
| Admin password tests | `pnpm test:admin`: 2 passed |
| Production compilation without a database | `DATABASE_URL='' pnpm build` passed; 47 routes generated, including `/admin/blog`, `/api/blog/*`, `/api/cron/news-*` and independent sitemap routes |
| Local legacy-publisher guard | `GET /api/cron/article-cycle` returned `410 Gone` |
| Local Blog sitemap compatibility | `GET /sitemap-posts.xml` returned `308` to `/blog-sitemap.xml`; the new route returned `200` |
| Local cron safety | An unsigned `GET /api/cron/news-ingest` returned `503` because no local cron secret was configured; it did not invoke a task |

## Not executed / cannot be claimed yet

- Migration 011 has **not** been run against the production database.
- No production environment variable, Vercel cron, CMS record, cache, News list/detail page, Search Console submission or third-party source has been changed in this task.
- A real 48-hour publication cycle and browser verification of a newly published production News item cannot be claimed until production deployment is explicitly authorized and valid production secrets are available.
- The historical content triage in `04-existing-content-triage.csv` is a review record. Its `update` decisions require a human editorial decision before any historical page is changed.

## Production activation checklist (requires explicit authorization)

1. Create a fresh logical database backup with `pnpm db:backup` and retain the resulting path.
2. Review and apply migration 011 once through the existing migration runner; verify the migration ledger and new `site_id` backfill.
3. Configure `NEWS_AUTOMATION_ENABLED=true`, `NEWS_AUTOMATION_PRODUCTION_ENABLED=true`, `NEWS_AUTOMATION_SITE_ID=hcj-pistonrod`, `NEWS_EDITORIAL_MODEL`, `OPENAI_API_KEY`, `CRON_SECRET` and the existing alert target only in secure production environment variables.
4. Confirm the allowlisted RSS endpoints, their terms/robots status and the active product-theme URLs. Do not activate on missing or expired source approval.
5. Deploy the code and `vercel.json`; verify no legacy `article-cycle` schedule remains.
6. Run four controlled ingest executions in the correct 12-hour logical windows, then one publish-controller run. Do not bypass the quality gate.
7. Use an unauthenticated browser plus HTTP requests to verify the new News list, detail page, canonical, JSON-LD, News RSS/sitemap and absence from Blog API/list/sitemap. Preserve the `news_delivery_checks` record.
8. Confirm the next publish controller call in the same 48-hour cycle returns `cycle_already_published` and creates no second article.

## Rollback

Use `07-rollback-plan.md`, the Git tag `pre-news-unification-audit-20260811-1125`, and `backups/hcj-admin-logical-20260811T033928032Z.json`. Disable only `NEWS_AUTOMATION_PRODUCTION_ENABLED` first; do not delete articles, candidates, audit rows or Blog content as a rollback mechanism.
