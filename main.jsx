import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Show a readable message instead of a blank page if something crashes.
function showError(message) {
  const root = document.getElementById('root');
  if (root && !root.innerHTML.trim()) {
    root.innerHTML = `<div style="font-family:sans-serif;padding:24px;max-width:520px;margin:10vh auto;color:#9f1239">
      <h2>Something went wrong 🌸</h2><p>${String(message).replace(/</g, '&lt;')}</p></div>`;
  }
}
window.addEventListener('error', (e) => showError(e.message));
window.addEventListener('unhandledrejection', (e) => showError(e.reason?.message || e.reason));

createRoot(document.getElementById('root')).render(<App />);
