'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

type WordItem = { name: string; emoji: string };

const OCCUPATIONS: WordItem[] = [
  { name: 'Doctor', emoji: '👨‍⚕️' },
  { name: 'Teacher', emoji: '👩‍🏫' },
  { name: 'Pilot', emoji: '👨‍✈️' },
  { name: 'Carpenter', emoji: '🪚' },
  { name: 'Farmer', emoji: '👨‍🌾' },
  { name: 'Tailor', emoji: '🧵' },
  { name: 'Barber', emoji: '💈' },
  { name: 'Butcher', emoji: '🥩' },
  { name: 'Cobbler', emoji: '👞' },
  { name: 'Policeman', emoji: '👮' },
];

export default function OccupationTab() {
  const [occSub, setOccSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [occIdx, setOccIdx] = useState(0);
  const [occQuiz, setOccQuiz] = useState(false);
  const [occAnswered, setOccAnswered] = useState(false);
  const [occCorrect, setOccCorrect] = useState(false);
  const [occScore, setOccScore] = useState(0);
  const [occTotal, setOccTotal] = useState(0);
  const [occFibResult, setOccFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [occFibInput, setOccFibInput] = useState('');
  const [occMemoRunning, setOccMemoRunning] = useState(false);
  const [occMemoLocked, setOccMemoLocked] = useState(false);
  const [occMemoPaused, setOccMemoPaused] = useState(false);
  const [occMemoCount, setOccMemoCount] = useState(0);
  const [occMemoRepeat, setOccMemoRepeat] = useState(1);
  const [occMemoLoop, setOccMemoLoop] = useState(false);
  const [occMemoIdx, setOccMemoIdx] = useState(0);
  const [occTestIdx, setOccTestIdx] = useState(0);
  const [occTestAnswered, setOccTestAnswered] = useState(false);
  const [occTestCorrect, setOccTestCorrect] = useState(false);
  const [occTestScore, setOccTestScore] = useState(0);
  const [occTestTotal, setOccTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (occMemoRunning && !occMemoPaused) {
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
  }, [occMemoRunning, occMemoPaused]);

  useEffect(() => {
    if (!occMemoRunning || occMemoPaused) return;
    const item = OCCUPATIONS[occMemoIdx].name;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setOccMemoCount((c) => {
          const next = c + 1;
          if (next >= occMemoRepeat) {
            const nextIdx = (occMemoIdx + 1) % OCCUPATIONS.length;
            if (nextIdx === 0 && !occMemoLoop) {
              setOccMemoRunning(false);
              return 0;
            }
            setOccMemoIdx(nextIdx);
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
  }, [occMemoRunning, occMemoPaused, occMemoLocked, occMemoIdx, occMemoCount, occMemoRepeat, occMemoLoop]);

  useEffect(() => {
    if (occSub === 'test' && !occTestAnswered) {
      speakThenSpell(OCCUPATIONS[occTestIdx % OCCUPATIONS.length].name);
    }
  }, [occSub, occTestIdx, occTestAnswered]);

  const handleOccClick = useCallback(
    (c: string) => {
      if (occAnswered) return;
      setOccAnswered(true);
      setOccTotal((p) => p + 1);
      if (c === OCCUPATIONS[occIdx].name) {
        setOccScore((p) => p + 1);
        setOccCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setOccCorrect(false);
        speak(`This is ${OCCUPATIONS[occIdx].name}`);
      }
    },
    [occAnswered, occIdx],
  );

  const handleOccFib = useCallback(() => {
    if (occAnswered || !occFibInput.trim()) return;
    setOccAnswered(true);
    setOccTotal((p) => p + 1);
    if (occFibInput.trim().toLowerCase() === OCCUPATIONS[occIdx].name.toLowerCase()) {
      setOccScore((p) => p + 1);
      setOccCorrect(true);
      setOccFibResult('correct');
      speak(`Yes! ${OCCUPATIONS[occIdx].name}`);
    } else {
      setOccFibResult('wrong');
      setOccCorrect(false);
      speak(`This is ${OCCUPATIONS[occIdx].name}`);
    }
  }, [occAnswered, occFibInput, occIdx]);

  const handleOccTestClick = useCallback(
    (clickedWord: string) => {
      if (occTestAnswered) return;
      setOccTestTotal((p) => p + 1);
      setOccTestAnswered(true);
      const correct = clickedWord === OCCUPATIONS[occTestIdx % OCCUPATIONS.length].name;
      setOccTestCorrect(correct);
      if (correct) setOccTestScore((p) => p + 1);
      setTimeout(
        () => {
          setOccTestIdx((p) => p + 1);
          setOccTestAnswered(false);
          setOccTestCorrect(false);
        },
        quizDelay(OCCUPATIONS[occTestIdx % OCCUPATIONS.length].name),
      );
    },
    [occTestAnswered, occTestIdx],
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
                setOccSub(m);
                setOccAnswered(false);
                setOccCorrect(false);
                setOccQuiz(false);
                setOccMemoRunning(false);
                setOccMemoLocked(false);
                setOccFibResult(null);
                setOccFibInput('');
                setOccTestIdx(Math.floor(Math.random() * OCCUPATIONS.length));
                setOccTestAnswered(false);
                setOccTestCorrect(false);
                setOccTestScore(0);
                setOccTestTotal(0);
                if (m === 'fib') setOccQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${occSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {occSub === 'learn' && occMemoRunning && !occMemoLocked && !occMemoPaused && (
          <button type="button" onClick={() => setOccMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {occSub === 'test' ? (
        (() => {
          const currentWord = OCCUPATIONS[occTestIdx % OCCUPATIONS.length].name;
          const testOptions = [
            currentWord,
            ...OCCUPATIONS.filter((_, i) => i !== occTestIdx % OCCUPATIONS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((v) => v.name),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which occupation did you hear?</h2>
              {occTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${occTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{occTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleOccTestClick(w)} disabled={occTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${occTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${occTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {occTestScore}/{occTestTotal}
              </div>
            </div>
          );
        })()
      ) : occSub === 'quiz' ? (
        <div className="text-center">
          {!occQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">💼 Occupations</h2>
              <p className="mt-2 text-sm text-slate-600">Click an occupation to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {OCCUPATIONS.map((o) => (
                  <button key={o.name} type="button" onClick={() => speakThenSpell(o.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-3xl">{o.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{o.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * OCCUPATIONS.length);
                  setOccIdx(r);
                  setOccQuiz(true);
                  setOccAnswered(false);
                  setOccCorrect(false);
                  setOccScore(0);
                  setOccTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">Which occupation is this?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occIdx].emoji}</div>
              </div>
              {occAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${occCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{occCorrect ? '✅ Correct!' : `❌ It's ${OCCUPATIONS[occIdx].name}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...OCCUPATIONS]
                  .sort(() => Math.random() - 0.5)
                  .map((o) => (
                    <button key={o.name} type="button" onClick={() => handleOccClick(o.name)} disabled={occAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${occAnswered ? 'opacity-50' : 'hover:scale-105'} ${occAnswered && o.name === OCCUPATIONS[occIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {o.emoji} {o.name}
                    </button>
                  ))}
              </div>
              {occAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setOccIdx((p) => (p + 1) % OCCUPATIONS.length);
                    setOccAnswered(false);
                    setOccCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {occScore}/{occTotal}
              </div>
            </>
          )}
        </div>
      ) : occSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Occupation Name</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occIdx].emoji}</div>
          </div>
          {occFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {occFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {OCCUPATIONS[occIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={occFibInput}
              onChange={(e) => setOccFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !occAnswered) handleOccFib();
              }}
              placeholder="Type the name..."
              disabled={occAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!occAnswered ? (
                <button type="button" onClick={handleOccFib} disabled={!occFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOccIdx((p) => (p + 1) % OCCUPATIONS.length);
                    setOccAnswered(false);
                    setOccFibResult(null);
                    setOccFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {occScore}/{occTotal}
          </div>
        </div>
      ) : occMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{OCCUPATIONS[occMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: occMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= occMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setOccMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !occMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Occupations</h2>
          <p className="text-sm text-slate-600">Watch and listen as occupations are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setOccMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{occMemoRepeat}</span>
              <button type="button" onClick={() => setOccMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={occMemoLoop} onChange={(e) => setOccMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setOccMemoRunning(true);
              setOccMemoCount(0);
              setOccMemoIdx(Math.floor(Math.random() * OCCUPATIONS.length));
              setOccMemoLocked(false);
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
              Item {occMemoIdx + 1}/{OCCUPATIONS.length}
            </span>
            <span>
              Repeat {occMemoCount + 1}/{occMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occMemoIdx].emoji}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{OCCUPATIONS[occMemoIdx].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: occMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= occMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOccMemoPaused((p) => !p);
                if (!occMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${occMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {occMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setOccMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
