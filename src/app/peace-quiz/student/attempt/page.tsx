'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PeaceQuizNavbar from '../../../components/PeaceQuizNavbar';
import { fetchAuthSession } from '../../../lib/auth';
import { getQuizProgramName } from '../../../lib/quizBranding';

type QuizApiResponse = {
  success: boolean;
  totalRows?: number;
  headers?: string[];
  items?: Record<string, string>[];
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
};

type AttemptQuestion = {
  id: string;
  text: string;
  options: string[];
  subject: string;
  difficulty: string;
};

type SavedAttemptState = {
  answers: Record<number, number>;
  markedForReview: number[];
  currentIndex: number;
  timerEnabled: boolean;
  elapsedSeconds: number;
};

const LAST_SESSION_KEY = 'mastersahib_last_practice_session';
const ATTEMPT_STATE_KEY_PREFIX = 'mastersahib_attempt_state';
const ATTEMPT_SUBMITTED_KEY_PREFIX = 'mastersahib_attempt_submitted';

const questionKeys = ['question', 'question_text', 'q', 'statement', 'prompt'];
const subjectKeys = ['subject', 'subjects', 'topic', 'category', 'sub_topic'];
const difficultyKeys = ['difficulty', 'level', 'complexity'];
const optionKeys = [
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'option1',
  'option2',
  'option3',
  'option4',
  'a',
  'b',
  'c',
  'd',
];

const getFirstValue = (item: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = item[key]?.trim();
    if (value) {
      return value;
    }
  }

  return '';
};

