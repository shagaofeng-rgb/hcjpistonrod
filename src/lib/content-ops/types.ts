export type ContentPublishMode = "draft_only" | "auto";

export type ProductFact = {
  id: string;
  productId: string;
  claim: string;
  sourceDocumentId: string;
  sourceLocation: string;
  approved: boolean;
};

export type NewsSource = {
  id: string;
  name: string;
  url: string;
  feedUrl?: string;
  sourceType: "regulator" | "public_agency" | "research" | "industry_media" | "company_first_party";
  allowlisted: boolean;
};

export type Topic = {
  id: string;
  productSlug: string;
  productFamily: string;
  industry: string;
  scenario: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  uniqueAngle: string;
  requiredConditions: string[];
};

export type ArticleBrief = Topic & {
  id: string;
  internalLinks: string[];
  assetPlan: string[];
  claimsToVerify: string[];
  approvedNewsIds: string[];
};

export type ArticleDraft = {
  brief: ArticleBrief;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  markdown: string;
  faq: { question: string; answer: string }[];
  claims: { text: string; factIds: string[]; type: "hcj_fact" | "external_fact" | "inference" }[];
  citations: { sourceId: string; url: string; usage: string }[];
  internalLinks: string[];
  imagePlan: { assetId: string; ownership: "owned" | "licensed" | "verified_open_license"; alt: string; role: string }[];
};

export type ValidationResult = { passed: boolean; details: string[] };

export type DraftValidation = Record<"source" | "claims" | "productScope" | "duplication" | "contentQuality" | "links" | "images" | "seo" | "publish", ValidationResult>;
