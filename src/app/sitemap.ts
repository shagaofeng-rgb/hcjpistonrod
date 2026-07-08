import type { MetadataRoute } from "next";
import { productCategories, products, site } from "@/lib/site";
import { newsArticles } from "../../data/news";

const staticRoutes = [
  "",
  "/products",
  "/why-xijiu",
  "/about",
  "/news",
  "/blog",
  "/contact",
  "/privacy-policy",
  "/image-credits",
];

const primaryCategorySlugs = new Set(["chrome-plated-rod", "honed-tube"]);
const primaryProductCategories = new Set(["chrome-plated-rod", "honed-tube"]);

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
    ...products.filter((product) => !categorySlugs.has(product.slug) && primaryProductCategories.has(product.category)).map((product) => ({
      url: `${site.domain}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...productCategories.filter((category) => primaryCategorySlugs.has(category.slug)).map((category) => ({
      url: `${site.domain}/products/${category.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...newsArticles.map((article) => ({
      url: `${site.domain}/news/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...newsArticles.map((article) => ({
      url: `${site.domain}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
