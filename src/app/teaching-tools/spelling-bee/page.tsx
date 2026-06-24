'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const WORDS = [
  { word: 'cat', hint: 'A small furry pet' },
  { word: 'dog', hint: 'A pet that barks' },
  { word: 'sun', hint: 'It shines in the day' },
  { word: 'hat', hint: 'You wear it on your head' },
  { word: 'ball', hint: 'Round toy you throw' },
  { word: 'fish', hint: 'Swims in water' },
  { word: 'bird', hint: 'Has wings and flies' },
  { word: 'book', hint: 'You read it' },
  { word: 'tree', hint: 'Tall plant with leaves' },
  { word: 'star', hint: 'Twinkles at night' },
  { word: 'moon', hint: 'Seen in the night sky' },
  { word: 'rain', hint: 'Water from clouds' },
  { word: 'door', hint: 'You open it to enter' },
  { word: 'bell', hint: 'Makes a ringing sound' },
  { word: 'duck', hint: 'A bird that quacks' },
  { word: 'frog', hint: 'Green animal that jumps' },
  { word: 'lion', hint: 'King of the jungle' },
  { word: 'baby', hint: 'A very young child' },
  { word: 'cake', hint: 'A sweet birthday treat' },
  { word: 'milk', hint: 'White drink from cows' },
];

const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.7;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

export default function SpellingBeePage() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const w = WORDS[idx].word;
    const shuffled = w.split('').sort(() => Math.random() - 0.5);
    setLetters(shuffled);
    setSelected([]);
  }, [idx]);

  const handleLetterClick = useCallback((ch: string, i: number) => {
    if (answered) return;
    setSelected((p) => [...p, ch]);
    setLetters((p) => p.map((c, j) => j === i ? '' : c));
  }, [answered]);

  const handleUndo = useCallback(() => {
    if (answered || selected.length === 0) return;
    const last = selected[selected.length - 1];
    setSelected((p) => p.slice(0, -1));
    setLetters((p) => {
      const idx = p.indexOf('');
      if (idx === -1) return p;
      const next = [...p];
      next[idx] = last;
      return next;
    });
  }, [answered, selected]);

  const handleCheck = useCallback(() => {
    const word = selected.join('');
    if (!word) return;
    setTotal((p) => p + 1);
    setAnswered(true);
    if (word === WORDS[idx].word) {
      setScore((p) => p + 1);
      setCorrect(true);
      speak(`Correct! ${WORDS[idx].word}`);
    } else {
      setCorrect(false);
      speak(`The word is ${WORDS[idx].word}`);
    }
  }, [selected, idx]);

  const nextWord = useCallback(() => {
    let n: number;
    do { n = Math.floor(Math.random() * WORDS.length); } while (n === idx && WORDS.length > 1);
    setIdx(n);
    setInput('');
    setAnswered(false);
    setCorrect(false);
    setSelected([]);
  }, [idx]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Ages 3-6 • Spelling Practice</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">✏️ Spelling Bee</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Listen to the word, then spell it by choosing the right letters!</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h2 className="text-xl font-bold text-slate-900">Spell this word</h2>
          <p className="mt-2 text-sm text-slate-500 italic">&ldquo;{WORDS[idx].hint}&rdquo;</p>
          <button type="button" onClick={() => speak(WORDS[idx].word)} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200">
            🔊 Hear the word
          </button>

          {answered && (
            <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {correct ? '✅ Great job! That\'s correct!' : `❌ The word is: ${WORDS[idx].word}`}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-2">
            {WORDS[idx].word.split('').map((_, i) => (
              <div key={i} className={`flex h-12 w-10 items-center justify-center rounded-xl border-b-2 text-xl font-bold transition-all ${selected[i] ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-300'}`}>
                {selected[i] || '_'}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {letters.map((ch, i) => (
              ch ? (
                <button key={i} type="button" onClick={() => handleLetterClick(ch, i)} disabled={answered} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white shadow transition hover:scale-110 hover:shadow-md disabled:opacity-30">
                  {ch}
                </button>
              ) : (
                <div key={i} className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200" />
              )
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={handleUndo} disabled={answered || selected.length === 0} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">⌫ Undo</button>
            {!answered ? (
              <button type="button" onClick={handleCheck} disabled={selected.length !== WORDS[idx].word.length} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">Check Spelling</button>
            ) : (
              <button type="button" onClick={nextWord} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">Next Word →</button>
            )}
          </div>

          <div className="mt-6 text-sm text-slate-500">Score: {score}/{total}</div>

          <div className="mt-4 flex justify-center gap-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i < score ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400">Tap 🔊 to hear pronunciation. Drag letters to spell the word!</footer>
      </div>
    </main>
  );
}
