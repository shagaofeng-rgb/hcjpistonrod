import { topicRotation } from "../src/lib/content-ops/catalog";
import { getContentOpsConfig } from "../src/lib/content-ops/config";
import { generateDeterministicDraft } from "../src/lib/content-ops/generator";
import { closeDatabasePool, query } from "../src/lib/admin/db";
import { buildValidation } from "../src/lib/content-ops/validators";

async function main() {
  const config = getContentOpsConfig();
  const rows = await query<{ id: string; brief: { id?: string } }>("select id, brief from content_ops_article_records where status = 'draft' order by created_at asc");
  const prior: { title: string; body: string }[] = [];
  for (const row of rows.rows) {
    const topicId = row.brief.id?.replace(/^brief-/, "");
    const topic = topicRotation.find((candidate) => candidate.id === topicId);
    if (!topic) continue;
    const draft = generateDeterministicDraft(topic);
    const validation = buildValidation(draft, prior, config.titleSimilarityThreshold, config.contentSimilarityThreshold, false);
    await query("update content_ops_article_records set validation = $1::jsonb, updated_at = now() where id = $2", [JSON.stringify(validation), row.id]);
    prior.push({ title: draft.title, body: draft.markdown });
    console.log(`${draft.slug}: ${Object.entries(validation).filter(([key]) => key !== "publish").every(([, item]) => item.passed) ? "validated" : "review-needed"}`);
  }
}

main().then(() => closeDatabasePool()).catch(async (error) => {
  await closeDatabasePool();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
