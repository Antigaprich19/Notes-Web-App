import { useEffect, useMemo, useState } from 'react';
import { auth } from './auth.js';
import { isDemo } from './supabase.js';
import { api } from './api.js';
import NoteCard from './components/NoteCard.jsx';
import Editor from './components/Editor.jsx';

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [view, setView] = useState('active'); // 'active' | 'trash'
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const name = (user.email || 'friend').split('@')[0];

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleError = (err) => {
    if (err.message === 'UNAUTHORIZED') auth.signOut();
    else setError(err.message);
  };

  const load = async () => {
    try {
      setError('');
      setNotes(await api.list(view, query));
    } catch (err) {
      handleError(err);
    }
  };

  // Reload when view/search changes (search is debounced)
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [view, query]);

  const allTags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes]);
  const visible = activeTag ? notes.filter((n) => n.tags.includes(activeTag)) : notes;

  const patchLocal = (saved) =>
    setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));

  const createNote = async () => {
    try {
      const note = await api.create({});
      setNotes((prev) => [note, ...prev]);
      setEditing(note);
    } catch (err) {
      handleError(err);
    }
  };

  const act = (fn) => async (note) => {
    try {
      await fn(note);
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  const togglePin = act((n) => api.update(n.id, { pinned: !n.pinned }));
  const trash = act((n) => api.update(n.id, { deleted_at: new Date().toISOString() }));
  const restore = act((n) => api.update(n.id, { deleted_at: null }));
  const deleteForever = act((n) => {
    if (confirm('Delete this note forever?')) return api.remove(n.id);
  });

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="logo-sm">🌸</span>
          <div>
            <h1>Hi, {name}!</h1>
            <small>{view === 'active' ? `${notes.length} note${notes.length === 1 ? '' : 's'}` : 'Trash'}</small>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? '☀️' : '🌙'}</button>
          <button className="ghost" onClick={() => auth.signOut()}>Log out</button>
        </div>
      </header>

      {isDemo && <p className="demo-banner">Demo mode: your notes are saved in this browser only.</p>}

      <input
        className="search"
        placeholder="🔍  Search your notes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="bar">
        <div className="tabs">
          <button className={view === 'active' ? 'tab on' : 'tab'} onClick={() => setView('active')}>📝 Notes</button>
          <button className={view === 'trash' ? 'tab on' : 'tab'} onClick={() => setView('trash')}>🗑️ Trash</button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter">
          <button className={!activeTag ? 'chip on' : 'chip'} onClick={() => setActiveTag(null)}>All</button>
          {allTags.map((t) => (
            <button key={t} className={activeTag === t ? 'chip on' : 'chip'} onClick={() => setActiveTag(t)}>
              #{t}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {visible.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">{view === 'trash' ? '🧺' : '✨'}</div>
          <p>{view === 'trash' ? 'Trash is empty.' : 'No notes yet — tap the + to write your first one!'}</p>
        </div>
      ) : (
        <div className="grid">
          {visible.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              inTrash={view === 'trash'}
              onOpen={setEditing}
              onPin={togglePin}
              onTrash={trash}
              onRestore={restore}
              onDelete={deleteForever}
            />
          ))}
        </div>
      )}

      {view === 'active' && (
        <button className="fab" onClick={createNote} title="New note">＋</button>
      )}

      {editing && (
        <Editor
          key={editing.id}
          note={editing}
          onSaved={patchLocal}
          onClose={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
