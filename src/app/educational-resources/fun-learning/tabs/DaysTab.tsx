'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DaysTab() {
  const [daysSub, setDaysSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [daysIdx, setDaysIdx] = useState(0);
  const [daysQuiz, setDaysQuiz] = useState(false);
  const [daysAnswered, setDaysAnswered] = useState(false);
  const [daysCorrect, setDaysCorrect] = useState(false);
  const [daysScore, setDaysScore] = useState(0);
  const [daysTotal, setDaysTotal] = useState(0);
  const [dMemoRunning, setDMemoRunning] = useState(false);
  const [dMemoLocked, setDMemoLocked] = useState(false);
  const [dMemoPaused, setDMemoPaused] = useState(false);
  const [dMemoCount, setDMemoCount] = useState(0);
  const [dMemoRepeat, setDMemoRepeat] = useState(1);
  const [dMemoLoop, setDMemoLoop] = useState(false);
  const [dMemoIdx, setDMemoIdx] = useState(0);
  const [dIntroDone, setDIntroDone] = useState(false);
  const [daysFibResult, setDaysFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [daysFibInput, setDaysFibInput] = useState('');
  const [dayTestIdx, setDayTestIdx] = useState(0);
  const [dayTestAnswered, setDayTestAnswered] = useState(false);
  const [dayTestCorrect, setDayTestCorrect] = useState(false);
  const [dayTestScore, setDayTestScore] = useState(0);
  const [dayTestTotal, setDayTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (dMemoRunning && !dMemoPaused) {
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
  }, [dMemoRunning, dMemoPaused]);

  useEffect(() => {
    if (!dMemoRunning || dMemoPaused) return;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    if (!dIntroDone) {
      speak('There are seven days in a week.');
      const t = setTimeout(() => {
        setDIntroDone(true);
      }, 3000);
      return () => clearTimeout(t);
    }
    const item = DAYS[dMemoIdx];
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setDMemoCount((c) => {
          const next = c + 1;
          if (next >= dMemoRepeat) {
            const nextIdx = (dMemoIdx + 1) % DAYS.length;
            if (nextIdx === 0 && !dMemoLoop) {
              setDMemoRunning(false);
              return 0;
            }
            setDMemoIdx(nextIdx);
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
  }, [dMemoRunning, dMemoPaused, dMemoLocked, dMemoIdx, dMemoCount, dMemoRepeat, dMemoLoop, dIntroDone]);

  useEffect(() => {
    if (daysSub === 'test' && !dayTestAnswered) {
      speakThenSpell(DAYS[dayTestIdx % DAYS.length]);
    }
  }, [daysSub, dayTestIdx, dayTestAnswered]);

  const handleDaysClick = useCallback(
    (c: string) => {
      if (daysAnswered) return;
      setDaysAnswered(true);
      setDaysTotal((p) => p + 1);
      if (c === DAYS[daysIdx]) {
        setDaysScore((p) => p + 1);
        setDaysCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setDaysCorrect(false);
        speak(`This is ${DAYS[daysIdx]}`);
      }
    },
    [daysAnswered, daysIdx],
  );

  const handleDaysFib = useCallback(() => {
    if (daysAnswered || !daysFibInput.trim()) return;
    setDaysAnswered(true);
    setDaysTotal((p) => p + 1);
    if (daysFibInput.trim().toLowerCase() === DAYS[daysIdx].toLowerCase()) {
      setDaysScore((p) => p + 1);
      setDaysCorrect(true);
      setDaysFibResult('correct');
      speak(`Yes! ${DAYS[daysIdx]}`);
    } else {
      setDaysFibResult('wrong');
      setDaysCorrect(false);
      speak(`This is ${DAYS[daysIdx]}`);
    }
  }, [daysAnswered, daysFibInput, daysIdx]);

  const handleDayTestClick = useCallback(
    (clickedWord: string) => {
      if (dayTestAnswered) return;
      setDayTestTotal((p) => p + 1);
      setDayTestAnswered(true);
      const correct = clickedWord === DAYS[dayTestIdx % DAYS.length];
      setDayTestCorrect(correct);
      if (correct) setDayTestScore((p) => p + 1);
      setTimeout(
        () => {
          setDayTestIdx((p) => p + 1);
          setDayTestAnswered(false);
          setDayTestCorrect(false);
        },
        quizDelay(DAYS[dayTestIdx % DAYS.length]),
      );
    },
    [dayTestAnswered, dayTestIdx],
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
                setDaysSub(m);
                setDaysAnswered(false);
                setDaysCorrect(false);
                setDaysQuiz(false);
                setDMemoRunning(false);
                setDMemoLocked(false);
                setDaysFibResult(null);
                setDaysFibInput('');
                setDayTestIdx(Math.floor(Math.random() * DAYS.length));
                setDayTestAnswered(false);
                setDayTestCorrect(false);
                setDayTestScore(0);
                setDayTestTotal(0);
                if (m === 'fib') setDaysQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${daysSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {daysSub === 'learn' && dMemoRunning && !dMemoLocked && !dMemoPaused && (
          <button type="button" onClick={() => setDMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {daysSub === 'test' ? (
        (() => {
          const currentWord = DAYS[dayTestIdx % DAYS.length];
          const testOptions = [
            currentWord,
            ...DAYS.filter((_, i) => i !== dayTestIdx % DAYS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which word did you hear?</h2>
              {dayTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${dayTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{dayTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleDayTestClick(w)} disabled={dayTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${dayTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${dayTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {dayTestScore}/{dayTestTotal}
              </div>
            </div>
          );
        })()
      ) : daysSub === 'quiz' ? (
        <div className="text-center">
          {!daysQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">📅 Days of the Week</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">There are seven days in a week.</p>
              <p className="mt-1 text-xs text-slate-400">Click a day to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {DAYS.map((d, i) => (
                  <button key={d} type="button" onClick={() => speakThenSpell(d)} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 px-5 py-3 text-base font-bold text-slate-800 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-xs text-slate-400">Day {i + 1}</span>
                    <br />
                    {d}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * DAYS.length);
                  setDaysIdx(r);
                  setDaysQuiz(true);
                  setDaysAnswered(false);
                  setDaysCorrect(false);
                  setDaysScore(0);
                  setDaysTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">Which day is this?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-700 shadow-inner">{DAYS[daysIdx].slice(0, 2)}</div>
              </div>
              {daysAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${daysCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{daysCorrect ? '✅ Correct!' : `❌ It's ${DAYS[daysIdx]}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...DAYS]
                  .sort(() => Math.random() - 0.5)
                  .map((d) => (
                    <button key={d} type="button" onClick={() => handleDaysClick(d)} disabled={daysAnswered} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${daysAnswered ? 'opacity-50' : 'hover:scale-105'} ${daysAnswered && d === DAYS[daysIdx] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {d}
                    </button>
                  ))}
              </div>
              {daysAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setDaysIdx((p) => (p + 1) % DAYS.length);
                    setDaysAnswered(false);
                    setDaysCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next Day →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {daysScore}/{daysTotal}
              </div>
            </>
          )}
        </div>
      ) : daysSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Day Name</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-3xl font-black text-indigo-700 shadow-inner">{DAYS[daysIdx].slice(0, 3)}</div>
          </div>
          {daysFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {daysFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {DAYS[daysIdx]}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={daysFibInput}
              onChange={(e) => setDaysFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !daysAnswered) handleDaysFib();
              }}
              placeholder="Type the day name..."
              disabled={daysAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!daysAnswered ? (
                <button type="button" onClick={handleDaysFib} disabled={!daysFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDaysIdx((p) => (p + 1) % DAYS.length);
                    setDaysAnswered(false);
                    setDaysFibResult(null);
                    setDaysFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {daysScore}/{daysTotal}
          </div>
        </div>
      ) : dMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-700 shadow-inner">{DAYS[dMemoIdx].slice(0, 2)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{DAYS[dMemoIdx]}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: dMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= dMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setDMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !dMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Days</h2>
          <p className="text-sm text-slate-600">Watch and listen as the days are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setDMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{dMemoRepeat}</span>
              <button type="button" onClick={() => setDMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={dMemoLoop} onChange={(e) => setDMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setDMemoRunning(true);
              setDMemoCount(0);
              setDMemoIdx(0);
              setDMemoLocked(false);
              setDIntroDone(false);
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
              Day {dMemoIdx + 1}/{DAYS.length}
            </span>
            <span>
              Repeat {dMemoCount + 1}/{dMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-700 shadow-inner">{DAYS[dMemoIdx].slice(0, 2)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{DAYS[dMemoIdx]}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: dMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= dMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDMemoPaused((p) => !p);
                if (!dMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${dMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {dMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setDMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
