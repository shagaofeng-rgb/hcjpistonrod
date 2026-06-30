"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Factory, Mail, Menu, Send, X } from "lucide-react";
import { useState } from "react";
import { navItems, processRoutes, productCategories, products, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"products" | "capabilities" | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"products" | "capabilities" | null>("products");

  const closeAll = () => {
    setOpen(false);
    setActivePanel(null);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(247,248,246,0.94)] backdrop-blur"
      onMouseLeave={() => setActivePanel(null)}
    >
      <div className="hidden border-b border-[var(--line)] bg-[#151816] py-2 text-xs text-white/72 lg:block">
        <div className="container flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <Factory size={14} /> Factory: {site.factoryName}
          </span>
          <span>Export title: {site.exportCompanyName}</span>
        </div>
      </div>
      <div className="container flex min-h-18 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`} onClick={closeAll}>
          <span className="relative h-12 w-16 overflow-hidden rounded-md border border-[var(--line)] bg-white">
            <Image
              src="/xijiu-logo.jpg"
              alt="Xijiu Intelligent Equipment logo"
              fill
              priority
              className="object-contain p-1"
              sizes="64px"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-[0.04em] text-[var(--ink)]">
              {site.name}
            </span>
            <span className="block text-xs uppercase tracking-[0.18em] text-[var(--steel)]">
              XIJIU Intelligent Equipment
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium text-[var(--steel)] lg:flex">
          <button
            type="button"
            onMouseEnter={() => setActivePanel("products")}
            onFocus={() => setActivePanel("products")}
            className="inline-flex h-10 items-center gap-1 rounded-md px-3 transition hover:bg-white hover:text-[var(--teal)]"
          >
            Products <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onMouseEnter={() => setActivePanel("capabilities")}
            onFocus={() => setActivePanel("capabilities")}
            className="inline-flex h-10 items-center gap-1 rounded-md px-3 transition hover:bg-white hover:text-[var(--teal)]"
          >
            Capabilities <ChevronDown size={15} />
          </button>
          {navItems
            .filter((item) => !["Products", "Process", "Quality", "Industries"].includes(item.label))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 items-center rounded-md px-3 transition hover:bg-white hover:text-[var(--teal)]"
                onFocus={() => setActivePanel(null)}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${site.email}`}
            className="hidden h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--steel)] transition hover:border-[var(--teal)] hover:text-[var(--teal)] sm:flex"
            aria-label="Email sales"
            title="Email sales"
          >
            <Mail size={18} />
          </a>
          <Link
            href="/rfq"
            onClick={closeAll}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--teal-dark)]"
          >
            <Send size={17} />
            Send RFQ
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--steel)] lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            title="Navigation"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {activePanel && (
        <div className="absolute left-0 right-0 top-full hidden border-b border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(17,20,17,0.14)] lg:block">
          <div className="container grid max-h-[calc(100vh-9rem)] gap-8 overflow-y-auto py-7 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="rounded-md bg-[var(--muted)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                {activePanel === "products" ? "Product navigation" : "Engineering pages"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[var(--ink)]">
                {activePanel === "products"
                  ? "Choose by purchasing category or exact product."
                  : "Separate pages for process, quality, industries, and company proof."}
              </h2>
              <Link
                href={activePanel === "products" ? "/products" : "/process"}
                onClick={closeAll}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[var(--ink)] px-4 text-sm font-semibold text-white"
              >
                Open section
              </Link>
            </div>
            {activePanel === "products" ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--steel)]">
                    Product Categories
                  </div>
                  <div className="mt-3 grid gap-2">
                    {productCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/products/categories/${category.slug}`}
                        onClick={closeAll}
                        className="rounded-md border border-[var(--line)] px-4 py-3 transition hover:border-[var(--teal)] hover:bg-[var(--background)]"
                      >
                        <span className="block font-semibold text-[var(--ink)]">{category.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--steel)]">{category.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--steel)]">
                    Product Detail Pages
                  </div>
                  <div className="mt-3 grid max-h-[28rem] gap-2 overflow-y-auto pr-2">
                    {products.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        onClick={closeAll}
                        className="rounded-md px-4 py-3 transition hover:bg-[var(--background)]"
                      >
                        <span className="block font-semibold text-[var(--ink)]">{product.name}</span>
                        <span className="text-xs text-[var(--steel)]">{product.diameter}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {processRoutes.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeAll}
                    className="rounded-md border border-[var(--line)] bg-white p-5 transition hover:border-[var(--teal)] hover:bg-[var(--background)]"
                  >
                    <span className="block text-lg font-semibold text-[var(--ink)]">{item.label}</span>
                    <span className="mt-2 block text-sm leading-6 text-[var(--steel)]">{item.description}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {open && (
        <div className="container grid gap-3 pb-4 text-sm font-semibold text-[var(--steel)] lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMobilePanel("products")}
              className={`h-10 rounded-md border px-3 text-left ${
                mobilePanel === "products" ? "border-[var(--teal)] bg-white text-[var(--teal)]" : "border-[var(--line)] bg-white"
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel("capabilities")}
              className={`h-10 rounded-md border px-3 text-left ${
                mobilePanel === "capabilities" ? "border-[var(--teal)] bg-white text-[var(--teal)]" : "border-[var(--line)] bg-white"
              }`}
            >
              Capabilities
            </button>
          </div>
          {mobilePanel === "products" ? (
            <div className="grid gap-2">
              <Link href="/products" onClick={closeAll} className="rounded-md border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)]">
                All Products
              </Link>
              {productCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products/categories/${category.slug}`}
                  onClick={closeAll}
                  className="rounded-md border border-[var(--line)] bg-white px-4 py-3"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-2">
              {processRoutes.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAll}
                  className="rounded-md border border-[var(--line)] bg-white px-4 py-3"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <div className="grid gap-2 border-t border-[var(--line)] pt-3">
            <Link href="/company" onClick={closeAll} className="rounded-md border border-[var(--line)] bg-white px-4 py-3">
              Company
            </Link>
            <Link href="/contact" onClick={closeAll} className="rounded-md border border-[var(--line)] bg-white px-4 py-3">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
