import Link from "next/link";
import { megaMenuGroups } from "@/lib/site";

export function ProductSidebar({ active }: { active?: string }) {
  return (
    <aside className="rounded-md border border-[var(--line)] bg-white p-5">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Product Categories</h2>
      <div className="mt-4 grid gap-5">
        {megaMenuGroups.map((group) => (
          <div key={group.label}>
            <Link
              href={group.href}
              className={`font-semibold ${active === group.href.split("/").pop() ? "text-[var(--amber)]" : "text-[var(--ink)] hover:text-[var(--teal)]"}`}
            >
              {group.label}
            </Link>
            <div className="mt-2 grid gap-2 border-l border-[var(--line)] pl-3 text-sm text-[var(--steel)]">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${active === link.href.split("/").pop() ? "font-semibold text-[var(--amber)]" : "hover:text-[var(--teal)]"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
