import { createHash } from "node:crypto";
import type { CandidateInput, ScoredCandidate, SiteConfig } from "./types";

const scopeTerms = ["hydraulic", "mobile hydraulics", "fluid power", "piston rod", "chrome", "honed", "cylinder", "manufactur", "machin", "material", "steel", "coating", "industrial", "engineering", "standard", "supply chain", "equipment"];
const hydraulicApplicationTerms = ["off-highway", "mobile equipment", "construction machinery", "agricultural machinery", "material handling", "mining equipment", "motion control", "actuator", "pump", "valve", "filtration", "reservoir", "hydraulic reel"];
const buyerTerms = ["standard", "regulation", "safety", "supply", "quality", "manufactur", "equipment", "material", "technology", "inspection", "energy", "off-highway", "automation", "cybersecurity", "electrification", "motion control", "reliability", "maintenance", "efficiency", "system", "application"];

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || ["fbclid", "gclid"].includes(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString();
}

function tokenCount(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.filter((term) => normalized.includes(term)).length;
}

function ageHours(value: string, now: Date) {
  return (now.getTime() - new Date(value).getTime()) / 3_600_000;
}

export function scoreCandidate(input: CandidateInput, config: SiteConfig, now = new Date()): ScoredCandidate {
  const normalizedUrl = normalizeUrl(input.url);
  const text = `${input.title} ${input.summary}`;
  const age = ageHours(input.publishedAt, now);
  const sourceConfig = [...config.sources.primaryWhitelist, ...config.sources.fallbackWhitelist].find((item) => item.id === input.sourceId);
  const isSpecialistFluidPowerSource = sourceConfig?.allowedTopics.some((topic) => ["hydraulics", "fluid power"].includes(topic.toLowerCase())) ?? false;
  const hasHydraulicContext = /\b(?:hydraulics?|fluid power)\b/i.test(text);
  const hasRelevantApplication = tokenCount(text, hydraulicApplicationTerms) > 0;
  // A dedicated allowlisted hydraulics feed is already narrowed to this site's
  // industry. Its relevant entries should receive the full scope allocation;
  // otherwise a concise headline can be incorrectly rejected for lacking
  // enough repeated keywords.
  const trustedSpecialistScope = isSpecialistFluidPowerSource && (hasHydraulicContext || hasRelevantApplication) ? 30 : 0;
  const scope = Math.min(30, Math.max(tokenCount(text, scopeTerms) * 4, trustedSpecialistScope));
  const buyerImpact = Math.min(20, tokenCount(text, buyerTerms) * 3);
  const freshness = age >= 0 && age <= config.news.candidateMaxAgeHours ? 15 : age >= 0 && age <= config.news.fallbackCandidateMaxAgeDays * 24 ? 6 : 0;
  const source = Math.min(15, Math.round(sourceConfig?.sourceTrustScore ?? 0) / 6);
  const theme = getThemeScore(text, config);
  const image = input.imageRights === "owned-neutral" || input.imageRights === "not-used" ? 5 : 0;
  const score = scope + buyerImpact + freshness + source + theme + image;
  const rejectReason = !input.language.toLowerCase().startsWith(config.publicationLanguage) ? "language_mismatch"
    : age < 0 || age > config.news.fallbackCandidateMaxAgeDays * 24 ? "outside_allowed_age_window"
      : scope < 12 ? "outside_industry_scope"
        : score < config.news.minScore ? "below_minimum_score" : undefined;
  return {
    ...input,
    normalizedUrl,
    urlHash: sha256(normalizedUrl),
    titleHash: sha256(input.title.trim().toLowerCase()),
    contentFingerprint: sha256(`${input.title.trim().toLowerCase()}\n${input.summary.trim().toLowerCase().replace(/\s+/g, " ")}`),
    score,
    scoreBreakdown: { scope, buyerImpact, freshness, source, theme, image },
    rejectReason,
  };
}

function getThemeScore(text: string, config: SiteConfig) {
  const normalized = text.toLowerCase();
  return config.productThemePlan.some((theme) => normalized.includes(theme.productName.toLowerCase().replace(/s$/, "")) || normalized.includes("hydraulic")) ? 15 : 0;
}

export function currentWindowStart(date: Date, intervalHours: number, timezone: string) {
  if (intervalHours <= 0 || 24 % Math.min(intervalHours, 24) !== 0 || intervalHours % 12 !== 0) throw new Error("News intervals must be positive 12-hour multiples");
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", timeZoneName: "shortOffset" }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  const offsetName = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";
  const offsetMatch = /^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(offsetName);
  const offset = offsetMatch ? `${offsetMatch[1]}${offsetMatch[2].padStart(2, "0")}:${offsetMatch[3] ?? "00"}` : "+00:00";
  const hour = read("hour");
  const year = read("year");
  const monthValue = read("month");
  const dayValue = read("day");
  const month = String(monthValue).padStart(2, "0");
  const day = String(dayValue).padStart(2, "0");
  if (intervalHours < 24) {
    const windowHour = Math.floor(hour / intervalHours) * intervalHours;
    return `${year}-${month}-${day}T${String(windowHour).padStart(2, "0")}:00:00${offset}`;
  }
  const blockDays = intervalHours / 24;
  const localDayIndex = Math.floor(Date.UTC(year, monthValue - 1, dayValue) / 86_400_000);
  const blockStart = new Date(Math.floor(localDayIndex / blockDays) * blockDays * 86_400_000);
  const blockYear = blockStart.getUTCFullYear();
  const blockMonth = String(blockStart.getUTCMonth() + 1).padStart(2, "0");
  const blockDay = String(blockStart.getUTCDate()).padStart(2, "0");
  return `${blockYear}-${blockMonth}-${blockDay}T00:00:00${offset}`;
}

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}

export function textWordCount(htmlOrText: string) {
  return htmlOrText.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
}
