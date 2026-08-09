import { approvedProductFacts, contentCatalog, ownedAssets } from "./catalog";
import type { ArticleBrief, ArticleDraft, Topic } from "./types";

function titleFor(topic: Topic) {
  return `What to Review Before Specifying a ${topic.productFamily.replace(/s$/, "")} for ${topic.scenario}`;
}

function slugFor(topic: Topic) {
  return `review-${topic.productSlug}-for-${topic.scenario.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export function makeBrief(topic: Topic): ArticleBrief {
  const product = contentCatalog.find((entry) => entry.slug === topic.productSlug);
  if (!product) throw new Error(`Unknown product in content topic: ${topic.productSlug}`);
  return {
    ...topic,
    id: `brief-${topic.id}`,
    internalLinks: [`/products/${product.slug}`, "/industries", "/contact"],
    assetPlan: [product.assetId],
    claimsToVerify: approvedProductFacts.filter((fact) => fact.productId === product.slug).map((fact) => fact.id),
    approvedNewsIds: [],
  };
}

export function generateDeterministicDraft(topic: Topic): ArticleDraft {
  const brief = makeBrief(topic);
  const product = contentCatalog.find((entry) => entry.slug === topic.productSlug);
  const asset = ownedAssets.find((entry) => entry.id === product?.assetId);
  if (!product || !asset) throw new Error(`Draft data is incomplete for ${topic.id}`);
  const title = titleFor(topic);
  const slug = slugFor(topic);
  const guidance: Record<string, { context: string; rows: [string, string, string][]; questions: string; boundary: string }> = {
    "chrome-plated-rod": {
      context: "For a cylinder rebuild, the review normally starts with the existing rod drawing, the end-connection geometry and the mating seal arrangement. Treat the replacement rod as one part of an assembly rather than a standalone commodity.",
      rows: [["Existing rod record", "Prevents assumptions about the replacement geometry", "Drawing revision or measured sample"], ["End connection", "Defines the machining review", "Thread, clevis, eye or other confirmed interface"], ["Seal interface", "Aligns the review with the cylinder assembly", "Seal-system information and mating dimensions"]],
      questions: "Ask which dimensions control the rebuild, which end feature interfaces with the existing assembly and what inspection evidence the receiving team needs.",
      boundary: "A general chrome rod designation does not establish dimensions, surface condition or assembly compatibility.",
    },
    "ck45-chrome-plated-rod": {
      context: "For drawing-based end machining, the purchasing file should identify the reference dimensions before a machining path is discussed. The drawing needs to show which end features are functional and which tolerances are acceptance-critical.",
      rows: [["Current drawing revision", "Avoids machining against obsolete information", "Controlled drawing with units and revision"], ["Functional end features", "Sets the machining scope", "Thread, shoulder, groove or connection detail"], ["Reference datum", "Supports repeatable measurement", "Named datum and inspection points"]],
      questions: "Ask which features are functional, which datums control inspection and whether any mating part must be reviewed with the rod.",
      boundary: "Material naming alone is not a substitute for a complete machining and inspection definition.",
    },
    "induction-hardened-chrome-rod": {
      context: "For repeated-motion equipment, first document the operating context instead of inferring a rod specification from the machine category. The review should make space for the motion pattern, environment and the linked components.",
      rows: [["Motion description", "Frames the engineering review", "Cycle description and movement arrangement"], ["Operating environment", "Identifies project conditions to verify", "Exposure, maintenance and equipment context"], ["Related components", "Avoids isolated component assumptions", "Seal, tube and end-connection information"]],
      questions: "Ask what movement the assembly performs, what external conditions matter and what project documentation supports the specification.",
      boundary: "This guide does not predict wear life, hardness or service performance for an unreviewed application.",
    },
    "hollow-chrome-plated-rod": {
      context: "For weight-sensitive assemblies, the internal profile and connection layout must be included in the technical review. A hollow rod request is incomplete until the intended internal geometry and end interfaces are understood.",
      rows: [["Internal geometry", "Defines the hollow-profile review", "Confirmed bore or passage requirements"], ["Connection layout", "Identifies the end machining scope", "Drawing of ports, threads or interfaces"], ["Assembly constraints", "Keeps the sourcing review project-specific", "Installation space and mating components"]],
      questions: "Ask how the internal profile is used, which connections are required and which assembly constraints must be held.",
      boundary: "A hollow profile does not by itself determine suitability for a particular loading or equipment duty.",
    },
    "honed-tube": {
      context: "For replacement cylinders, the tube review should start with the current cylinder record and the parts that mate with the tube. A replacement project needs defined dimensional and inspection inputs before a procurement comparison is useful.",
      rows: [["Cylinder reference", "Connects the tube request to the actual assembly", "Drawing or measured cylinder record"], ["Mating components", "Checks the interface assumptions", "Piston, seals and end-cap information"], ["Receiving inspection", "Sets an agreed acceptance path", "Required measurements and documentation"]],
      questions: "Ask which cylinder dimensions are controlled, which components mate with the tube and how the receiving inspection will be performed.",
      boundary: "A honed tube product name does not replace a cylinder-level design review.",
    },
    "st52-honed-tube": {
      context: "For a drawing-based cylinder project, review the tube together with the mating rod, piston and seal interfaces. The procurement file should establish the controlled dimensions and how they will be checked before manufacture begins.",
      rows: [["Tube drawing", "Sets the dimensional baseline", "Controlled drawing with relevant tolerances"], ["Mating assembly", "Coordinates adjacent components", "Rod, piston and seal interface details"], ["Inspection plan", "Defines acceptance before delivery", "Measurements, records and project requirements"]],
      questions: "Ask which interfaces are critical, what drawing revision governs the order and what evidence is needed at receiving inspection.",
      boundary: "Project suitability depends on the completed assembly definition, not on an isolated grade reference.",
    },
  };
  const review = guidance[product.slug];
  if (!review) throw new Error(`Draft guidance is missing for ${product.slug}`);
  const checklist = review.rows.map(([input, why, provide]) => `| ${input} | ${why} | ${provide} |`).join("\n");
  const markdown = `# ${title}

Procurement teams reviewing ${product.name.toLowerCase()} for ${topic.scenario} benefit from fixing the engineering inputs before comparing quotations. ${review.context} This note is a selection guide, not a performance promise; the project file should be reviewed before production is confirmed.

## Product context

XIJIU can review ${product.name.toLowerCase()} against a buyer drawing or sample for ${product.application}. ${topic.uniqueAngle}. Final dimensions, material, surface requirements and application suitability require project-specific confirmation.

## Evaluation checklist

| Input | Why it matters | What to provide |
| --- | --- | --- |
${checklist}

## Questions to confirm

For ${topic.industry.toLowerCase()} work, ${review.questions} Confirm the assembly interfaces, the expected inspection route and any export-packing requirements. ${review.boundary}

## Source and scope

Prepared from the approved XIJIU product catalog. No external news or third-party image is used. This draft is for technical and marketing review before any public release.

## FAQ

### Can XIJIU review a drawing before quotation?

Yes. Send the current drawing or sample together with the application and quantity requirements for review.

### Can requirements be confirmed before production?

Yes. Critical dimensions, end features, inspection expectations and packing requirements should be confirmed in the project review.
`;

  const facts = approvedProductFacts.filter((fact) => fact.productId === product.slug);
  return {
    brief,
    title,
    slug,
    description: `A practical review checklist for specifying ${product.name.toLowerCase()} in ${topic.scenario}, with project-specific confirmation points for B2B buyers.`,
    excerpt: `A controlled selection guide for buyers reviewing ${product.name.toLowerCase()} for ${topic.scenario}.`,
    markdown,
    faq: [
      { question: "Can XIJIU review a drawing before quotation?", answer: "Yes. Send the current drawing or sample with application and quantity requirements for review." },
      { question: "Can requirements be confirmed before production?", answer: "Critical dimensions, end features, inspection expectations and packing requirements should be confirmed in the project review." },
    ],
    claims: facts.map((fact) => ({ text: fact.claim, factIds: [fact.id], type: "hcj_fact" as const })),
    citations: [],
    internalLinks: brief.internalLinks,
    imagePlan: [{ assetId: asset.id, ownership: asset.ownership, alt: asset.alt, role: "owned supporting factory image" }],
  };
}
