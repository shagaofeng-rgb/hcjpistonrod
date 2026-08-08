# Removed News automation

Date: 2026-08-08.

The following executable automation was found and removed. Historical News records and the manual News management module remain intact.

| Original implementation | Previous role | Action | Manual replacement |
| --- | --- | --- | --- |
| `src/lib/news-automation.ts` | Collected RSS/API candidates, generated editorial content, created drafts or published News, and recorded jobs. | Deleted. | Admin-created drafts with technical and marketing review. |
| `src/app/api/cron/news/route.ts` | Authorized scheduled endpoint that invoked News automation. | Deleted. | No scheduled News publication path exists. |
| `src/app/api/admin/news/automation/route.ts` | Admin-triggered automation readiness/run endpoint. | Deleted. | Manual News management remains under `/admin/news`. |
| `vercel.json` `/api/cron/news` entry | Ran News collection four times daily. | Removed. | Sitemap maintenance cron remains unchanged. |
| `tests/news-automation.test.ts`, `scripts/news-automation-tests.mjs` | Tested the removed automated collector and generator. | Deleted. | `tests/content-workflow.test.ts` protects the manual-review rule. |
| `.env.example` and README automation variables | Documented RSS, AI provider, source and auto-publish controls. | Removed. | README documents a manual editorial workflow. |
| `scripts/sync-repository-content.ts` News synchronization | Wrote repository News records as published items. | Removed. | Repository synchronization now updates only product, media, category and site-identity data. |

`db/migrations/002_news_automation.sql` remains in the migration history because it may already be applied in production. Its legacy tables and audit rows are retained for traceability, but no deployed application code invokes them.

## Production data actions

- `news-automation` in `sync_sources` was changed to `disabled / disabled` on 2026-08-08.
- Two enabled external rows in `news_sources` were set to disabled; no source rows or historic articles were deleted.
- The three retained historical automatic News records were changed to `robots = noindex,follow` in the database. Their public routes remain available by design, while the News list and sitemap exclude them.
- Migration `006_manual_content_workflow` added nullable technical-review, marketing-review and publisher audit fields to `news_articles`; it did not alter existing article content or publication status.
