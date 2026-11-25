# Blush Notes 🌸

React (Vite) + JavaScript serverless backend (Vercel `/api`) + Supabase (Auth + Postgres).

## Features
- Email/password login & sign up (Supabase Auth) — each user sees only their own notes
- Create / edit / autosave notes, pin, color labels, tags + filter
- Search, markdown preview, trash with restore, dark mode, word count
- Pink theme 💗

## Setup
1. Supabase: run `supabase/schema.sql` in the SQL Editor (creates `notes` + Row Level Security).
2. Copy `.env.example` to `.env` and fill in the project URL and anon/publishable key.
3. `npm install`, then `npm i -g vercel`, then `npm run dev` (frontend + API together).
4. For easy testing, turn OFF "Confirm email" in Supabase > Authentication > Providers > Email.

## Deploy to Vercel
Push to GitHub, import in Vercel, add the same 2 env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), deploy.

## How security works
The backend forwards the user's login token to Supabase, so Row Level Security decides what each user can read or write. No secret keys are needed anywhere.
