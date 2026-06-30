"use client";

import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { products } from "@/lib/site";
import { useMemo, useState } from "react";

const diameterOptions = [
  { label: "All diameters", value: "all" },
  { label: "Small rods", value: "small" },
  { label: "Heavy-duty rods", value: "heavy" },
  { label: "Tube / custom", value: "tube" },
];

const applicationOptions = [
  { label: "All applications", value: "all" },
  { label: "Construction", value: "construction" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Cylinder barrels", value: "barrel" },
  { label: "Custom drawings", value: "custom" },
];

function matchesDiameter(product: (typeof products)[number], value: string) {
  if (value === "all") return true;
  const text = `${product.slug} ${product.name} ${product.intro}`.toLowerCase();
  if (value === "small") return text.includes("chrome") && !text.includes("hollow");
  if (value === "heavy") return text.includes("hardened") || text.includes("cylinder") || text.includes("42crmo");
  if (value === "tube") return text.includes("tube") || text.includes("honed") || text.includes("bored") || text.includes("hollow");
  return true;
}

function matchesApplication(product: (typeof products)[number], value: string) {
  if (value === "all") return true;
  const text = `${product.name} ${product.intro} ${product.applications.join(" ")}`.toLowerCase();
  if (value === "construction") return text.includes("construction") || text.includes("heavy-duty");
  if (value === "agriculture") return text.includes("agricultural");
  if (value === "barrel") return text.includes("barrel");
  if (value === "custom") return text.includes("custom") || text.includes("drawing") || text.includes("hollow");
  return true;
}

export function ProductSelector() {
  const [diameter, setDiameter] = useState("all");
  const [application, setApplication] = useState("all");

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) => matchesDiameter(product, diameter) && matchesApplication(product, application),
      ),
    [application, diameter],
  );

  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
            <SlidersHorizontal size={16} /> Product selector
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Find a starting product page.</h2>
        </div>
        <Link href="/rfq" className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--teal)] px-4 text-sm font-semibold text-white">
          Send Drawing RFQ
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
          Diameter / format
          <select
            value={diameter}
            onChange={(event) => setDiameter(event.target.value)}
            className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-[var(--steel)] outline-none focus:border-[var(--teal)]"
          >
            {diameterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
          Application
          <select
            value={application}
            onChange={(event) => setApplication(event.target.value)}
            className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-[var(--steel)] outline-none focus:border-[var(--teal)]"
          >
            {applicationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3">
        {filteredProducts.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group flex items-center justify-between gap-4 rounded-md border border-[var(--line)] bg-[var(--background)] px-4 py-3 transition hover:border-[var(--teal)]"
          >
            <span>
              <span className="block font-semibold text-[var(--ink)]">{product.name}</span>
              <span className="mt-1 block text-xs text-[var(--steel)]">
                {product.diameter} | {product.tolerance}
              </span>
            </span>
            <ArrowRight className="shrink-0 text-[var(--teal)] transition group-hover:translate-x-1" size={18} />
          </Link>
        ))}
        {filteredProducts.length === 0 && (
          <div className="rounded-md border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--steel)]">
            No exact preset. Send drawings and the sales team will quote by specification.
          </div>
        )}
      </div>
    </section>
  );
}
