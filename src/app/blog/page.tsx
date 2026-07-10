import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { getPublishedNewsArticles } from "@/lib/news-content";

export const metadata: Metadata = {
  title: "Technical Blog",
  description:
    "Hydraulic component sourcing guides and manufacturing knowledge for piston rods, chrome plated rods, and honed tubes.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 300;

export default async function BlogPage() {
  const newsArticles = await getPublishedNewsArticles();
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Technical Blog</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Hydraulic Component Technical Blog
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              Buying guides, engineering notes, and manufacturing knowledge for global hydraulic component buyers.
            </p>
          </div>
        </section>

        <section className="section pt-0">
          <div className="container grid gap-5 lg:grid-cols-3">
            {newsArticles.map((article) => (
              <NewsCard key={article.slug} article={article} hrefBase="/blog" />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
