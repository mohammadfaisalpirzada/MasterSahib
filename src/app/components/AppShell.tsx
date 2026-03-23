'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';
import Navbar from './Navbar';

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPeaceQuizRoute = pathname.startsWith('/peace-quiz');
  const showBackToGlobal = pathname !== '/';

  return (
    <>
      {!isPeaceQuizRoute ? <Navbar /> : null}
      {children}
      {showBackToGlobal ? (
        <Link
          href="/"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/30 bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.02] hover:bg-slate-700 md:bottom-6 md:right-6"
          aria-label="Back to global website"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to TheMasterSahib
        </Link>
      ) : null}
    </>
  );
}
