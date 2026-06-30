import type { LucideIcon } from "lucide-react";

export function AdvantageCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-md border border-[var(--line)] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--teal)] hover:shadow-[0_18px_40px_rgba(11,24,51,0.1)]">
      <span className="grid h-12 w-12 place-items-center rounded-md bg-[var(--muted)] text-[var(--teal)]">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 text-xl font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{body}</p>
    </article>
  );
}
