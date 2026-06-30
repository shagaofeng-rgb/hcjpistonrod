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
    slug: "choose-welded-hydraulic-cylinder-mobile-machinery",
    title: "How to Choose the Right Welded Hydraulic Cylinder for Mobile Machinery",
    date: "2026-06-30",
    category: "Hydraulic Cylinder",
    excerpt:
      "A practical purchasing guide for checking bore size, stroke, mounting, pressure, sealing, and testing before ordering welded hydraulic cylinders.",
    image: "/images/site/construction-machinery.jpg",
    relatedProducts: ["welded-hydraulic-cylinder", "custom-hydraulic-cylinder"],
    sections: [
      {
        heading: "Start with the machine duty cycle",
        body:
          "A welded hydraulic cylinder for mobile machinery should be selected around real load, stroke frequency, installation space, pressure peaks, side load risk, and environmental exposure.",
      },
      {
        heading: "Check the drawing before discussing price",
        body:
          "The drawing should confirm bore size, rod diameter, stroke, mounting interface, port position, seal system, surface treatment, and testing requirements. Missing details often create sourcing risk later.",
      },
      {
        heading: "How to judge supplier capability",
        body:
          "A capable supplier should ask technical questions, confirm tolerances, review material and seal choices, arrange pressure testing, and communicate packing and delivery expectations clearly.",
      },
    ],
    faqs: [
      {
        question: "What should I send for a welded cylinder quotation?",
        answer:
          "Send drawing, bore size, rod diameter, stroke, pressure, mounting style, quantity, application, and destination requirement.",
      },
    ],
  },
  {
    slug: "hydraulic-cylinder-leakage-seal-surface-risk",
    title: "Why Hydraulic Cylinder Leakage Happens and How to Reduce the Risk",
    date: "2026-06-30",
    category: "Quality Control",
    excerpt:
      "Leakage is often connected to seal selection, rod surface, bore finish, assembly quality, contamination, and pressure testing discipline.",
    image: "/images/site/pressure-testing.jpg",
    relatedProducts: ["hydraulic-cylinder", "ck45-chrome-plated-rod", "st52-honed-tube"],
    sections: [
      {
        heading: "Leakage is rarely caused by one factor",
        body:
          "Seal damage, poor rod surface, bore roughness, contamination, pressure spikes, and assembly misalignment can all contribute to leakage in hydraulic cylinders.",
      },
      {
        heading: "Surface quality matters",
        body:
          "Chrome plated rod surface finish and honed tube bore condition influence sealing performance. Buyers should not only check dimensions, but also ask about surface inspection and testing.",
      },
      {
        heading: "Pressure testing before shipment",
        body:
          "Pressure and leakage testing helps confirm assembly condition before the cylinder is packed and shipped. It cannot replace correct design, but it reduces delivery risk.",
      },
    ],
    faqs: [
      {
        question: "Can better inspection reduce leakage risk?",
        answer:
          "Yes. Dimensional checks, surface inspection, seal review, cleanliness control, assembly inspection, and pressure testing can reduce avoidable leakage risk.",
      },
    ],
  },
  {
    slug: "buyers-check-before-custom-hydraulic-cylinders",
    title: "What Buyers Should Check Before Ordering Custom Hydraulic Cylinders",
    date: "2026-06-30",
    category: "Purchasing Guide",
    excerpt:
      "Before custom production, buyers should confirm drawing details, material, pressure, stroke, mounting, seals, testing, packing, and lead time assumptions.",
    image: "/images/site/cnc-machining.jpg",
    relatedProducts: ["custom-hydraulic-cylinder", "welded-hydraulic-cylinder"],
    sections: [
      {
        heading: "Confirm what is fixed and what can be adjusted",
        body:
          "Custom cylinder projects often include both fixed dimensions and adjustable engineering choices. Clarify critical dimensions, allowed tolerances, and acceptable alternatives before production.",
      },
      {
        heading: "Share the application environment",
        body:
          "Pressure, temperature, corrosion exposure, dust, impact, side load, and operating frequency influence material, seal, rod surface, and testing choices.",
      },
      {
        heading: "Plan documents and packing early",
        body:
          "If your project needs inspection records, pressure test reports, labeling, or special export packing, confirm these requirements before order confirmation.",
      },
    ],
    faqs: [
      {
        question: "Why is application information important?",
        answer:
          "The same drawing may perform differently in different environments. Application information helps review material, seals, surface treatment, and testing.",
      },
    ],
  },
];
