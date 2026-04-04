# KUPSIS Web App — Setup & Deployment Guide

## Overview
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + file storage + auth)
- **Hosting**: Vercel

---

## Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and log in
2. Click **New Project**, name it `kupsis-spm2026`, choose a region (Singapore is closest)
3. Once project is ready, go to **SQL Editor** in the left sidebar
4. Click **New query**, paste the entire contents of `supabase/schema.sql`, then click **Run**
5. Go to **Storage** in the left sidebar → click **New bucket**
   - Name: `kupsis-photos`
   - Toggle **Public bucket** ON
   - Click **Save**
6. Go to **Project Settings** → **API**
   - Copy your **Project URL** → this is `VITE_SUPABASE_URL`
   - Copy your **anon public** key → this is `VITE_SUPABASE_ANON_KEY`

### Create Admin User
7. Go to **Authentication** → **Users** → click **Add user → Create new user**
   - Enter your email and a strong password
   - Click **Create User**
   - This will be your admin login for the dashboard

---

## Step 2 — Configure Environment Variables

Create a file named `.env` in the `kupsis-web/` folder (copy from `.env.example`):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with the ones from Step 1.

---

## Step 3 — Push to GitHub

In Terminal / Command Prompt, navigate to the `kupsis-web` folder and run:

```bash
git init
git add .
git commit -m "Initial commit — KUPSIS SPM 2026 dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kupsis-web.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.
> Create the repository at [github.com/new](https://github.com/new) first (name: `kupsis-web`, make it Private).

---

## Step 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New → Project**
3. Import your `kupsis-web` GitHub repository
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy** — Vercel will build and publish the app
6. Your dashboard is now live at `https://kupsis-web.vercel.app` (or your custom URL)

---

## Step 5 — Log In as Admin

1. Open your published URL
2. Click **Admin** in the top-right navigation
3. Enter the email and password you created in Step 1
4. You now have full access to add/edit/delete activities, photos, calendar events, and donations

---

## Adding Photos from the Existing `photos/` Folder

Since photos are now stored in Supabase Storage (not local files), you need to upload them:

1. Log in as admin and go to **Galeri Foto**
2. Click **Kumpulan Baru** to create a photo group
3. Click **Tambah Foto** to upload images directly from your computer
4. Alternatively, go to **Supabase → Storage → kupsis-photos** and drag-and-drop photos there

---

## Daily Use (Admin)

| Action | How |
|--------|-----|
| Add past activity | Go to Aktiviti Lepas → click **Tambah** |
| Add future activity | Go to Akan Datang → click **Tambah** |
| Edit calendar (PB/OT/LW) | Go to Kalendar → click any date (admin only) |
| Add photo group | Go to Galeri Foto → click **Kumpulan Baru** |
| Upload photos | Go to Galeri Foto → click **Tambah Foto** on any group |
| Record donation | Go to Tabung Infaq → click **Tambah Derma** |

---

## Custom Domain (Optional)

In Vercel, go to your project → **Settings → Domains** → add your own domain (e.g. `kupsis2026.com`).
