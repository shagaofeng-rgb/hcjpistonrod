"use client";

import Link from "next/link";
import Image from "next/image";
import { Send } from "lucide-react";
import { useState } from "react";

const requirements = [
  { id: "rod", label: "Rod", detail: "Piston rods\nChrome plated rods", icon: "/images/home-redesign/icons/drawing-rod.png" },
  { id: "tube", label: "Tube", detail: "Honed tubes\nSeamless & welded", icon: "/images/home-redesign/icons/drawing-tube.png" },
  { id: "machined-part", label: "Machined Part", detail: "Custom components\nTurned & milled", icon: "/images/home-redesign/icons/drawing-part.png" },
];

export function HomeDrawingSelector() {
  const [selected, setSelected] = useState(requirements[0].id);

  return (
    <section className="border border-[#cbd6df] bg-white p-2 shadow-[0_10px_24px_rgba(6,26,47,0.05)] sm:p-3">
      <div className="flex items-end justify-between gap-2 border-b border-[#d9e3e9] pb-2">
        <div>
          <h2 className="whitespace-nowrap text-[13px] font-semibold leading-4 text-[#061a2f]">Start With Your Drawing</h2>
          <p className="mt-0.5 text-[10px] leading-3 text-[#526a7c]">Tell us what you need. We&apos;ll take it from there.</p>
        </div>
        <span className="text-[10px] font-medium text-[#0068ae]">Technical review</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {requirements.map((item) => {
          const active = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`min-h-[88px] border p-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19a9e5] ${
                active
                  ? "border-[#0068ae] bg-[#f5fbff] shadow-[inset_0_0_0_1px_rgba(0,104,174,0.12)]"
                  : "border-[#d9e3e9] bg-white hover:border-[#79bde0] hover:bg-[#f8fbfd]"
              }`}
              aria-pressed={active}
            >
              <Image src={item.icon} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
              <span className="mt-1 block text-xs font-semibold leading-4 text-[#061a2f]">{item.label}</span>
              <span className="mt-0.5 block whitespace-pre-line text-[9px] leading-3 text-[#526a7c]">{item.detail}</span>
            </button>
          );
        })}
      </div>
      <Link
        href={`/contact?interest=${selected}`}
        className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0068ae] transition hover:text-[#004f85]"
      >
        <Send size={12} /> No form. No hassle. Just upload and go.
      </Link>
    </section>
  );
}
