import { company } from "../../data/company";
import { productCategories } from "../../data/categories";
import { products } from "../../data/products";

export const site = {
  name: "XIJIU",
  legalName: company.legalName,
  brandName: company.brandName,
  chineseName: company.chineseName,
  factoryName: company.factoryName,
  exportCompanyName: company.exportCompanyName,
  domain: company.domain,
  email: company.email,
  tel: company.phone,
  telLabel: company.phoneLabel,
  whatsapp: company.whatsapp,
  whatsappLabel: company.whatsappLabel,
  contact: "Sales Team",
  qq: company.qq,
  address: company.address,
  cnAddress: "江苏省南通海安市曲塘镇东联路29号",
  since: company.since,
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Why Xijiu", href: "/why-xijiu" },
  { label: "About Xijiu", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export const megaMenuGroups = [
  {
    label: "Hydraulic Cylinder",
    href: "/products/hydraulic-cylinder",
    links: [
      { label: "Welded Hydraulic Cylinder", href: "/products/welded-hydraulic-cylinder" },
      { label: "Custom Hydraulic Cylinder", href: "/products/custom-hydraulic-cylinder" },
      { label: "Double Acting Hydraulic Cylinder", href: "/products/double-acting-hydraulic-cylinder" },
      { label: "Single Acting Hydraulic Cylinder", href: "/products/single-acting-hydraulic-cylinder" },
      { label: "Telescopic Hydraulic Cylinder", href: "/products/telescopic-hydraulic-cylinder" },
      { label: "Flange Mounted Hydraulic Cylinder", href: "/products/flange-mounted-hydraulic-cylinder" },
    ],
  },
  {
    label: "Honed Tube",
    href: "/products/honed-tube",
    links: [
      { label: "ST52 Honed Tube", href: "/products/st52-honed-tube" },
      { label: "CK45 Honed Tube", href: "/products/ck45-honed-tube" },
      { label: "Skived and Roller Burnished Tube", href: "/products/skived-and-roller-burnished-tube" },
    ],
  },
  {
    label: "Chrome Plated Rod",
    href: "/products/chrome-plated-rod",
    links: [
      { label: "CK45 Chrome Plated Rod", href: "/products/ck45-chrome-plated-rod" },
      { label: "20MnV6 Chrome Plated Rod", href: "/products/20mnv6-chrome-plated-rod" },
      { label: "Induction Hardened Chrome Rod", href: "/products/induction-hardened-chrome-rod" },
      { label: "Hollow Chrome Plated Rod", href: "/products/hollow-chrome-plated-rod" },
    ],
  },
  {
    label: "Hydraulic Power Unit",
    href: "/products/hydraulic-power-unit",
    links: [
      { label: "Compact Hydraulic Power Pack", href: "/products/compact-hydraulic-power-pack" },
      { label: "Custom Hydraulic Power Unit", href: "/products/custom-hydraulic-power-unit" },
    ],
  },
];

export { productCategories, products };

export const industries = [
  "Construction machinery",
  "Agricultural equipment",
  "Mining machinery",
  "Material handling",
  "Industrial automation",
  "Marine and offshore equipment",
];

export const capabilities = [
  "CNC machining",
  "Welding and assembly",
  "Honing and polishing",
  "Pressure testing",
  "Surface treatment",
  "Export packing",
];

export const processRoutes = [
  { label: "Why Xijiu", href: "/why-xijiu", description: "Engineering support, quality control, delivery, and export service." },
  { label: "About Xijiu", href: "/about", description: "Factory identity, export title, capabilities, and company structure." },
  { label: "News and Insights", href: "/news", description: "Hydraulic manufacturing knowledge for buyers and engineers." },
  { label: "Contact XIJIU", href: "/contact", description: "Send drawings, specifications, or project requirements." },
];
