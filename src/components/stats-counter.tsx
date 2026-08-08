import { ClipboardCheck, Factory, Gauge, Globe2 } from "lucide-react";

const icons = {
  factory: Factory,
  clipboard: ClipboardCheck,
  gauge: Gauge,
  globe: Globe2,
};

export function StatsCounter({
  items,
}: {
  items: { icon: keyof typeof icons; value: string; label: string }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map(({ icon, value, label }) => {
        const Icon = icons[icon];

        return (
          <article key={label} className="rounded-md border border-[var(--line)] bg-white p-5">
            <Icon className="text-[var(--amber)]" size={22} />
            <div className="mt-4 text-3xl font-semibold text-[var(--ink)]">
              {value}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{label}</p>
          </article>
        );
      })}
    </div>
  );
}
