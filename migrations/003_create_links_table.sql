-- Up Migration: 003_create_links_table
CREATE TABLE IF NOT EXISTS links (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    url_id VARCHAR(100) NOT NULL UNIQUE,
    click BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_links_url_id ON links (url_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links (user_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links (created_at DESC);

-- Down Migration
-- DROP TABLE IF EXISTS links CASCADE;
