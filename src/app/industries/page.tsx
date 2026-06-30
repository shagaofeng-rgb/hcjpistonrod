import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { industries } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Hydraulic piston rod and hard chrome rod applications for construction, agriculture, marine, mining, material handling, and industrial automation.",
  alternates: { canonical: "/industries" },
};

const industryImages: Record<string, string> = {
  "Construction machinery": "/images/site/construction-machinery.jpg",
  "Agricultural equipment": "/images/site/agricultural-equipment.jpg",
  "Mining machinery": "/images/site/mining-machinery.jpg",
  "Material handling": "/images/site/material-handling.jpg",
  "Industrial automation": "/images/site/industrial-automation.jpg",
  "Marine and offshore equipment": "/images/site/marine-offshore.jpg",
};

export default function IndustriesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Industries</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Rod and tube supply for machinery that works under load.
            </h1>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry} className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={industryImages[industry]}
                    alt={`${industry} hydraulic component applications`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-[var(--ink)]">{industry}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
                    Specification support for rod material, surface treatment, corrosion resistance,
                    packing, and repeat export supply.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
