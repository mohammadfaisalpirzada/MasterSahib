'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

type WordItem = { name: string; emoji: string };

const VEGETABLES: WordItem[] = [
  { name: 'Potato', emoji: '🥔' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Cabbage', emoji: '🥬' },
  { name: 'Radish', emoji: '🥕' },
  { name: 'Carrot', emoji: '🥕' },
  { name: 'Ladyfinger', emoji: '🥒' },
  { name: 'Peas', emoji: '🫛' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Brinjal', emoji: '🍆' },
  { name: 'Cucumber', emoji: '🥒' },
];

export default function VegTab() {
  const [vegSub, setVegSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [vegIdx, setVegIdx] = useState(0);
  const [vegQuiz, setVegQuiz] = useState(false);
  const [vegAnswered, setVegAnswered] = useState(false);
  const [vegCorrect, setVegCorrect] = useState(false);
  const [vegScore, setVegScore] = useState(0);
  const [vegTotal, setVegTotal] = useState(0);
  const [vMemoRunning, setVMemoRunning] = useState(false);
  const [vMemoLocked, setVMemoLocked] = useState(false);
  const [vMemoPaused, setVMemoPaused] = useState(false);
  const [vMemoCount, setVMemoCount] = useState(0);
  const [vMemoRepeat, setVMemoRepeat] = useState(1);
  const [vMemoLoop, setVMemoLoop] = useState(false);
  const [vMemoIdx, setVMemoIdx] = useState(0);
  const [vegFibResult, setVegFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [vegFibInput, setVegFibInput] = useState('');
  const [vegTestIdx, setVegTestIdx] = useState(0);
  const [vegTestAnswered, setVegTestAnswered] = useState(false);
  const [vegTestCorrect, setVegTestCorrect] = useState(false);
  const [vegTestScore, setVegTestScore] = useState(0);
  const [vegTestTotal, setVegTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (vMemoRunning && !vMemoPaused) {
      (async () => {
        try {
          if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch {}
      })();
    }
    return () => {
      if (wakeLock) {
        (wakeLock as any).release().catch(() => {});
      }
    };
  }, [vMemoRunning, vMemoPaused]);

  useEffect(() => {
    if (!vMemoRunning || vMemoPaused) return;
    const item = VEGETABLES[vMemoIdx].name;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setVMemoCount((c) => {
          const next = c + 1;
          if (next >= vMemoRepeat) {
            const nextIdx = (vMemoIdx + 1) % VEGETABLES.length;
            if (nextIdx === 0 && !vMemoLoop) {
              setVMemoRunning(false);
              return 0;
            }
            setVMemoIdx(nextIdx);
            return 0;
          }
          return next;
        });
      },
      300 + item.length * letterTime + finalNameTime + pauseAfter,
    );
    return () => {
      clearTimeout(spellTimer);
      clearTimeout(advanceTimer);
    };
  }, [vMemoRunning, vMemoPaused, vMemoLocked, vMemoIdx, vMemoCount, vMemoRepeat, vMemoLoop]);

  useEffect(() => {
    if (vegSub === 'test' && !vegTestAnswered) {
      speakThenSpell(VEGETABLES[vegTestIdx % VEGETABLES.length].name);
    }
  }, [vegSub, vegTestIdx, vegTestAnswered]);

  const handleVegClick = useCallback(
    (c: string) => {
      if (vegAnswered) return;
      setVegAnswered(true);
      setVegTotal((p) => p + 1);
      if (c === VEGETABLES[vegIdx].name) {
        setVegScore((p) => p + 1);
        setVegCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setVegCorrect(false);
        speak(`This is ${VEGETABLES[vegIdx].name}`);
      }
    },
    [vegAnswered, vegIdx],
  );

  const handleVegFib = useCallback(() => {
    if (vegAnswered || !vegFibInput.trim()) return;
    setVegAnswered(true);
    setVegTotal((p) => p + 1);
    if (vegFibInput.trim().toLowerCase() === VEGETABLES[vegIdx].name.toLowerCase()) {
      setVegScore((p) => p + 1);
      setVegCorrect(true);
      setVegFibResult('correct');
      speak(`Yes! ${VEGETABLES[vegIdx].name}`);
    } else {
      setVegFibResult('wrong');
      setVegCorrect(false);
      speak(`This is ${VEGETABLES[vegIdx].name}`);
    }
  }, [vegAnswered, vegFibInput, vegIdx]);

  const handleVegTestClick = useCallback(
    (clickedWord: string) => {
      if (vegTestAnswered) return;
      setVegTestTotal((p) => p + 1);
      setVegTestAnswered(true);
      const correct = clickedWord === VEGETABLES[vegTestIdx % VEGETABLES.length].name;
      setVegTestCorrect(correct);
      if (correct) setVegTestScore((p) => p + 1);
      setTimeout(
        () => {
          setVegTestIdx((p) => p + 1);
          setVegTestAnswered(false);
          setVegTestCorrect(false);
        },
        quizDelay(VEGETABLES[vegTestIdx % VEGETABLES.length].name),
      );
    },
    [vegTestAnswered, vegTestIdx],
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex gap-2">
          {(['learn', 'quiz', 'fib', 'test'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setVegSub(m);
                setVegAnswered(false);
                setVegCorrect(false);
                setVegQuiz(false);
                setVMemoRunning(false);
                setVMemoLocked(false);
                setVegFibResult(null);
                setVegFibInput('');
                setVegTestIdx(Math.floor(Math.random() * VEGETABLES.length));
                setVegTestAnswered(false);
                setVegTestCorrect(false);
                setVegTestScore(0);
                setVegTestTotal(0);
                if (m === 'fib') setVegQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${vegSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {vegSub === 'learn' && vMemoRunning && !vMemoLocked && !vMemoPaused && (
          <button type="button" onClick={() => setVMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {vegSub === 'test' ? (
        (() => {
          const currentWord = VEGETABLES[vegTestIdx % VEGETABLES.length].name;
          const testOptions = [
            currentWord,
            ...VEGETABLES.filter((_, i) => i !== vegTestIdx % VEGETABLES.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((v) => v.name),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which vegetable did you hear?</h2>
              {vegTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${vegTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{vegTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleVegTestClick(w)} disabled={vegTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${vegTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${vegTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {vegTestScore}/{vegTestTotal}
              </div>
            </div>
          );
        })()
      ) : vegSub === 'quiz' ? (
        <div className="text-center">
          {!vegQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">🥦 Vegetables</h2>
              <p className="mt-2 text-sm text-slate-600">Click a vegetable to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {VEGETABLES.map((v) => (
                  <button key={v.name} type="button" onClick={() => speakThenSpell(v.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-3xl">{v.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{v.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * VEGETABLES.length);
                  setVegIdx(r);
                  setVegQuiz(true);
                  setVegAnswered(false);
                  setVegCorrect(false);
                  setVegScore(0);
                  setVegTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">Which vegetable is this?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vegIdx].emoji}</div>
              </div>
              {vegAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${vegCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{vegCorrect ? '✅ Correct!' : `❌ It's ${VEGETABLES[vegIdx].name}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...VEGETABLES]
                  .sort(() => Math.random() - 0.5)
                  .map((v) => (
                    <button key={v.name} type="button" onClick={() => handleVegClick(v.name)} disabled={vegAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${vegAnswered ? 'opacity-50' : 'hover:scale-105'} ${vegAnswered && v.name === VEGETABLES[vegIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {v.emoji} {v.name}
                    </button>
                  ))}
              </div>
              {vegAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setVegIdx((p) => (p + 1) % VEGETABLES.length);
                    setVegAnswered(false);
                    setVegCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {vegScore}/{vegTotal}
              </div>
            </>
          )}
        </div>
      ) : vegSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Vegetable Name</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vegIdx].emoji}</div>
          </div>
          {vegFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {vegFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {VEGETABLES[vegIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={vegFibInput}
              onChange={(e) => setVegFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !vegAnswered) handleVegFib();
              }}
              placeholder="Type the name..."
              disabled={vegAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!vegAnswered ? (
                <button type="button" onClick={handleVegFib} disabled={!vegFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVegIdx((p) => (p + 1) % VEGETABLES.length);
                    setVegAnswered(false);
                    setVegFibResult(null);
                    setVegFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {vegScore}/{vegTotal}
          </div>
        </div>
      ) : vMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{VEGETABLES[vMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: vMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= vMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setVMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !vMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Vegetables</h2>
          <p className="text-sm text-slate-600">Watch and listen as vegetables are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setVMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{vMemoRepeat}</span>
              <button type="button" onClick={() => setVMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={vMemoLoop} onChange={(e) => setVMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setVMemoRunning(true);
              setVMemoCount(0);
              setVMemoIdx(Math.floor(Math.random() * VEGETABLES.length));
              setVMemoLocked(false);
            }}
            className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700"
          >
            ▶ Start
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-5 text-center">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Item {vMemoIdx + 1}/{VEGETABLES.length}
            </span>
            <span>
              Repeat {vMemoCount + 1}/{vMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{VEGETABLES[vMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: vMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= vMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVMemoPaused((p) => !p);
                if (!vMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${vMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {vMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setVMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
