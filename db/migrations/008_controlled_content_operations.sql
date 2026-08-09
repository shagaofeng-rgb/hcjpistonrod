-- Retire the former scheduled Blog publishing queue without deleting published content or audit history.
UPDATE news_articles
SET auto_publish_approved = false,
    auto_publish_at = null,
    scheduled_publish_at = null,
    updated_at = now()
WHERE status = 'draft'
  AND (auto_publish_approved = true OR auto_publish_at IS NOT NULL OR scheduled_publish_at IS NOT NULL);

DROP INDEX IF EXISTS idx_news_articles_auto_publish_queue;

UPDATE news_sources
SET is_enabled = false,
    updated_at = now()
WHERE is_enabled = true;

UPDATE sync_sources
SET config_status = 'disabled',
    connection_status = 'disabled',
    schedule_cron = null,
    next_run_at = null,
    updated_at = now()
WHERE code = 'news-automation';

CREATE TABLE IF NOT EXISTS content_ops_product_facts (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  claim TEXT NOT NULL,
  source_document_id TEXT NOT NULL,
  source_location TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_ops_news_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  feed_url TEXT,
  source_type TEXT NOT NULL,
  allowlisted BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_ops_news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL REFERENCES content_ops_news_sources(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  product_families JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevance_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'approved', 'rejected', 'used')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_ops_article_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  markdown TEXT NOT NULL,
  brief JSONB NOT NULL,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  claims JSONB NOT NULL DEFAULT '[]'::jsonb,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'rejected')),
  content_hash TEXT NOT NULL,
  title_hash TEXT NOT NULL,
  source_commit TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_ops_article_records_status ON content_ops_article_records(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_ops_article_records_hashes ON content_ops_article_records(title_hash, content_hash);

CREATE TABLE IF NOT EXISTS content_ops_assets (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  ownership TEXT NOT NULL CHECK (ownership IN ('owned', 'licensed', 'verified_open_license')),
  alt TEXT NOT NULL,
  product_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_ops_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (run_type IN ('news_ingest', 'article_cycle')),
  status TEXT NOT NULL CHECK (status IN ('success', 'skipped', 'failed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_ops_publishing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES content_ops_article_records(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  github_commit_sha TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
