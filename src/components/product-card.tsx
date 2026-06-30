import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import type { Product } from "../../data/products";
import type { ProductCategory } from "../../data/categories";

type ProductCardItem =
  | Product
  | (ProductCategory & {
      shortDescription?: string;
    });

function getDescription(item: ProductCardItem) {
  if ("shortDescription" in item && item.shortDescription) {
    return item.shortDescription;
  }

  if ("description" in item) {
    return item.description;
  }

  return "";
}

export function ProductCard({
  item,
  href,
  compact = false,
}: {
  item: ProductCardItem;
  href: string;
  compact?: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-md border border-[var(--line)] bg-white transition hover:-translate-y-1 hover:border-[var(--teal)] hover:shadow-[0_18px_45px_rgba(11,24,51,0.12)]">
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--muted)]">
          <Image
            src={item.image}
            alt={`${item.name} by XIJIU Intelligent Equipment`}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </Link>
      <div className={compact ? "p-5" : "p-6"}>
        <h3 className="text-xl font-semibold leading-tight text-[var(--ink)]">{item.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--steel)]">{getDescription(item)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={href}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--teal-dark)]"
          >
            More <ArrowRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            <Send size={16} /> Inquire
          </Link>
        </div>
      </div>
    </article>
  );
}
