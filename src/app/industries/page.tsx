import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { industries } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Hydraulic piston rod and hard chrome rod applications for construction, agriculture, marine, mining, material handling, and industrial automation.",
  alternates: { canonical: "/industries" },
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
              <article key={industry} className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-xl font-semibold text-[var(--ink)]">{industry}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
                  Specification support for rod material, surface treatment, corrosion resistance,
                  packing, and repeat export supply.
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
