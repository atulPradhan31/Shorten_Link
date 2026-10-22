-- Up Migration: 001_create_users_table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique case-insensitive index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(TRIM(email)));

-- Down Migration
-- DROP TABLE IF EXISTS users CASCADE;
