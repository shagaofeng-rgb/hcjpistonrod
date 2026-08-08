import { randomUUID } from "node:crypto";
import { getPool, hasDatabaseConfig } from "@/lib/admin/db";

const AUTO_PUBLISH_LOCK_ID = 721_907_315;

type PublicationRow = {
  id: string;
  slug: string;
  title: string;
  published_at: Date;
};

export type EditorialPublicationResult =
  | { ok: true; published: false; reason: "empty" }
  | { ok: true; published: true; article: { id: string; slug: string; title: string; publishedAt: string } }
  | { ok: false; message: string };

/** Publishes at most one owner-approved Blog draft per run. */
export async function runScheduledBlogPublication(): Promise<EditorialPublicationResult> {
  if (!hasDatabaseConfig()) return { ok: false, message: "Database is not configured" };

  const client = await getPool().connect();
  const runId = randomUUID();

  try {
    const lock = await client.query<{ locked: boolean }>("select pg_try_advisory_lock($1) as locked", [AUTO_PUBLISH_LOCK_ID]);
    if (!lock.rows[0]?.locked) return { ok: true, published: false, reason: "empty" };

    await client.query("begin");
    const published = await client.query<PublicationRow>(
      `with candidate as (
         select id
         from news_articles
         where deleted_at is null
           and content_channel = 'blog'
           and status = 'draft'
           and auto_publish_approved = true
           and auto_publish_at is not null
           and auto_publish_at <= now()
         order by auto_publish_at asc, created_at asc
         for update skip locked
         limit 1
       )
       update news_articles article
       set status = 'published',
           published_at = now(),
           auto_published_at = now(),
           auto_publish_run_id = $1,
           published_by_name = 'HCJ scheduled editorial workflow',
           updated_at = now()
       from candidate
       where article.id = candidate.id
       returning article.id, article.slug, coalesce(article.english_title, article.title) as title, article.published_at`,
      [runId],
    );

    const article = published.rows[0];
    if (!article) {
      await client.query("commit");
      return { ok: true, published: false, reason: "empty" };
    }

    await client.query(
      `insert into audit_logs (action, module, object_type, object_id, before_summary, after_summary, result)
       values ('scheduled_publish', 'blog', 'news_article', $1, $2::jsonb, $3::jsonb, 'success')`,
      [article.id, JSON.stringify({ status: "draft", runId }), JSON.stringify({ status: "published", slug: article.slug, runId })],
    );
    await client.query("commit");

    return { ok: true, published: true, article: { id: article.id, slug: article.slug, title: article.title, publishedAt: article.published_at.toISOString() } };
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    return { ok: false, message: error instanceof Error ? error.message : "Scheduled publication failed" };
  } finally {
    await client.query("select pg_advisory_unlock($1)", [AUTO_PUBLISH_LOCK_ID]).catch(() => undefined);
    client.release();
  }
}
