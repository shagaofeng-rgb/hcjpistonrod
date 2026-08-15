import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { megaMenuGroups, site } from "@/lib/site";

export function Footer({ homepage = false }: { homepage?: boolean }) {
  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  const layoutClass = homepage ? "home-container" : "container";

  return (
    <footer className="bg-[#061a2f] pb-16 text-white md:pb-0">
      <div className="border-b border-white/12">
        <div className={`${layoutClass} flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-[#19a9e5]/70 text-[#81d2f3]">
              <Send size={20} />
            </span>
            <div>
              <div className="text-xl font-semibold">Have a Project in Mind?</div>
              <p className="mt-1 text-sm text-white/66">Send your drawing or specifications for a clear engineering review.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex h-11 items-center justify-center gap-2 bg-[#0068ae] px-5 text-sm font-semibold transition hover:bg-[#19a9e5]">
              Send Your Drawing <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex h-11 items-center justify-center gap-2 border border-white/35 px-5 text-sm font-semibold transition hover:border-white hover:bg-white/10">
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <div className={`${layoutClass} grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]`}>
        <div>
          <Image
            src="/images/home-redesign/template-brand-lockup.png"
            alt="Nantong HCJ | Xijiu Intelligent Equipment"
            width={235}
            height={70}
            className="h-auto w-[195px]"
          />
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Piston rods, hard chrome plated rods, honed tubes, and drawing-based hydraulic components
            for OEM machinery and industrial hydraulic systems.
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
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">Company</div>
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
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className={`${layoutClass} flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between`}>
          <span>© 2026 Nantong HCJ. Factory: {site.factoryName}. Trading company: {site.exportCompanyName}.</span>
          <span>Privacy Policy &nbsp;|&nbsp; Terms of Use</span>
        </div>
      </div>
    </footer>
  );
}