const parseQuestionItem = (item: Record<string, string>, index: number): AttemptQuestion => {
  const text = getFirstValue(item, questionKeys) || `Question ${index + 1}`;
  const subject = getFirstValue(item, subjectKeys) || 'Mixed Topics';
  const difficulty = getFirstValue(item, difficultyKeys) || 'Medium';

  const options = optionKeys
    .map((key) => item[key]?.trim() || '')
    .filter(Boolean)
    .slice(0, 4);

  if (options.length < 4) {
    const fallbackValues = Object.entries(item)
      .filter(([key, value]) => {
        const normalizedKey = key.toLowerCase();
        if (questionKeys.includes(normalizedKey) || subjectKeys.includes(normalizedKey) || difficultyKeys.includes(normalizedKey)) {
          return false;
        }
        return Boolean(value?.trim());
      })
      .map(([, value]) => value.trim())
      .filter((value) => !options.includes(value));

    for (const fallback of fallbackValues) {
      if (options.length >= 4) {
        break;
      }
      options.push(fallback);
    }
  }

  while (options.length < 4) {
    options.push(`Option ${String.fromCharCode(65 + options.length)}`);
  }

  return {
    id: `q-${index + 1}`,
    text,
    options: options.slice(0, 4),
    subject,
    difficulty,
  };
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function QuizAttemptPage() {
  const [username, setUsername] = useState('Student');
  const [programName, setProgramName] = useState('');
  const [config, setConfig] = useState<PracticeSessionConfig | null>(null);

  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSessionAndConfig = async () => {
      const session = await fetchAuthSession();
      setUsername(session?.username || 'Student');
      setProgramName(session?.programName || getQuizProgramName());

      const rawConfig = localStorage.getItem(LAST_SESSION_KEY);
      if (!rawConfig) {
        setError('No practice setup found. Please configure Start Practice first.');
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(rawConfig) as PracticeSessionConfig;
        setConfig(parsed);
      } catch {
        setError('Invalid practice setup. Please open Start Practice again.');
        setLoading(false);
      }
    };

    loadSessionAndConfig();
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }

    const loadQuestions = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          programName: config.programName || programName,
          classLevel: config.classLevel,
        });
        const response = await fetch(`/api/peace-quiz/questions?${params.toString()}`, { cache: 'no-store' });
        const payload = (await response.json()) as QuizApiResponse;

        if (!payload.success) {
          throw new Error(payload.message || 'Unable to load questions from sheet.');
        }

        const parsedQuestions = (payload.items ?? []).map((item, index) => parseQuestionItem(item, index));

        const filteredBySubject =
          config.subject === 'Mixed Topics'
            ? parsedQuestions
            : parsedQuestions.filter(
                (question) => question.subject.toLowerCase() === config.subject.toLowerCase()
              );

        const filteredByDifficulty = filteredBySubject.filter((question) => {
          if (!question.difficulty) {
            return true;
          }
          return question.difficulty.toLowerCase() === config.difficulty.toLowerCase() || config.difficulty === 'Medium';
        });

        const finalPool = filteredByDifficulty.length ? filteredByDifficulty : filteredBySubject.length ? filteredBySubject : parsedQuestions;

        const requestedCount = Math.max(
          1,
          Number(config.questionCount === 'custom' ? config.customQuestionCount : config.questionCount) || 10
        );

        const selected = finalPool.slice(0, requestedCount);

        if (!selected.length) {
          throw new Error('No questions found for selected filters. Check subject/difficulty columns in sheet.');
        }

        setQuestions(selected);

        const attemptStateKey = `${ATTEMPT_STATE_KEY_PREFIX}_${config.programName}_${username}`;
        const rawAttemptState = localStorage.getItem(attemptStateKey);
        if (rawAttemptState) {
          try {
            const saved = JSON.parse(rawAttemptState) as SavedAttemptState;
            setAnswers(saved.answers || {});
            setMarkedForReview(saved.markedForReview || []);
            setCurrentIndex(Math.min(saved.currentIndex || 0, selected.length - 1));
            setTimerEnabled(Boolean(saved.timerEnabled));
            setElapsedSeconds(saved.elapsedSeconds || 0);
          } catch {
            // Ignore invalid saved state.
          }
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [config, programName, username]);

  useEffect(() => {
    if (!timerEnabled) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timerEnabled]);

  useEffect(() => {
    if (!config || !questions.length) {
      return;
    }

    const attemptStateKey = `${ATTEMPT_STATE_KEY_PREFIX}_${config.programName}_${username}`;
    const statePayload: SavedAttemptState = {
      answers,
      markedForReview,
      currentIndex,
      timerEnabled,
      elapsedSeconds,
    };

    localStorage.setItem(attemptStateKey, JSON.stringify(statePayload));
  }, [answers, markedForReview, currentIndex, timerEnabled, elapsedSeconds, config, questions, username]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((current) => ({ ...current, [currentIndex]: optionIndex }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((current) => {
      if (current.includes(currentIndex)) {
        return current.filter((index) => index !== currentIndex);
      }
      return [...current, currentIndex];
    });
  };

  const handleSubmit = async () => {
    if (!config) {
      return;
    }

    const payload = {
      submittedAt: new Date().toISOString(),
      attempted: answeredCount,
      total: questions.length,
      reviewMarked: markedForReview.length,
      elapsedSeconds,
      mode: config.mode,
      classLevel: config.classLevel,
      subject: config.subject,
      difficulty: config.difficulty,
    };

    localStorage.setItem(`${ATTEMPT_SUBMITTED_KEY_PREFIX}_${config.programName}_${username}`, JSON.stringify(payload));

    try {
      setSubmitting(true);
      const response = await fetch('/api/peace-quiz/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          programName: config.programName,
          classLevel: config.classLevel,
          subject: config.subject,
          difficulty: config.difficulty,
          mode: config.mode,
          attempted: answeredCount,
          total: questions.length,
          reviewMarked: markedForReview.length,
          elapsedSeconds,
          submittedAt: payload.submittedAt,
          status: 'submitted',
        }),
      });

      const result = (await response.json()) as QuizApiResponse;
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not save progress to sheet.');
      }

      setSubmitMessage(`Submitted successfully. Attempted ${answeredCount}/${questions.length} questions. Live sheet sync done.`);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Could not save progress to sheet.';
      setSubmitMessage(`Submitted locally. Sheet sync failed: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <PeaceQuizNavbar role="student" />

        <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Quiz Attempt Screen</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">Question {questions.length ? currentIndex + 1 : 0}/{questions.length || 0}</h1>
              <p className="mt-1 text-sm text-slate-600">Student: {username}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/peace-quiz/student/start-practice"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
              >
                Back to Setup
              </Link>
              <button
                type="button"
                onClick={() => setTimerEnabled((current) => !current)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  timerEnabled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
                }`}
              >
                {timerEnabled ? 'Timer On' : 'Timer Off'}
              </button>
              <span className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          <progress
            className="mt-6 h-3 w-full overflow-hidden rounded-full accent-indigo-600"
            value={progressPercent}
            max={100}
          />
          <p className="mt-2 text-xs font-medium text-slate-500">Progress: {progressPercent}% | Answered: {answeredCount}/{questions.length || 0}</p>

          {loading ? <p className="mt-6 text-slate-600">Loading questions...</p> : null}
          {error ? <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

          {!loading && !error && currentQuestion ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question Text</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">{currentQuestion.text}</h2>

                <div className="mt-6 grid gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const selected = answers[currentIndex] === index;
                    return (
                      <button
                        key={`${currentQuestion.id}-${index}`}
                        type="button"
                        onClick={() => handleSelectOption(index)}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${selected ? 'border-indigo-100 bg-indigo-500 text-white' : 'border-slate-300 text-slate-600'}`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}
                    disabled={currentIndex === 0}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={toggleMarkForReview}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      markedForReview.includes(currentIndex)
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'border border-amber-300 text-amber-700 hover:border-amber-400'
                    }`}
                  >
                    {markedForReview.includes(currentIndex) ? 'Marked for Review' : 'Mark for Review'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentIndex((current) => Math.min(questions.length - 1, current + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Question Palette</p>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const isCurrent = index === currentIndex;
                    const isAnswered = answers[index] !== undefined;
                    const isReview = markedForReview.includes(index);

                    const tone = isCurrent
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : isReview
                        ? 'border-amber-400 bg-amber-100 text-amber-800'
                        : isAnswered
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                          : 'border-slate-300 bg-slate-50 text-slate-700';

                    return (
                      <button
                        key={`palette-${index}`}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${tone}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>

                {submitMessage ? (
                  <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{submitMessage}</p>
                ) : null}

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Auto save is enabled. Answers are saved instantly.
                </div>
              </aside>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
