import type { Product } from "../../data/products";

type ProductEditorial = {
  title: string;
  description: string;
  keyword: string;
  summary: string;
  materials: string[];
  specifications: [string, string][];
  whyItMatters: string;
  manufacturing: string;
  applications: string[];
  customization: string;
  inspection: string;
  faqs: { question: string; answer: string }[];
  related: string[];
};

const tubeBase = {
  manufacturing:
    "The manufacturing discussion starts with the tube form and the required finished bore. Where a drawing is supplied, XIJIU reviews the requested ID, OD, wall condition, cut length and surface requirement before agreeing the production route. Honing or skiving and roller burnishing are selected only when they match the supplied specification. Finished tubes are checked around the agreed dimensional and inner-surface requirements before protected packing.",
  customization:
    "For a useful tube review, provide the drawing or specification, material grade, ID, OD, wall thickness, finished length, ID tolerance, inner-surface requirement, quantity and end-use. These details allow the factory team to review the correct tube form and packing approach without making assumptions about cylinder pressure or sealing design.",
  inspection:
    "Inspection is planned around the approved specification. Typical review points can include ID and OD, wall condition, straightness, finished length, inner-surface condition and packing protection. Only checks that are agreed for the order should be treated as acceptance criteria.",
};

const rodBase = {
  manufacturing:
    "Rod work is reviewed from the material and finished surface outward. The production discussion can cover material preparation, straightening where applicable, grinding, surface finishing, hard chrome plating or induction hardening where specified, end machining and final inspection. Each route is confirmed against the drawing and agreed technical requirements rather than selected from a generic cylinder template.",
  customization:
    "Send a drawing, material requirement, diameter, finished length, tolerance, surface requirement, straightness requirement, end-machining details, quantity and target application. This lets the factory review the rod as a component for the intended cylinder design, while Nantong HCJ supports export documentation and communication.",
  inspection:
    "The inspection plan follows the confirmed requirement. Common review points include finished diameter, length, straightness, visible surface condition, specified end features and packing protection. Any requested material certificate, hardness evidence or surface test requirement must be agreed from the applicable drawing or inspection standard.",
};

