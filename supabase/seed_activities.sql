-- ============================================================
-- Seed: Past Activities for Batch Salahuddin Al-Ayubi 2025–2026
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

-- Clear existing data first (optional — comment out if you want to keep existing rows)
-- TRUNCATE TABLE past_activities RESTART IDENTITY CASCADE;

INSERT INTO past_activities
  (name, description, date, time, place, participants, cost, organiser, status, sort_order)
VALUES

-- 1. Program SULAM bersama UiTM (Jun 2025)
(
  'Program SULAM bersama UiTM',
  'Program SULAM (Student Linkage Academic Motivation) bersama UiTM untuk pelajar Batch Salahuddin Al-Ayubi. Aktiviti motivasi dan akademik bersama pelajar universiti.',
  '2025-06-15', '', 'KUPSIS',
  'Pelajar Batch Salahuddin Al-Ayubi',
  '', 'KUPSIS / UiTM', 'Selesai', 1
),

-- 2. Karnival STEM (Jul 2025)
(
  'Karnival STEM',
  'Karnival STEM anjuran pihak sekolah KUPSIS untuk mendedahkan pelajar kepada bidang sains, teknologi, kejuruteraan dan matematik.',
  '2025-07-12', '9:00 AM – 4:00 PM', 'KUPSIS',
  'Pelajar Batch Salahuddin Al-Ayubi',
  '', 'KUPSIS', 'Selesai', 2
),

-- 3. Perjumpaan KSIB dengan Pengurusan KUPSIS (Jul 2025)
(
  'Perjumpaan KSIB dengan Pengurusan KUPSIS',
  'Sesi perjumpaan pertama antara ahli KSIB Batch Salahuddin Al-Ayubi dengan pengurusan sekolah KUPSIS, termasuk PK1, Penyelaras dan Penasihat Batch.',
  '2025-07-20', '11:30 AM', 'Bilik Mesyuarat, KUPSIS',
  'Ahli KSIB Batch SAA, Pengurusan KUPSIS',
  '', 'KSIB Batch SAA', 'Selesai', 3
),

-- 4. Bengkel SmartStudy – Teknik Belajar oleh En. Osman Affan (Aug 2025)
(
  'Bengkel SmartStudy – Teknik Belajar oleh En. Osman Affan',
  'Bengkel teknik belajar dan mengambil nota sehari penuh oleh penceramah En. Osman Affan. Dibiayai oleh PIBG (RM3,000). Termasuk sesi pagi dan petang untuk semua pelajar Batch SAA.',
  '2025-08-09', '9:30 AM – 5:30 PM', 'Bilik Math, KUPSIS',
  'Pelajar Batch Salahuddin Al-Ayubi',
  'RM 3,000 (ditanggung PIBG)', 'KSIB SAA / KUPSIS', 'Selesai', 4
),

-- 5. Kelas Matematik Sesi 1 – Dr. Salsabila (Aug 2025)
(
  'Kelas Tuisyen Matematik Sesi 1',
  'Sesi pertama kelas tuisyen Matematik dikendalikan oleh Dr. Salsabila (waris Batch SAA). Dihadiri oleh 25 orang murid Batch SAA.',
  '2025-08-15', '8:00 PM – 10:00 PM', 'KUPSIS',
  '25 pelajar Batch SAA',
  'RM 23/pelajar', 'KSIB SAA', 'Selesai', 5
),

-- 6. Kelas Tuisyen Biologi Sesi 1 (Okt 2025)
(
  'Kelas Tuisyen Biologi Sesi 1',
  'Sesi pertama kelas tuisyen Biologi untuk pelajar Batch SAA, dikendalikan oleh Farhah (alumni KUPSIS) bersama tutor luar. Tiga sesi selari mengikut kumpulan.',
  '2025-10-04', '9:30 AM – 5:00 PM', 'KUPSIS',
  'Pelajar Batch SAA',
  '', 'KSIB SAA', 'Selesai', 6
),

-- 7. Kelas Tuisyen Matematik & Add Math (Okt 2025)
(
  'Kelas Tuisyen Matematik & Add Math',
  'Sesi kelas tuisyen Matematik (Jumaat) dan Add Math (Sabtu) anjuran KSIB SAA dengan tutor Cikgu Alam dan alumni KUPSIS. Dihadiri oleh lebih 20 pelajar setiap sesi.',
  '2025-10-10', '4:00 PM – 7:00 PM', 'KUPSIS',
  'Lebih 20 pelajar Batch SAA',
  'RM 23–38/pelajar', 'KSIB SAA', 'Selesai', 7
),

