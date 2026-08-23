-- First-party visitor analytics. This migration is additive and keeps existing CMS, lead and content data intact.

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS site_id TEXT NOT NULL DEFAULT 'hcj-pistonrod',
  ADD COLUMN IF NOT EXISTS visitor_sequence INTEGER,
  ADD COLUMN IF NOT EXISTS landing_path TEXT,
  ADD COLUMN IF NOT EXISTS referrer_host TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS ip_masked TEXT,
  ADD COLUMN IF NOT EXISTS request_host TEXT,
  ADD COLUMN IF NOT EXISTS event_source TEXT NOT NULL DEFAULT 'first-party';

CREATE TABLE IF NOT EXISTS analytics_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  visitor_id_hash TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count INTEGER NOT NULL DEFAULT 0,
  country TEXT,
  source_channel TEXT,
  referrer_host TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  language TEXT,
  ip_hash TEXT,
  ip_masked TEXT,
  classification TEXT NOT NULL DEFAULT 'new',
  conversion_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, visitor_id_hash)
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  visitor_id_hash TEXT NOT NULL,
  session_id_hash TEXT NOT NULL,
  visit_number INTEGER NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  landing_path TEXT,
  last_page_path TEXT,
  country TEXT,
  source_channel TEXT,
  referrer_host TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  language TEXT,
  ip_hash TEXT,
  ip_masked TEXT,
  page_views INTEGER NOT NULL DEFAULT 0,
  conversion_count INTEGER NOT NULL DEFAULT 0,
  classification TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, session_id_hash)
);

CREATE TABLE IF NOT EXISTS analytics_exclusion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  match_value TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, rule_type, match_value)
);

CREATE TABLE IF NOT EXISTS analytics_collection_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  rollup_hour TIMESTAMPTZ NOT NULL,
  outcome TEXT NOT NULL,
  reason TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, rollup_hour, outcome, reason, event_name)
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_time ON analytics_events(site_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_time ON analytics_events(site_id, visitor_id_hash, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_time ON analytics_events(site_id, session_id_hash, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_channel_time ON analytics_events(site_id, source_channel, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_site_last_seen ON analytics_sessions(site_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_last_seen ON analytics_sessions(site_id, visitor_id_hash, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_site_last_seen ON analytics_visitors(site_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_collection_rollups_site_hour ON analytics_collection_rollups(site_id, rollup_hour DESC);
