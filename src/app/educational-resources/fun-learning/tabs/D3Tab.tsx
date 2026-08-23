'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, quizDelay } from '@/app/lib/learn-utils';

type Shape3DDef = { id: string; label: string; color: string; bg: string; render: (size: number) => ReactNode };

const shape3dList: Shape3DDef[] = [
  {
    id: 'cube',
    label: 'Cube',
    color: '#f97316',
    bg: '#fff7ed',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <polygon points="50,10 90,30 50,50 10,30" fill="#fb923c" stroke="#9a3412" strokeWidth="1.5" />
        <polygon points="50,50 90,30 90,70 50,90" fill="#f97316" stroke="#9a3412" strokeWidth="1.5" />
        <polygon points="10,30 50,50 50,90 10,70" fill="#fdba74" stroke="#9a3412" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'cuboid',
    label: 'Cuboid',
    color: '#3b82f6',
    bg: '#eff6ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 110 90" fill="none">
        <polygon points="65,10 105,25 65,40 25,25" fill="#60a5fa" stroke="#1e40af" strokeWidth="1.5" />
        <polygon points="65,40 105,25 105,65 65,80" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5" />
        <polygon points="25,25 65,40 65,80 25,65" fill="#93c5fd" stroke="#1e40af" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'sphere',
    label: 'Sphere',
    color: '#22c55e',
    bg: '#f0fdf4',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
        <ellipse cx="38" cy="38" rx="16" ry="12" fill="#86efac" opacity="0.6" />
        <ellipse cx="62" cy="58" rx="10" ry="6" fill="#15803d" opacity="0.15" />
      </svg>
    ),
  },
  {
    id: 'cylinder',
    label: 'Cylinder',
    color: '#a855f7',
    bg: '#faf5ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 90 100" fill="none">
        <ellipse cx="45" cy="20" rx="35" ry="12" fill="#c084fc" stroke="#7e22ce" strokeWidth="1.5" />
        <rect x="10" y="20" width="70" height="58" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
        <ellipse cx="45" cy="78" rx="35" ry="12" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="1.5" />
        <rect x="10" y="20" width="35" height="58" fill="#c084fc" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'cone',
    label: 'Cone',
    color: '#eab308',
    bg: '#fefce8',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 90 100" fill="none">
        <polygon points="45,5 85,85 5,85" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
        <ellipse cx="45" cy="85" rx="40" ry="10" fill="#fef08a" stroke="#a16207" strokeWidth="1.5" />
        <polygon points="45,5 45,85 5,85" fill="#fde047" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'pyramid',
    label: 'Pyramid',
    color: '#ec4899',
    bg: '#fdf2f8',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 90 100" fill="none">
        <polygon points="45,5 85,85 45,70" fill="#f472b6" stroke="#be185d" strokeWidth="1.5" />
        <polygon points="45,5 5,85 45,70" fill="#f9a8d4" stroke="#be185d" strokeWidth="1.5" />
        <polygon points="5,85 85,85 45,70" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function D3Tab() {
  const [d3Mode, setD3Mode] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [d3Idx, setD3Idx] = useState(() => Math.floor(Math.random() * shape3dList.length));
  const [d3Score, setD3Score] = useState(0);
  const [d3Total, setD3Total] = useState(0);
  const [d3Answered, setD3Answered] = useState(false);
  const [d3Correct, setD3Correct] = useState(false);
  const [d3FibInput, setD3FibInput] = useState('');
  const [d3FibResult, setD3FibResult] = useState<'correct' | 'wrong' | null>(null);
  const [d3MemoRepeat, setD3MemoRepeat] = useState(3);
  const [d3MemoLoop, setD3MemoLoop] = useState(true);
  const [d3MemoCount, setD3MemoCount] = useState(0);
  const [d3MemoIdx, setD3MemoIdx] = useState(0);
  const [d3MemoRunning, setD3MemoRunning] = useState(false);
  const [d3MemoLocked, setD3MemoLocked] = useState(false);
  const [d3MemoPaused, setD3MemoPaused] = useState(false);
  const [d3TestIdx, setD3TestIdx] = useState(0);
  const [d3TestAnswered, setD3TestAnswered] = useState(false);
  const [d3TestCorrect, setD3TestCorrect] = useState(false);
  const [d3TestScore, setD3TestScore] = useState(0);
  const [d3TestTotal, setD3TestTotal] = useState(0);

  const s2 = 80;

  useEffect(() => {
    let wakeLock: any = null;
    if (d3MemoRunning && !d3MemoPaused) {
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
  }, [d3MemoRunning, d3MemoPaused]);

  useEffect(() => {
    if (d3Mode !== 'quiz' || !d3Answered) return;
    const t = setTimeout(() => {
      setD3Idx((p) => (p + 1) % shape3dList.length);
      setD3Answered(false);
      setD3Correct(false);
    }, quizDelay(shape3dList[d3Idx].label));
    return () => clearTimeout(t);
  }, [d3Answered, d3Mode, d3Idx]);

  useEffect(() => {
    if (d3Mode !== 'fib' || !d3Answered) return;
    const t = setTimeout(() => {
      let n: number;
      do {
        n = Math.floor(Math.random() * shape3dList.length);
      } while (n === d3Idx && shape3dList.length > 1);
      setD3Idx(n);
      setD3Answered(false);
      setD3Correct(false);
      setD3FibResult(null);
      setD3FibInput('');
    }, quizDelay(shape3dList[d3Idx].label));
    return () => clearTimeout(t);
  }, [d3Answered, d3Mode, d3Idx]);

  useEffect(() => {
    if (!d3MemoRunning || d3MemoPaused) return;
    const shape = shape3dList[d3MemoIdx];
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(shape.label), 300);
    const advanceTimer = setTimeout(
      () => {
        setD3MemoCount((c) => {
          const next = c + 1;
          if (next >= d3MemoRepeat) {
            const nextIdx = (d3MemoIdx + 1) % shape3dList.length;
            if (nextIdx === 0 && !d3MemoLoop) {
              setD3MemoRunning(false);
              return 0;
            }
            setD3MemoIdx(nextIdx);
            return 0;
          }
          return next;
        });
      },
      300 + shape.label.length * letterTime + finalNameTime + pauseAfter,
    );
    return () => {
      clearTimeout(spellTimer);
      clearTimeout(advanceTimer);
    };
  }, [d3MemoRunning, d3MemoPaused, d3MemoIdx, d3MemoCount, d3MemoRepeat, d3MemoLoop, d3MemoLocked]);

  useEffect(() => {
    if (d3Mode === 'test' && !d3TestAnswered) {
      speak(shape3dList[d3TestIdx % shape3dList.length].label);
    }
  }, [d3Mode, d3TestIdx, d3TestAnswered]);

  const handleD3Click = useCallback(
    (id: string) => {
      if (d3Answered) return;
      setD3Total((p) => p + 1);
      setD3Answered(true);
      if (id === shape3dList[d3Idx].id) {
        setD3Score((p) => p + 1);
        setD3Correct(true);
        speak(`Yes! ${shape3dList[d3Idx].label}`);
        setTimeout(() => spellWord(shape3dList[d3Idx].label), 800);
      } else {
        setD3Correct(false);
        speak(`This is a ${shape3dList[d3Idx].label}`);
        setTimeout(() => spellWord(shape3dList[d3Idx].label), 800);
      }
    },
    [d3Answered, d3Idx],
  );

  const handleD3Fib = useCallback(() => {
    if (!d3FibInput.trim()) return;
    setD3Total((p) => p + 1);
    setD3Answered(true);
    if (d3FibInput.trim().toLowerCase() === shape3dList[d3Idx].label.toLowerCase()) {
      setD3Score((p) => p + 1);
      setD3FibResult('correct');
      speak(`Correct! ${shape3dList[d3Idx].label}`);
      setTimeout(() => spellWord(shape3dList[d3Idx].label), 800);
    } else {
      setD3FibResult('wrong');
      speak(`This is a ${shape3dList[d3Idx].label}`);
      setTimeout(() => spellWord(shape3dList[d3Idx].label), 800);
    }
  }, [d3FibInput, d3Idx]);

  const handleD3TestClick = useCallback(
    (clickedId: string) => {
      if (d3TestAnswered) return;
      setD3TestTotal((p) => p + 1);
      setD3TestAnswered(true);
      const correct = clickedId === shape3dList[d3TestIdx % shape3dList.length].id;
      setD3TestCorrect(correct);
      if (correct) setD3TestScore((p) => p + 1);
      setTimeout(
        () => {
          setD3TestIdx((p) => p + 1);
          setD3TestAnswered(false);
          setD3TestCorrect(false);
        },
        quizDelay(shape3dList[d3TestIdx % shape3dList.length].label),
      );
    },
    [d3TestAnswered, d3TestIdx],
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
                setD3Mode(m);
                setD3Answered(false);
                setD3Correct(false);
                setD3MemoRunning(false);
                setD3MemoLocked(false);
                setD3FibResult(null);
                setD3FibInput('');
                setD3TestIdx(Math.floor(Math.random() * shape3dList.length));
                setD3TestAnswered(false);
                setD3TestCorrect(false);
                setD3TestScore(0);
                setD3TestTotal(0);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${d3Mode === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {d3Mode === 'learn' && d3MemoRunning && !d3MemoLocked && !d3MemoPaused && (
          <button type="button" onClick={() => setD3MemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {d3Mode === 'test' ? (
        (() => {
          const correctShape = shape3dList[d3TestIdx % shape3dList.length];
          const testOptions = [
            correctShape,
            ...shape3dList
              .filter((s) => s.id !== correctShape.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which 3D shape did you hear?</h2>
              <p className="mt-1 text-xs text-slate-400">Listen carefully and tap the correct shape</p>
              {d3TestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${d3TestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{d3TestCorrect ? '✅ Correct!' : `❌ That's a ${shape3dList[d3TestIdx % shape3dList.length].label}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-4">
                {testOptions.map((shape) => (
                  <button key={shape.id} type="button" onClick={() => handleD3TestClick(shape.id)} disabled={d3TestAnswered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${d3TestAnswered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${d3TestAnswered && shape.id === shape3dList[d3TestIdx % shape3dList.length].id ? 'border-emerald-400' : 'border-transparent'}`}>
                    {shape.render(s2)}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {d3TestScore}/{d3TestTotal}
              </div>
            </div>
          );
        })()
      ) : d3Mode === 'quiz' ? (
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">Find the {shape3dList[d3Idx].label}</h2>
          <button
            type="button"
            onClick={() => {
              speak(shape3dList[d3Idx].label);
              setTimeout(() => spellWord(shape3dList[d3Idx].label), 600);
            }}
            className="mt-1 text-xs text-slate-400 hover:text-slate-600"
          >
            🔊 Hear & spell
          </button>
          {d3Answered && (
            <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${d3Correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {d3Correct ? '✅ Correct!' : `❌ That's a ${shape3dList[d3Idx].label}`}
              <span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(shape3dList[d3Idx].label) / 1000)}s...</span>
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {[...shape3dList]
              .sort(() => Math.random() - 0.5)
              .map((shape) => (
                <button key={shape.id} type="button" onClick={() => handleD3Click(shape.id)} disabled={d3Answered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${d3Answered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${d3Answered && shape.id === shape3dList[d3Idx].id ? 'border-emerald-400' : 'border-transparent'}`}>
                  {shape.render(s2)}
                  <span className="text-xs font-bold text-slate-700">{shape.label}</span>
                </button>
              ))}
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {d3Score}/{d3Total}
          </div>
        </div>
      ) : d3Mode === 'fib' ? (
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">Type the Shape Name</h2>
          <div className="mt-4 flex justify-center">
            <div className={`rounded-3xl p-8 ${shape3dList[d3Idx].bg} border-2 border-transparent`}>{shape3dList[d3Idx].render(100)}</div>
          </div>
          {d3FibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {d3FibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {shape3dList[d3Idx].label}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={d3FibInput}
              onChange={(e) => setD3FibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !d3Answered) handleD3Fib();
              }}
              placeholder="Type the shape name..."
              disabled={d3Answered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!d3Answered ? (
                <button type="button" onClick={handleD3Fib} disabled={!d3FibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setD3Idx((p) => (p + 1) % shape3dList.length);
                    setD3Answered(false);
                    setD3FibResult(null);
                    setD3FibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {d3Score}/{d3Total}
          </div>
        </div>
      ) : d3MemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className={`rounded-3xl p-8 ${shape3dList[d3MemoIdx].bg} border-2 border-transparent`}>{shape3dList[d3MemoIdx].render(120)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{shape3dList[d3MemoIdx].label}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: d3MemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= d3MemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setD3MemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !d3MemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize 3D Shapes</h2>
          <p className="text-sm text-slate-600">Watch and listen as 3D shapes are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each shape:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setD3MemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{d3MemoRepeat}</span>
              <button type="button" onClick={() => setD3MemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={d3MemoLoop} onChange={(e) => setD3MemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setD3MemoRunning(true);
              setD3MemoCount(0);
              setD3MemoIdx(0);
              setD3MemoLocked(false);
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
              Shape {d3MemoIdx + 1}/{shape3dList.length}
            </span>
            <span>
              Repeat {d3MemoCount + 1}/{d3MemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className={`rounded-3xl p-8 ${shape3dList[d3MemoIdx].bg} border-2 border-transparent transition-all`}>{shape3dList[d3MemoIdx].render(120)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{shape3dList[d3MemoIdx].label}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: d3MemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= d3MemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setD3MemoPaused((p) => !p);
                if (!d3MemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${d3MemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {d3MemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setD3MemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
