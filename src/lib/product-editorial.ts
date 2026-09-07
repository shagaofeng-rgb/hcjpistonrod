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
    manufacturing: "For a general honed-tube requirement, the starting point is the finished bore and the cylinder-barrel dimensions around it. The technical review aligns the requested ID, OD, wall, length and bore condition before the applicable honing route and cut length are confirmed. This keeps the tube discussion tied to the cylinder design rather than to an unqualified stock description.",
    customization: "Provide the cylinder-barrel drawing or a clear specification with ID, OD, wall thickness, finished length, material requirement, bore tolerance, surface requirement, quantity and destination. Where a mating piston or seal requirement affects the order, include that interface information for review.",
    inspection: "The agreed inspection record can cover ID, OD, wall condition, cut length, straightness and the specified inner-bore condition. Packing protection is reviewed as a separate export requirement so handling does not compromise the finished bore before cylinder assembly.",
    summary: "Honed tube is used for hydraulic cylinder barrel work where the finished inner bore needs to be considered together with the sealing and machining requirements of the cylinder design.",
    materials: ["Material grade reviewed against the specification", "Honed inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "The tube is the running surface on the cylinder side of the sealing system. Selecting a suitable material and bore-finish requirement helps an engineering buyer align the tube with the piston, seal and cylinder-barrel design instead of treating it as a commodity length of steel.",
    applications: ["Hydraulic cylinder barrels", "Industrial actuators", "Repair and replacement cylinder work"],
    related: ["st52-honed-tube", "ck45-honed-tube", "chrome-plated-rod", "piston-rod"],
  },
  "st52-honed-tube": {
    ...tubeBase,
    manufacturing: "ST52 honed-tube work starts by retaining the material designation through the bore-finishing and cutting review. The team compares the drawing's tube dimensions, required bore condition and machining allowance with the requested finished form before confirming the route. This is particularly useful when the buyer is replacing a named material in an established cylinder design.",
    customization: "Send the ST52 callout, applicable drawing, ID, OD, wall thickness, final cut length, tolerance, bore condition, quantity and any certificate or inspection-document requirement. State whether the request is for a new build, a replacement component or stock prepared for later machining.",
    inspection: "Inspection is based on the approved ST52 tube requirement, not a generic substitute. Review points can include material identification supplied for the order, ID and OD, wall condition, cut length and the agreed bore-finish checks, with the requested documentation confirmed before production.",
    summary: "ST52 honed tube is a material-specific option for hydraulic cylinder barrel projects where the buyer has identified ST52 in the drawing or approved material schedule.",
    materials: ["ST52 material designation", "Honed inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "Naming the material on the request helps prevent a cylinder barrel quotation from being evaluated against an unspecified substitute. The rest of the requirement still matters: the drawing should state the required dimensions, bore condition and inspection expectations.",
    applications: ["ST52 cylinder barrel projects", "Hydraulic machinery", "Replacement cylinder components"],
    related: ["honed-tube", "ck45-honed-tube", "ck45-chrome-plated-rod", "piston-rod"],
  },
  "ck45-honed-tube": {
    ...tubeBase,
    manufacturing: "CK45 honed-tube projects are reviewed as a material-specific barrel input. The route considers the stated CK45 requirement together with bore dimensions, wall condition, finished length and any machining allowance identified on the drawing. The objective is to maintain a clear connection between the material callout and the finished cylinder-barrel requirement.",
    customization: "For a CK45 review, provide the drawing, material callout, ID, OD, wall, length, target bore tolerance, bore condition, quantity and the planned cylinder application. If the buyer needs a particular inspection or material document, it should be listed with the request instead of assumed from the grade name.",
    inspection: "The final check follows the agreed CK45 tube specification. Measurements may include ID, OD, length, straightness and the inner-bore requirement, while any material evidence or additional testing is handled only when it is part of the approved order documentation.",
    summary: "CK45 honed tube is a material-specific hydraulic cylinder tube option for drawings that call for a CK45 tube and a finished bore suitable for cylinder-barrel work.",
    materials: ["CK45 material designation", "Honed inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "For a CK45 tube, the buyer should keep the material designation, dimensions and finished-bore requirement together in the purchasing file. That makes it easier to review machining allowance and the interfaces that will be finished during cylinder manufacture.",
    applications: ["CK45 cylinder barrel projects", "Hydraulic cylinders", "Machined hydraulic components"],
    related: ["honed-tube", "st52-honed-tube", "20mnv6-chrome-plated-rod", "piston-rod"],
  },
  "skived-and-roller-burnished-tube": {
    ...tubeBase,
    manufacturing: "Skived and roller burnished tube is reviewed around its stated finishing route and the finished bore required by the cylinder design. The technical conversation identifies the tube dimensions, wall condition, final length and requested inner-surface condition before skiving and roller burnishing are considered. It should not be treated as interchangeable with a tube carrying a different bore specification.",
    customization: "Share the SRB tube drawing or specification, including material, ID, OD, wall thickness, final length, bore tolerance, required surface condition, quantity and end-use. Add any handling, cut-end or packing requirement that matters before subsequent cylinder machining.",
    inspection: "Quality review is built around the confirmed SRB requirement: dimensional checks, finished length, straightness and the agreed inner-bore condition. The order record should also identify any requested inspection documentation and packing method before the tube is released for export.",
    summary: "Skived and roller burnished tube is specified where the project calls for that bore-finishing route rather than a generic tube description.",
    materials: ["Tube material reviewed against the specification", "Skived and roller burnished inner bore", "Cut length reviewed from drawing"],
    whyItMatters: "SRB tube requirements should identify the target bore condition and the design context. This lets the buyer compare the finished tube as a cylinder-barrel input, not simply compare names for two different finishing processes.",
    applications: ["Hydraulic cylinder barrels", "Industrial hydraulic equipment", "Actuator assemblies"],
    related: ["honed-tube", "st52-honed-tube", "induction-hardened-chrome-rod", "piston-rod"],
  },
  "chrome-plated-rod": {
    ...rodBase,
    manufacturing: "A hard chrome plated rod requirement is reviewed from the final outside surface back through the proposed rod route. Diameter, length, straightness, chrome requirement and end features are considered together before grinding, plating, polishing or machining are confirmed. This helps keep the rod's sealing surface and connection features within one controlled purchasing requirement.",
    customization: "Provide the drawing or specification with material, finished diameter, length, tolerance, straightness expectation, chrome requirement, end-machining details, quantity and application. Include any requested surface, certificate or packing evidence so the quotation review addresses the finished component instead of only the raw rod.",
    inspection: "The inspection plan is agreed against the requested finished rod. Typical checks may include diameter, cut length, straightness, visible surface condition, stated end features and packing protection. Chrome-related testing is included only where it has been specified for the order.",
    summary: "Hard chrome plated rod is a precision-finished rod option for hydraulic cylinders where the specified surface condition, dimensions and end features must be reviewed as one component requirement.",
    materials: ["Material reviewed against the specification", "Hard chrome plated outer surface", "End machining reviewed from drawing"],
    whyItMatters: "A rod interacts directly with the cylinder sealing system. Purchasing decisions should therefore consider the agreed surface requirement, finished dimensions, straightness expectation and end connection details together instead of selecting by diameter alone.",
    applications: ["Hydraulic cylinders", "Mobile machinery", "Industrial hydraulic equipment"],
    related: ["ck45-chrome-plated-rod", "20mnv6-chrome-plated-rod", "honed-tube", "piston-rod"],
  },
  "ck45-chrome-plated-rod": {
    ...rodBase,
    manufacturing: "CK45 chrome plated rod work maintains the grade designation through the finishing and machining review. The requested CK45 material, finished dimensions, outer-surface condition and end features are checked against the drawing before the production sequence is confirmed. This avoids quoting a material-specific rod as if it were an unspecified chrome rod.",
    customization: "For a CK45 rod request, send the material callout, drawing, diameter, finished length, tolerance, surface or chrome requirement, straightness requirement, end machining, quantity and intended cylinder use. Any required inspection record should be identified with the technical request.",
    inspection: "Checks are selected from the approved CK45 chrome rod specification and can cover material identification supplied for the order, finished diameter, length, straightness, visible surface condition and drawing-based end geometry. The final packing review protects the agreed finished surface for shipment.",
    summary: "CK45 chrome plated rod is a material-specific rod option for hydraulic cylinder drawings that identify CK45 together with a hard chrome plated finished surface.",
    materials: ["CK45 material designation", "Hard chrome plated outer surface", "Drawing-based end machining"],
    whyItMatters: "The CK45 designation should remain attached to the dimensional and finishing requirement during technical review. That gives the purchaser a clearer basis for discussing the rod's finished condition and compatibility with the intended cylinder assembly.",
    applications: ["Hydraulic cylinders", "Mobile equipment", "Industrial machinery"],
    related: ["chrome-plated-rod", "20mnv6-chrome-plated-rod", "st52-honed-tube", "piston-rod"],
  },
  "20mnv6-chrome-plated-rod": {
    ...rodBase,
    manufacturing: "For 20MnV6 chrome plated rod, the material name is retained as part of the finished-part review rather than separated from it. The team evaluates the stated 20MnV6 requirement with diameter, length, surface condition, straightness and machining features on the relevant drawing. Production planning follows the approved component requirement rather than a generic material equivalence.",
    customization: "Submit the 20MnV6 requirement together with the drawing, finished diameter and length, tolerance, straightness, chrome requirement, end features, quantity and application. Where the customer has a documentation requirement for material or inspection, it should be included in the same request.",
    inspection: "Final checks are aligned to the approved 20MnV6 rod requirement. They can include the agreed dimensional measurements, visible finished surface, straightness, end machining and packing condition; any additional material or surface evidence is only recorded when explicitly specified.",
    summary: "20MnV6 chrome plated rod is a material-specific option for hydraulic cylinder work where the drawing or approved specification calls for 20MnV6.",
    materials: ["20MnV6 material designation", "Hard chrome plated outer surface", "Drawing-based end machining"],
    whyItMatters: "A material-specific request should not be converted into a generic rod request. The buyer should retain the material designation, finishing requirements and drawing dimensions so the proposed route can be reviewed against the actual part requirement.",
    applications: ["Hydraulic cylinders", "Mobile hydraulic equipment", "Industrial hydraulic systems"],
    related: ["chrome-plated-rod", "ck45-chrome-plated-rod", "ck45-honed-tube", "piston-rod"],
  },
  "induction-hardened-chrome-rod": {
    ...rodBase,
    manufacturing: "Induction hardened chrome rod requires a process-specific review because the requested hardened condition and finished chrome surface must be considered together. The drawing should define the component dimensions, material requirement, hardening requirement, finished surface and end machining before the sequence is set. This is relevant for applications where the rod is selected for an identified wear or duty condition.",
    customization: "Please provide the drawing, material, diameter, length, tolerance, required hardened condition, chrome or surface requirement, straightness, end features, quantity and application context. The request should distinguish any mandatory test evidence from general application information.",
    inspection: "Inspection is planned from the agreed induction-hardened chrome rod specification. Depending on the requirement, the review can cover finished dimensions, straightness, visible surface condition, specified hardness evidence, end features and protected packing. No unrequested hardness claim is assumed from the product name alone.",
    summary: "Induction hardened chrome rod is intended for drawings that specifically call for a hardened surface layer together with a chrome-finished rod surface.",
    materials: ["Material reviewed against the specification", "Induction-hardening requirement", "Hard chrome plated outer surface"],
    whyItMatters: "Induction hardening is a defined process requirement, not a universal upgrade. It should be specified with the drawing, the expected surface condition and the application context so the requested hardened and finished condition can be reviewed correctly.",
    applications: ["Heavy-duty hydraulic cylinders", "Construction machinery", "Mining equipment"],
    related: ["chrome-plated-rod", "hollow-chrome-plated-rod", "skived-and-roller-burnished-tube", "piston-rod"],
  },
  "hollow-chrome-plated-rod": {
    ...rodBase,
    manufacturing: "Hollow chrome plated rod is reviewed as a component with both internal and external geometry. The drawing review brings together OD, ID, wall condition, length, outer chrome surface and end features before the manufacturing route is confirmed. Maintaining those dimensions in one specification is important because changes to one can affect the finished rod form.",
    customization: "Send a sectional drawing where possible, showing OD, ID, wall, length, tolerances, straightness, chrome requirement, end machining, material requirement, quantity and application. Include any internal-bore protection or export-packing concern that must be considered after finishing.",
    inspection: "Quality checks follow the approved hollow-rod drawing and can include OD, ID, wall-related dimensions where defined, finished length, straightness, visible outer surface and end features. The packing review addresses both the finished external surface and the protection required for the internal bore.",
    summary: "Hollow chrome plated rod is an engineered rod option with both OD and internal-bore requirements to be reviewed against the cylinder design or approved drawing.",
    materials: ["Tube/rod material reviewed against the specification", "Internal bore reviewed from drawing", "Hard chrome plated outer surface"],
    whyItMatters: "A hollow rod introduces an internal dimension alongside the finished outside surface. The OD, ID, wall condition, end features and intended application should all be included in the drawing review so the final component is evaluated as a complete design input.",
    applications: ["Special hydraulic cylinders", "Telescopic systems", "Custom machinery"],
    related: ["chrome-plated-rod", "induction-hardened-chrome-rod", "honed-tube", "piston-rod"],
  },
  "piston-rod": {
    ...rodBase,
    manufacturing: "A finished piston rod is planned from the complete component drawing, not just from the rod diameter. The review aligns the material and surface requirement with threads, shoulders, grooves, holes or other end features needed for cylinder assembly. Machining and final finishing are therefore discussed as one component route before production begins.",
    customization: "Provide the finished piston-rod drawing or clear sample information, including material, diameter, finished length, tolerance, surface condition, straightness, each end feature, quantity and target cylinder application. Note any gauge, inspection report or packing requirement that the project needs.",
    inspection: "The final review follows the approved finished-part drawing. Common points include overall dimensions, specified end geometry, visible surface condition, straightness and protected packing. Where an inspection record is required, its content is agreed before the manufacturing route is released.",
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
