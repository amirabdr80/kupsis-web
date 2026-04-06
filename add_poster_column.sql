-- Jalankan SQL ini dalam Supabase SQL Editor (satu kali sahaja)
-- https://supabase.com/dashboard/project/ovfltfuljoxscknhntxg/sql/new

ALTER TABLE future_activities ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE past_activities   ADD COLUMN IF NOT EXISTS poster_url TEXT;
