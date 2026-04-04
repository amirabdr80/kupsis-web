-- ================================================================
-- KUPSIS Road to SPM 2026 — Supabase Schema
-- Safe to re-run: drops existing policies before recreating them
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ================================================================

-- ── Tables ───────────────────────────────────────────────────────

create table if not exists past_activities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  date         date,
  time         text,
  place        text,
  participants text,
  cost         text,
  organiser    text default 'KSIB SAA',
  status       text default 'Selesai',
  sort_order   int  default 0,
  created_at   timestamptz default now()
);

create table if not exists future_activities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  date         text,
  time         text,
  place        text,
  participants text,
  cost         text,
  organiser    text default 'KSIB SAA',
  status       text default 'Dirancang',
  sort_order   int  default 0,
  created_at   timestamptz default now()
);

create table if not exists photo_groups (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  event_date date,
  sort_order int  default 0,
  created_at timestamptz default now()
);

create table if not exists photos (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid references photo_groups(id) on delete cascade,
  storage_path text not null,
  sort_order   int  default 0,
  created_at   timestamptz default now()
);

create table if not exists calendar_overrides (
  date  date primary key,
  pb    boolean default false,
  ot    boolean default false,
  lw    boolean default false,
  cuti  boolean default false
);

create table if not exists donations (
  id         uuid primary key default gen_random_uuid(),
  donor_name text,
  amount     numeric(10,2) not null,
  date       date default current_date,
  note       text,
  created_at timestamptz default now()
);

-- ── Enable RLS ───────────────────────────────────────────────────

alter table past_activities    enable row level security;
alter table future_activities  enable row level security;
alter table photo_groups       enable row level security;
alter table photos             enable row level security;
alter table calendar_overrides enable row level security;
alter table donations          enable row level security;

-- ── Drop existing policies (safe re-run) ─────────────────────────

drop policy if exists "Public read past_activities"    on past_activities;
drop policy if exists "Admin insert past_activities"   on past_activities;
drop policy if exists "Admin update past_activities"   on past_activities;
drop policy if exists "Admin delete past_activities"   on past_activities;

drop policy if exists "Public read future_activities"  on future_activities;
drop policy if exists "Admin insert future_activities" on future_activities;
drop policy if exists "Admin update future_activities" on future_activities;
drop policy if exists "Admin delete future_activities" on future_activities;

drop policy if exists "Public read photo_groups"       on photo_groups;
drop policy if exists "Admin insert photo_groups"      on photo_groups;
drop policy if exists "Admin update photo_groups"      on photo_groups;
drop policy if exists "Admin delete photo_groups"      on photo_groups;

drop policy if exists "Public read photos"             on photos;
drop policy if exists "Admin insert photos"            on photos;
drop policy if exists "Admin update photos"            on photos;
drop policy if exists "Admin delete photos"            on photos;

drop policy if exists "Public read calendar_overrides" on calendar_overrides;
drop policy if exists "Admin insert calendar_overrides" on calendar_overrides;
drop policy if exists "Admin update calendar_overrides" on calendar_overrides;
drop policy if exists "Admin delete calendar_overrides" on calendar_overrides;

drop policy if exists "Public read donations"          on donations;
drop policy if exists "Admin insert donations"         on donations;
drop policy if exists "Admin update donations"         on donations;
drop policy if exists "Admin delete donations"         on donations;

-- ── Row Level Security policies ───────────────────────────────────

-- Public read
create policy "Public read past_activities"    on past_activities    for select using (true);
create policy "Public read future_activities"  on future_activities  for select using (true);
create policy "Public read photo_groups"       on photo_groups       for select using (true);
create policy "Public read photos"             on photos             for select using (true);
create policy "Public read calendar_overrides" on calendar_overrides for select using (true);
create policy "Public read donations"          on donations          for select using (true);

-- Admin write (authenticated users only)
create policy "Admin insert past_activities"    on past_activities    for insert with check (auth.role() = 'authenticated');
create policy "Admin update past_activities"    on past_activities    for update using     (auth.role() = 'authenticated');
create policy "Admin delete past_activities"    on past_activities    for delete using     (auth.role() = 'authenticated');

create policy "Admin insert future_activities"  on future_activities  for insert with check (auth.role() = 'authenticated');
create policy "Admin update future_activities"  on future_activities  for update using     (auth.role() = 'authenticated');
create policy "Admin delete future_activities"  on future_activities  for delete using     (auth.role() = 'authenticated');

create policy "Admin insert photo_groups"       on photo_groups       for insert with check (auth.role() = 'authenticated');
create policy "Admin update photo_groups"       on photo_groups       for update using     (auth.role() = 'authenticated');
create policy "Admin delete photo_groups"       on photo_groups       for delete using     (auth.role() = 'authenticated');

create policy "Admin insert photos"             on photos             for insert with check (auth.role() = 'authenticated');
create policy "Admin update photos"             on photos             for update using     (auth.role() = 'authenticated');
create policy "Admin delete photos"             on photos             for delete using     (auth.role() = 'authenticated');

create policy "Admin insert calendar_overrides" on calendar_overrides for insert with check (auth.role() = 'authenticated');
create policy "Admin update calendar_overrides" on calendar_overrides for update using     (auth.role() = 'authenticated');
create policy "Admin delete calendar_overrides" on calendar_overrides for delete using     (auth.role() = 'authenticated');

create policy "Admin insert donations"          on donations          for insert with check (auth.role() = 'authenticated');
create policy "Admin update donations"          on donations          for update using     (auth.role() = 'authenticated');
create policy "Admin delete donations"          on donations          for delete using     (auth.role() = 'authenticated');

-- ================================================================
-- Storage policies for bucket "kupsis-photos"
-- Run AFTER creating the bucket in Storage UI
-- ================================================================

drop policy if exists "Public view photos"  on storage.objects;
drop policy if exists "Admin upload photos" on storage.objects;
drop policy if exists "Admin delete photos" on storage.objects;

create policy "Public view photos"
  on storage.objects for select
  using ( bucket_id = 'kupsis-photos' );

create policy "Admin upload photos"
  on storage.objects for insert
  with check ( bucket_id = 'kupsis-photos' and auth.role() = 'authenticated' );

create policy "Admin delete photos"
  on storage.objects for delete
  using ( bucket_id = 'kupsis-photos' and auth.role() = 'authenticated' );
