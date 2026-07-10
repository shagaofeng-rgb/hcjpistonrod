"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe2, Mail, Menu, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { megaMenuGroups, navItems, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = () => {
    setOpen(false);
    setMegaOpen(false);
  };

  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--line)] transition ${
        scrolled ? "bg-white shadow-[0_12px_30px_rgba(11,24,51,0.08)]" : "bg-white/94 backdrop-blur"
      }`}
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div className="border-b border-[var(--line)] bg-[#071428] py-2 text-xs text-white/76">
        <div className="container flex items-center justify-between gap-4">
          <span className="hidden sm:inline">
            {site.brandName} | Factory: {site.factoryName}
          </span>
          <span className="sm:hidden">{site.brandName}</span>
          <div className="flex items-center gap-3">
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Mail size={14} /> <span className="hidden md:inline">{site.email}</span>
            </a>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
              <MessageCircle size={14} /> <span className="hidden md:inline">WhatsApp</span>
            </a>
            <span className="hidden items-center gap-1.5 sm:inline-flex" aria-label="Website language: English">
              <Globe2 size={14} /> English
            </span>
          </div>
        </div>
      </div>

      <div className="container flex min-h-18 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.brandName} home`} onClick={closeAll}>
          <span className="relative h-14 w-14 overflow-hidden rounded-md border border-[var(--line)] bg-white">
            <Image
              src="/xijiu-logo.png"
              alt="XIJIU Intelligent Equipment logo"
              fill
              priority
              className="object-contain p-1.5"
              sizes="56px"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-[0.04em] text-[var(--ink)]">XIJIU</span>
            <span className="block text-xs uppercase tracking-[0.16em] text-[var(--steel)]">
              Intelligent Equipment
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium text-[var(--steel)] lg:flex">
          {navItems.map((item) =>
            item.label === "Products" ? (
              <button
                key={item.href}
                type="button"
                onMouseEnter={() => setMegaOpen(true)}
                onFocus={() => setMegaOpen(true)}
                className="inline-flex h-10 items-center gap-1 rounded-md px-3 transition hover:bg-[var(--muted)] hover:text-[var(--teal)]"
              >
                Products <ChevronDown size={15} />
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onFocus={() => setMegaOpen(false)}
                className="inline-flex h-10 items-center rounded-md px-3 transition hover:bg-[var(--muted)] hover:text-[var(--teal)]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            onClick={closeAll}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-4 text-sm font-semibold text-white transition hover:bg-[#a81825]"
          >
            <Send size={17} />
            Quote Now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--steel)] lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            title="Navigation"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {megaOpen && (
        <div className="absolute left-0 right-0 top-full hidden border-b border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(11,24,51,0.14)] lg:block">
          <div className="container grid gap-8 py-7 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="rounded-md bg-[var(--muted)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">Product navigation</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-[var(--ink)]">
                Piston rods, chrome plated rods, honed tubes, and drawing-based hydraulic components.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
                Choose a category or send drawings for technical review and quotation support.
              </p>
              <Link
                href="/products"
                onClick={closeAll}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[var(--ink)] px-4 text-sm font-semibold text-white"
              >
                View All Products
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {megaMenuGroups.map((group) => (
                <div key={group.label} className="rounded-md border border-[var(--line)] p-4">
                  <Link
                    href={group.href}
                    onClick={closeAll}
                    className="font-semibold text-[var(--ink)] hover:text-[var(--teal)]"
                  >
                    {group.label}
                  </Link>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--steel)]">
                    {group.links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={closeAll} className="hover:text-[var(--teal)]">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="container grid gap-3 pb-4 text-sm font-semibold text-[var(--steel)] lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeAll}
              className="rounded-md border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
          <div className="rounded-md border border-[var(--line)] bg-white p-4">
            <div className="font-semibold text-[var(--ink)]">Product Categories</div>
            <div className="mt-3 grid gap-3">
              {megaMenuGroups.map((group) => (
                <Link key={group.href} href={group.href} onClick={closeAll} className="text-[var(--steel)]">
                  {group.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
