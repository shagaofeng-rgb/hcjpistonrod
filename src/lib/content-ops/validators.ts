import { createHash } from "node:crypto";
import { approvedProductFacts, contentCatalog, ownedAssets } from "./catalog";
import type { ArticleDraft, DraftValidation, NewsSource, Topic, ValidationResult } from "./types";

const words = (input: string) => new Set(input.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((word) => word.length > 2));

export function similarity(left: string, right: string) {
  const a = words(left);
  const b = words(right);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((word) => b.has(word)).length;
  return overlap / new Set([...a, ...b]).size;
}

function phraseSimilarity(left: string, right: string, phraseLength = 4) {
  const phrases = (input: string) => {
    const tokens = input.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((word) => word.length > 2);
    return new Set(Array.from({ length: Math.max(0, tokens.length - phraseLength + 1) }, (_, index) => tokens.slice(index, index + phraseLength).join(" ")));
  };
  const a = phrases(left);
  const b = phrases(right);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((phrase) => b.has(phrase)).length;
  return overlap / new Set([...a, ...b]).size;
}

export function contentHash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function validateSource(source: NewsSource, publishedAt: string, maxAgeDays: number): ValidationResult {
  const age = Date.now() - new Date(publishedAt).getTime();
  const validDate = Number.isFinite(age) && age >= 0 && age <= maxAgeDays * 86_400_000;
  return { passed: source.allowlisted && /^https:\/\//.test(source.url) && validDate, details: source.allowlisted && validDate ? [] : ["Source is not allowlisted or is outside the permitted age window."] };
}

export function validateProductScope(topic: Topic): ValidationResult {
  const product = contentCatalog.find((entry) => entry.slug === topic.productSlug);
  return { passed: Boolean(product && topic.requiredConditions.length && topic.scenario), details: product ? [] : ["The selected product is not in the approved HCJ catalog."] };
}

export function validateClaims(draft: ArticleDraft): ValidationResult {
  const knownFacts = new Set(approvedProductFacts.filter((fact) => fact.approved).map((fact) => fact.id));
  const invalid = draft.claims.filter((claim) => claim.type === "hcj_fact" && (!claim.factIds.length || claim.factIds.some((id) => !knownFacts.has(id))));
  return { passed: invalid.length === 0, details: invalid.map((claim) => `Unapproved fact reference: ${claim.text}`) };
}

export function validateImages(draft: ArticleDraft): ValidationResult {
  const knownAssets = new Set(ownedAssets.map((asset) => asset.id));
  const invalid = draft.imagePlan.filter((image) => !knownAssets.has(image.assetId) || image.ownership === "verified_open_license" || !image.alt.trim());
  return { passed: invalid.length === 0, details: invalid.map((image) => `Unverified image asset: ${image.assetId}`) };
}

export function validateInternalLinks(draft: ArticleDraft): ValidationResult {
  const expected = new Set(["/contact", "/products", "/industries", ...contentCatalog.map((product) => `/products/${product.slug}`)]);
  const invalid = draft.internalLinks.filter((link) => !expected.has(link));
  return { passed: invalid.length === 0, details: invalid.map((link) => `Unknown internal link: ${link}`) };
}

export function validateQuality(draft: ArticleDraft): ValidationResult {
  const required = ["## Evaluation checklist", "## Source and scope", "## Questions to confirm", "| Input |"];
  const missing = required.filter((needle) => !draft.markdown.includes(needle));
  if (draft.faq.length < 2) missing.push("at least two FAQs");
  return { passed: missing.length === 0, details: missing.map((value) => `Missing ${value}`) };
}

export function validateSeo(draft: ArticleDraft): ValidationResult {
  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug);
  const descriptionOk = draft.description.length >= 70 && draft.description.length <= 170;
  return { passed: slugOk && descriptionOk && draft.title.length > 20, details: [slugOk ? "" : "Invalid slug.", descriptionOk ? "" : "Meta description must be 70-170 characters.", draft.title.length > 20 ? "" : "Title is too short."].filter(Boolean) };
}

export function validateDuplication(draft: ArticleDraft, prior: { title: string; body: string }[], titleThreshold: number, contentThreshold: number): ValidationResult {
  const matches = prior.flatMap((article) => {
    const titleScore = similarity(draft.title, article.title);
    const bodyScore = phraseSimilarity(draft.markdown, article.body);
    return titleScore >= titleThreshold || bodyScore >= contentThreshold ? [`${article.title} (title ${titleScore.toFixed(2)}, body ${bodyScore.toFixed(2)})`] : [];
  });
  return { passed: matches.length === 0, details: matches };
}

export function buildValidation(draft: ArticleDraft, prior: { title: string; body: string }[], titleThreshold: number, contentThreshold: number, canPublish: boolean): DraftValidation {
  const noExternalSource: ValidationResult = { passed: true, details: draft.citations.length ? [] : ["No external news was used; article is scoped as a selection guide."] };
  return {
    source: noExternalSource,
    claims: validateClaims(draft),
    productScope: validateProductScope(draft.brief),
    duplication: validateDuplication(draft, prior, titleThreshold, contentThreshold),
    contentQuality: validateQuality(draft),
    links: validateInternalLinks(draft),
    images: validateImages(draft),
    seo: validateSeo(draft),
    publish: canPublish ? { passed: true, details: [] } : { passed: false, details: ["Publishing is disabled unless all explicit production switches are enabled."] },
  };
}
