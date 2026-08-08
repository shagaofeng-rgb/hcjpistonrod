# HCJ final reconciliation audit - 2026-08-08

Scope: prior delivery instructions, the connected PostgreSQL database, the controlled Blog scheduler, the disabled News automation path, public SEO artifacts, the Chinese admin interface, and production `https://www.hcjpistonrod.com`.

## Backup and rollback

- Code baseline before this audit patch: annotated tag `pre-real-data-admin-audit-20260808-160000` at commit `f4bf83c`.
- No database rows, media objects, customer submissions or environment variables were changed during this audit.
- Rollback: redeploy the previous Vercel deployment or revert the audit commits. The database requires no rollback for this release.

## Confirmed with live data

| Area | Evidence | Result |
| --- | --- | --- |
| Database | Direct read-only PostgreSQL checks | Connected; 16 product rows, 2 enabled categories, 6 published News rows, 1 published Blog row, 0 active customer submissions and 0 analytics summary rows. |
| Product content mirror | Slug comparison between repository and `products_cms` | 16/16 slugs match. Ten core rod/tube products are published and indexable; six hydraulic-cylinder pages are deliberate CMS drafts with `noindex,follow` and sitemap disabled. |
| Blog scheduler | `news_articles` queue and `audit_logs` | No due drafts; latest `scheduled_publish` for Blog succeeded at `2026-08-08T07:41:46.913Z`. |
| News automation | `news_articles`, `sync_sources`, `news_sources` | No News row has scheduler approval; legacy `news-automation` source and all external News sources are disabled. |
| Sitemap scheduler | `vercel.json` and `sitemap_runs` | Cron is `20 2 */3 * *` and database logs show successful runs. Search Console submission was not attempted because no authorized credentials are configured. |
| Public route, SEO and sitemap regression | `pnpm self-check -- --base=https://www.hcjpistonrod.com` | Passed: 23 key routes, 4 sitemap documents and 23 canonical public URLs. |

## Fixed in this audit

### Admin pages could imply non-existent data

- Root cause: when analytics had no rows, or when a database read failed, the admin UI could render repository/configuration fallback rows that looked like live data.
- Fix: admin list modules now read only database records. Empty analytics stays empty, database errors show an explicit warning, and the synchronization page reads actual `sync_sources` rows.
- Result: the admin panel does not present a static fallback as a real metric or record.

### Product resource section did not meet the internal-link check

- Root cause: the product page retained the Blog link but its heading no longer identified the section as related news/resources.
- Fix: restored the clear heading `Related News & Technical Resources` without inventing a related-news item.
- Result: `/products/ck45-chrome-plated-rod` returned HTTP 200 with the corrected resource section in production.

### Production self-check followed a redirect but validated the old path type

- Root cause: the checker followed a legacy News-to-Blog redirect, then still required News-only source attribution.
- Fix: validation now uses the final response path after redirects.
- Result: the production self-check passed without weakening the News attribution check for real News pages.

## External integrations requiring an account-level prerequisite

### Google Search Console

- The three-day scheduler and 72-hour duplicate-submission guard are deployed.
- Actual submission remains blocked because this Vercel project does not have a Search Console service-account/property authorization. No password, token or key is stored in this repository.
- Required external action: add a dedicated service account to the `sc-domain:hcjpistonrod.com` Search Console property, then configure its approved credentials in Vercel. After that, run the protected sitemap task once and verify the logged Google response.

### Analytics history in the Chinese admin

- Vercel Web Analytics can collect site traffic independently, but the local `analytics_daily_summary` table currently contains zero records and no import credential is configured.
- The admin now correctly displays no local metrics instead of a generated status row.
- To show historical visitor metrics in the admin, an approved Vercel Analytics/observability export credential or another analytics provider API must be connected and an ingestion job added.

## Validation commands

| Command | Result |
| --- | --- |
| `pnpm test:admin` | 2/2 passed |
| `pnpm test:content` | 5/5 passed |
| `pnpm test:sitemap` | 9/9 passed |
| `pnpm lint` | passed |
| `pnpm build` | passed; 63 routes generated |
| `pnpm self-check -- --base=https://www.hcjpistonrod.com` | passed |

## Residual note

The existing PostgreSQL client emits a future compatibility warning about its TLS mode during local builds. Connections succeed today. Changing managed-database TLS parameters requires the provider's CA and connection guidance, so it was not changed automatically.
