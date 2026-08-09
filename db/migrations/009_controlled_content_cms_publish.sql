-- Links each governed content record to the real CMS article it publishes.
ALTER TABLE content_ops_article_records
  ADD COLUMN IF NOT EXISTS published_article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_ops_article_records_published_article
  ON content_ops_article_records (published_article_id)
  WHERE published_article_id IS NOT NULL;
