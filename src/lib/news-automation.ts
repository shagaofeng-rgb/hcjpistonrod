import { createHash } from "node:crypto";
import { products } from "@/lib/site";

export type NewsAutomationStatus =
  | "ready"
  | "not_ready"
  | "skipped"
  | "running"
  | "failed";

export type NewsAutomationConfig = {
  dailyTarget: number;
  timezone: string;
  lookbackHours: number;
  dedupDays: number;
  relevanceThreshold: number;
  autoPublish: boolean;
  allowedLanguages: string[];
  hasDatabase: boolean;
  hasNewsApiKey: boolean;
  hasAiApiKey: boolean;
};

export type NewsCandidateInput = {
  title: string;
  url: string;
  publisher?: string;
  author?: string;
  publishedAt: string;
  bodyText?: string;
};

export function getNewsAutomationConfig(): NewsAutomationConfig {
  return {
    dailyTarget: Number(process.env.NEWS_DAILY_TARGET || 4),
    timezone: process.env.NEWS_TIMEZONE || "Asia/Shanghai",
    lookbackHours: Number(process.env.NEWS_LOOKBACK_HOURS || 72),
    dedupDays: Number(process.env.NEWS_DEDUP_DAYS || 7),
    relevanceThreshold: Number(process.env.NEWS_RELEVANCE_THRESHOLD || 0.42),
    autoPublish: process.env.NEWS_AUTO_PUBLISH === "true",
    allowedLanguages: (process.env.NEWS_ALLOWED_LANGUAGES || "en")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    hasDatabase: Boolean(process.env.DATABASE_URL),
    hasNewsApiKey: Boolean(process.env.NEWS_API_KEY || process.env.NEWS_SOURCE_WHITELIST),
    hasAiApiKey: Boolean(process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY),
  };
}

export function canonicalizeSourceUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  const removableParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
    "fbclid",
    "gclid",
  ];
  removableParams.forEach((param) => url.searchParams.delete(param));
  url.hostname = url.hostname.toLowerCase();
  return url.toString().replace(/\/$/, "");
}

export function normalizeTitle(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function stableHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSourceFingerprint(candidate: NewsCandidateInput) {
  const canonicalUrl = canonicalizeSourceUrl(candidate.url);
  return stableHash([normalizeTitle(candidate.title), canonicalUrl, candidate.publisher || ""].join("|"));
}

export function createEventFingerprint(candidate: NewsCandidateInput) {
  const publishedDate = new Date(candidate.publishedAt).toISOString().slice(0, 10);
  return stableHash([normalizeTitle(candidate.title), candidate.publisher || "", publishedDate].join("|"));
}

export function isWithinLookback(publishedAt: string, lookbackHours = getNewsAutomationConfig().lookbackHours, now = new Date()) {
  const publishedTime = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) return false;
  const ageHours = (now.getTime() - publishedTime) / 36e5;
  return ageHours >= 0 && ageHours <= lookbackHours;
}

const productKeywordMap = products.map((product) => ({
  slug: product.slug,
  name: product.name,
  tokens: [product.name, product.model, product.category, ...product.applications, ...product.advantages]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3),
}));

export function getRelatedProductsForText(text: string, limit = 4) {
  const normalized = text.toLowerCase();
  return productKeywordMap
    .map((product) => ({
      slug: product.slug,
      score: product.tokens.reduce((sum, token) => sum + (normalized.includes(token) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.slug);
}

export function calculateProductRelevance(text: string) {
  const related = getRelatedProductsForText(text, 6);
  const domainTerms = [
    "hydraulic",
    "piston rod",
    "chrome plated rod",
    "honed tube",
    "cylinder",
    "machinery",
    "surface finish",
    "steel",
    "seal",
  ];
  const normalized = text.toLowerCase();
  const termHits = domainTerms.filter((term) => normalized.includes(term)).length;
  return Math.min(1, related.length * 0.16 + termHits * 0.08);
}

export function createNewsSlug(title: string, publishedAt: string) {
  const date = new Date(publishedAt).toISOString().slice(0, 10);
  const words = normalizeTitle(title).split(" ").slice(0, 9).join("-");
  return `${date}-${words}`.replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

export function getNewsAutomationReadiness() {
  const config = getNewsAutomationConfig();
  const missing = [
    !config.hasDatabase && "DATABASE_URL",
    !config.hasNewsApiKey && "NEWS_API_KEY or NEWS_SOURCE_WHITELIST",
    !config.hasAiApiKey && "AI_PROVIDER_API_KEY or OPENAI_API_KEY",
  ].filter(Boolean) as string[];

  return {
    status: missing.length ? ("not_ready" as const) : ("ready" as const),
    missing,
    config,
  };
}

export async function runNewsAutomation() {
  const readiness = getNewsAutomationReadiness();

  if (readiness.status !== "ready") {
    return {
      status: "not_ready" as NewsAutomationStatus,
      published: 0,
      reviewed: 0,
      rejected: 0,
      message:
        "News automation is installed but will not publish until database, source, and AI credentials are configured.",
      missing: readiness.missing,
      config: readiness.config,
    };
  }

  return {
    status: "skipped" as NewsAutomationStatus,
    published: 0,
    reviewed: 0,
    rejected: 0,
    message:
      "Runtime collection adapter is ready for credentials and source rules. No candidate was published during this local check.",
    missing: [],
    config: readiness.config,
  };
}
