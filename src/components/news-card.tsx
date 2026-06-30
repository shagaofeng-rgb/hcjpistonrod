import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsArticle } from "../../data/news";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="overflow-hidden rounded-md border border-[var(--line)] bg-white transition hover:-translate-y-1 hover:border-[var(--teal)] hover:shadow-[0_18px_40px_rgba(11,24,51,0.1)]">
      <Link href={`/news/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] bg-[var(--muted)]">
          <Image
            src={article.image}
            alt={`${article.title} - XIJIU hydraulic manufacturing insight`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
      </Link>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--steel)]">
          <span>{article.date}</span>
          <span className="text-[var(--amber)]">{article.category}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-tight text-[var(--ink)]">{article.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--steel)]">{article.excerpt}</p>
        <Link href={`/news/${article.slug}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--teal)]">
          Read More <ArrowRight size={17} />
        </Link>
      </div>
    </article>
  );
}
