'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
type SidebarSection = {
  id: string;
  label: string;
  href?: string;
};

type SidebarModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  sections: SidebarSection[];
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
export default function HubLayout({
  sidebarModules,
  children,
}: {
  sidebarModules: SidebarModule[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* ═══ TOP NAV ═══ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
              aria-label="Toggle navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
            <Link href="/teaching-license" className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
              ← Back
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="text-sm font-bold text-slate-900">STEDA Learning Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:block"
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside
          className={`
            fixed top-14 bottom-0 z-40 w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-300 ease-in-out
            lg:sticky lg:translate-x-0 lg:block lg:w-64 lg:z-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Documentation
            </p>
            {sidebarModules.map((mod) => (
              <div key={mod.id} className="mb-4">
                <div className="mb-1.5 flex items-center gap-2 px-2">
                  <span className="text-sm">{mod.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{mod.title}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{mod.subtitle}</p>
                  </div>
                </div>
                <div className="ml-2 space-y-0.5 border-l border-slate-100 pl-3">
                  {mod.sections.map((sec) =>
                    sec.href ? (
                      <Link
                        key={sec.id}
                        href={sec.href}
                        className="block rounded-md px-2 py-1.5 text-xs text-emerald-600 font-semibold transition hover:bg-emerald-50"
                      >
                        {sec.label}
                      </Link>
                    ) : (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={() => setSidebarOpen(false)}
                        className="block rounded-md px-2 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        {sec.label}
                      </a>
                    )
                  )}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="min-w-0 flex-1">
          <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            {children}
          </article>
        </div>
      </div>
    </main>
  );
}
