export const site = {
  name: "Nantong Huichenjin",
  legalName: "Nantong Huichenjin International Trade Co., Ltd",
  factoryName: "Nantong Huichenjin International Trade Co., Ltd",
  exportCompanyName: "Jiangsu Xijiu Intelligent Equipment Co., Ltd",
  domain: "https://www.hcjpistonrod.com",
  email: "ada@hcjpistonrod.com",
  tel: "+8613921298839",
  telLabel: "+86 139 2129 8839",
  contact: "Mr. Gong",
  qq: "546770511",
  address:
    "No. 29, Donglian Road, Qutang Town, Haian City, Nantong City, Jiangsu Province, China",
  cnAddress: "江苏省南通海安市曲塘镇东联路29号",
};

export const navItems = [
  { label: "Products", href: "/products" },
  { label: "Process", href: "/process" },
  { label: "Quality", href: "/quality" },
  { label: "Industries", href: "/industries" },
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" },
];

export const productCategories = [
  {
    slug: "chrome-plated-rods",
    name: "Chrome Plated Rods",
    headline: "Hard chrome plated rod programs for hydraulic cylinder production.",
    description:
      "Core rod supply for repair, OEM assembly, and distributor stock programs, with procurement fields kept visible for fast comparison.",
    products: ["hard-chrome-plated-rod", "induction-hardened-chrome-plated-rod"],
    specs: ["Diameter 6-300 mm", "Chrome 20-50 microns", "Tolerance f7 / f8", "Ra <= 0.2 um"],
  },
  {
    slug: "hardened-piston-rods",
    name: "Hardened Piston Rods",
    headline: "Induction hardened piston rods for demanding mobile hydraulics.",
    description:
      "Wear-focused rod options for construction machinery, mining equipment, marine hydraulics, and long-stroke cylinder applications.",
    products: ["induction-hardened-chrome-plated-rod", "hard-chrome-plated-rod"],
    specs: ["HRC 55+ target", "C45 / 40Cr / 42CrMo4", "Controlled straightness", "Export packing"],
  },
  {
    slug: "hollow-rods-and-tubes",
    name: "Hollow Rods & Honed Tubes",
    headline: "Hollow piston rods and honed tubes for cylinder barrel systems.",
    description:
      "Tube-based components for weight-sensitive systems, telescopic cylinders, and hydraulic cylinder barrel production.",
    products: ["hollow-piston-rod", "honed-tube"],
    specs: ["Custom OD / ID", "H8 / H9 bore options", "Cut-to-length", "Drawing-based machining"],
  },
  {
    slug: "custom-cylinder-components",
    name: "Custom Cylinder Components",
    headline: "Drawing-based hydraulic cylinder rod and tube components.",
    description:
      "Custom cutting, end machining, surface treatment, packing, and export coordination for repeat purchasing programs.",
    products: ["hard-chrome-plated-rod", "hollow-piston-rod", "honed-tube"],
    specs: ["Drawing review", "End machining", "Batch inspection", "Sea freight packing"],
  },
];

export const products = [
  {
    slug: "hard-chrome-plated-rod",
    name: "Hard Chrome Plated Rod",
    h1: "Hard Chrome Plated Rod for Hydraulic Cylinders",
    intro:
      "Precision ground and hard chrome plated piston rod stock for hydraulic cylinders, machinery repair, and OEM assembly programs.",
    material: "C45, 40Cr, 42CrMo4, stainless options",
    diameter: "6 mm to 300 mm",
    length: "Up to 8,000 mm, cut-to-length available",
    tolerance: "f7 / f8 / customer drawing",
    chrome: "20 to 50 microns typical",
    roughness: "Ra <= 0.2 um after polishing",
    straightness: "<= 0.2 mm / 1,000 mm typical",
    hardness: "Base material and surface hardness per drawing",
    applications: ["Hydraulic cylinders", "Agricultural machinery", "Lifting equipment"],
  },
  {
    slug: "induction-hardened-chrome-plated-rod",
    name: "Induction Hardened Chrome Rod",
    h1: "Induction Hardened Chrome Plated Rod for Heavy-Duty Cylinders",
    intro:
      "Wear-resistant chrome plated rod with induction hardened surface for mobile hydraulics and harsh working conditions.",
    material: "C45, 40Cr, 42CrMo4",
    diameter: "12 mm to 250 mm",
    length: "Up to 7,500 mm",
    tolerance: "f7 / f8",
    chrome: "25 to 50 microns typical",
    roughness: "Ra <= 0.2 um",
    straightness: "<= 0.15 mm / 1,000 mm typical",
    hardness: "HRC 55+ surface target by specification",
    applications: ["Construction machinery", "Mining equipment", "Marine hydraulics"],
  },
  {
    slug: "hollow-piston-rod",
    name: "Hollow Piston Rod",
    h1: "Hollow Piston Rod for Weight-Sensitive Hydraulic Systems",
    intro:
      "Hollow rod solutions for cylinders that need lower weight, internal routing, or application-specific machining.",
    material: "Seamless tube, alloy steel, stainless options",
    diameter: "Custom OD / ID by drawing",
    length: "Cut-to-length and machined ends",
    tolerance: "OD, ID, concentricity by drawing",
    chrome: "Optional hard chrome plating",
    roughness: "Finished surface by application",
    straightness: "Controlled before and after plating",
    hardness: "Material and heat treatment by specification",
    applications: ["Telescopic cylinders", "Special vehicles", "Automation equipment"],
  },
  {
    slug: "honed-tube",
    name: "Honed Tube",
    h1: "Honed Tube for Hydraulic Cylinder Barrels",
    intro:
      "Cold drawn or seamless honed tubes with stable bore finish for hydraulic cylinder barrel production.",
    material: "ST52, E355, 20#, 45#, stainless options",
    diameter: "ID 30 mm to 500 mm",
    length: "Stock and cut-to-length supply",
    tolerance: "H8 / H9 / drawing",
    chrome: "Not applicable, optional external protection",
    roughness: "Ra <= 0.4 um typical bore finish",
    straightness: "Controlled for cylinder barrel machining",
    hardness: "Per material and heat treatment requirement",
    applications: ["Cylinder barrels", "Hydraulic presses", "Industrial machinery"],
  },
];

export const industries = [
  "Construction machinery",
  "Agricultural equipment",
  "Material handling",
  "Marine and offshore",
  "Mining equipment",
  "Industrial automation",
];

export const capabilities = [
  "Precision grinding and polishing",
  "Hard chrome plating and surface finishing",
  "Induction hardening",
  "Cut-to-length and end machining",
  "Salt spray, hardness, roughness, and straightness checks",
  "Export packing for sea and air freight",
];

export const processRoutes = [
  { label: "Manufacturing Process", href: "/process", description: "Grinding, polishing, plating, finishing, packing." },
  { label: "Quality Control", href: "/quality", description: "Chrome thickness, roughness, hardness, salt spray." },
  { label: "Industry Applications", href: "/industries", description: "Construction, agriculture, marine, mining, automation." },
  { label: "Company Structure", href: "/company", description: "Factory identity and export company title." },
];
