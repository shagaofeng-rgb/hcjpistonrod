import { XMLParser } from "fast-xml-parser";
import { approvedNewsSources } from "./catalog";
import { getContentOpsConfig } from "./config";
import { generateDeterministicDraft } from "./generator";
import { addCandidate, publishControlledArticle, recentContentArticles, storeDraft, storeNewsSources, storeRun, syncGovernedCatalog } from "./repository";
import { selectNextTopic } from "./rotation";
import { buildValidation, contentHash } from "./validators";

type RunResult = { ok: boolean; skipped?: boolean; reason?: string; details: Record<string, unknown> };

function cronReason() {
  const config = getContentOpsConfig();
  if (!config.enabled) return "CONTENT_OPS_ENABLED is false";
  return null;
}

export async function runNewsIngest(): Promise<RunResult> {
  const disabled = cronReason();
  if (disabled) return { ok: true, skipped: true, reason: disabled, details: { candidates: 0 } };
  const config = getContentOpsConfig();
  await syncGovernedCatalog();
  await storeNewsSources(approvedNewsSources);
  const parser = new XMLParser({ ignoreAttributes: false });
  let candidates = 0;
  const errors: string[] = [];
  for (const source of approvedNewsSources.filter((item) => item.feedUrl)) {
    try {
      const response = await fetch(source.feedUrl!, { headers: { "user-agent": "HCJ-ContentOps/1.0 (+https://www.hcjpistonrod.com)" }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const feed = parser.parse(await response.text());
      const items = feed?.rss?.channel?.item ?? feed?.feed?.entry ?? [];
      for (const item of Array.isArray(items) ? items : [items]) {
        const title = String(item.title?.["#text"] ?? item.title ?? "").trim();
        const url = String(item.link?.["@_href"] ?? item.link ?? "").trim();
        const publishedAt = String(item.pubDate ?? item.published ?? item.updated ?? "");
        if (!title || !url || !publishedAt || Date.now() - new Date(publishedAt).getTime() > config.newsMaxAgeDays * 86_400_000) continue;
        await addCandidate({ sourceId: source.id, title, url, publishedAt, summary: String(item.description ?? item.summary ?? "").slice(0, 1000), relevanceReason: "Candidate retained for manual relevance review; no article publication is triggered by collection.", industries: [], productFamilies: [] });
        candidates += 1;
      }
    } catch (error) {
      errors.push(`${source.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  const details = { candidates, errors, sources: approvedNewsSources.length, publishMode: config.publishMode };
  await storeRun("news_ingest", errors.length ? "failed" : "success", details);
  return { ok: errors.length === 0, details };
}

export async function runArticleCycle(): Promise<RunResult> {
  const disabled = cronReason();
  if (disabled) return { ok: true, skipped: true, reason: disabled, details: { created: 0 } };
  const config = getContentOpsConfig();
  await syncGovernedCatalog();
  const prior = await recentContentArticles(50);
  const publishedPrior = prior.filter((article) => article.status === "published");
  const topic = selectNextTopic(prior.map((article) => article.topic));
  if (!topic) {
    const details = { created: 0, reason: "No eligible topic after rotation rules" };
    await storeRun("article_cycle", "skipped", details);
    return { ok: true, skipped: true, reason: details.reason, details };
  }
  const draft = generateDeterministicDraft(topic);
  const validation = buildValidation(draft, publishedPrior.map((article) => ({ title: article.title, body: article.markdown })), config.titleSimilarityThreshold, config.contentSimilarityThreshold, config.canPublish);
  const validationsPassed = Object.values(validation).every((result) => result.passed);
  const markdownHash = contentHash(draft.markdown);
  const titleHash = contentHash(draft.title);
  const saved = await storeDraft(draft, validation, markdownHash, titleHash);
  if (config.canPublish && validationsPassed && saved.stored) {
    const published = await publishControlledArticle({ articleId: saved.id, draft, contentHash: markdownHash, titleHash, channel: config.channel });
    const details = { created: 1, articleId: saved.id, slug: draft.slug, stored: saved.stored, validationsPassed, status: published.ok ? "published" : "draft", publishBlocked: false, published };
    await storeRun("article_cycle", published.ok ? "success" : "failed", details);
    return { ok: published.ok, details };
  }
  const details = { created: 1, articleId: saved.id, slug: draft.slug, stored: saved.stored, validationsPassed, status: "draft", publishBlocked: !config.canPublish };
  await storeRun("article_cycle", validationsPassed ? "success" : "skipped", details);
  return { ok: true, details };
}
