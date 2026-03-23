'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from '../lib/auth';
import {
  DEFAULT_QUIZ_PROGRAM_NAME,
  QUIZ_PROGRAM_NAME_UPDATED_EVENT,
  getQuizProgramName,
} from '../lib/quizBranding';
import RoleLogoutButton from './RoleLogoutButton';

type PeaceQuizNavbarProps = {
  role: Role;
};

export default function PeaceQuizNavbar({ role }: PeaceQuizNavbarProps) {
  const [programName, setProgramName] = useState(DEFAULT_QUIZ_PROGRAM_NAME);

  useEffect(() => {
    const syncProgramName = () => setProgramName(getQuizProgramName());
    syncProgramName();

    window.addEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);
    return () => {
      window.removeEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);
    };
  }, []);

  return (
    <nav className="mb-8 rounded-2xl border border-indigo-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/images/peace_logo.png"
            alt="Peace Quiz Logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Quiz Program</p>
          <p className="text-sm text-slate-700">{programName} | Signed in as {role}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {role === 'student' && (
            <StudentNavLinks />
          )}
          <RoleLogoutButton />
        </div>
      </div>
    </nav>
  );
}

const studentLinks = [
  { href: '/peace-quiz/student', label: 'Dashboard' },
  { href: '/peace-quiz/student/start-practice', label: 'Practice' },
  { href: '/peace-quiz/student/history', label: 'History' },
  { href: '/peace-quiz/student/progress', label: 'Progress' },
  { href: '/peace-quiz/student/bookmarks', label: 'Bookmarks' },
];

function StudentNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {studentLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
