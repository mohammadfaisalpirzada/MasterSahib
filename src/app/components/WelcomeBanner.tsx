'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { HiUser } from 'react-icons/hi';

const GUEST_KEY = 'ms_guest_name';

const getStoredName = () => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(GUEST_KEY) || '';
  } catch {
    return '';
  }
};

export default function WelcomeBanner() {
  const { data: session } = useSession();
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    setDeviceName(getStoredName());
  }, []);

  if (session?.user?.name) {
    return (
      <div className="border-b border-indigo-100/60 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70">
        <div className="mx-auto flex max-w-[1700px] items-center gap-2 px-4 py-1.5 sm:px-6 lg:px-10">
          <HiUser className="h-3.5 w-3.5 text-indigo-400" />
          <p className="text-sm text-slate-600">
            Welcome, <span className="font-semibold text-indigo-700">{session.user.name}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-indigo-100/60 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/70">
      <div className="mx-auto flex max-w-[1700px] items-center gap-2 px-4 py-1.5 sm:px-6 lg:px-10">
        <HiUser className="h-3.5 w-3.5 text-indigo-400" />
        <p className="text-sm text-slate-600">
          {deviceName ? (
            <>Hello, <span className="font-semibold text-indigo-700">{deviceName}</span></>
          ) : (
            'Hello there'
          )}
        </p>
      </div>
    </div>
  );
}
