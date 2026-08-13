import { slugify, textWordCount } from "./rules";
import type { NewsDraft, ScoredCandidate, SiteConfig } from "./types";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function clipSourceSummary(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 560) return normalized;
  const boundary = normalized.lastIndexOf(" ", 560);
  return `${normalized.slice(0, boundary > 220 ? boundary : 560).trim()}...`;
}

// The production publisher intentionally uses only source metadata and a short
// source-provided summary. It does not call a content-generation API or present
// an expanded rewrite as original reporting.
export function composeSourceNativeNews(candidate: ScoredCandidate): NewsDraft {
  const sourceTitle = escapeHtml(candidate.title);
  const sourceName = escapeHtml(candidate.sourceName);
  const sourceSummary = escapeHtml(clipSourceSummary(candidate.summary || "The source supplied no usable summary."));
  const sourceDate = escapeHtml(new Date(candidate.publishedAt).toISOString().slice(0, 10));
  const title = `Source Brief: ${candidate.title}`;
  const description = `Source brief from ${candidate.sourceName}: ${clipSourceSummary(candidate.summary || candidate.title).slice(0, 150)}`;
  const excerpt = `A source-attributed industry brief from ${candidate.sourceName}. ${clipSourceSummary(candidate.summary || candidate.title).slice(0, 220)}`;
  const bodyHtml = `<h2>Source brief</h2><p>${sourceName} published <strong>“${sourceTitle}”</strong> on ${sourceDate}. This automated News entry preserves the available source metadata and short summary for readers following hydraulic, manufacturing and industrial-equipment developments.</p><h2>Available source summary</h2><p>${sourceSummary}</p><h2>Reader note</h2><p>This is a concise source-attributed brief, not a rewritten article or an independent technical assessment. The site does not add performance, market, certification or purchasing claims beyond the cited source. Please review the original publication for full context, complete attribution and any subsequent updates.</p><h2>Source and editorial note</h2><p>The original item remains the authoritative record. This page is published only after the source URL, publication date, language, relevance and duplicate checks pass.</p>`;
  return {
    title,
    slug: slugify(title),
    description,
    excerpt,
    bodyHtml,
    sourcePanel: { name: candidate.sourceName, url: candidate.normalizedUrl, publishedAt: candidate.publishedAt, author: candidate.author ?? null },
    editorialDisclaimer: "This automatic page is a concise, source-attributed brief. The cited publisher retains ownership of its original reporting; Nantong HCJ does not claim authorship or add unverified conclusions.",
    publicationMode: "source-native",
    wordCount: textWordCount(bodyHtml),
  };
}

export function validateNewsDraft(draft: NewsDraft, candidate: ScoredCandidate, config: SiteConfig) {
  const failures: string[] = [];
  const configuredSource = [...config.sources.primaryWhitelist, ...config.sources.fallbackWhitelist]
    .some((source) => source.id === candidate.sourceId && source.domain === candidate.sourceDomain);
  const siteHost = new URL(config.siteUrl).hostname;
  const candidateHost = new URL(candidate.normalizedUrl).hostname;
  const internalLinks = [...draft.bodyHtml.matchAll(/href\s*=\s*["']([^"']+)["']/gi)]
    .filter((match) => {
      try {
        return new URL(match[1], config.siteUrl).hostname === siteHost;
      } catch {
        return false;
      }
    });
  if (!draft.title || !draft.description || !draft.excerpt || !draft.bodyHtml) failures.push("missing_required_content");
  if (draft.publicationMode !== config.news.publicationMode) failures.push("publication_mode_mismatch");
  if (draft.wordCount < config.news.sourceNativeWordCount.min || draft.wordCount > config.news.sourceNativeWordCount.max) failures.push("word_count_out_of_range");
  if (!draft.sourcePanel.url || draft.sourcePanel.url !== candidate.normalizedUrl) failures.push("source_panel_mismatch");
  if (!configuredSource || candidateHost === siteHost) failures.push("source_not_allowlisted_external_news");
  if (candidate.language.toLowerCase() !== config.publicationLanguage.toLowerCase()) failures.push("language_mismatch");
  if (internalLinks.length > config.news.maxInternalProductLinks) failures.push("too_many_internal_links");
  if (/(?:request a quote|contact us|minimum order|moq|email us|call us)/i.test(draft.bodyHtml)) failures.push("promotional_call_to_action");
  if (!draft.editorialDisclaimer) failures.push("missing_editorial_disclaimer");
  if (draft.relatedProductSlug && config.news.maxInternalProductLinks < 1) failures.push("internal_product_link_not_allowed");
  return { passed: failures.length === 0, failures };
}
