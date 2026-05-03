'use client';

import { signIn, signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function SignInPageContent() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isGgssDomain = hostname === 'ggssnishtarroad.themastersahib.com' || hostname.startsWith('ggssnishtarroad.');
  const requestedCallback = searchParams?.get('callbackUrl') || '';
  const globalSignout = searchParams?.get('globalSignout') === '1';
  const requestedReturnTo = searchParams?.get('returnTo') || '';

  const toSafeSameHostPath = (input: string) => {
    if (!input) {
      return '/';
    }

    if (input.startsWith('/')) {
      return input;
    }

    try {
      const parsed = new URL(input);
      if (parsed.hostname.toLowerCase() !== hostname) {
        return '/';
      }

      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return '/';
    }
  };

  const isUnsafeAuthPath = (path: string) => path.startsWith('/auth/signin') || path.startsWith('/api/auth');

  const callbackUrl = (() => {
    if (!requestedCallback) {
      return isGgssDomain ? '/ggss-nishtar-road' : '/';
    }

    if (!isGgssDomain) {
      const sameHostPath = toSafeSameHostPath(requestedCallback);
      if (isUnsafeAuthPath(sameHostPath)) {
        return '/';
      }
      return sameHostPath;
    }

    // Prevent cross-host callback loops on GGSS subdomain.
    if (requestedCallback.startsWith('/ggss-nishtar-road')) {
      return requestedCallback;
    }

    if (isUnsafeAuthPath(requestedCallback)) {
      return '/ggss-nishtar-road';
    }

    const sameHostPath = toSafeSameHostPath(requestedCallback);
    if (isUnsafeAuthPath(sameHostPath)) {
      return '/ggss-nishtar-road';
    }

    if (sameHostPath.startsWith('/ggss-nishtar-road')) {
      return sameHostPath;
    }

    return '/ggss-nishtar-road';
  })();
  const [isLoading, setIsLoading] = useState(false);
  const globalSignOutStartedRef = useRef(false);
  const isGgssCallback = callbackUrl.startsWith('/ggss-nishtar-road');

  const returnToAfterGlobalSignout = (() => {
    if (!requestedReturnTo) {
      return '/';
    }

    if (requestedReturnTo.startsWith('/')) {
      return requestedReturnTo;
    }

    try {
      const parsed = new URL(requestedReturnTo);
      const safeHost = parsed.hostname.toLowerCase();
      const isAllowedHost =
        safeHost === 'themastersahib.com' ||
        safeHost === 'www.themastersahib.com' ||
        safeHost === 'ggssnishtarroad.themastersahib.com' ||
        safeHost.endsWith('.themastersahib.com') ||
        safeHost === 'localhost' ||
        safeHost === '127.0.0.1';

      if (!isAllowedHost) {
        return '/';
      }

      return parsed.toString();
    } catch {
      return '/';
    }
  })();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  useEffect(() => {
    if (!globalSignout || globalSignOutStartedRef.current) {
      return;
    }

    globalSignOutStartedRef.current = true;
    setIsLoading(true);

    void signOut({ redirect: false }).finally(() => {
      window.location.href = returnToAfterGlobalSignout;
    });
  }, [globalSignout, returnToAfterGlobalSignout]);

  if (status === 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center text-slate-600 shadow-2xl">
          Redirecting...
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl }, { prompt: 'select_account' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {globalSignout ? 'Signing You Out' : isGgssCallback ? 'GGSS Nishtar Road' : 'The Master Sahib'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {globalSignout
              ? 'Please wait while we clear your main account session.'
              : isGgssCallback
                ? 'Secure Google sign-in required for staff portal access'
                : 'Sign in to your account to continue'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || globalSignout}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {globalSignout ? 'Signing out...' : isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="text-center text-xs text-slate-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center text-slate-600 shadow-2xl">
        Loading sign in page...
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInPageContent />
    </Suspense>
  );
}
