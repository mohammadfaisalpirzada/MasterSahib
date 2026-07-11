'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.8; u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

const NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);

const CELL_COLORS = [
  'from-pink-400 to-rose-400',
  'from-orange-400 to-amber-400',
  'from-yellow-400 to-lime-400',
  'from-green-400 to-emerald-400',
  'from-cyan-400 to-teal-400',
  'from-blue-400 to-indigo-400',
  'from-violet-400 to-purple-400',
  'from-fuchsia-400 to-pink-400',
  'from-rose-400 to-red-400',
  'from-sky-400 to-blue-400',
];

const getColor = (n: number) => CELL_COLORS[(n - 1) % 10];

type Mode = 'explore' | 'find' | 'count';

export default function NumberFunPage() {
  const [mode, setMode] = useState<Mode>('explore');
  const [target, setTarget] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [countBy, setCountBy] = useState<2 | 5 | 10 | null>(null);

  const pickNewTarget = useCallback(() => {
    let n: number;
    do { n = Math.floor(Math.random() * 100) + 1; } while (n === target);
    setTarget(n);
    setTimeout(() => speak(String(n)), 400);
  }, [target]);

  useEffect(() => {
    if (mode === 'find' && target === null) pickNewTarget();
  }, [mode, target, pickNewTarget]);

  const handleCellClick = useCallback((n: number) => {
    if (mode === 'explore') {
      speak(String(n));
    } else if (mode === 'find') {
      if (!target) return;
      setTotal((p) => p + 1);
      if (n === target) {
        setScore((p) => p + 1);
        setMessage(`✅ Yes! ${n} is correct!`);
        setTimeout(() => { setMessage(''); pickNewTarget(); }, 2000);
      } else {
        setMessage(`❌ That's ${n}. Try again!`);
        setTimeout(() => setMessage(''), 1500);
      }
    }
  }, [mode, target, pickNewTarget]);

  const isHighlighted = useCallback((n: number) => {
    if (mode !== 'count' || countBy === null) return false;
    return n % countBy === 0;
  }, [mode, countBy]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-purple-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">🔢 Numbers 1–100</h1>
          <div className="w-20" />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {(['explore', 'find', 'count'] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setTarget(null); setMessage(''); setScore(0); setTotal(0); setCountBy(null); }} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === m ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              {m === 'explore' ? '👆 Explore' : m === 'find' ? '🎯 Find the Number' : '🔢 Count By'}
            </button>
          ))}
        </div>

        {mode === 'find' && (
          <div className="mb-4 text-center">
            <p className="text-lg font-bold text-indigo-700">Find the number: {target ?? '...'} <button type="button" onClick={() => target && speak(String(target))} className="ml-1 text-sm text-slate-400 hover:text-slate-600">🔊</button></p>
            <p className="mt-1 text-sm text-slate-500">Score: {score}/{total}</p>
            {message && (
              <div className={`mx-auto mt-2 inline-block rounded-2xl px-5 py-2 text-sm font-bold ${message.startsWith('✅') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{message}</div>
            )}
          </div>
        )}

        {mode === 'count' && (
          <div className="mb-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm font-semibold text-slate-600">Skip count by:</span>
              {([2, 5, 10] as const).map((n) => (
                <button key={n} type="button" onClick={() => setCountBy(countBy === n ? null : n)} className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${countBy === n ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{n}s</button>
              ))}
            </div>
            {countBy && <p className="mt-2 text-sm text-indigo-600">✨ Highlighted: {countBy}, {countBy * 2}, {countBy * 3}...</p>}
          </div>
        )}

        <div className="grid grid-cols-10 gap-2">
          {NUMBERS.map((n) => (
            <button key={n} type="button" onClick={() => handleCellClick(n)} className={`flex h-14 w-full items-center justify-center rounded-2xl text-lg font-black text-white shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95 ${getColor(n)} bg-gradient-to-br ${isHighlighted(n) ? 'ring-4 ring-yellow-300 ring-offset-2' : ''}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
