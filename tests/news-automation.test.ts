import assert from "node:assert/strict";
import test from "node:test";
import { calculateProductRelevance, canonicalizeSourceUrl, createEventFingerprint, createSourceFingerprint, isAllowedNewsLanguage, isSafeExternalUrl, isWithinLookback, normalizeTitle, parseNewsFeed, sanitizeArticleHtml, selectOwnedNewsImage } from "../src/lib/news-automation";

test("normalizes source URLs and titles for stable deduplication", () => {
  assert.equal(canonicalizeSourceUrl("https://Example.com/item/?utm_source=x&id=1#top"), "https://example.com/item?id=1");
  assert.equal(normalizeTitle("  Chrome-Plated ROD! "), "chrome plated rod");
});

test("fingerprints match equivalent source events", () => {
  const first = { title: "Hydraulic market update", url: "https://example.com/a?utm_source=x", publisher: "Example", publishedAt: "2026-07-10T01:00:00Z" };
  const second = { ...first, url: "https://example.com/a" };
  assert.equal(createSourceFingerprint(first), createSourceFingerprint(second));
  assert.equal(createEventFingerprint(first), createEventFingerprint(second));
});

test("enforces the publication lookback window", () => {
  const now = new Date("2026-07-10T12:00:00Z");
  assert.equal(isWithinLookback("2026-07-09T12:00:00Z", 72, now), true);
  assert.equal(isWithinLookback("2026-07-01T12:00:00Z", 72, now), false);
  assert.equal(isWithinLookback("2026-07-11T12:00:00Z", 72, now), false);
});

test("blocks unsafe feed and image URLs", () => {
  assert.equal(isSafeExternalUrl("https://industry.example.com/feed.xml"), true);
  assert.equal(isSafeExternalUrl("http://industry.example.com/feed.xml"), false);
  assert.equal(isSafeExternalUrl("https://127.0.0.1/feed.xml"), false);
  assert.equal(isSafeExternalUrl("https://192.168.1.10/feed.xml"), false);
});

test("parses RSS candidates with source image attribution", () => {
  const candidates = parseNewsFeed(`<?xml version="1.0"?><rss><channel><title>Industry Source</title><language>en</language><item><title>Hydraulic cylinder demand</title><link>https://example.com/story</link><pubDate>Fri, 10 Jul 2026 01:00:00 GMT</pubDate><description>Hydraulic machinery market update.</description><enclosure type="image/jpeg" url="https://cdn.example.com/story.jpg" /></item></channel></rss>`);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].publisher, "Industry Source");
  assert.equal(candidates[0].imageUrl, "https://cdn.example.com/story.jpg");
});

test("sanitizes generated HTML to the editorial allowlist", () => {
  const clean = sanitizeArticleHtml('<h2 class="x">Title</h2><p onclick="bad()">Body</p><script>alert(1)</script><img src="x">');
  assert.equal(clean, "<h2>Title</h2><p>Body</p>");
});

test("scores hydraulic product relevance", () => {
  assert.ok(calculateProductRelevance("Hydraulic piston rod chrome plated rod surface finish for machinery seals") >= 0.4);
});

test("uses owned factory images for generated articles", () => {
  assert.equal(selectOwnedNewsImage("hard chrome piston rod market"), "/images/factory/chrome-rod-stock.jpg");
  assert.equal(selectOwnedNewsImage("honed cylinder tube demand"), "/images/factory/raw-material-stock.jpg");
});

test("accepts regional variants of configured news languages", () => {
  assert.equal(isAllowedNewsLanguage("en-US", ["en"]), true);
  assert.equal(isAllowedNewsLanguage("de-DE", ["en"]), false);
});
