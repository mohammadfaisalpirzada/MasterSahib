'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { parseAuthSession, getAuthStorageKey } from '../../lib/auth';
import {
  DEFAULT_QUIZ_PROGRAM_NAME,
  QUIZ_PROGRAM_NAME_UPDATED_EVENT,
  getQuizProgramName,
} from '../../lib/quizBranding';

type StudentSummary = {
  totalAttempts: number;
  averageAccuracy: number;
  dailyStreak: number;
  lastAttemptScore: string;
  lastAttemptDuration: string;
  weakSubject: string;
  strongSubject: string;
  lastClassLevel: string;
  weeklyAccuracies: number[];
};

type SummaryApiResponse = {
  success: boolean;
  summary?: StudentSummary;
  message?: string;
};

const emptySummary: StudentSummary = {
  totalAttempts: 0,
  averageAccuracy: 0,
  dailyStreak: 0,
  lastAttemptScore: '0/0',
  lastAttemptDuration: '0 min',
  weakSubject: 'N/A',
  strongSubject: 'N/A',
  lastClassLevel: '-',
  weeklyAccuracies: [],
};

export default function StudentDashboardOverview() {
  const router = useRouter();
  const [username, setUsername] = useState('Student');
  const [programName, setProgramName] = useState(DEFAULT_QUIZ_PROGRAM_NAME);
  const [summary, setSummary] = useState<StudentSummary>(emptySummary);

  useEffect(() => {
    const syncDashboardIdentity = async () => {
      const session = parseAuthSession(localStorage.getItem(getAuthStorageKey()));
      const user = session?.username || 'Student';
      const program = session?.programName || getQuizProgramName();

      setUsername(user);
      setProgramName(program);

      try {
        const params = new URLSearchParams({
          mode: 'student-summary',
          username: user,
          programName: program,
        });

        const response = await fetch(`/api/peace-quiz/questions?${params.toString()}`, {
          cache: 'no-store',
        });
        const data = (await response.json()) as SummaryApiResponse;

        if (!response.ok || !data.success || !data.summary) {
          throw new Error(data.message || 'Unable to load summary.');
        }

        setSummary(data.summary);
      } catch {
        setSummary(emptySummary);
      }
    };

    syncDashboardIdentity();
    window.addEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncDashboardIdentity);

    return () => {
      window.removeEventListener(QUIZ_PROGRAM_NAME_UPDATED_EVENT, syncDashboardIdentity);
    };
  }, []);

  const progressPoints = summary.weeklyAccuracies.length ? summary.weeklyAccuracies : [0, 0, 0, 0, 0, 0, 0];

  const chartPath = progressPoints
    .map((value, index) => {
      const x = 12 + index * 48;
      const y = 110 - Math.max(0, Math.min(100, value));
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const stats = useMemo(
    () => [
      {
        label: 'Total Quizzes Attempted',
        value: String(summary.totalAttempts),
        tone: 'bg-sky-50 text-sky-700 border-sky-100',
      },
      {
        label: 'Average Accuracy',
        value: `${summary.averageAccuracy}%`,
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
      {
        label: 'Daily Streak',
        value: `${summary.dailyStreak} day${summary.dailyStreak === 1 ? '' : 's'}`,
        tone: 'bg-amber-50 text-amber-700 border-amber-100',
      },
      {
        label: 'Last Attempt',
        value: summary.lastAttemptScore,
        tone: 'bg-violet-50 text-violet-700 border-violet-100',
      },
    ],
    [summary]
  );

  const handleQuickStart = () => {
    router.push('/peace-quiz/student/start-practice');
  };

  return (
    <section className="mt-6 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="mt-2 text-3xl font-black text-slate-900">{username}</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Welcome back to {programName} Quiz Program. Your current performance snapshot is ready below.
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickStart}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Quick Start Practice
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`rounded-2xl border p-4 ${stat.tone}`}>
                <p className="text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="mt-2 text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Last Attempt Summary</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {summary.totalAttempts ? `Recent Class ${summary.lastClassLevel} Performance` : 'No attempts yet'}
              </h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {summary.averageAccuracy}% average
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Score</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{summary.lastAttemptScore}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{summary.lastAttemptDuration}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weak Subject</p>
              <p className="mt-1 text-xl font-bold text-rose-600">{summary.weakSubject}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Strong Subject</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{summary.strongSubject}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Progress Graph</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Weekly Accuracy Trend</h3>
            </div>
            <p className="text-sm text-slate-500">Past {progressPoints.length} practice sessions</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <svg viewBox="0 0 320 120" className="h-52 w-full" aria-label="Student progress graph">
              <line x1="10" y1="96" x2="310" y2="96" stroke="#cbd5e1" strokeWidth="2" />
              <path d={chartPath} fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {progressPoints.map((value, index) => {
                const x = 12 + index * 48;
                const y = 110 - Math.max(0, Math.min(100, value));
                return <circle key={`${value}-${index}`} cx={x} cy={y} r="5" fill="#4f46e5" />;
              })}
            </svg>
            <div className="mt-2 grid grid-cols-7 text-center text-xs font-medium text-slate-500">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Focus Areas</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Study Guidance</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Weak Subject</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.weakSubject}</p>
              <p className="mt-1 text-sm text-slate-600">Focus on fundamentals and practice topic-wise MCQs.</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Strong Subject</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.strongSubject}</p>
              <p className="mt-1 text-sm text-slate-600">Maintain momentum with timed mixed-topic practice.</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Streak</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.dailyStreak} straight practice day{summary.dailyStreak === 1 ? '' : 's'}</p>
              <p className="mt-1 text-sm text-slate-600">One more session today will keep your streak alive.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
