import type { MetadataRoute } from "next";
import { productCategories, products, site } from "@/lib/site";

const staticRoutes = ["", "/products", "/process", "/quality", "/industries", "/company", "/contact", "/rfq"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.domain}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...products.map((product) => ({
      url: `${site.domain}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...productCategories.map((category) => ({
      url: `${site.domain}/products/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
