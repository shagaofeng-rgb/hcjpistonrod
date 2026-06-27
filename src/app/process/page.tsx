import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Process",
  description:
    "Manufacturing process for hydraulic piston rods: material preparation, grinding, polishing, hard chrome plating, inspection, and export packing.",
  alternates: { canonical: "/process" },
};

const steps = [
  ["Material preparation", "Steel grade, diameter, and heat treatment route are confirmed from drawings or purchase standards."],
  ["Grinding and polishing", "Rod stock is prepared for tolerance, surface quality, and plating adhesion."],
  ["Hard chrome plating", "Chrome thickness and finish are controlled according to operating environment and customer specification."],
  ["Finishing", "Final polishing, cutting, end machining, and protective oiling are arranged before packing."],
  ["Export packing", "Rods and tubes are protected against corrosion, bending, and surface damage during transit."],
];

export default function ProcessPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Process</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              A specification-first path from steel bar to finished rod.
            </h1>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-5">
            {steps.map(([title, body], index) => (
              <div key={title} className="grid gap-4 rounded-md border border-[var(--line)] bg-white p-5 md:grid-cols-[120px_1fr]">
                <div className="font-mono text-sm font-semibold text-[var(--teal)]">
                  STEP {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">{title}</h2>
                  <p className="mt-2 text-base leading-7 text-[var(--steel)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
