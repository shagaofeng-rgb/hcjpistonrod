"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-4">
      {items.map(({ icon, value, label }) => {
        const Icon = icons[icon];

        return (
          <article key={label} className="rounded-md border border-[var(--line)] bg-white p-5">
            <Icon className="text-[var(--amber)]" size={22} />
            <div className="mt-4 text-3xl font-semibold text-[var(--ink)]">
              {visible ? value : value.replace(/[0-9]/g, "0")}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{label}</p>
          </article>
        );
      })}
    </div>
  );
}
