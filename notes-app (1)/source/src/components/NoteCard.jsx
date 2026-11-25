export default function NoteCard({ note, inTrash, onOpen, onPin, onTrash, onRestore, onDelete }) {
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <div className={`card color-${note.color}`} onClick={() => !inTrash && onOpen(note)}>
      <div className="card-top">
        <h3>{note.title || 'Untitled'}</h3>
        {!inTrash && (
          <button className={`icon ${note.pinned ? 'on' : ''}`} onClick={stop(() => onPin(note))} title="Pin">
            📌
          </button>
        )}
      </div>
      <p className="snippet">{note.content.slice(0, 140) || 'Empty note'}</p>
      {note.tags.length > 0 && (
        <div className="tags">
          {note.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
        </div>
      )}
      <div className="card-actions">
        <small>{new Date(note.updated_at).toLocaleDateString()}</small>
        {inTrash ? (
          <span>
            <button className="link" onClick={stop(() => onRestore(note))}>Restore</button>
            <button className="link danger" onClick={stop(() => onDelete(note))}>Delete forever</button>
          </span>
        ) : (
          <button className="link danger" onClick={stop(() => onTrash(note))}>Trash</button>
        )}
      </div>
    </div>
  );
}
