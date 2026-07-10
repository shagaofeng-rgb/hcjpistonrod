import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FileCheck2,
  Globe2,
  HardHat,
  PackageCheck,
  Settings2,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { AdvantageCard } from "@/components/advantage-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import { NewsCard } from "@/components/news-card";
import { ProductCard } from "@/components/product-card";
import { StatsCounter } from "@/components/stats-counter";
import { industries, productCategories, site } from "@/lib/site";
import { company } from "../../data/company";
import { getPublishedNewsArticles } from "@/lib/news-content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Piston Rod and Chrome Plated Rod Manufacturer",
  description:
    "XIJIU supplies piston rods, hard chrome plated rods, honed tubes, and drawing-based hydraulic components for overseas B2B buyers.",
  keywords: [
    "piston rod manufacturer",
    "hard chrome plated rod supplier",
    "hydraulic components supplier",
    "hydraulic piston rod factory in China",
    "XIJIU Intelligent Equipment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "XIJIU Intelligent Equipment | Piston Rod and Chrome Plated Rod Manufacturer",
    description:
      "Piston rods, hard chrome plated rods, honed tubes, and drawing-based hydraulic components for overseas B2B buyers.",
    url: "/",
  },
};

const categoryCards = productCategories.filter((category) =>
  ["chrome-plated-rod", "honed-tube"].includes(category.slug),
);

const advantages = [
  {
    icon: Settings2,
    title: "Drawing-Based Rod Support",
    body:
      "We support material, hardness, chrome requirement, length, diameter, tolerance, and end machining review according to your drawing or sample.",
  },
  {
    icon: Wrench,
    title: "Heat Treatment and Precision Machining",
    body:
      "Heat treatment, CNC machining, honing, polishing, and inspection processes support stable hardness, surface finish, and dimensional accuracy.",
  },
  {
    icon: ShieldCheck,
    title: "Strict Quality Inspection",
    body:
      "Incoming material inspection, hardness checks, dimensional checks, surface inspection, chrome layer review, and final inspection are implemented before shipment.",
  },
  {
    icon: FileCheck2,
    title: "Reliable Material Selection",
    body:
      "We select suitable steel grades, honed tubes, chrome plated rods, seals, and coatings based on working pressure, load, environment, and service life requirements.",
  },
  {
    icon: Truck,
    title: "Flexible Production and Delivery",
    body:
      "Standard models and repeat orders can be arranged efficiently, while customized projects are managed with clear technical communication and production planning.",
  },
  {
    icon: Globe2,
    title: "Export Service and After-Sales Support",
    body:
      "We support overseas customers with technical communication, packing, documentation, shipping coordination, and after-sales response.",
  },
];

const processSteps = [
  "Requirement Review",
  "Drawing / Sample Confirmation",
  "Material Selection",
  "Machining and Welding",
  "Assembly and Pressure Testing",
  "Packing and Shipment",
];

const capabilityImages = [
  { label: "CNC Machining", image: "/images/factory/cnc-machining-line.jpg" },
  { label: "Heat Treatment Line", image: "/images/factory/heat-treatment-line.jpg" },
  { label: "Chrome Rod Stock", image: "/images/factory/chrome-rod-stock.jpg" },
  { label: "Export Wooden Crate Packing", image: "/images/site/export-wooden-crate-packing.jpg" },
];

const applicationImages: Record<string, string> = {
  "Construction machinery": "/images/site/construction-machinery.jpg",
  "Agricultural equipment": "/images/site/agricultural-equipment.jpg",
  "Mining machinery": "/images/site/mining-machinery.jpg",
  "Material handling": "/images/site/material-handling.jpg",
  "Industrial automation": "/images/site/industrial-automation.jpg",
  "Marine and offshore equipment": "/images/site/marine-offshore.jpg",
};

