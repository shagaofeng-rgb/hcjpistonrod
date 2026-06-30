"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export function FAQAccordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [open, setOpen] = useState(0);

  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const active = open === index;

        return (
          <div key={item.question} className="rounded-md border border-[var(--line)] bg-white">
            <button
              type="button"
              onClick={() => setOpen(active ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[var(--ink)]"
            >
              {item.question}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--muted)] text-[var(--teal)]">
                {active ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>
            {active && <p className="px-5 pb-5 text-sm leading-6 text-[var(--steel)]">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
