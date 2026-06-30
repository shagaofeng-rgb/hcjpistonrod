import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { imageCredits } from "../../../data/image-credits";

export const metadata: Metadata = {
  title: "Image Credits",
  description: "Image source and license credits for XIJIU Intelligent Equipment website visuals.",
  alternates: { canonical: "/image-credits" },
};

export default function ImageCreditsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-white py-16">
          <div className="container">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Image Credits" }]} />
            <h1 className="mt-8 text-4xl font-semibold text-[var(--ink)]">Image Credits</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--steel)]">
              Factory, workshop, and product photos are owned company materials. The external application
              visuals below use locally optimized copies of openly licensed or public-domain source images.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container overflow-x-auto rounded-md border border-[var(--line)] bg-white">
            <table className="min-w-[860px] w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--muted)] text-[var(--ink)]">
                <tr>
                  <th className="px-4 py-4">Local File</th>
                  <th className="px-4 py-4">Source</th>
                  <th className="px-4 py-4">Artist / Credit</th>
                  <th className="px-4 py-4">License</th>
                </tr>
              </thead>
              <tbody>
                {imageCredits.map((item) => (
                  <tr key={item.file} className="border-t border-[var(--line)] align-top">
                    <td className="px-4 py-4 font-medium text-[var(--ink)]">{item.file}</td>
                    <td className="px-4 py-4">
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-[var(--teal)] hover:text-[var(--teal-dark)]">
                        {item.title}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-[var(--steel)]">{item.artist}</td>
                    <td className="px-4 py-4 text-[var(--steel)]">{item.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
