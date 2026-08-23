'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, speakThenSpell, quizDelay } from '@/app/lib/learn-utils';

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'White', 'Black', 'Brown', 'Purple'];

const colors = COLORS.map((c) => ({ name: c }));

const colorHex: Record<string, string> = { Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#eab308', Orange: '#f97316', Pink: '#ec4899', White: '#f8fafc', Black: '#1e293b', Brown: '#a16207', Purple: '#a855f7' };

export default function ColorsTab() {
  const [colorSub, setColorSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [colorIdx, setColorIdx] = useState(0);
  const [colorQuiz, setColorQuiz] = useState(false);
  const [currentColor, setCurrentColor] = useState('');
  const [colorScore, setColorScore] = useState(0);
  const [colorTotal, setColorTotal] = useState(0);
  const [colorAnswered, setColorAnswered] = useState(false);
  const [colorCorrect, setColorCorrect] = useState(false);
  const [colorFibResult, setColorFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [colorFibInput, setColorFibInput] = useState('');
  const [colorMemoRunning, setColorMemoRunning] = useState(false);
  const [colorMemoLocked, setColorMemoLocked] = useState(false);
  const [colorMemoPaused, setColorMemoPaused] = useState(false);
  const [colorMemoRepeat, setColorMemoRepeat] = useState(3);
  const [colorMemoLoop, setColorMemoLoop] = useState(true);
  const [colorMemoCount, setColorMemoCount] = useState(0);
  const [colorMemoIdx, setColorMemoIdx] = useState(0);
  const [colorTestIdx, setColorTestIdx] = useState(0);
  const [colorTestAnswered, setColorTestAnswered] = useState(false);
  const [colorTestCorrect, setColorTestCorrect] = useState(false);
  const [colorTestScore, setColorTestScore] = useState(0);
  const [colorTestTotal, setColorTestTotal] = useState(0);

  useEffect(() => {
    let wakeLock: any = null;
    if (colorMemoRunning && !colorMemoPaused) {
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
  }, [colorMemoRunning, colorMemoPaused]);

  useEffect(() => {
    if (colorSub === 'test' && !colorTestAnswered) {
      speakThenSpell(COLORS[colorTestIdx % COLORS.length]);
    }
  }, [colorSub, colorTestIdx, colorTestAnswered]);

  const handleColorClick = useCallback(
    (c: string) => {
      if (colorAnswered) return;
      setColorTotal((p) => p + 1);
      setColorAnswered(true);
      if (c === currentColor) {
        setColorScore((p) => p + 1);
        setColorCorrect(true);
        speak(`Yes! ${c}`);
      } else {
        setColorCorrect(false);
        speak(`This is ${currentColor}`);
      }
    },
    [colorAnswered, currentColor],
  );

  const handleColorFibSubmit = useCallback(() => {
    if (!colorFibInput.trim() || colorFibResult) return;
    const match = colorFibInput.trim().toLowerCase() === colors[colorIdx].name.toLowerCase();
    setColorFibResult(match ? 'correct' : 'wrong');
    speak(match ? `Yes! ${colors[colorIdx].name}` : `The answer is ${colors[colorIdx].name}`);
  }, [colorFibInput, colorFibResult, colorIdx]);

  useEffect(() => {
    if (!colorMemoRunning || colorMemoLocked || colorMemoPaused) return;
    const idx = colorMemoIdx % colors.length;
    const item = colors[idx];
    const timer = setTimeout(() => {
      setColorMemoLocked(true);
      const spell = () => {
        spellWord(item.name);
        setTimeout(
          () => {
            speak(item.name);
            const nextCount = colorMemoCount + 1;
            if (nextCount >= colorMemoRepeat) {
              const nextIdx = colorMemoIdx + 1;
              if (nextIdx >= colors.length && !colorMemoLoop) {
                setColorMemoRunning(false);
                return;
              }
              setColorMemoIdx(nextIdx);
              setColorMemoCount(0);
            } else {
              setColorMemoCount(nextCount);
            }
            setColorMemoLocked(false);
          },
          item.name.length * 680 + 1000,
        );
      };
      spell();
    }, 300);
    return () => clearTimeout(timer);
  }, [colorMemoRunning, colorMemoLocked, colorMemoPaused, colorMemoIdx, colorMemoCount, colorMemoRepeat, colorMemoLoop]);

  const handleColorTestClick = useCallback(
    (clickedColor: string) => {
      if (colorTestAnswered) return;
      setColorTestTotal((p) => p + 1);
      setColorTestAnswered(true);
      const correct = clickedColor === COLORS[colorTestIdx % COLORS.length];
      setColorTestCorrect(correct);
      if (correct) setColorTestScore((p) => p + 1);
      setTimeout(
        () => {
          setColorTestIdx((p) => p + 1);
          setColorTestAnswered(false);
          setColorTestCorrect(false);
        },
        quizDelay(COLORS[colorTestIdx % COLORS.length]),
      );
    },
    [colorTestAnswered, colorTestIdx],
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
                setColorSub(m);
                setColorAnswered(false);
                setColorCorrect(false);
                setColorMemoRunning(false);
                setColorMemoLocked(false);
                setColorFibResult(null);
                setColorFibInput('');
                setColorTestIdx(Math.floor(Math.random() * COLORS.length));
                setColorTestAnswered(false);
                setColorTestCorrect(false);
                setColorTestScore(0);
                setColorTestTotal(0);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${colorSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {colorSub === 'learn' && colorMemoRunning && !colorMemoLocked && !colorMemoPaused && (
          <button type="button" onClick={() => setColorMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {colorSub === 'test' ? (
        (() => {
          const colorOptions = [
            COLORS[colorTestIdx % COLORS.length],
            ...COLORS.filter((_, i) => i !== colorTestIdx % COLORS.length)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which color did you hear?</h2>
              <p className="mt-1 text-xs text-slate-400">Listen and tap the matching color</p>
              {colorTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${colorTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{colorTestCorrect ? '✅ Correct!' : `❌ It's ${COLORS[colorTestIdx % COLORS.length]}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-4">
                {colorOptions.map((c) => (
                  <button key={c} type="button" onClick={() => handleColorTestClick(c)} disabled={colorTestAnswered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${colorTestAnswered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} border-2 ${colorTestAnswered && c === COLORS[colorTestIdx % COLORS.length] ? 'border-emerald-400' : 'border-transparent'}`}>
                    <div className="h-16 w-16 rounded-2xl shadow-md" style={{ backgroundColor: colorHex[c] }} />
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {colorTestScore}/{colorTestTotal}
              </div>
            </div>
          );
        })()
      ) : colorSub === 'quiz' ? (
        <div className="text-center">
          {!colorQuiz ? (
            <>
              <h2 className="mt-5 text-lg font-bold text-slate-900">Learn Colors</h2>
              <p className="mt-2 text-sm text-slate-600">Click a color to hear its name, then take the quiz!</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => speakThenSpell(c)} className="flex flex-col items-center gap-1">
                    <div className="h-16 w-16 rounded-2xl shadow-md transition hover:scale-110" style={{ backgroundColor: colorHex[c] }} />
                    <span className="text-xs font-bold text-slate-700">{c}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const rand = COLORS[Math.floor(Math.random() * COLORS.length)];
                  setCurrentColor(rand);
                  setColorQuiz(true);
                  setColorAnswered(false);
                  setColorCorrect(false);
                  setColorScore(0);
                  setColorTotal(0);
                }}
                className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
              >
                🎯 Start Color Quiz
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900">What color is this?</h2>
              <div className="mt-4 flex justify-center">
                <div className="h-24 w-24 rounded-3xl shadow-lg transition-all" style={{ backgroundColor: colorHex[currentColor] }} />
              </div>
              {colorAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${colorCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{colorCorrect ? '✅ Correct!' : `❌ It's ${currentColor}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {[...COLORS]
                  .sort(() => Math.random() - 0.5)
                  .map((c) => (
                    <button key={c} type="button" onClick={() => handleColorClick(c)} disabled={colorAnswered} className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${colorAnswered ? 'opacity-50' : 'hover:scale-110'}`} style={{ backgroundColor: colorHex[c] }}>
                      {c}
                    </button>
                  ))}
              </div>
              {colorAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    setColorIdx((p) => (p + 1) % COLORS.length);
                    setColorAnswered(false);
                    setColorCorrect(false);
                  }}
                  className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next Color →
                </button>
              )}
              <div className="mt-4 text-sm text-slate-500">
                Score: {colorScore}/{colorTotal}
              </div>
            </>
          )}
        </div>
      ) : colorSub === 'fib' ? (
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">Type the Color Name</h2>
          <div className="mt-4 flex justify-center">
            <div className="h-24 w-24 rounded-3xl shadow-lg" style={{ backgroundColor: colorHex[colors[colorIdx].name] }} />
          </div>
          {colorFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {colorFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {colors[colorIdx].name}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={colorFibInput}
              onChange={(e) => setColorFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !colorFibResult) handleColorFibSubmit();
              }}
              placeholder="Type the color name..."
              disabled={!!colorFibResult}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!colorFibResult ? (
                <button type="button" onClick={handleColorFibSubmit} disabled={!colorFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setColorIdx((p) => (p + 1) % COLORS.length);
                    setColorFibResult(null);
                    setColorFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : colorMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl shadow-lg" style={{ backgroundColor: colorHex[colors[colorMemoIdx % colors.length].name] }} />
          </div>
          <p className="text-2xl font-black text-slate-900">{colors[colorMemoIdx % colors.length].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: colorMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= colorMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setColorMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !colorMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Colors</h2>
          <p className="text-sm text-slate-600">Watch and listen as colors are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each color:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setColorMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{colorMemoRepeat}</span>
              <button type="button" onClick={() => setColorMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={colorMemoLoop} onChange={(e) => setColorMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setColorMemoRunning(true);
              setColorMemoCount(0);
              setColorMemoIdx(0);
              setColorMemoLocked(false);
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
              Color {colorMemoIdx + 1}/{colors.length}
            </span>
            <span>
              Repeat {colorMemoCount + 1}/{colorMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl shadow-lg transition-all" style={{ backgroundColor: colorHex[colors[colorMemoIdx % colors.length].name] }} />
          </div>
          <p className="text-2xl font-black text-slate-900">{colors[colorMemoIdx % colors.length].name}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: colorMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= colorMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setColorMemoPaused((p) => !p);
                if (!colorMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${colorMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {colorMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setColorMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