const definitions: Record<string, Omit<ProductEditorial, "title" | "description" | "keyword" | "specifications" | "faqs">> = {
  "honed-tube": {
    ...tubeBase,
    summary: "Honed tube is used for hydraulic cylinder barrel work where the finished inner bore needs to be considered together with the sealing and machining requirements of the cylinder design.",
    materials: ["Material grade reviewed against the specification", "Honed inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "The tube is the running surface on the cylinder side of the sealing system. Selecting a suitable material and bore-finish requirement helps an engineering buyer align the tube with the piston, seal and cylinder-barrel design instead of treating it as a commodity length of steel.",
    applications: ["Hydraulic cylinder barrels", "Industrial actuators", "Repair and replacement cylinder work"],
    related: ["st52-honed-tube", "ck45-honed-tube", "chrome-plated-rod", "piston-rod"],
  },
  "st52-honed-tube": {
    ...tubeBase,
    summary: "ST52 honed tube is a material-specific option for hydraulic cylinder barrel projects where the buyer has identified ST52 in the drawing or approved material schedule.",
    materials: ["ST52 material designation", "Honed inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "Naming the material on the request helps prevent a cylinder barrel quotation from being evaluated against an unspecified substitute. The rest of the requirement still matters: the drawing should state the required dimensions, bore condition and inspection expectations.",
    applications: ["ST52 cylinder barrel projects", "Hydraulic machinery", "Replacement cylinder components"],
    related: ["honed-tube", "ck45-honed-tube", "ck45-chrome-plated-rod", "piston-rod"],
  },
  "ck45-honed-tube": {
    ...tubeBase,
    summary: "CK45 honed tube is a material-specific hydraulic cylinder tube option for drawings that call for a CK45 tube and a finished bore suitable for cylinder-barrel work.",
    materials: ["CK45 material designation", "Honed inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "For a CK45 tube, the buyer should keep the material designation, dimensions and finished-bore requirement together in the purchasing file. That makes it easier to review machining allowance and the interfaces that will be finished during cylinder manufacture.",
    applications: ["CK45 cylinder barrel projects", "Hydraulic cylinders", "Machined hydraulic components"],
    related: ["honed-tube", "st52-honed-tube", "20mnv6-chrome-plated-rod", "piston-rod"],
  },
  "skived-and-roller-burnished-tube": {
    ...tubeBase,
    summary: "Skived and roller burnished tube is specified where the project calls for that bore-finishing route rather than a generic tube description.",
    materials: ["Tube material reviewed against the specification", "Skived and roller burnished inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "SRB tube requirements should identify the target bore condition and the design context. This lets the buyer compare the finished tube as a cylinder-barrel input, not simply compare names for two different finishing processes.",
    applications: ["Hydraulic cylinder barrels", "Industrial hydraulic equipment", "Actuator assemblies"],
    related: ["honed-tube", "st52-honed-tube", "induction-hardened-chrome-rod", "piston-rod"],
  },
  "chrome-plated-rod": {
    ...rodBase,
    summary: "Hard chrome plated rod is a precision-finished rod option for hydraulic cylinders where the specified surface condition, dimensions and end features must be reviewed as one component requirement.",
    materials: ["Material reviewed against the specification", "Hard chrome plated outer surface", "End machining reviewed from drawing"],
    whyItMatters: "A rod interacts directly with the cylinder sealing system. Purchasing decisions should therefore consider the agreed surface requirement, finished dimensions, straightness expectation and end connection details together instead of selecting by diameter alone.",
    applications: ["Hydraulic cylinders", "Mobile machinery", "Industrial hydraulic equipment"],
    related: ["ck45-chrome-plated-rod", "20mnv6-chrome-plated-rod", "honed-tube", "piston-rod"],
  },
  "ck45-chrome-plated-rod": {
    ...rodBase,
    summary: "CK45 chrome plated rod is a material-specific rod option for hydraulic cylinder drawings that identify CK45 together with a hard chrome plated finished surface.",
    materials: ["CK45 material designation", "Hard chrome plated outer surface", "Drawing-based end machining"],
    whyItMatters: "The CK45 designation should remain attached to the dimensional and finishing requirement during technical review. That gives the purchaser a clearer basis for discussing the rod's finished condition and compatibility with the intended cylinder assembly.",
    applications: ["Hydraulic cylinders", "Mobile equipment", "Industrial machinery"],
    related: ["chrome-plated-rod", "20mnv6-chrome-plated-rod", "st52-honed-tube", "piston-rod"],
  },
  "20mnv6-chrome-plated-rod": {
    ...rodBase,
    summary: "20MnV6 chrome plated rod is a material-specific option for hydraulic cylinder work where the drawing or approved specification calls for 20MnV6.",
    materials: ["20MnV6 material designation", "Hard chrome plated outer surface", "Drawing-based end machining"],
    whyItMatters: "A material-specific request should not be converted into a generic rod request. The buyer should retain the material designation, finishing requirements and drawing dimensions so the proposed route can be reviewed against the actual part requirement.",
    applications: ["Hydraulic cylinders", "Mobile hydraulic equipment", "Industrial hydraulic systems"],
    related: ["chrome-plated-rod", "ck45-chrome-plated-rod", "ck45-honed-tube", "piston-rod"],
  },
  "induction-hardened-chrome-rod": {
    ...rodBase,
    summary: "Induction hardened chrome rod is intended for drawings that specifically call for a hardened surface layer together with a chrome-finished rod surface.",
    materials: ["Material reviewed against the specification", "Induction-hardening requirement", "Hard chrome plated outer surface"],
    whyItMatters: "Induction hardening is a defined process requirement, not a universal upgrade. It should be specified with the drawing, the expected surface condition and the application context so the requested hardened and finished condition can be reviewed correctly.",
    applications: ["Heavy-duty hydraulic cylinders", "Construction machinery", "Mining equipment"],
    related: ["chrome-plated-rod", "hollow-chrome-plated-rod", "skived-and-roller-burnished-tube", "piston-rod"],
  },
  "hollow-chrome-plated-rod": {
    ...rodBase,
    summary: "Hollow chrome plated rod is an engineered rod option with both OD and internal-bore requirements to be reviewed against the cylinder design or approved drawing.",
    materials: ["Tube/rod material reviewed against the specification", "Internal bore reviewed from drawing", "Hard chrome plated outer surface"],
    whyItMatters: "A hollow rod introduces an internal dimension alongside the finished outside surface. The OD, ID, wall condition, end features and intended application should all be included in the drawing review so the final component is evaluated as a complete design input.",
    applications: ["Special hydraulic cylinders", "Telescopic systems", "Custom machinery"],
    related: ["chrome-plated-rod", "induction-hardened-chrome-rod", "honed-tube", "piston-rod"],
  },
  "piston-rod": {
    ...rodBase,
    summary: "Finished piston rod is a drawing-based component route for hydraulic cylinder builders who need agreed end features as well as the finished rod surface and dimensions.",
    materials: ["Material reviewed against the approved drawing", "Finished rod surface reviewed against the specification", "End machining reviewed from drawing"],
    whyItMatters: "A finished piston rod carries the connection and surface requirements needed for cylinder assembly. Reviewing the complete drawing reduces the risk of separating rod supply from the threads, shoulders, grooves or other end features that determine how the component fits the cylinder design.",
    applications: ["Hydraulic cylinder assembly", "Mobile machinery", "Industrial equipment"],
    related: ["chrome-plated-rod", "ck45-chrome-plated-rod", "honed-tube", "skived-and-roller-burnished-tube"],
  },
};

export function getProductEditorial(product: Product): ProductEditorial {
  const entry = definitions[product.slug];
  if (!entry) {
    return {
      title: product.name, description: product.shortDescription, keyword: product.name,
      summary: product.definition, materials: [], specifications: [], whyItMatters: product.definition,
      manufacturing: "Manufacturing details are reviewed against the approved drawing and applicable product specification.",
      applications: product.applications, customization: "Send the drawing and applicable technical requirements for review.",
      inspection: "Inspection is agreed from the approved specification.", faqs: product.faqs, related: [],
    };
  }
  const specs: [string, string][] = [
    ["Product form", product.name],
    ["Material / grade", entry.materials[0]],
    ["Surface / bore condition", entry.materials[1]],
    ["Drawing review", "Dimensions, tolerances and end features reviewed before production"],
    ["Inspection focus", entry.inspection.split(".")[0]],
    ["Packing", "Protected export packing reviewed with the order requirement"],
  ];
  const descriptions: Record<string, string> = {
    "honed-tube": "Honed tube manufacturer for hydraulic cylinder projects. XIJIU reviews bore, dimensions and drawing-based requirements for overseas OEM buyers.",
    "st52-honed-tube": "ST52 honed tube supplier for hydraulic cylinder drawings. XIJIU reviews dimensions, bore requirements and protected export packing.",
    "ck45-honed-tube": "CK45 honed tube manufacturer for hydraulic cylinder barrel work, with drawing-based technical review and export support from Nantong HCJ.",
    "skived-and-roller-burnished-tube": "Skived and roller burnished tube supplier for hydraulic cylinder projects, with specification review and protected export packing.",
    "chrome-plated-rod": "Hard chrome plated rod manufacturer for hydraulic cylinders. XIJIU reviews material, finished surface and drawing-based machining requirements.",
    "ck45-chrome-plated-rod": "CK45 chrome plated rod supplier for hydraulic cylinder applications, with drawing-based machining review and export support.",
    "20mnv6-chrome-plated-rod": "20MnV6 chrome plated rod manufacturer for hydraulic cylinder drawings, with material and finished-part requirements reviewed before production.",
    "induction-hardened-chrome-rod": "Induction hardened chrome rod supplier for specified hydraulic cylinder applications, with drawing-based finishing and machining review.",
    "hollow-chrome-plated-rod": "Hollow chrome plated rod manufacturer for special hydraulic cylinder designs, with OD, ID and finished-part requirements reviewed from drawings.",
    "piston-rod": "Finished piston rod manufacturer for hydraulic cylinders, with drawing-based machining review and export support through Nantong HCJ.",
  };
  const titles: Record<string, string> = {
    "honed-tube": "Honed Tube Manufacturer for Hydraulic Cylinders",
    "st52-honed-tube": "ST52 Honed Tube Supplier for Hydraulic Cylinders",
    "ck45-honed-tube": "CK45 Honed Tube Manufacturer | Hydraulic Cylinder Tube",
    "skived-and-roller-burnished-tube": "Skived and Roller Burnished Tube Supplier",
    "chrome-plated-rod": "Hard Chrome Plated Rod Manufacturer",
    "ck45-chrome-plated-rod": "CK45 Chrome Plated Rod Supplier",
    "20mnv6-chrome-plated-rod": "20MnV6 Chrome Plated Rod Manufacturer",
    "induction-hardened-chrome-rod": "Induction Hardened Chrome Rod Supplier",
    "hollow-chrome-plated-rod": "Hollow Chrome Plated Rod Manufacturer",
    "piston-rod": "Finished Piston Rod Manufacturer for Hydraulic Cylinders",
  };
  return {
    ...entry,
    title: titles[product.slug] || `${product.name} Manufacturer`,
    description: descriptions[product.slug] || product.shortDescription,
    keyword: product.name.toLowerCase(),
    specifications: specs,
    faqs: [
      ...product.faqs,
      { question: "What information should be included in the technical request?", answer: entry.customization },
      { question: "How is inspection agreed?", answer: entry.inspection },
      { question: "Who manufactures and supports export?", answer: "Jiangsu Xijiu Intelligent Equipment Co., Ltd. is the manufacturing base. Nantong Huichenjin International Trade Co., Ltd. provides export-company support under the Nantong HCJ name." },
    ].slice(0, 7),
  };
}
