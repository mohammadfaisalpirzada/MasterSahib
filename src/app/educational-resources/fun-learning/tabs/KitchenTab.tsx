'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

type WordItem = { name: string; emoji: string };

const KITCHEN: WordItem[] = [
  { name: 'Stove', emoji: '🔥' },
  { name: 'Oven', emoji: '🔥' },
  { name: 'Plate', emoji: '🍽️' },
  { name: 'Pan', emoji: '🍳' },
  { name: 'Bowl', emoji: '🥣' },
  { name: 'Glass', emoji: '🥛' },
  { name: 'Jug', emoji: '🏺' },
  { name: 'Spoon', emoji: '🥄' },
  { name: 'Fork', emoji: '🍴' },
  { name: 'Kettle', emoji: '🫖' },
];

export default function KitchenTab() {
  const [kitchenSub, setKitchenSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [kitchenIdx, setKitchenIdx] = useState(0);
  const [kitchenQuiz, setKitchenQuiz] = useState(false);
  const [kitchenAnswered, setKitchenAnswered] = useState(false);
  const [kitchenCorrect, setKitchenCorrect] = useState(false);
  const [kitchenScore, setKitchenScore] = useState(0);
  const [kitchenTotal, setKitchenTotal] = useState(0);
  const [kMemoRunning, setKMemoRunning] = useState(false);
  const [kMemoLocked, setKMemoLocked] = useState(false);
  const [kMemoPaused, setKMemoPaused] = useState(false);
  const [kMemoCount, setKMemoCount] = useState(0);
  const [kMemoRepeat, setKMemoRepeat] = useState(1);
  const [kMemoLoop, setKMemoLoop] = useState(false);
  const [kMemoIdx, setKMemoIdx] = useState(0);
  const [kitchenFibResult, setKitchenFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [kitchenFibInput, setKitchenFibInput] = useState('');
  const [kitchenTestIdx, setKitchenTestIdx] = useState(0);
  const [kitchenTestAnswered, setKitchenTestAnswered] = useState(false);
  const [kitchenTestCorrect, setKitchenTestCorrect] = useState(false);
  const [kitchenTestScore, setKitchenTestScore] = useState(0);
  const [kitchenTestTotal, setKitchenTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (kMemoRunning && !kMemoPaused) {
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
  }, [kMemoRunning, kMemoPaused]);

  useEffect(() => {
    if (!kMemoRunning || kMemoPaused) return;
    const item = KITCHEN[kMemoIdx].name;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setKMemoCount((c) => {
          const next = c + 1;
          if (next >= kMemoRepeat) {
            const nextIdx = (kMemoIdx + 1) % KITCHEN.length;
            if (nextIdx === 0 && !kMemoLoop) {
              setKMemoRunning(false);
              return 0;
            }
            setKMemoIdx(nextIdx);
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
  }, [kMemoRunning, kMemoPaused, kMemoLocked, kMemoIdx, kMemoCount, kMemoRepeat, kMemoLoop]);

  useEffect(() => {
    if (kitchenSub === 'test' && !kitchenTestAnswered) {
      speakThenSpell(KITCHEN[kitchenTestIdx % KITCHEN.length].name);
    }
  }, [kitchenSub, kitchenTestIdx, kitchenTestAnswered]);

  const handleKitchenClick = useCallback(
    (c: string) => {
      if (kitchenAnswered) return;
      setKitchenAnswered(true);
      setKitchenTotal((p) => p + 1);
      if (c === KITCHEN[kitchenIdx].name) {
        setKitchenScore((p) => p + 1);
        setKitchenCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setKitchenCorrect(false);
        speak(`This is ${KITCHEN[kitchenIdx].name}`);
      }
    },
    [kitchenAnswered, kitchenIdx],
  );

  const handleKitchenFib = useCallback(() => {
    if (kitchenAnswered || !kitchenFibInput.trim()) return;
    setKitchenAnswered(true);
    setKitchenTotal((p) => p + 1);
    if (kitchenFibInput.trim().toLowerCase() === KITCHEN[kitchenIdx].name.toLowerCase()) {
      setKitchenScore((p) => p + 1);
      setKitchenCorrect(true);
      setKitchenFibResult('correct');
      speak(`Yes! ${KITCHEN[kitchenIdx].name}`);
    } else {
      setKitchenFibResult('wrong');
      setKitchenCorrect(false);
      speak(`This is ${KITCHEN[kitchenIdx].name}`);
    }
  }, [kitchenAnswered, kitchenFibInput, kitchenIdx]);

  const handleKitchenTestClick = useCallback(
    (clickedWord: string) => {
      if (kitchenTestAnswered) return;
      setKitchenTestTotal((p) => p + 1);
      setKitchenTestAnswered(true);
      const correct = clickedWord === KITCHEN[kitchenTestIdx % KITCHEN.length].name;
      setKitchenTestCorrect(correct);
      if (correct) setKitchenTestScore((p) => p + 1);
      setTimeout(
        () => {
          setKitchenTestIdx((p) => p + 1);
          setKitchenTestAnswered(false);
          setKitchenTestCorrect(false);
        },
        quizDelay(KITCHEN[kitchenTestIdx % KITCHEN.length].name),
      );
    },
    [kitchenTestAnswered, kitchenTestIdx],
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
                setKitchenSub(m);
                setKitchenAnswered(false);
                setKitchenCorrect(false);
                setKitchenQuiz(false);
                setKMemoRunning(false);
                setKMemoLocked(false);
                setKitchenFibResult(null);
                setKitchenFibInput('');
                setKitchenTestIdx(Math.floor(Math.random() * KITCHEN.length));
                setKitchenTestAnswered(false);
                setKitchenTestCorrect(false);
                setKitchenTestScore(0);
                setKitchenTestTotal(0);
                if (m === 'fib') setKitchenQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${kitchenSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {kitchenSub === 'learn' && kMemoRunning && !kMemoLocked && !kMemoPaused && (
          <button type="button" onClick={() => setKMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {kitchenSub === 'test' ? (
        (() => {
          const currentWord = KITCHEN[kitchenTestIdx % KITCHEN.length].name;
          const testOptions = [
            currentWord,
            ...KITCHEN.filter((_, i) => i !== kitchenTestIdx % KITCHEN.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((v) => v.name),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which kitchen object did you hear?</h2>
              {kitchenTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${kitchenTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{kitchenTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleKitchenTestClick(w)} disabled={kitchenTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${kitchenTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${kitchenTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {kitchenTestScore}/{kitchenTestTotal}
              </div>
            </div>
          );
        })()
      ) : kitchenSub === 'quiz' ? (
        <div className="text-center">
          {!kitchenQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">🍳 Kitchen Objects</h2>
              <p className="mt-2 text-sm text-slate-600">Click an object to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {KITCHEN.map((o) => (
                  <button key={o.name} type="button" onClick={() => speakThenSpell(o.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-3xl">{o.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{o.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * KITCHEN.length);
                  setKitchenIdx(r);
                  setKitchenQuiz(true);
                  setKitchenAnswered(false);
                  setKitchenCorrect(false);
                  setKitchenScore(0);
                  setKitchenTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">What is this kitchen object?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kitchenIdx].emoji}</div>
              </div>
              {kitchenAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${kitchenCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{kitchenCorrect ? '✅ Correct!' : `❌ It's ${KITCHEN[kitchenIdx].name}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...KITCHEN]
                  .sort(() => Math.random() - 0.5)
                  .map((o) => (
                    <button key={o.name} type="button" onClick={() => handleKitchenClick(o.name)} disabled={kitchenAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${kitchenAnswered ? 'opacity-50' : 'hover:scale-105'} ${kitchenAnswered && o.name === KITCHEN[kitchenIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {o.emoji} {o.name}
                    </button>
                  ))}
              </div>
              {kitchenAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setKitchenIdx((p) => (p + 1) % KITCHEN.length);
                    setKitchenAnswered(false);
                    setKitchenCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {kitchenScore}/{kitchenTotal}
              </div>
            </>
          )}
        </div>
      ) : kitchenSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Kitchen Object</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kitchenIdx].emoji}</div>
          </div>
          {kitchenFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {kitchenFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {KITCHEN[kitchenIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={kitchenFibInput}
              onChange={(e) => setKitchenFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !kitchenAnswered) handleKitchenFib();
              }}
              placeholder="Type the name..."
              disabled={kitchenAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!kitchenAnswered ? (
                <button type="button" onClick={handleKitchenFib} disabled={!kitchenFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setKitchenIdx((p) => (p + 1) % KITCHEN.length);
                    setKitchenAnswered(false);
                    setKitchenFibResult(null);
                    setKitchenFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {kitchenScore}/{kitchenTotal}
          </div>
        </div>
      ) : kMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{KITCHEN[kMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: kMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= kMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setKMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !kMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Kitchen</h2>
          <p className="text-sm text-slate-600">Watch and listen as kitchen objects are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setKMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{kMemoRepeat}</span>
              <button type="button" onClick={() => setKMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={kMemoLoop} onChange={(e) => setKMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setKMemoRunning(true);
              setKMemoCount(0);
              setKMemoIdx(Math.floor(Math.random() * KITCHEN.length));
              setKMemoLocked(false);
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
              Item {kMemoIdx + 1}/{KITCHEN.length}
            </span>
            <span>
              Repeat {kMemoCount + 1}/{kMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{KITCHEN[kMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: kMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= kMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setKMemoPaused((p) => !p);
                if (!kMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${kMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {kMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setKMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
