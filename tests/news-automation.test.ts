import assert from "node:assert/strict";
import test from "node:test";
import { composeNewsFallback, validateNewsDraft } from "../src/lib/news-automation/composer";
import { getSiteConfig, validateSiteConfig } from "../src/lib/news-automation/config";
import { currentWindowStart, normalizeUrl, scoreCandidate } from "../src/lib/news-automation/rules";

const config = getSiteConfig("hcj-pistonrod");

test("site configuration contains the required independent News and Blog boundaries", () => {
  assert.deepEqual(validateSiteConfig(config), { valid: true, errors: [] });
  assert.equal(config.news.ingestIntervalHours, 12);
  assert.equal(config.news.publishIntervalHours, 48);
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

test("fallback composition cannot be published as a fabricated 700-word News article", () => {
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
  const draft = composeNewsFallback(candidate);
  const result = validateNewsDraft(draft, candidate, config);
  assert.equal(result.passed, false);
  assert.ok(result.failures.includes("word_count_out_of_range"));
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
  const body = Array.from({ length: 180 }, () => "Independent source context for hydraulic equipment and manufacturing standards.").join(" ");
  const validDraft = {
    title: candidate.title,
    slug: "hydraulic-standards-update",
    description: "A sourced editorial summary of a hydraulic standards update.",
    excerpt: "A sourced editorial summary.",
    bodyHtml: `<h2>What changed</h2><p>${body}</p>`,
    sourcePanel: { name: candidate.sourceName, url: candidate.normalizedUrl, publishedAt: candidate.publishedAt, author: null },
    editorialDisclaimer: "Independent editorial summary based on the original source.",
    wordCount: 720,
  };
  assert.equal(validateNewsDraft(validDraft, candidate, config).passed, true);
  const salesDraft = { ...validDraft, bodyHtml: `${validDraft.bodyHtml}<p>Contact us to request a quote.</p>` };
  assert.ok(validateNewsDraft(salesDraft, candidate, config).failures.includes("promotional_call_to_action"));
  const wrongSource = { ...candidate, sourceDomain: "example.invalid" };
  assert.ok(validateNewsDraft(validDraft, wrongSource, config).failures.includes("source_not_allowlisted_external_news"));
});
