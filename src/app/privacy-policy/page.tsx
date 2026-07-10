import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for XIJIU Intelligent Equipment inquiry and website communication.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
            <h1 className="mt-8 text-4xl font-semibold text-[var(--ink)]">Privacy Policy</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              XIJIU Intelligent Equipment uses inquiry information only for communication, quotation,
              technical review, and order-related support.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container max-w-4xl rounded-md border border-[var(--line)] bg-white p-6">
            {[
              ["Information We Collect", "We may collect name, email, phone, company, country, product interest, drawings, and message content submitted through inquiry forms."],
              ["How We Use Information", "Information is used to respond to inquiries, review technical requirements, prepare quotations, and coordinate order-related communication."],
              ["Drawing Confidentiality", "Customer drawings and technical files are treated as project communication materials and are not published on the website."],
              ["Storage and Retention", "Inquiry records are stored in our secured website system and business email for follow-up, quotation history, and order support. We retain them only while they remain relevant to these business purposes or legal record requirements."],
              ["Sharing and Security", "We do not sell inquiry information. Access is limited to authorized sales, technical, and website administration personnel and the service providers needed to operate email, hosting, and database infrastructure."],
              ["Your Choices", "You may ask us to correct or delete inquiry information that is no longer required by contacting the email address below."],
              ["Contact", "For privacy-related questions, contact ada@hcjpistonrod.com."],
            ].map(([title, body]) => (
              <section key={title} className="border-b border-[var(--line)] py-5 last:border-b-0">
                <h2 className="text-2xl font-semibold text-[var(--ink)]">{title}</h2>
                <p className="mt-3 text-base leading-7 text-[var(--steel)]">{body}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
