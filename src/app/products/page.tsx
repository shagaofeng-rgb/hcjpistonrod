import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { ProductSidebar } from "@/components/product-sidebar";
import { productCategories, products, site } from "@/lib/site";

const mainProductCategories = new Set(["chrome-plated-rod", "honed-tube"]);
const mainProducts = products.filter((product) => mainProductCategories.has(product.category));

export const metadata: Metadata = {
  title: "Products",
  description:
    "Piston rods, hard chrome plated rods, honed tubes, and precision hydraulic components for industrial and mobile equipment.",
  keywords: [
    "piston rod manufacturer",
    "hard chrome plated rod supplier",
    "honed tube manufacturer",
    "chrome plated rod supplier",
    "hydraulic piston rod supplier",
  ],
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Products | XIJIU Intelligent Equipment",
    description:
      "Piston rods, hard chrome plated rods, honed tubes, hollow chrome plated rods, and drawing-based rod components.",
    url: "/products",
  },
};

export default function ProductsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.domain },
      { "@type": "ListItem", position: 2, name: "Products", item: `${site.domain}/products` },
    ],
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Products</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Piston rods and chrome plated rod supply for industrial and mobile equipment.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              XIJIU Intelligent Equipment supplies piston rods, hard chrome plated rods, honed tubes,
              hollow chrome plated rods, and drawing-based precision rod components
              for OEM machinery, distributors, and engineering companies.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[0.34fr_1fr]">
            <ProductSidebar />
            <div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {mainProducts.map((product) => (
                  <ProductCard key={product.slug} item={product} href={`/products/${product.slug}`} compact />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">SEO Guide</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-[var(--ink)]">
                Rod Products for OEM Machinery and Industrial Applications
              </h2>
            </div>
            <div className="grid gap-5 text-base leading-7 text-[var(--steel)]">
              <p>
                XIJIU provides piston rods, hard chrome plated rods, hollow chrome plated rods, and honed
                tubes for construction machinery, agricultural equipment, industrial automation, mining,
                and material handling applications.
              </p>
              <p>
                Product supply can be reviewed around drawings, material selection, heat treatment, machining,
                hardness requirements, chrome plating requirements, length, export packing, and technical communication. Category pages and product
                detail pages are connected so buyers can move from application requirements to exact
                specifications quickly.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {productCategories.filter((category) => mainProductCategories.has(category.slug)).map((category) => (
                  <a key={category.slug} href={`/products/${category.slug}`} className="rounded-md border border-[var(--line)] bg-[var(--background)] p-4 font-semibold text-[var(--ink)]">
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
