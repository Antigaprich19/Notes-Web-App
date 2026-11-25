import { useEffect, useState } from 'react';
import { auth } from './auth.js';
import Auth from './components/Auth.jsx';
import Notes from './Notes.jsx';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    auth.getSession().then(setSession);
    return auth.onChange(setSession);
  }, []);

  if (session === undefined) return <div className="splash">🌸</div>;
  if (!session) return <Auth />;
  return <Notes user={session.user} />;
}
