import assert from "node:assert/strict";
import test from "node:test";
import { topicRotation } from "../src/lib/content-ops/catalog";
import { getContentOpsConfig } from "../src/lib/content-ops/config";
import { generateDeterministicDraft } from "../src/lib/content-ops/generator";
import { createGithubContentCommit } from "../src/lib/content-ops/github";
import { renderControlledMarkdown } from "../src/lib/content-ops/markdown";
import { selectNextTopic } from "../src/lib/content-ops/rotation";
import { buildValidation, similarity, validateSource } from "../src/lib/content-ops/validators";

test("rejects non-allowlisted or stale news sources", () => {
  const source = { id: "source", name: "Source", url: "https://example.com", sourceType: "research" as const, allowlisted: false };
  assert.equal(validateSource(source, new Date().toISOString(), 90).passed, false);
  assert.equal(validateSource({ ...source, allowlisted: true }, "2020-01-01T00:00:00.000Z", 90).passed, false);
});

test("rotation avoids a product family after two appearances in the latest eight records", () => {
  const history = Array.from({ length: 2 }, () => topicRotation[0]);
  const next = selectNextTopic(history);
  assert.ok(next);
  assert.notEqual(next?.productFamily, topicRotation[0].productFamily);
});

test("generated HCJ draft passes deterministic quality gates but remains unpublished", () => {
  const draft = generateDeterministicDraft(topicRotation[0]);
  const validation = buildValidation(draft, [], 0.82, 0.72, false);
  assert.equal(validation.claims.passed, true);
  assert.equal(validation.links.passed, true);
  assert.equal(validation.images.passed, true);
  assert.equal(validation.contentQuality.passed, true);
  assert.equal(validation.publish.passed, false);
});

test("near-duplicate titles are detected", () => {
  assert.ok(similarity("Review chrome plated rod for hydraulic rebuild", "Review chrome plated rod for hydraulic cylinder rebuild") > 0.8);
});

test("draft_only configuration cannot publish", () => {
  const previous = { enabled: process.env.CONTENT_OPS_ENABLED, dry: process.env.CONTENT_OPS_DRY_RUN, mode: process.env.PUBLISH_MODE, auto: process.env.AUTO_PUBLISH };
  process.env.CONTENT_OPS_ENABLED = "true";
  process.env.CONTENT_OPS_DRY_RUN = "true";
  process.env.PUBLISH_MODE = "draft_only";
  process.env.AUTO_PUBLISH = "false";
  assert.equal(getContentOpsConfig().canPublish, false);
  if (previous.enabled === undefined) delete process.env.CONTENT_OPS_ENABLED; else process.env.CONTENT_OPS_ENABLED = previous.enabled;
  if (previous.dry === undefined) delete process.env.CONTENT_OPS_DRY_RUN; else process.env.CONTENT_OPS_DRY_RUN = previous.dry;
  if (previous.mode === undefined) delete process.env.PUBLISH_MODE; else process.env.PUBLISH_MODE = previous.mode;
  if (previous.auto === undefined) delete process.env.AUTO_PUBLISH; else process.env.AUTO_PUBLISH = previous.auto;
});

test("all production publishing switches must be enabled", () => {
  const previous = { enabled: process.env.CONTENT_OPS_ENABLED, dry: process.env.CONTENT_OPS_DRY_RUN, mode: process.env.PUBLISH_MODE, auto: process.env.AUTO_PUBLISH };
  process.env.CONTENT_OPS_ENABLED = "true";
  process.env.CONTENT_OPS_DRY_RUN = "false";
  process.env.PUBLISH_MODE = "auto";
  process.env.AUTO_PUBLISH = "true";
  assert.equal(getContentOpsConfig().canPublish, true);
  if (previous.enabled === undefined) delete process.env.CONTENT_OPS_ENABLED; else process.env.CONTENT_OPS_ENABLED = previous.enabled;
  if (previous.dry === undefined) delete process.env.CONTENT_OPS_DRY_RUN; else process.env.CONTENT_OPS_DRY_RUN = previous.dry;
  if (previous.mode === undefined) delete process.env.PUBLISH_MODE; else process.env.PUBLISH_MODE = previous.mode;
  if (previous.auto === undefined) delete process.env.AUTO_PUBLISH; else process.env.AUTO_PUBLISH = previous.auto;
});

test("controlled markdown renderer creates presentation HTML without executable markup", () => {
  const html = renderControlledMarkdown("# Hidden title\n\n## Checklist\n\n| Input | Why |\n| --- | --- |\n| Drawing | Review |\n\n<script>alert(1)</script>");
  assert.match(html, /<h2>Checklist<\/h2>/);
  assert.match(html, /<table>/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("GitHub adapter refuses to write without server-side credentials", async () => {
  const result = await createGithubContentCommit({ owner: "", repo: "", branch: "main", token: "" }, "content/example.md", "draft", "draft");
  assert.equal(result.ok, false);
});
