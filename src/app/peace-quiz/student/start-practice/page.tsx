'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PeaceQuizNavbar from '../../../components/PeaceQuizNavbar';
import { fetchAuthSession } from '../../../lib/auth';
import { getQuizProgramName } from '../../../lib/quizBranding';

type QuizApiResponse = {
  success: boolean;
  totalRows?: number;
  headers?: string[];
  items?: Record<string, string>[];
  classes?: string[];
  subjects?: string[];
  message?: string;
};

type PracticeSessionConfig = {
  classLevel: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: string;
  customQuestionCount: string;
  mode: 'Practice' | 'Timed';
  programName: string;
  updatedAt: string;
  attemptId: string;
};

const LAST_SESSION_KEY = 'mastersahib_last_practice_session';
const createAttemptId = () => `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const difficultyOptions = ['Easy', 'Medium', 'Hard'] as const;
const questionCountOptions = ['10', '20', '50', 'custom'];

export default function StartPracticePage() {
  const router = useRouter();
  const [username, setUsername] = useState('Student');
  const [programName, setProgramName] = useState('');
  const [sessionClassLevel, setSessionClassLevel] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [loadError, setLoadError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasSavedSession, setHasSavedSession] = useState(false);

  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<(typeof difficultyOptions)[number]>('Easy');
  const [questionCount, setQuestionCount] = useState('10');
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  const [mode, setMode] = useState<'Practice' | 'Timed'>('Practice');

  useEffect(() => {
    const loadSession = async () => {
      const session = await fetchAuthSession();
      setUsername(session?.username || 'Student');
      setProgramName(session?.programName || getQuizProgramName());
      setSessionClassLevel(session?.classLevel?.trim() || '');

      const savedSession = localStorage.getItem(LAST_SESSION_KEY);
      setHasSavedSession(Boolean(savedSession));
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (!programName) {
      return;
    }

    const loadClasses = async () => {
      setLoadingClasses(true);
      setLoadError('');

      try {
        const params = new URLSearchParams({ programName, mode: 'classes' });
        const response = await fetch(`/api/peace-quiz/questions?${params.toString()}`, { cache: 'no-store' });
        const payload = (await response.json()) as QuizApiResponse;

        if (!payload.success) {
          throw new Error(payload.message || 'Unable to load classes.');
        }

        const classes = (payload.classes ?? []).filter(Boolean);

        if (!classes.length) {
          throw new Error('No class tabs found in Google Sheet.');
        }

        setClassOptions(classes);
        // Default to student's own class if known, else first tab
        setClassLevel((current) => {
          if (current && classes.includes(current)) return current;
          if (sessionClassLevel && classes.includes(sessionClassLevel)) return sessionClassLevel;
          return classes[0];
        });
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to load classes.');
        setClassOptions([]);
        setClassLevel('');
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, [programName, sessionClassLevel]);

  useEffect(() => {
    if (!programName || !classLevel) {
      return;
    }

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setLoadError('');

      try {
        const params = new URLSearchParams({ programName, mode: 'subjects', classLevel });
        const response = await fetch(`/api/peace-quiz/questions?${params.toString()}`, { cache: 'no-store' });
        const payload = (await response.json()) as QuizApiResponse;

        if (!payload.success) {
          throw new Error(payload.message || 'Unable to load subjects.');
        }

        const subjects = (payload.subjects ?? []).filter(Boolean);

        if (!subjects.length) {
          throw new Error('No subjects found in first column for selected class tab.');
        }

        setSubjectOptions(subjects);
        setSubject((current) => (subjects.includes(current) ? current : subjects[0]));
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to load subjects.');
        setSubjectOptions([]);
        setSubject('');
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [programName, classLevel]);

  const finalQuestionCount = useMemo(() => {
    return questionCount === 'custom' ? customQuestionCount : questionCount;
  }, [questionCount, customQuestionCount]);

  const handleContinueLastSession = () => {
    const rawSession = localStorage.getItem(LAST_SESSION_KEY);
    if (!rawSession) {
      return;
    }

    try {
      const parsed = JSON.parse(rawSession) as PracticeSessionConfig;
      const normalizedSession: PracticeSessionConfig = {
        ...parsed,
        attemptId: parsed.attemptId || createAttemptId(),
      };
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(normalizedSession));
      setClassLevel(normalizedSession.classLevel);
      setSubject(normalizedSession.subject);
      setDifficulty(normalizedSession.difficulty);
      setQuestionCount(normalizedSession.questionCount);
      setCustomQuestionCount(normalizedSession.customQuestionCount);
      setMode(normalizedSession.mode);
      setStatusMessage(`Last session resumed from ${new Date(normalizedSession.updatedAt).toLocaleString()}.`);
      router.push('/peace-quiz/student/attempt');
    } catch {
      setStatusMessage('Could not restore last session.');
    }
  };

  const handleStart = () => {
    if (!classLevel) {
      setStatusMessage('Class load nahi hui. Sheet tabs check karo.');
      return;
    }

    if (!subject) {
      setStatusMessage('Subject load nahi hua. Class tab ka first column check karo.');
      return;
    }

    if (!finalQuestionCount || Number(finalQuestionCount) <= 0) {
      setStatusMessage('Enter a valid number of questions to continue.');
      return;
    }

    const sessionPayload: PracticeSessionConfig = {
      classLevel,
      subject,
      difficulty,
      questionCount,
      customQuestionCount,
      mode,
      programName,
      updatedAt: new Date().toISOString(),
      attemptId: createAttemptId(),
    };

    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(sessionPayload));
    setHasSavedSession(true);
    setStatusMessage(`Practice setup saved for ${subject}. Opening attempt screen...`);
    router.push('/peace-quiz/student/attempt');
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PeaceQuizNavbar role="student" />

        <section className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Start Practice Page</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">Practice Setup for {username}</h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Configure your class, subject, difficulty, and question count before starting a practice session for {programName}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/peace-quiz/student"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
              >
                Back to Dashboard
              </Link>
              <button
                type="button"
                onClick={handleContinueLastSession}
                disabled={!hasSavedSession}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue Last Session
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label htmlFor="class-level" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class Select</label>
                <select
                  id="class-level"
                  value={classLevel}
                  onChange={(event) => setClassLevel(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  disabled={loadingClasses || !classOptions.length}
                >
                  {classOptions.map((classOption) => (
                    <option key={classOption} value={classOption}>
                      {classOption}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {loadingClasses ? 'Loading classes from sheet tabs...' : 'Classes are loaded from your Google Sheet tab names.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label htmlFor="subject-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject Select</label>
                <select
                  id="subject-select"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  disabled={loadingSubjects || !subjectOptions.length}
                >
                  {subjectOptions.map((subjectOption) => (
                    <option key={subjectOption} value={subjectOption}>
                      {subjectOption}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {loadingSubjects
                    ? 'Loading subjects from selected class tab...'
                    : 'Subjects are loaded from first column of selected class tab.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Difficulty</label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {difficultyOptions.map((difficultyOption) => (
                    <button
                      key={difficultyOption}
                      type="button"
                      onClick={() => setDifficulty(difficultyOption)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        difficulty === difficultyOption
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {difficultyOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Number of Questions</label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {questionCountOptions.map((countOption) => (
                    <button
                      key={countOption}
                      type="button"
                      onClick={() => setQuestionCount(countOption)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        questionCount === countOption
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {countOption === 'custom' ? 'Custom' : countOption}
                    </button>
                  ))}
                </div>

                {questionCount === 'custom' ? (
                  <input
                    type="number"
                    min="1"
                    value={customQuestionCount}
                    onChange={(event) => setCustomQuestionCount(event.target.value)}
                    placeholder="Enter custom question count"
                    className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mode</label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMode('Practice')}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      mode === 'Practice'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <p className="font-semibold">Practice</p>
                    <p className={`mt-1 text-sm ${mode === 'Practice' ? 'text-indigo-100' : 'text-slate-500'}`}>
                      Standard practice mode with immediate setup save.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 text-left text-slate-400"
                  >
                    <p className="font-semibold">Timed</p>
                    <p className="mt-1 text-sm">Coming later</p>
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Session Summary</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Ready to Start</h2>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{classLevel}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{subject}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Difficulty</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{difficulty}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Questions</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{finalQuestionCount || '0'}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mode</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{mode}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Start
              </button>

              {statusMessage ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {statusMessage}
                </div>
              ) : null}

              {loadError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {loadError}
                </div>
              ) : null}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
