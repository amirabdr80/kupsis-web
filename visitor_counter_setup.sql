-- ─────────────────────────────────────────────────────────────
-- VISITOR COUNTER SETUP
-- Run this once in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Seed the initial visitor_count row
INSERT INTO site_settings (key, value)
VALUES ('visitor_count', '0')
ON CONFLICT (key) DO NOTHING;

-- 2. Atomic increment function (returns new count)
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE site_settings
  SET value = (value::integer + 1)::text
  WHERE key = 'visitor_count'
  RETURNING value::integer INTO new_count;
  RETURN new_count;
END;
$$;

-- 3. Allow anonymous & authenticated users to call it
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO anon, authenticated;
