'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

type WordItem = { name: string; emoji: string };

const BIRDS: WordItem[] = [
  { name: 'Parrot', emoji: '🦜' },
  { name: 'Peacock', emoji: '🦚' },
  { name: 'Sparrow', emoji: '🐦' },
  { name: 'Ostrich', emoji: '🦩' },
  { name: 'Robin', emoji: '🐦' },
  { name: 'Crow', emoji: '🐦‍⬛' },
  { name: 'Penguin', emoji: '🐧' },
  { name: 'Eagle', emoji: '🦅' },
  { name: 'Pigeon', emoji: '🕊️' },
  { name: 'Owl', emoji: '🦉' },
];

export default function BirdsTab() {
  const [birdSub, setBirdSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [birdIdx, setBirdIdx] = useState(0);
  const [birdQuiz, setBirdQuiz] = useState(false);
  const [birdAnswered, setBirdAnswered] = useState(false);
  const [birdCorrect, setBirdCorrect] = useState(false);
  const [birdScore, setBirdScore] = useState(0);
  const [birdTotal, setBirdTotal] = useState(0);
  const [birdFibResult, setBirdFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [birdFibInput, setBirdFibInput] = useState('');
  const [birdMemoRunning, setBirdMemoRunning] = useState(false);
  const [birdMemoLocked, setBirdMemoLocked] = useState(false);
  const [birdMemoPaused, setBirdMemoPaused] = useState(false);
  const [birdMemoCount, setBirdMemoCount] = useState(0);
  const [birdMemoRepeat, setBirdMemoRepeat] = useState(1);
  const [birdMemoLoop, setBirdMemoLoop] = useState(false);
  const [birdMemoIdx, setBirdMemoIdx] = useState(0);
  const [birdTestIdx, setBirdTestIdx] = useState(0);
  const [birdTestAnswered, setBirdTestAnswered] = useState(false);
  const [birdTestCorrect, setBirdTestCorrect] = useState(false);
  const [birdTestScore, setBirdTestScore] = useState(0);
  const [birdTestTotal, setBirdTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (birdMemoRunning && !birdMemoPaused) {
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
  }, [birdMemoRunning, birdMemoPaused]);

  useEffect(() => {
    if (!birdMemoRunning || birdMemoPaused) return;
    const item = BIRDS[birdMemoIdx].name;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setBirdMemoCount((c) => {
          const next = c + 1;
          if (next >= birdMemoRepeat) {
            const nextIdx = (birdMemoIdx + 1) % BIRDS.length;
            if (nextIdx === 0 && !birdMemoLoop) {
              setBirdMemoRunning(false);
              return 0;
            }
            setBirdMemoIdx(nextIdx);
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
  }, [birdMemoRunning, birdMemoPaused, birdMemoLocked, birdMemoIdx, birdMemoCount, birdMemoRepeat, birdMemoLoop]);

  useEffect(() => {
    if (birdSub === 'test' && !birdTestAnswered) {
      speakThenSpell(BIRDS[birdTestIdx % BIRDS.length].name);
    }
  }, [birdSub, birdTestIdx, birdTestAnswered]);

  const handleBirdClick = useCallback(
    (c: string) => {
      if (birdAnswered) return;
      setBirdAnswered(true);
      setBirdTotal((p) => p + 1);
      if (c === BIRDS[birdIdx].name) {
        setBirdScore((p) => p + 1);
        setBirdCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setBirdCorrect(false);
        speak(`This is ${BIRDS[birdIdx].name}`);
      }
    },
    [birdAnswered, birdIdx],
  );

  const handleBirdFib = useCallback(() => {
    if (birdAnswered || !birdFibInput.trim()) return;
    setBirdAnswered(true);
    setBirdTotal((p) => p + 1);
    if (birdFibInput.trim().toLowerCase() === BIRDS[birdIdx].name.toLowerCase()) {
      setBirdScore((p) => p + 1);
      setBirdCorrect(true);
      setBirdFibResult('correct');
      speak(`Yes! ${BIRDS[birdIdx].name}`);
    } else {
      setBirdFibResult('wrong');
      setBirdCorrect(false);
      speak(`This is ${BIRDS[birdIdx].name}`);
    }
  }, [birdAnswered, birdFibInput, birdIdx]);

  const handleBirdTestClick = useCallback(
    (clickedWord: string) => {
      if (birdTestAnswered) return;
      setBirdTestTotal((p) => p + 1);
      setBirdTestAnswered(true);
      const correct = clickedWord === BIRDS[birdTestIdx % BIRDS.length].name;
      setBirdTestCorrect(correct);
      if (correct) setBirdTestScore((p) => p + 1);
      setTimeout(
        () => {
          setBirdTestIdx((p) => p + 1);
          setBirdTestAnswered(false);
          setBirdTestCorrect(false);
        },
        quizDelay(BIRDS[birdTestIdx % BIRDS.length].name),
      );
    },
    [birdTestAnswered, birdTestIdx],
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
                setBirdSub(m);
                setBirdAnswered(false);
                setBirdCorrect(false);
                setBirdQuiz(false);
                setBirdMemoRunning(false);
                setBirdMemoLocked(false);
                setBirdFibResult(null);
                setBirdFibInput('');
                setBirdTestIdx(Math.floor(Math.random() * BIRDS.length));
                setBirdTestAnswered(false);
                setBirdTestCorrect(false);
                setBirdTestScore(0);
                setBirdTestTotal(0);
                if (m === 'fib') setBirdQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${birdSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {birdSub === 'learn' && birdMemoRunning && !birdMemoLocked && !birdMemoPaused && (
          <button type="button" onClick={() => setBirdMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {birdSub === 'test' ? (
        (() => {
          const currentWord = BIRDS[birdTestIdx % BIRDS.length].name;
          const testOptions = [
            currentWord,
            ...BIRDS.filter((_, i) => i !== birdTestIdx % BIRDS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((v) => v.name),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which bird did you hear?</h2>
              {birdTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${birdTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{birdTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleBirdTestClick(w)} disabled={birdTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${birdTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${birdTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {birdTestScore}/{birdTestTotal}
              </div>
            </div>
          );
        })()
      ) : birdSub === 'quiz' ? (
        <div className="text-center">
          {!birdQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">🐦 Birds</h2>
              <p className="mt-2 text-sm text-slate-600">Click a bird to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {BIRDS.map((b) => (
                  <button key={b.name} type="button" onClick={() => speakThenSpell(b.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-3xl">{b.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{b.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * BIRDS.length);
                  setBirdIdx(r);
                  setBirdQuiz(true);
                  setBirdAnswered(false);
                  setBirdCorrect(false);
                  setBirdScore(0);
                  setBirdTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">Which bird is this?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdIdx].emoji}</div>
              </div>
              {birdAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${birdCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{birdCorrect ? '✅ Correct!' : `❌ It's ${BIRDS[birdIdx].name}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...BIRDS]
                  .sort(() => Math.random() - 0.5)
                  .map((b) => (
                    <button key={b.name} type="button" onClick={() => handleBirdClick(b.name)} disabled={birdAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${birdAnswered ? 'opacity-50' : 'hover:scale-105'} ${birdAnswered && b.name === BIRDS[birdIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {b.emoji} {b.name}
                    </button>
                  ))}
              </div>
              {birdAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setBirdIdx((p) => (p + 1) % BIRDS.length);
                    setBirdAnswered(false);
                    setBirdCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {birdScore}/{birdTotal}
              </div>
            </>
          )}
        </div>
      ) : birdSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Bird Name</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdIdx].emoji}</div>
          </div>
          {birdFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {birdFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {BIRDS[birdIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={birdFibInput}
              onChange={(e) => setBirdFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !birdAnswered) handleBirdFib();
              }}
              placeholder="Type the name..."
              disabled={birdAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!birdAnswered ? (
                <button type="button" onClick={handleBirdFib} disabled={!birdFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBirdIdx((p) => (p + 1) % BIRDS.length);
                    setBirdAnswered(false);
                    setBirdFibResult(null);
                    setBirdFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {birdScore}/{birdTotal}
          </div>
        </div>
      ) : birdMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{BIRDS[birdMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: birdMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= birdMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setBirdMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !birdMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Birds</h2>
          <p className="text-sm text-slate-600">Watch and listen as birds are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setBirdMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{birdMemoRepeat}</span>
              <button type="button" onClick={() => setBirdMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={birdMemoLoop} onChange={(e) => setBirdMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setBirdMemoRunning(true);
              setBirdMemoCount(0);
              setBirdMemoIdx(Math.floor(Math.random() * BIRDS.length));
              setBirdMemoLocked(false);
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
              Item {birdMemoIdx + 1}/{BIRDS.length}
            </span>
            <span>
              Repeat {birdMemoCount + 1}/{birdMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{BIRDS[birdMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: birdMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= birdMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBirdMemoPaused((p) => !p);
                if (!birdMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${birdMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {birdMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setBirdMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
