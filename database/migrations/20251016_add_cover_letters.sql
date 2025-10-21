-- Migration: add cover_letters table
-- Run this with psql: psql -h <host> -U <user> -d <db> -f 20251016_add_cover_letters.sql

CREATE TABLE IF NOT EXISTS cover_letters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    company VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',
    raw_job_text TEXT,
    parsed JSONB,
    config JSONB,
    generated_draft TEXT,
    variants JSONB,
    scheduled_send_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);

-- Update trigger to set updated_at on row modification (optional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cover_letters_update_updated_at') THEN
    CREATE OR REPLACE FUNCTION cover_letters_update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Attach trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cover_letters_updated_at'
  ) THEN
    CREATE TRIGGER trg_cover_letters_updated_at
    BEFORE UPDATE ON cover_letters
    FOR EACH ROW
    EXECUTE FUNCTION cover_letters_update_updated_at();
  END IF;
END $$;
