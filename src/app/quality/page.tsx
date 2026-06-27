import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Quality",
  description:
    "Quality checks for piston rods and hard chrome plated rods, including chrome thickness, roughness, straightness, hardness, and salt spray testing.",
  alternates: { canonical: "/quality" },
};

const checks = [
  "Material certificate and traceability on request",
  "Diameter and tolerance inspection",
  "Chrome thickness verification",
  "Surface roughness measurement",
  "Straightness inspection",
  "Hardness and induction hardening checks",
  "Salt spray test reporting when specified",
  "Surface protection and export packing review",
];

export default function QualityPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Quality</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Inspection points that matter to cylinder performance.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--steel)]">
              Quality documentation can be aligned with the drawing, purchase order, and target
              market requirements before production starts.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-4 md:grid-cols-2">
            {checks.map((check) => (
              <div key={check} className="flex gap-3 rounded-md border border-[var(--line)] bg-white p-5 text-sm font-medium text-[var(--ink)]">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} />
                {check}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
