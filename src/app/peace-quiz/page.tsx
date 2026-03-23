'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'teacher' | 'student';

const roleRouteMap: Record<Role, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

const credentialsByRole: Record<Role, { username: string; password: string }> = {
  admin: { username: 'admin01', password: 'admin123' },
  teacher: { username: 'teacher01', password: 'teacher123' },
  student: { username: 'student01', password: 'student123' },
};

export default function PeaceQuizLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const selectedRoleCredential = credentialsByRole[role];
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
      router.push(roleRouteMap[role]);
    }, 450);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Peace Quiz</p>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
            <p className="font-semibold">Demo credentials:</p>
            <p>Admin: admin01 / admin123</p>
            <p>Teacher: teacher01 / teacher123</p>
            <p>Student: student01 / student123</p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
