ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS technical_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS technical_reviewer TEXT,
  ADD COLUMN IF NOT EXISTS marketing_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_reviewer TEXT,
  ADD COLUMN IF NOT EXISTS published_by_name TEXT;

COMMENT ON COLUMN news_articles.technical_reviewed_at IS
  'Manual technical review completion time. Required by the editorial procedure before new publication.';
COMMENT ON COLUMN news_articles.marketing_reviewed_at IS
  'Manual marketing review completion time. Required by the editorial procedure before new publication.';
