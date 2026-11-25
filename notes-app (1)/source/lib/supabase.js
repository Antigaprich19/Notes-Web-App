import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Builds a Supabase client that acts AS the logged-in user (their JWT is forwarded),
// so Row Level Security in the database decides what they can see.
// Sends a 401 and returns null if the token is missing or invalid.
export async function getUserClient(req, res) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'Not logged in' });
    return null;
  }

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401).json({ error: 'Session expired, please log in again' });
    return null;
  }
  return client;
}
