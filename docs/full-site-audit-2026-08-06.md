# HCJ production full-site audit - 2026-08-06

Scope: `https://www.hcjpistonrod.com`, production Vercel deployment, the connected PostgreSQL database, Vercel Blob integration, cron routes, generated sitemaps, and the public/admin HTTP surface. All timestamps below are UTC unless marked otherwise. No application records were deleted and no sample data was added.

## Backup and rollback record

- Code baseline: annotated Git tag `audit-preflight-20260806` at commit `6f25d05`.
- Logical database snapshot: `backups/hcj-admin-logical-20260806T013814113Z.json` (37 tables; local file permissions `600`). The host does not provide `pg_dump`, so this is an application-level JSON snapshot rather than a physical PostgreSQL dump.
- Vercel environment variable names (values excluded): `backups/vercel-env-names-20260806.txt` (permissions `600`).
- Sensitive cron-key rotation metadata: `backups/cron-secret-*.txt` (values excluded; permissions `600`).
- Restore code by deploying the tagged baseline or `git revert b763b5e` and deploying to production. Database recovery requires a controlled maintenance session with PostgreSQL tooling; do not replay the JSON snapshot blindly because foreign-key ordering must be observed.

## Production release

- Active production deployment: `dpl_833XqRF1RTw1qUydUEpNtFGKUbyb`.
- Inspect URL: `https://vercel.com/davidsha/hcjpistonrod/833XqRF1RTw1qUydUEpNtFGKUbyb`.
- Ready at 2026-08-06 11:03 CST; aliases verified for both `hcjpistonrod.com` and `www.hcjpistonrod.com`.
- Functional source commit: `b763b5e Separate blog automation and rate limit Google submissions`.

## Confirmed healthy

- Database connection, active migrations, core table reads, foreign-key orphan checks, and key indexes completed successfully. The logical snapshot contained 37 tables, 1 real inquiry, 7 news records, 98 news-job records, 28 sitemap-run records, 13 products, and 23 media records.
- Orphan checks returned zero for lead ownership, news category/product links, user roles, sessions, invalid published news, and duplicate canonical URLs.
- Production health endpoint reported database connected, private Vercel Blob connected, Vercel Web Analytics enabled, and News configuration enabled.
- Object storage had previously passed an actual private write/delete check. This audit did not create a persistent production file.
- `pnpm test:news`: 9/9 passing; `pnpm test:sitemap`: 9/9 passing; `pnpm lint`: passing; production Next build: passing.
- Post-release smoke test passed: 23 critical routes, 4 sitemap files, and 28 canonical public URLs all returned HTTP 200.
- SEO public artifacts responded successfully: `/robots.txt`, sitemap index, pages/categories/products/posts sitemaps, News RSS and News sitemap.

## Fixed in this release

### Blog automatic publication was indirectly enabled

- Root cause: Blog routes consumed the same `getPublishedNewsArticles` source as News. Any automated News item therefore appeared in Blog even though no independent Blog cron existed.
- Fix: Blog now uses `getPublishedBlogArticles` / `getPublishedBlogArticle`, which includes historical/manual content but excludes records marked `Automatically generated...`. News remains database-first and only uses repository content as an outage fallback.
- Files: `src/lib/news-content.ts`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`.
- Validation: production `/blog` has zero automatically-generated News URLs; `/news` continues to show the existing automated News entries. Historical Blog routes still return 200.

### News automation checked end to end

- Scheduled route: `/api/cron/news`, Vercel schedule `0 1,7,13,19 * * *` (four checks per day).
- Existing database evidence: 98 job records, latest historical jobs successful; 3 automatic published records, 3 historical/manual records, and 1 draft.
- Fresh authenticated production execution: HTTP 200 at `2026-08-06T03:05:10.738Z`; status `skipped`; 6 candidate sources reviewed; 6 rejected by configured quality/relevance rules; 0 published. This is the expected no-eligible-source outcome and created no duplicate content.
- Cron authentication key was securely rotated during verification. It is stored as a sensitive Vercel production variable and was never logged or included in this report.

### Google sitemap submission frequency reduced

- `vercel.json`: sitemap cron changed from daily `20 2 * * *` to `20 2 */3 * *`.
- `src/lib/sitemap/service.ts`: added a 72-hour guard based on the last actual Search Console attempt, retaining a reason in sitemap-run logs. Manual forced runs are separately identified.
- `.env.example` and `docs/sitemap.md` document `GOOGLE_SITEMAP_SUBMIT_INTERVAL_HOURS=72`.
- A real manual sitemap maintenance run completed in 6.34 seconds: source `database+static`, 28 URLs, no warnings.

## Found but not automatically fixed

### Google Search Console cannot yet submit externally

- Evidence: production health reports external SEO as disabled; production environment variable inventory has no Google Search Console credential/configuration variables. Sitemap run history records `search_console_attempted=false` and no actual Google call.
- Effect: the new 3-day schedule and 72-hour duplicate guard are active, but no Google submission can occur until an authorized Search Console credential/property is configured.
- Required follow-up: grant a dedicated Google service account access to the `sc-domain:hcjpistonrod.com` property, then configure the approved credentials and property/sitemap variables in Vercel. Re-run a manual sitemap maintenance task to record the first authenticated submission.

### Product catalog source-of-truth needs a planned migration

- The existing public product catalog still contains static repository content while the admin database has a different current publication set (13 static products versus 7 currently published database products observed during audit).
- Effect: the News/Blog pathways are now database-first, but product/category editing is not yet a full immediate frontend source-of-truth replacement.
- Not changed automatically because it could unexpectedly hide or alter live product URLs. Recommended next work: add a staged product-content service, compare each live slug with the database, then migrate rendering with redirects/noindex rules for drafts.

## Performance sample (production, single uncached-style HTTP samples)

| Route | HTTP | TTFB | Total |
| --- | --- | ---: | ---: |
| `/` | 200 | 0.97 s | 1.44 s |
| `/news` | 200 | 1.47 s | 1.83 s |
| `/blog` | 200 | 0.96 s | 1.23 s |
| `/products` | 200 | 0.89 s | 1.26 s |
| `/sitemap.xml` | 200 | 0.89 s | 0.89 s |
| `/robots.txt` | 200 | 0.92 s | 0.92 s |

These are network samples from the audit host, not a full Lighthouse field study. News is the slowest sampled dynamic route and should be monitored after product-source migration/caching work.

## Boundaries and residual risks

- Vercel serverless does not expose host CPU, RAM, disk, process list, database-server internals, CDN cache internals, or network connections through this project account. Those items were not claimed as checked.
- Browser-based cross-browser/mobile screenshot automation was unavailable because the local Playwright launcher was not installed. Route and responsive markup HTTP checks were run; visual device QA remains to be performed in a browser-capable environment.
- Vercel logs showed non-fatal `pg` SSL compatibility warnings during admin-login test traffic. Do not change the managed database SSL mode without the provider CA/connection guidance.
- Native admin analytics tables currently have no live event-ingestion rows. Vercel Web Analytics is enabled, but its visitor metrics are not mirrored into the site's database dashboard.
