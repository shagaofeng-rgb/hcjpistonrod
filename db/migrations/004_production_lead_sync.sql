ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS buyer_profile TEXT;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS email_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS attachment_metadata JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_form_submissions_ip_time
  ON form_submissions(ip_hash, submitted_at DESC)
  WHERE ip_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_form_submissions_status_time
  ON form_submissions(status, submitted_at DESC)
  WHERE archived_at IS NULL;
