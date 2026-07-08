import process from "node:process";

const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
const baseUrl = (baseArg ? baseArg.split("=")[1] : process.env.SELF_CHECK_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const paths = [
  "/",
  "/products",
  "/products/chrome-plated-rod",
  "/products/ck45-chrome-plated-rod",
  "/news",
  "/news/choose-hard-chrome-plated-rod-for-mobile-machinery",
  "/blog",
  "/blog/choose-hard-chrome-plated-rod-for-mobile-machinery",
  "/search?q=chrome%20rod",
  "/contact",
  "/sitemap.xml",
  "/news-sitemap.xml",
  "/news/rss.xml",
];

function assertIncludes(name, body, needle) {
  if (!body.includes(needle)) {
    throw new Error(`${name} is missing ${needle}`);
  }
}

async function checkPath(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  if (response.status >= 400) {
    throw new Error(`${path} returned ${response.status}`);
  }
  const body = await response.text();
  if (path.endsWith(".xml")) {
    assertIncludes(path, body, "<?xml");
  } else {
    assertIncludes(path, body, "<title");
    assertIncludes(path, body, "XIJIU");
    if (path.includes("/news/")) assertIncludes(path, body, "Source Information");
    if (path.includes("/products/ck45")) assertIncludes(path, body, "Related News");
  }
  return { path, status: response.status, bytes: body.length };
}

const results = [];
for (const path of paths) {
  results.push(await checkPath(path));
}

console.table(results);
console.log(`Self-check passed for ${results.length} routes on ${baseUrl}.`);
