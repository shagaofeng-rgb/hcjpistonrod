# HCJ News / Blog Boundary Audit

## Required boundary

| Dimension | News target | Blog target | Current state | Required remediation |
| --- | --- | --- | --- | --- |
| Route | `/news/*` | `/blog/*` | Separate | Keep separate |
| Content type | `news` | `blog` | `content_channel` field | Retain field and add non-null `site_id` to every content query |
| Candidate access | external candidate pool | none | Article cycle ignores candidates but can target Blog | News publisher may read candidates; Blog code must not import them |
| API | `/api/news/*` | `/api/blog/*` | News API only | Add dedicated Blog API or keep Blog server-only; never expose News from Blog API |
| Sitemap | News-only | Blog-only | combined `sitemap-posts.xml`; separate News sitemap | Add `blog-sitemap.xml`; remove cross-channel output from combined post sitemap |
| RSS | News-only | Blog-only | Blog route re-exports News RSS | Implement Blog RSS using Blog data |
| Cache | content specific | content specific | shared `hcj-published-content` tag | Use channel + site cache tags |
| Automation | ingest/publish worker | manual/independent workflow | mutable `CONTENT_OPS_CHANNEL` can target either | Remove configurable channel from News automation and hard-fail any non-News target |
| Admin | News management | Blog management | mixed list label | Split filters/menu endpoints without deleting historical records |

## Current violations

1. `src/lib/content-ops/config.ts` allows `CONTENT_OPS_CHANNEL=blog`.
2. `src/lib/content-ops/repository.ts` accepts a generic channel and publishes it.
3. `src/app/blog/rss.xml/route.ts` directly re-exports the News RSS handler.
4. `src/lib/sitemap/source.ts` creates a combined post sitemap from both channels.
5. `src/lib/news-content.ts` uses a shared cache tag.
6. No `site_id` is present in the current content or automation tables.

## Historical content protection

The migration will not delete, rewrite, redirect or noindex existing Blog records by default. It will seed `site_id` for existing records and constrain every new query to that site. The historical content triage file records the initial preservation decision for every public record.
