'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { HiUser } from 'react-icons/hi';

const GUEST_KEY = 'ms_guest_name';

const adjectives = [
  'Curious', 'Bright', 'Keen', 'Sharp', 'Swift', 'Eager', 'Bold', 'Calm',
  'Wise', 'Quick', 'Nice', 'Neat', 'Cool', 'Kind', 'Safe', 'True',
];

const nouns = [
  'Learner', 'Scholar', 'Thinker', 'Maker', 'Reader', 'Writer', 'Dreamer',
  'Explorer', 'Creator', 'Coder', 'Artist', 'Player', 'Helper', 'Buddy',
];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const getGuestName = () => {
  if (typeof window === 'undefined') return 'Guest';
  try {
    const stored = localStorage.getItem(GUEST_KEY);
    if (stored) return stored;
    const name = `${pick(adjectives)} ${pick(nouns)}`;
    localStorage.setItem(GUEST_KEY, name);
    return name;
  } catch {
    return 'Guest';
  }
};

export default function WelcomeBanner() {
  const { data: session } = useSession();
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    setGuestName(getGuestName());
  }, []);

  const displayName = session?.user?.name || guestName;
  const isGuest = !session?.user;

  if (!displayName) return null;

  return (
    <div className="border-b border-indigo-100/60 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70">
      <div className="mx-auto flex max-w-[1700px] items-center gap-2 px-4 py-1.5 sm:px-6 lg:px-10">
        <HiUser className="h-3.5 w-3.5 text-indigo-400" />
        <p className="text-sm text-slate-600">
          Welcome, <span className="font-semibold text-indigo-700">{displayName}</span>
          {isGuest ? (
            <span className="ml-1.5 text-xs text-slate-400">(guest)</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
