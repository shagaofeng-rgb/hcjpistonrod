import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { FAQAccordion } from "@/components/faq-accordion";
import { ProductCard } from "@/components/product-card";
import { ProductSidebar } from "@/components/product-sidebar";
import { productCategories, products, site } from "@/lib/site";

export function ProductCategoryTemplate({ slug }: { slug: string }) {
  const category = productCategories.find((item) => item.slug === slug);

  if (!category) notFound();

  const categoryProducts = products.filter((product) => category.products.includes(product.slug) || product.category === category.slug);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(category.parent
      ? [{ label: productCategories.find((item) => item.slug === category.parent)?.name ?? "Hydraulic Cylinder", href: `/products/${category.parent}` }]
      : []),
    { label: category.name },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${site.domain}${item.href}` : `${site.domain}/products/${category.slug}`,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: category.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="bg-white py-14">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Product category</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
                {category.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">{category.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
                  Send Inquiry
                </Link>
                <Link href="/products" className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--line)] px-4 font-semibold text-[var(--ink)]">
                  All Products
                </Link>
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-[var(--line)] bg-[var(--muted)]">
              <Image
                src={category.image}
                alt={`${category.name} manufacturing and supply visual`}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[0.34fr_1fr]">
          <ProductSidebar active={category.slug} />
          <div className="grid gap-8">
            <div className="grid gap-5 md:grid-cols-2">
              {categoryProducts.map((product) => (
                <ProductCard key={product.slug} item={product} href={`/products/${product.slug}`} />
              ))}
            </div>

            <section className="rounded-md border border-[var(--line)] bg-white p-6">
              <h2 className="text-3xl font-semibold text-[var(--ink)]">How to Choose / What to Consider</h2>
              <div className="mt-5 grid gap-5">
                {category.sections.map((section) => (
                  <article key={section.heading} className="rounded-md border border-[var(--line)] bg-[var(--background)] p-5">
                    <h3 className="text-xl font-semibold text-[var(--ink)]">{section.heading}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{section.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-[var(--line)] bg-white p-6">
              <h2 className="text-3xl font-semibold text-[var(--ink)]">FAQ</h2>
              <div className="mt-5">
                <FAQAccordion items={category.faqs} />
              </div>
            </section>

            <section className="rounded-md border border-[var(--line)] bg-[#071428] p-6 text-white">
              <h2 className="text-3xl font-semibold">Need technical support?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                Send your drawing, specification, or application requirements. XIJIU will help review
                technical details and provide practical quotation support.
              </p>
              <Link href="/contact" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[var(--amber)] px-4 font-semibold text-white">
                Contact XIJIU
              </Link>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
