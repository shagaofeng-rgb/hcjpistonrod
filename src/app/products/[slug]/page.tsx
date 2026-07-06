import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { FAQAccordion } from "@/components/faq-accordion";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductSidebar } from "@/components/product-sidebar";
import { productCategories, products, site } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const categorySlugs = new Set(productCategories.map((category) => category.slug));
  return products.filter((product) => !categorySlugs.has(product.slug)).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) return {};

  const isPrimaryProduct = product.category === "chrome-plated-rod" || product.category === "honed-tube";

  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, "XIJIU Intelligent Equipment", "hydraulic components supplier"],
    alternates: { canonical: `/products/${product.slug}` },
    robots: isPrimaryProduct ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${product.name} | XIJIU Intelligent Equipment`,
      description: product.shortDescription,
      url: `/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const specs = Object.entries(product.specs);
  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  const pageUrl = `${site.domain}/products/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: site.brandName },
    manufacturer: { "@type": "Organization", name: site.factoryName },
    url: pageUrl,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.domain },
      { "@type": "ListItem", position: 2, name: "Products", item: `${site.domain}/products` },
      { "@type": "ListItem", position: 3, name: product.name, item: pageUrl },
    ],
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <section className="bg-white py-14">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative aspect-[16/11] overflow-hidden rounded-md border border-[var(--line)] bg-[var(--muted)]">
                <Image
                  src={product.image}
                  alt={`${product.name} by XIJIU Intelligent Equipment`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Product Summary</p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">{product.name}</h1>
                <p className="mt-5 text-lg leading-8 text-[var(--steel)]">{product.definition}</p>
                <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="text-[var(--steel)]">Model</dt>
                    <dd className="mt-1 font-semibold text-[var(--ink)]">{product.model}</dd>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="text-[var(--steel)]">Brand</dt>
                    <dd className="mt-1 font-semibold text-[var(--ink)]">XIJIU</dd>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="text-[var(--steel)]">Availability</dt>
                    <dd className="mt-1 font-semibold text-[var(--ink)]">{product.availability}</dd>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="text-[var(--steel)]">Customization</dt>
                    <dd className="mt-1 font-semibold text-[var(--ink)]">{product.customization}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/contact" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
                    <Send size={18} /> Send Inquiry
                  </Link>
                  <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--line)] px-4 font-semibold text-[var(--ink)]">
                    Request Drawing Review
                  </Link>
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-4 font-semibold text-[var(--teal)]">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--steel)]">
                  <span className="inline-flex items-center gap-2"><Share2 size={16} /> Share:</span>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer" className="hover:text-[var(--teal)]">LinkedIn</a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer" className="hover:text-[var(--teal)]">Facebook</a>
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-[var(--teal)]">WhatsApp</a>
                  <a href={`mailto:?subject=${product.name}&body=${pageUrl}`} className="inline-flex items-center gap-1 hover:text-[var(--teal)]"><Mail size={15} /> Email</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[0.34fr_1fr]">
            <ProductSidebar active={product.category} />
            <div className="grid gap-8">
              <section className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Product Overview</h2>
                <p className="mt-4 text-base leading-7 text-[var(--steel)]">
                  {product.shortDescription} XIJIU reviews drawings, applications, quality requirements,
                  testing expectations, and export packing needs before quotation.
                </p>
              </section>

              <section className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Technical Specifications</h2>
                <div className="mt-5 overflow-hidden rounded-md border border-[var(--line)]">
                  <table className="w-full border-collapse text-left text-sm">
                    <tbody>
                      {specs.map(([label, value]) => (
                        <tr key={label} className="border-b border-[var(--line)] last:border-b-0">
                          <th className="w-2/5 bg-[var(--muted)] px-4 py-4 font-semibold text-[var(--ink)]">{label}</th>
                          <td className="px-4 py-4 text-[var(--steel)]">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <div className="rounded-md border border-[var(--line)] bg-white p-6">
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">Key Advantages</h2>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--steel)]">
                    {product.advantages.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-white p-6">
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">Applications</h2>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--steel)]">
                    {product.applications.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <div className="rounded-md border border-[var(--line)] bg-white p-6">
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">Manufacturing Process</h2>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--steel)]">
                    {product.process.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-white p-6">
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">Quality Control</h2>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--steel)]">
                    {product.quality.map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
              </section>

              <section className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">FAQ</h2>
                <div className="mt-5">
                  <FAQAccordion items={product.faqs} />
                </div>
              </section>

              <section className="rounded-md border border-[var(--line)] bg-[#071428] p-6 text-white">
                <h2 className="text-3xl font-semibold">Need technical support?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                  Send drawings, bore size, rod diameter, stroke length, working pressure, mounting style,
                  quantity, and application environment. XIJIU will help review technical details before quotation.
                </p>
                <Link href="/contact" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
                  Contact XIJIU
                </Link>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
