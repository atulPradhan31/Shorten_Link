-- Up Migration: 004_create_click_analytics_table
CREATE TABLE IF NOT EXISTS click_analytics (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    link_id VARCHAR(64) NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT
);

CREATE INDEX IF NOT EXISTS idx_click_analytics_link_id ON click_analytics (link_id);
CREATE INDEX IF NOT EXISTS idx_click_analytics_clicked_at ON click_analytics (clicked_at DESC);

-- Down Migration
-- DROP TABLE IF EXISTS click_analytics CASCADE;
