import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCategoryTemplate } from "@/components/product-category-template";

export const metadata: Metadata = {
  title: "Welded Hydraulic Cylinder Manufacturer",
  description: "Compact, durable, and customizable welded hydraulic cylinders for mobile and industrial hydraulic systems.",
  alternates: { canonical: "/products/welded-hydraulic-cylinder" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main><ProductCategoryTemplate slug="welded-hydraulic-cylinder" /></main>
      <Footer />
    </>
  );
}
