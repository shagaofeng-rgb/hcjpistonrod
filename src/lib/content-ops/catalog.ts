import { products } from "../../../data/products";
import type { NewsSource, ProductFact, Topic } from "./types";

type CatalogProduct = {
  slug: string;
  name: string;
  family: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  application: string;
  assetId: string;
};

const productSeeds = [
  ["chrome-plated-rod", "Hard Chrome Plated Rods", "hard chrome plated rod", ["hydraulic piston rod", "chrome rod supplier", "hydraulic cylinder rod"], "mobile and industrial hydraulic equipment", "factory-chrome-rod-stock"],
  ["ck45-chrome-plated-rod", "CK45 Chrome Plated Rods", "CK45 chrome plated rod", ["CK45 piston rod", "hydraulic rod material", "machined piston rod"], "hydraulic cylinder refurbishment", "factory-machined-rod-ends"],
  ["induction-hardened-chrome-rod", "Induction Hardened Chrome Rods", "induction hardened chrome rod", ["surface hardened piston rod", "hydraulic rod selection", "heavy duty hydraulic rod"], "equipment exposed to repeated motion", "factory-heat-treatment-line"],
  ["hollow-chrome-plated-rod", "Hollow Chrome Plated Rods", "hollow chrome plated rod", ["hollow hydraulic rod", "hollow piston rod", "custom chrome rod"], "weight-sensitive hydraulic assemblies", "site-hollow-chrome-plated-rod"],
  ["honed-tube", "Honed Tubes", "honed tube", ["hydraulic cylinder tube", "honed cylinder tube", "hydraulic tube sourcing"], "hydraulic cylinder replacement and manufacture", "factory-polishing-line"],
  ["st52-honed-tube", "ST52 Honed Tubes", "ST52 honed tube", ["ST52 hydraulic tube", "honed tube material", "cylinder tube specification"], "drawing-based cylinder projects", "factory-cnc-machining-line"],
] as const;

export const contentCatalog: CatalogProduct[] = productSeeds.map(([slug, family, primaryKeyword, secondaryKeywords, application, assetId]) => {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) throw new Error(`Content catalog product is missing: ${slug}`);
  return { slug, name: product.name, family, primaryKeyword, secondaryKeywords: [...secondaryKeywords], application, assetId };
});

export const approvedProductFacts: ProductFact[] = contentCatalog.flatMap((product) => [
  {
    id: `${product.slug}-drawing-review`,
    productId: product.slug,
    claim: `${product.name} can be reviewed against a buyer drawing or sample before quotation.` ,
    sourceDocumentId: "site-product-catalog-2026-08",
    sourceLocation: `data/products.ts#${product.slug}`,
    approved: true,
  },
  {
    id: `${product.slug}-project-verification`,
    productId: product.slug,
    claim: `Final dimensions, material, surface requirements and application suitability require project-specific confirmation.`,
    sourceDocumentId: "site-product-catalog-2026-08",
    sourceLocation: `data/products.ts#${product.slug}`,
    approved: true,
  },
]);

const topicSeed = (id: string, productSlug: string, industry: string, scenario: string, uniqueAngle: string): Topic => {
  const product = contentCatalog.find((entry) => entry.slug === productSlug);
  if (!product) throw new Error(`Topic product is missing: ${productSlug}`);
  return {
    id,
    productSlug,
    productFamily: product.family,
    industry,
    scenario,
    primaryKeyword: product.primaryKeyword,
    secondaryKeywords: product.secondaryKeywords,
    uniqueAngle,
    requiredConditions: ["drawing or sample", "application conditions", "dimensional requirements", "inspection requirements"],
  };
};

export const topicRotation: Topic[] = [
  topicSeed("rod-rebuild", "chrome-plated-rod", "Hydraulic maintenance", "cylinder rebuild projects", "Review the rod before a refurbishment scope is released"),
  topicSeed("ck45-machining", "ck45-chrome-plated-rod", "Construction machinery", "drawing-based end machining", "Confirm end features and reference surfaces before machining"),
  topicSeed("hardened-motion", "induction-hardened-chrome-rod", "Material handling", "repeated-motion hydraulic systems", "Separate operating conditions from unsupported performance assumptions"),
  topicSeed("hollow-assembly", "hollow-chrome-plated-rod", "Mobile equipment", "weight-sensitive hydraulic assemblies", "Clarify geometry and connection needs before material selection"),
  topicSeed("tube-replacement", "honed-tube", "Industrial machinery", "hydraulic cylinder replacement", "Build an input checklist before sourcing a replacement tube"),
  topicSeed("st52-drawing", "st52-honed-tube", "Hydraulic cylinder manufacture", "drawing-based cylinder projects", "Review tube dimensions and mating parts together"),
  topicSeed("rod-sealing", "chrome-plated-rod", "Hydraulic repair", "sealing-related rod evaluation", "Align surface requirements with seal-system review"),
  topicSeed("ck45-export", "ck45-chrome-plated-rod", "Export procurement", "cross-border technical quotation", "Keep drawing review and packing requirements in the same decision path"),
  topicSeed("hardening-review", "induction-hardened-chrome-rod", "Mining equipment", "demanding service reviews", "Document operating inputs before considering a hardened rod option"),
  topicSeed("hollow-custom", "hollow-chrome-plated-rod", "Industrial automation", "custom connection layouts", "Start with the internal profile and end-connection constraints"),
  topicSeed("tube-inspection", "honed-tube", "Factory maintenance", "incoming material inspection", "Define the receiving inspection plan before shipment"),
  topicSeed("st52-assembly", "st52-honed-tube", "Agricultural equipment", "replacement cylinder assembly", "Review tube, rod and seal interfaces as one assembly"),
];

export const ownedAssets = [
  { id: "factory-chrome-rod-stock", path: "/images/factory/chrome-rod-stock.jpg", ownership: "owned" as const, alt: "Chrome rod stock in the XIJIU workshop." },
  { id: "factory-machined-rod-ends", path: "/images/factory/machined-rod-ends-front.jpg", ownership: "owned" as const, alt: "Machined hydraulic rod ends in the factory." },
  { id: "factory-heat-treatment-line", path: "/images/factory/heat-treatment-line.jpg", ownership: "owned" as const, alt: "Heat treatment production equipment in the factory." },
  { id: "site-hollow-chrome-plated-rod", path: "/images/site/hollow-chrome-plated-rod.jpg", ownership: "owned" as const, alt: "Hollow chrome plated rod product image." },
  { id: "factory-polishing-line", path: "/images/factory/polishing-line.jpg", ownership: "owned" as const, alt: "Polishing line in the XIJIU workshop." },
  { id: "factory-cnc-machining-line", path: "/images/factory/cnc-machining-line.jpg", ownership: "owned" as const, alt: "CNC machining line in the XIJIU workshop." },
];

export const approvedNewsSources: NewsSource[] = [
  { id: "nhtsa-news", name: "NHTSA News", url: "https://www.nhtsa.gov/press-releases", sourceType: "public_agency" as const, allowlisted: true },
  { id: "nist-news", name: "NIST News", url: "https://www.nist.gov/news-events/news", feedUrl: "https://www.nist.gov/news-events/news/rss.xml", sourceType: "research" as const, allowlisted: true },
  { id: "nist-energy", name: "NIST Energy News", url: "https://www.nist.gov/news-events/energy", feedUrl: "https://www.nist.gov/news-events/energy/rss.xml", sourceType: "research" as const, allowlisted: true },
  { id: "usdoe-news", name: "U.S. Department of Energy News", url: "https://www.energy.gov/news", sourceType: "public_agency" as const, allowlisted: true },
];