export default async function Home() {
  const newsArticles = await getPublishedNewsArticles();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brandName,
    legalName: site.exportCompanyName,
    email: site.email,
    telephone: site.telLabel,
    url: site.domain,
    address: site.address,
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <HeroSlider />

        <section className="border-b border-[var(--line)] bg-[var(--background)] py-7">
          <div className="container">
            <StatsCounter
              items={[
                { icon: "factory", value: "Factory Direct", label: "Jiangsu Xijiu manufacturing base" },
                { icon: "clipboard", value: company.customProjects, label: "Rod drawings and sample reviews" },
                { icon: "gauge", value: company.machiningEquipment, label: "Machining, polishing, and inspection support" },
                { icon: "globe", value: "Worldwide", label: "Export support for overseas B2B buyers" },
              ]}
            />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Products</p>
                <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)]">
                  Piston Rods and Chrome Plated Rod Supply
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">
                  Explore hard chrome plated rods, piston rods, hollow chrome plated rods, induction hardened rods, and honed tubes from XIJIU.
                </p>
              </div>
              <Link href="/products" className="inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                View all products <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {categoryCards.map((category) => (
                <ProductCard key={category.slug} item={category} href={`/products/${category.slug}`} />
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Why XIJIU</p>
            <h2 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Why Global Customers Choose XIJIU</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {advantages.map((item) => (
                <AdvantageCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Custom Process</p>
                <h2 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)]">From Drawing to Delivery</h2>
                <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                  Have a drawing or sample? Send it to us for technical review and practical quotation support.
                </p>
                <Link href="/contact" className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
                  Upload Drawing / Contact Engineer
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {processSteps.map((step, index) => (
                  <article key={step} className="rounded-md border border-[var(--line)] bg-white p-5">
                    <div className="text-sm font-semibold text-[var(--amber)]">0{index + 1}</div>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--ink)]">{step}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                      XIJIU confirms technical details and production requirements before moving to the next stage.
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="grid grid-cols-2 gap-4">
              {capabilityImages.map((item) => (
                <div key={item.label} className="relative aspect-square overflow-hidden rounded-md bg-[var(--muted)]">
                  <Image
                    src={item.image}
                    alt={`${item.label} capability at XIJIU Intelligent Equipment`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[#071428]/55" />
                  <span className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">{item.label}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Manufacturing Capability</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)]">
                Built for Stable Hydraulic Component Manufacturing
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--steel)]">
                XIJIU Intelligent Equipment focuses on piston rods, hard chrome plated rods, honed tubes, and precision rod-related hydraulic components. Our manufacturing process covers material preparation, heat treatment, machining, honing, polishing, surface treatment, inspection, and export wooden crate packing. We help machinery manufacturers, distributors, and engineering companies source reliable rod products with consistent quality.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["CNC Machining", "Heat Treatment", "Chrome Rod Stock", "Export Wooden Crate Packing"].map((item) => (
                  <div key={item} className="rounded-md border border-[var(--line)] bg-[var(--background)] px-4 py-3 font-semibold text-[var(--ink)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Applications</p>
            <h2 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Applications of XIJIU Hydraulic Products</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {industries.map((industry) => (
                <Link key={industry} href="/products" className="rounded-md border border-[var(--line)] bg-white p-5 transition hover:-translate-y-1 hover:border-[var(--teal)]">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-[var(--muted)]">
                    <Image
                      src={applicationImages[industry]}
                      alt={`${industry} hydraulic application for XIJIU products`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                  </div>
                  <HardHat className="mt-5 text-[var(--amber)]" size={24} />
                  <h3 className="mt-4 text-xl font-semibold text-[var(--ink)]">{industry}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                    Piston rods, chrome plated rods, and related components for demanding motion, lifting, pushing, and hydraulic applications.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Insights</p>
                <h2 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Hydraulic Manufacturing Insights</h2>
              </div>
              <Link href="/news" className="inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                Read news <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {newsArticles.slice(0, 3).map((article) => (
                <NewsCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Quality Documents</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)]">Quality Documents and Export Support</h2>
              <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                Available documents and quality records can be provided upon request according to order requirements.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["ISO 9001 quality system document", "Material Inspection Report", "Pressure Test Report", "Export Packing Standard", "Customer Drawing Confidentiality"].map((item) => (
                <div key={item} className="flex gap-3 rounded-md border border-[var(--line)] bg-[var(--background)] p-4 font-semibold text-[var(--ink)]">
                  <PackageCheck className="shrink-0 text-[var(--teal)]" size={20} /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#071428] py-20 text-white">
          <Image
            src="/images/factory/factory-exterior.jpg"
            alt="XIJIU hydraulic project quotation support"
            fill
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="container relative">
            <div className="max-w-3xl">
              <Boxes className="text-[#ffb3b8]" size={30} />
              <h2 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">Ready to Start Your Hydraulic Project?</h2>
              <p className="mt-5 text-lg leading-8 text-white/76">
                Send us your drawing, specification, or application requirements. Our team will help review the technical details and provide a practical quotation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--amber)] px-5 font-semibold text-white">
                  Get A Quote
                </Link>
                <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 px-5 font-semibold text-white">
                  Contact Us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
