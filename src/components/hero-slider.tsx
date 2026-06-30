"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/factory/workshop-overview.jpg",
    title: "Reliable Hydraulic Components from a Real Factory Floor",
    subtitle:
      "XIJIU Intelligent Equipment supplies custom hydraulic cylinders, chrome plated rods, honed tubes, and precision hydraulic components from an organized production workshop.",
    primary: "Get A Quote",
    primaryHref: "/contact",
    secondary: "View Products",
    secondaryHref: "/products",
  },
  {
    image: "/images/factory/chrome-rod-stock.jpg",
    title: "Custom Hydraulic Solutions Built Around Your Application",
    subtitle:
      "From bore size and stroke length to mounting style, seal system, surface treatment, and testing requirements, our engineering team supports OEM and project-based hydraulic cylinder customization.",
    primary: "Send Your Drawing",
    primaryHref: "/contact",
    secondary: "Explore Custom Options",
    secondaryHref: "/products/custom-hydraulic-cylinder",
  },
  {
    image: "/images/factory/factory-exterior.jpg",
    title: "Stable Quality. Controlled Process. Faster Delivery.",
    subtitle:
      "With precision machining, strict inspection, and reliable production management, XIJIU helps customers reduce sourcing risk and keep projects moving.",
    primary: "Why Choose XIJIU",
    primaryHref: "/why-xijiu",
    secondary: "Contact Us",
    secondaryHref: "/contact",
  },
];

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 6200);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative min-h-[720px] overflow-hidden bg-[#071428] text-white">
      <Image
        src={slide.image}
        alt={`${slide.title} - XIJIU hydraulic manufacturing visual`}
        fill
        priority
        className="object-cover opacity-55 motion-safe:animate-[pulse_8s_ease-in-out_infinite]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,40,0.95)_0%,rgba(7,20,40,0.78)_42%,rgba(7,20,40,0.34)_100%)]" />
      <div className="container relative flex min-h-[720px] items-center py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ffb3b8]">
            Hydraulic Cylinder and Precision Hydraulic Component Manufacturer
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] md:text-7xl">{slide.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">{slide.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={slide.primaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-5 font-semibold text-white transition hover:bg-[#a81825]"
            >
              {slide.primary} <ArrowRight size={18} />
            </Link>
            <Link
              href={slide.secondaryHref}
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 px-5 font-semibold text-white transition hover:bg-white/10"
            >
              {slide.secondary}
            </Link>
          </div>
          <div className="mt-10 flex gap-2">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActive(index)}
                className={`h-2.5 rounded-full transition ${active === index ? "w-10 bg-white" : "w-2.5 bg-white/40"}`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
