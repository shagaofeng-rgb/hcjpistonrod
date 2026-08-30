import { site } from "@/lib/site";
import type { SiteConfig } from "./types";

const productThemePlan = [
  { themeId: "piston-rods", productUrl: "/products/chrome-plated-rod", productName: "Hard Chrome Plated Rods", startAt: "2026-01-01T00:00:00.000Z", endAt: "2027-01-01T00:00:00.000Z", status: "active" as const },
  { themeId: "honed-tubes", productUrl: "/products/honed-tube", productName: "Honed Tubes", startAt: "2026-01-01T00:00:00.000Z", endAt: "2027-01-01T00:00:00.000Z", status: "active" as const },
];

// Site metadata belongs here, never in a worker or article template. Add a new
// entry for every future site; no worker falls back to another site's profile.
const siteConfigs: SiteConfig[] = [
  {
    siteId: "hcj-pistonrod",
    enabled: true,
    brandName: site.brandName,
    siteUrl: site.domain,
    industry: "hydraulic cylinder components and precision rod manufacturing",
    industryScope: "Hydraulic piston rods, hard chrome plated rods, induction hardened rods, hollow rods, honed tubes, hydraulic component machining, buyer-facing technical standards, manufacturing, supply-chain, quality, safety and relevant public regulations. Exclude unrelated consumer, software, health, political and general-science news.",
    targetMarkets: ["US", "EU"],
    publicationLanguage: "en",
    locale: "en-US",
    timezone: "Asia/Shanghai",
    news: {
      enabled: true,
      listRoute: "/news/",
      detailRoutePattern: "/news/[slug]/",
      rssRoute: "/news/rss.xml",
      sitemapRoute: "/news-sitemap.xml",
      desiredWordCount: { min: 700, max: 1000 },
      sourceNativeWordCount: { min: 90, max: 420 },
      publicationMode: "source-native",
      ingestIntervalHours: 12,
      publishIntervalHours: 48,
      candidateMaxAgeHours: 72,
      fallbackCandidateMaxAgeDays: 7,
      minScore: 70,
      maxInternalProductLinks: 1,
      defaultAuthorType: "Editorial Team",
    },
    blog: {
      enabled: true,
      listRoute: "/blog/",
      detailRoutePattern: "/blog/[slug]/",
      sitemapRoute: "/blog-sitemap.xml",
      contentSource: "existing-postgresql-blog-content",
      allowNewsAutomation: false,
    },
    productThemePlan,
    sources: {
      primaryWhitelist: [
        { id: "power-motion-tech-hydraulics", name: "Power & Motion Tech", domain: "www.powermotiontech.com", type: "trade-media", allowedTopics: ["hydraulics", "fluid power", "mobile equipment", "industrial equipment"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.powermotiontech.com/__rss/website-scheduled-content.xml?input=%7B%22sectionAlias%22%3A%22hydraulics%22%7D", sourceTrustScore: 90 },
        { id: "fluid-power-journal", name: "Fluid Power Journal", domain: "fluidpowerjournal.com", type: "trade-media", allowedTopics: ["hydraulics", "fluid power", "mobile machinery", "industrial equipment"], allowedLanguages: ["en"], rssOrApiUrl: "https://fluidpowerjournal.com/feed/", sourceTrustScore: 85 },
        { id: "fluid-power-world", name: "Fluid Power World", domain: "www.fluidpowerworld.com", type: "trade-media", allowedTopics: ["hydraulics", "fluid power", "industrial equipment"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.fluidpowerworld.com/feed/", sourceTrustScore: 80 },
      ],
      fallbackWhitelist: [
        { id: "nist-engineering", name: "NIST News", domain: "www.nist.gov", type: "research-institute", allowedTopics: ["manufacturing", "materials", "standards"], allowedLanguages: ["en"], rssOrApiUrl: "https://www.nist.gov/news-events/news/rss.xml", sourceTrustScore: 90 },
      ],
    },
    publishing: {
      cmsAdapter: "postgres-news-cms",
      contentStatusAfterPublish: "published",
      requireFrontendVerification: true,
      alertChannel: "database-audit",
      productionEnabled: process.env.NEWS_AUTOMATION_PRODUCTION_ENABLED === "true",
    },
  },
];

export function getSiteConfig(siteId = process.env.NEWS_AUTOMATION_SITE_ID) {
  if (!siteId) {
    if (siteConfigs.length !== 1) throw new Error("NEWS_AUTOMATION_SITE_ID is required when more than one site is configured");
    return siteConfigs[0];
  }
  const config = siteConfigs.find((item) => item.siteId === siteId);
  if (!config) throw new Error(`Unknown News automation site: ${siteId}`);
  return config;
}

export function validateSiteConfig(config: SiteConfig) {
  const errors: string[] = [];
  if (!config.siteId || !config.siteUrl || !config.industryScope || !config.publicationLanguage || !config.timezone) errors.push("site identity, URL, industry scope, language and timezone are required");
  if (!config.news.listRoute || !config.news.detailRoutePattern || !config.news.rssRoute || !config.news.sitemapRoute) errors.push("News route configuration is incomplete");
  if (!config.productThemePlan.length || config.productThemePlan.some((theme) => !theme.themeId || !theme.productName || !theme.productUrl)) errors.push("product theme plan is incomplete");
  if (!config.sources.primaryWhitelist.length || !config.sources.fallbackWhitelist.length) errors.push("primary and fallback source whitelists are required");
  for (const source of [...config.sources.primaryWhitelist, ...config.sources.fallbackWhitelist]) {
    if (!source.domain || !source.rssOrApiUrl.startsWith("https://") || !source.allowedLanguages.includes(config.publicationLanguage)) errors.push(`invalid source configuration: ${source.id}`);
  }
  return { valid: errors.length === 0, errors };
}

export function getActiveProductTheme(config: SiteConfig, at = new Date()) {
  const time = at.getTime();
  return config.productThemePlan.find((theme) => theme.status === "active" && new Date(theme.startAt).getTime() <= time && time < new Date(theme.endAt).getTime());
}
