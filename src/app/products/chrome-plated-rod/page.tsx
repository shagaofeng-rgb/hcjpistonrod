import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCategoryTemplate } from "@/components/product-category-template";

export const metadata: Metadata = {
  title: "Chrome Plated Rod Supplier",
  description: "Hard chrome plated rods for hydraulic piston rods with wear resistance and corrosion protection.",
  alternates: { canonical: "/products/chrome-plated-rod" },
};

export default function Page() {
  return (
    <>
      <Header />
      <main><ProductCategoryTemplate slug="chrome-plated-rod" /></main>
      <Footer />
    </>
  );
}
