import Image from "next/image";
import { HomeDrawingSelector } from "@/components/home-drawing-selector";

export function Hero() {
  return (
    <section className="border-b border-[#d9e3e9] bg-[#f7f9fa]">
      <div className="grid md:min-h-[590px] md:grid-cols-2 lg:min-h-[492px]">
        <div className="relative min-h-[270px] overflow-hidden border-b border-[#d9e3e9] sm:min-h-[340px] md:order-1 md:min-h-[590px] md:border-b-0 md:border-r lg:min-h-[492px]">
          <Image
            src="/images/home-redesign/template-hero-rods.png"
            alt="Precision machined piston rod ends"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="relative flex items-center overflow-hidden bg-white px-5 py-10 sm:px-8 sm:py-12 md:order-2 md:px-7 md:py-10 lg:px-[clamp(2.5rem,5vw,6rem)] lg:py-10">
          <div className="absolute right-0 top-0 h-52 w-52 border-b border-l border-[#e5ebef] opacity-80" aria-hidden="true" />
          <div className="relative z-10 max-w-[34rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0068ae] sm:text-xs">Engineered. Machined. Verified.</p>
            <h1 className="mt-4 max-w-[34rem] text-4xl font-semibold leading-[1.01] text-[#061a2f] sm:text-5xl md:text-[2.5rem] lg:text-[clamp(2.25rem,2.6vw,3rem)]">
              Precision Rods.<br />Reliable Motion.<br />Built to Print.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#526a7c] sm:text-[17px] md:text-base">
              XIJIU Intelligent Equipment manufactures precision piston rods, hard chrome plated rods, honed tubes, and custom-machined hydraulic components for demanding applications.
            </p>
            <div className="mt-6 max-w-[23rem] md:mt-5">
              <HomeDrawingSelector />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
