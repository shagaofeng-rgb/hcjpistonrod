import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { megaMenuGroups, site } from "@/lib/site";

export function Footer() {
  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

  return (
    <footer className="border-t border-[var(--line)] bg-[#071428] pb-16 text-white md:pb-0">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <div className="relative mb-4 h-14 w-24 overflow-hidden rounded-md bg-white">
            <Image
              src="/xijiu-logo.jpg"
              alt="XIJIU Intelligent Equipment logo"
              fill
              className="object-contain p-1.5"
              sizes="96px"
            />
          </div>
          <div className="text-xl font-semibold">{site.brandName}</div>
          <div className="mt-2 text-sm text-white/58">Export title: {site.exportCompanyName}</div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Hydraulic cylinders, custom hydraulic components, honed tubes, chrome plated rods, and
            hydraulic power units for OEM machinery and industrial hydraulic systems. Since {site.since}.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">Products</div>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            {megaMenuGroups.map((group) => (
              <Link key={group.href} href={group.href} className="hover:text-white">
                {group.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">Quick Links</div>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/why-xijiu" className="hover:text-white">Why Xijiu</Link>
            <Link href="/news" className="hover:text-white">News</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/image-credits" className="hover:text-white">Image Credits</Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">Contact</div>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            <a className="flex items-center gap-3 hover:text-white" href={`tel:${site.tel}`}>
              <Phone size={16} /> {site.telLabel}
            </a>
            <a className="flex items-center gap-3 hover:text-white" href={`mailto:${site.email}`}>
              <Mail size={16} /> {site.email}
            </a>
            <a className="flex items-center gap-3 hover:text-white" href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <span className="flex items-start gap-3">
              <MapPin className="mt-1 shrink-0" size={16} /> {site.address}
            </span>
            <div className="grid h-20 w-20 place-items-center rounded-md border border-white/16 text-center text-xs text-white/44">
              QR Code
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container text-xs text-white/50">
          © 2026 {site.brandName}. Factory: {site.factoryName}. Export title: {site.exportCompanyName}.
        </div>
      </div>
    </footer>
  );
}
