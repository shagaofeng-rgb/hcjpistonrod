export type NewsSourceType = "regulator" | "standards-body" | "trade-media" | "research-institute" | "manufacturer-newsroom";

export type SiteNewsSource = {
  id: string;
  name: string;
  domain: string;
  type: NewsSourceType;
  allowedTopics: string[];
  allowedLanguages: string[];
  rssOrApiUrl: string;
  sourceTrustScore: number;
};

export type ProductTheme = {
  themeId: string;
  productUrl: string;
  productName: string;
  startAt: string;
  endAt: string;
  status: "active" | "inactive";
};

export type SiteNewsConfig = {
  enabled: boolean;
  listRoute: "/news/";
  detailRoutePattern: "/news/[slug]/";
  rssRoute: "/news/rss.xml";
  sitemapRoute: "/news-sitemap.xml";
  desiredWordCount: { min: number; max: number };
  ingestIntervalHours: 12;
  publishIntervalHours: 48;
  candidateMaxAgeHours: number;
  fallbackCandidateMaxAgeDays: number;
  minScore: number;
  maxInternalProductLinks: 1;
  defaultAuthorType: "Editorial Team";
};

export type SiteConfig = {
  siteId: string;
  enabled: boolean;
  brandName: string;
  siteUrl: string;
  industry: string;
  industryScope: string;
  targetMarkets: string[];
  publicationLanguage: string;
  locale: string;
  timezone: string;
  news: SiteNewsConfig;
  blog: {
    enabled: boolean;
    listRoute: "/blog/";
    detailRoutePattern: "/blog/[slug]/";
    sitemapRoute: "/blog-sitemap.xml";
    contentSource: string;
    allowNewsAutomation: false;
  };
  productThemePlan: ProductTheme[];
  sources: {
    primaryWhitelist: SiteNewsSource[];
    fallbackWhitelist: SiteNewsSource[];
  };
  publishing: {
    cmsAdapter: "postgres-news-cms";
    contentStatusAfterPublish: "published";
    requireFrontendVerification: true;
    alertChannel: "database-audit";
    productionEnabled: boolean;
  };
};

export type CandidateInput = {
  sourceId: string;
  sourceName: string;
  sourceDomain: string;
  title: string;
  url: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string | null;
  language: string;
  summary: string;
  imageUrl?: string | null;
  imageRights: "not-used" | "unknown" | "owned-neutral";
};

export type ScoredCandidate = CandidateInput & {
  normalizedUrl: string;
  urlHash: string;
  titleHash: string;
  contentFingerprint: string;
  score: number;
  scoreBreakdown: Record<"scope" | "buyerImpact" | "freshness" | "source" | "theme" | "image", number>;
  rejectReason?: string;
};

export type NewsDraft = {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  bodyHtml: string;
  sourcePanel: {
    name: string;
    url: string;
    publishedAt: string;
    author: string | null;
  };
  editorialDisclaimer: string;
  relatedProductSlug?: string;
  wordCount: number;
};
