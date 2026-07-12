'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { speak, shuffle } from '@/app/lib/learn-utils';

type Letter = { upper: string; lower: string; emoji: string; name: string };

const LETTERS: Letter[] = [
  { upper: 'A', lower: 'a', emoji: '🍎', name: 'A' },
  { upper: 'B', lower: 'b', emoji: '🐻', name: 'B' },
  { upper: 'C', lower: 'c', emoji: '🐱', name: 'C' },
  { upper: 'D', lower: 'd', emoji: '🐶', name: 'D' },
  { upper: 'E', lower: 'e', emoji: '🐘', name: 'E' },
  { upper: 'F', lower: 'f', emoji: '🐸', name: 'F' },
  { upper: 'G', lower: 'g', emoji: '🦒', name: 'G' },
  { upper: 'H', lower: 'h', emoji: '🐴', name: 'H' },
  { upper: 'I', lower: 'i', emoji: '🍦', name: 'I' },
  { upper: 'J', lower: 'j', emoji: '🪀', name: 'J' },
  { upper: 'K', lower: 'k', emoji: '🪁', name: 'K' },
  { upper: 'L', lower: 'l', emoji: '🍋', name: 'L' },
  { upper: 'M', lower: 'm', emoji: '🐵', name: 'M' },
  { upper: 'N', lower: 'n', emoji: '🪺', name: 'N' },
  { upper: 'O', lower: 'o', emoji: '🐙', name: 'O' },
  { upper: 'P', lower: 'p', emoji: '🐷', name: 'P' },
  { upper: 'Q', lower: 'q', emoji: '🦆', name: 'Q' },
  { upper: 'R', lower: 'r', emoji: '🐰', name: 'R' },
  { upper: 'S', lower: 's', emoji: '🐍', name: 'S' },
  { upper: 'T', lower: 't', emoji: '🐯', name: 'T' },
  { upper: 'U', lower: 'u', emoji: '☂️', name: 'U' },
  { upper: 'V', lower: 'v', emoji: '🎻', name: 'V' },
  { upper: 'W', lower: 'w', emoji: '🐋', name: 'W' },
  { upper: 'X', lower: 'x', emoji: '❌', name: 'X' },
  { upper: 'Y', lower: 'y', emoji: '🪀', name: 'Y' },
  { upper: 'Z', lower: 'z', emoji: '🦓', name: 'Z' },
];

const COLORS = [
  'from-rose-400 to-pink-500',
  'from-orange-400 to-amber-500',
  'from-amber-400 to-yellow-500',
  'from-lime-400 to-green-500',
  'from-emerald-400 to-teal-500',
  'from-cyan-400 to-sky-500',
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-500',
  'from-fuchsia-400 to-pink-500',
  'from-pink-400 to-rose-500',
  'from-teal-400 to-cyan-500',
  'from-yellow-400 to-orange-500',
  'from-green-400 to-emerald-500',
  'from-sky-400 to-blue-500',
  'from-indigo-400 to-violet-500',
  'from-purple-400 to-fuchsia-500',
  'from-rose-500 to-red-500',
  'from-orange-500 to-amber-600',
  'from-lime-500 to-green-600',
  'from-cyan-500 to-sky-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-teal-500 to-cyan-600',
  'from-yellow-500 to-orange-600',
  'from-green-500 to-emerald-600',
];

const CARD_BG = [
  'bg-rose-50', 'bg-orange-50', 'bg-amber-50', 'bg-yellow-50', 'bg-lime-50',
  'bg-green-50', 'bg-emerald-50', 'bg-teal-50', 'bg-cyan-50', 'bg-sky-50',
  'bg-blue-50', 'bg-indigo-50', 'bg-violet-50', 'bg-purple-50', 'bg-fuchsia-50',
  'bg-pink-50', 'bg-rose-50', 'bg-orange-50', 'bg-amber-50', 'bg-yellow-50',
  'bg-lime-50', 'bg-green-50', 'bg-emerald-50', 'bg-teal-50', 'bg-cyan-50',
  'bg-sky-50',
];

