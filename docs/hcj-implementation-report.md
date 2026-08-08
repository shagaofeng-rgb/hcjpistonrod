# HCJ product, SEO and content-system implementation report

Date: 2026-08-08

## Scope completed

- Replaced the legacy News collector/generator, cron endpoint, admin trigger, RSS source registration, AI/News configuration examples and related tests. The retained News module is manual-only.
- Added the manual editorial gate: Draft -> named technical review -> named marketing review -> authorized manual publication. Migration `006_manual_content_workflow.sql` adds the corresponding audit fields without changing historic rows.
- Removed repository synchronization that could create or publish News records. Product, media, category and site-identity synchronization remains.
- Added direct 301 redirects for the three specified News-to-Blog migrations. The three specified historical automatic News URLs remain available, carry `noindex,follow`, and are excluded from News lists and sitemap output.
- Added a unified editorial product template and complete product-family records for the ten requested piston-rod and tube URLs.
- Added public-page structured data limited to `BreadcrumbList`, `ItemPage` and `FAQPage`; no public Product/Offer/Review rich-result schema is emitted.
- Added `llms.txt`, updated crawler rules, home metadata and a real factory-based Open Graph image.
- Updated RFQ wording to request business email, country/region, product, quantity or annual volume, and technical requirement.

## Database and operational record

- Backup baseline tag: `content-overhaul-20260808-144414`.
- The PostgreSQL backup script was invoked before migration, but the local runtime has no `pg_dump`; its log is retained under `backups/content-overhaul-20260808-150455.db-backup.log`. An earlier logical backup remains under `backups/hcj-admin-logical-20260806T013814113Z.json`.
- Production migration `006_manual_content_workflow` applied successfully. Confirmed columns: `technical_reviewed_at`, `technical_reviewer`, `marketing_reviewed_at`, `marketing_reviewer`, `published_by_name`.
- Production data actions: one `news-automation` sync source disabled; two enabled external News sources disabled; three preserved historical automatic News records updated to `noindex,follow`.
- Content sync completed after the change: 5 categories, 16 products, 7 historic News records, 23 media records. It no longer writes News.

## Local verification evidence

| Check | Result |
| --- | --- |
| `pnpm lint` | Passed |
| `pnpm test:content` | Passed: 2/2 |
| `pnpm test:sitemap` | Passed: 9/9 |
| `pnpm build` | Passed |
| Required product URLs | 10/10 returned HTTP 200 from production build locally |
| Redirect check | Specified legacy News URL returned HTTP 301 to its matching Blog URL |
| Historical automatic News | HTTP 200 with `noindex, follow` metadata |
| Filtered News page | `noindex, follow` metadata confirmed |
| Sitemap exclusions | Redirected and three historical automatic News URLs absent |

## Known limits and next data requirements

- Product copy intentionally avoids unverified numeric capability, certification, price, MOQ, lead-time and order-specific specification claims. The outstanding fact fields are tracked in `docs/hcj-product-data-gaps.md`.
- Browser screenshot validation could not run in this terminal because no browser automation runtime is installed. Route and server-rendered metadata validation did run; production browser checks are recorded after deployment.
- PostgreSQL SSL warning is emitted by the existing connection-string configuration. It does not block current connections, but the database URL should later specify the intended TLS mode explicitly before the next major `pg` upgrade.

## Rollback

1. Redeploy the Vercel deployment preceding this release, or reset to Git tag `content-overhaul-20260808-144414` in a separate reviewed change.
2. Restore logical data only when necessary from `backups/hcj-admin-logical-20260806T013814113Z.json`; do not run a restore over newer production data without a fresh database export.
3. Migration `006_manual_content_workflow` is additive only; rollback does not require a schema change.
