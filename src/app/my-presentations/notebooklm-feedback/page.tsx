'use client';

import { useMemo, useState } from 'react';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import { QUIZ_QUESTIONS, type QuizOption } from '@/lib/notebooklm-quiz-data';

type Answers = Record<string, QuizOption['id'] | undefined>;

type SubmitResult = {
  mode: 'before' | 'after';
  score: number;
  total: number;
  previousScore?: number;
};

const TOTAL = QUIZ_QUESTIONS.length;

export default function NotebookLmFeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  function selectAnswer(questionId: string, optionId: QuizOption['id']) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function submit() {
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (answeredCount < TOTAL) {
      setError(`Please answer all ${TOTAL} questions (${answeredCount}/${TOTAL} so far).`);
      return;
    }

    const score = QUIZ_QUESTIONS.reduce(
      (total, question) => total + (answers[question.id] === question.correct ? 1 : 0),
      0,
    );

    setLoading(true);
    try {
      const response = await fetch('/api/notebooklm-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          score,
          total: TOTAL,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Could not submit your answers. Please try again.');
      }
      setResult(data as SubmitResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10">
          <HiCheckCircle className="mx-auto h-16 w-16 text-emerald-500" />

          {result.mode === 'before' ? (
            <>
              <h1 className="mt-4 text-2xl font-black text-slate-900">Baseline recorded!</h1>
              <p className="mt-3 text-lg text-slate-700">
                Your pre-workshop score: <span className="font-black text-indigo-600">{result.score}/{result.total}</span>
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Come back to this same link after the workshop and fill it in again with the
                same email to see your before → after improvement.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-2xl font-black text-slate-900">Nice work!</h1>
              <div className="mt-5 flex items-center justify-center gap-4 text-2xl font-black">
                <span className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-500">
                  {result.previousScore ?? 0}/{result.total}
                </span>
                <HiArrowRight className="h-6 w-6 text-indigo-500" />
                <span className="rounded-2xl bg-indigo-600 px-5 py-3 text-white">
                  {result.score}/{result.total}
                </span>
              </div>
              <p className="mt-5 text-sm text-slate-500">
                {result.score > (result.previousScore ?? 0)
                  ? `You improved by ${result.score - (result.previousScore ?? 0)} point${result.score - (result.previousScore ?? 0) === 1 ? '' : 's'} — great progress!`
                  : 'Thanks for completing the post-workshop check-in.'}
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-600">
            NotebookLM Mastery Workshop
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Pre / Post Self-Assessment
          </h1>
          <p className="mt-3 text-slate-600">
            Same 10 questions, filled twice: once before the workshop, once after. Use the same
            email both times so we can match your before → after scores.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          <div className="mt-8 space-y-6">
            {QUIZ_QUESTIONS.map((question, index) => (
              <fieldset key={question.id} className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
                <legend className="text-sm font-bold text-slate-900">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => selectAnswer(question.id, option.id)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {error && <p className="mt-6 text-sm font-semibold text-rose-600">{error}</p>}

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">{answeredCount}/{TOTAL} answered</p>
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit Answers'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
