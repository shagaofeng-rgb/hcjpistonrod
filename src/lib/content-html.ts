const allowedTags = new Set(["p", "br", "strong", "em", "ul", "ol", "li", "h2", "h3", "a"]);

export function sanitizeArticleHtml(input: string) {
  return input.replace(/<\/?([a-z0-9]+)(?:\s+[^>]*)?>/gi, (tag, rawName) => {
    const name = String(rawName).toLowerCase();
    if (!allowedTags.has(name)) return "";
    if (name !== "a") return tag.replace(/\s+[^>]*>/, ">");
    if (tag.startsWith("</")) return "</a>";
    const href = tag.match(/href=["'](https?:\/\/[^"']+|\/[^"']*)["']/i)?.[1];
    return href ? `<a href="${href}" rel="nofollow noopener">` : "<a>";
  });
}
