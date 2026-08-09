function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character] ?? character);
}

function isSafeHref(value: string) {
  return /^https:\/\//i.test(value) || /^\/(?!\/)/.test(value);
}

function renderInline(value: string) {
  const escaped = escapeHtml(value);
  const linked = escaped.replace(/\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]+)\)/gi, (_match, label, href) => {
    const safeHref = String(href).trim();
    return isSafeHref(safeHref) ? `<a href="${escapeHtml(safeHref)}">${label}</a>` : label;
  });
  return linked.replace(/\*\*([^*\n]{1,200})\*\*/g, "<strong>$1</strong>");
}

function tableCell(value: string, tag: "th" | "td") {
  return `<${tag}>${renderInline(value.trim())}</${tag}>`;
}

function tableRow(line: string, tag: "th" | "td") {
  const cells = line.trim().replace(/^\||\|$/g, "").split("|");
  return `<tr>${cells.map((cell) => tableCell(cell, tag)).join("")}</tr>`;
}

/** Converts the constrained, in-repository article template into safe presentation HTML. */
export function renderControlledMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const paragraph: string[] = [];
  const table: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  };
  const flushTable = () => {
    if (!table.length) return;
    const [head, ...body] = table;
    const filteredBody = body.filter((line) => !/^\|?\s*:?-{3,}/.test(line.trim()));
    html.push(`<div class="article-table-wrap"><table><thead>${tableRow(head, "th")}</thead><tbody>${filteredBody.map((line) => tableRow(line, "td")).join("")}</tbody></table></div>`);
    table.length = 0;
  };

  for (const line of lines) {
    if (line.startsWith("|")) {
      flushParagraph();
      table.push(line);
      continue;
    }
    flushTable();
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3>${renderInline(line.slice(4))}</h3>`);
      continue;
    }
    paragraph.push(line.trim());
  }

  flushTable();
  flushParagraph();
  return html.join("\n");
}
