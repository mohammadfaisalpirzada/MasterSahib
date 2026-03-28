'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { fetchAuthSession, roleRouteMap, Role } from '../lib/auth';
import {
  DEFAULT_QUIZ_PROGRAM_NAME,
  QUIZ_PROGRAM_NAME_KEY,
  QUIZ_PROGRAM_NAME_UPDATED_EVENT,
  getQuizProgramName,
  setQuizProgramName,
} from '../lib/quizBranding';

export default function PeaceQuizLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingRole, setRedirectingRole] = useState<Role | null>(null);
  const [programName, setProgramName] = useState(DEFAULT_QUIZ_PROGRAM_NAME);
  const [programNameInput, setProgramNameInput] = useState(DEFAULT_QUIZ_PROGRAM_NAME);
  const [isProgramNameSaved, setIsProgramNameSaved] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showChangePasswordPanel, setShowChangePasswordPanel] = useState(false);
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState('');
  const [newPasswordForChange, setNewPasswordForChange] = useState('');
  const [confirmPasswordForChange, setConfirmPasswordForChange] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordMessage, setChangePasswordMessage] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

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

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const checkSession = async () => {
      const session = await fetchAuthSession();
      if (!session) {
        return;
      }

      setRedirectingRole(session.role);
      timeout = setTimeout(() => {
        router.push(roleRouteMap[session.role]);
      }, 900);
    };

    checkSession();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      window.removeEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncProgramName);
    };
  }, [router]);

  const redirectLabel = useMemo(() => {
    if (!redirectingRole) {
      return '';
    }

    return redirectingRole.charAt(0).toUpperCase() + redirectingRole.slice(1);
  }, [redirectingRole]);

  const selectRoleAndOpenLogin = (nextRole: Role) => {
    setRole(nextRole);
    setShowLoginPanel(true);
    const loginCard = document.getElementById('login-card');
    setTimeout(() => {
      loginCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/peace-quiz/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role,
          programName,
        }),
      });

      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Login failed.');
      }

      router.push(roleRouteMap[role]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleChangePassword = async () => {
    setChangePasswordError('');
    setChangePasswordMessage('');

    if (role !== 'student') {
      setChangePasswordError('Password change on login page is available for students only.');
      return;
    }

    if (!username.trim()) {
      setChangePasswordError('Enter your username first.');
      return;
    }

    if (!currentPasswordForChange || !newPasswordForChange || !confirmPasswordForChange) {
      setChangePasswordError('Please fill current, new, and confirm password fields.');
      return;
    }

    if (newPasswordForChange !== confirmPasswordForChange) {
      setChangePasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPasswordForChange.length < 6) {
      setChangePasswordError('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/peace-quiz/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          role: 'student',
          programName,
          currentPassword: currentPasswordForChange,
          newPassword: newPasswordForChange,
        }),
      });

      const payload = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Password change failed.');
      }

      setChangePasswordMessage('Password updated. You can now login with your new password.');
      setCurrentPasswordForChange('');
      setNewPasswordForChange('');
      setConfirmPasswordForChange('');
      setPassword('');
    } catch (requestError) {
      setChangePasswordError(
        requestError instanceof Error ? requestError.message : 'Password change failed.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangePasswordEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    // Prevent login form submit when user is working inside change-password fields.
    event.preventDefault();
    if (!isChangingPassword) {
      handleChangePassword();
    }
  };

  const handleBackToSetup = () => {
    setShowLoginPanel(false);
    setError('');
    setUsername('');
    setPassword('');
    setShowChangePasswordPanel(false);
    setCurrentPasswordForChange('');
    setNewPasswordForChange('');
    setConfirmPasswordForChange('');
    setChangePasswordError('');
    setChangePasswordMessage('');
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
              <p className="font-semibold text-slate-900">School Login Support</p>
              <p className="mt-1">If your school login is not working, please contact your institute admin for account activation.</p>
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

                <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
                  Login is validated securely on server with HttpOnly session cookie.
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
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
                      name="quiz-portal-username"
                      autoComplete="off"
                      spellCheck={false}
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
                    <div className="relative">
                      <input
                        id="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        name="quiz-portal-access-code"
                        autoComplete="new-password"
                        spellCheck={false}
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-16 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((current) => !current)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                      </button>
                    </div>
                  </div>

                  {role === 'student' ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Need to change password?
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePasswordPanel((current) => !current);
                            setChangePasswordError('');
                            setChangePasswordMessage('');
                          }}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
                        >
                          {showChangePasswordPanel ? 'Hide' : 'Change Password'}
                        </button>
                      </div>

                      {showChangePasswordPanel ? (
                        <div className="mt-3 space-y-3">
                          <p className="text-xs text-slate-600">
                            Verify your current password, then set a new one.
                          </p>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">Current Password</label>
                            <input
                              type="password"
                              value={currentPasswordForChange}
                              onChange={(event) => setCurrentPasswordForChange(event.target.value)}
                              onKeyDown={handleChangePasswordEnter}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                              placeholder="Enter current password"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">New Password</label>
                            <input
                              type="password"
                              value={newPasswordForChange}
                              onChange={(event) => setNewPasswordForChange(event.target.value)}
                              onKeyDown={handleChangePasswordEnter}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">Confirm New Password</label>
                            <input
                              type="password"
                              value={confirmPasswordForChange}
                              onChange={(event) => setConfirmPasswordForChange(event.target.value)}
                              onKeyDown={handleChangePasswordEnter}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                              placeholder="Confirm new password"
                            />
                          </div>

                          {changePasswordError ? (
                            <p className="text-xs text-red-600">{changePasswordError}</p>
                          ) : null}
                          {changePasswordMessage ? (
                            <p className="text-xs text-emerald-700">{changePasswordMessage}</p>
                          ) : null}

                          <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="w-full rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isChangingPassword ? 'Updating password...' : 'Update Password'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

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
