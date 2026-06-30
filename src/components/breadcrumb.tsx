import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-[var(--steel)]" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 && <span className="px-2">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--teal)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--ink)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
