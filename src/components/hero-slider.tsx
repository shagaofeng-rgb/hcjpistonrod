import Image from "next/image";
import { HomeDrawingSelector } from "@/components/home-drawing-selector";

export function Hero() {
  return (
    <section className="border-b border-[#d9e3e9] bg-[#f7f9fa]">
      <div className="grid lg:min-h-[492px] lg:grid-cols-2">
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
        <div className="relative flex items-center overflow-hidden bg-white px-5 py-12 sm:px-10 lg:order-2 lg:px-[clamp(2.5rem,5vw,6rem)] lg:py-10">
          <div className="absolute right-0 top-0 h-52 w-52 border-b border-l border-[#e5ebef] opacity-80" aria-hidden="true" />
          <div className="relative z-10 max-w-[34rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0068ae]">Engineered. Machined. Verified.</p>
            <h1 className="mt-4 max-w-[34rem] text-4xl font-semibold leading-[1.01] text-[#061a2f] sm:text-5xl lg:text-[clamp(2.25rem,2.6vw,3rem)]">
              Precision Rods.<br />Reliable Motion.<br />Built to Print.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#526a7c] sm:text-[17px]">
              XIJIU Intelligent Equipment manufactures precision piston rods, hard chrome plated rods, honed tubes, and custom-machined hydraulic components for demanding applications.
            </p>
            <div className="mt-6 max-w-[23rem]">
              <HomeDrawingSelector />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
