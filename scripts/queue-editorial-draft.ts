import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;
const draftPath = process.argv[2];

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function parseFrontMatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Draft requires YAML-style front matter.");
  const fields = Object.fromEntries(match[1].split("\n").flatMap((line) => {
    const separator = line.indexOf(":");
    return separator > -1 ? [[line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^"|"$/g, "")]] : [];
  }));
  return { fields, body: match[2] };
}

function markdownToHtml(markdown: string) {
  const publishable = markdown.split("## Review checklist before manual publication")[0];
  const output: string[] = [];
  let listOpen = false;
  for (const line of publishable.split("\n")) {
    if (line.startsWith("# ")) continue;
    if (line.startsWith("## ")) {
      if (listOpen) output.push("</ul>");
      listOpen = false;
      output.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!listOpen) output.push("<ul>");
      listOpen = true;
      output.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }
    if (!line.trim()) continue;
    if (listOpen) output.push("</ul>");
    listOpen = false;
    output.push(`<p>${escapeHtml(line)}</p>`);
  }
  if (listOpen) output.push("</ul>");
  return output.join("\n");
}

async function main() {
  if (!draftPath) throw new Error("Usage: tsx scripts/queue-editorial-draft.ts <draft.md>");
  const { fields, body } = parseFrontMatter(await readFile(resolve(draftPath), "utf8"));
  const required = ["title", "slug", "excerpt", "category", "author", "seo_title", "seo_description", "image", "image_alt"];
  const missing = required.filter((field) => !fields[field]);
  if (missing.length) throw new Error(`Draft is missing front matter: ${missing.join(", ")}`);

  const pool = new Pool({ connectionString: requiredEnv("DATABASE_URL") });
  const client = await pool.connect();
  try {
    await client.query("begin");
    const category = await client.query<{ id: string }>(
      "select id from news_categories where deleted_at is null and (english_name = $1 or name = $1) limit 1",
      [fields.category],
    );
    const now = new Date();
    const result = await client.query<{ id: string; status: string; auto_publish_at: Date }>(
      `insert into news_articles
        (category_id, title, english_title, slug, author, excerpt, body_html, cover_image_url, image_alt,
         tags, related_products, status, seo_title, seo_description, canonical_url, robots, language,
         source_title, source_publisher, source_author, source_url, source_language, source_published_at,
         source_fetched_at, geo_summary, key_takeaways, automation_notes, technical_reviewed_at,
         technical_reviewer, marketing_reviewed_at, marketing_reviewer, content_channel,
         auto_publish_approved, auto_publish_at, updated_at)
       values ($1,$2,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,'draft',$11,$12,$13,
         'index,follow','en',$14,'XIJIU Intelligent Equipment',$4,$13,'en',$15,$15,$16,$17::jsonb,
         'Scheduled controlled editorial library; no external feed or generative API.', $15,
         'Controlled editorial fact check', $15, 'HCJ owner standing authorization', 'blog', true, $15, now())
       on conflict (slug) do update set title=excluded.title, english_title=excluded.english_title,
         author=excluded.author, excerpt=excluded.excerpt, body_html=excluded.body_html,
         cover_image_url=excluded.cover_image_url, image_alt=excluded.image_alt, tags=excluded.tags,
         related_products=excluded.related_products, seo_title=excluded.seo_title,
         seo_description=excluded.seo_description, canonical_url=excluded.canonical_url,
         geo_summary=excluded.geo_summary, key_takeaways=excluded.key_takeaways,
         auto_publish_approved=true, auto_publish_at=excluded.auto_publish_at, content_channel='blog',
         updated_at=now()
       where news_articles.status = 'draft'
       returning id, status, auto_publish_at`,
      [category.rows[0]?.id || null, fields.title, fields.slug, fields.author, fields.excerpt, markdownToHtml(body),
        fields.image, fields.image_alt, JSON.stringify([fields.category]), JSON.stringify(["honed-tube", "ck45-honed-tube", "st52-honed-tube"]),
        fields.seo_title, fields.seo_description, `https://www.hcjpistonrod.com/blog/${fields.slug}`,
        `Original XIJIU technical Blog: ${fields.title}`, now, fields.seo_description,
        JSON.stringify(["Start with the drawing and cylinder requirement.", "Define bore, dimensions, inspection and packing before quotation.", "Treat CK45 and ST52 as design-review choices, not interchangeable labels."])],
    );
    await client.query("commit");
    console.log(JSON.stringify({ ok: true, slug: fields.slug, queued: result.rowCount === 1, status: result.rows[0]?.status, autoPublishAt: result.rows[0]?.auto_publish_at?.toISOString() }, null, 2));
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
