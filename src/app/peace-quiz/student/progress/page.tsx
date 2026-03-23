'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PeaceQuizNavbar from '../../../components/PeaceQuizNavbar';
import { getAuthStorageKey, parseAuthSession } from '../../../lib/auth';
import { getQuizProgramName } from '../../../lib/quizBranding';

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

const toNum = (v: string) => Number(v || 0) || 0;

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return '< 1m';
};

const computeDailyStreak = (dateStrings: string[]) => {
  if (!dateStrings.length) {
    return 0;
  }

  const uniqueDates = new Set(
    dateStrings
      .map((value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!uniqueDates.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

type Badge = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
};

const buildBadges = (attempts: number, accuracy: number, streak: number, weakCount: number): Badge[] => {
  return [
    {
      id: 'first-step',
      name: 'First Step',
      emoji: '🏁',
      description: 'Complete your first quiz attempt',
      unlocked: attempts >= 1,
    },
    {
      id: 'consistent',
      name: 'Consistent Learner',
      emoji: '🔥',
      description: 'Maintain a 3-day streak',
      unlocked: streak >= 3,
    },
    {
      id: 'accuracy-pro',
      name: 'Accuracy Pro',
      emoji: '🎯',
      description: 'Reach 80% overall accuracy',
      unlocked: accuracy >= 80,
    },
    {
      id: 'subject-master',
      name: 'Topic Tamer',
      emoji: '📘',
      description: 'Keep weak topics at 2 or below',
      unlocked: attempts >= 5 && weakCount <= 2,
    },
    {
      id: 'practice-hero',
      name: 'Practice Hero',
      emoji: '🏅',
      description: 'Complete 25 total attempts',
      unlocked: attempts >= 25,
    },
  ];
};

const computePoints = (records: HistoryRecord[], streak: number) => {
  const basePoints = records.reduce((sum, r) => {
    const attempted = toNum(r.attempted);
    const accuracy = toNum(r.accuracy_percent);
    const difficultyMultiplier = r.difficulty.toLowerCase() === 'hard' ? 1.4 : r.difficulty.toLowerCase() === 'medium' ? 1.15 : 1;
    const attemptPoints = attempted * 5;
    const accuracyBonus = Math.round(accuracy * 0.8);
    return sum + Math.round((attemptPoints + accuracyBonus) * difficultyMultiplier);
  }, 0);

  const streakBonus = streak * 25;
  return {
    total: basePoints + streakBonus,
    basePoints,
    streakBonus,
  };
};

type Insight = { type: 'warn' | 'good' | 'info'; text: string };

const buildInsights = (
  weakTopics: { subject: string; average: number }[],
  strongTopics: { subject: string; average: number }[],
  overallAccuracy: number,
  totalAttempts: number,
): Insight[] => {
  const ins: Insight[] = [];
  weakTopics.slice(0, 3).forEach((t) =>
    ins.push({ type: 'warn', text: `You are weak in ${t.subject} (${t.average}% accuracy). Revise it regularly.` })
  );
  if (overallAccuracy > 0 && overallAccuracy < 50)
    ins.push({ type: 'warn', text: 'Your overall accuracy is below 50%. Practice daily to improve.' });
  if (totalAttempts > 0 && totalAttempts < 5)
    ins.push({ type: 'info', text: 'Attempt more quizzes to unlock detailed insights.' });
  strongTopics.slice(0, 2).forEach((t) =>
    ins.push({ type: 'good', text: `Great job in ${t.subject} (${t.average}%)! Keep maintaining this.` })
  );
  if (overallAccuracy >= 80 && totalAttempts >= 5)
    ins.push({ type: 'good', text: 'Excellent overall performance! Consider challenging yourself with Hard difficulty.' });
  return ins;
};

export default function ProgressPage() {
  const [username, setUsername] = useState('');
  const [programName, setProgramName] = useState('');
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        if (!data.success) throw new Error(data.message || 'Failed to load progress.');
        setRecords(data.records ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load progress.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalAttempts = records.length;
  const totalTimeSeconds = records.reduce((sum, r) => sum + toNum(r.elapsed_seconds), 0);
  const overallAccuracy = totalAttempts
    ? Math.round(records.reduce((sum, r) => sum + toNum(r.accuracy_percent), 0) / totalAttempts)
    : 0;
  const streakDays = computeDailyStreak(records.map((r) => r.submitted_at));

  const subjectMap = useMemo(() => {
    const map = new Map<string, { totalAcc: number; count: number }>();
    records.forEach((r) => {
      const sub = r.subject.trim() || 'Unknown';
      const prev = map.get(sub) || { totalAcc: 0, count: 0 };
      map.set(sub, { totalAcc: prev.totalAcc + toNum(r.accuracy_percent), count: prev.count + 1 });
    });
    return Array.from(map.entries())
      .map(([subject, v]) => ({ subject, average: Math.round(v.totalAcc / v.count) }))
      .sort((a, b) => b.average - a.average);
  }, [records]);

  const weakTopics = subjectMap.filter((s) => s.average < 60);
  const strongTopics = subjectMap.filter((s) => s.average >= 75);
  const points = useMemo(() => computePoints(records, streakDays), [records, streakDays]);
  const badges = useMemo(
    () => buildBadges(totalAttempts, overallAccuracy, streakDays, weakTopics.length),
    [totalAttempts, overallAccuracy, streakDays, weakTopics.length]
  );
  const unlockedBadges = badges.filter((badge) => badge.unlocked).length;

  const trend = [...records]
    .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime())
    .slice(-10)
    .map((r) => toNum(r.accuracy_percent));

  const chartPoints =
    trend.length > 1
      ? trend
          .map((v, i) => {
            const x = (i / (trend.length - 1)) * 280 + 20;
            const y = 100 - (v / 100) * 80;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ')
      : '';

  const insights = useMemo(
    () => buildInsights(weakTopics, strongTopics, overallAccuracy, totalAttempts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records]
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PeaceQuizNavbar role="student" />

        <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Progress Report</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">Your Performance Overview</h1>
              <p className="mt-1 text-sm text-slate-600">
                {username} · {programName}
              </p>
            </div>
            <Link
              href="/peace-quiz/student"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
            >
              ← Dashboard
            </Link>
          </div>

          {loading && <p className="mt-8 text-slate-600">Loading progress data...</p>}
          {error && (
            <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
          )}

          {!loading && !error && (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {([
                  { label: 'Overall Accuracy', value: `${overallAccuracy}%`, icon: '📊', tone: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
                  { label: 'Total Attempts', value: String(totalAttempts), icon: '🔢', tone: 'bg-sky-50 border-sky-100 text-sky-700' },
                  { label: 'Time Spent', value: formatDuration(totalTimeSeconds), icon: '⏱', tone: 'bg-amber-50 border-amber-100 text-amber-700' },
                  { label: 'Weak Topics', value: String(weakTopics.length), icon: '📉', tone: 'bg-rose-50 border-rose-100 text-rose-700' },
                ] as const).map((s) => (
                  <div key={s.label} className={`rounded-2xl border p-5 ${s.tone}`}>
                    <span className="text-2xl">{s.icon}</span>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-80">{s.label}</p>
                    <p className="mt-1 text-3xl font-black">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">🔥 Streak + ⭐ Points</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-orange-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Streak</p>
                      <p className="mt-1 text-3xl font-black text-orange-700">{streakDays} day{streakDays === 1 ? '' : 's'}</p>
                      <p className="mt-1 text-xs text-slate-500">Daily practice builds bonus points.</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Points</p>
                      <p className="mt-1 text-3xl font-black text-amber-700">{points.total}</p>
                      <p className="mt-1 text-xs text-slate-500">Base: {points.basePoints} + Streak bonus: {points.streakBonus}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">🥇 Leaderboard</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Coming Soon</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Global ranking will compare points across students. Backend already tracks your score profile.
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
                    Preview: rank will be based on points, streak consistency, and accuracy.
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">🏅 Badges</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
                    Unlocked {unlockedBadges}/{badges.length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`rounded-xl border p-4 ${
                        badge.unlocked
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-white opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{badge.emoji}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            badge.unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {badge.unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      <p className="mt-2 font-bold text-slate-900">{badge.name}</p>
                      <p className="mt-1 text-xs text-slate-600">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {trend.length > 1 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">📈 Accuracy Trend</p>
                  <p className="mt-1 text-sm text-slate-500">Last {trend.length} sessions</p>
                  <svg viewBox="0 0 320 110" className="mt-4 h-40 w-full" aria-label="Accuracy trend chart">
                    <line x1="20" y1="100" x2="300" y2="100" stroke="#e2e8f0" strokeWidth="2" />
                    <path d={chartPoints} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {trend.map((v, i) => {
                      const x = (i / (trend.length - 1)) * 280 + 20;
                      const y = 100 - (v / 100) * 80;
                      return <circle key={i} cx={x} cy={y} r="4" fill="#4f46e5" />;
                    })}
                  </svg>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Oldest</span>
                    <span>Latest</span>
                  </div>
                </div>
              )}

              {subjectMap.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">📘 Subject-wise Performance</p>
                  <div className="mt-4 space-y-3">
                    {subjectMap.map((s) => (
                      <div key={s.subject}>
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          <span>{s.subject}</span>
                          <span
                            className={
                              s.average >= 75
                                ? 'text-emerald-600'
                                : s.average >= 50
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                            }
                          >
                            {s.average}%
                          </span>
                        </div>
                        <progress
                          className={`mt-1 h-2.5 w-full overflow-hidden rounded-full ${
                            s.average >= 75 ? 'accent-emerald-500' : s.average >= 50 ? 'accent-amber-500' : 'accent-rose-500'
                          }`}
                          value={s.average}
                          max={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weakTopics.length > 0 && (
                <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-600">📉 Weak Topics</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {weakTopics.map((t) => (
                      <span
                        key={t.subject}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1 text-sm font-semibold text-rose-700"
                      >
                        {t.subject} — {t.average}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {insights.length > 0 && (
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">💡 Smart Insights</p>
                  <ul className="mt-3 space-y-2">
                    {insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span
                          className={`mt-0.5 font-bold ${
                            ins.type === 'warn' ? 'text-rose-500' : ins.type === 'good' ? 'text-emerald-600' : 'text-indigo-500'
                          }`}
                        >
                          {ins.type === 'warn' ? '⚠' : ins.type === 'good' ? '✓' : '→'}
                        </span>
                        <span className="text-slate-700">{ins.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {totalAttempts === 0 && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-3xl">📊</p>
                  <p className="mt-3 text-lg font-semibold text-slate-700">No attempts yet</p>
                  <p className="mt-1 text-sm text-slate-500">Complete a quiz to see your progress here.</p>
                  <Link
                    href="/peace-quiz/student/start-practice"
                    className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Start Practice
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
