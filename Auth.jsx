import { useState } from 'react';
import { auth } from '../auth.js';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage({ type: '', text: '' });

    if (mode === 'login') {
      const { error } = await auth.signIn(email, password);
      if (error) setMessage({ type: 'error', text: error });
    } else {
      const { error, needsConfirm } = await auth.signUp(email, password);
      if (error) setMessage({ type: 'error', text: error });
      else if (needsConfirm) {
        setMessage({ type: 'ok', text: 'Account created! Check your email to confirm, then log in.' });
        setMode('login');
      }
    }
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">🌸</div>
        <h1>Blush Notes</h1>
        <p className="subtitle">Your cute little space for thoughts, ideas & to-dos.</p>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')} type="button">Log in</button>
          <button className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')} type="button">Sign up</button>
        </div>

        <form onSubmit={submit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {message.text && <p className={message.type === 'error' ? 'error' : 'success'}>{message.text}</p>}
          <button className="primary big" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
