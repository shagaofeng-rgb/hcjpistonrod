"use client";

import Link from "next/link";
import { CircleDotDashed, Cylinder, Send, Settings2 } from "lucide-react";
import { useState } from "react";

const requirements = [
  { id: "rod", label: "Rod", detail: "Piston rods\nChrome plated rods", icon: Cylinder },
  { id: "tube", label: "Tube", detail: "Honed tubes\nSeamless & welded", icon: CircleDotDashed },
  { id: "machined-part", label: "Machined Part", detail: "Custom components\nTurned & milled", icon: Settings2 },
];

export function HomeDrawingSelector() {
  const [selected, setSelected] = useState(requirements[0].id);

  return (
    <section className="border border-[#cbd6df] bg-white p-3 shadow-[0_10px_24px_rgba(6,26,47,0.05)] sm:p-4">
      <div className="flex flex-col gap-2 border-b border-[#d9e3e9] pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#061a2f]">Start With Your Drawing</h2>
          <p className="mt-0.5 text-xs text-[#526a7c]">Tell us what you need. We&apos;ll take it from there.</p>
        </div>
        <span className="text-xs font-medium text-[#0068ae]">Technical review</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {requirements.map((item) => {
          const Icon = item.icon;
          const active = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`min-h-28 border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19a9e5] ${
                active
                  ? "border-[#0068ae] bg-[#f5fbff] shadow-[inset_0_0_0_1px_rgba(0,104,174,0.12)]"
                  : "border-[#d9e3e9] bg-white hover:border-[#79bde0] hover:bg-[#f8fbfd]"
              }`}
              aria-pressed={active}
            >
              <Icon size={22} strokeWidth={1.6} className="text-[#0068ae]" />
              <span className="mt-3 block text-sm font-semibold text-[#061a2f]">{item.label}</span>
              <span className="mt-1 block whitespace-pre-line text-[11px] leading-4 text-[#526a7c]">{item.detail}</span>
            </button>
          );
        })}
      </div>
      <Link
        href={`/contact?interest=${selected}`}
        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#0068ae] transition hover:text-[#004f85]"
      >
        <Send size={14} /> No form. No hassle. Just upload and go.
      </Link>
    </section>
  );
}
