'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

type Question = {
  sentence: string;
  blank: string;
  options: string[];
  answer: string;
};

const QUESTIONS: Question[] = [
  { sentence: 'The ___ is shining in the sky.', blank: 'sun', options: ['sun', 'moon', 'star', 'cloud'], answer: 'sun' },
  { sentence: 'I drink ___ every morning.', blank: 'milk', options: ['water', 'milk', 'juice', 'tea'], answer: 'milk' },
  { sentence: 'A ___ can fly in the sky.', blank: 'bird', options: ['fish', 'dog', 'bird', 'cat'], answer: 'bird' },
  { sentence: 'We sit on a ___.', blank: 'chair', options: ['table', 'chair', 'bed', 'door'], answer: 'chair' },
  { sentence: 'The ___ is green and grows in the ground.', blank: 'tree', options: ['tree', 'rock', 'house', 'car'], answer: 'tree' },
  { sentence: 'I wear a ___ on my head.', blank: 'hat', options: ['shoe', 'hat', 'glove', 'sock'], answer: 'hat' },
  { sentence: 'A ___ says woof woof.', blank: 'dog', options: ['cat', 'duck', 'dog', 'frog'], answer: 'dog' },
  { sentence: 'The ___ is very hot.', blank: 'fire', options: ['ice', 'fire', 'water', 'wind'], answer: 'fire' },
  { sentence: 'I read a ___ every night.', blank: 'book', options: ['book', 'toy', 'ball', 'cup'], answer: 'book' },
  { sentence: 'We sleep on a ___.', blank: 'bed', options: ['chair', 'table', 'bed', 'floor'], answer: 'bed' },
  { sentence: 'The ___ is swimming in the pond.', blank: 'duck', options: ['duck', 'cat', 'dog', 'frog'], answer: 'duck' },
  { sentence: 'I eat an ___ for a snack.', blank: 'apple', options: ['apple', 'bread', 'rice', 'meat'], answer: 'apple' },
  { sentence: 'The ___ is big and yellow.', blank: 'bus', options: ['car', 'bus', 'bike', 'train'], answer: 'bus' },
  { sentence: 'I have two ___ and two feet.', blank: 'hands', options: ['hands', 'eyes', 'ears', 'wings'], answer: 'hands' },
  { sentence: 'The ___ is bright at night.', blank: 'moon', options: ['sun', 'star', 'moon', 'lamp'], answer: 'moon' },
];

const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
};

export default function FillBlanksPage() {
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const q = QUESTIONS[qIdx];

  const handleSelect = useCallback((opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTotal((p) => p + 1);
    if (opt === q.answer) {
      setScore((p) => p + 1);
      setCorrect(true);
      speak(`Correct! ${q.sentence.replace('___', q.answer)}`);
    } else {
      setCorrect(false);
      speak(`The answer is ${q.answer}. ${q.sentence.replace('___', q.answer)}`);
    }
  }, [answered, q]);

  const next = useCallback(() => {
    let n: number;
    do { n = Math.floor(Math.random() * QUESTIONS.length); } while (n === qIdx && QUESTIONS.length > 1);
    setQIdx(n);
    setAnswered(false);
    setCorrect(false);
    setSelected(null);
  }, [qIdx]);

  const parts = q.sentence.split('___');

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Ages 3-6 • Vocabulary</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">📝 Fill in the Blanks</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Read the sentence and pick the correct word to fill in the blank!</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-2 w-8 rounded-full ${i < Math.ceil((score / Math.max(total, 1)) * 5) ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            ))}
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">Complete the sentence</h2>

          <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
            <p className="text-xl font-semibold leading-8 text-slate-800">
              {parts[0]}
              <span className={`mx-1 inline-block min-w-[80px] rounded-xl border-b-4 px-3 py-1 text-xl font-bold transition-all ${answered ? (correct ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700') : 'border-indigo-300 bg-white text-indigo-600'}`}>
                {selected || '______'}
              </span>
              {parts[1]}
            </p>
            <button type="button" onClick={() => speak(q.sentence.replace('___', q.answer))} className="mt-3 text-xs text-slate-400 hover:text-slate-600">🔊 Read aloud</button>
          </div>

          {answered && (
            <div className={`mt-4 rounded-2xl p-3 text-sm font-bold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {correct ? '✅ Correct!' : `❌ The answer is "${q.answer}"`}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {q.options.map((opt) => {
              let cls = 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50';
              if (answered && opt === q.answer) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200';
              else if (answered && opt === selected && opt !== q.answer) cls = 'border-rose-400 bg-rose-50 text-rose-700';
              else if (answered) cls = 'opacity-50 border-slate-200 bg-slate-50 text-slate-400';
              return (
                <button key={opt} type="button" onClick={() => handleSelect(opt)} disabled={answered} className={`rounded-2xl border-2 px-6 py-3 text-base font-bold transition-all ${cls}`}>
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && (
            <button type="button" onClick={next} className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">Next Question →</button>
          )}

          <div className="mt-6 text-sm text-slate-500">Score: {score}/{total}</div>
        </section>

        <footer className="text-center text-xs text-slate-400">Read the sentence carefully and pick the best word to complete it!</footer>
      </div>
    </main>
  );
}
