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
    title: `${article.title} | Technical Blog`,
    description: article.excerpt,
    keywords: [article.category, ...article.relatedProducts, "hydraulic component technical blog"],
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `/blog/${article.slug}`,
      images: [{ url: article.image, alt: article.imageAlt }],
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = newsArticles.find((item) => item.slug === slug);

  if (!article) notFound();

  const relatedProducts = products.filter((product) => article.relatedProducts.includes(product.slug));
  const relatedArticles = newsArticles.filter((item) => item.slug !== article.slug).slice(0, 2);
  const articleUrl = `${site.domain}/blog/${article.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
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
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <section className="bg-white py-14">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: article.title }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">{article.category}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">{article.title}</h1>
            <p className="mt-4 text-sm font-semibold text-[var(--steel)]">
              By {article.author} | Published {article.date} | Updated {article.updatedAt}
            </p>
          </div>
        </section>

        <section className="section pt-0">
          <div className="container">
            <div className="relative aspect-[16/7] overflow-hidden rounded-md bg-[var(--muted)]">
              <Image src={article.image} alt={article.imageAlt} fill priority className="object-cover" sizes="100vw" />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-[0.32fr_1fr]">
            <aside className="rounded-md border border-[var(--line)] bg-white p-5 lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Article Summary</h2>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--steel)]">
                {article.keyTakeaways.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </aside>

            <article className="grid gap-8">
              <section className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">AI Search Summary</h2>
                <p className="mt-4 text-base leading-8 text-[var(--steel)]">{article.geoSummary}</p>
              </section>

              {article.sections.map((section) => (
                <section key={section.heading} className="rounded-md border border-[var(--line)] bg-white p-6">
                  <h2 className="text-3xl font-semibold text-[var(--ink)]">{section.heading}</h2>
                  <p className="mt-4 text-base leading-8 text-[var(--steel)]">{section.body}</p>
                </section>
              ))}

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

              <section className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-3xl font-semibold text-[var(--ink)]">FAQ</h2>
                <div className="mt-5">
                  <FAQAccordion items={article.faqs} />
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-semibold text-[var(--ink)]">More Technical Articles</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {relatedArticles.map((item) => (
                    <NewsCard key={item.slug} article={item} hrefBase="/blog" />
                  ))}
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
