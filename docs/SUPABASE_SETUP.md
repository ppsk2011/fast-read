# Supabase Setup Guide

This guide explains how to set up a Supabase project for ReadSwift's authentication and metadata persistence features.

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- The ReadSwift repository cloned locally

## Steps

### 1. Create a Supabase Project

1. Log in to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Enter a name (e.g. `readswift`), choose a region, and set a database password
4. Wait for provisioning (~1 minute)

### 2. Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql` from this repository
3. Paste and run the SQL

This creates three tables:
- `user_files` — tracks per-file reading progress
- `user_preferences` — stores display and reading preferences
- `reading_sessions` — logs individual reading sessions per device

### 3. Enable Google OAuth

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for full instructions.

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```bash
cp .env.example .env
```

Find your values in the Supabase dashboard under **Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Verify

Run the app locally (`npm run dev`) and open the burger menu. You should see an **Account** section with a **Sign In with Google** button.

## Notes

- The app works fully without Supabase configured — auth features are simply hidden
- Only reading progress metadata is stored; file contents are never uploaded
- Row Level Security (RLS) is enabled on all tables so users can only access their own data
