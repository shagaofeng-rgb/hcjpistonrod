import type { Metadata } from "next";
import { Building2, Factory, FileCheck2, MapPin } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Company structure for Nantong Huichenjin factory and Jiangsu Xijiu export company title for hydraulic piston rod export business.",
  alternates: { canonical: "/company" },
};

export default function CompanyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
              Company structure
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Factory supply with a dedicated export company title.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              The website uses Nantong Huichenjin as the manufacturing brand and factory identity.
              Jiangsu Xijiu Intelligent Equipment Co., Ltd is shown as the export company title for
              international trade documents, contracts, and shipment coordination.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-5 lg:grid-cols-2">
            <article className="rounded-md border border-[var(--line)] bg-white p-6">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-[var(--muted)] text-[var(--teal)]">
                <Factory size={24} />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                Factory identity
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">{site.factoryName}</h2>
              <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                Used for manufacturing capability, product supply, technical specification, quality
                control, and factory-facing buyer communication.
              </p>
            </article>
            <article className="rounded-md border border-[var(--line)] bg-white p-6">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-[var(--muted)] text-[var(--teal)]">
                <Building2 size={24} />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                Export company title
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">{site.exportCompanyName}</h2>
              <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                Used as the export-facing company title for international trade, invoice details,
                shipment coordination, and external documentation when required.
              </p>
            </article>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-5 md:grid-cols-3">
            <div className="rounded-md border border-[var(--line)] bg-[var(--background)] p-5">
              <FileCheck2 className="text-[var(--teal)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Clear buyer communication</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                Product and factory pages use the manufacturing identity. Export paperwork can use
                the export company title.
              </p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[var(--background)] p-5">
              <MapPin className="text-[var(--teal)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Operating address</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                {site.address}
              </p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[var(--background)] p-5">
              <Building2 className="text-[var(--teal)]" size={24} />
              <h2 className="mt-4 text-xl font-semibold text-[var(--ink)]">Export support</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                RFQ, packing, destination port, document requirements, and repeat shipment details
                are handled through the sales contact.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