-- 8. Kelas Tuisyen Add Math oleh Alumni (Okt 2025)
(
  'Kelas Tuisyen Add Math – Alumni KUPSIS',
  'Sesi kelas tuisyen Add Math dijalankan oleh alumni KUPSIS di Perpustakaan KUPSIS. Pelajar dibahagikan kepada kumpulan mengikut tahap penguasaan.',
  '2025-10-24', '7:00 PM – 10:00 PM', 'Perpustakaan, KUPSIS',
  'Pelajar Batch SAA',
  '', 'KSIB SAA', 'Selesai', 8
),

-- 9. Kelas Tuisyen Add Math Sesi Lanjutan (Okt–Nov 2025)
(
  'Kelas Tuisyen Pelbagai Subjek – Siri Lanjutan',
  'Siri lanjutan kelas tuisyen untuk subjek Matematik, Add Math, Biologi dan Fizik menjelang UASA dan akhir tahun 2025. Dikendalikan oleh tutor alumni dan luar.',
  '2025-10-31', '', 'KUPSIS',
  'Pelajar Batch SAA',
  '', 'KSIB SAA', 'Selesai', 9
),

-- 10. Majlis Bacaan Yassin & Doa Selamat (Jan 2026)
(
  'Majlis Bacaan Yassin & Doa Selamat',
  'Majlis bacaan Yassin dan doa selamat sempena permulaan tahun persekolahan 2026 (BAP 2026). Dihadiri oleh pelajar dan waris Batch SAA bersama Ustaz dari UUM sebagai imam. Disertai sesi interaksi waris bersama guru-guru mata pelajaran.',
  '2026-01-29', '8:00 AM', 'Surau KUPSIS',
  'Pelajar & Waris Batch SAA',
  '', 'KSIB SAA / KUPSIS', 'Selesai', 10
),

-- 11. AGM PIBG & Penyampaian Sijil KSIB (Feb 2026)
(
  'Mesyuarat Agung Tahunan PIBG & Majlis Penyampaian Sijil KSIB',
  'AGM PIBG KUPSIS 2026 dan majlis penyampaian sijil penghargaan kepada ahli KSIB Batch Salahuddin Al-Ayubi atas sumbangan dan khidmat kepada batch.',
  '2026-02-22', '', 'KUPSIS',
  'Ahli KSIB, Waris Batch SAA, Pengurusan KUPSIS',
  '', 'PIBG KUPSIS / KSIB SAA', 'Selesai', 11
),

-- 12. Majlis Iftar Waris & Pelajar (Mac 2026)
(
  'Majlis Iftar Waris & Pelajar Batch SAA',
  'Majlis iftar bersama antara pelajar dan waris Batch Salahuddin Al-Ayubi sempena bulan Ramadan 2026. Diadakan di kawasan court volleyball KUPSIS dengan pelbagai hidangan sumbangan waris.',
  '2026-03-14', '6:30 PM', 'KUPSIS',
  'Pelajar & Waris Batch SAA',
  '', 'KSIB SAA / KUPSIS', 'Selesai', 12
),

-- 13. Program Penetapan Target SPM 2026 (Apr 2026)
(
  'Program Penetapan Target SPM 2026 bersama Mentor',
  'Program rasmi sekolah untuk menetapkan sasaran dan target peperiksaan SPM 2026 bagi setiap pelajar Batch Salahuddin Al-Ayubi bersama mentor masing-masing.',
  '2026-04-01', '', 'KUPSIS',
  'Pelajar Batch SAA',
  '', 'KUPSIS', 'Selesai', 13
),

-- 14. Karnival Add Math (Apr 2026)
(
  'Karnival Add Math Batch SAA',
  'Karnival Add Math selama 2 hari (3–4 April 2026) anjuran sekolah untuk pelajar Batch Salahuddin Al-Ayubi. Waris KSIB turut hadir menyediakan makanan dan minuman segar untuk pelajar.',
  '2026-04-03', '8:00 AM – 5:00 PM', 'KUPSIS',
  'Pelajar Batch SAA',
  '', 'KUPSIS / KSIB SAA', 'Selesai', 14
);
