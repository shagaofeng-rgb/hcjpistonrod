import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCategoryTemplate } from "@/components/product-category-template";

export const metadata: Metadata = {
  title: "Hydraulic Cylinder Manufacturer",
  description: "Custom hydraulic cylinders for construction, agriculture, mining, material handling, and industrial automation equipment.",
  alternates: { canonical: "/products/hydraulic-cylinder" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Header />
      <main><ProductCategoryTemplate slug="hydraulic-cylinder" /></main>
      <Footer />
    </>
  );
}
