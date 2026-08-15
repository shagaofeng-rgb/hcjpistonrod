import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeDrawingSelector } from "@/components/home-drawing-selector";

export function Hero() {
  return (
    <section className="border-b border-[#d9e3e9] bg-[#f7f9fa]">
      <div className="grid lg:min-h-[560px] lg:grid-cols-2">
        <div className="relative min-h-[380px] overflow-hidden border-b border-[#d9e3e9] lg:order-1 lg:border-b-0 lg:border-r">
          <Image
            src="/images/home-redesign/template-hero-rods.png"
            alt="Precision machined piston rod ends"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="relative flex items-center overflow-hidden bg-white px-5 py-14 sm:px-10 lg:order-2 lg:px-[max(54px,calc((100vw-1280px)/2))]">
          <div className="absolute right-0 top-0 h-52 w-52 border-b border-l border-[#e5ebef] opacity-80" aria-hidden="true" />
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0068ae]">Engineered. Machined. Verified.</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.04] text-[#061a2f] sm:text-5xl xl:text-[4rem]">
              Precision Rods.<br />Reliable Motion.<br />Built to Print.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#526a7c] sm:text-[17px]">
              XIJIU Intelligent Equipment manufactures precision piston rods, hard chrome plated rods, honed tubes, and custom-machined hydraulic components for demanding applications.
            </p>
            <div className="mt-7 max-w-[22rem]">
              <HomeDrawingSelector />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/contact" className="inline-flex items-center gap-2 text-[#0068ae] hover:text-[#004f85]">
                Send Your Drawing <ArrowRight size={16} />
              </Link>
              <Link href="/products" className="inline-flex items-center gap-2 text-[#061a2f] hover:text-[#0068ae]">
                Explore Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
