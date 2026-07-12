'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { speak, shuffle, generateOptions, numberWord } from '@/app/lib/learn-utils';

const TABLES = Array.from({ length: 19 }, (_, i) => i + 2);
const MULTIPLIERS = Array.from({ length: 12 }, (_, i) => i + 1);

function getFacts(table: number): { num: number; answer: number }[] {
  return MULTIPLIERS.map((m) => ({ num: m, answer: table * m }));
}

export default function TableTimesPage() {
  const [table, setTable] = useState(2);
  const [mode, setMode] = useState<'learn' | 'quiz' | 'auto'>('learn');
  const [quizNum, setQuizNum] = useState(1);
  const [quizOpts, setQuizOpts] = useState<number[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [autoIdx, setAutoIdx] = useState(0);
  const [autoCount, setAutoCount] = useState(0);
  const [autoRepeat, setAutoRepeat] = useState(1);
  const [autoLoop, setAutoLoop] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState<'slow' | 'medium' | 'fast' | 'very-fast'>('medium');
  const autoStateRef = useRef({ idx: autoIdx, count: autoCount, repeat: autoRepeat, loop: autoLoop, speed: autoSpeed });
  autoStateRef.current = { idx: autoIdx, count: autoCount, repeat: autoRepeat, loop: autoLoop, speed: autoSpeed };

  const speedInterval: Record<string, number> = { slow: 8000, medium: 6000, fast: 4000, 'very-fast': 2500 };

  const facts = useMemo(() => getFacts(table), [table]);

  const handleStartQuiz = useCallback(() => {
    const n = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
    setQuizNum(n);
    setQuizOpts(generateOptions(table * n));
    setQuizAnswered(false);
    setQuizCorrect(false);
  }, [table]);

  useEffect(() => {
    if (mode === 'quiz') handleStartQuiz();
  }, [mode, handleStartQuiz]);

  const handleAnswer = useCallback((ans: number) => {
    if (quizAnswered) return;
    setTotal((p) => p + 1);
    setQuizAnswered(true);
    const correct = table * quizNum === ans;
    setQuizCorrect(correct);
    speak(correct ? `Yes! ${table} times ${quizNum} is ${ans}` : `No, ${table} times ${quizNum} is ${table * quizNum}`);
    if (correct) setScore((p) => p + 1);
  }, [quizAnswered, table, quizNum]);

  const handleNext = useCallback(() => {
    const n = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
    setQuizNum(n);
    setQuizOpts(generateOptions(table * n));
    setQuizAnswered(false);
    setQuizCorrect(false);
  }, [table]);

  const speakFact = useCallback((fact: { num: number; answer: number }) => {
    speak(`${table} ${numberWord(fact.num)}s are ${fact.answer}`);
  }, [table]);

  useEffect(() => {
    if (!autoRunning || autoPaused) return;
    const interval = setInterval(() => {
      const st = autoStateRef.current;
      if (st.idx >= MULTIPLIERS.length) {
        if (st.loop) {
          setAutoIdx(0); setAutoCount(0);
          speakFact(facts[0]);
          setAutoIdx(1);
        } else {
          setAutoRunning(false); setAutoIdx(0); setAutoCount(0);
        }
        return;
      }
      speakFact(facts[st.idx]);
      const nextCount = st.count + 1;
      if (nextCount >= st.repeat) {
        setAutoIdx((p) => p + 1); setAutoCount(0);
      } else {
        setAutoCount(nextCount);
      }
    }, speedInterval[autoSpeed]);
    return () => clearInterval(interval);
  }, [autoRunning, autoPaused, facts, speakFact, autoSpeed]);

  const handleStartAuto = useCallback(() => {
    setAutoIdx(0); setAutoCount(0);
    setAutoRunning(true); setAutoPaused(false);
    if (facts.length > 0) { speakFact(facts[0]); }
    setAutoIdx(1);
  }, [facts, speakFact]);

  const handlePauseAuto = useCallback(() => {
    setAutoPaused(true);
    window.speechSynthesis.cancel();
  }, []);

  const handleResumeAuto = useCallback(() => {
    setAutoPaused(false);
  }, []);

  const handleStopAuto = useCallback(() => {
    setAutoRunning(false); setAutoPaused(false);
    setAutoIdx(0); setAutoCount(0);
    window.speechSynthesis.cancel();
  }, []);

  const onSelectTable = useCallback((n: number) => {
    setTable(n);
    setMode('learn');
    setScore(0);
    setTotal(0);
    handleStopAuto();
  }, [handleStopAuto]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Ages 5-11 • Mathematics</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">✖️ Table Times Learning</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Learn multiplication tables from 2 to 20 with interactive practice!</p>
          <div className="mt-4">
            <Link href="/teaching-tools" className="inline-block rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
        </section>

        {/* Table Selector */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500">Select a Table</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {TABLES.map((n) => (
              <button key={n} type="button" onClick={() => onSelectTable(n)} className={`h-10 w-10 rounded-xl text-sm font-bold transition hover:scale-110 ${table === n ? 'bg-fuchsia-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{n}</button>
            ))}
          </div>
        </section>

        {/* Mode Switcher */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-2">
            {(['learn', 'auto', 'quiz'] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); handleStopAuto(); }} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === m ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{m === 'learn' ? '📖 Hear & Learn' : m === 'auto' ? '🔄 Listen & Repeat' : '🎯 Quiz'}</button>
            ))}
          </div>
        </section>

        {/* Learn Mode */}
        {mode === 'learn' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-center text-lg font-black text-slate-900">Table of {table}</h2>
            <p className="mt-1 text-center text-xs text-slate-400">Tap any row to hear it</p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {facts.map((f) => (
                <button key={f.num} type="button" onClick={() => speakFact(f)} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 text-center transition hover:scale-105 hover:shadow-md">
                  <span className="text-lg font-black text-fuchsia-700">{table} &times; {f.num}</span>
                  <span className="mt-1 block text-xs text-slate-400">=</span>
                  <span className="mt-0.5 block text-xl font-black text-slate-900">{f.answer}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Listen & Repeat Mode */}
        {mode === 'auto' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            {!autoRunning && !autoPaused ? (
              <>
                <h2 className="text-lg font-black text-slate-900">🔄 Listen & Repeat &mdash; Table of {table}</h2>
                <p className="mt-2 text-sm text-slate-600">Listen to the table being read aloud automatically.</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">Repeat:</span>
                    <button type="button" onClick={() => setAutoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{autoRepeat}</span>
                    <button type="button" onClick={() => setAutoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                    <span className="text-xs text-slate-400">times</span>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={autoLoop} onChange={(e) => setAutoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Speed:</span>
                  {(['very-fast', 'fast', 'medium', 'slow'] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setAutoSpeed(s)} className={`rounded-full px-3 py-1 text-xs font-bold transition ${autoSpeed === s ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s === 'very-fast' ? '⚡ Very Fast' : s === 'fast' ? '🚀 Fast' : s === 'medium' ? '👍 Medium' : '🐢 Slow'}</button>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {facts.map((f) => (
                    <div key={f.num} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                      <span className="text-base font-bold text-slate-800">{f.num === 1 ? `${table} × 1` : `${table} × ${f.num}`}</span>
                      <span className="ml-1 text-base font-black text-fuchsia-700">= {f.answer}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleStartAuto} className="mt-6 rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start Listen & Repeat</button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-slate-900">🔄 Listen & Repeat &mdash; Table of {table}</h2>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500">
                  <span>{autoPaused ? '⏸ Paused' : '▶ Playing'}</span>
                  <span>Fact {autoIdx + 1}/{MULTIPLIERS.length}</span>
                  <span>Repeat {autoCount + 1}/{autoRepeat}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {facts.map((f, i) => (
                    <div key={f.num} className={`rounded-2xl border p-3 text-center transition-all ${i === autoIdx ? 'scale-105 border-fuchsia-400 bg-fuchsia-50 shadow-md' : i < autoIdx ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                      <span className="text-base font-bold text-slate-800">{f.num === 1 ? `${table} × 1` : `${table} × ${f.num}`}</span>
                      <span className="ml-1 text-base font-black text-fuchsia-700">= {f.answer}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  {autoPaused ? (
                    <button type="button" onClick={handleResumeAuto} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">▶ Resume</button>
                  ) : (
                    <button type="button" onClick={handlePauseAuto} className="rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600">⏸ Pause</button>
                  )}
                  <button type="button" onClick={handleStopAuto} className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Quiz Mode */}
        {mode === 'quiz' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            {!total && !quizAnswered ? (
              <>
                <h2 className="text-lg font-black text-slate-900">📖 Review the Table First</h2>
                <p className="mt-2 text-sm text-slate-500">Here&apos;s the table of <strong>{table}</strong>. Click <strong>Start Quiz</strong> when you&apos;re ready!</p>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {facts.map((f) => (
                    <div key={f.num} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
                      <span className="text-base font-bold text-slate-800">{f.num === 1 ? `${table} × 1` : `${table} × ${f.num}`}</span>
                      <span className="ml-1 text-base font-black text-fuchsia-700">= {f.answer}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleStartQuiz} className="mt-6 rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-slate-900">What is {table} &times; {quizNum}?</h2>
                <button type="button" onClick={() => speak(`${table} times ${quizNum}`)} className="mt-1 text-xs text-slate-400 hover:text-slate-600">🔊 Hear the question</button>
                {quizAnswered && (
                  <div className={`mt-4 rounded-2xl p-3 text-sm font-bold ${quizCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {quizCorrect ? '✅ Correct!' : `❌ The answer is ${table * quizNum}`}
                  </div>
                )}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {quizOpts.map((opt) => (
                    <button key={opt} type="button" onClick={() => handleAnswer(opt)} disabled={quizAnswered} className={`rounded-2xl border-2 p-4 text-2xl font-black transition ${quizAnswered ? (opt === table * quizNum ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 opacity-40') : 'border-slate-200 bg-white text-slate-900 hover:border-fuchsia-300 hover:bg-fuchsia-50'}`}>{opt}</button>
                  ))}
                </div>
                {quizAnswered && (
                  <button type="button" onClick={handleNext} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Question →</button>
                )}
                <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
