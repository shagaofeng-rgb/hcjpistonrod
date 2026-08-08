const allowedTags = new Set([
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a",
]);

const blockedContentTags = "script|style|iframe|object|embed|template|svg|math|pre|code|textarea|noscript";

function isSafeHref(value: string) {
  return /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character] ?? character);
}

function convertMarkdownLinks(input: string) {
  const withLinks = input.replace(/\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]+)\)/gi, (match, label, href) => {
    const safeHref = String(href).trim();
    return isSafeHref(safeHref) ? `<a href="${escapeHtml(safeHref)}">${escapeHtml(String(label))}</a>` : match;
  });

  return withLinks.replace(/\*\*([^*\n]{1,200})\*\*/g, (_match, value) => `<strong>${escapeHtml(String(value))}</strong>`);
}

export function sanitizeArticleHtml(input: string) {
  const withoutUnsafeBlocks = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(new RegExp(`<(${blockedContentTags})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, "gi"), "")
    .replace(new RegExp(`<\\/?(?:${blockedContentTags})\\b[^>]*>`, "gi"), "")
    .replace(/```[\s\S]*?```/g, "");

  return convertMarkdownLinks(withoutUnsafeBlocks).replace(/<\/?([a-z0-9]+)(?:\s+[^>]*)?>/gi, (tag, rawName) => {
    const name = String(rawName).toLowerCase();
    if (!allowedTags.has(name)) return "";
    if (name !== "a") return tag.startsWith("</") ? `</${name}>` : `<${name}>`;
    if (tag.startsWith("</")) return "</a>";

    const href = tag.match(/href=["']([^"']+)["']/i)?.[1]?.trim();
    return href && isSafeHref(href) ? `<a href="${escapeHtml(href)}" rel="nofollow noopener">` : "<a>";
  });
}
