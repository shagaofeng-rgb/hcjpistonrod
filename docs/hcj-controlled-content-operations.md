# HCJ News Automation Operations

The active News implementation is site-scoped and lives in `src/lib/news-automation/`. Its only public automation endpoints are `/api/cron/news-ingest` and `/api/cron/news-publish`; both require `Authorization: Bearer $CRON_SECRET`.

- Ingest runs every 12 hours and has no CMS, sitemap, RSS, search-index or publication write path.
- Publish is checked every 12 hours but uses a stable 48-hour site/timezone window. It can only publish `content_channel='news'` after a whitelist candidate, duplicate checks, source fields, editorial quality checks and frontend HTTP delivery checks pass.
- Blog remains a separate manual content channel. It has separate routes, API endpoints, RSS and sitemap, and the News worker has no Blog target setting.
- `NEWS_AUTOMATION_ENABLED` and `NEWS_AUTOMATION_PRODUCTION_ENABLED` must both be true before any public News publication is attempted. The default is false.
- The legacy article cycle endpoint returns `410 Gone`; legacy `content_ops_*` records are preserved as historical audit data only.

The pre-change audit, content triage and rollback instructions are in `docs/news-automation-audit/hcj-pistonrod/`.
