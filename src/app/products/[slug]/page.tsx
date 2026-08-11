import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, FileText, Send } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { FAQAccordion } from "@/components/faq-accordion";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { site } from "@/lib/site";
import { getProductEditorial } from "@/lib/product-editorial";
import { getPublishedProduct, getPublishedProducts } from "@/lib/product-content";

type Props = { params: Promise<{ slug: string }> };

const coreProductSlugs = new Set([
  "honed-tube", "st52-honed-tube", "ck45-honed-tube", "skived-and-roller-burnished-tube",
  "chrome-plated-rod", "ck45-chrome-plated-rod", "20mnv6-chrome-plated-rod",
  "induction-hardened-chrome-rod", "hollow-chrome-plated-rod", "piston-rod",
]);

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPublishedProducts()).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) return {};
  const editorial = getProductEditorial(product);
  return {
    title: editorial.title,
    description: editorial.description,
    alternates: { canonical: `/products/${product.slug}` },
    robots: coreProductSlugs.has(slug) ? undefined : { index: false, follow: true },
    openGraph: { title: editorial.title, description: editorial.description, url: `/products/${product.slug}`, images: [{ url: product.image, alt: product.name }] },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getPublishedProduct(slug), getPublishedProducts()]);
  if (!product) notFound();
  const editorial = getProductEditorial(product);
  const relatedProducts = editorial.related
    .map((relatedSlug) => products.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof products)[number] => Boolean(item));
  const url = `${site.domain}/products/${product.slug}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.domain },
      { "@type": "ListItem", position: 2, name: "Products", item: `${site.domain}/products` },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };
  const pageJsonLd = { "@context": "https://schema.org", "@type": "ItemPage", name: product.name, url, description: editorial.description, isPartOf: { "@type": "WebSite", name: site.brandName, url: site.domain } };
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: editorial.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <section className="bg-white py-14">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--amber)]">Hydraulic component</p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">{product.name}</h1>
                <p className="mt-5 text-lg leading-8 text-[var(--steel)]">{editorial.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {editorial.materials.map((item) => <span key={item} className="rounded-sm border border-[var(--line)] bg-[var(--muted)] px-3 py-2 text-sm font-medium text-[var(--ink)]">{item}</span>)}
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href={`/rfq?product=${encodeURIComponent(product.name)}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-5 font-semibold text-white"><Send size={18} /> Request a Quote</Link>
                  <Link href={`/rfq?product=${encodeURIComponent(product.name)}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-5 font-semibold text-[var(--ink)]"><FileText size={18} /> Send Drawing / Specification</Link>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--steel)]"><strong className="text-[var(--ink)]">Manufacturer / Export Support:</strong> Jiangsu Xijiu Intelligent Equipment Co., Ltd. is the manufacturing base. Nantong Huichenjin International Trade Co., Ltd. provides export support as Nantong HCJ.</p>
              </div>
              <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-[var(--line)] bg-[var(--muted)]">
                <Image src={product.image} alt={`${product.name} manufactured by XIJIU`} fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-[var(--background)]">
          <div className="container grid gap-8 lg:grid-cols-[0.34fr_1fr]">
            <aside className="h-fit border-l-2 border-[var(--teal)] pl-5 text-sm leading-6 text-[var(--steel)] lg:sticky lg:top-28">
              <p className="font-semibold text-[var(--ink)]">Technical review starts with the drawing.</p>
              <p className="mt-3">Share the component requirement, not assumptions about an entire cylinder. XIJIU reviews the part facts that are applicable to this product.</p>
            </aside>
            <div className="grid gap-10">
              <section>
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Quick specification</h2>
                <div className="mt-5 overflow-hidden border border-[var(--line)] bg-white">
                  <table className="w-full border-collapse text-left text-sm">
                    <tbody>{editorial.specifications.map(([label, value]) => <tr key={label} className="border-b border-[var(--line)] last:border-0"><th scope="row" className="w-[38%] bg-[var(--muted)] px-4 py-3 font-semibold text-[var(--ink)]">{label}</th><td className="px-4 py-3 leading-6 text-[var(--steel)]">{value}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>
              <section className="grid gap-6 lg:grid-cols-2">
                <div><h2 className="text-3xl font-semibold text-[var(--ink)]">What it is and why it matters</h2><p className="mt-4 leading-8 text-[var(--steel)]">{editorial.whyItMatters}</p></div>
                <div><h2 className="text-3xl font-semibold text-[var(--ink)]">Applications</h2><ul className="mt-4 grid gap-3 text-[var(--steel)]">{editorial.applications.map((application) => <li key={application} className="flex gap-2"><Check className="mt-1 shrink-0 text-[var(--teal)]" size={16} />{application}</li>)}</ul></div>
              </section>
              <section className="border-y border-[var(--line)] py-9"><h2 className="text-3xl font-semibold text-[var(--ink)]">Manufacturing and finishing</h2><p className="mt-4 max-w-4xl leading-8 text-[var(--steel)]">{editorial.manufacturing}</p></section>
              <section className="grid gap-6 lg:grid-cols-2"><div><h2 className="text-3xl font-semibold text-[var(--ink)]">Drawing-based customization</h2><p className="mt-4 leading-8 text-[var(--steel)]">{editorial.customization}</p></div><div><h2 className="text-3xl font-semibold text-[var(--ink)]">Quality and inspection</h2><p className="mt-4 leading-8 text-[var(--steel)]">{editorial.inspection}</p></div></section>
              <section><h2 className="text-3xl font-semibold text-[var(--ink)]">Frequently asked questions</h2><div className="mt-5"><FAQAccordion items={editorial.faqs} /></div></section>
              <section><h2 className="text-3xl font-semibold text-[var(--ink)]">Related News &amp; Technical Resources</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{relatedProducts.map((related) => <Link key={related.slug} href={`/products/${related.slug}`} className="border border-[var(--line)] bg-white p-4 font-semibold text-[var(--teal)] transition hover:border-[var(--teal)]">{related.name} specifications</Link>)}<Link href="/blog" className="border border-[var(--line)] bg-white p-4 font-semibold text-[var(--teal)] transition hover:border-[var(--teal)]">Hydraulic component technical resources</Link></div></section>
              <section className="bg-[#061a2f] p-7 text-white"><h2 className="text-3xl font-semibold">Prepare your inquiry</h2><p className="mt-3 max-w-3xl leading-7 text-white/75">Provide your drawing, material, diameter, length, tolerance, surface requirement, end machining, quantity or annual volume, and target application. The request is reviewed by the manufacturing team; Nantong HCJ supports the export process.</p><Link href={`/rfq?product=${encodeURIComponent(product.name)}`} className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">Open {product.name} inquiry form</Link></section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
