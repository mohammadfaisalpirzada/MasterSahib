'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

type WordItem = { name: string; emoji: string };

const ANIMALS: WordItem[] = [
  { name: 'Cat', emoji: '🐱' },
  { name: 'Dog', emoji: '🐶' },
  { name: 'Lion', emoji: '🦁' },
  { name: 'Tiger', emoji: '🐯' },
  { name: 'Fox', emoji: '🦊' },
  { name: 'Monkey', emoji: '🐵' },
  { name: 'Horse', emoji: '🐴' },
  { name: 'Donkey', emoji: '🫏' },
  { name: 'Leopard', emoji: '🐆' },
  { name: 'Markhor', emoji: '🐐' },
  { name: 'Elephant', emoji: '🐘' },
  { name: 'Kangaroo', emoji: '🦘' },
  { name: 'Rabbit', emoji: '🐰' },
  { name: 'Giraffe', emoji: '🦒' },
  { name: 'Zebra', emoji: '🦓' },
  { name: 'Cow', emoji: '🐄' },
  { name: 'Sheep', emoji: '🐑' },
  { name: 'Goat', emoji: '🐐' },
  { name: 'Crocodile', emoji: '🐊' },
  { name: 'Camel', emoji: '🐪' },
];

export default function AnimalsTab() {
  const [animalSub, setAnimalSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [animalIdx, setAnimalIdx] = useState(0);
  const [animalQuiz, setAnimalQuiz] = useState(false);
  const [animalAnswered, setAnimalAnswered] = useState(false);
  const [animalCorrect, setAnimalCorrect] = useState(false);
  const [animalScore, setAnimalScore] = useState(0);
  const [animalTotal, setAnimalTotal] = useState(0);
  const [animalFibResult, setAnimalFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [animalFibInput, setAnimalFibInput] = useState('');
  const [animalMemoRunning, setAnimalMemoRunning] = useState(false);
  const [animalMemoLocked, setAnimalMemoLocked] = useState(false);
  const [animalMemoPaused, setAnimalMemoPaused] = useState(false);
  const [animalMemoCount, setAnimalMemoCount] = useState(0);
  const [animalMemoRepeat, setAnimalMemoRepeat] = useState(1);
  const [animalMemoLoop, setAnimalMemoLoop] = useState(false);
  const [animalMemoIdx, setAnimalMemoIdx] = useState(0);
  const [animalTestIdx, setAnimalTestIdx] = useState(0);
  const [animalTestAnswered, setAnimalTestAnswered] = useState(false);
  const [animalTestCorrect, setAnimalTestCorrect] = useState(false);
  const [animalTestScore, setAnimalTestScore] = useState(0);
  const [animalTestTotal, setAnimalTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (animalMemoRunning && !animalMemoPaused) {
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
  }, [animalMemoRunning, animalMemoPaused]);

  useEffect(() => {
    if (!animalMemoRunning || animalMemoPaused) return;
    const item = ANIMALS[animalMemoIdx].name;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setAnimalMemoCount((c) => {
          const next = c + 1;
          if (next >= animalMemoRepeat) {
            const nextIdx = (animalMemoIdx + 1) % ANIMALS.length;
            if (nextIdx === 0 && !animalMemoLoop) {
              setAnimalMemoRunning(false);
              return 0;
            }
            setAnimalMemoIdx(nextIdx);
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
  }, [animalMemoRunning, animalMemoPaused, animalMemoLocked, animalMemoIdx, animalMemoCount, animalMemoRepeat, animalMemoLoop]);

  useEffect(() => {
    if (animalSub === 'test' && !animalTestAnswered) {
      speakThenSpell(ANIMALS[animalTestIdx % ANIMALS.length].name);
    }
  }, [animalSub, animalTestIdx, animalTestAnswered]);

  const handleAnimalClick = useCallback(
    (c: string) => {
      if (animalAnswered) return;
      setAnimalAnswered(true);
      setAnimalTotal((p) => p + 1);
      if (c === ANIMALS[animalIdx].name) {
        setAnimalScore((p) => p + 1);
        setAnimalCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setAnimalCorrect(false);
        speak(`This is ${ANIMALS[animalIdx].name}`);
      }
    },
    [animalAnswered, animalIdx],
  );

  const handleAnimalFib = useCallback(() => {
    if (animalAnswered || !animalFibInput.trim()) return;
    setAnimalAnswered(true);
    setAnimalTotal((p) => p + 1);
    if (animalFibInput.trim().toLowerCase() === ANIMALS[animalIdx].name.toLowerCase()) {
      setAnimalScore((p) => p + 1);
      setAnimalCorrect(true);
      setAnimalFibResult('correct');
      speak(`Yes! ${ANIMALS[animalIdx].name}`);
    } else {
      setAnimalFibResult('wrong');
      setAnimalCorrect(false);
      speak(`This is ${ANIMALS[animalIdx].name}`);
    }
  }, [animalAnswered, animalFibInput, animalIdx]);

  const handleAnimalTestClick = useCallback(
    (clickedWord: string) => {
      if (animalTestAnswered) return;
      setAnimalTestTotal((p) => p + 1);
      setAnimalTestAnswered(true);
      const correct = clickedWord === ANIMALS[animalTestIdx % ANIMALS.length].name;
      setAnimalTestCorrect(correct);
      if (correct) setAnimalTestScore((p) => p + 1);
      setTimeout(
        () => {
          setAnimalTestIdx((p) => p + 1);
          setAnimalTestAnswered(false);
          setAnimalTestCorrect(false);
        },
        quizDelay(ANIMALS[animalTestIdx % ANIMALS.length].name),
      );
    },
    [animalTestAnswered, animalTestIdx],
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
                setAnimalSub(m);
                setAnimalAnswered(false);
                setAnimalCorrect(false);
                setAnimalQuiz(false);
                setAnimalMemoRunning(false);
                setAnimalMemoLocked(false);
                setAnimalFibResult(null);
                setAnimalFibInput('');
                setAnimalTestIdx(Math.floor(Math.random() * ANIMALS.length));
                setAnimalTestAnswered(false);
                setAnimalTestCorrect(false);
                setAnimalTestScore(0);
                setAnimalTestTotal(0);
                if (m === 'fib') setAnimalQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${animalSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {animalSub === 'learn' && animalMemoRunning && !animalMemoLocked && !animalMemoPaused && (
          <button type="button" onClick={() => setAnimalMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {animalSub === 'test' ? (
        (() => {
          const currentWord = ANIMALS[animalTestIdx % ANIMALS.length].name;
          const testOptions = [
            currentWord,
            ...ANIMALS.filter((_, i) => i !== animalTestIdx % ANIMALS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((v) => v.name),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which animal did you hear?</h2>
              {animalTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${animalTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{animalTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleAnimalTestClick(w)} disabled={animalTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${animalTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${animalTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {animalTestScore}/{animalTestTotal}
              </div>
            </div>
          );
        })()
      ) : animalSub === 'quiz' ? (
        <div className="text-center">
          {!animalQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">🐾 Animals</h2>
              <p className="mt-2 text-sm text-slate-600">Click an animal to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {ANIMALS.map((a) => (
                  <button key={a.name} type="button" onClick={() => speakThenSpell(a.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-3xl">{a.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{a.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * ANIMALS.length);
                  setAnimalIdx(r);
                  setAnimalQuiz(true);
                  setAnimalAnswered(false);
                  setAnimalCorrect(false);
                  setAnimalScore(0);
                  setAnimalTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">Which animal is this?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalIdx].emoji}</div>
              </div>
              {animalAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${animalCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{animalCorrect ? '✅ Correct!' : `❌ It's ${ANIMALS[animalIdx].name}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...ANIMALS]
                  .sort(() => Math.random() - 0.5)
                  .map((a) => (
                    <button key={a.name} type="button" onClick={() => handleAnimalClick(a.name)} disabled={animalAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${animalAnswered ? 'opacity-50' : 'hover:scale-105'} ${animalAnswered && a.name === ANIMALS[animalIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {a.emoji} {a.name}
                    </button>
                  ))}
              </div>
              {animalAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setAnimalIdx((p) => (p + 1) % ANIMALS.length);
                    setAnimalAnswered(false);
                    setAnimalCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {animalScore}/{animalTotal}
              </div>
            </>
          )}
        </div>
      ) : animalSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Animal Name</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalIdx].emoji}</div>
          </div>
          {animalFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {animalFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {ANIMALS[animalIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={animalFibInput}
              onChange={(e) => setAnimalFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !animalAnswered) handleAnimalFib();
              }}
              placeholder="Type the name..."
              disabled={animalAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!animalAnswered ? (
                <button type="button" onClick={handleAnimalFib} disabled={!animalFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAnimalIdx((p) => (p + 1) % ANIMALS.length);
                    setAnimalAnswered(false);
                    setAnimalFibResult(null);
                    setAnimalFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {animalScore}/{animalTotal}
          </div>
        </div>
      ) : animalMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{ANIMALS[animalMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: animalMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= animalMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setAnimalMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !animalMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Animals</h2>
          <p className="text-sm text-slate-600">Watch and listen as animals are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setAnimalMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{animalMemoRepeat}</span>
              <button type="button" onClick={() => setAnimalMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={animalMemoLoop} onChange={(e) => setAnimalMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setAnimalMemoRunning(true);
              setAnimalMemoCount(0);
              setAnimalMemoIdx(Math.floor(Math.random() * ANIMALS.length));
              setAnimalMemoLocked(false);
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
              Item {animalMemoIdx + 1}/{ANIMALS.length}
            </span>
            <span>
              Repeat {animalMemoCount + 1}/{animalMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{ANIMALS[animalMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: animalMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= animalMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAnimalMemoPaused((p) => !p);
                if (!animalMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${animalMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {animalMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setAnimalMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
