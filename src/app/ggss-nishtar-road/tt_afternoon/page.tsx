'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CategoryItem = {
  id: string;
  label: string;
  description: string;
  rows: string[][];
};

type TimetablePayload = {
  title: string;
  subtitle: string;
  updatedAt: number;
  categories: CategoryItem[];
};

const STORAGE_KEY = 'ggss_tt_afternoon_unlocked_v1';

export default function GgssAfternoonTimetablePage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TimetablePayload | null>(null);
  const [activeId, setActiveId] = useState<string>('master');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('All');

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TimetablePayload;
        if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          setData(parsed);
          setActiveId(parsed.categories[0].id);
        }
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the access password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ggss-tt-afternoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as { success?: boolean; data?: TimetablePayload; error?: string };
      if (!res.ok || !json.success || !json.data) {
        setError(json.error || 'Incorrect password.');
        return;
      }
      setData(json.data);
      setActiveId(json.data.categories[0]?.id || 'master');
      setPassword('');
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
      } catch {
        // ignore storage quota errors
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    setData(null);
    setPassword('');
    setError('');
    setSelectedTeacher('All');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              GGSS Nishtar Road
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Afternoon Shift Timetable
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Enter the staff password to view the schedule.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4" aria-labelledby="unlock-heading">
            <h2 id="unlock-heading" className="sr-only">
              Staff Timetable Access
            </h2>
            <div>
              <label htmlFor="tt-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Access Password
              </label>
              <div className="relative">
                <input
                  id="tt-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-2 text-xs font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Verifying...' : 'Unlock Timetable'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/ggss-nishtar-road"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4"
            >
              Back to GGSS Nishtar Road Portal
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const activeCategory =
    data.categories.find((c) => c.id === activeId) || data.categories[0];

  const isTeacherTab = activeCategory.id === 'teachers';
  const teacherNames = isTeacherTab
    ? activeCategory.rows.slice(1).map((r) => r[0]).filter(Boolean)
    : [];

  const displayRows = isTeacherTab && selectedTeacher !== 'All'
    ? [activeCategory.rows[0], ...activeCategory.rows.slice(1).filter((r) => r[0] === selectedTeacher)]
    : activeCategory.rows;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-6 px-3 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Header Bar */}
        <header className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:border-0 print:shadow-none print:p-0 print:mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              GGSS Nishtar Road
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              {data.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {data.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Print View
            </button>
            <button
              type="button"
              onClick={handleLock}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Lock
            </button>
          </div>
        </header>

        {/* Category Buttons (Single-Row Scrollable Tablist — One Category Open at a Time) */}
        <nav aria-label="Timetable categories" className="print:hidden">
          <div
            role="tablist"
            aria-label="Timetable Categories"
            className="flex items-center gap-2 overflow-x-auto pb-1.5"
          >
            {data.categories.map((cat) => {
              const selected = cat.id === activeCategory.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  id={`tab-${cat.id}`}
                  aria-selected={selected}
                  onClick={() => {
                    setActiveId(cat.id);
                    if (cat.id !== 'teachers') setSelectedTeacher('All');
                  }}
                  className={`relative flex-none whitespace-nowrap rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold border transition-colors ${
                    selected
                      ? 'bg-slate-900 text-white border-slate-900 border-b-4 border-b-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Active Category Panel (Strictly One Category Open) */}
        <section
          role="tabpanel"
          aria-labelledby={`tab-${activeCategory.id}`}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 print:border-0 print:shadow-none print:p-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeCategory.label}
              </h2>
              <p className="text-xs text-slate-600">
                {activeCategory.description}
              </p>
            </div>

            {isTeacherTab && teacherNames.length > 0 && (
              <div className="flex items-center gap-2 print:hidden">
                <label htmlFor="teacher-filter" className="text-xs font-medium text-slate-600">
                  Filter Teacher:
                </label>
                <select
                  id="teacher-filter"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
                >
                  <option value="All">All Teachers</option>
                  {teacherNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm border border-slate-300">
              <tbody>
                {displayRows.map((row, rIdx) => {
                  const isMasterFriHdr =
                    activeCategory.id === 'master' && rIdx === 17;
                  const isHeader = rIdx === 0 || isMasterFriHdr;

                  return (
                    <tr
                      key={rIdx}
                      className={
                        isHeader
                          ? 'bg-slate-200 text-slate-900 font-bold'
                          : rIdx % 2 === 0
                          ? 'bg-slate-50/70'
                          : 'bg-white'
                      }
                    >
                      {row.map((cell, cIdx) => {
                        const isBreakCol =
                          (activeCategory.id === 'master' && cIdx === 4 && !isHeader) ||
                          ((activeCategory.id === 'class-1-5' ||
                            activeCategory.id.startsWith('class-6') ||
                            activeCategory.id.startsWith('class-8') ||
                            activeCategory.id.startsWith('class-9') ||
                            activeCategory.id.startsWith('class-10')) &&
                            cIdx === 3 &&
                            !isHeader);

                        const Tag = isHeader ? 'th' : 'td';
                        return (
                          <Tag
                            key={cIdx}
                            className={`border border-slate-300 px-2.5 py-2 align-middle whitespace-pre-line ${
                              isHeader
                                ? 'text-center font-bold'
                                : cIdx === 0
                                ? 'font-semibold bg-slate-100 text-slate-900'
                                : isBreakCol
                                ? 'text-center bg-slate-100 text-slate-600 font-medium'
                                : 'text-center text-slate-800'
                            }`}
                          >
                            {cell || ''}
                          </Tag>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
