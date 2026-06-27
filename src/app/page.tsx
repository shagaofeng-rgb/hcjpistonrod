import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Factory, Gauge, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { industries, processRoutes, productCategories, site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="relative min-h-[680px] overflow-hidden bg-[#151816] text-white">
          <Image
            src="/hero-piston-rods.png"
            alt="Hard chrome plated piston rods and honed tubes in a machining workshop"
            fill
            priority
            className="object-cover opacity-58"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,20,17,0.92)_0%,rgba(17,20,17,0.74)_38%,rgba(17,20,17,0.26)_100%)]" />
          <div className="container relative flex min-h-[680px] items-center py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a46f]">
                Hydraulic cylinder rod supply
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] md:text-7xl">
                Hard chrome rods built around real purchasing specs.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
                Hard chrome plated rods, induction hardened rods, hollow piston rods, and honed
                tubes for hydraulic cylinder OEMs, repair programs, and machinery exporters.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/rfq" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 font-semibold text-white hover:bg-[var(--teal-dark)]">
                  Send RFQ <ArrowRight size={18} />
                </Link>
                <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-md border border-white/28 px-5 font-semibold text-white hover:bg-white/10">
                  View Products
                </Link>
              </div>
              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  ["6-300 mm", "Rod diameter range"],
                  ["f7 / f8", "Tolerance options"],
                  ["Ra <= 0.2", "Polished rod finish"],
                ].map(([value, label]) => (
                  <div key={label} className="border-l border-white/25 pl-4">
                    <div className="text-2xl font-semibold">{value}</div>
                    <div className="mt-1 text-sm text-white/62">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--line)] bg-white py-7">
          <div className="container grid gap-4 text-sm font-medium text-[var(--steel)] md:grid-cols-3">
            <span className="flex items-center gap-2"><Gauge size={18} /> Technical tables on each product page</span>
            <span className="flex items-center gap-2"><ShieldCheck size={18} /> Salt spray, roughness, hardness checks</span>
            <span className="flex items-center gap-2"><Factory size={18} /> Cut-to-length and drawing-based supply</span>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Product category pages</p>
                <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-[var(--ink)]">
                  Choose a big category first, then enter exact product pages.
                </h2>
              </div>
              <Link href="/products" className="inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                All products <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {productCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/categories/${category.slug}`}
                  className="group rounded-md border border-[var(--line)] bg-white p-5 transition hover:-translate-y-1 hover:border-[var(--teal)]"
                >
                  <div className="text-lg font-semibold text-[var(--ink)]">{category.name}</div>
                  <p className="mt-3 min-h-28 text-sm leading-6 text-[var(--steel)]">{category.description}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 text-sm text-[var(--teal)]">
                    <span>{category.specs[0]}</span>
                    <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Dedicated pages</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)]">
                Each important B2B section opens into its own page.
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--steel)]">
                The homepage is now a routing layer. Technical details, inspection points,
                applications, and company proof are separated for easier reading and better SEO.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {processRoutes.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-md border border-[var(--line)] bg-[var(--background)] p-5 transition hover:border-[var(--teal)]"
                >
                  <div className="text-xl font-semibold text-[var(--ink)]">{item.label}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                    Open page <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Company and RFQ</p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)]">
                Factory identity and export title are separated clearly.
              </h2>
              <div className="mt-6 grid gap-3 text-sm leading-6 text-[var(--steel)]">
                <div className="rounded-md border border-[var(--line)] bg-white p-4">
                  <span className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                    <Factory size={18} className="text-[var(--teal)]" /> Factory: {site.factoryName}
                  </span>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-white p-4">
                  <span className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                    <Building2 size={18} className="text-[var(--teal)]" /> Export title: {site.exportCompanyName}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/company" className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--line)] bg-white px-4 font-semibold text-[var(--ink)]">
                  Company Page
                </Link>
                <Link href="/rfq" className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--teal)] px-4 font-semibold text-white">
                  Send RFQ
                </Link>
              </div>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">Application entry</p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                Industry pages are separated from product pages.
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {industries.map((industry) => (
                  <div key={industry} className="rounded-md border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--steel)]">
                    {industry}
                  </div>
                ))}
              </div>
              <Link href="/industries" className="mt-6 inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                Open Industries <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
