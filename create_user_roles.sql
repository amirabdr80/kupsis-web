-- ═══════════════════════════════════════════════════════════════
-- Jalankan SQL ini dalam Supabase SQL Editor (satu kali sahaja)
-- https://supabase.com/dashboard/project/ovfltfuljoxscknhntxg/sql/new
-- ═══════════════════════════════════════════════════════════════

-- 1. Buat jadual user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'champion', -- 'admin' | 'champion'
  subjects    text[] DEFAULT '{}',             -- ['matematik', 'fizik', ...]
  can_gallery boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- 2. Aktifkan RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Setiap user boleh baca rekod sendiri sahaja
CREATE POLICY "user_roles: self read"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Benarkan service role (admin scripts) buat semua operasi
CREATE POLICY "user_roles: service full access"
  ON public.user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
