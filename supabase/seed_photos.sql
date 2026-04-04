-- ============================================================
-- Seed: Photo Groups for Batch Salahuddin Al-Ayubi 2025–2026
-- Run this AFTER seed_activities.sql
-- IMPORTANT: Upload photos to Supabase Storage FIRST
-- See supabase/photo_seeds/ folder for organized photos
-- ============================================================

-- Step 1: Create photo group entries
-- (Replace the photo URLs after uploading to Supabase Storage bucket: kupsis-photos)

INSERT INTO photo_groups (name, description, date, cover_url, sort_order)
VALUES
  ('Program SULAM bersama UiTM',
   'Jun 2025 · Program motivasi akademik bersama UiTM untuk pelajar Batch SAA',
   '2025-06-15', NULL, 1),

  ('Perjumpaan KSIB dengan Pengurusan KUPSIS',
   'Julai 2025 · Sesi perjumpaan ahli KSIB dengan PK1, Penyelaras dan Penasihat Batch',
   '2025-07-20', NULL, 2),

  ('Bengkel SmartStudy – En. Osman Affan',
   'Ogos 2025 · Bengkel teknik belajar dan mengambil nota seharian oleh En. Osman Affan',
   '2025-08-09', NULL, 3),

  ('Kelas Tuisyen Matematik Sesi 1',
   'Ogos 2025 · Kelas Matematik dikendalikan oleh Dr. Salsabila, dihadiri 25 pelajar',
   '2025-08-15', NULL, 4),

  ('Kelas Tuisyen Biologi Sesi 1',
   'Oktober 2025 · Sesi tuisyen Biologi oleh Farhah (alumni KUPSIS) dan tutor luar',
   '2025-10-04', NULL, 5),

  ('Kelas Tuisyen Matematik & Add Math',
   'Oktober 2025 · Sesi kelas Math (Jumaat) dan Add Math (Sabtu) oleh tutor alumni',
   '2025-10-10', NULL, 6),

  ('Kelas Tuisyen Add Math – Alumni KUPSIS',
   'Oktober 2025 · Sesi Add Math di Perpustakaan KUPSIS oleh alumni',
   '2025-10-24', NULL, 7),

  ('Kelas Pelbagai Subjek – Siri Lanjutan',
   'Oktober–November 2025 · Siri lanjutan kelas tuisyen pelbagai subjek menjelang UASA',
   '2025-10-31', NULL, 8),

  ('Majlis Bacaan Yassin & Doa Selamat',
   'Januari 2026 · Majlis Yassin sempena BAP 2026 bersama Ustaz dari UUM',
   '2026-01-29', NULL, 9),

  ('AGM PIBG & Majlis Penyampaian Sijil KSIB',
   'Februari 2026 · AGM PIBG dan penyampaian sijil penghargaan ahli KSIB',
   '2026-02-22', NULL, 10),

  ('Majlis Iftar Waris & Pelajar Batch SAA',
   'Mac 2026 · Majlis iftar bersama waris dan pelajar sempena Ramadan 2026',
   '2026-03-14', NULL, 11),

  ('Program Penetapan Target SPM 2026',
   'April 2026 · Penetapan sasaran SPM 2026 bersama mentor',
   '2026-04-01', NULL, 12),

  ('Karnival Add Math Batch SAA',
   'April 2026 · Karnival Add Math 2 hari anjuran KUPSIS untuk Batch SAA',
   '2026-04-03', NULL, 13);

-- ============================================================
-- Step 2: After uploading photos to Supabase Storage, run:
-- INSERT INTO photos (group_id, url, caption, sort_order)
-- SELECT pg.id, 'https://[PROJECT].supabase.co/storage/v1/object/public/kupsis-photos/[path]', '', [order]
-- FROM photo_groups pg WHERE pg.name = '[group name]';
-- ============================================================
