'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthStorageKey, parseAuthSession, Role } from '../lib/auth';
import { getQuizCredentialsForProgram } from '../lib/quizAccounts';
import {
  DEFAULT_QUIZ_PROGRAM_NAME,
  QUIZ_PROGRAM_NAME_KEY,
  QUIZ_PROGRAM_NAME_UPDATED_EVENT,
  getQuizProgramName,
  setQuizProgramName,
} from '../lib/quizBranding';

const roleRouteMap: Record<Role, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/peace-quiz/student',
};

export default function PeaceQuizLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingRole, setRedirectingRole] = useState<Role | null>(null);
  const [programName, setProgramName] = useState(DEFAULT_QUIZ_PROGRAM_NAME);
  const [programNameInput, setProgramNameInput] = useState(DEFAULT_QUIZ_PROGRAM_NAME);
  const [isProgramNameSaved, setIsProgramNameSaved] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);

  useEffect(() => {
    const syncProgramName = () => {
      const currentName = getQuizProgramName();
      const savedName = localStorage.getItem(QUIZ_PROGRAM_NAME_KEY)?.trim() ?? '';
      setProgramName(currentName);
      setProgramNameInput(currentName);
      setIsProgramNameSaved(savedName.length > 0);
    };

    syncProgramName();
    window.addEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);

    const session = parseAuthSession(localStorage.getItem(getAuthStorageKey()));
    if (!session) {
      return () => {
        window.removeEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);
      };
    }

    setRedirectingRole(session.role);

    const timeout = setTimeout(() => {
      router.push(roleRouteMap[session.role]);
    }, 1400);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);
    };
  }, [router]);

  const redirectLabel = useMemo(() => {
    if (!redirectingRole) {
      return '';
    }

    return redirectingRole.charAt(0).toUpperCase() + redirectingRole.slice(1);
  }, [redirectingRole]);

  const programCredentials = useMemo(() => getQuizCredentialsForProgram(programName), [programName]);

  const selectRoleAndOpenLogin = (nextRole: Role) => {
    setRole(nextRole);
    setShowLoginPanel(true);
    const loginCard = document.getElementById('login-card');
    setTimeout(() => {
      loginCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (!programCredentials) {
      setError(`No login setup found for ${programName}. Add it in src/app/lib/quizAccounts.ts.`);
      return;
    }

    const selectedRoleCredential = programCredentials[role];
    if (
      username.trim() !== selectedRoleCredential.username ||
      password !== selectedRoleCredential.password
    ) {
      setError('Invalid username or password for the selected role.');
      return;
    }

    setIsSubmitting(true);

    // Simulate successful login, then redirect by selected role.
    setTimeout(() => {
      localStorage.setItem(
        getAuthStorageKey(),
        JSON.stringify({
          role,
          source: 'peace-quiz',
          username: username.trim(),
          programName,
        })
      );
      router.push(roleRouteMap[role]);
    }, 450);
  };

  const handleProgramNameSave = () => {
    if (!programNameInput.trim()) {
      setError('Please enter a school or institute name first.');
      return;
    }

    setQuizProgramName(programNameInput);
    setIsProgramNameSaved(true);
    setShowLoginPanel(false);
    setError('');
  };

  const handleBackToSetup = () => {
    setShowLoginPanel(false);
    setError('');
    setUsername('');
    setPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#dbeafe_0%,#eef2ff_35%,#f8fafc_70%)] px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 rounded-2xl border border-indigo-200/70 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Quiz Program</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Smart Learning Portal</h1>
              <p className="mt-1 text-sm text-slate-600">Institute: <span className="font-semibold text-slate-800">{programName}</span></p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-1">
          {!showLoginPanel ? (
          <article className="rounded-3xl border border-indigo-100 bg-white/90 p-7 shadow-lg sm:p-10">
            <p className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Quiz Program
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              Quiz Program Journey for Every Role
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              A focused portal for students, teachers, and admins. If you are already signed in on this device,
              the system will automatically redirect you to your role dashboard.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Institute / School Name</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={programNameInput}
                  onChange={(event) => setProgramNameInput(event.target.value)}
                  placeholder="Enter school or institute name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={handleProgramNameSave}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Save Name
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Where to set school logins</p>
              <p className="mt-1">Edit `src/app/lib/quizAccounts.ts` and add your school name with role-based credentials.</p>
            </div>

            {isProgramNameSaved ? (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Choose Role to Login</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student</p>
                    <p className="mt-1 text-sm text-slate-700">Take quiz and view progress</p>
                    <button
                      type="button"
                      onClick={() => selectRoleAndOpenLogin('student')}
                      className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Login as Student
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Teacher</p>
                    <p className="mt-1 text-sm text-slate-700">Monitor classroom performance</p>
                    <button
                      type="button"
                      onClick={() => selectRoleAndOpenLogin('teacher')}
                      className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Login as Teacher
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Admin</p>
                    <p className="mt-1 text-sm text-slate-700">Manage quiz operations</p>
                    <button
                      type="button"
                      onClick={() => selectRoleAndOpenLogin('admin')}
                      className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Login as Admin
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Save institute name first to enable role login options.
              </p>
            )}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          </article>
          ) : null}

          {showLoginPanel ? (
          <aside id="login-card" className="mx-auto w-full max-w-xl rounded-3xl border border-indigo-200 bg-white p-7 shadow-xl sm:p-8">
            {redirectingRole ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Session Found</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">Welcome Back</h3>
                <p className="mt-3 text-slate-700">
                  {redirectLabel} session detected. Redirecting to your role page...
                </p>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-500" />
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  If redirect does not happen, go manually to{' '}
                  <Link href={roleRouteMap[redirectingRole]} className="font-semibold text-indigo-700 underline">
                    your dashboard
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Login</p>
                <h3 className="mb-6 text-2xl font-bold text-slate-900">Continue to Quiz Program</h3>
                <p className="mb-4 text-sm text-slate-600">
                  You are signing in to <span className="font-semibold text-slate-800">{programName}</span> Quiz Program.
                </p>

                {!programCredentials ? (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    No login setup found for this school. Add credentials in `src/app/lib/quizAccounts.ts`.
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-xs text-indigo-700">
                    Selected role: <span className="font-semibold capitalize">{role}</span>
                  </p>

                  <div>
                    <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Enter your username"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                    <p className="font-semibold">Configured credentials for {programName}:</p>
                    <p>Admin: {programCredentials?.admin.username || '-'} / {programCredentials?.admin.password || '-'}</p>
                    <p>Teacher: {programCredentials?.teacher.username || '-'} / {programCredentials?.teacher.password || '-'}</p>
                    <p>Student: {programCredentials?.student.username || '-'} / {programCredentials?.student.password || '-'}</p>
                  </div>

                  {error ? <p className="text-sm text-red-600">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing in...' : 'Login'}
                  </button>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleBackToSetup}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
                    >
                      Back to Role and School Setup
                    </button>
                  </div>
                </form>
              </>
            )}
          </aside>
          ) : null}
        </section>
      </div>
    </main>
  );
}
