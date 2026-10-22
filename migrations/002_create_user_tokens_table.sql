-- Up Migration: 002_create_user_tokens_table
CREATE TABLE IF NOT EXISTS user_tokens (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_token ON user_tokens (token);

-- Down Migration
-- DROP TABLE IF EXISTS user_tokens CASCADE;
