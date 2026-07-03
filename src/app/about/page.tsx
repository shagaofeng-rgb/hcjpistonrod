import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Factory, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { capabilities, site } from "@/lib/site";
import { company } from "../../../data/company";
import { factoryPhotos } from "../../../data/factory-photos";

export const metadata: Metadata = {
  title: "About XIJIU",
  description:
    "About XIJIU Intelligent Equipment, hydraulic cylinder and precision hydraulic component manufacturer and export support structure.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.brandName,
    legalName: company.exportCompanyName,
    email: company.email,
    telephone: company.phoneLabel,
    url: company.domain,
    address: company.address,
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About XIJIU" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">About XIJIU</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Piston Rod and Chrome Plated Rod Manufacturer
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              {company.entityStatement} The website serves overseas B2B customers looking for piston rods,
              hard chrome plated rods, honed tubes, hydraulic cylinder parts, and drawing-based components
              with clear technical communication.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-6 md:grid-cols-3">
            <article className="rounded-md border border-[var(--line)] bg-white p-6">
              <Factory className="text-[var(--amber)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Factory</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{site.factoryName}</p>
            </article>
            <article className="rounded-md border border-[var(--line)] bg-white p-6">
              <Building2 className="text-[var(--amber)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Export Company Title</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{site.exportCompanyName}</p>
            </article>
            <article className="rounded-md border border-[var(--line)] bg-white p-6">
              <MapPin className="text-[var(--amber)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Address</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{site.address}</p>
            </article>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Capabilities</p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Manufacturing and export support</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((item) => (
                <div key={item} className="rounded-md border border-[var(--line)] bg-[var(--background)] p-4 font-semibold text-[var(--ink)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Factory Photos</p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-[var(--ink)]">Real workshop, production, and product details</h2>
              </div>
              <Link href="/contact" className="font-semibold text-[var(--teal)]">
                Discuss a project
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {factoryPhotos.map((photo) => (
                <article key={photo.file} className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
                  <div className="relative aspect-[16/10] bg-[var(--muted)]">
                    <Image
                      src={photo.file}
                      alt={`${photo.title} at XIJIU factory`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{photo.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{photo.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container rounded-md bg-[#071428] p-8 text-white">
            <h2 className="text-3xl font-semibold">Need technical support?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
              Share drawings or application requirements for hydraulic cylinders and components. The team will review feasibility and quotation details.
            </p>
            <Link href="/contact" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
              Send Inquiry
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
