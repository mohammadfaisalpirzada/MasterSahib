'use client';

import { useMemo, useState } from 'react';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import { QUIZ_QUESTIONS, type QuizOption } from '@/lib/notebooklm-quiz-data';

type Answers = Record<string, QuizOption['id'] | undefined>;
type Lang = 'en' | 'ur';

type SubmitResult = {
  mode: 'before' | 'after';
  score: number;
  total: number;
  previousScore?: number;
};

const TOTAL = QUIZ_QUESTIONS.length;

const COPY: Record<Lang, {
  kicker: string;
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  answered: (n: number, total: number) => string;
  submit: string;
  submitting: string;
  errNameEmail: string;
  errEmail: string;
  errAnswers: (n: number, total: number) => string;
  errGeneric: string;
  beforeHeading: string;
  beforeScoreLabel: string;
  beforeNote: string;
  afterHeading: string;
  afterImproved: (prev: number, score: number, diff: number) => string;
  afterSame: (score: number, total: number) => string;
  afterDropped: (prev: number, score: number) => string;
}> = {
  en: {
    kicker: 'NotebookLM Mastery Workshop',
    title: 'Pre / Post Self-Assessment',
    subtitle: 'Same 10 questions, filled twice: once before the workshop, once after. Use the same email both times so we can match your before → after scores.',
    nameLabel: 'Full name',
    emailLabel: 'Email',
    answered: (n, total) => `${n}/${total} answered`,
    submit: 'Submit Answers',
    submitting: 'Submitting…',
    errNameEmail: 'Please enter your name and email.',
    errEmail: 'Please enter a valid email address.',
    errAnswers: (n, total) => `Please answer all ${total} questions (${n}/${total} so far).`,
    errGeneric: 'Something went wrong. Please try again.',
    beforeHeading: 'Baseline recorded!',
    beforeScoreLabel: 'Your pre-workshop score:',
    beforeNote: 'Come back to this same link after the workshop and fill it in again with the same email to see your before → after result.',
    afterHeading: 'Thanks for finishing!',
    afterImproved: (prev, score, diff) => `You went from ${prev}/${TOTAL} to ${score}/${TOTAL} — a gain of ${diff}. Well done!`,
    afterSame: (score, total) => `You scored ${score}/${total} both times — consistent!`,
    afterDropped: (prev, score) => `You scored ${score}/${TOTAL} this time, compared to ${prev}/${TOTAL} before. That's completely normal — feel free to revisit the material anytime.`,
  },
  ur: {
    kicker: 'نوٹ بک ایل ایم ماسٹری ورکشاپ',
    title: 'ورکشاپ سے پہلے / بعد کا خود جائزہ',
    subtitle: 'یہ 10 سوالات دو بار پُر کیے جاتے ہیں: ایک بار ورکشاپ سے پہلے، ایک بار بعد میں۔ دونوں بار ایک ہی ای میل استعمال کریں تاکہ آپ کے پہلے اور بعد کے نمبروں کا موازنہ ہو سکے۔',
    nameLabel: 'پورا نام',
    emailLabel: 'ای میل',
    answered: (n, total) => `${n}/${total} جواب دیے گئے`,
    submit: 'جوابات جمع کروائیں',
    submitting: 'جمع ہو رہا ہے…',
    errNameEmail: 'براہ کرم اپنا نام اور ای میل درج کریں۔',
    errEmail: 'براہ کرم ایک درست ای میل ایڈریس درج کریں۔',
    errAnswers: (n, total) => `براہ کرم تمام ${total} سوالات کے جواب دیں (ابھی تک ${n}/${total})۔`,
    errGeneric: 'کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔',
    beforeHeading: 'آپ کا ابتدائی اسکور محفوظ ہو گیا!',
    beforeScoreLabel: 'ورکشاپ سے پہلے کا آپ کا اسکور:',
    beforeNote: 'ورکشاپ کے بعد اسی لنک پر آ کر، اسی ای میل کے ساتھ دوبارہ فارم پُر کریں تاکہ آپ اپنا پہلے اور بعد کا نتیجہ دیکھ سکیں۔',
    afterHeading: 'مکمل کرنے کا شکریہ!',
    afterImproved: (prev, score, diff) => `آپ کا اسکور ${prev}/${TOTAL} سے بڑھ کر ${score}/${TOTAL} ہو گیا — ${diff} نمبروں کا اضافہ۔ شاباش!`,
    afterSame: (score, total) => `دونوں بار آپ کا اسکور ${score}/${total} رہا — یکسانیت اچھی بات ہے!`,
    afterDropped: (prev, score) => `اس بار آپ کا اسکور ${score}/${TOTAL} رہا، جبکہ پہلے یہ ${prev}/${TOTAL} تھا۔ یہ بالکل معمول کی بات ہے — جب چاہیں مواد دوبارہ دیکھ سکتے ہیں۔`,
  },
};

