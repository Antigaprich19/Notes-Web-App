import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode = no Supabase. Accounts + notes live in this browser's localStorage only.
// Turns on automatically when the env vars are missing, or force it with VITE_DEMO_MODE=true.
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' || !url || !key;

// Only the public URL + anon key live in the browser. Row Level Security protects the data.
export const supabase = isDemo ? null : createClient(url, key);
