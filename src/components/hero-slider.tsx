import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-[#0d385c] bg-[#061a2f] text-white">
      <div className="grid min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center px-5 py-16 sm:px-10 lg:px-[max(52px,calc((100vw-1280px)/2))] lg:pr-16">
          <div className="max-w-xl">
            <div className="mb-8 h-px w-16 bg-[var(--cyan)]" />
            <h1 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#81d2f3]">
              Piston Rod, Chrome Plated Rod &amp; Honed Tube Manufacturer
            </h1>
            <p className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl xl:text-6xl">Factory Direct Chrome Rods</p>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
              XIJIU Intelligent Equipment supplies piston rods, hard chrome plated rods, honed tubes, and precision hydraulic components from an organized production workshop.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 font-semibold text-white transition hover:bg-[var(--teal-dark)] active:translate-y-px"
              >
                Get A Quote <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/28 px-5 font-semibold text-white transition hover:border-white/60 hover:bg-white/8 active:translate-y-px"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
          <Image
            src="/images/factory/workshop-overview.jpg"
            alt="Factory direct chrome rod production at XIJIU Intelligent Equipment"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[linear-gradient(90deg,rgba(6,26,47,0.92),rgba(6,26,47,0.12))] px-6 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
            Jiangsu Xijiu Intelligent Equipment | Haian, China
          </div>
        </div>
      </div>
    </section>
  );
}
