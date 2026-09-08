-- Additive visitor attribution for the admin analytics workspace.
-- No historical content, inquiry, or analytics records are removed or rewritten.

ALTER TABLE form_submissions
  ADD COLUMN IF NOT EXISTS visitor_id_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_form_submissions_visitor_submitted
  ON form_submissions(visitor_id_hash, submitted_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_site_visitor_first_seen
  ON analytics_sessions(site_id, visitor_id_hash, first_seen_at ASC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_visitor_occurred
  ON analytics_events(site_id, visitor_id_hash, occurred_at ASC);
