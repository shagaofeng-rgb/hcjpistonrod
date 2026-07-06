export type NewsArticle = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
  relatedProducts: string[];
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
};

export const newsArticles: NewsArticle[] = [
  {
    slug: "choose-hard-chrome-plated-rod-for-mobile-machinery",
    title: "How to Choose Hard Chrome Plated Rods for Mobile Machinery",
    date: "2026-06-30",
    category: "Chrome Plated Rod",
    excerpt:
      "A practical purchasing guide for checking material, hardness, chrome plating, diameter, length, and export packing before ordering piston rods.",
    image: "/images/factory/chrome-rod-stock.jpg",
    relatedProducts: ["ck45-chrome-plated-rod", "20mnv6-chrome-plated-rod", "induction-hardened-chrome-rod"],
    sections: [
      {
        heading: "Start with material and hardness",
        body:
          "Chrome plated rod selection should begin with material grade, hardness requirement, working load, corrosion exposure, and whether induction hardening is needed for the application.",
      },
      {
        heading: "Confirm chrome plating and length",
        body:
          "Before quotation, buyers should confirm chrome layer requirement, surface finish, rod diameter, tolerance, straightness, cutting length, and whether end machining is required.",
      },
      {
        heading: "Check packing before shipment",
        body:
          "Domestic rope bundling is not enough for export. For overseas shipment, rods should be protected with proper wrapping, separators, and customized wooden case packing when required.",
      },
    ],
    faqs: [
      {
        question: "What should I send for a chrome plated rod quotation?",
        answer:
          "Send material, hardness requirement, chrome plating requirement, diameter, length, quantity, end machining drawing if available, and destination requirement.",
      },
    ],
  },
  {
    slug: "piston-rod-surface-quality-and-sealing-risk",
    title: "Why Piston Rod Surface Quality Matters for Sealing Performance",
    date: "2026-06-30",
    category: "Quality Control",
    excerpt:
      "Rod surface finish, chrome plating quality, straightness, and bore finish all influence sealing life and stable hydraulic performance.",
    image: "/images/factory/polishing-line.jpg",
    relatedProducts: ["ck45-chrome-plated-rod", "hollow-chrome-plated-rod", "st52-honed-tube"],
    sections: [
      {
        heading: "Surface quality is not only appearance",
        body:
          "A piston rod must maintain stable diameter, surface finish, chrome adhesion, and straightness. Surface defects may shorten seal life and create avoidable service risk.",
      },
      {
        heading: "Chrome plating and polishing should match the use case",
        body:
          "Buyers should not only check dimensions. Chrome plating requirement, polishing quality, material hardness, and inspection discipline should be confirmed before mass production.",
      },
      {
        heading: "Honed tube quality also matters",
        body:
          "For cylinder barrel applications, honed tube bore condition affects movement and sealing performance. Rod and tube requirements should be reviewed together when drawings are available.",
      },
    ],
    faqs: [
      {
        question: "Can better rod inspection reduce sealing risk?",
        answer:
          "Yes. Diameter checks, surface inspection, chrome layer review, straightness control, and packing inspection can reduce avoidable sourcing and assembly risk.",
      },
    ],
  },
  {
    slug: "buyers-check-before-custom-piston-rods",
    title: "What Buyers Should Check Before Ordering Custom Piston Rods",
    date: "2026-06-30",
    category: "Purchasing Guide",
    excerpt:
      "Before custom rod production, buyers should confirm material, hardness, chrome plating, length, diameter, end machining, packing, and lead time assumptions.",
    image: "/images/factory/heat-treatment-line.jpg",
    relatedProducts: ["hollow-chrome-plated-rod", "induction-hardened-chrome-rod", "skived-and-roller-burnished-tube"],
    sections: [
      {
        heading: "Confirm what is fixed and what can be adjusted",
        body:
          "Custom piston rod projects often include fixed drawing dimensions and adjustable production choices. Clarify material, hardness, chrome plating, length, diameter, tolerance, and acceptable alternatives before production.",
      },
      {
        heading: "Share end machining and assembly requirements",
        body:
          "Thread, groove, shoulder, hole, and chamfer requirements should be confirmed clearly. If only a sample is available, measured specifications should be reviewed before quotation.",
      },
      {
        heading: "Plan documents and packing early",
        body:
          "If your project needs inspection records, labels, protective wrapping, or customized wooden case export packing, confirm these requirements before order confirmation.",
      },
    ],
    faqs: [
      {
        question: "Why is application information important?",
        answer:
          "The same rod size may perform differently in different environments. Application information helps review material, hardness, chrome plating, end machining, and packing.",
      },
    ],
  },
];
