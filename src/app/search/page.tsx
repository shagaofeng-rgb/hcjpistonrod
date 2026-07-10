import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { productCategories, products } from "@/lib/site";
import { getPublishedNewsArticles } from "@/lib/news-content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search XIJIU products, technical articles, and hydraulic component resources.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

function matchScore(value: string, query: string) {
  const normalized = value.toLowerCase();
  return normalized.includes(query) ? query.length / Math.max(normalized.length, 1) : 0;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const newsArticles = await getPublishedNewsArticles();
  const query = (q || "").trim().toLowerCase();
  const productsResults = query
    ? products
        .map((product) => ({
          type: "Product",
          title: product.name,
          description: product.shortDescription,
          href: `/products/${product.slug}`,
          score: matchScore([product.name, product.model, product.shortDescription, product.category].join(" "), query),
        }))
        .filter((item) => item.score > 0)
    : [];
  const categoryResults = query
    ? productCategories
        .map((category) => ({
          type: "Category",
          title: category.name,
          description: category.description,
          href: `/products/${category.slug}`,
          score: matchScore([category.name, category.description].join(" "), query),
        }))
        .filter((item) => item.score > 0)
    : [];
  const newsResults = query
    ? newsArticles
        .map((article) => ({
          type: "News",
          title: article.title,
          description: article.excerpt,
          href: `/news/${article.slug}`,
          score: matchScore([article.title, article.excerpt, article.category, article.geoSummary].join(" "), query),
        }))
        .filter((item) => item.score > 0)
    : [];
  const results = [...productsResults, ...categoryResults, ...newsResults].sort((a, b) => b.score - a.score);

  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-14">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Search</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">Search XIJIU</h1>
            <form action="/search" className="mt-7 flex max-w-2xl gap-2">
              <input
                name="q"
                defaultValue={q || ""}
                placeholder="Search chrome plated rod, honed tube, piston rod..."
                className="h-12 min-w-0 flex-1 rounded-md border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--teal)]"
              />
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-5 font-semibold text-white">
                <Search size={18} />
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="section pt-0">
          <div className="container">
            {query ? (
              <div className="grid gap-4">
                <p className="text-sm font-semibold text-[var(--steel)]">{results.length} result(s) for &quot;{q}&quot;</p>
                {results.map((item) => (
                  <Link
                    key={`${item.type}-${item.href}`}
                    href={item.href}
                    className="rounded-md border border-[var(--line)] bg-white p-5 transition hover:border-[var(--teal)]"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--amber)]">{item.type}</span>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{item.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-[var(--line)] bg-white p-6 text-[var(--steel)]">
                Enter a product, material, process, or application keyword to search the website.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
