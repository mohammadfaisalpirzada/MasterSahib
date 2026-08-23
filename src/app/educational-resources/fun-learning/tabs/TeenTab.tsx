'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, quizDelay } from '@/app/lib/learn-utils';

type NumWord = { num: number; word: string };

const TEEN_WORDS: NumWord[] = [
  { num: 13, word: 'thirteen' },
  { num: 14, word: 'fourteen' },
  { num: 15, word: 'fifteen' },
  { num: 16, word: 'sixteen' },
  { num: 17, word: 'seventeen' },
  { num: 18, word: 'eighteen' },
  { num: 19, word: 'nineteen' },
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

export default function TeenTab() {
  const [teenMode, setTeenMode] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [teenIdx, setTeenIdx] = useState(() => Math.floor(Math.random() * TEEN_WORDS.length));
  const [teenQuizOpts, setTeenQuizOpts] = useState<NumWord[]>([]);
  const [teenScore, setTeenScore] = useState(0);
  const [teenTotal, setTeenTotal] = useState(0);
  const [teenAnswered, setTeenAnswered] = useState(false);
  const [teenCorrect, setTeenCorrect] = useState(false);
  const [teenFibInput, setTeenFibInput] = useState('');
  const [teenFibResult, setTeenFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [teenMemoRepeat, setTeenMemoRepeat] = useState(3);
  const [teenMemoLoop, setTeenMemoLoop] = useState(true);
  const [teenMemoCount, setTeenMemoCount] = useState(0);
  const [teenMemoIdx, setTeenMemoIdx] = useState(0);
  const [teenMemoRunning, setTeenMemoRunning] = useState(false);
  const [teenMemoLocked, setTeenMemoLocked] = useState(false);
  const [teenMemoPaused, setTeenMemoPaused] = useState(false);
  const [teenTestIdx, setTeenTestIdx] = useState(0);
  const [teenTestAnswered, setTeenTestAnswered] = useState(false);
  const [teenTestCorrect, setTeenTestCorrect] = useState(false);
  const [teenTestScore, setTeenTestScore] = useState(0);
  const [teenTestTotal, setTeenTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (teenMemoRunning && !teenMemoPaused) {
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
  }, [teenMemoRunning, teenMemoPaused]);

  useEffect(() => {
    if (teenMode !== 'quiz') return;
    setTeenQuizOpts(getQuizOptions(TEEN_WORDS, teenIdx));
  }, [teenIdx, teenMode]);

  useEffect(() => {
    if (teenMode !== 'quiz' || !teenAnswered) return;
    const t = setTimeout(() => {
      setTeenIdx((p) => (p + 1) % TEEN_WORDS.length);
      setTeenAnswered(false);
      setTeenCorrect(false);
      setTeenFibResult(null);
      setTeenFibInput('');
    }, quizDelay(TEEN_WORDS[teenIdx].word));
    return () => clearTimeout(t);
  }, [teenAnswered, teenMode, teenIdx]);

  useEffect(() => {
    if (teenMode !== 'fib' || !teenAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do {
        n = Math.floor(Math.random() * TEEN_WORDS.length);
      } while (n === teenIdx && TEEN_WORDS.length > 1);
      setTeenIdx(n);
      setTeenAnswered(false);
      setTeenFibResult(null);
      setTeenFibInput('');
    }, quizDelay(TEEN_WORDS[teenIdx].word));
    return () => clearTimeout(t);
  }, [teenAnswered, teenMode, teenIdx]);

  useEffect(() => {
    if (!teenMemoRunning || teenMemoPaused) return;
    const item = TEEN_WORDS[teenMemoIdx];
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item.word), 300);
    const advanceTimer = setTimeout(
      () => {
        setTeenMemoCount((c) => {
          const next = c + 1;
          if (next >= teenMemoRepeat) {
            const nextIdx = (teenMemoIdx + 1) % TEEN_WORDS.length;
            if (nextIdx === 0 && !teenMemoLoop) {
              setTeenMemoRunning(false);
              return 0;
            }
            setTeenMemoIdx(nextIdx);
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
  }, [teenMemoRunning, teenMemoPaused, teenMemoIdx, teenMemoCount, teenMemoRepeat, teenMemoLoop, teenMemoLocked]);

  useEffect(() => {
    if (teenMode === 'test' && !teenTestAnswered) {
      speak(TEEN_WORDS[teenTestIdx % TEEN_WORDS.length].word);
    }
  }, [teenMode, teenTestIdx, teenTestAnswered]);

  const handleTeenQuiz = useCallback(
    (word: string) => {
      if (teenAnswered) return;
      setTeenTotal((p) => p + 1);
      setTeenAnswered(true);
      if (word === TEEN_WORDS[teenIdx].word) {
        setTeenScore((p) => p + 1);
        setTeenCorrect(true);
        speak(`Yes! ${TEEN_WORDS[teenIdx].word}`);
        setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800);
      } else {
        setTeenCorrect(false);
        speak(`This is ${TEEN_WORDS[teenIdx].word}`);
        setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800);
      }
    },
    [teenAnswered, teenIdx],
  );

  const handleTeenFib = useCallback(() => {
    if (!teenFibInput.trim()) return;
    setTeenTotal((p) => p + 1);
    setTeenAnswered(true);
    if (teenFibInput.trim().toLowerCase() === TEEN_WORDS[teenIdx].word.toLowerCase()) {
      setTeenScore((p) => p + 1);
      setTeenFibResult('correct');
      speak(`Correct! ${TEEN_WORDS[teenIdx].word}`);
      setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800);
    } else {
      setTeenFibResult('wrong');
      speak(`This is ${TEEN_WORDS[teenIdx].word}`);
      setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800);
    }
  }, [teenFibInput, teenIdx]);

  const handleTeenTestClick = useCallback(
    (clickedWord: string) => {
      if (teenTestAnswered) return;
      setTeenTestTotal((p) => p + 1);
      setTeenTestAnswered(true);
      const correct = clickedWord === TEEN_WORDS[teenTestIdx % TEEN_WORDS.length].word;
      setTeenTestCorrect(correct);
      if (correct) setTeenTestScore((p) => p + 1);
      setTimeout(
        () => {
          setTeenTestIdx((p) => p + 1);
          setTeenTestAnswered(false);
          setTeenTestCorrect(false);
        },
        quizDelay(TEEN_WORDS[teenTestIdx % TEEN_WORDS.length].word),
      );
    },
    [teenTestAnswered, teenTestIdx],
  );

  const renderTeenNumQuiz = (fibMode: boolean) =>
    fibMode ? (
      <div className="text-center">
        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Type the word for <span className="text-fuchsia-600">{TEEN_WORDS[teenIdx].num}</span>
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-3xl font-black text-fuchsia-700 shadow-inner">{TEEN_WORDS[teenIdx].num}</div>
        </div>
        {teenFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
        {teenFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {TEEN_WORDS[teenIdx].word}</div>}
        <div className="mt-4 flex flex-col items-center gap-3">
          <input
            type="text"
            value={teenFibInput}
            onChange={(e) => setTeenFibInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !teenAnswered) handleTeenFib();
            }}
            placeholder="Type the word..."
            disabled={teenAnswered}
            className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
          />
          <div className="flex gap-2">
            {!teenAnswered ? (
              <button type="button" onClick={handleTeenFib} disabled={!teenFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                Check
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTeenIdx((n) => (n + 1) % TEEN_WORDS.length);
                  setTeenAnswered(false);
                  setTeenFibResult(null);
                  setTeenFibInput('');
                }}
                className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Score: {teenScore}/{teenTotal}
        </div>
      </div>
    ) : (
      <div className="text-center">
        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Find the word for <span className="text-fuchsia-600">{TEEN_WORDS[teenIdx].num}</span>
        </h2>
        <div className="mt-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-3xl font-black text-fuchsia-700 shadow-inner">{TEEN_WORDS[teenIdx].num}</div>
        </div>
        <button type="button" onClick={() => speak(TEEN_WORDS[teenIdx].word)} className="mt-2 text-xs text-slate-400 hover:text-slate-600">
          🔊 Hear it
        </button>
        {teenAnswered && (
          <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${teenCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {teenCorrect ? '✅ Correct!' : `❌ It's ${TEEN_WORDS[teenIdx].word}`}
            <span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(TEEN_WORDS[teenIdx].word) / 1000)}s...</span>
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {teenQuizOpts.map((opt) => (
            <button key={opt.word} type="button" onClick={() => handleTeenQuiz(opt.word)} disabled={teenAnswered} className={`rounded-2xl border-2 px-5 py-3 text-base font-bold transition ${teenAnswered && opt.word === TEEN_WORDS[teenIdx].word ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : teenAnswered && opt !== TEEN_WORDS[teenIdx] ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-fuchsia-300 hover:bg-fuchsia-50'}`}>
              {opt.word}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Score: {teenScore}/{teenTotal}
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
                setTeenMode(m);
                setTeenAnswered(false);
                setTeenCorrect(false);
                setTeenMemoRunning(false);
                setTeenMemoLocked(false);
                setTeenFibResult(null);
                setTeenFibInput('');
                setTeenTestIdx(Math.floor(Math.random() * TEEN_WORDS.length));
                setTeenTestAnswered(false);
                setTeenTestCorrect(false);
                setTeenTestScore(0);
                setTeenTestTotal(0);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${teenMode === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {teenMode === 'learn' && teenMemoRunning && !teenMemoLocked && !teenMemoPaused && (
          <button type="button" onClick={() => setTeenMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {teenMode === 'test' ? (
        (() => {
          const correctWord = TEEN_WORDS[teenTestIdx % TEEN_WORDS.length];
          const testOptions = [
            correctWord,
            ...TEEN_WORDS.filter((_, i) => i !== teenTestIdx % TEEN_WORDS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which number did you hear?</h2>
              <p className="mt-1 text-xs text-slate-400">Listen and tap the matching word</p>
              {teenTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${teenTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{teenTestCorrect ? '✅ Correct!' : `❌ It's ${correctWord.word}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {testOptions.map((w) => (
                  <button key={w.word} type="button" onClick={() => handleTeenTestClick(w.word)} disabled={teenTestAnswered} className={`rounded-2xl border-2 px-5 py-3 text-base font-bold transition ${teenTestAnswered && w.word === correctWord.word ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : teenTestAnswered ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-fuchsia-300 hover:bg-fuchsia-50'}`}>
                    <span className="text-2xl font-black">{w.num}</span>
                    <span className="block text-sm">{w.word}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {teenTestScore}/{teenTestTotal}
              </div>
            </div>
          );
        })()
      ) : teenMode === 'quiz' ? (
        <div className="text-center">{renderTeenNumQuiz(false)}</div>
      ) : teenMode === 'fib' ? (
        <div className="text-center">{renderTeenNumQuiz(true)}</div>
      ) : teenMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TEEN_WORDS[teenMemoIdx].num}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{TEEN_WORDS[teenMemoIdx].word}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: teenMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= teenMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setTeenMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !teenMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Teen Words</h2>
          <p className="text-sm text-slate-600">Watch and listen as teen number words (13-19) are shown, spelled, and named.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setTeenMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{teenMemoRepeat}</span>
              <button type="button" onClick={() => setTeenMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={teenMemoLoop} onChange={(e) => setTeenMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setTeenMemoRunning(true);
              setTeenMemoCount(0);
              setTeenMemoIdx(0);
              setTeenMemoLocked(false);
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
              Word {teenMemoIdx + 1}/{TEEN_WORDS.length}
            </span>
            <span>
              Repeat {teenMemoCount + 1}/{teenMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TEEN_WORDS[teenMemoIdx].num}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{TEEN_WORDS[teenMemoIdx].word}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: teenMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= teenMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTeenMemoPaused((p) => !p);
                if (!teenMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${teenMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {teenMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setTeenMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
