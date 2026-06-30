import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { RfqForm } from "@/components/rfq-form";
import { site } from "@/lib/site";
import { company } from "../../../data/company";

export const metadata: Metadata = {
  title: "Contact XIJIU",
  description:
    "Send your drawing, specification, or project requirements to XIJIU for hydraulic cylinder quotation and technical support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  const cards = [
    { icon: Phone, label: "Phone", value: site.telLabel, href: `tel:${site.tel}` },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: MessageCircle, label: "WhatsApp", value: site.whatsappLabel, href: whatsappHref },
    { icon: MapPin, label: "Address", value: site.address, href: "#" },
  ];

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.brandName,
    email: company.email,
    telephone: company.phoneLabel,
    address: company.address,
    url: company.domain,
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact XIJIU" }]} />
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--amber)]">Contact / Quote Now</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
              Contact XIJIU
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              Send your drawing, specification, or project requirements. We will respond with practical technical and quotation support.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <RfqForm />
            <div className="grid gap-5">
              <div className="rounded-md border border-[var(--line)] bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--amber)]">Contact Information</p>
                <div className="mt-5 grid gap-4">
                  {cards.map(({ icon: Icon, label, value, href }) => (
                    <a key={label} href={href} className="flex gap-4 rounded-md border border-[var(--line)] bg-[var(--background)] p-4 transition hover:border-[var(--teal)]">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-white text-[var(--teal)]">
                        <Icon size={20} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-[var(--steel)]">{label}</span>
                        <span className="mt-1 block text-base font-semibold leading-7 text-[var(--ink)]">{value}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-white p-6">
                <h2 className="text-xl font-semibold text-[var(--ink)]">Working Hours</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{company.workingHours}</p>
                <div className="mt-5 grid h-24 w-24 place-items-center rounded-md border border-[var(--line)] text-center text-xs text-[var(--steel)]">
                  QR Code
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
