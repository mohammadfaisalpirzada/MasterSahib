'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { IoLogOutOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const AUTH_SOURCE_KEY = 'ggss_auth_source';

const DASHBOARD_ITEMS = [
  {
    title: 'Open Staff Data',
    href: '/teachers-data?from=staff-portal',
    variant: 'primary' as const,
  },
  {
    title: 'Admin Dashboard',
    href: '/ggss-nishtar-road/admin',
    variant: 'secondary' as const,
  },
  {
    title: 'Students Stipend Record',
    href: '/ggss-nishtar-road/stipend',
    variant: 'tertiary' as const,
  },
];

export default function StaffPortalPage() {
  const { status, data } = useSession();

  const firstName = useMemo(() => {
    const full = data?.user?.name?.trim() || '';
    if (!full) return 'Staff';
    return full.split(' ')[0] || 'Staff';
  }, [data?.user?.name]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    try {
      const source = sessionStorage.getItem(AUTH_SOURCE_KEY);
      if (!source) {
        // If we are already authenticated before subdomain-triggered sign-in,
        // treat session as coming from main site/shared auth.
        sessionStorage.setItem(AUTH_SOURCE_KEY, 'main');
      }
    } catch {
      // Ignore storage errors.
    }
  }, [status]);

  const handlePortalSignOut = async () => {
    let source = 'subdomain';
    try {
      source = sessionStorage.getItem(AUTH_SOURCE_KEY) || 'subdomain';
      sessionStorage.removeItem(AUTH_SOURCE_KEY);
    } catch {
      // Ignore storage errors.
    }

    if (source === 'main' && typeof window !== 'undefined') {
      await signOut({ redirect: false });

      const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const mainSiteBase = isLocalHost ? window.location.origin : 'https://themastersahib.com';
      const returnTo = encodeURIComponent(`${window.location.origin}/ggss-nishtar-road/staff-portal?signedOut=1`);
      window.location.href = `${mainSiteBase}/auth/signin?globalSignout=1&returnTo=${returnTo}`;
      return;
    }

    await signOut({ callbackUrl: '/ggss-nishtar-road/staff-portal' });
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4" style={{ background: '#f0f4f8' }}>
        <div className="w-full max-w-md rounded-3xl border p-8 text-center" style={{ background: '#fff', borderColor: '#dce3ec', boxShadow: '0 10px 36px rgba(26,58,107,0.12)' }}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(26,58,107,0.08)' }}>
            <IoShieldCheckmarkOutline size={24} color="#1a3a6b" />
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: '#0f2347' }}>Secure Staff Access</h1>
          <p className="mt-2 text-sm" style={{ color: '#64748b' }}>
            Google sign-in required. Click continue to authenticate securely.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem(AUTH_SOURCE_KEY, 'subdomain');
              } catch {
                // Ignore storage errors.
              }
              void signIn('google', { callbackUrl: '/ggss-nishtar-road/staff-portal' }, { prompt: 'select_account' });
            }}
            className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #1a3a6b, #2356a4)' }}
          >
            Continue with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #0f2347 100%)', borderBottom: '4px solid #c8a96e' }}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/ggssnishtar_mastersahib.png"
              alt="GGSS logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              <p className="uppercase" style={{ color: '#c8a96e', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em' }}>
                School Staff Portal
              </p>
              <p style={{ color: '#fff', fontSize: '18px', fontWeight: 800, lineHeight: 1.2 }}>
                GGSS Nishtar Road
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data?.user ? (
              <div className="hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 sm:inline-flex" style={{ borderColor: 'rgba(200,169,110,0.45)', background: 'rgba(200,169,110,0.08)' }}>
                {data.user.image ? (
                  <img
                    src={data.user.image}
                    alt={data.user.name || 'User profile'}
                    className="h-7 w-7 rounded-full border object-cover"
                    style={{ borderColor: 'rgba(200,169,110,0.5)' }}
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold" style={{ background: '#1a3a6b', color: '#c8a96e' }}>
                    {firstName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[140px] truncate text-xs font-semibold" style={{ color: '#f8fafc' }}>
                  {data.user.name || 'Signed in user'}
                </span>
              </div>
            ) : null}
            <Link
              href="/ggss-nishtar-road"
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: 'rgba(200,169,110,0.45)', color: '#c8a96e' }}
            >
              School Website
            </Link>
            <button
              type="button"
              onClick={handlePortalSignOut}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: 'rgba(200,169,110,0.45)', color: '#c8a96e' }}
            >
              <IoLogOutOutline size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2 md:py-10">
        <div className="rounded-3xl border p-5 sm:p-7" style={{ background: '#fff', borderColor: '#dce3ec', boxShadow: '0 8px 30px rgba(26,58,107,0.08)' }}>
          <p className="inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#0d7494', borderColor: '#9ed8ea', background: '#e6f7fc' }}>
            School Staff Portal
          </p>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.03]" style={{ color: '#0f1737' }}>
            GGSS Nishtar Road
            <br />
            <span style={{ color: '#167896' }}>Staff Management Portal</span>
          </h1>

          <p className="mt-5 max-w-xl text-[20px] leading-relaxed" style={{ color: '#475569' }}>
            Manage staff records in one place. View profiles, update entries, and maintain stipend records with controlled access.
          </p>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: '#64748b' }}>
            Centralized records for GGSS Nishtar Road
          </p>

          <p className="mt-2 text-xs" style={{ color: '#64748b' }}>
            Logged in as {firstName}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {DASHBOARD_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border px-6 py-3 text-base font-bold transition"
                style={
                  item.variant === 'primary'
                    ? {
                        color: '#fff',
                        borderColor: '#0c8fb0',
                        background: 'linear-gradient(135deg, #0a9cc0, #0d7ca3)',
                        boxShadow: '0 8px 18px rgba(13,124,163,0.24)',
                      }
                    : item.variant === 'secondary'
                      ? {
                          color: '#1e293b',
                          borderColor: '#cbd5e1',
                          background: '#fff',
                        }
                      : {
                          color: '#065f46',
                          borderColor: '#86efac',
                          background: '#ecfdf5',
                        }
                }
              >
                {item.title}
              </Link>
            ))}
          </div>

          <p className="mt-6 text-sm font-semibold" style={{ color: '#64748b' }}>
            Semis Code: 408070227
          </p>
        </div>

        <div className="rounded-3xl border p-3 sm:p-4" style={{ background: '#fff', borderColor: '#dce3ec', boxShadow: '0 8px 30px rgba(26,58,107,0.08)' }}>
          <div
            className="relative h-[280px] overflow-hidden rounded-3xl sm:h-[360px]"
            style={{ background: 'linear-gradient(135deg, #0f2347 2%, #1e3a8a 42%, #0ea5a5 100%)' }}
          >
            <div className="absolute -left-8 bottom-4 h-24 w-24 rounded-full" style={{ background: 'rgba(99,102,241,0.24)' }} />
            <div className="absolute right-6 top-3 h-16 w-16 rounded-full" style={{ background: 'rgba(59,130,246,0.35)' }} />

            <div className="absolute left-1/2 top-1/2 w-[82%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5" style={{ background: 'rgba(226,236,255,0.78)' }}>
              <div className="h-4 w-[55%] rounded-md" style={{ background: '#c3cee2' }} />
              <div className="mt-3 h-3 w-[90%] rounded-md" style={{ background: '#b3c0d8' }} />
              <div className="mt-2 h-3 w-[82%] rounded-md" style={{ background: '#b3c0d8' }} />

              <div className="mt-5 rounded-xl border p-3" style={{ borderColor: '#d3dcee', background: 'rgba(255,255,255,0.76)' }}>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="h-2 rounded" style={{ background: index % 3 === 0 ? '#9bb0d3' : '#cfd8ea' }} />
                  ))}
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <span className="rounded-full px-4 py-1 text-[10px] font-bold text-white" style={{ background: '#2563eb' }}>
                  Open Teacher Data
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
