import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCategoryTemplate } from "@/components/product-category-template";

export const metadata: Metadata = {
  title: "Custom Hydraulic Cylinder Supplier",
  description: "Drawing-based OEM hydraulic cylinder solutions for machinery manufacturers and project hydraulic systems.",
  alternates: { canonical: "/products/custom-hydraulic-cylinder" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Header />
      <main><ProductCategoryTemplate slug="custom-hydraulic-cylinder" /></main>
      <Footer />
    </>
  );
}
