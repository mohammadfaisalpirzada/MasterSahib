'use client';

import { useEffect, useState } from 'react';
import { fetchAuthSession } from '../../lib/auth';

export default function StudentWelcomeName() {
  const [username, setUsername] = useState('Student');

  useEffect(() => {
    const loadSession = async () => {
      const session = await fetchAuthSession();
      setUsername(session?.username || 'Student');
    };

    loadSession();
  }, []);

  return <p className="mt-3 text-slate-700">Welcome {username}</p>;
}
