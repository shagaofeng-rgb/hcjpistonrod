import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, FileCheck2, Globe2, Settings2, ShieldCheck, Truck, Wrench } from "lucide-react";
import { AdvantageCard } from "@/components/advantage-card";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { company } from "../../../data/company";

export const metadata: Metadata = {
  title: "Why Xijiu",
  description:
    "Why global customers choose XIJIU for custom hydraulic cylinders, precision hydraulic components, quality control, and export support.",
  alternates: { canonical: "/why-xijiu" },
};

const advantages = [
  {
    icon: Settings2,
    title: "Custom Engineering Support",
    body:
      "Bore size, stroke length, mounting type, port position, rod material, seal system, and surface treatment can be reviewed according to your application.",
  },
  {
    icon: Wrench,
    title: "Precision Manufacturing",
    body:
      "Machining, welding, honing, polishing, assembly, pressure testing, surface treatment, and packing are managed as connected production steps.",
  },
  {
    icon: ShieldCheck,
    title: "Strict Inspection",
    body:
      "Incoming material checks, dimensional inspection, surface inspection, pressure testing, leakage testing, and final inspection reduce sourcing risk.",
  },
  {
    icon: FileCheck2,
    title: "Quality Documents",
    body:
      "Available documents can be provided upon request according to order requirements, including inspection and testing records.",
  },
  {
    icon: Truck,
    title: "Delivery Planning",
    body:
      "Custom projects and repeat orders are managed with technical confirmation, production planning, packing, and shipment coordination.",
  },
  {
    icon: Globe2,
    title: "Export Support",
    body:
      "Overseas customers receive communication support for drawings, quotations, packing, documentation, and after-sales response.",
  },
];

export default function WhyXijiuPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Why Xijiu" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Why XIJIU</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Why Global Customers Choose XIJIU
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              {company.entityStatement} We provide hydraulic cylinders, honed tubes, chrome plated rods,
              hydraulic power units, and OEM hydraulic solutions for overseas machinery customers who need
              controlled quality, clear communication, and practical customization support.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item) => (
              <AdvantageCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Risk Control</p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">What buyers can expect before ordering</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Requirement and drawing review before quotation",
                "Material, seal, surface, and testing options discussed by application",
                "Quality records available upon request",
                "Export packing and documentation coordination",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-md border border-[var(--line)] bg-[var(--background)] p-4 font-semibold text-[var(--ink)]">
                  <ClipboardCheck className="shrink-0 text-[var(--teal)]" size={20} /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container rounded-md bg-[#071428] p-8 text-white">
            <h2 className="text-3xl font-semibold">Need technical support?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
              Send drawings, specifications, or application requirements. XIJIU will help review the technical details and provide practical quotation support.
            </p>
            <Link href="/contact" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
              Contact XIJIU
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
