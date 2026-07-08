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
    keywords: [article.category, ...article.relatedProducts, "hydraulic piston rod news", "chrome plated rod supplier"],
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/news/${article.slug}`,
      images: [{ url: article.image, alt: article.imageAlt }],
      type: "article",
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
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: `${site.domain}${article.image}`,
    datePublished: article.source.publishedAt,
    dateModified: `${article.updatedAt}T08:00:00+08:00`,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: site.brandName,
      logo: { "@type": "ImageObject", url: `${site.domain}/xijiu-logo.png` },
    },
    mainEntityOfPage: articleUrl,
    articleSection: article.category,
    keywords: [article.category, ...article.relatedProducts].join(", "),
    about: relatedProducts.map((product) => ({ "@type": "Product", name: product.name, url: `${site.domain}/products/${product.slug}` })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.domain },
      { "@type": "ListItem", position: 2, name: "News", item: `${site.domain}/news` },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: article.title,
    url: articleUrl,
    description: article.geoSummary,
    isPartOf: { "@type": "WebSite", name: site.brandName, url: site.domain },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <section className="bg-white py-14">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: article.title }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">{article.category}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-sm font-semibold text-[var(--steel)]">
              By {article.author} | Published {article.date} | Updated {article.updatedAt}
            </p>
          </div>
        </section>

        <section className="section pt-0">
          <div className="container">
            <div className="relative aspect-[16/7] overflow-hidden rounded-md bg-[var(--muted)]">
              <Image
                src={article.image}
                alt={article.imageAlt}
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
                <a href="#summary" className="hover:text-[var(--teal)]">AI search summary</a>
                <a href="#key-takeaways" className="hover:text-[var(--teal)]">Key takeaways</a>
                {article.sections.map((section) => (
                  <a key={section.heading} href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-[var(--teal)]">
                    {section.heading}
                  </a>
                ))}
                <a href="#source" className="hover:text-[var(--teal)]">Source information</a>
                <a href="#faq" className="hover:text-[var(--teal)]">FAQ</a>
              </div>
            </aside>
            <article className="grid gap-8">
              <section id="summary" className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">AI Search Summary</h2>
                <p className="mt-4 text-base leading-8 text-[var(--steel)]">{article.geoSummary}</p>
              </section>

              <section id="key-takeaways" className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Key Takeaways</h2>
                <ul className="mt-4 grid gap-3 text-base leading-7 text-[var(--steel)]">
                  {article.keyTakeaways.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>

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

              <section id="source" className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">Source Information</h2>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="font-semibold text-[var(--ink)]">Source title</dt>
                    <dd className="mt-1 text-[var(--steel)]">{article.source.title}</dd>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="font-semibold text-[var(--ink)]">Publisher</dt>
                    <dd className="mt-1 text-[var(--steel)]">{article.source.publisher}</dd>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="font-semibold text-[var(--ink)]">Author</dt>
                    <dd className="mt-1 text-[var(--steel)]">{article.source.author}</dd>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] p-4">
                    <dt className="font-semibold text-[var(--ink)]">Published / fetched</dt>
                    <dd className="mt-1 text-[var(--steel)]">{article.source.publishedAt} / {article.source.fetchedAt}</dd>
                  </div>
                </dl>
                <a href={article.source.url} className="mt-5 inline-flex font-semibold text-[var(--teal)]" target="_blank" rel="noreferrer">
                  View source
                </a>
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
