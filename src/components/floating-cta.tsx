"use client";

import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export function FloatingCTA() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-[var(--line)] bg-white p-2 shadow-[0_-12px_30px_rgba(11,24,51,0.12)] md:bottom-5 md:left-auto md:right-5 md:w-52 md:grid-cols-1 md:rounded-md md:border md:p-3">
      <Link
        href="/contact"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--amber)] px-4 text-sm font-semibold text-white transition hover:bg-[#a81825]"
      >
        <Send size={17} /> Quote Now
      </Link>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-[var(--teal)] transition hover:bg-[var(--muted)]"
      >
        <MessageCircle size={17} /> WhatsApp
      </a>
    </div>
  );
}
