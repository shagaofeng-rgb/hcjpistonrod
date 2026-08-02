"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/factory/workshop-overview.jpg",
    title: "Factory Direct Chrome Rods",
    subtitle:
      "XIJIU Intelligent Equipment supplies piston rods, hard chrome plated rods, honed tubes, and precision hydraulic components from an organized production workshop.",
    primary: "Get A Quote",
    primaryHref: "/contact",
    secondary: "View Products",
    secondaryHref: "/products",
  },
  {
    image: "/images/factory/chrome-rod-stock.jpg",
    title: "Custom Rods Built Around Your Drawing",
    subtitle:
      "From material and length to hardness, chrome thickness, surface finish, and end machining, our team supports OEM and project-based piston rod requirements.",
    primary: "Send Your Drawing",
    primaryHref: "/contact",
    secondary: "Explore Custom Options",
    secondaryHref: "/products/chrome-plated-rod",
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
    <section className="overflow-hidden border-b border-[#0d385c] bg-[#061a2f] text-white">
      <div className="grid min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex items-center px-5 py-16 sm:px-10 lg:px-[max(52px,calc((100vw-1280px)/2))] lg:pr-16">
          <div className="max-w-xl">
            <div className="mb-8 h-px w-16 bg-[var(--cyan)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#81d2f3]">
              Piston Rod and Hard Chrome Plated Rod Manufacturer
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl xl:text-6xl">{slide.title}</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/76 sm:text-lg sm:leading-8">{slide.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={slide.primaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-5 font-semibold text-white transition hover:bg-[var(--teal-dark)] active:translate-y-px"
              >
                {slide.primary} <ArrowRight size={18} />
              </Link>
              <Link
                href={slide.secondaryHref}
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/28 px-5 font-semibold text-white transition hover:border-white/60 hover:bg-white/8 active:translate-y-px"
              >
                {slide.secondary}
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-2" aria-label="Hero slide controls">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition ${active === index ? "w-10 bg-[var(--cyan)]" : "w-2 bg-white/35 hover:bg-white/70"}`}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
          <Image
            src={slide.image}
            alt={`${slide.title} - XIJIU hydraulic manufacturing visual`}
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
