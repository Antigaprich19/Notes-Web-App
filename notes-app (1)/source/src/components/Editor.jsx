import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { api } from '../api.js';

export const COLORS = ['default', 'yellow', 'green', 'blue', 'pink', 'purple'];

const parseTags = (text) =>
  [...new Set(text.split(',').map((t) => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean))];

export default function Editor({ note, onSaved, onClose }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagText, setTagText] = useState(note.tags.join(', '));
  const [color, setColor] = useState(note.color);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState('Saved');
  const isFirstRender = useRef(true);

  const save = async () => {
    try {
      const saved = await api.update(note.id, { title, content, color, tags: parseTags(tagText) });
      onSaved(saved);
      setStatus('Saved');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Autosave 600ms after the user stops typing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setStatus('Saving…');
    const timer = setTimeout(save, 600);
    return () => clearTimeout(timer);
  }, [title, content, tagText, color]);

  const handleClose = async () => {
    await save(); // flush any pending edit before closing
    onClose();
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const html = DOMPurify.sanitize(marked.parse(content));

  return (
    <div className="overlay" onClick={handleClose}>
      <div className={`editor color-${color}`} onClick={(e) => e.stopPropagation()}>
        <input
          className="title-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="toolbar">
          <div className="swatches">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`swatch color-${c} ${c === color ? 'active' : ''}`}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
          <button className="link" onClick={() => setPreview(!preview)}>
            {preview ? 'Edit' : 'Preview markdown'}
          </button>
        </div>

        {preview ? (
          <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <textarea
            placeholder="Write something… (markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        <input
          className="tags-input"
          placeholder="Tags, separated by commas"
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
        />

        <div className="editor-footer">
          <small>{words} words · {status}</small>
          <button className="primary" onClick={handleClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
