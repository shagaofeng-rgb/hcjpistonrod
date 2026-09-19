-- Additive indexes for enterprise analytics filters and visitor timeline lookups.
-- Existing production records are preserved unchanged.
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_site_country_last_seen ON analytics_visitors(site_id, country, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_site_channel_last_seen ON analytics_visitors(site_id, source_channel, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_site_classification_last_seen ON analytics_visitors(site_id, classification, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_site_device_last_seen ON analytics_visitors(site_id, device_type, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_site_name_time ON analytics_events(site_id, event_name, occurred_at DESC);
