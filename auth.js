import { supabase, isDemo } from './supabase.js';
import { localAuth } from './localStore.js';

// One auth interface for both modes: real Supabase Auth, or the browser-only demo.
const supabaseAuth = {
  async getSession() {
    return (await supabase.auth.getSession()).data.session;
  },
  onChange(cb) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
    return () => data.subscription.unsubscribe();
  },
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  },
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message, needsConfirm: !error && !data.session };
  },
  signOut() {
    return supabase.auth.signOut();
  },
};

export const auth = isDemo ? localAuth : supabaseAuth;
