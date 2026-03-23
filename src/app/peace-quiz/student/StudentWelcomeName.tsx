'use client';

import { useEffect, useState } from 'react';
import { getAuthStorageKey, parseAuthSession } from '../../lib/auth';

export default function StudentWelcomeName() {
  const [username, setUsername] = useState('Student');

  useEffect(() => {
    const session = parseAuthSession(localStorage.getItem(getAuthStorageKey()));
    setUsername(session?.username || 'Student');
  }, []);

  return <p className="mt-3 text-slate-700">Welcome {username}</p>;
}
