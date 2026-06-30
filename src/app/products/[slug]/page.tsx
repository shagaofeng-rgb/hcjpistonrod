import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { products, site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: product.intro,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const specs = [
    ["Material", product.material],
    ["Diameter", product.diameter],
    ["Length", product.length],
    ["Tolerance", product.tolerance],
    ["Chrome Thickness", product.chrome],
    ["Surface Roughness", product.roughness],
    ["Straightness", product.straightness],
    ["Hardness", product.hardness],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.intro,
    brand: {
      "@type": "Brand",
      name: site.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: site.factoryName,
    },
    seller: {
      "@type": "Organization",
      name: site.exportCompanyName,
    },
  };

  return (
    <>
      <Header />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="bg-white py-14">
          <div className="container">
            <nav className="text-sm text-[var(--steel)]" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[var(--teal)]">Home</Link>
              <span> / </span>
              <Link href="/products" className="hover:text-[var(--teal)]">Products</Link>
              <span> / {product.name}</span>
            </nav>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.45fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
                  Synced product page
                </p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
                  {product.h1}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--steel)]">
                  {product.intro}
                </p>
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex text-sm font-semibold text-[var(--teal)] hover:text-[var(--teal-dark)]"
                >
                  Source catalog page: EAST AI
                </a>
              </div>
              <aside className="rounded-md border border-[var(--line)] bg-[var(--background)] p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--steel)]">
                  Fast RFQ fields
                </div>
                <ul className="mt-4 grid gap-3 text-sm text-[var(--ink)]">
                  <li>Diameter and length</li>
                  <li>Material grade</li>
                  <li>Chrome thickness</li>
                  <li>Quantity and destination</li>
                </ul>
                <Link href="/rfq" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-4 font-semibold text-white hover:bg-[var(--teal-dark)]">
                  Send RFQ <ArrowRight size={18} />
                </Link>
              </aside>
            </div>
          </div>
        </section>

        {product.image && (
          <section className="section pt-0">
            <div className="container">
              <div className="relative aspect-[16/7] overflow-hidden rounded-md border border-[var(--line)] bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-6"
                  sizes="100vw"
                />
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">Technical Specifications</h2>
              <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                Values below are standard supply references. Final production follows confirmed
                drawing, standard, or purchase specification.
              </p>
            </div>
            <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {specs.map(([label, value]) => (
                    <tr key={label} className="border-b border-[var(--line)] last:border-b-0">
                      <th className="w-2/5 bg-[var(--muted)] px-4 py-4 font-semibold text-[var(--ink)]">
                        {label}
                      </th>
                      <td className="px-4 py-4 text-[var(--steel)]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {product.content.length > 0 && (
          <section className="section bg-white">
            <div className="container grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
                  EAST AI synced content
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Original product details</h2>
                <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                  The product detail content below is synchronized from the linked EAST AI product page.
                  Company identity and RFQ contact remain Huichenjin / Xijiu.
                </p>
              </div>
              <div className="grid gap-4">
                {product.content.map((block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h3 key={`${block.text}-${index}`} className="mt-4 text-2xl font-semibold leading-tight text-[var(--ink)] first:mt-0">
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.type === "list") {
                    return (
                      <div key={`${block.text}-${index}`} className="flex gap-3 rounded-md border border-[var(--line)] bg-[var(--background)] p-4 text-sm leading-6 text-[var(--ink)]">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} />
                        <span>{block.text}</span>
                      </div>
                    );
                  }

                  return (
                    <p key={`${block.text}-${index}`} className="text-base leading-8 text-[var(--steel)]">
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {product.faqs.length > 0 && (
          <section className="section">
            <div className="container">
              <h2 className="text-3xl font-semibold text-[var(--ink)]">Product FAQ</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {product.faqs.map((item) => (
                  <div key={item.question} className="rounded-md border border-[var(--line)] bg-white p-5">
                    <h3 className="font-semibold text-[var(--ink)]">{item.question}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section bg-white">
          <div className="container grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">Applications</h2>
              <div className="mt-5 grid gap-3">
                {product.applications.map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-[var(--line)] bg-[var(--background)] p-4 text-sm font-medium text-[var(--ink)]">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--teal)]" size={18} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">RFQ Checklist</h2>
              <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                Send drawings, material grade, diameter, length, tolerance, chrome thickness,
                roughness, packaging requirements, annual volume, and target delivery schedule.
              </p>
              <Link href="/rfq" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 font-semibold text-white hover:bg-[var(--teal-dark)]">
                Request Quote <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
