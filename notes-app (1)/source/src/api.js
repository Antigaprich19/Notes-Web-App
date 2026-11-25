import { supabase, isDemo } from './supabase.js';
import { localNotes } from './localStore.js';

async function request(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || '';

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}

const remoteApi = {
  list: (view, q) => request(`/notes?view=${view}&q=${encodeURIComponent(q || '')}`),
  create: (body) => request('/notes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};

export const api = isDemo ? localNotes : remoteApi;
