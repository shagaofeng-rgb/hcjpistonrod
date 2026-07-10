# Sitemap Automation

## Architecture

The production site serves a dynamic sitemap index at `https://www.hcjpistonrod.com/sitemap.xml`. The apex domain redirects permanently to the canonical `www` host. The sitemap is generated from the published static catalog plus published PostgreSQL CMS records when `DATABASE_URL` is configured.

The index links to separate page, category, product, and post sitemaps. A sitemap is automatically split before 50,000 URLs or 50 MB. Search, admin, redirect-only, draft, deleted, disabled, noindex, non-self-canonical, and parameter URLs are excluded.

Static content uses fixed repository update timestamps. CMS content uses its real `updated_at` value. The generator does not replace every `lastmod` with the current time.

## Public URLs

- `https://www.hcjpistonrod.com/sitemap.xml`
- `https://www.hcjpistonrod.com/sitemap-pages.xml`
- `https://www.hcjpistonrod.com/sitemap-categories.xml`
- `https://www.hcjpistonrod.com/sitemap-products.xml`
- `https://www.hcjpistonrod.com/sitemap-posts.xml`
- `https://www.hcjpistonrod.com/news-sitemap.xml`
- `https://www.hcjpistonrod.com/robots.txt`

When a type exceeds one file, the index switches to `/sitemaps/{type}-{part}.xml` URLs.

## Automatic Updates

PostgreSQL triggers mark the sitemap dirty after product, category, or news insert, update, or delete operations. Public XML routes read current published data and revalidate every five minutes. Vercel runs `/api/cron/sitemap` daily at `02:20 UTC` to verify and log the current manifest and optionally submit changed sitemaps to Search Console.

Run migrations after configuring the production database:

```bash
pnpm admin:migrate
```

The cron endpoint requires `Authorization: Bearer $CRON_SECRET`. It is not an open rebuild endpoint.

## Manual Generation

```bash
pnpm sitemap:generate -- --dry-run --verbose
pnpm sitemap:generate -- --force
pnpm sitemap:generate -- --force --submit --verbose
```

The command validates each UTF-8 XML document and writes `.sitemap-cache` through a temporary file followed by an atomic rename. A failed validation or write leaves the previous file unchanged.

## Search Console API

Search Console submission is disabled by default. The implementation uses the Search Console Sitemaps API and never calls the retired ping endpoint or the Indexing API.

Configure:

```env
GOOGLE_SEARCH_CONSOLE_ENABLED=true
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:hcjpistonrod.com
GOOGLE_SEARCH_CONSOLE_SITEMAP_URL=https://www.hcjpistonrod.com/sitemap.xml
GOOGLE_SERVICE_ACCOUNT_JSON={...service account JSON...}
```

For a local server, `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH` may point to a JSON file. Existing `GSC_CLIENT_EMAIL` and `GSC_PRIVATE_KEY` variables are also supported. Do not commit credentials.

Create a Google Cloud service account, enable the Search Console API, and add its client email as an owner or full user of the exact Search Console property. Domain properties use `sc-domain:hcjpistonrod.com`; URL-prefix properties must include the full trailing-slash URL.

Submission uses OAuth scope `https://www.googleapis.com/auth/webmasters`, checks that the sitemap is publicly accessible, applies a request timeout, and records only sanitized status messages. API failure never removes or blocks the sitemap.

## Logs and Monitoring

With PostgreSQL configured, `sitemap_runs` records timing, trigger, URL totals, file sizes, split status, added/modified/removed URLs, warnings, and Search Console result. `sitemap_snapshots` stores the last successful manifest atomically. Without a database, the XML remains available from repository content, but cross-instance audit history and locking are unavailable.

## Tests

```bash
pnpm test:sitemap
pnpm lint
pnpm build
```

Tests cover XML validation and escaping, draft/noindex/canonical exclusion, removal and real lastmod changes, splitting and index generation, atomic-write retention, disabled API behavior, successful submission, and permission failure behavior.

## Troubleshooting

- Sitemap 404: verify the latest Vercel deployment and check `/sitemap.xml` directly.
- XML error: run `pnpm test:sitemap` and `pnpm sitemap:generate -- --dry-run --verbose`.
- Missing robots declaration: open `/robots.txt`; it must list the production sitemap index.
- Search Console 403: verify the exact property value and grant the service account access in Search Console.
- Submitted but not indexed: inspect the URL in Search Console and review canonical, robots, content quality, and crawl status.

Submitting a sitemap does not mean Google has crawled it. Crawling does not guarantee indexing. A sitemap helps Google discover preferred canonical URLs; final indexing status must be checked in Google Search Console.
