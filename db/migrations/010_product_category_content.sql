-- Keeps the public category narrative in the same CMS record as its identity and SEO fields.
ALTER TABLE product_categories_cms
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]'::jsonb;
