import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductSelector } from "@/components/product-selector";
import { productCategories, products } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Synchronized product catalog for honed tubes, chrome plated rods, hydraulic cylinders, and hydraulic power packs.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">
              Products
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Synced hydraulic product catalog for rods, tubes, cylinders, and power packs.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--steel)]">
              Product pages are synchronized from the EAST AI catalog, while factory identity,
              export company title, and contact information stay with the current Huichenjin site.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--ink)]">Product Category Pages</h2>
              <p className="mt-3 text-base leading-7 text-[var(--steel)]">
                Each big product category has its own page for SEO, buyer scanning, and RFQ routing.
              </p>
              <div className="mt-6 grid gap-4">
                {productCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products/categories/${category.slug}`}
                    className="group rounded-md border border-[var(--line)] bg-white p-5 transition hover:border-[var(--teal)]"
                  >
                    <h3 className="text-xl font-semibold text-[var(--ink)]">{category.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{category.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                      Open category <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <ProductSelector />
          </div>
        </section>

        <section className="section bg-white">
          <div className="container">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Detail pages</p>
                <h2 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Exact product specification pages.</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                className="group overflow-hidden rounded-md border border-[var(--line)] bg-[var(--background)] transition hover:border-[var(--teal)]"
              >
                  <div className="relative aspect-[16/10] bg-white">
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
                  <h3 className="text-2xl font-semibold text-[var(--ink)]">{product.name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--steel)]">{product.intro}</p>
                  <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[var(--steel)]">Diameter</dt>
                      <dd className="font-semibold text-[var(--ink)]">{product.diameter}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--steel)]">Tolerance</dt>
                      <dd className="font-semibold text-[var(--ink)]">{product.tolerance}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--steel)]">Chrome</dt>
                      <dd className="font-semibold text-[var(--ink)]">{product.chrome}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--steel)]">Roughness</dt>
                      <dd className="font-semibold text-[var(--ink)]">{product.roughness}</dd>
                    </div>
                  </dl>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
                    View specifications <ArrowRight size={18} className="transition group-hover:translate-x-1" />
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
