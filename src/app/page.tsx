import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  Cog,
  Factory,
  Handshake,
  HardHat,
  PackageCheck,
  Ruler,
  Send,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero-slider";
import { site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Piston Rod, Hard Chrome Plated Rod & Honed Tube Manufacturer | XIJIU",
  description: "XIJIU manufactures precision piston rods, chrome plated rods, honed tubes and drawing-based hydraulic components for global OEM buyers.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Precision Rods. Reliable Motion. Built to Print. | XIJIU",
    description: "Precision piston rods, hard chrome plated rods, honed tubes and custom-machined hydraulic components.",
    url: "/",
    images: [{ url: "/images/og/home.jpg", width: 1200, height: 630, alt: "XIJIU Intelligent Equipment" }],
  },
};

const productRows = [
  { name: "Piston Rods", description: "Precision turned and ground for strength, straightness and fatigue resistance.", spec: "Diameter: 20 - 500 mm\nLength: Up to 12 m", href: "/products/chrome-plated-rod", icon: Ruler },
  { name: "Hard Chrome Plated Rods", description: "Hard chrome finish for wear resistance and corrosion protection.", spec: "Chrome thickness: 15 - 60 μm\nDiameter: 20 - 500 mm", href: "/products/chrome-plated-rod", icon: BadgeCheck },
  { name: "Honed Tubes", description: "Precision honed bore and fine surface finish for smooth sealing and tight tolerances.", spec: "ID: 25 - 600 mm\nLength: Up to 12 m", href: "/products/honed-tube", icon: CircleCheck },
  { name: "Custom-Machined Components", description: "Turned, milled and drilled components built to your specification.", spec: "Materials: Carbon Steel, Alloy Steel,\nStainless Steel & more", href: "/products", icon: Cog },
  { name: "Custom Solutions", description: "From prototype to production. We build to your drawing.", spec: "Low to high volume\nOn-time. On-spec.", href: "/contact", icon: Wrench },
];

const processSteps = [
  { label: "Material Inspection", detail: "Confirmed material with traceability", icon: BadgeCheck },
  { label: "Turning & Straightening", detail: "Precision turning and straightening", icon: Cog },
  { label: "Heat Treatment", detail: "Induction hardening for core strength", icon: Factory },
  { label: "Grinding & Honing", detail: "Tight tolerance and surface finish", icon: Ruler },
  { label: "Chrome Plating", detail: "Hard chrome for wear and corrosion", icon: ShieldCheck },
  { label: "Final Inspection", detail: "Dimensional and surface verification", icon: CircleCheck },
];

