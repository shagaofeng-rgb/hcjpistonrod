import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildSitemapDocuments, diffSitemapEntries, renderSitemapIndex, renderUrlSet, shouldIncludeCmsPage, validateSitemapXml, type SitemapEntry } from "../src/lib/sitemap/core";
import { submitSitemapToSearchConsole } from "../src/lib/sitemap/google";
import { writeXmlAtomically } from "../scripts/sitemap-generate";
import { releaseInMemorySitemapLock, tryAcquireInMemorySitemapLock } from "../src/lib/sitemap/service";

const entry = (loc: string, lastmod = "2026-07-01T00:00:00.000Z", kind: SitemapEntry["kind"] = "products"): SitemapEntry => ({ loc, lastmod, kind });

test("generates valid XML and escapes URLs", () => {
  const xml = renderUrlSet([entry("https://hcjpistonrod.com/products/rod?a=1&b=2")]);
  assert.equal(validateSitemapXml(xml), true);
  assert.match(xml, /a=1&amp;b=2/);
});

test("excludes drafts, noindex, disabled and non-self canonical content", () => {
  const expectedUrl = "https://hcjpistonrod.com/products/rod";
  assert.equal(shouldIncludeCmsPage({ status: "draft", expectedUrl }), false);
  assert.equal(shouldIncludeCmsPage({ status: "published", robots: "noindex,follow", expectedUrl }), false);
  assert.equal(shouldIncludeCmsPage({ status: "published", sitemapEnabled: false, expectedUrl }), false);
  assert.equal(shouldIncludeCmsPage({ status: "published", canonicalUrl: "/products/other", expectedUrl }), false);
  assert.equal(shouldIncludeCmsPage({ status: "published", canonicalUrl: expectedUrl, expectedUrl }), true);
});

test("tracks deleted and modified URLs using real lastmod", () => {
  const diff = diffSitemapEntries([entry("https://hcjpistonrod.com/old"), entry("https://hcjpistonrod.com/keep")], [entry("https://hcjpistonrod.com/keep", "2026-07-02T00:00:00.000Z"), entry("https://hcjpistonrod.com/new")]);
  assert.deepEqual(diff.added, ["https://hcjpistonrod.com/new"]);
  assert.deepEqual(diff.removed, ["https://hcjpistonrod.com/old"]);
  assert.deepEqual(diff.modified, ["https://hcjpistonrod.com/keep"]);
});

test("splits large content sets and creates a valid index", () => {
  const documents = buildSitemapDocuments([entry("https://hcjpistonrod.com/p/1"), entry("https://hcjpistonrod.com/p/2"), entry("https://hcjpistonrod.com/p/3")], { maxUrls: 2 });
  const products = documents.filter((document) => document.kind === "products");
  assert.equal(products.length, 2);
  assert.equal(products[0].fileName, "sitemaps/products-1.xml");
  assert.equal(validateSitemapXml(renderSitemapIndex("https://hcjpistonrod.com", documents)), true);
});

test("atomic writes preserve the old file when validation fails", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "hcj-sitemap-"));
  const file = path.join(dir, "sitemap.xml");
  await writeFile(file, "old", "utf8");
  await assert.rejects(() => writeXmlAtomically(file, "broken"));
  assert.equal(await readFile(file, "utf8"), "old");
  await rm(dir, { recursive: true, force: true });
});

test("concurrent sitemap maintenance is rejected by the task lock", () => {
  releaseInMemorySitemapLock();
  assert.equal(tryAcquireInMemorySitemapLock(), true);
  assert.equal(tryAcquireInMemorySitemapLock(), false);
  releaseInMemorySitemapLock();
  assert.equal(tryAcquireInMemorySitemapLock(), true);
  releaseInMemorySitemapLock();
});

test("Search Console stays disabled without calling Google", async () => {
  let calls = 0;
  const result = await submitSitemapToSearchConsole({ enabled: false, fetchImpl: async () => { calls += 1; return new Response(); } });
  assert.equal(result.attempted, false);
  assert.equal(calls, 0);
});

test("Search Console submission succeeds with an authorized token", async () => {
  const calls: string[] = [];
  const result = await submitSitemapToSearchConsole({
    enabled: true,
    siteUrl: "sc-domain:hcjpistonrod.com",
    sitemapUrl: "https://www.hcjpistonrod.com/sitemap.xml",
    accessToken: "test-token",
    fetchImpl: async (input, init) => {
      calls.push(`${init?.method || "GET"} ${String(input)}`);
      return new Response("", { status: 200 });
    },
  });
  assert.equal(result.success, true);
  assert.equal(calls.length, 2);
  assert.match(calls[1], /^PUT https:\/\/www\.googleapis\.com\/webmasters\/v3\/sites\//);
});

test("Search Console authentication failure is returned without throwing", async () => {
  const result = await submitSitemapToSearchConsole({
    enabled: true,
    siteUrl: "sc-domain:hcjpistonrod.com",
    sitemapUrl: "https://www.hcjpistonrod.com/sitemap.xml",
    accessToken: "bad-token",
    fetchImpl: async (_input, init) => new Response("", { status: init?.method === "PUT" ? 403 : 200 }),
  });
  assert.equal(result.success, false);
  assert.equal(result.status, 403);
});
