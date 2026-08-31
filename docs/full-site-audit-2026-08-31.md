# HCJ Full-Site Audit and Remediation Report

Audit date: 2026-08-31 (Asia/Shanghai)

Site: https://www.hcjpistonrod.com

Project: Next.js 16 / React 19 / Neon PostgreSQL / Vercel

## 1. Executive status

- The public site, admin APIs, database-backed content, inquiry storage, visitor analytics, News automation, sitemap generation, and production build were inspected.
- Product, Blog, and News samples were checked across database, API, and public pages. The sampled records matched.
- News automation is active. The latest automated article completed the publication state machine and passed list-page and detail-page delivery checks.
- Blog content remains separate from News automation. The retired article-cycle endpoint returns HTTP 410 and is not scheduled.
- Google sitemap maintenance is scheduled every three days. Search Console credentials and the required production flags are present in Vercel; secret values were not exposed during this audit.
- Seven implementation defects were corrected: stale admin sync status, hard-coded health status, incomplete admin sync API data, missing News sitemap index entry, duplicate product title suffixes, tablet header overflow, and a Vercel root-element hydration warning. PostgreSQL SSL configuration was also normalized to remove an upcoming driver warning.

## 2. Backups and rollback

Created before modification:

- Git rollback branch: `codex/full-site-audit-before-20260830`
- Logical admin/database backup: `backups/hcj-admin-logical-20260830T125844559Z.json`
- Earlier logical backup: `backups/hcj-admin-logical-20260830T114336381Z.json`

Application rollback:

1. Redeploy the last known production commit (`c9a0745`) from Vercel or GitHub.
2. If database restoration is required, inspect the logical backup first and use the repository restore tooling only for the affected records.
3. Do not restore analytics or inquiry tables wholesale unless a record-level comparison confirms it is necessary.

No database rows or schema objects were deleted during this audit.

## 3. Runtime and task inventory

| Task/service | Trigger | Writes/outputs | Current status |
| --- | --- | --- | --- |
| Next.js public site | HTTP request / Vercel deployment | HTML, API responses, cached routes | Healthy in build and browser regression |
| Admin content APIs | Authenticated HTTP request | Products, Blog, News, inquiries, settings | Build and route checks passed |
| Visitor analytics collector | Browser event/API request | Accepted/excluded analytics rollups | 22 accepted, 25 excluded at audit time |
| News ingest | `15 1,13 * * *` UTC | Candidate and ingest audit records only | Enabled; 12-hour schedule |
| News publish | `25 1,13 * * *` UTC | Publication run, News article, delivery checks | Enabled; service enforces the 48-hour publication window |
| Sitemap/Search Console maintenance | `20 2 */3 * *` UTC | Sitemap run logs and conditional submission | Enabled; every three days |
| Retired article-cycle endpoint | No schedule | None | HTTP 410; inactive |
| Blog automation | No News worker access | Existing Blog data only | No News-to-Blog publishing path found |
| Vercel deployment | Git push/manual production deploy | Production build and CDN assets | Verified after deployment in the final release step |

Conflict review:

- No duplicate active Vercel cron entry was found for News ingest, News publish, or sitemap maintenance.
- Ingest and publish have different endpoints and state transitions. Ingest does not publish public content.
- A publish trigger may run every 12 hours for recovery, but the publication service rejects windows that are not due and uses cycle idempotency.
- The legacy `sync_sources.news-automation` status row was stale and no longer treated as authoritative.

## 4. Database and real-data checks

- PostgreSQL version observed: 17.11.
- Twelve repository migrations were present through migration 012.
- Core content observed during the audit: 16 products, 5 product categories, and 15 News articles before the latest follow-up checks.
- Inquiry data: one real stored inquiry, archived and marked sent. It was not modified. Active inquiry count is therefore zero while total count is one.
- Analytics collection: 22 accepted events/rollups and 25 excluded events/rollups at audit time. Excluded traffic remains outside reported visitor totals.
- Database SSL handling now maps legacy `sslmode=prefer`, `require`, and `verify-ca` values to `verify-full`, preserving certificate verification and removing the PostgreSQL driver compatibility warning.

End-to-end samples:

- Products: `st52-honed-tube`, `ck45-honed-tube`, and `honed-tube` matched database names, API/page content, HTTP 200, and canonical URLs.
- Blog: three database records matched API output and public detail pages.
- News: three database records matched API output, public list/detail pages, source information, and HTTP 200 responses.

## 5. News automation evidence

Latest verified automated publication at audit time:

- Slug: `source-brief-coxreels-is-pleased-to-offer-dual-hydraulic-reels`
- Title: `Source Brief: Coxreels® is pleased to offer dual hydraulic reels!`
- Published: `2026-08-31T01:25:49.498Z`
- Publication state: `published_success`
- Delivery verification: passed
- Public list and detail response: HTTP 200

Additional recent verified publications included the Donaldson source brief and the iVT Expo source brief. News list, detail, source panel, and sitemap behavior were validated. News records did not appear in Blog API/list checks.

## 6. SEO and sitemap checks

Fixes:

