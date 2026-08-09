import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getContentOpsConfig } from "../src/lib/content-ops/config";
import { generateDeterministicDraft } from "../src/lib/content-ops/generator";
import { topicRotation } from "../src/lib/content-ops/catalog";
import { buildValidation, contentHash } from "../src/lib/content-ops/validators";
import { storeDraft, storeRun, syncGovernedCatalog } from "../src/lib/content-ops/repository";
import { closeDatabasePool } from "../src/lib/admin/db";

async function main() {
  const outputDirectory = join(process.cwd(), "content", "operations", "dry-runs");
  const config = getContentOpsConfig();
  const topics = [topicRotation[0], topicRotation[3], topicRotation[5]];

  await mkdir(outputDirectory, { recursive: true });
  await syncGovernedCatalog();
  for (const topic of topics) {
    const draft = generateDeterministicDraft(topic);
    const validation = buildValidation(draft, [], config.titleSimilarityThreshold, config.contentSimilarityThreshold, false);
    const report = {
      status: "draft_only",
      generatedAt: new Date().toISOString(),
      brief: draft.brief,
      factIds: draft.claims.flatMap((claim) => claim.factIds),
      citations: draft.citations,
      imagePlan: draft.imagePlan,
      validation,
      contentHash: contentHash(draft.markdown),
      titleHash: contentHash(draft.title),
      pendingReview: ["technical review", "marketing review", "explicit publish authorization"],
    };
    await writeFile(join(outputDirectory, `${draft.slug}.md`), draft.markdown, "utf8");
    await writeFile(join(outputDirectory, `${draft.slug}.audit.json`), JSON.stringify(report, null, 2), "utf8");
    await storeDraft(draft, validation, report.contentHash, report.titleHash);
    console.log(`${draft.slug}: draft written`);
  }
  await storeRun("article_cycle", "success", { mode: "dry_run", created: topics.length, publishBlocked: true });
}

main().then(() => closeDatabasePool()).catch(async (error) => {
  await closeDatabasePool();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
