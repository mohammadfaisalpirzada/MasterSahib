'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PeaceQuizNavbar from '../../../components/PeaceQuizNavbar';
import { getAuthStorageKey, parseAuthSession } from '../../../lib/auth';
import { getQuizProgramName } from '../../../lib/quizBranding';

const LAST_SESSION_KEY = 'mastersahib_last_practice_session';

type HistoryRecord = {
  submitted_at: string;
  username: string;
  program_name: string;
  class_level: string;
  subject: string;
  difficulty: string;
  mode: string;
  attempted: string;
  total: string;
  accuracy_percent: string;
  review_marked: string;
  elapsed_seconds: string;
  status: string;
};

type ApiResponse = {
  success: boolean;
  records?: HistoryRecord[];
  message?: string;
};

type PracticeSessionConfig = {
  classLevel: string;
  subject: string;
  difficulty: string;
  questionCount: string;
  customQuestionCount: string;
  mode: string;
  programName: string;
  updatedAt: string;
};

const toNum = (v: string) => Number(v || 0) || 0;

const formatDuration = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDateKey = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const autoRemark = (accuracy: number): string => {
  if (accuracy >= 90) return 'Outstanding';
  if (accuracy >= 75) return 'Excellent';
  if (accuracy >= 60) return 'Good';
  if (accuracy >= 45) return 'Average';
  if (accuracy >= 30) return 'Needs Improvement';
  return 'Weak — Revise the topic';
};

const remarkTone = (accuracy: number): string => {
  if (accuracy >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (accuracy >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
};

export default function HistoryPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [programName, setProgramName] = useState('');
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [subjectFilter, setSubjectFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  useEffect(() => {
    const session = parseAuthSession(localStorage.getItem(getAuthStorageKey()));
    const uname = session?.username || 'Student';
    const pname = session?.programName || getQuizProgramName();
    setUsername(uname);
    setProgramName(pname);

    const load = async () => {
      try {
        const params = new URLSearchParams({ programName: pname, mode: 'student-history', username: uname });
        const res = await fetch(`/api/peace-quiz/questions?${params.toString()}`, { cache: 'no-store' });
        const data = (await res.json()) as ApiResponse;
        if (!data.success) throw new Error(data.message || 'Failed to load history.');
        setRecords(data.records ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const subjectOptions = useMemo(() => {
    const subjects = Array.from(new Set(records.map((r) => r.subject.trim()).filter(Boolean)));
    return ['All', ...subjects.sort()];
  }, [records]);

  const dateOptions = useMemo(() => {
    const dates = Array.from(new Set(records.map((r) => getDateKey(r.submitted_at)).filter(Boolean)));
    dates.sort((a, b) => b.localeCompare(a));
    return ['All', ...dates];
  }, [records]);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const matchSubject = subjectFilter === 'All' || r.subject.trim() === subjectFilter;
        const matchDate = dateFilter === 'All' || getDateKey(r.submitted_at) === dateFilter;
        return matchSubject && matchDate;
      }),
    [records, subjectFilter, dateFilter]
  );

  const handleReattempt = (record: HistoryRecord) => {
    const config: PracticeSessionConfig = {
      classLevel: record.class_level,
      subject: record.subject,
      difficulty: record.difficulty || 'Easy',
      questionCount: record.total || '10',
      customQuestionCount: '',
      mode: 'Practice',
      programName: record.program_name || programName,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(config));
    router.push('/peace-quiz/student/attempt');
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PeaceQuizNavbar role="student" />

        <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Attempt History</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">Quiz History</h1>
              <p className="mt-1 text-sm text-slate-600">{username} · {filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <Link
              href="/peace-quiz/student"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Filters */}
          {!loading && !error && records.length > 0 && (
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="subject-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  📘 Subject
                </label>
                <select
                  id="subject-filter"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="mt-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {subjectOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date-filter" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  🕒 Date
                </label>
                <select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="mt-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {dateOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {(subjectFilter !== 'All' || dateFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => { setSubjectFilter('All'); setDateFilter('All'); }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading / Error */}
          {loading && <p className="mt-8 text-slate-600">Loading history...</p>}
          {error && (
            <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
          )}

          {/* Empty state */}
          {!loading && !error && records.length === 0 && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-4xl">🕒</p>
              <p className="mt-3 text-lg font-semibold text-slate-700">No attempts yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Complete a quiz and submit to see your history here.
              </p>
              <Link
                href="/peace-quiz/student/start-practice"
                className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Start Practice
              </Link>
            </div>
          )}

          {/* No filter match */}
          {!loading && !error && records.length > 0 && filtered.length === 0 && (
            <p className="mt-8 text-sm text-slate-500">No records match the selected filters.</p>
          )}

          {/* Records table — desktop */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3">🕒 Date & Time</th>
                      <th className="px-4 py-3">🏫 Class</th>
                      <th className="px-4 py-3">📘 Subject</th>
                      <th className="px-4 py-3">🎯 Score</th>
                      <th className="px-4 py-3">📊 Accuracy</th>
                      <th className="px-4 py-3">⏱ Time</th>
                      <th className="px-4 py-3">📝 Remark</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => {
                      const acc = toNum(r.accuracy_percent);
                      return (
                        <tr
                          key={`${r.submitted_at}-${idx}`}
                          className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0"
                        >
                          <td className="px-4 py-3 text-slate-600">{formatDateTime(r.submitted_at)}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              {r.class_level || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{r.subject || '—'}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {toNum(r.attempted)}/{toNum(r.total)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                acc >= 75
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : acc >= 50
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {acc}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatDuration(toNum(r.elapsed_seconds))}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${remarkTone(acc)}`}>
                              {autoRemark(acc)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleReattempt(r)}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                            >
                              🔁 Re-attempt
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Records cards — mobile */}
              <div className="mt-6 space-y-4 lg:hidden">
                {filtered.map((r, idx) => {
                  const acc = toNum(r.accuracy_percent);
                  return (
                    <div key={`card-${r.submitted_at}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500">{formatDateTime(r.submitted_at)}</p>
                          <p className="mt-1 font-semibold text-slate-900">{r.subject || 'Quiz'}</p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${remarkTone(acc)}`}
                        >
                          {autoRemark(acc)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs text-slate-500">🏫 Class</p>
                          <p className="mt-1 font-semibold text-slate-800">{r.class_level || '—'}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs text-slate-500">🎯 Score</p>
                          <p className="mt-1 font-semibold text-slate-800">{toNum(r.attempted)}/{toNum(r.total)}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs text-slate-500">📊 Accuracy</p>
                          <p className={`mt-1 font-bold ${acc >= 75 ? 'text-emerald-600' : acc >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {acc}%
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs text-slate-500">⏱ Time</p>
                          <p className="mt-1 font-semibold text-slate-800">{formatDuration(toNum(r.elapsed_seconds))}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReattempt(r)}
                        className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        🔁 Re-attempt
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