- Added the independent News sitemap to the sitemap index.
- Omitted empty sitemap kinds instead of emitting a `1970-01-01` epoch timestamp.
- Kept the custom News sitemap rendering independent from Blog.
- Removed an embedded `| XIJIU` product title suffix so the root metadata template appends the brand only once.
- Updated the self-check script to accept a target base URL and to validate the News sitemap entry.

Search Console maintenance evidence:

- Production configuration contains the Search Console credentials, enable flag, site URL, sitemap URL, and submission interval variables.
- Successful maintenance runs were recorded on 2026-08-19, 22, 25, 28, and 31.
- The recorded runs skipped an external submission when the sitemap content was unchanged, preventing duplicate submissions.
- The production cron is `20 2 */3 * *`, so the task does not run daily.

## 7. Frontend, responsive, and accessibility checks

Validated layouts:

- Home at desktop, tablet, mobile, and narrow-mobile widths.
- News list and latest News detail.
- Product detail and Blog detail.
- Invalid route and 404 handling.

Results:

- No horizontal overflow remained at the tested widths.
- The 768px overflow was traced to expanded email, WhatsApp, and language labels in the non-home top bar. Labels now expand at `lg`; icons remain available on tablet.
- Pages retained one H1, `lang=en`, correct canonical behavior, and readable mobile content.
- Lazy-loaded images loaded after scroll. The only local-only network miss was the Vercel Insights script, which is expected outside Vercel production.
- Post-fix screenshots: `tmp/full-audit-after-desktop.png` and `tmp/full-audit-after-mobile.png`.
- Vercel injects a deployment identifier on the root HTML element. The root now uses React's hydration-warning suppression for that host-managed attribute only; component-level hydration checks remain active.

## 8. Performance evidence

Google PageSpeed Insights API was attempted but returned HTTP 429 because the public API quota was exhausted. Lighthouse was therefore run against the local production build with the same Chromium engine and no simulated network throttling.

| Profile | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Desktop | 76 | 100 | 96 | 100 | 1.1 s | 1.2 s | 410 ms | 0.003 | 412 KiB |
| Mobile | 95 | 100 | 96 | 100 | 0.6 s | 0.6 s | 250 ms | 0 | 370 KiB |

The desktop score is primarily constrained by main-thread blocking variability rather than paint or layout instability. Public single-request TTFB samples before deployment were approximately 1.0-1.36 seconds. Production is rechecked after deployment.

Production checks after the first release returned mobile performance 98, accessibility 100, SEO 100, FCP 1.8 seconds, LCP 2.0 seconds, and CLS 0. A repeated desktop run returned performance 77, accessibility 100, SEO 100, FCP 1.7 seconds, LCP 2.0 seconds, TBT 60 milliseconds, and CLS 0.003. The first desktop sample was 47 because Speed Index and TBT varied significantly; the repeated result is retained rather than presenting the better sample as a guaranteed score.

## 9. Test and build evidence

Passed before release:

- ESLint
- TypeScript type check
- Sitemap tests: 11 passed
- Admin password tests: 2 passed
- Content tests: 5 passed
- News automation tests: 12 passed
- Visitor analytics tests: 4 passed
- Production build: 68 routes generated
- Site self-check: 21 key routes, 4 sitemap files, 30 regular index URLs, and 5 News URLs
- Browser regression at desktop, tablet, mobile, and narrow-mobile widths
- `git diff --check`

## 10. Files changed

- `scripts/site-self-check.mjs`
- `src/app/layout.tsx`
- `src/app/api/admin/content/[module]/route.ts`
- `src/app/api/admin/health/route.ts`
- `src/components/header.tsx`
- `src/lib/admin/db.ts`
- `src/lib/admin/site-data.ts`
- `src/lib/admin/sync-status.ts`
- `src/lib/product-editorial.ts`
- `src/lib/sitemap/core.ts`
- `src/lib/sitemap/service.ts`
- `src/lib/sitemap/source.ts`
- `tests/sitemap.test.ts`

No database migration was required.

## 11. Confirmed normal, fixed, and residual items

Confirmed normal:

- Production database connectivity and current migrations
- Product, Blog, News, inquiry, and analytics reads
- News publication and frontend delivery
- Blog/News route and content separation
- Authentication rejection for forged admin cookies
- Three-day Google sitemap maintenance schedule
- Production build and primary public routes

Fixed:

- Stale/fake News sync status in admin
- Hard-coded News health result
- Missing dynamic sync API behavior
- Missing News sitemap index entry and empty-sitemap epoch date
- Duplicate product metadata brand suffix
- PostgreSQL SSL warning
- Tablet horizontal overflow
- Vercel-injected root attribute hydration warning

Residual limitations:

- The PageSpeed Insights public API quota prevented an official PSI score during this run; Lighthouse evidence is included instead.
- Vercel infrastructure CPU, memory, and disk host metrics are managed by Vercel and are not exposed as a traditional server shell. Application-level build, HTTP, database, cron, and browser evidence was used.
- Search Console submission is intentionally conditional. A successful maintenance run can legitimately record no submission when the sitemap hash is unchanged.
