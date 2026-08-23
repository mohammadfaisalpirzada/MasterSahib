'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, quizDelay } from '@/app/lib/learn-utils';

type NumWord = { num: number; word: string };

const TY_WORDS: NumWord[] = [
  { num: 20, word: 'twenty' },
  { num: 30, word: 'thirty' },
  { num: 40, word: 'forty' },
  { num: 50, word: 'fifty' },
  { num: 60, word: 'sixty' },
  { num: 70, word: 'seventy' },
  { num: 80, word: 'eighty' },
  { num: 90, word: 'ninety' },
];

function getQuizOptions(list: NumWord[], correctIdx: number): NumWord[] {
  const opts = [list[correctIdx]];
  const pool = list.filter((_, i) => i !== correctIdx);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  opts.push(pool[0], pool[1], pool[2]);
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

export default function TyTab() {
  const [tyMode, setTyMode] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [tyIdx, setTyIdx] = useState(() => Math.floor(Math.random() * TY_WORDS.length));
  const [tyQuizOpts, setTyQuizOpts] = useState<NumWord[]>([]);
  const [tyScore, setTyScore] = useState(0);
  const [tyTotal, setTyTotal] = useState(0);
  const [tyAnswered, setTyAnswered] = useState(false);
  const [tyCorrect, setTyCorrect] = useState(false);
  const [tyFibInput, setTyFibInput] = useState('');
  const [tyFibResult, setTyFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [tyMemoRepeat, setTyMemoRepeat] = useState(3);
  const [tyMemoLoop, setTyMemoLoop] = useState(true);
  const [tyMemoCount, setTyMemoCount] = useState(0);
  const [tyMemoIdx, setTyMemoIdx] = useState(0);
  const [tyMemoRunning, setTyMemoRunning] = useState(false);
  const [tyMemoLocked, setTyMemoLocked] = useState(false);
  const [tyMemoPaused, setTyMemoPaused] = useState(false);
  const [tyTestIdx, setTyTestIdx] = useState(0);
  const [tyTestAnswered, setTyTestAnswered] = useState(false);
  const [tyTestCorrect, setTyTestCorrect] = useState(false);
  const [tyTestScore, setTyTestScore] = useState(0);
  const [tyTestTotal, setTyTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (tyMemoRunning && !tyMemoPaused) {
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
  }, [tyMemoRunning, tyMemoPaused]);

  useEffect(() => {
    if (tyMode !== 'quiz') return;
    setTyQuizOpts(getQuizOptions(TY_WORDS, tyIdx));
  }, [tyIdx, tyMode]);

  useEffect(() => {
    if (tyMode !== 'quiz' || !tyAnswered) return;
    const t = setTimeout(() => {
      setTyIdx((p) => (p + 1) % TY_WORDS.length);
      setTyAnswered(false);
      setTyCorrect(false);
      setTyFibResult(null);
      setTyFibInput('');
    }, quizDelay(TY_WORDS[tyIdx].word));
    return () => clearTimeout(t);
  }, [tyAnswered, tyMode, tyIdx]);

  useEffect(() => {
    if (tyMode !== 'fib' || !tyAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do {
        n = Math.floor(Math.random() * TY_WORDS.length);
      } while (n === tyIdx && TY_WORDS.length > 1);
      setTyIdx(n);
      setTyAnswered(false);
      setTyFibResult(null);
      setTyFibInput('');
    }, quizDelay(TY_WORDS[tyIdx].word));
    return () => clearTimeout(t);
  }, [tyAnswered, tyMode, tyIdx]);

  useEffect(() => {
    if (!tyMemoRunning || tyMemoPaused) return;
    const item = TY_WORDS[tyMemoIdx];
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item.word), 300);
    const advanceTimer = setTimeout(
      () => {
        setTyMemoCount((c) => {
          const next = c + 1;
          if (next >= tyMemoRepeat) {
            const nextIdx = (tyMemoIdx + 1) % TY_WORDS.length;
            if (nextIdx === 0 && !tyMemoLoop) {
              setTyMemoRunning(false);
              return 0;
            }
            setTyMemoIdx(nextIdx);
            return 0;
          }
          return next;
        });
      },
      300 + item.word.length * letterTime + finalNameTime + pauseAfter,
    );
    return () => {
      clearTimeout(spellTimer);
      clearTimeout(advanceTimer);
    };
  }, [tyMemoRunning, tyMemoPaused, tyMemoIdx, tyMemoCount, tyMemoRepeat, tyMemoLoop, tyMemoLocked]);

  useEffect(() => {
    if (tyMode === 'test' && !tyTestAnswered) {
      speak(TY_WORDS[tyTestIdx % TY_WORDS.length].word);
    }
  }, [tyMode, tyTestIdx, tyTestAnswered]);

  const handleTyQuiz = useCallback(
    (word: string) => {
      if (tyAnswered) return;
      setTyTotal((p) => p + 1);
      setTyAnswered(true);
      if (word === TY_WORDS[tyIdx].word) {
        setTyScore((p) => p + 1);
        setTyCorrect(true);
        speak(`Yes! ${TY_WORDS[tyIdx].word}`);
        setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800);
      } else {
        setTyCorrect(false);
        speak(`This is ${TY_WORDS[tyIdx].word}`);
        setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800);
      }
    },
    [tyAnswered, tyIdx],
  );

  const handleTyFib = useCallback(() => {
    if (!tyFibInput.trim()) return;
    setTyTotal((p) => p + 1);
    setTyAnswered(true);
    if (tyFibInput.trim().toLowerCase() === TY_WORDS[tyIdx].word.toLowerCase()) {
      setTyScore((p) => p + 1);
      setTyFibResult('correct');
      speak(`Correct! ${TY_WORDS[tyIdx].word}`);
      setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800);
    } else {
      setTyFibResult('wrong');
      speak(`This is ${TY_WORDS[tyIdx].word}`);
      setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800);
    }
  }, [tyFibInput, tyIdx]);

  const handleTyTestClick = useCallback(
    (clickedWord: string) => {
      if (tyTestAnswered) return;
      setTyTestTotal((p) => p + 1);
      setTyTestAnswered(true);
      const correct = clickedWord === TY_WORDS[tyTestIdx % TY_WORDS.length].word;
      setTyTestCorrect(correct);
      if (correct) setTyTestScore((p) => p + 1);
      setTimeout(
        () => {
          setTyTestIdx((p) => p + 1);
          setTyTestAnswered(false);
          setTyTestCorrect(false);
        },
        quizDelay(TY_WORDS[tyTestIdx % TY_WORDS.length].word),
      );
    },
    [tyTestAnswered, tyTestIdx],
  );

  const renderTyNumQuiz = (fibMode: boolean) =>
    fibMode ? (
      <div className="text-center">
        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Type the word for <span className="text-fuchsia-600">{TY_WORDS[tyIdx].num}</span>
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-3xl font-black text-fuchsia-700 shadow-inner">{TY_WORDS[tyIdx].num}</div>
        </div>
        {tyFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
        {tyFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {TY_WORDS[tyIdx].word}</div>}
        <div className="mt-4 flex flex-col items-center gap-3">
          <input
            type="text"
            value={tyFibInput}
            onChange={(e) => setTyFibInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !tyAnswered) handleTyFib();
            }}
            placeholder="Type the word..."
            disabled={tyAnswered}
            className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
          />
          <div className="flex gap-2">
            {!tyAnswered ? (
              <button type="button" onClick={handleTyFib} disabled={!tyFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                Check
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTyIdx((n) => (n + 1) % TY_WORDS.length);
                  setTyAnswered(false);
                  setTyFibResult(null);
                  setTyFibInput('');
                }}
                className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Score: {tyScore}/{tyTotal}
        </div>
      </div>
    ) : (
      <div className="text-center">
        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Find the word for <span className="text-fuchsia-600">{TY_WORDS[tyIdx].num}</span>
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-3xl font-black text-fuchsia-700 shadow-inner">{TY_WORDS[tyIdx].num}</div>
        </div>
        <button type="button" onClick={() => speak(TY_WORDS[tyIdx].word)} className="mt-2 text-xs text-slate-400 hover:text-slate-600">
          🔊 Hear it
        </button>
        {tyAnswered && (
          <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${tyCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {tyCorrect ? '✅ Correct!' : `❌ It's ${TY_WORDS[tyIdx].word}`}
            <span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(TY_WORDS[tyIdx].word) / 1000)}s...</span>
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {tyQuizOpts.map((opt) => (
            <button key={opt.word} type="button" onClick={() => handleTyQuiz(opt.word)} disabled={tyAnswered} className={`rounded-2xl border-2 px-5 py-3 text-base font-bold transition ${tyAnswered && opt.word === TY_WORDS[tyIdx].word ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : tyAnswered && opt !== TY_WORDS[tyIdx] ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-fuchsia-300 hover:bg-fuchsia-50'}`}>
              {opt.word}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Score: {tyScore}/{tyTotal}
        </div>
      </div>
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
                setTyMode(m);
                setTyAnswered(false);
                setTyCorrect(false);
                setTyMemoRunning(false);
                setTyMemoLocked(false);
                setTyFibResult(null);
                setTyFibInput('');
                setTyTestIdx(Math.floor(Math.random() * TY_WORDS.length));
                setTyTestAnswered(false);
                setTyTestCorrect(false);
                setTyTestScore(0);
                setTyTestTotal(0);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${tyMode === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {tyMode === 'learn' && tyMemoRunning && !tyMemoLocked && !tyMemoPaused && (
          <button type="button" onClick={() => setTyMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {tyMode === 'test' ? (
        (() => {
          const correctWord = TY_WORDS[tyTestIdx % TY_WORDS.length];
          const testOptions = [
            correctWord,
            ...TY_WORDS.filter((_, i) => i !== tyTestIdx % TY_WORDS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which number did you hear?</h2>
              <p className="mt-1 text-xs text-slate-400">Listen and tap the matching word</p>
              {tyTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${tyTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{tyTestCorrect ? '✅ Correct!' : `❌ It's ${correctWord.word}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w.word} type="button" onClick={() => handleTyTestClick(w.word)} disabled={tyTestAnswered} className={`rounded-2xl border-2 px-5 py-3 text-base font-bold transition ${tyTestAnswered && w.word === correctWord.word ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : tyTestAnswered ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-fuchsia-300 hover:bg-fuchsia-50'}`}>
                    <span className="text-2xl font-black">{w.num}</span>
                    <span className="block text-sm">{w.word}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {tyTestScore}/{tyTestTotal}
              </div>
            </div>
          );
        })()
      ) : tyMode === 'quiz' ? (
        <div className="text-center">{renderTyNumQuiz(false)}</div>
      ) : tyMode === 'fib' ? (
        <div className="text-center">{renderTyNumQuiz(true)}</div>
      ) : tyMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TY_WORDS[tyMemoIdx].num}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{TY_WORDS[tyMemoIdx].word}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: tyMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= tyMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setTyMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !tyMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Ty Words</h2>
          <p className="text-sm text-slate-600">Watch and listen as tens number words (20-90) are shown, spelled, and named.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setTyMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{tyMemoRepeat}</span>
              <button type="button" onClick={() => setTyMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={tyMemoLoop} onChange={(e) => setTyMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setTyMemoRunning(true);
              setTyMemoCount(0);
              setTyMemoIdx(0);
              setTyMemoLocked(false);
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
              Word {tyMemoIdx + 1}/{TY_WORDS.length}
            </span>
            <span>
              Repeat {tyMemoCount + 1}/{tyMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TY_WORDS[tyMemoIdx].num}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{TY_WORDS[tyMemoIdx].word}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: tyMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= tyMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTyMemoPaused((p) => !p);
                if (!tyMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${tyMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {tyMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setTyMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
