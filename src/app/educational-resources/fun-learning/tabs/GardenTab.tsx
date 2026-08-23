'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

type WordItem = { name: string; emoji: string };

const GARDEN: WordItem[] = [
  { name: 'Grass', emoji: '🌿' },
  { name: 'Flower', emoji: '🌸' },
  { name: 'Tree', emoji: '🌳' },
  { name: 'Bench', emoji: '🪑' },
  { name: 'Butterfly', emoji: '🦋' },
  { name: 'Bird', emoji: '🐦' },
  { name: 'Swing', emoji: '🎠' },
  { name: 'Stone', emoji: '🪨' },
  { name: 'Fence', emoji: '🪵' },
  { name: 'Fountain', emoji: '⛲' },
];

export default function GardenTab() {
  const [gardenSub, setGardenSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [gardenIdx, setGardenIdx] = useState(0);
  const [gardenQuiz, setGardenQuiz] = useState(false);
  const [gardenAnswered, setGardenAnswered] = useState(false);
  const [gardenCorrect, setGardenCorrect] = useState(false);
  const [gardenScore, setGardenScore] = useState(0);
  const [gardenTotal, setGardenTotal] = useState(0);
  const [gMemoRunning, setGMemoRunning] = useState(false);
  const [gMemoLocked, setGMemoLocked] = useState(false);
  const [gMemoPaused, setGMemoPaused] = useState(false);
  const [gMemoCount, setGMemoCount] = useState(0);
  const [gMemoRepeat, setGMemoRepeat] = useState(1);
  const [gMemoLoop, setGMemoLoop] = useState(false);
  const [gMemoIdx, setGMemoIdx] = useState(0);
  const [gardenFibResult, setGardenFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [gardenFibInput, setGardenFibInput] = useState('');
  const [gardenTestIdx, setGardenTestIdx] = useState(0);
  const [gardenTestAnswered, setGardenTestAnswered] = useState(false);
  const [gardenTestCorrect, setGardenTestCorrect] = useState(false);
  const [gardenTestScore, setGardenTestScore] = useState(0);
  const [gardenTestTotal, setGardenTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (gMemoRunning && !gMemoPaused) {
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
  }, [gMemoRunning, gMemoPaused]);

  useEffect(() => {
    if (!gMemoRunning || gMemoPaused) return;
    const item = GARDEN[gMemoIdx].name;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setGMemoCount((c) => {
          const next = c + 1;
          if (next >= gMemoRepeat) {
            const nextIdx = (gMemoIdx + 1) % GARDEN.length;
            if (nextIdx === 0 && !gMemoLoop) {
              setGMemoRunning(false);
              return 0;
            }
            setGMemoIdx(nextIdx);
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
  }, [gMemoRunning, gMemoPaused, gMemoLocked, gMemoIdx, gMemoCount, gMemoRepeat, gMemoLoop]);

  useEffect(() => {
    if (gardenSub === 'test' && !gardenTestAnswered) {
      speakThenSpell(GARDEN[gardenTestIdx % GARDEN.length].name);
    }
  }, [gardenSub, gardenTestIdx, gardenTestAnswered]);

  const handleGardenClick = useCallback(
    (c: string) => {
      if (gardenAnswered) return;
      setGardenAnswered(true);
      setGardenTotal((p) => p + 1);
      if (c === GARDEN[gardenIdx].name) {
        setGardenScore((p) => p + 1);
        setGardenCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setGardenCorrect(false);
        speak(`This is ${GARDEN[gardenIdx].name}`);
      }
    },
    [gardenAnswered, gardenIdx],
  );

  const handleGardenFib = useCallback(() => {
    if (gardenAnswered || !gardenFibInput.trim()) return;
    setGardenAnswered(true);
    setGardenTotal((p) => p + 1);
    if (gardenFibInput.trim().toLowerCase() === GARDEN[gardenIdx].name.toLowerCase()) {
      setGardenScore((p) => p + 1);
      setGardenCorrect(true);
      setGardenFibResult('correct');
      speak(`Yes! ${GARDEN[gardenIdx].name}`);
    } else {
      setGardenFibResult('wrong');
      setGardenCorrect(false);
      speak(`This is ${GARDEN[gardenIdx].name}`);
    }
  }, [gardenAnswered, gardenFibInput, gardenIdx]);

  const handleGardenTestClick = useCallback(
    (clickedWord: string) => {
      if (gardenTestAnswered) return;
      setGardenTestTotal((p) => p + 1);
      setGardenTestAnswered(true);
      const correct = clickedWord === GARDEN[gardenTestIdx % GARDEN.length].name;
      setGardenTestCorrect(correct);
      if (correct) setGardenTestScore((p) => p + 1);
      setTimeout(
        () => {
          setGardenTestIdx((p) => p + 1);
          setGardenTestAnswered(false);
          setGardenTestCorrect(false);
        },
        quizDelay(GARDEN[gardenTestIdx % GARDEN.length].name),
      );
    },
    [gardenTestAnswered, gardenTestIdx],
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
                setGardenSub(m);
                setGardenAnswered(false);
                setGardenCorrect(false);
                setGardenQuiz(false);
                setGMemoRunning(false);
                setGMemoLocked(false);
                setGardenFibResult(null);
                setGardenFibInput('');
                setGardenTestIdx(Math.floor(Math.random() * GARDEN.length));
                setGardenTestAnswered(false);
                setGardenTestCorrect(false);
                setGardenTestScore(0);
                setGardenTestTotal(0);
                if (m === 'fib') setGardenQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${gardenSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {gardenSub === 'learn' && gMemoRunning && !gMemoLocked && !gMemoPaused && (
          <button type="button" onClick={() => setGMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {gardenSub === 'test' ? (
        (() => {
          const currentWord = GARDEN[gardenTestIdx % GARDEN.length].name;
          const testOptions = [
            currentWord,
            ...GARDEN.filter((_, i) => i !== gardenTestIdx % GARDEN.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((v) => v.name),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which garden object did you hear?</h2>
              {gardenTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${gardenTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{gardenTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleGardenTestClick(w)} disabled={gardenTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${gardenTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${gardenTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {gardenTestScore}/{gardenTestTotal}
              </div>
            </div>
          );
        })()
      ) : gardenSub === 'quiz' ? (
        <div className="text-center">
          {!gardenQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">🌳 Garden Objects</h2>
              <p className="mt-2 text-sm text-slate-600">Click an object to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {GARDEN.map((o) => (
                  <button key={o.name} type="button" onClick={() => speakThenSpell(o.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-3xl">{o.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{o.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * GARDEN.length);
                  setGardenIdx(r);
                  setGardenQuiz(true);
                  setGardenAnswered(false);
                  setGardenCorrect(false);
                  setGardenScore(0);
                  setGardenTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">What is this garden object?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gardenIdx].emoji}</div>
              </div>
              {gardenAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${gardenCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{gardenCorrect ? '✅ Correct!' : `❌ It's ${GARDEN[gardenIdx].name}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...GARDEN]
                  .sort(() => Math.random() - 0.5)
                  .map((o) => (
                    <button key={o.name} type="button" onClick={() => handleGardenClick(o.name)} disabled={gardenAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${gardenAnswered ? 'opacity-50' : 'hover:scale-105'} ${gardenAnswered && o.name === GARDEN[gardenIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {o.emoji} {o.name}
                    </button>
                  ))}
              </div>
              {gardenAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setGardenIdx((p) => (p + 1) % GARDEN.length);
                    setGardenAnswered(false);
                    setGardenCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {gardenScore}/{gardenTotal}
              </div>
            </>
          )}
        </div>
      ) : gardenSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Garden Object</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gardenIdx].emoji}</div>
          </div>
          {gardenFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {gardenFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {GARDEN[gardenIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={gardenFibInput}
              onChange={(e) => setGardenFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !gardenAnswered) handleGardenFib();
              }}
              placeholder="Type the name..."
              disabled={gardenAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!gardenAnswered ? (
                <button type="button" onClick={handleGardenFib} disabled={!gardenFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setGardenIdx((p) => (p + 1) % GARDEN.length);
                    setGardenAnswered(false);
                    setGardenFibResult(null);
                    setGardenFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {gardenScore}/{gardenTotal}
          </div>
        </div>
      ) : gMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{GARDEN[gMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: gMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= gMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setGMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !gMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Garden</h2>
          <p className="text-sm text-slate-600">Watch and listen as garden objects are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setGMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{gMemoRepeat}</span>
              <button type="button" onClick={() => setGMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={gMemoLoop} onChange={(e) => setGMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setGMemoRunning(true);
              setGMemoCount(0);
              setGMemoIdx(Math.floor(Math.random() * GARDEN.length));
              setGMemoLocked(false);
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
              Item {gMemoIdx + 1}/{GARDEN.length}
            </span>
            <span>
              Repeat {gMemoCount + 1}/{gMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{GARDEN[gMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: gMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= gMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGMemoPaused((p) => !p);
                if (!gMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${gMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {gMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setGMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
