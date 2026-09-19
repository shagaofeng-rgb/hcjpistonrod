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
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=No.%2029%2C%20Donglian%20Road%2C%20Qutang%20Town%2C%20Haian%20City%2C%20Nantong%20City%2C%20Jiangsu%20Province%2C%20China",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d2033.6724448912032!2d120.35127725302301!3d32.51238500813398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sNo.%2029%2C%20Donglian%20Road%2C%20Qutang%20Town%2C%20Haian%20City%2C%20Nantong%20City%2C%20Jiangsu%20Province%2C%20China!5e1!3m2!1sen!2suk!4v1789374378451!5m2!1sen!2suk",
  since: company.since,
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Why Xijiu", href: "/why-xijiu" },
  { label: "About Xijiu", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Blog", href: "/blog" },
  { label: "Search", href: "/search" },
  { label: "Contact", href: "/contact" },
];

export const megaMenuGroups = [
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
  "Heat treatment and hardening",
  "Honing and polishing",
  "Chrome plating support",
  "Surface treatment",
  "Export packing",
];

export const processRoutes = [
  { label: "Why Xijiu", href: "/why-xijiu", description: "Engineering support, quality control, delivery, and export service." },
  { label: "About Xijiu", href: "/about", description: "Factory identity, export title, capabilities, and company structure." },
  { label: "News and Insights", href: "/news", description: "Hydraulic manufacturing knowledge for buyers and engineers." },
  { label: "Technical Blog", href: "/blog", description: "Practical sourcing and engineering notes for hydraulic component buyers." },
  { label: "Contact XIJIU", href: "/contact", description: "Send drawings, specifications, or project requirements." },
];
