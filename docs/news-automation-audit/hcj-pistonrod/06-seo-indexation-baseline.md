# SEO and Indexation Baseline

## Current public endpoints

- Sitemap index: `/sitemap.xml`
- General post sitemap: `/sitemap-posts.xml` (currently mixes News and Blog)
- News sitemap: `/news-sitemap.xml` (currently limits entries by source date within 48 hours)
- News RSS: `/news/rss.xml`
- Blog RSS: `/blog/rss.xml` (currently aliases News RSS; defect)

## Baseline observations

1. `robots.ts` advertises the sitemap index and the News sitemap, but no independent Blog sitemap.
2. Historical noindex News records are excluded from the public News list and sitemap by application rules.
3. Indexable Blog and News records both enter the same generated post sitemap.
4. News detail pages emit `NewsArticle` JSON-LD regardless of whether the entry has a true external source. The new schema gate must emit NewsArticle only when source provenance and publication fields pass validation.
5. No Google Indexing API is used. Existing Sitemap maintenance retains a 72-hour minimum Search Console submission interval; this remains separate from content publication.

## Required target

- Separate `news-sitemap.xml` and `blog-sitemap.xml`, each filtered by `site_id`, `content_channel`, published state, canonical match and indexability.
- News RSS contains News only; Blog RSS contains Blog only.
- News JSON-LD is emitted only for verified external editorial summaries and uses the site publication time as `datePublished`, with source data shown separately.
- Automated News has one self-canonical URL, a unique title/description/H1 and source panel. Historical low-value entries keep their existing noindex state unless a reviewed triage decision changes it.
