// Browser-only "fake backend" used in demo mode. Everything is stored in localStorage,
// so data is temporary: it stays on this device/browser and is lost if site data is cleared.

const USERS_KEY = 'demo-users';
const SESSION_KEY = 'demo-session';

const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const listeners = new Set();
const emit = (session) => listeners.forEach((cb) => cb(session));

export const localAuth = {
  async getSession() {
    return read(SESSION_KEY, null);
  },

  onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  async signUp(email, password) {
    const users = read(USERS_KEY, []);
    const clean = email.trim().toLowerCase();
    if (users.some((u) => u.email === clean)) return { error: 'Email already registered' };

    const user = { id: crypto.randomUUID(), email: clean, hash: await sha256(password) };
    write(USERS_KEY, [...users, user]);

    const session = { user: { id: user.id, email: user.email } };
    write(SESSION_KEY, session);
    emit(session);
    return {};
  },

  async signIn(email, password) {
    const clean = email.trim().toLowerCase();
    const user = read(USERS_KEY, []).find((u) => u.email === clean);
    if (!user || user.hash !== (await sha256(password))) {
      return { error: 'Invalid email or password' };
    }
    const session = { user: { id: user.id, email: user.email } };
    write(SESSION_KEY, session);
    emit(session);
    return {};
  },

  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    emit(null);
  },
};

// Same shape as the real API (src/api.js), but stored locally per user.
const notesKey = () => `demo-notes-${read(SESSION_KEY, null)?.user?.id}`;

export const localNotes = {
  async list(view, q) {
    let notes = read(notesKey(), []).filter((n) => (view === 'trash' ? n.deleted_at : !n.deleted_at));
    const s = (q || '').trim().toLowerCase();
    if (s) notes = notes.filter((n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
    return notes.sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updated_at) - new Date(a.updated_at)
    );
  },

  async create(body) {
    const now = new Date().toISOString();
    const note = {
      id: crypto.randomUUID(), title: '', content: '', color: 'default', tags: [],
      pinned: false, deleted_at: null, created_at: now, updated_at: now, ...body,
    };
    write(notesKey(), [note, ...read(notesKey(), [])]);
    return note;
  },

  async update(id, body) {
    const notes = read(notesKey(), []);
    const i = notes.findIndex((n) => n.id === id);
    if (i < 0) throw new Error('Note not found');
    notes[i] = { ...notes[i], ...body, updated_at: new Date().toISOString() };
    write(notesKey(), notes);
    return notes[i];
  },

  async remove(id) {
    write(notesKey(), read(notesKey(), []).filter((n) => n.id !== id));
    return { ok: true };
  },
};
