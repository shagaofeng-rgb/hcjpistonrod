CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES product_categories_cms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  summary TEXT,
  description TEXT,
  image_id UUID,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  show_in_navigation BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  og_image_id UUID,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  original_name TEXT NOT NULL,
  safe_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  extension TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  category TEXT,
  checksum TEXT,
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS products_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_category_id UUID REFERENCES product_categories_cms(id),
  name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  short_description TEXT,
  full_description TEXT,
  selling_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  applications JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_image_id UUID REFERENCES media_assets(id),
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT,
  document_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  moq TEXT,
  lead_time TEXT,
  price_display TEXT NOT NULL DEFAULT 'quote',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  robots TEXT NOT NULL DEFAULT 'index,follow',
  og_title TEXT,
  og_description TEXT,
  og_image_id UUID REFERENCES media_assets(id),
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sitemap_enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products_cms(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  translation_status TEXT NOT NULL DEFAULT 'not_translated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, language_code),
  UNIQUE(language_code, slug)
);

CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  english_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES news_categories(id),
  title TEXT NOT NULL,
  english_title TEXT,
  slug TEXT NOT NULL UNIQUE,
  author TEXT,
  excerpt TEXT,
  body_html TEXT,
  cover_image_id UUID REFERENCES media_assets(id),
  image_alt TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_articles JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  view_count BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  robots TEXT NOT NULL DEFAULT 'index,follow',
  og_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_number TEXT NOT NULL UNIQUE,
  form_type TEXT NOT NULL,
  name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  message TEXT,
  related_product TEXT,
  source_page TEXT,
  page_url TEXT,
  source_channel TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  ip_hash TEXT,
  browser TEXT,
  device_type TEXT,
  submit_language TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  owner_id UUID REFERENCES admin_users(id),
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  page_url TEXT,
  content_type TEXT,
  content_slug TEXT,
  visitor_id_hash TEXT,
  session_id_hash TEXT,
  country TEXT,
  language TEXT,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  source_channel TEXT,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_status TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date DATE NOT NULL,
  dimension TEXT NOT NULL,
  dimension_value TEXT NOT NULL,
  page_views BIGINT NOT NULL DEFAULT 0,
  unique_visitors BIGINT NOT NULL DEFAULT 0,
  sessions BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(summary_date, dimension, dimension_value)
);

CREATE TABLE IF NOT EXISTS seo_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  page_url TEXT,
  keyword TEXT,
  country TEXT,
  device TEXT,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  ctr NUMERIC(8,4),
  average_position NUMERIC(8,2),
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  page_url TEXT NOT NULL,
  suggestion TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  owner_id UUID REFERENCES admin_users(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fixed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  config_status TEXT NOT NULL DEFAULT 'not_configured',
  connection_status TEXT NOT NULL DEFAULT 'unknown',
  schedule_cron TEXT,
  last_success_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sync_sources(id) ON DELETE SET NULL,
  job_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued',
  mode TEXT NOT NULL DEFAULT 'incremental',
  cursor_value TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES sync_jobs(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  object_type TEXT,
  object_id TEXT,
  before_summary JSONB,
  after_summary JSONB,
  ip_address TEXT,
  user_agent TEXT,
  result TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  file_id UUID REFERENCES media_assets(id),
  total_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_report_id UUID REFERENCES media_assets(id),
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_id UUID REFERENCES media_assets(id),
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_cms_status ON products_cms(status);
CREATE INDEX IF NOT EXISTS idx_products_cms_category ON products_cms(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_products_cms_published ON products_cms(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(email);
CREATE INDEX IF NOT EXISTS idx_form_submissions_country ON form_submissions(country);
CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_daily_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_date_keyword ON seo_metrics(metric_date, keyword);
CREATE INDEX IF NOT EXISTS idx_seo_issues_status ON seo_issues(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

INSERT INTO admin_roles (code, name, description, is_system)
VALUES
  ('super_admin', '超级管理员', '拥有全部后台权限', true),
  ('admin', '管理员', '管理内容、线索和基础设置', true),
  ('editor', '内容编辑', '管理产品和新闻内容', true),
  ('marketing', '市场人员', '查看分析和SEO数据，管理营销内容', true),
  ('sales', '销售人员', '查看和跟进客户表单', true),
  ('analyst', '数据分析人员', '查看访问分析和SEO表现', true),
  ('readonly', '只读用户', '只读查看后台数据', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO admin_permissions (code, module, action, name)
VALUES
  ('dashboard.view', 'dashboard', 'view', '查看数据概览'),
  ('products.view', 'products', 'view', '查看产品'),
  ('products.create', 'products', 'create', '新增产品'),
  ('products.edit', 'products', 'edit', '编辑产品'),
  ('products.delete', 'products', 'delete', '删除产品'),
  ('products.publish', 'products', 'publish', '发布产品'),
  ('categories.manage', 'categories', 'manage', '管理产品分类'),
  ('news.manage', 'news', 'manage', '管理新闻'),
  ('leads.manage', 'leads', 'manage', '管理客户表单'),
  ('analytics.view', 'analytics', 'view', '查看访问分析'),
  ('seo.manage', 'seo', 'manage', '管理SEO数据'),
  ('media.manage', 'media', 'manage', '管理媒体库'),
  ('users.manage', 'users', 'manage', '管理用户与权限'),
  ('audit.view', 'audit', 'view', '查看操作日志'),
  ('settings.manage', 'settings', 'manage', '管理系统设置'),
  ('sync.manage', 'sync', 'manage', '管理数据同步'),
  ('exports.run', 'exports', 'run', '执行数据导出')
ON CONFLICT (code) DO NOTHING;

INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.code = 'super_admin'
ON CONFLICT DO NOTHING;
