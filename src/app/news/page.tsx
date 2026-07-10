import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NewsCard } from "@/components/news-card";
import { getPublishedNewsArticles } from "@/lib/news-content";

export const metadata: Metadata = {
  title: "News and Insights",
  description:
    "Practical piston rod, hard chrome plated rod, honed tube, and export packing knowledge for industrial buyers.",
  alternates: { canonical: "/news" },
};

const filters = ["All", "Piston Rod", "Chrome Plated Rod", "Honed Tube", "Manufacturing", "Quality Control", "Purchasing Guide"];

export const revalidate = 300;

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const newsArticles = await getPublishedNewsArticles();
  const { category } = await searchParams;
  const activeCategory = category || "All";
  const visibleArticles = activeCategory === "All" ? newsArticles : newsArticles.filter((article) => article.category === activeCategory);
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "News" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">News and Insights</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              News and Insights
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              Practical piston rod, hard chrome plated rod, honed tube, and export packing knowledge for engineers, buyers, and equipment manufacturers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/news/rss.xml" className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--teal)]">
                RSS Feed
              </Link>
              <Link href="/blog" className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">
                Technical Blog
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Link key={filter} href={filter === "All" ? "/news" : `/news?category=${encodeURIComponent(filter)}`} className={`rounded-md border px-4 py-2 text-sm font-semibold ${activeCategory === filter ? "border-[var(--teal)] bg-[var(--teal)] text-white" : "border-[var(--line)] bg-white text-[var(--steel)]"}`}>
                  {filter}
                </Link>
              ))}
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {visibleArticles.map((article) => (
                <NewsCard key={article.slug} article={article} />
              ))}
            </div>
            <div className="mt-8 flex gap-2 text-sm font-semibold text-[var(--steel)]">
              <span>{visibleArticles.length} published article(s)</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