export default function AlphabetLearningPage() {
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [quizLetter, setQuizLetter] = useState<Letter>(LETTERS[0]);
  const [quizOptions, setQuizOptions] = useState<Letter[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const startQuiz = useCallback(() => {
    const idx = Math.floor(Math.random() * LETTERS.length);
    const correct = LETTERS[idx];
    const pool = LETTERS.filter((_, i) => i !== idx);
    const opts = shuffle([correct, ...pool.slice(0, 3)]);
    setQuizLetter(correct);
    setQuizOptions(shuffle(opts));
    setQuizAnswered(false);
    setQuizCorrect(false);
    setTimeout(() => speak(correct.name), 300);
  }, []);

  useEffect(() => {
    if (mode === 'quiz') startQuiz();
  }, [mode, startQuiz]);

  const handleQuizAnswer = useCallback((letter: Letter) => {
    if (quizAnswered) return;
    setTotal((p) => p + 1);
    setQuizAnswered(true);
    if (letter.upper === quizLetter.upper) {
      setScore((p) => p + 1);
      setQuizCorrect(true);
      speak(`Yes! ${quizLetter.upper}`);
    } else {
      setQuizCorrect(false);
      speak(`It's ${quizLetter.upper}`);
    }
  }, [quizAnswered, quizLetter]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-purple-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Ages 3-6 • Letters</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">🔤 Alphabet Learning</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Learn your ABCs with letters, sounds, and pictures!</p>
            </div>
            {mode === 'quiz' && (
              <div className="rounded-2xl bg-indigo-100 px-4 py-2 text-center">
                <p className="text-xs font-semibold text-indigo-600">Score</p>
                <p className="text-xl font-black text-indigo-700">{score}/{total}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setMode('learn'); setScore(0); setTotal(0); }} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === 'learn' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📖 Learn</button>
              <button type="button" onClick={() => { setMode('quiz'); setScore(0); setTotal(0); }} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === 'quiz' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>🎯 Quiz Me</button>
            </div>
          </div>
        </section>

        {mode === 'learn' ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">All Letters</h2>
            <p className="text-xs text-slate-500">Tap a letter to hear its name</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {LETTERS.map((letter, i) => (
                <button
                  key={letter.upper}
                  type="button"
                  onClick={() => speak(letter.name)}
                  className={`group flex flex-col items-center gap-1 rounded-2xl border-2 border-transparent p-4 transition hover:scale-105 hover:shadow-lg ${CARD_BG[i]} hover:border-indigo-300`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${COLORS[i]} shadow-md`}>
                    <span className="text-2xl font-black text-white">{letter.upper}{letter.lower}</span>
                  </div>
                  <span className="text-3xl">{letter.emoji}</span>
                  <span className="text-xs font-bold text-slate-600">{letter.upper}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-900">Find the Letter</h2>
            <p className="mt-1 text-xs text-slate-500">Which letter makes this sound?</p>
            <button type="button" onClick={() => speak(quizLetter.name)} className="mt-1 text-xs text-indigo-400 hover:text-indigo-600">🔊 Hear it again</button>

            {quizAnswered && (
              <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ${quizCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {quizCorrect ? '✅ Correct!' : `❌ It's ${quizLetter.upper}`}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {quizOptions.map((letter, i) => (
                <button
                  key={letter.upper}
                  type="button"
                  onClick={() => handleQuizAnswer(letter)}
                  disabled={quizAnswered}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-5 transition ${
                    quizAnswered && letter.upper === quizLetter.upper
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200'
                      : quizAnswered && letter.upper !== quizLetter.upper
                      ? 'border-slate-200 bg-slate-50 opacity-50'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  } border-2`}
                >
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${COLORS[i]} shadow-md`}>
                    <span className="text-3xl font-black text-white">{letter.upper}{letter.lower}</span>
                  </div>
                  <span className="text-3xl">{letter.emoji}</span>
                  <span className="text-sm font-bold text-slate-700">{letter.upper}</span>
                </button>
              ))}
            </div>

            {quizAnswered && (
              <button type="button" onClick={startQuiz} className="mt-6 rounded-xl bg-indigo-600 px-8 py-3 text-base font-bold text-white transition hover:bg-indigo-700">
                Next →
              </button>
            )}

            <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
          </section>
        )}
      </div>
    </main>
  );
}
