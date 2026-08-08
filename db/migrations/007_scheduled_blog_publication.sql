ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS content_channel TEXT NOT NULL DEFAULT 'news',
  ADD COLUMN IF NOT EXISTS auto_publish_approved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_publish_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_publish_run_id UUID;

ALTER TABLE news_articles
  DROP CONSTRAINT IF EXISTS news_articles_content_channel_check;

ALTER TABLE news_articles
  ADD CONSTRAINT news_articles_content_channel_check
  CHECK (content_channel IN ('news', 'blog'));

CREATE INDEX IF NOT EXISTS idx_news_articles_auto_publish_queue
  ON news_articles (content_channel, status, auto_publish_approved, auto_publish_at)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN news_articles.auto_publish_approved IS
  'Standing owner authorization for scheduled publication of a controlled editorial Blog draft.';
