import process from "node:process";

const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
const baseUrl = (baseArg ? baseArg.split("=")[1] : process.env.SELF_CHECK_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const productionOrigin = "https://www.hcjpistonrod.com";

const keyPaths = [
  "/", "/products", "/products/chrome-plated-rod", "/products/honed-tube", "/products/ck45-chrome-plated-rod",
  "/why-xijiu", "/about", "/industries", "/news", "/news/choose-hard-chrome-plated-rod-for-mobile-machinery",
  "/blog", "/blog/choose-hard-chrome-plated-rod-for-mobile-machinery", "/search?q=chrome%20rod", "/contact",
  "/sitemap.xml", "/sitemap-pages.xml", "/sitemap-categories.xml", "/sitemap-products.xml", "/sitemap-posts.xml",
  "/news-sitemap.xml", "/news/rss.xml", "/robots.txt", "/admin/login",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function localizeUrl(value) {
  const url = new URL(value);
  return `${baseUrl}${url.pathname}${url.search}`;
}

function comparableUrl(value) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return `${url.origin}${url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "")}`;
}

async function fetchChecked(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${baseUrl}${pathOrUrl}`;
  const started = performance.now();
  const response = await fetch(url, { redirect: options.redirect || "follow", signal: AbortSignal.timeout(15_000) });
  const body = await response.text();
  const durationMs = Math.round(performance.now() - started);
  assert(response.status < 400, `${url} returned ${response.status}`);
  return { url, response, body, durationMs };
}

function assertHtml(path, body) {
  assert(body.includes("<title"), `${path} is missing a title`);
  assert(/<html[^>]+lang="en"/.test(body), `${path} is missing html lang=en`);
  assert(/<h1[\s>]/.test(body), `${path} is missing an H1`);
  assert(!body.includes("QR Code"), `${path} contains a QR Code placeholder`);
  assert(!body.includes(">Testimonials<"), `${path} contains unverified testimonials`);
  if (path.startsWith("/admin")) {
    assert(/noindex/.test(body), `${path} must be noindex`);
    assert(!body.includes("Quote Now"), `${path} contains public floating CTAs`);
  } else if (!path.startsWith("/search")) {
    assert(body.includes('rel="canonical"'), `${path} is missing a canonical URL`);
  }
  if (path.includes("/news/")) assert(body.includes("Source Information"), `${path} is missing source attribution`);
  if (path === "/products/ck45-chrome-plated-rod") assert(body.includes("Related News"), `${path} is missing related news`);
}

const results = [];
for (const path of keyPaths) {
  const item = await fetchChecked(path);
  const contentType = item.response.headers.get("content-type") || "";
  if (path.endsWith(".xml")) {
    assert(item.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), `${path} is not UTF-8 XML`);
    assert(contentType.includes("xml"), `${path} has the wrong content type`);
  } else if (path === "/robots.txt") {
    assert(item.body.includes(`Sitemap: ${productionOrigin}/sitemap.xml`), "robots.txt is missing the production sitemap index");
    assert(contentType.includes("text/plain"), "robots.txt has the wrong content type");
  } else {
    assertHtml(path, item.body);
  }
  results.push({ path, status: item.response.status, bytes: item.body.length, durationMs: item.durationMs });
}

const index = await fetchChecked("/sitemap.xml");
const sitemapLocations = [...index.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, "&"));
assert(sitemapLocations.length >= 4, "Sitemap index must contain pages, categories, products, and posts");

const publicUrls = [];
for (const location of sitemapLocations) {
  const document = await fetchChecked(localizeUrl(location));
  assert(document.body.includes("<urlset"), `${location} is not a URL sitemap`);
  publicUrls.push(...[...document.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, "&")));
}

assert(new Set(publicUrls).size === publicUrls.length, "Sitemap contains duplicate URLs");
for (const url of publicUrls) {
  assert(url.startsWith(`${productionOrigin}/`) || url === `${productionOrigin}/`, `Non-canonical sitemap host: ${url}`);
  assert(!url.includes("/admin") && !url.includes("/search") && !url.includes("?"), `Non-indexable URL is present in sitemap: ${url}`);
  const page = await fetchChecked(localizeUrl(url));
  assertHtml(new URL(url).pathname, page.body);
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/.exec(page.body)?.[1]
    || /<link[^>]+href="([^"]+)"[^>]+rel="canonical"/.exec(page.body)?.[1];
  assert(canonical && comparableUrl(canonical) === comparableUrl(url), `Canonical mismatch for ${url}: ${canonical || "missing"}`);
}

console.table(results);
console.log(`Self-check passed: ${results.length} key routes, ${sitemapLocations.length} sitemap files, and ${publicUrls.length} canonical public URLs on ${baseUrl}.`);
