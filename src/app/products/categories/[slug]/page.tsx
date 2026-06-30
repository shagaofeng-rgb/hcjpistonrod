import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { productCategories, products } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return productCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = productCategories.find((item) => item.slug === slug);

  if (!category) {
    return {};
  }

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/products/categories/${category.slug}` },
  };
}

export default async function ProductCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = productCategories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter((product) => category.products.includes(product.slug));

  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-14">
          <div className="container">
            <nav className="text-sm text-[var(--steel)]" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[var(--teal)]">Home</Link>
              <span> / </span>
              <Link href="/products" className="hover:text-[var(--teal)]">Products</Link>
              <span> / {category.name}</span>
            </nav>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
              Product category
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              {category.headline}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              {category.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/rfq" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-4 font-semibold text-white">
                Send RFQ <ArrowRight size={18} />
              </Link>
              <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--line)] px-4 font-semibold text-[var(--ink)]">
                All Products
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="rounded-md border border-[var(--line)] bg-white p-5">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Typical specifications</h2>
              <div className="mt-4 grid gap-3">
                {category.specs.map((spec) => (
                  <div key={spec} className="flex gap-3 text-sm font-medium text-[var(--ink)]">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--teal)]" size={17} />
                    {spec}
                  </div>
                ))}
              </div>
            </aside>
            <div className="grid gap-5 md:grid-cols-2">
              {categoryProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                className="group overflow-hidden rounded-md border border-[var(--line)] bg-white transition hover:border-[var(--teal)]"
              >
                  <div className="relative aspect-[16/10] bg-[var(--background)]">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="grid h-full place-items-center px-5 text-center text-sm font-semibold text-[var(--steel)]">
                        {product.name}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                  <h2 className="text-2xl font-semibold text-[var(--ink)]">{product.name}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--steel)]">{product.intro}</p>
                  <dl className="mt-5 grid gap-2 text-sm">
                    <div className="flex justify-between gap-3 border-t border-[var(--line)] pt-3">
                      <dt className="text-[var(--steel)]">Diameter</dt>
                      <dd className="font-semibold text-[var(--ink)]">{product.diameter}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[var(--steel)]">Tolerance</dt>
                      <dd className="font-semibold text-[var(--ink)]">{product.tolerance}</dd>
                    </div>
                  </dl>
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                    View product page <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
