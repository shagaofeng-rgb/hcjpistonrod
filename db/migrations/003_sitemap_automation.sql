CREATE TABLE IF NOT EXISTS sitemap_snapshots (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  manifest_hash TEXT NOT NULL,
  url_manifest JSONB NOT NULL DEFAULT '[]'::jsonb,
  files_manifest JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sitemap_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  url_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  was_split BOOLEAN NOT NULL DEFAULT false,
  added_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  modified_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  removed_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  search_console_attempted BOOLEAN NOT NULL DEFAULT false,
  search_console_success BOOLEAN NOT NULL DEFAULT false,
  search_console_result TEXT,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sitemap_runs_created_at ON sitemap_runs(created_at DESC);

CREATE TABLE IF NOT EXISTS sitemap_refresh_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  requested_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sitemap_refresh_state (id, requested_at, reason)
VALUES (1, now(), 'migration') ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION request_sitemap_refresh() RETURNS trigger AS $$
BEGIN
  INSERT INTO sitemap_refresh_state (id, requested_at, reason, updated_at)
  VALUES (1, now(), TG_TABLE_NAME || ':' || TG_OP, now())
  ON CONFLICT (id) DO UPDATE SET requested_at = excluded.requested_at, reason = excluded.reason, updated_at = excluded.updated_at;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_request_sitemap_refresh ON products_cms;
CREATE TRIGGER products_request_sitemap_refresh
AFTER INSERT OR UPDATE OR DELETE ON products_cms
FOR EACH STATEMENT EXECUTE FUNCTION request_sitemap_refresh();

DROP TRIGGER IF EXISTS categories_request_sitemap_refresh ON product_categories_cms;
CREATE TRIGGER categories_request_sitemap_refresh
AFTER INSERT OR UPDATE OR DELETE ON product_categories_cms
FOR EACH STATEMENT EXECUTE FUNCTION request_sitemap_refresh();

DROP TRIGGER IF EXISTS news_request_sitemap_refresh ON news_articles;
CREATE TRIGGER news_request_sitemap_refresh
AFTER INSERT OR UPDATE OR DELETE ON news_articles
FOR EACH STATEMENT EXECUTE FUNCTION request_sitemap_refresh();
