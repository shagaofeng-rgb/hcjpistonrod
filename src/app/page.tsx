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
import { newsArticles } from "../../data/news";

export const metadata: Metadata = {
  title: "Hydraulic Cylinder Manufacturer",
  description:
    "XIJIU supplies custom hydraulic cylinders, honed tubes, chrome plated rods, hydraulic power units, and OEM hydraulic solutions.",
  keywords: [
    "hydraulic cylinder manufacturer",
    "custom hydraulic cylinders",
    "hydraulic components supplier",
    "hydraulic cylinder factory in China",
    "XIJIU Intelligent Equipment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "XIJIU Intelligent Equipment | Hydraulic Cylinder Manufacturer",
    description:
      "Custom hydraulic cylinders and precision hydraulic components for overseas B2B machinery buyers.",
    url: "/",
  },
};

const categoryCards = productCategories.filter((category) =>
  ["hydraulic-cylinder", "welded-hydraulic-cylinder", "custom-hydraulic-cylinder", "honed-tube", "chrome-plated-rod", "hydraulic-power-unit"].includes(category.slug),
);

const advantages = [
  {
    icon: Settings2,
    title: "Custom Engineering Support",
    body:
      "We support bore size, stroke length, mounting type, port position, rod material, seal system, and surface treatment customization according to your application.",
  },
  {
    icon: Wrench,
    title: "Precision Machining Capability",
    body:
      "CNC machining, honing, welding, polishing, assembly, and pressure testing processes help ensure stable performance and dimensional accuracy.",
  },
  {
    icon: ShieldCheck,
    title: "Strict Quality Inspection",
    body:
      "Incoming material inspection, process inspection, dimensional checks, surface inspection, pressure testing, and final inspection are implemented before shipment.",
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

const testimonials = [
  {
    role: "Purchasing Manager, Construction Machinery Manufacturer",
    quote:
      "XIJIU helped us review cylinder drawings, confirm key dimensions, and arrange production with clear communication. The cylinders arrived well packed and passed our internal inspection.",
  },
  {
    role: "Hydraulic System Engineer, Industrial Equipment Company",
    quote:
      "The technical discussion focused on application conditions, pressure, sealing, and surface treatment, which helped us reduce uncertainty before purchasing.",
  },
  {
    role: "Distributor, Hydraulic Components Market",
    quote:
      "Clear packing, product labeling, and responsive quotation support are valuable when we handle repeat orders for different local customers.",
  },
];

const capabilityImages = [
  { label: "CNC Machining", image: "/images/site/cnc-machining.jpg" },
  { label: "Welding and Assembly", image: "/images/site/welding-robot.jpg" },
  { label: "Pressure Testing", image: "/images/site/pressure-testing.jpg" },
  { label: "Surface Treatment", image: "/images/site/factory-workshop.jpg" },
];

const applicationImages: Record<string, string> = {
  "Construction machinery": "/images/site/construction-machinery.jpg",
  "Agricultural equipment": "/images/site/agricultural-equipment.jpg",
  "Mining machinery": "/images/site/mining-machinery.jpg",
  "Material handling": "/images/site/material-handling.jpg",
  "Industrial automation": "/images/site/industrial-automation.jpg",
  "Marine and offshore equipment": "/images/site/marine-offshore.jpg",
};

export default function Home() {
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
                { icon: "factory", value: `Since ${site.since}`, label: "Hydraulic manufacturing supply support" },
                { icon: "clipboard", value: company.customProjects, label: "Custom projects and drawing reviews" },
                { icon: "gauge", value: company.machiningEquipment, label: "Machining and inspection equipment" },
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
                  Hydraulic Products and Custom Manufacturing Solutions
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">
                  Explore our main product categories for hydraulic cylinders, honed tubes, chrome plated rods, and hydraulic power units.
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
                XIJIU Intelligent Equipment focuses on hydraulic cylinders and precision hydraulic components. Our manufacturing process covers machining, welding, honing, polishing, assembly, pressure testing, surface treatment, and export packing. We help machinery manufacturers, distributors, and engineering companies source reliable hydraulic products with consistent quality.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["CNC Machining", "Welding and Assembly", "Pressure Testing", "Surface Treatment"].map((item) => (
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
                    Hydraulic cylinders and components for demanding motion, lifting, pushing, and control applications.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Testimonials</p>
            <h2 className="mt-3 text-4xl font-semibold text-[var(--ink)]">What Our Customers Value</h2>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {testimonials.map((item) => (
                <article key={item.role} className="rounded-md border border-[var(--line)] bg-[var(--background)] p-6">
                  <p className="text-base leading-7 text-[var(--ink)]">“{item.quote}”</p>
                  <div className="mt-5 text-sm font-semibold text-[var(--steel)]">{item.role}</div>
                </article>
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
            src="/images/site/hydraulic-press.jpg"
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
