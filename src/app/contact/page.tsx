import type { Metadata } from "next";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Nantong Huichenjin for hydraulic piston rods, hard chrome plated rods, honed tubes, and drawing-based RFQ support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const cards = [
    { icon: Phone, label: "Phone", value: site.telLabel, href: `tel:${site.tel}` },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MessageSquareText, label: "QQ", value: site.qq, href: "#" },
    { icon: MapPin, label: "Address", value: site.address, href: "#" },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Contact</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Send drawings, specs, or purchasing targets to the sales desk.
            </h1>
          </div>
        </section>
        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-md border border-[var(--line)] bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">
                Company titles
              </p>
              <div className="mt-5 grid gap-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--steel)]">
                    Factory
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[var(--ink)]">{site.factoryName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--steel)]">
                    Export company title
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[var(--ink)]">{site.exportCompanyName}</div>
                </div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
            {cards.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex gap-4 rounded-md border border-[var(--line)] bg-white p-5 transition hover:border-[var(--teal)]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[var(--muted)] text-[var(--teal)]">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-[var(--steel)]">
                    {label}
                  </span>
                  <span className="mt-1 block text-base font-semibold leading-7 text-[var(--ink)]">
                    {value}
                  </span>
                </span>
              </a>
            ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
