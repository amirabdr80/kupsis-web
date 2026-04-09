-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (for countdown display)
CREATE POLICY "allow_public_read"
  ON site_settings FOR SELECT
  USING (true);

-- Only authenticated users can update settings
CREATE POLICY "allow_auth_write"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
