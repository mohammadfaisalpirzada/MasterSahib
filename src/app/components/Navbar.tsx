"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Quiz Program', href: '/peace-quiz' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Resume Builder', href: '/resume-builder' },
  { label: 'Contact', href: '/contact' },
];

const Navbar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-300/40 bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 text-white shadow-lg">
      <nav className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-4 px-3 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-white/10"
          aria-label="Go to home page"
        >
          <Image
            src="/images/main_logo.png"
            alt="Master Sahib Logo"
            width={48}
            height={48}
            className="h-10 w-10 rounded-full border border-white/30 object-cover sm:h-11 sm:w-11"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold leading-tight sm:text-xl">MasterSahib</p>
            <p className="hidden truncate text-xs text-indigo-100 sm:block">Learn. Build. Grow.</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActiveRoute(item.href)
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-indigo-50 hover:bg-white/15 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm text-indigo-50">
            Welcome back
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/30">
            <Image src="/images/profile.jpg" alt="Profile" width={40} height={40} className="h-full w-full object-cover" />
          </div>
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
              {navItems.map((item) => (
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
              ))}
            </ul>

            <div className="mt-auto pb-8 text-sm text-indigo-100">MasterSahib | Responsive Learning Platform</div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
