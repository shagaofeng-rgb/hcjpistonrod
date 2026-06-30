import type { MetadataRoute } from "next";
import { productCategories, products, site } from "@/lib/site";
import { newsArticles } from "../../data/news";

const staticRoutes = [
  "",
  "/products",
  "/why-xijiu",
  "/about",
  "/news",
  "/contact",
  "/privacy-policy",
  "/image-credits",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const categorySlugs = new Set(productCategories.map((category) => category.slug));

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.domain}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...products.filter((product) => !categorySlugs.has(product.slug)).map((product) => ({
      url: `${site.domain}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...productCategories.map((category) => ({
      url: `${site.domain}/products/${category.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...newsArticles.map((article) => ({
      url: `${site.domain}/news/${article.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
