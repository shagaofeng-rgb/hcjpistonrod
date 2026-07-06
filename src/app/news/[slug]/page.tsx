import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { FAQAccordion } from "@/components/faq-accordion";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { products, site } from "@/lib/site";
import { newsArticles } from "../../../../data/news";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = newsArticles.find((item) => item.slug === slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/news/${article.slug}`,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = newsArticles.find((item) => item.slug === slug);

  if (!article) notFound();

  const relatedArticles = newsArticles.filter((item) => item.slug !== article.slug).slice(0, 2);
  const relatedProducts = products.filter((product) => article.relatedProducts.includes(product.slug));
  const articleUrl = `${site.domain}/news/${article.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: { "@type": "Organization", name: site.brandName },
    publisher: { "@type": "Organization", name: site.brandName },
    url: articleUrl,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <section className="bg-white py-14">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: article.title }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">{article.category}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-sm font-semibold text-[var(--steel)]">By XIJIU Technical Team | {article.date}</p>
          </div>
        </section>

        <section className="section pt-0">
          <div className="container">
            <div className="relative aspect-[16/7] overflow-hidden rounded-md bg-[var(--muted)]">
              <Image
                src={article.image}
                alt={`${article.title} by XIJIU Intelligent Equipment`}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-[0.32fr_1fr]">
            <aside className="rounded-md border border-[var(--line)] bg-white p-5 lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Table of Contents</h2>
              <div className="mt-4 grid gap-2 text-sm text-[var(--steel)]">
                {article.sections.map((section) => (
                  <a key={section.heading} href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-[var(--teal)]">
                    {section.heading}
                  </a>
                ))}
                <a href="#faq" className="hover:text-[var(--teal)]">FAQ</a>
              </div>
            </aside>
            <article className="grid gap-8">
              {article.sections.map((section) => (
                <section key={section.heading} id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="rounded-md border border-[var(--line)] bg-white p-6">
                  <h2 className="text-3xl font-semibold text-[var(--ink)]">{section.heading}</h2>
                  <p className="mt-4 text-base leading-8 text-[var(--steel)]">{section.body}</p>
                </section>
              ))}

              <section id="faq" className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">FAQ</h2>
                <div className="mt-5"><FAQAccordion items={article.faqs} /></div>
              </section>

              <section className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Related Products</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {relatedProducts.map((product) => (
                    <Link key={product.slug} href={`/products/${product.slug}`} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--teal)]">
                      {product.name}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-[var(--line)] bg-[#071428] p-6 text-white">
                <h2 className="text-3xl font-semibold">Need technical support?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                  Send drawings, specifications, or purchasing questions. XIJIU will help review your piston rod, chrome plated rod, honed tube, or rod component requirements.
                </p>
                <Link href="/contact" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
                  Send Inquiry
                </Link>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Related Articles</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {relatedArticles.map((item) => <NewsCard key={item.slug} article={item} />)}
                </div>
              </section>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
