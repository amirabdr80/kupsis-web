-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS homepage_posters (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title      text,
  image_url  text NOT NULL,
  is_active  boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE homepage_posters ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can read active posters
CREATE POLICY "Public read homepage_posters"
  ON homepage_posters FOR SELECT
  USING (true);

-- Any logged-in user can insert posters
CREATE POLICY "Auth insert homepage_posters"
  ON homepage_posters FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Any logged-in user can update posters
CREATE POLICY "Auth update homepage_posters"
  ON homepage_posters FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Any logged-in user can delete posters
CREATE POLICY "Auth delete homepage_posters"
  ON homepage_posters FOR DELETE
  USING (auth.role() = 'authenticated');
