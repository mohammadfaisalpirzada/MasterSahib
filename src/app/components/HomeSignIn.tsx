'use client';

import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function HomeSignIn() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleGoogleSignIn = () => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isGgssDomain = hostname === 'ggssnishtarroad.themastersahib.com' || hostname.startsWith('ggssnishtarroad.');

    if (isGgssDomain) {
      router.push('/auth/signin?callbackUrl=%2Fggss-nishtar-road');
      return;
    }

    void signIn('google');
  };

  if (session) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 dark:border-emerald-800 dark:bg-emerald-950/40">
        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          {session.user?.name || 'Signed in'}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="rounded-2xl border border-cyan-300 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
    >
      Sign in with Google
    </button>
  );
}
