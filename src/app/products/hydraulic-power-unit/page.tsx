import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCategoryTemplate } from "@/components/product-category-template";

export const metadata: Metadata = {
  title: "Hydraulic Power Unit Manufacturer",
  description: "Compact and customized hydraulic power units for machinery, automation, lifting systems, and hydraulic control.",
  alternates: { canonical: "/products/hydraulic-power-unit" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main><ProductCategoryTemplate slug="hydraulic-power-unit" /></main>
      <Footer />
    </>
  );
}
