# News Automation Implementation and Verification

Implementation timestamp: 2026-08-11 Asia/Shanghai. Production activation update: 2026-08-11 Asia/Shanghai.

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

## Production activation and live verification

- Fresh logical production backup: `backups/hcj-admin-logical-20260811T052349519Z.json`.
- Migration `011_news_site_isolation` was applied once in a database transaction. Verification: 11 scoped `news_articles`, 10 scoped historical operation records, 0 unscoped articles, 1 `news_site_configs` row and 1 applied migration-ledger row.
- Git commits `3416b8d` and `345672e` were pushed to `main` and deployed. The current Vercel production deployment `dpl_4KBSjT5Zn6z9MwoPCERbhBmSWnqk` is `Ready` and aliases both production domains.
- Production `NEWS_AUTOMATION_ENABLED` and `NEWS_AUTOMATION_SITE_ID` are configured. `NEWS_AUTOMATION_PRODUCTION_ENABLED=false` is explicitly configured, so 12-hour ingestion may run but News publication cannot occur accidentally.
- Production route evidence: legacy `/api/cron/article-cycle` returns HTTP 410; `/robots.txt` advertises the three independent sitemap routes; News API contained only News and Blog API contained only Blog before historical content governance.
- Public self-check passed on `https://www.hcjpistonrod.com`: 22 key routes, 4 sitemap-index documents, 25 primary index/Blog URLs and 1 News URL were checked for HTTP status, titles, H1s, canonical tags, XML format, sitemap host/canonical integrity and source panel presence.
- The one historical self-sourced automatic News page was retained but changed to `noindex,follow`. It remains recoverable from the backup and direct URL, but is no longer eligible for News list or sitemap output.

## Still blocked / cannot be claimed yet

- Production has no configured `OPENAI_API_KEY` and no `NEWS_EDITORIAL_MODEL`. The 48-hour publisher therefore cannot compose a compliant 700-1,000 word attributed News summary, and publication is intentionally disabled rather than faked.
- A real successful 48-hour publication cycle, its `news_delivery_checks` record, an unauthenticated browser check of a newly published News card/detail page, and its News RSS/sitemap appearance remain unverified until a valid, billable OpenAI API key and model name are supplied through Vercel.
- Search Console credential health and actual submission response were not re-tested; the existing 72-hour throttle remains unchanged.

## Production activation checklist (requires explicit authorization)

1. In Vercel only, add a valid `OPENAI_API_KEY` and `NEWS_EDITORIAL_MODEL`; then change `NEWS_AUTOMATION_PRODUCTION_ENABLED` from `false` to `true` and redeploy. Do not place these credentials in the repository or report.
2. Confirm the allowlisted RSS endpoints, their terms/robots status and the active product-theme URLs. Do not activate on missing or expired source approval.
3. Run four controlled ingest executions in the correct 12-hour logical windows, then one publish-controller run. Do not bypass the quality gate.
4. Use an unauthenticated browser plus HTTP requests to verify the new News list, detail page, canonical, JSON-LD, News RSS/sitemap and absence from Blog API/list/sitemap. Preserve the `news_delivery_checks` record.
5. Confirm the next publish controller call in the same 48-hour cycle returns `cycle_already_published` and creates no second article.

## Rollback

Use `07-rollback-plan.md`, the Git tag `pre-news-unification-audit-20260811-1125`, and `backups/hcj-admin-logical-20260811T033928032Z.json`. Disable only `NEWS_AUTOMATION_PRODUCTION_ENABLED` first; do not delete articles, candidates, audit rows or Blog content as a rollback mechanism.
