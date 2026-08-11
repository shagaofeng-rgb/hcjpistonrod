import { unstable_cache } from "next/cache";
import type { Product } from "../../data/products";
import { hasDatabaseConfig, query } from "@/lib/admin/db";

type ProductRow = {
  slug: string;
  name: string;
  english_name: string;
  short_description: string | null;
  full_description: string | null;
  applications: unknown;
  specifications: unknown;
  attributes: unknown;
  tags: unknown;
  moq: string | null;
  lead_time: string | null;
  category_slug: string | null;
  image_url: string;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {} as Record<string, string>;
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function faqs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const candidate = item as { question?: unknown; answer?: unknown };
    return typeof candidate.question === "string" && typeof candidate.answer === "string"
      ? [{ question: candidate.question, answer: candidate.answer }]
      : [];
  });
}

function toProduct(row: ProductRow): Product {
  const attributes = row.attributes && typeof row.attributes === "object" && !Array.isArray(row.attributes)
    ? row.attributes as Record<string, unknown>
    : {};
  return {
    slug: row.slug,
    name: row.english_name || row.name,
    category: row.category_slug || "uncategorized",
    shortDescription: row.short_description || row.full_description || "",
    definition: row.full_description || row.short_description || "",
    image: row.image_url,
    model: typeof attributes.model === "string" ? attributes.model : "",
    availability: row.moq || "Inquire",
    customization: typeof attributes.customization === "string" ? attributes.customization : "Available",
    applications: stringArray(row.applications),
    specs: stringRecord(row.specifications),
    advantages: stringArray(attributes.advantages),
    process: stringArray(attributes.process),
    quality: stringArray(attributes.quality),
    faqs: faqs(attributes.faqs),
  };
}

async function databaseProducts() {
  const result = await query<ProductRow>(
    `select p.slug, p.name, p.english_name, p.short_description, p.full_description, p.applications,
      p.specifications, p.attributes, p.tags, p.moq, p.lead_time, c.slug as category_slug,
      coalesce(ma.url, p.attributes->>'image') as image_url
     from products_cms p
     left join product_categories_cms c on c.id = p.primary_category_id and c.deleted_at is null
     left join media_assets ma on ma.id = p.main_image_id and ma.deleted_at is null
     where p.deleted_at is null and p.status = 'published' and p.published_at is not null
       and p.published_at <= now() and coalesce(ma.url, p.attributes->>'image') is not null
     order by p.sort_order asc, p.updated_at desc`,
  );
  return result.rows.map(toProduct);
}

const getCachedProducts = unstable_cache(databaseProducts, ["hcj", "published-products"], {
  revalidate: 300,
  tags: ["hcj-published-products"],
});

export async function getPublishedProducts() {
  if (!hasDatabaseConfig()) return [];
  try {
    return await getCachedProducts();
  } catch (error) {
    console.error("[products] CMS read failed", { message: error instanceof Error ? error.message : "unknown error" });
    return [];
  }
}

export async function getPublishedProduct(slug: string) {
  return (await getPublishedProducts()).find((product) => product.slug === slug);
}
