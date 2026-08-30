import assert from "node:assert/strict";
import test from "node:test";
import { composeSourceNativeNews, validateNewsDraft } from "../src/lib/news-automation/composer";
import { getSiteConfig, validateSiteConfig } from "../src/lib/news-automation/config";
import { currentWindowStart, normalizeUrl, scoreCandidate } from "../src/lib/news-automation/rules";
import { parseFeedItems } from "../src/lib/news-automation/service";

const config = getSiteConfig("hcj-pistonrod");

test("site configuration contains the required independent News and Blog boundaries", () => {
  assert.deepEqual(validateSiteConfig(config), { valid: true, errors: [] });
  assert.equal(config.news.ingestIntervalHours, 12);
  assert.equal(config.news.publishIntervalHours, 48);
  assert.equal(config.news.publicationMode, "source-native");
  assert.equal(config.blog.allowNewsAutomation, false);
  assert.notEqual(config.news.listRoute, config.blog.listRoute);
  assert.notEqual(config.news.sitemapRoute, config.blog.sitemapRoute);
});

test("site configuration rejects missing fallback sources", () => {
  const invalid = { ...config, sources: { ...config.sources, fallbackWhitelist: [] } };
  assert.equal(validateSiteConfig(invalid).valid, false);
});

test("window calculation uses the configured site timezone for 12h and 48h cycles", () => {
  const instant = new Date("2026-08-11T03:41:00.000Z");
  assert.equal(currentWindowStart(instant, 12, "Asia/Shanghai"), "2026-08-11T00:00:00+08:00");
  assert.equal(currentWindowStart(instant, 48, "Asia/Shanghai"), "2026-08-11T00:00:00+08:00");
  assert.equal(currentWindowStart(new Date("2026-08-12T03:41:00.000Z"), 48, "Asia/Shanghai"), "2026-08-11T00:00:00+08:00");
});

test("candidate URLs are normalized before deduplication", () => {
  assert.equal(normalizeUrl("https://Example.com/path/?utm_source=x&gclid=y#fragment"), "https://example.com/path");
});

test("relevant fresh external candidate is scored while stale or unrelated candidates are rejected", () => {
  const now = new Date("2026-08-11T04:00:00.000Z");
  const base = {
    sourceId: "fluid-power-world",
    sourceName: "Fluid Power World",
    sourceDomain: "www.fluidpowerworld.com",
    title: "Hydraulic cylinder manufacturing standard update",
    url: "https://www.fluidpowerworld.com/example?utm_source=test",
    publishedAt: "2026-08-10T04:00:00.000Z",
    language: "en",
    summary: "The update discusses hydraulic equipment manufacturing, materials inspection, supply chain quality and industrial safety requirements.",
    imageRights: "not-used" as const,
  };
  const accepted = scoreCandidate(base, config, now);
  assert.equal(accepted.rejectReason, undefined);
  assert.ok(accepted.score >= config.news.minScore);
  const stale = scoreCandidate({ ...base, publishedAt: "2026-07-01T04:00:00.000Z" }, config, now);
  assert.equal(stale.rejectReason, "outside_allowed_age_window");
  const unrelated = scoreCandidate({ ...base, title: "Consumer software update", summary: "A general software user-interface release." }, config, now);
  assert.equal(unrelated.rejectReason, "outside_industry_scope");
});

test("specialist fluid-power sources retain relevant RSS items with concise summaries", () => {
  const candidate = scoreCandidate({
    sourceId: "fluid-power-world",
    sourceName: "Fluid Power World",
    sourceDomain: "www.fluidpowerworld.com",
    title: "When Experience Drives Design",
    url: "https://www.fluidpowerworld.com/when-experience-drives-design/",
    publishedAt: "2026-08-11T10:00:00.000Z",
    language: "en",
    summary: "A collaborative approach to modern mobile hydraulics and quality control.",
    imageRights: "not-used",
  }, config, new Date("2026-08-13T01:00:00.000Z"));
  assert.equal(candidate.rejectReason, undefined);
  assert.ok(candidate.score >= config.news.minScore);
});

test("a recent specialist hydraulics source can be used as the seven-day publication fallback", () => {
  const candidate = scoreCandidate({
    sourceId: "power-motion-tech-hydraulics",
    sourceName: "Power & Motion Tech",
    sourceDomain: "www.powermotiontech.com",
    title: "Hydraulics technologies on display at an off-highway equipment event",
    url: "https://www.powermotiontech.com/hydraulics/news/example",
    publishedAt: "2026-08-18T13:11:00.000Z",
    language: "en",
    summary: "The industry update covers hydraulic systems, mobile equipment and fluid power technology for engineering teams.",
    imageRights: "not-used",
  }, config, new Date("2026-08-22T01:25:00.000Z"));
  assert.equal(candidate.rejectReason, undefined);
  assert.ok(candidate.score >= config.news.minScore);
  assert.equal(candidate.scoreBreakdown.scope, 30);
  assert.equal(candidate.scoreBreakdown.freshness, 6);
});

