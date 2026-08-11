# Old Code and Task Removal Plan

This plan is intentionally narrow. It removes only automation behavior that conflicts with the new News specification; it does not delete public pages or historical content.

| Current item | Conflict | Action | Data impact | Rollback |
| --- | --- | --- | --- | --- |
| `src/lib/content-ops/catalog.ts` topic rotation and product facts | Worker hard-codes HCJ product content and feeds publication | Detach from the News worker. Keep only generic owned-asset support if still needed by another manual workflow. | None | Restore file from rollback tag |
| `generateDeterministicDraft()` | Creates an internal technical guide rather than external News | Remove from News publish path; do not use as fallback | Existing records retained | Restore file/path from rollback tag |
| `CONTENT_OPS_CHANNEL` | Allows News worker to publish into Blog | Remove from News configuration and hard-code the News content type at the publisher boundary | None | Restore prior env/config behavior only if explicitly approved |
| `runArticleCycle()` | Does not select verified candidates or perform delivery checks | Replace with site-scoped 48-hour publication controller | New audit records only | Disable feature flag and use rollback tag/migration rollback script |
| `content_ops_*` broad tables | Lack `site_id`, state machine, locks and delivery records | Extend by additive migration; retain old rows | No deletion | Transactional down/compensating SQL documented with migration |
| `/blog/rss.xml` re-export | Delivers News in Blog feed | Replace with Blog-only RSS | No data impact | Restore route file |
| `sitemap-posts.xml` cross-channel mix | Prevents independent News/Blog index governance | Add dedicated Blog sitemap and retain legacy aggregate route as a compatibility index without mixing in canonical index | No data impact | Restore sitemap bundle behavior |

Before production activation, the legacy `/api/cron/article-cycle` must be removed from `vercel.json` and any Vercel schedule; the new `news-publish` route must only be enabled after the candidate sources, product theme configuration, alert target and publication feature flag pass validation.
