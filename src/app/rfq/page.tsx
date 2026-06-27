import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RfqForm } from "@/components/rfq-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Send RFQ",
  description:
    "Submit a request for quote for hard chrome plated rods, induction hardened piston rods, hollow piston rods, honed tubes, or custom drawing parts.",
  alternates: { canonical: "/rfq" },
};

export default function RfqPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">RFQ</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
                Quote hydraulic rod and tube requirements with drawings or specs.
              </h1>
              <p className="mt-5 text-base leading-7 text-[var(--steel)]">
                For urgent files, email {site.email} or call {site.telLabel}. Add material,
                diameter, length, tolerance, chrome thickness, quantity, and destination port.
              </p>
            </div>
            <RfqForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