test("a specialist hydraulics feed retains an off-highway application report within the seven-day fallback", () => {
  const candidate = scoreCandidate({
    sourceId: "power-motion-tech-hydraulics",
    sourceName: "Power & Motion Tech",
    sourceDomain: "www.powermotiontech.com",
    title: "iVT Expo 2026: Key Trends Driving Off-Highway Machinery Designs",
    url: "https://www.powermotiontech.com/hydraulics/article/example",
    publishedAt: "2026-08-25T12:58:00.000Z",
    language: "en",
    summary: "Automation, cybersecurity, full system solutions and electrification were key off-highway equipment design trends.",
    imageRights: "not-used",
  }, config, new Date("2026-08-30T04:00:00.000Z"));
  assert.equal(candidate.rejectReason, undefined);
  assert.ok(candidate.score >= config.news.minScore);
  assert.equal(candidate.scoreBreakdown.scope, 30);
  assert.equal(candidate.scoreBreakdown.freshness, 6);
});

test("WordPress source APIs are normalized as metadata-only News candidates", () => {
  const source = {
    id: "wordpress-test-source",
    name: "WordPress Test Source",
    domain: "example.test",
    type: "trade-media" as const,
    allowedTopics: ["hydraulics"],
    allowedLanguages: ["en"],
    rssOrApiUrl: "https://example.test/wp-json/wp/v2/posts",
    sourceTrustScore: 85,
  };
  const items = parseFeedItems(JSON.stringify([{
    date_gmt: "2026-08-11T10:00:00",
    modified_gmt: "2026-08-11T11:00:00",
    link: "https://fluidpowerjournal.com/when-experience-drives-design/",
    title: { rendered: "When Experience Drives Design" },
    excerpt: { rendered: "<p>A collaborative approach to modern mobile hydraulics.</p>" },
  }]), source, config);
  assert.equal(items.length, 1);
  assert.equal(items[0].publishedAt, "2026-08-11T10:00:00.000Z");
  assert.equal(items[0].summary, "A collaborative approach to modern mobile hydraulics.");
});

test("RSS dates with a GMT suffix are normalized without an invalid extra timezone suffix", () => {
  const source = {
    id: "rss-test-source",
    name: "RSS Test Source",
    domain: "example.test",
    type: "trade-media" as const,
    allowedTopics: ["hydraulics"],
    allowedLanguages: ["en"],
    rssOrApiUrl: "https://example.test/rss.xml",
    sourceTrustScore: 85,
  };
  const items = parseFeedItems(`<?xml version="1.0"?><rss><channel><item><title>Hydraulics update</title><link>https://example.test/hydraulics-update</link><pubDate>18 Aug 2026 14:33 GMT</pubDate><description>Hydraulic equipment update.</description></item></channel></rss>`, source, config);
  assert.equal(items.length, 1);
  assert.equal(items[0].publishedAt, "2026-08-18T14:33:00.000Z");
});

test("source-native composition publishes a concise attributed brief without a model API", () => {
  const candidate = scoreCandidate({
    sourceId: "fluid-power-world",
    sourceName: "Fluid Power World",
    sourceDomain: "www.fluidpowerworld.com",
    title: "Hydraulic equipment update",
    url: "https://www.fluidpowerworld.com/example",
    publishedAt: "2026-08-10T04:00:00.000Z",
    language: "en",
    summary: "A source summary about hydraulic equipment.",
    imageRights: "not-used",
  }, config, new Date("2026-08-11T04:00:00.000Z"));
  const draft = composeSourceNativeNews(candidate);
  const result = validateNewsDraft(draft, candidate, config);
  assert.equal(result.passed, true);
  assert.equal(draft.publicationMode, "source-native");
  assert.match(draft.bodyHtml, /This is a concise source-attributed brief/);
  assert.match(draft.bodyHtml, /Fluid Power World/);
});

test("quality gates reject non-allowlisted sources, sales calls to action and excessive internal links", () => {
  const candidate = scoreCandidate({
    sourceId: "fluid-power-world",
    sourceName: "Fluid Power World",
    sourceDomain: "www.fluidpowerworld.com",
    title: "Hydraulic standards update",
    url: "https://www.fluidpowerworld.com/example",
    publishedAt: "2026-08-10T04:00:00.000Z",
    language: "en",
    summary: "Hydraulic equipment manufacturing standards, inspection and supply-chain information.",
    imageRights: "not-used",
  }, config, new Date("2026-08-11T04:00:00.000Z"));
  const validDraft = composeSourceNativeNews(candidate);
  assert.equal(validateNewsDraft(validDraft, candidate, config).passed, true);
  const salesDraft = { ...validDraft, bodyHtml: `${validDraft.bodyHtml}<p>Contact us to request a quote.</p>` };
  assert.ok(validateNewsDraft(salesDraft, candidate, config).failures.includes("promotional_call_to_action"));
  const wrongSource = { ...candidate, sourceDomain: "example.invalid" };
  assert.ok(validateNewsDraft(validDraft, wrongSource, config).failures.includes("source_not_allowlisted_external_news"));
});
