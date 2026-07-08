ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS updated_source_at TIMESTAMPTZ;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_title TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_publisher TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_author TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS canonical_source_url TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_language TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_published_at TIMESTAMPTZ;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_fetched_at TIMESTAMPTZ;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_timezone TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_fingerprint TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS event_fingerprint TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_source_url TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_page_url TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_width INTEGER;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_height INTEGER;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_fetched_at TIMESTAMPTZ;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS cover_image_hash TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS relevance_score NUMERIC(6,4);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS credibility_score NUMERIC(6,4);
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS generation_model TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS generation_prompt_version TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS geo_summary TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS primary_keyword TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS secondary_keywords JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS automation_notes TEXT;

CREATE TABLE IF NOT EXISTS news_products (
  news_article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products_cms(id) ON DELETE SET NULL,
  product_slug TEXT NOT NULL,
  relevance_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (news_article_id, product_slug)
);

CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  feed_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'rss',
  language TEXT NOT NULL DEFAULT 'en',
  country TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  robots_checked_at TIMESTAMPTZ,
  terms_note TEXT,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS news_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  target_publish_date DATE,
  daily_target INTEGER NOT NULL DEFAULT 4,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  reviewed_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  published_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_publication_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES news_jobs(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status_from TEXT,
  status_to TEXT,
  source_url TEXT,
  canonical_source_url TEXT,
  source_fingerprint TEXT,
  event_fingerprint TEXT,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_published_at ON news_articles(source_published_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_articles_canonical_source_url ON news_articles(canonical_source_url) WHERE canonical_source_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_articles_source_fingerprint ON news_articles(source_fingerprint);
CREATE INDEX IF NOT EXISTS idx_news_articles_event_fingerprint ON news_articles(event_fingerprint);
CREATE INDEX IF NOT EXISTS idx_news_products_product_slug ON news_products(product_slug);
CREATE INDEX IF NOT EXISTS idx_news_jobs_status ON news_jobs(status);
CREATE INDEX IF NOT EXISTS idx_news_publication_audits_article ON news_publication_audits(news_article_id);
