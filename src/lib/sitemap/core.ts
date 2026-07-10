export const SITEMAP_MAX_URLS = 50_000;
export const SITEMAP_MAX_BYTES = 50 * 1024 * 1024;

export type SitemapKind = "pages" | "categories" | "products" | "posts";

export type SitemapEntry = {
  loc: string;
  lastmod: string;
  kind: SitemapKind;
};

export type SitemapDocument = {
  kind: SitemapKind;
  fileName: string;
  xml: string;
  entries: SitemapEntry[];
  lastmod: string;
};

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function normalizeLastmod(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid sitemap lastmod: ${String(value)}`);
  return date.toISOString();
}

export function normalizeCanonicalUrl(value: string, productionOrigin: string) {
  const url = new URL(value, productionOrigin);
  const origin = new URL(productionOrigin).origin;
  if (url.origin !== origin) return null;
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export function shouldIncludeCmsPage(input: {
  status?: string | null;
  robots?: string | null;
  canonicalUrl?: string | null;
  expectedUrl: string;
  sitemapEnabled?: boolean | null;
}) {
  const status = (input.status || "published").toLowerCase();
  const robots = (input.robots || "index,follow").toLowerCase();
  if (!input.sitemapEnabled && input.sitemapEnabled !== undefined && input.sitemapEnabled !== null) return false;
  if (status !== "published") return false;
  if (robots.includes("noindex")) return false;
  if (input.canonicalUrl) {
    try {
      const canonical = new URL(input.canonicalUrl, input.expectedUrl).toString().replace(/\/$/, "");
      const expected = new URL(input.expectedUrl).toString().replace(/\/$/, "");
      if (canonical !== expected) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function dedupeEntries(entries: SitemapEntry[]) {
  const byUrl = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    const existing = byUrl.get(entry.loc);
    if (!existing || new Date(entry.lastmod) > new Date(existing.lastmod)) byUrl.set(entry.loc, entry);
  }
  return [...byUrl.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}

export function renderUrlSet(entries: SitemapEntry[]) {
  const rows = entries
    .map((entry) => `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}${rows ? "\n" : ""}</urlset>\n`;
}

function splitEntries(entries: SitemapEntry[], maxUrls = SITEMAP_MAX_URLS, maxBytes = SITEMAP_MAX_BYTES) {
  const chunks: SitemapEntry[][] = [];
  let current: SitemapEntry[] = [];
  let bytes = Buffer.byteLength(renderUrlSet([]));

  for (const entry of entries) {
    const entryBytes = Buffer.byteLength(renderUrlSet([entry])) - Buffer.byteLength(renderUrlSet([]));
    if (current.length > 0 && (current.length >= maxUrls || bytes + entryBytes >= maxBytes)) {
      chunks.push(current);
      current = [];
      bytes = Buffer.byteLength(renderUrlSet([]));
    }
    current.push(entry);
    bytes += entryBytes;
  }

  if (current.length || chunks.length === 0) chunks.push(current);
  return chunks;
}

export function buildSitemapDocuments(entries: SitemapEntry[], limits?: { maxUrls?: number; maxBytes?: number }) {
  const result: SitemapDocument[] = [];
  const deduped = dedupeEntries(entries);
  const kinds: SitemapKind[] = ["pages", "categories", "products", "posts"];

  for (const kind of kinds) {
    const kindEntries = deduped.filter((entry) => entry.kind === kind);
    const chunks = splitEntries(kindEntries, limits?.maxUrls, limits?.maxBytes);
    chunks.forEach((chunk, index) => {
      const isSplit = chunks.length > 1;
      const fileName = isSplit ? `sitemaps/${kind}-${index + 1}.xml` : `sitemap-${kind}.xml`;
      result.push({
        kind,
        fileName,
        xml: renderUrlSet(chunk),
        entries: chunk,
        lastmod: chunk.reduce((latest, entry) => entry.lastmod > latest ? entry.lastmod : latest, "1970-01-01T00:00:00.000Z"),
      });
    });
  }

  return result;
}

export function renderSitemapIndex(origin: string, documents: SitemapDocument[]) {
  const rows = documents
    .map((document) => `  <sitemap>\n    <loc>${escapeXml(`${origin}/${document.fileName}`)}</loc>\n    <lastmod>${escapeXml(document.lastmod)}</lastmod>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}

export function validateSitemapXml(xml: string) {
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) throw new Error("Sitemap must be UTF-8 XML");
  const isIndex = xml.includes("<sitemapindex") && xml.includes("</sitemapindex>");
  const isUrlSet = xml.includes("<urlset") && xml.includes("</urlset>");
  if (!isIndex && !isUrlSet) throw new Error("Invalid sitemap XML root element");
  if (Buffer.byteLength(xml) > SITEMAP_MAX_BYTES) throw new Error("Sitemap exceeds 50 MB");
  return true;
}

export function diffSitemapEntries(previous: Pick<SitemapEntry, "loc" | "lastmod">[], current: Pick<SitemapEntry, "loc" | "lastmod">[]) {
  const before = new Map(previous.map((entry) => [entry.loc, entry.lastmod]));
  const after = new Map(current.map((entry) => [entry.loc, entry.lastmod]));
  return {
    added: current.filter((entry) => !before.has(entry.loc)).map((entry) => entry.loc),
    removed: previous.filter((entry) => !after.has(entry.loc)).map((entry) => entry.loc),
    modified: current.filter((entry) => before.has(entry.loc) && before.get(entry.loc) !== entry.lastmod).map((entry) => entry.loc),
    unchanged: current.filter((entry) => before.get(entry.loc) === entry.lastmod).length,
  };
}
