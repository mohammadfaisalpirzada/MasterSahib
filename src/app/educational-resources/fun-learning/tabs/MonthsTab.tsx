'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

const MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function MonthsTab() {
  const [monthSub, setMonthSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [monthIdx, setMonthIdx] = useState(0);
  const [monthQuiz, setMonthQuiz] = useState(false);
  const [monthAnswered, setMonthAnswered] = useState(false);
  const [monthCorrect, setMonthCorrect] = useState(false);
  const [monthScore, setMonthScore] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [monthFibResult, setMonthFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [monthFibInput, setMonthFibInput] = useState('');
  const [monthMemoRunning, setMonthMemoRunning] = useState(false);
  const [monthMemoLocked, setMonthMemoLocked] = useState(false);
  const [monthMemoPaused, setMonthMemoPaused] = useState(false);
  const [monthMemoCount, setMonthMemoCount] = useState(0);
  const [monthMemoRepeat, setMonthMemoRepeat] = useState(1);
  const [monthMemoLoop, setMonthMemoLoop] = useState(false);
  const [monthMemoIdx, setMonthMemoIdx] = useState(0);
  const [monthIntroDone, setMonthIntroDone] = useState(false);
  const [monthTestIdx, setMonthTestIdx] = useState(0);
  const [monthTestAnswered, setMonthTestAnswered] = useState(false);
  const [monthTestCorrect, setMonthTestCorrect] = useState(false);
  const [monthTestScore, setMonthTestScore] = useState(0);
  const [monthTestTotal, setMonthTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (monthMemoRunning && !monthMemoPaused) {
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
  }, [monthMemoRunning, monthMemoPaused]);

  useEffect(() => {
    if (!monthMemoRunning || monthMemoPaused) return;
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    if (!monthIntroDone) {
      speak('There are twelve months in a year.');
      const t = setTimeout(() => {
        setMonthIntroDone(true);
      }, 3000);
      return () => clearTimeout(t);
    }
    const item = MONTHS_LIST[monthMemoIdx];
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(
      () => {
        setMonthMemoCount((c) => {
          const next = c + 1;
          if (next >= monthMemoRepeat) {
            const nextIdx = (monthMemoIdx + 1) % MONTHS_LIST.length;
            if (nextIdx === 0 && !monthMemoLoop) {
              setMonthMemoRunning(false);
              return 0;
            }
            setMonthMemoIdx(nextIdx);
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
  }, [monthMemoRunning, monthMemoPaused, monthMemoLocked, monthMemoIdx, monthMemoCount, monthMemoRepeat, monthMemoLoop, monthIntroDone]);

  useEffect(() => {
    if (monthSub === 'test' && !monthTestAnswered) {
      speakThenSpell(MONTHS_LIST[monthTestIdx % MONTHS_LIST.length]);
    }
  }, [monthSub, monthTestIdx, monthTestAnswered]);

  const handleMonthClick = useCallback(
    (c: string) => {
      if (monthAnswered) return;
      setMonthAnswered(true);
      setMonthTotal((p) => p + 1);
      if (c === MONTHS_LIST[monthIdx]) {
        setMonthScore((p) => p + 1);
        setMonthCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setMonthCorrect(false);
        speak(`This is ${MONTHS_LIST[monthIdx]}`);
      }
    },
    [monthAnswered, monthIdx],
  );

  const handleMonthFib = useCallback(() => {
    if (monthAnswered || !monthFibInput.trim()) return;
    setMonthAnswered(true);
    setMonthTotal((p) => p + 1);
    if (monthFibInput.trim().toLowerCase() === MONTHS_LIST[monthIdx].toLowerCase()) {
      setMonthScore((p) => p + 1);
      setMonthCorrect(true);
      setMonthFibResult('correct');
      speak(`Yes! ${MONTHS_LIST[monthIdx]}`);
    } else {
      setMonthFibResult('wrong');
      setMonthCorrect(false);
      speak(`This is ${MONTHS_LIST[monthIdx]}`);
    }
  }, [monthAnswered, monthFibInput, monthIdx]);

  const handleMonthTestClick = useCallback(
    (clickedWord: string) => {
      if (monthTestAnswered) return;
      setMonthTestTotal((p) => p + 1);
      setMonthTestAnswered(true);
      const correct = clickedWord === MONTHS_LIST[monthTestIdx % MONTHS_LIST.length];
      setMonthTestCorrect(correct);
      if (correct) setMonthTestScore((p) => p + 1);
      setTimeout(
        () => {
          setMonthTestIdx((p) => p + 1);
          setMonthTestAnswered(false);
          setMonthTestCorrect(false);
        },
        quizDelay(MONTHS_LIST[monthTestIdx % MONTHS_LIST.length]),
      );
    },
    [monthTestAnswered, monthTestIdx],
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
                setMonthSub(m);
                setMonthAnswered(false);
                setMonthCorrect(false);
                setMonthQuiz(false);
                setMonthMemoRunning(false);
                setMonthMemoLocked(false);
                setMonthFibResult(null);
                setMonthFibInput('');
                setMonthTestIdx(Math.floor(Math.random() * MONTHS_LIST.length));
                setMonthTestAnswered(false);
                setMonthTestCorrect(false);
                setMonthTestScore(0);
                setMonthTestTotal(0);
                if (m === 'fib') setMonthQuiz(true);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${monthSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {monthSub === 'learn' && monthMemoRunning && !monthMemoLocked && !monthMemoPaused && (
          <button type="button" onClick={() => setMonthMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {monthSub === 'test' ? (
        (() => {
          const currentWord = MONTHS_LIST[monthTestIdx % MONTHS_LIST.length];
          const testOptions = [
            currentWord,
            ...MONTHS_LIST.filter((_, i) => i !== monthTestIdx % MONTHS_LIST.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which month did you hear?</h2>
              {monthTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${monthTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{monthTestCorrect ? '✅ Correct!' : `❌ It's ${currentWord}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w} type="button" onClick={() => handleMonthTestClick(w)} disabled={monthTestAnswered} className={`rounded-xl bg-white border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition ${monthTestAnswered ? 'opacity-50' : 'hover:border-fuchsia-400 hover:bg-fuchsia-50'} ${monthTestAnswered && w === currentWord ? 'border-emerald-400 bg-emerald-50' : ''}`}>
                    {w}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {monthTestScore}/{monthTestTotal}
              </div>
            </div>
          );
        })()
      ) : monthSub === 'quiz' ? (
        <div className="text-center">
          {!monthQuiz ? (
            <>
              <h2 className="text-lg font-bold text-slate-900">📅 Months of the Year</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">There are twelve months in a year.</p>
              <p className="mt-1 text-xs text-slate-400">Click a month to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {MONTHS_LIST.map((m, i) => (
                  <button key={m} type="button" onClick={() => speakThenSpell(m)} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-pink-50 to-rose-50 px-5 py-3 text-base font-bold text-slate-800 shadow-sm transition hover:scale-105 hover:shadow-md">
                    <span className="text-xs text-slate-400">Month {i + 1}</span>
                    <br />
                    {m}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = Math.floor(Math.random() * MONTHS_LIST.length);
                  setMonthIdx(r);
                  setMonthQuiz(true);
                  setMonthAnswered(false);
                  setMonthCorrect(false);
                  setMonthScore(0);
                  setMonthTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">Which month is this?</h2>
              <div className="mt-5 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-4xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthIdx].slice(0, 3)}</div>
              </div>
              {monthAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${monthCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{monthCorrect ? '✅ Correct!' : `❌ It's ${MONTHS_LIST[monthIdx]}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[...MONTHS_LIST]
                  .sort(() => Math.random() - 0.5)
                  .map((m) => (
                    <button key={m} type="button" onClick={() => handleMonthClick(m)} disabled={monthAnswered} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${monthAnswered ? 'opacity-50' : 'hover:scale-105'} ${monthAnswered && m === MONTHS_LIST[monthIdx] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                      {m}
                    </button>
                  ))}
              </div>
              {monthAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setMonthIdx((p) => (p + 1) % MONTHS_LIST.length);
                    setMonthAnswered(false);
                    setMonthCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {monthScore}/{monthTotal}
              </div>
            </>
          )}
        </div>
      ) : monthSub === 'fib' ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Type the Month Name</h2>
          <div className="mt-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-3xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthIdx].slice(0, 3)}</div>
          </div>
          {monthFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {monthFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {MONTHS_LIST[monthIdx]}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={monthFibInput}
              onChange={(e) => setMonthFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !monthAnswered) handleMonthFib();
              }}
              placeholder="Type the month name..."
              disabled={monthAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!monthAnswered ? (
                <button type="button" onClick={handleMonthFib} disabled={!monthFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMonthIdx((p) => (p + 1) % MONTHS_LIST.length);
                    setMonthAnswered(false);
                    setMonthFibResult(null);
                    setMonthFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {monthScore}/{monthTotal}
          </div>
        </div>
      ) : monthMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-4xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthMemoIdx].slice(0, 3)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{MONTHS_LIST[monthMemoIdx]}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: monthMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= monthMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setMonthMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !monthMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Months</h2>
          <p className="text-sm text-slate-600">Watch and listen as the months are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMonthMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{monthMemoRepeat}</span>
              <button type="button" onClick={() => setMonthMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={monthMemoLoop} onChange={(e) => setMonthMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setMonthMemoRunning(true);
              setMonthMemoCount(0);
              setMonthMemoIdx(0);
              setMonthMemoLocked(false);
              setMonthIntroDone(false);
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
              Month {monthMemoIdx + 1}/{MONTHS_LIST.length}
            </span>
            <span>
              Repeat {monthMemoCount + 1}/{monthMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-4xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthMemoIdx].slice(0, 3)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{MONTHS_LIST[monthMemoIdx]}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: monthMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= monthMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMonthMemoPaused((p) => !p);
                if (!monthMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${monthMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {monthMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setMonthMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