const industries = [
  { label: "Construction Equipment", body: "Cylinder and rod components for heavy-duty performance.", icon: HardHat },
  { label: "Agricultural Machinery", body: "Built to withstand tough field conditions.", icon: Factory },
  { label: "Industrial Hydraulics", body: "Reliable motion for presses, lifts and automation.", icon: Cog },
  { label: "Material Handling", body: "Durable solutions for demanding material-handling applications.", icon: PackageCheck },
  { label: "Energy", body: "Supporting motion systems in wind, solar and more.", icon: CircleCheck },
  { label: "Marine", body: "Corrosion-resistant components for marine systems.", icon: Truck },
];

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
      <main className="bg-[#f7f9fa]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <section className="border-b border-[#d9e3e9] bg-white">
          <div className="container flex min-h-11 items-center overflow-x-auto whitespace-nowrap py-2 text-xs font-medium text-[#132b42] sm:text-sm">
            {["Piston Rods", "Chrome Plated Rods", "Honed Tubes", "Machined Components", "Custom Solutions"].map((item, index) => (
              <Link key={item} href={index === 2 ? "/products/honed-tube" : "/products/chrome-plated-rod"} className="inline-flex shrink-0 items-center gap-2 border-r border-[#d9e3e9] px-5 first:pl-0 last:border-r-0 hover:text-[#0068ae] sm:px-7">
                <CircleCheck size={15} strokeWidth={1.5} className="text-[#0068ae]" /> {item}
              </Link>
            ))}
          </div>
        </section>
        <Hero />

        <section className="bg-white py-14 sm:py-18">
          <div className="container">
            <div className="flex flex-col gap-4 border-b border-[#d9e3e9] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0068ae]">Our Products</p>
                <h2 className="mt-2 text-3xl font-semibold text-[#061a2f] sm:text-4xl">Engineered for Performance</h2>
              </div>
              <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0068ae] hover:text-[#004f85]">View All Products <ArrowRight size={16} /></Link>
            </div>
            <div>
              {productRows.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} className="group grid gap-4 border-b border-[#d9e3e9] py-5 transition hover:bg-[#f7fafc] md:grid-cols-[64px_minmax(0,1.4fr)_minmax(12rem,1fr)_28px] md:items-center md:px-4">
                    <Icon size={31} strokeWidth={1.35} className="mt-0.5 shrink-0 text-[#0068ae]" />
                    <div>
                      <h3 className="text-lg font-semibold text-[#061a2f]">{item.name}</h3>
                      <p className="mt-1 max-w-md text-sm leading-6 text-[#526a7c]">{item.description}</p>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-[#526a7c] md:pl-4">{item.spec}</p>
                    <ArrowRight size={20} className="hidden text-[#0068ae] transition group-hover:translate-x-1 md:block" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#061a2f] py-16 text-white sm:py-20">
          <Image src="/images/home-redesign/template-process-line.png" alt="Precision rod processing line" fill className="object-cover object-right opacity-35" sizes="100vw" />
          <div className="absolute inset-0 bg-[#061a2f]/72" />
          <div className="container relative">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#19a9e5]">Built on capability. Verified by quality.</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Controlled Processes.<br />Measured Results.</h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/76">From material to final inspection, every step is controlled and documented to meet your requirements.</p>
            </div>
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-6">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return <div key={step.label} className="border-t border-white/24 pt-4 lg:border-t-0 lg:pt-0">
                  <span className="text-xs font-semibold text-[#19a9e5]">0{index + 1}</span>
                  <Icon size={21} strokeWidth={1.5} className="mt-4 text-[#81d2f3]" />
                  <h3 className="mt-3 text-sm font-semibold leading-5">{step.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/64">{step.detail}</p>
                </div>;
              })}
            </div>
            <div className="mt-12 grid border-t border-white/30 pt-7 sm:grid-cols-2 lg:grid-cols-5">
              {["±0.01 mm|Dimensional Tolerance", "Ra 0.2 μm|Surface Finish", "100%|Inspection Coverage", "12 m|Max Single Piece Length", "20 - 600 mm|Diameter Range"].map((item) => {
                const [value, label] = item.split("|");
                return <div key={value} className="border-b border-white/15 py-5 sm:border-b-0 sm:border-r sm:px-5 first:pl-0 last:border-r-0">
                  <div className="text-2xl font-semibold text-[#19a9e5]">{value}</div>
                  <div className="mt-1 text-xs text-white/68">{label}</div>
                </div>;
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-18">
          <div className="container">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0068ae]">Industries we serve</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#061a2f] sm:text-4xl">Powering Critical Applications</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {industries.map((industry) => {
                const Icon = industry.icon;
                return <Link key={industry.label} href="/industries" className="group min-h-60 border border-[#d9e3e9] bg-white p-5 transition hover:-translate-y-1 hover:border-[#0068ae] hover:shadow-[0_12px_24px_rgba(6,26,47,0.08)]">
                  <Icon size={37} strokeWidth={1.35} className="text-[#0068ae]" />
                  <h3 className="mt-6 text-base font-semibold leading-5 text-[#061a2f]">{industry.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#526a7c]">{industry.body}</p>
                </Link>;
              })}
            </div>
            <div className="mt-12 grid gap-6 border-t border-[#d9e3e9] pt-8 md:grid-cols-4">
              {[
                { title: "Drawing to Delivery", body: "Upload your drawing and get expert feedback fast.", icon: Send },
                { title: "Engineering Support", body: "Collaborate with engineers to optimize manufacturability.", icon: Handshake },
                { title: "Consistent Quality", body: "Process control and inspection ensure parts you can rely on.", icon: ShieldCheck },
                { title: "On-Time. Every Time.", body: "Reliable lead times and flexible production planning.", icon: Truck },
              ].map((item) => {
                const Icon = item.icon;
                return <div key={item.title} className="flex gap-3">
                  <Icon size={30} strokeWidth={1.45} className="shrink-0 text-[#0068ae]" />
                  <div><h3 className="text-sm font-semibold text-[#061a2f]">{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#526a7c]">{item.body}</p></div>
                </div>;
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
