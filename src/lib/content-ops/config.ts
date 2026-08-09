import type { ContentPublishMode } from "./types";

function flag(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function numberValue(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getContentOpsConfig() {
  const publishMode: ContentPublishMode = process.env.PUBLISH_MODE === "auto" ? "auto" : "draft_only";
  const enabled = flag(process.env.CONTENT_OPS_ENABLED, false);
  const dryRun = flag(process.env.CONTENT_OPS_DRY_RUN, true);
  const autoPublish = flag(process.env.AUTO_PUBLISH, false);

  return {
    enabled,
    dryRun,
    publishMode,
    autoPublish,
    canPublish: enabled && !dryRun && publishMode === "auto" && autoPublish,
    timezone: process.env.CONTENT_OPS_TIMEZONE || "Asia/Shanghai",
    newsMaxAgeDays: numberValue(process.env.NEWS_MAX_AGE_DAYS, 90),
    maxArticlesPerRun: numberValue(process.env.MAX_ARTICLES_PER_RUN, 1),
    titleSimilarityThreshold: numberValue(process.env.TITLE_SIMILARITY_THRESHOLD, 0.82),
    contentSimilarityThreshold: numberValue(process.env.CONTENT_SIMILARITY_THRESHOLD, 0.72),
    github: {
      owner: process.env.GITHUB_OWNER || "",
      repo: process.env.GITHUB_REPO || "",
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_CONTENT_TOKEN || "",
    },
  };
}

export function contentOpsDisabledReason() {
  const config = getContentOpsConfig();
  if (!config.enabled) return "CONTENT_OPS_ENABLED is false";
  if (config.dryRun) return "CONTENT_OPS_DRY_RUN is true";
  if (config.publishMode !== "auto") return "PUBLISH_MODE is draft_only";
  if (!config.autoPublish) return "AUTO_PUBLISH is false";
  return null;
}
