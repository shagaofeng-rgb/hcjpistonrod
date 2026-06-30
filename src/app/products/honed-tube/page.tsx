import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCategoryTemplate } from "@/components/product-category-template";

export const metadata: Metadata = {
  title: "Honed Tube Manufacturer",
  description: "Precision honed tubes for hydraulic cylinder barrels and high-performance actuator systems.",
  alternates: { canonical: "/products/honed-tube" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main><ProductCategoryTemplate slug="honed-tube" /></main>
      <Footer />
    </>
  );
}
