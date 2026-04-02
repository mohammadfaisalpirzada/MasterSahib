"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { HiChevronDown, HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';

import { educationalResourceNavLinks } from '@/app/lib/educationalResources';

type NavItem = {
  label: string;
  href: string;
  children?: Array<{
    label: string;
    href: string;
    description: string;
  }>;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Quiz Program', href: '/peace-quiz' },
  { label: 'GGSS Nishtar Road', href: '/ggss-nishtar-road' },
  { label: 'Resume Builder', href: '/resume-builder' },
  {
    label: 'Educational Resources',
    href: '/teaching-tools',
    children: educationalResourceNavLinks,
  },
  { label: 'Contact', href: '/contact' },
];

const secondaryNavItem = { label: 'Portfolio', href: '/portfolio' };

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const headerRef = useRef<HTMLElement | null>(null);

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isItemActive = (item: NavItem) => {
    if (isActiveRoute(item.href)) {
      return true;
    }

    return item.children?.some((child) => isActiveRoute(child.href)) ?? false;
  };

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDesktopDropdown(null);
    setOpenMobileDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDesktopDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full border-b border-indigo-300/40 bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 text-white shadow-lg"
    >
      <nav className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-4 px-3 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-white/10"
          aria-label="Go to home page"
        >
          <Image
            src="/images/main_logo.png"
            alt="TheMasterSahib Logo"
            width={48}
            height={48}
            className="h-10 w-10 rounded-full border border-white/30 object-cover sm:h-11 sm:w-11"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold leading-tight sm:text-xl">TheMasterSahib</p>
            <p className="hidden truncate text-xs text-indigo-100 sm:block">Learn. Build. Grow.</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isOpen = openDesktopDropdown === item.href;
            const isActive = isItemActive(item);

            if (item.children) {
              return (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenDesktopDropdown(item.href)}
                  onMouseLeave={() => setOpenDesktopDropdown((current) => (current === item.href ? null : current))}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDesktopDropdown((current) => (current === item.href ? null : item.href))}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-indigo-50 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {item.label}
                    <HiChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    className={`absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-xl transition-all duration-200 ${
                      isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0 pointer-events-none'
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="block rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                    >
                      Open All Educational Resources
                    </Link>

                    <div className="mt-2 grid gap-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`rounded-xl px-3 py-2.5 transition hover:bg-indigo-50 ${
                            isActiveRoute(child.href) ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <span className="block text-sm font-semibold text-slate-900">{child.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-slate-600">{child.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-indigo-50 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={secondaryNavItem.href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActiveRoute(secondaryNavItem.href)
                ? 'border-white bg-white text-indigo-700'
                : 'border-white/35 bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {secondaryNavItem.label}
          </Link>

          {status === 'loading' ? (
            <div className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm text-indigo-50">
              Loading...
            </div>
          ) : session ? (
            <div className="flex items-center gap-3 rounded-full border border-white/25 bg-white/15 px-3 py-1.5">
              {session.user?.image && (
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/30">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Profile'}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-white">{session.user?.name || 'User'}</p>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-indigo-100 transition hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="rounded-full border border-white bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              Sign in
            </button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20 lg:hidden"
          onClick={() => setIsMobileOpen((current) => !current)}
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          title={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileOpen ? <HiOutlineX className="h-6 w-6" /> : <HiOutlineMenuAlt3 className="h-6 w-6" />}
        </button>
      </nav>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pt-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-bold">Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg border border-white/30 bg-white/10 p-2"
                aria-label="Close navigation menu"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>

            <ul className="space-y-3">
              {navItems.map((item) => {
                if (item.children) {
                  const isOpen = openMobileDropdown === item.href;

                  return (
                    <li key={item.href} className="rounded-xl border border-white/20 bg-white/10">
                      <button
                        type="button"
                        onClick={() => setOpenMobileDropdown((current) => (current === item.href ? null : item.href))}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-white"
                      >
                        <span>{item.label}</span>
                        <HiChevronDown className={`h-5 w-5 transition ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen ? (
                        <div className="space-y-2 px-3 pb-3">
                          <Link
                            href={item.href}
                            className="block rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            Open All Educational Resources
                          </Link>

                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 transition hover:bg-white/10"
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <span className="block text-sm font-semibold text-white">{child.label}</span>
                              <span className="mt-1 block text-xs leading-5 text-indigo-100">{child.description}</span>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-xl border px-4 py-3 text-base font-semibold transition ${
                        isActiveRoute(item.href)
                          ? 'border-white/70 bg-white text-indigo-700'
                          : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">More</p>
              <Link
                href={secondaryNavItem.href}
                className={`mt-3 block rounded-xl border px-4 py-3 text-base font-semibold transition ${
                  isActiveRoute(secondaryNavItem.href)
                    ? 'border-white/70 bg-white text-indigo-700'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                {secondaryNavItem.label}
              </Link>

              {status === 'loading' ? (
                <div className="mt-3 text-sm text-indigo-100">Loading...</div>
              ) : session ? (
                <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-3">
                  <div className="flex items-center gap-3">
                    {session.user?.image && (
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-white/30">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'Profile'}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-indigo-100">{session.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileOpen(false);
                    }}
                    className="mt-3 w-full rounded-lg border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signIn('google');
                    setIsMobileOpen(false);
                  }}
                  className="mt-3 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Sign in with Google
                </button>
              )}
            </div>

            <div className="mt-auto pb-8 text-sm text-indigo-100">themastersahib.com | Responsive Learning Platform</div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
