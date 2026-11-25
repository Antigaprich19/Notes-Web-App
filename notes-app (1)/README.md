# Blush Notes 🌸

One zip, two parts:

- `index.html` + `assets/`  → the READY-TO-DEPLOY website (already built, demo mode).
  Drag this whole zip to https://vercel.com/drop and it works. Sign up / login / notes
  are saved in the browser only (temporary).
- `source/`  → the full-stack source code: React frontend (`src/`), JavaScript backend
  (`api/`, `lib/`), and the Supabase database schema (`supabase/schema.sql`).
  It is real code. The deployed demo just runs with the backend switched off.

To run the real full-stack version, see `source/README.md`.
