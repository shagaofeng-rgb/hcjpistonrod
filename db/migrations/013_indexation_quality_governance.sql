-- Preserve source-attributed News records, but prevent thin automated briefs from
-- competing with original technical pages in organic search. They remain reachable
-- through the News interface and retain their source panels and audit history.
UPDATE news_articles
SET robots = 'noindex,follow',
    seo_description = CASE slug
      WHEN 'source-brief-coxreels-is-pleased-to-offer-dual-hydraulic-reels' THEN 'Source-attributed brief on Coxreels dual hydraulic reel configurations for hydraulic tools and accessories.'
      WHEN 'source-brief-donaldson-introduces-reservoir-headspace-dryer' THEN 'Source-attributed brief on a reservoir headspace dryer for hydraulic and lubrication-system moisture control.'
      WHEN 'source-brief-hydraulics-technologies-on-display-at-ivt-expo-2026' THEN 'Source-attributed brief on hydraulic technologies and system integration discussed at iVT Expo 2026.'
      WHEN 'source-brief-evolving-mobile-equipment-designs-prompting-a-convergence-of-hydraulics-and-e' THEN 'Source-attributed brief on the convergence of hydraulics and electronics in mobile off-highway equipment design.'
      ELSE seo_description
    END,
    updated_at = now()
WHERE site_id = 'hcj-pistonrod'
  AND content_channel = 'news'
  AND automation_notes = 'news-automation-v2'
  AND status = 'published';

-- Keep the article H1 intact while supplying concise, non-duplicative SERP titles.
UPDATE news_articles
SET seo_title = CASE slug
    WHEN 'review-ck45-chrome-plated-rod-for-cross-border-technical-quotation' THEN 'CK45 Chrome Plated Rod: Buyer Review Checklist'
    WHEN 'review-honed-tube-for-hydraulic-cylinder-replacement' THEN 'Honed Tube for Cylinder Replacement: Buyer Checklist'
    WHEN 'ck45-honed-tube-vs-st52-honed-tube' THEN 'CK45 vs ST52 Honed Tube: Buyer Review Guide'
    ELSE seo_title
  END,
  updated_at = now()
WHERE site_id = 'hcj-pistonrod'
  AND content_channel = 'blog'
  AND slug IN (
    'review-ck45-chrome-plated-rod-for-cross-border-technical-quotation',
    'review-honed-tube-for-hydraulic-cylinder-replacement',
    'ck45-honed-tube-vs-st52-honed-tube'
  );
