-- Additive migration for site-scoped News automation. Historical content is retained.

CREATE TABLE IF NOT EXISTS news_site_configs (
  site_id TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO news_site_configs (site_id, enabled)
VALUES ('hcj-pistonrod', true)
ON CONFLICT (site_id) DO NOTHING;

ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS editorial_disclaimer TEXT;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS news_publication_run_id UUID;
ALTER TABLE news_articles ADD CONSTRAINT news_articles_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_articles_site_slug ON news_articles(site_id, slug) WHERE deleted_at IS NULL;

ALTER TABLE news_sources ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE news_sources ADD CONSTRAINT news_sources_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE news_sources DROP CONSTRAINT IF EXISTS news_sources_domain_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_sources_site_domain ON news_sources(site_id, domain) WHERE deleted_at IS NULL;

-- The former controlled-content tables are retained as read-only historical
-- evidence, but are now explicitly scoped so no future query can treat them
-- as cross-site input for the new News publisher.
ALTER TABLE content_ops_product_facts ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_news_sources ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_news_items ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_article_records ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_assets ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_runs ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_publishing_logs ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod';
ALTER TABLE content_ops_product_facts ADD CONSTRAINT content_ops_product_facts_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE content_ops_news_sources ADD CONSTRAINT content_ops_news_sources_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE content_ops_news_items ADD CONSTRAINT content_ops_news_items_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE content_ops_article_records ADD CONSTRAINT content_ops_article_records_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE content_ops_assets ADD CONSTRAINT content_ops_assets_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE content_ops_runs ADD CONSTRAINT content_ops_runs_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;
ALTER TABLE content_ops_publishing_logs ADD CONSTRAINT content_ops_publishing_logs_site_id_fk FOREIGN KEY (site_id) REFERENCES news_site_configs(site_id) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS news_ingest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  cycle_start TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, cycle_start)
);

CREATE TABLE IF NOT EXISTS news_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  title TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_published_at TIMESTAMPTZ NOT NULL,
  source_updated_at TIMESTAMPTZ,
  source_author TEXT,
  language TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  image_rights TEXT NOT NULL CHECK (image_rights IN ('not-used', 'unknown', 'owned-neutral')),
  url_hash TEXT NOT NULL,
  title_hash TEXT NOT NULL,
  content_fingerprint TEXT NOT NULL,
  score NUMERIC(6,2) NOT NULL DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('discovered', 'normalized', 'verified', 'scored', 'candidate', 'reserved_for_cycle', 'used', 'rejected', 'retry_pending')),
  reject_reason TEXT,
  reserved_cycle_start TIMESTAMPTZ,
  used_article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, normalized_url),
  UNIQUE (site_id, content_fingerprint)
);

CREATE TABLE IF NOT EXISTS news_candidate_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  candidate_id UUID NOT NULL REFERENCES news_candidates(id) ON DELETE CASCADE,
  fingerprint_type TEXT NOT NULL CHECK (fingerprint_type IN ('url', 'title', 'content')),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, fingerprint_type, fingerprint)
);

CREATE TABLE IF NOT EXISTS news_product_theme_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  theme_id TEXT NOT NULL,
  product_url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, theme_id, starts_at)
);

CREATE TABLE IF NOT EXISTS news_publication_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  cycle_start TIMESTAMPTZ NOT NULL,
  candidate_id UUID REFERENCES news_candidates(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'selecting', 'composing', 'preflight_validating', 'publishing', 'frontend_verifying', 'published_success', 'retry_pending', 'failed')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (site_id, cycle_start)
);

ALTER TABLE news_articles ADD CONSTRAINT news_articles_publication_run_fk FOREIGN KEY (news_publication_run_id) REFERENCES news_publication_runs(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS news_delivery_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  publication_run_id UUID NOT NULL REFERENCES news_publication_runs(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  list_url TEXT NOT NULL,
  detail_url TEXT NOT NULL,
  list_status INTEGER NOT NULL,
  detail_status INTEGER NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL REFERENCES news_site_configs(site_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_site_channel_public ON news_articles(site_id, content_channel, status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_candidates_ready ON news_candidates(site_id, status, score DESC, source_published_at DESC) WHERE reject_reason IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_ingest_runs_site_cycle ON news_ingest_runs(site_id, cycle_start DESC);
CREATE INDEX IF NOT EXISTS idx_news_publication_runs_site_cycle ON news_publication_runs(site_id, cycle_start DESC);
CREATE INDEX IF NOT EXISTS idx_news_delivery_checks_publication ON news_delivery_checks(publication_run_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_audit_events_site_created ON news_audit_events(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_ops_news_items_site_status ON content_ops_news_items(site_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_ops_article_records_site_status ON content_ops_article_records(site_id, status, created_at DESC);

COMMENT ON COLUMN news_articles.site_id IS 'Stable site identity. All public News/Blog reads must filter by site_id and content_channel.';
COMMENT ON COLUMN news_articles.editorial_disclaimer IS 'Mandatory for automated external News; not used to alter existing historical content.';
