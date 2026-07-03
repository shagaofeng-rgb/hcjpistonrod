export type ProductCategory = {
  slug: string;
  name: string;
  parent?: string;
  title: string;
  description: string;
  intro: string;
  image: string;
  keywords: string[];
  products: string[];
  sections: { heading: string; body: string }[];
  faqs: { question: string; answer: string }[];
};

export const productCategories: ProductCategory[] = [
  {
    slug: "hydraulic-cylinder",
    name: "Hydraulic Cylinder",
    title: "Hydraulic Cylinder Manufacturer",
    description:
      "Custom hydraulic cylinders for construction, agriculture, mining, material handling, and industrial automation equipment.",
    intro:
      "XIJIU supplies hydraulic cylinders and precision hydraulic components for OEM machinery, distributors, and project-based hydraulic systems. Cylinders can be reviewed around bore size, stroke length, mounting style, pressure, seal system, rod material, and working environment.",
    image: "/images/factory/workshop-overview.jpg",
    keywords: ["hydraulic cylinder manufacturer", "custom hydraulic cylinders"],
    products: [
      "welded-hydraulic-cylinder",
      "custom-hydraulic-cylinder",
      "double-acting-hydraulic-cylinder",
      "single-acting-hydraulic-cylinder",
      "telescopic-hydraulic-cylinder",
      "flange-mounted-hydraulic-cylinder",
    ],
    sections: [
      {
        heading: "How to Choose a Hydraulic Cylinder",
        body:
          "Buyers should confirm bore size, rod diameter, stroke length, working pressure, mounting style, speed, load, duty cycle, operating temperature, and available installation space before quotation.",
      },
      {
        heading: "Applications",
        body:
          "Hydraulic cylinders are used in lifting, pushing, pulling, pressing, steering, positioning, and heavy-duty linear motion systems for mobile and industrial machinery.",
      },
      {
        heading: "Customization Options",
        body:
          "XIJIU can support drawing-based review for mounting type, port position, seal system, rod surface, tube material, welding structure, paint color, testing, and export packing.",
      },
    ],
    faqs: [
      {
        question: "Can hydraulic cylinders be customized?",
        answer:
          "Yes. Bore size, rod diameter, stroke length, mounting style, pressure, seal system, and surface treatment can be reviewed according to your drawing or application.",
      },
      {
        question: "What information is needed for a quotation?",
        answer:
          "Please provide drawing, bore size, rod diameter, stroke, working pressure, mounting style, quantity, and application environment.",
      },
    ],
  },
  {
    slug: "welded-hydraulic-cylinder",
    name: "Welded Hydraulic Cylinder",
    parent: "hydraulic-cylinder",
    title: "Welded Hydraulic Cylinder Manufacturer",
    description:
      "Compact and durable welded hydraulic cylinders for mobile machinery and industrial hydraulic systems.",
    intro:
      "A welded hydraulic cylinder is a compact hydraulic actuator with a welded barrel and end structure. It is commonly used in mobile machinery and industrial hydraulic systems where strength, space-saving installation, and stable performance are required.",
    image: "/images/factory/heavy-processing-line.jpg",
    keywords: ["welded hydraulic cylinder manufacturer", "welded hydraulic cylinder for agricultural equipment"],
    products: [
      "welded-hydraulic-cylinder",
      "welded-type-double-acting-hydraulic-cylinder",
      "welded-type-single-acting-hydraulic-cylinder",
      "heavy-duty-welded-hydraulic-cylinder",
      "custom-welded-hydraulic-cylinder",
    ],
    sections: [
      {
        heading: "What Is a Welded Hydraulic Cylinder?",
        body:
          "A welded cylinder uses a welded construction instead of external tie rods. This can reduce installation space and improve resistance to vibration, impact, and harsh machine environments.",
      },
      {
        heading: "Advantages of Welded Hydraulic Cylinders",
        body:
          "Welded hydraulic cylinders are compact, strong, suitable for mobile equipment, and can be designed around custom mounts, ports, strokes, pressure levels, and surface protection requirements.",
      },
      {
        heading: "Quality Control and Testing",
        body:
          "Dimensional inspection, surface inspection, assembly inspection, pressure test, leakage test, and final packing inspection can be arranged before shipment.",
      },
      {
        heading: "How to Choose the Right Supplier",
        body:
          "A reliable supplier should review drawings carefully, confirm key tolerances, manage material traceability, test cylinders before shipment, and communicate clearly during production.",
      },
    ],
    faqs: [
      {
        question: "Can welded hydraulic cylinders be customized?",
        answer:
          "Yes. Bore size, stroke length, mounting type, port position, working pressure, rod material, seal brand, and surface treatment can be customized according to your application.",
      },
      {
        question: "What tests are performed before shipment?",
        answer:
          "Dimensional inspection, surface inspection, assembly inspection, pressure test, leakage test, and final packing inspection can be arranged before shipment.",
      },
    ],
  },
  {
    slug: "custom-hydraulic-cylinder",
    name: "Custom Hydraulic Cylinder",
    parent: "hydraulic-cylinder",
    title: "Custom Hydraulic Cylinder Supplier",
    description:
      "Drawing-based OEM hydraulic cylinder solutions for machinery manufacturers and project hydraulic systems.",
    intro:
      "Custom hydraulic cylinders are designed around the buyer's drawing, load, pressure, stroke, mounting style, speed, sealing conditions, and operating environment. XIJIU supports technical review before quotation.",
    image: "/images/factory/cnc-machining-line.jpg",
    keywords: ["custom hydraulic cylinder supplier", "hydraulic cylinder bore size and stroke customization"],
    products: ["custom-hydraulic-cylinder", "custom-welded-hydraulic-cylinder"],
    sections: [
      {
        heading: "What to Confirm Before Custom Production",
        body:
          "Confirm dimensions, pressure, load, installation space, rod movement, operating temperature, corrosion exposure, paint or coating requirements, testing, and packing before production.",
      },
      {
        heading: "Drawing Review",
        body:
          "A drawing review helps identify unclear tolerances, missing ports, seal requirements, stroke limits, mounting details, and possible manufacturing risks before an order is placed.",
      },
    ],
    faqs: [
      {
        question: "Can you review a sample instead of a drawing?",
        answer:
          "A sample can help, but a drawing or measured specification is recommended for accurate quotation and production confirmation.",
      },
    ],
  },
  {
    slug: "honed-tube",
    name: "Honed Tube",
    title: "Honed Tube Manufacturer",
    description:
      "Precision honed tubes for hydraulic cylinder barrels and high-performance actuator systems.",
    intro:
      "A honed tube is a precision-finished cylinder barrel tube with a smooth inner surface. It helps support stable sealing, smoother movement, and reliable hydraulic cylinder performance.",
    image: "/images/factory/raw-material-stock.jpg",
    keywords: ["honed tube manufacturer", "honed tube for hydraulic cylinder barrel"],
    products: ["st52-honed-tube", "ck45-honed-tube", "skived-and-roller-burnished-tube"],
    sections: [
      {
        heading: "What to Consider When Buying Honed Tube",
        body:
          "Buyers should check material grade, inner diameter, wall thickness, bore tolerance, surface roughness, straightness, cutting length, and packing method.",
      },
      {
        heading: "Applications",
        body:
          "Honed tubes are commonly used for hydraulic cylinder barrels, actuator bodies, hydraulic presses, lifting systems, and industrial machinery.",
      },
    ],
    faqs: [
      {
        question: "What bore tolerance can be discussed?",
        answer:
          "H8, H9, or drawing-based tolerances can be reviewed according to the application and production feasibility.",
      },
    ],
  },
  {
    slug: "chrome-plated-rod",
    name: "Chrome Plated Rod",
    title: "Chrome Plated Rod Supplier",
    description:
      "Hard chrome plated rods for hydraulic piston rods with wear resistance and corrosion protection.",
    intro:
      "A chrome plated rod is a precision ground and hard chrome plated steel rod used as a hydraulic piston rod. It is selected for wear resistance, corrosion protection, surface finish, and dimensional stability.",
    image: "/images/factory/chrome-rod-stock.jpg",
    keywords: ["chrome plated rod supplier", "hard chrome plated rod for hydraulic piston"],
    products: [
      "ck45-chrome-plated-rod",
      "20mnv6-chrome-plated-rod",
      "induction-hardened-chrome-rod",
      "hollow-chrome-plated-rod",
    ],
    sections: [
      {
        heading: "Quotation Factors for Chrome Plated Rods",
        body:
          "Before quotation, please confirm the material, hardness requirement, chrome plating requirement, and rod length. Diameter, tolerance, and end machining can be reviewed together when drawings are available.",
      },
      {
        heading: "Applications",
        body:
          "Chrome plated rods are used in hydraulic cylinders for construction machinery, agricultural equipment, lifting systems, mining equipment, and industrial automation.",
      },
    ],
    faqs: [
      {
        question: "Can rod length be cut to order?",
        answer:
          "Cut-to-length supply and drawing-based end machining can be discussed according to quantity and production requirements.",
      },
    ],
  },
];
