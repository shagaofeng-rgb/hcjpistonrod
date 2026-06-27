import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { navItems, products, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#151816] text-white">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="text-xl font-semibold">{site.factoryName}</div>
          <div className="mt-2 text-sm text-white/58">Export title: {site.exportCompanyName}</div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Export supply for hydraulic piston rods, hard chrome plated rods, honed tubes, and
            hydraulic cylinder components with specification-driven production support.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/78">
            <a className="flex items-center gap-3 hover:text-white" href={`tel:${site.tel}`}>
              <Phone size={16} /> {site.telLabel}
            </a>
            <a className="flex items-center gap-3 hover:text-white" href={`mailto:${site.email}`}>
              <Mail size={16} /> {site.email}
            </a>
            <span className="flex items-start gap-3">
              <MapPin className="mt-1 shrink-0" size={16} /> {site.address}
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
            Products
          </div>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            {products.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`} className="hover:text-white">
                {product.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
            Company
          </div>
          <div className="mt-4 grid gap-3 text-sm text-white/72">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container text-xs text-white/50">
          © 2026 {site.factoryName}. Export title: {site.exportCompanyName}.
        </div>
      </div>
    </footer>
  );
}
