import assert from "node:assert/strict";
import test from "node:test";
import { analyticsHash, classifyTraffic, exclusionReason, maskIp, parseUserAgent } from "../src/lib/analytics/visitor-analytics";

process.env.ANALYTICS_HASH_SECRET ||= "test-analytics-secret";

const event = { eventName: "page_view" as const, pagePath: "/products/chrome-plated-rod", visitorId: "b639ac20-7f51-4ab2-9a1b-d6d7c59c3a77", sessionId: "60c9f2d8-569e-4d9a-85a1-00ec1e1f9896", utm: {} };
const context = { host: "www.hcjpistonrod.com", ip: "203.0.113.42", userAgent: "Mozilla/5.0 Chrome/127.0", country: "US" };

test("masks IP addresses and only produces stable one-way hashes", () => {
  assert.equal(maskIp("203.0.113.42"), "203.0.113.*");
  assert.equal(maskIp("2001:db8:85a3:8a2e::7334"), "2001:db8:85a3:*");
  assert.equal(analyticsHash("203.0.113.42"), analyticsHash("203.0.113.42"));
  assert.notEqual(analyticsHash("203.0.113.42"), "203.0.113.42");
});

test("classifies direct, organic, referral and campaign sources", () => {
  assert.equal(classifyTraffic(undefined, {}, context.host).channel, "direct");
  assert.equal(classifyTraffic("https://www.google.com/search?q=rod", {}, context.host).channel, "organic_search");
  assert.equal(classifyTraffic("https://www.linkedin.com/feed", {}, context.host).channel, "social");
  assert.equal(classifyTraffic("https://buyer.example/article", {}, context.host).channel, "referral");
  assert.equal(classifyTraffic(undefined, { utm_source: "newsletter" }, context.host).channel, "campaign");
});

test("excludes non-production, automated and explicitly marked test traffic before storage", () => {
  assert.equal(exclusionReason(event, { ...context, host: "localhost" }), "non_production_host");
  assert.equal(exclusionReason(event, { ...context, userAgent: "Mozilla Playwright" }), "automated_client");
  assert.equal(exclusionReason({ ...event, utm: { utm_source: "codex-test" } }, context), "test_marker");
  assert.equal(exclusionReason(event, context, [{ rule_type: "ip_hash", match_value: analyticsHash(context.ip) }]), "admin_exclusion_rule");
});

test("detects common device and browser labels for operator filtering", () => {
  assert.deepEqual(parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17) AppleWebKit Safari/605.1"), { device: "mobile", browser: "Safari", os: "iOS" });
  assert.deepEqual(parseUserAgent("Mozilla/5.0 (Windows NT 10.0) Chrome/127.0"), { device: "desktop", browser: "Chrome", os: "Windows" });
});