export default function NotebookLmFeedbackPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);

  const t = COPY[lang];
  const isUr = lang === 'ur';

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
      setError(t.errNameEmail);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t.errEmail);
      return;
    }
    if (answeredCount < TOTAL) {
      setError(t.errAnswers(answeredCount, TOTAL));
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
        throw new Error(data?.message || t.errGeneric);
      }
      setResult(data as SubmitResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errGeneric);
    } finally {
      setLoading(false);
    }
  }

  const LangToggle = (
    <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-bold shadow-sm">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 transition ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ur')}
        className={`px-3 py-1.5 transition ${lang === 'ur' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
      >
        UR
      </button>
    </div>
  );

  if (result) {
    let diff = 0;
    let comparison: 'improved' | 'same' | 'dropped' = 'same';
    if (result.mode === 'after') {
      const prev = result.previousScore ?? 0;
      diff = result.score - prev;
      comparison = diff > 0 ? 'improved' : diff < 0 ? 'dropped' : 'same';
    }

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl">
          <div className="mb-4 flex justify-end">{LangToggle}</div>
          <div
            dir={isUr ? 'rtl' : 'ltr'}
            className="rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10"
          >
            <HiCheckCircle className="mx-auto h-16 w-16 text-emerald-500" />

            {result.mode === 'before' ? (
              <>
                <h1 className="mt-4 text-2xl font-black text-slate-900">{t.beforeHeading}</h1>
                <p className="mt-3 text-lg text-slate-700">
                  {t.beforeScoreLabel}{' '}
                  <span className="font-black text-indigo-600">{result.score}/{result.total}</span>
                </p>
                <p className="mt-4 text-sm text-slate-500">{t.beforeNote}</p>
              </>
            ) : (
              <>
                <h1 className="mt-4 text-2xl font-black text-slate-900">{t.afterHeading}</h1>
                <div className="mt-5 flex items-center justify-center gap-4 text-2xl font-black">
                  <span className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-500">
                    {result.previousScore ?? 0}/{result.total}
                  </span>
                  <HiArrowRight className={`h-6 w-6 text-indigo-500 ${isUr ? 'rotate-180' : ''}`} />
                  <span className="rounded-2xl bg-indigo-600 px-5 py-3 text-white">
                    {result.score}/{result.total}
                  </span>
                </div>
                <p className="mt-5 text-sm text-slate-500">
                  {comparison === 'improved'
                    ? t.afterImproved(result.previousScore ?? 0, result.score, diff)
                    : comparison === 'dropped'
                      ? t.afterDropped(result.previousScore ?? 0, result.score)
                      : t.afterSame(result.score, result.total)}
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end">{LangToggle}</div>

        <div dir={isUr ? 'rtl' : 'ltr'} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-600">
            {t.kicker}
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-slate-600">{t.subtitle}</p>
        </div>

        <div dir={isUr ? 'rtl' : 'ltr'} className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              {t.nameLabel}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              {t.emailLabel}
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-normal outline-none focus:border-indigo-500"
              />
            </label>
          </div>

          <div className="mt-8 space-y-6">
            {QUIZ_QUESTIONS.map((question, index) => (
              <fieldset key={question.id} className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
                <legend className="text-sm font-bold text-slate-900">
                  {index + 1}. {isUr ? question.promptUr : question.prompt}
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => selectAnswer(question.id, option.id)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${isUr ? 'text-right' : 'text-left'} ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {isUr ? option.textUr : option.text}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {error && <p className="mt-6 text-sm font-semibold text-rose-600">{error}</p>}

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">{t.answered(answeredCount, TOTAL)}</p>
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white disabled:opacity-60"
            >
              {loading ? t.submitting : t.submit}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
