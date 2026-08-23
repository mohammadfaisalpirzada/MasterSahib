'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, quizDelay } from '@/app/lib/learn-utils';

type ShapeDef = { id: string; label: string; color: string; bg: string; render: (size: number) => ReactNode };

const shapes: ShapeDef[] = [
  { id: 'circle', label: 'Circle', color: '#f97316', bg: '#fff7ed', render: (s: number) => <div className="rounded-full bg-orange-400" style={{ width: s, height: s }} /> },
  {
    id: 'heart',
    label: 'Heart',
    color: '#ec4899',
    bg: '#fdf2f8',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#ec4899">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: 'star',
    label: 'Star',
    color: '#eab308',
    bg: '#fefce8',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#eab308">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'triangle',
    label: 'Triangle',
    color: '#22c55e',
    bg: '#f0fdf4',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#22c55e">
        <path d="M1 21h22L12 2 1 21z" />
      </svg>
    ),
  },
  {
    id: 'cone',
    label: 'Cone',
    color: '#a855f7',
    bg: '#faf5ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
        <ellipse cx="12" cy="20" rx="9" ry="2" fill="#a855f7" />
        <path d="M3 20L12 3l9 17" stroke="#a855f7" fill="#c084fc" />
      </svg>
    ),
  },
  { id: 'oval', label: 'Oval', color: '#06b6d4', bg: '#ecfeff', render: (s: number) => <div className="rounded-[50%] bg-cyan-400" style={{ width: s * 1.4, height: s }} /> },
  { id: 'rectangle', label: 'Rectangle', color: '#3b82f6', bg: '#eff6ff', render: (s: number) => <div className="rounded-md bg-blue-400" style={{ width: s * 1.5, height: s * 0.75 }} /> },
  { id: 'square', label: 'Square', color: '#10b981', bg: '#ecfdf5', render: (s: number) => <div className="rounded-md bg-emerald-400" style={{ width: s, height: s }} /> },
];

export default function ShapesTab() {
  const [shapeSub, setShapeSub] = useState<'quiz' | 'learn' | 'fib' | 'test'>('learn');
  const [shapeIdx, setShapeIdx] = useState(() => Math.floor(Math.random() * shapes.length));
  const [shapeScore, setShapeScore] = useState(0);
  const [shapeTotal, setShapeTotal] = useState(0);
  const [shapeAnswered, setShapeAnswered] = useState(false);
  const [shapeCorrect, setShapeCorrect] = useState(false);
  const [shapeFibInput, setShapeFibInput] = useState('');
  const [shapeFibResult, setShapeFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [sMemoRepeat, setSMemoRepeat] = useState(3);
  const [sMemoLoop, setSMemoLoop] = useState(true);
  const [sMemoCount, setSMemoCount] = useState(0);
  const [sMemoIdx, setSMemoIdx] = useState(0);
  const [sMemoRunning, setSMemoRunning] = useState(false);
  const [sMemoLocked, setSMemoLocked] = useState(false);
  const [sMemoPaused, setSMemoPaused] = useState(false);
  const [shapeTestIdx, setShapeTestIdx] = useState(0);
  const [shapeTestAnswered, setShapeTestAnswered] = useState(false);
  const [shapeTestCorrect, setShapeTestCorrect] = useState(false);
  const [shapeTestScore, setShapeTestScore] = useState(0);
  const [shapeTestTotal, setShapeTestTotal] = useState(0);

  const s2 = 80;

  useEffect(() => {
    let wakeLock: any = null;
    if (sMemoRunning && !sMemoPaused) {
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
  }, [sMemoRunning, sMemoPaused]);

  useEffect(() => {
    if (shapeSub !== 'quiz' || !shapeAnswered) return;
    const t = setTimeout(() => {
      setShapeIdx((p) => (p + 1) % shapes.length);
      setShapeAnswered(false);
      setShapeCorrect(false);
      setShapeFibResult(null);
      setShapeFibInput('');
    }, quizDelay(shapes[shapeIdx].label));
    return () => clearTimeout(t);
  }, [shapeAnswered, shapeSub, shapeIdx]);

  useEffect(() => {
    if (shapeSub !== 'fib' || !shapeAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do {
        n = Math.floor(Math.random() * shapes.length);
      } while (n === shapeIdx && shapes.length > 1);
      setShapeIdx(n);
      setShapeAnswered(false);
      setShapeFibResult(null);
      setShapeFibInput('');
    }, quizDelay(shapes[shapeIdx].label));
    return () => clearTimeout(t);
  }, [shapeAnswered, shapeSub, shapeIdx]);

  useEffect(() => {
    if (!sMemoRunning || sMemoPaused) return;
    const shape = shapes[sMemoIdx];
    const letterTime = 680,
      finalNameTime = 1000,
      pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(shape.label), 300);
    const advanceTimer = setTimeout(
      () => {
        setSMemoCount((c) => {
          const next = c + 1;
          if (next >= sMemoRepeat) {
            const nextIdx = (sMemoIdx + 1) % shapes.length;
            if (nextIdx === 0 && !sMemoLoop) {
              setSMemoRunning(false);
              return 0;
            }
            setSMemoIdx(nextIdx);
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
  }, [sMemoRunning, sMemoPaused, sMemoIdx, sMemoCount, sMemoRepeat, sMemoLoop, sMemoLocked]);

  useEffect(() => {
    if (shapeSub === 'test' && !shapeTestAnswered) {
      speak(shapes[shapeTestIdx % shapes.length].label);
    }
  }, [shapeSub, shapeTestIdx, shapeTestAnswered]);

  const handleShapeClick = useCallback(
    (id: string) => {
      if (shapeAnswered) return;
      setShapeTotal((p) => p + 1);
      setShapeAnswered(true);
      if (id === shapes[shapeIdx].id) {
        setShapeScore((p) => p + 1);
        setShapeCorrect(true);
        speak(`Yes! ${shapes[shapeIdx].label}`);
        setTimeout(() => spellWord(shapes[shapeIdx].label), 800);
      } else {
        setShapeCorrect(false);
        speak(`This is a ${shapes[shapeIdx].label}`);
        setTimeout(() => spellWord(shapes[shapeIdx].label), 800);
      }
    },
    [shapeAnswered, shapeIdx],
  );

  const handleShapeFib = useCallback(() => {
    if (!shapeFibInput.trim()) return;
    setShapeTotal((p) => p + 1);
    setShapeAnswered(true);
    if (shapeFibInput.trim().toLowerCase() === shapes[shapeIdx].label.toLowerCase()) {
      setShapeScore((p) => p + 1);
      setShapeFibResult('correct');
      speak(`Correct! ${shapes[shapeIdx].label}`);
      setTimeout(() => spellWord(shapes[shapeIdx].label), 800);
    } else {
      setShapeFibResult('wrong');
      speak(`This is a ${shapes[shapeIdx].label}`);
      setTimeout(() => spellWord(shapes[shapeIdx].label), 800);
    }
  }, [shapeFibInput, shapeIdx]);

  const handleShapeTestClick = useCallback(
    (clickedId: string) => {
      if (shapeTestAnswered) return;
      setShapeTestTotal((p) => p + 1);
      setShapeTestAnswered(true);
      const correct = clickedId === shapes[shapeTestIdx].id;
      setShapeTestCorrect(correct);
      if (correct) setShapeTestScore((p) => p + 1);
      setTimeout(() => {
        setShapeTestIdx((p) => (p + 1) % shapes.length);
        setShapeTestAnswered(false);
        setShapeTestCorrect(false);
      }, quizDelay(shapes[shapeTestIdx].label));
    },
    [shapeTestAnswered, shapeTestIdx],
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
                setShapeSub(m);
                setSMemoRunning(false);
                setShapeAnswered(false);
                setShapeCorrect(false);
                setShapeFibResult(null);
                setShapeFibInput('');
                setShapeTestIdx(Math.floor(Math.random() * shapes.length));
                setShapeTestAnswered(false);
                setShapeTestCorrect(false);
                setShapeTestScore(0);
                setShapeTestTotal(0);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${shapeSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'learn' ? '🧠 Memorize' : m === 'quiz' ? '📖 Learn' : m === 'test' ? '🎯 Quiz' : '✏️ Type It'}
            </button>
          ))}
        </div>
        {shapeSub === 'learn' && sMemoRunning && !sMemoLocked && !sMemoPaused && (
          <button type="button" onClick={() => setSMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700">
            <HiLockClosed className="h-3.5 w-3.5" /> Lock
          </button>
        )}
      </div>
      {shapeSub === 'test' ? (
        (() => {
          const correctShape = shapes[shapeTestIdx % shapes.length];
          const testOptions = [
            correctShape,
            ...shapes
              .filter((s) => s.id !== correctShape.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3),
          ].sort(() => Math.random() - 0.5);
          return (
            <div className="text-center">
              <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which shape did you hear?</h2>
              <p className="mt-1 text-xs text-slate-400">Listen carefully and tap the correct shape</p>
              {shapeTestAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${shapeTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{shapeTestCorrect ? '✅ Correct!' : `❌ That's a ${shapes[shapeTestIdx % shapes.length].label}`}</div>}
              <div className="mt-5 flex flex-wrap justify-center gap-4">
                {testOptions.map((shape) => (
                  <button key={shape.id} type="button" onClick={() => handleShapeTestClick(shape.id)} disabled={shapeTestAnswered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${shapeTestAnswered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${shapeTestAnswered && shape.id === shapes[shapeTestIdx % shapes.length].id ? 'border-emerald-400' : 'border-transparent'}`}>
                    {shape.render(s2)}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-slate-500">
                Score: {shapeTestScore}/{shapeTestTotal}
              </div>
            </div>
          );
        })()
      ) : shapeSub === 'quiz' ? (
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">Find the {shapes[shapeIdx].label}</h2>
          <button
            type="button"
            onClick={() => {
              speak(shapes[shapeIdx].label);
              setTimeout(() => spellWord(shapes[shapeIdx].label), 600);
            }}
            className="mt-1 text-xs text-slate-400 hover:text-slate-600"
          >
            🔊 Hear & spell
          </button>
          {shapeAnswered && (
            <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${shapeCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {shapeCorrect ? '✅ Correct!' : `❌ That's a ${shapes[shapeIdx].label}`}
              <span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(shapes[shapeIdx].label) / 1000)}s...</span>
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {[...shapes]
              .sort(() => Math.random() - 0.5)
              .map((shape) => (
                <button key={shape.id} type="button" onClick={() => handleShapeClick(shape.id)} disabled={shapeAnswered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${shapeAnswered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${shapeAnswered && shape.id === shapes[shapeIdx].id ? 'border-emerald-400' : 'border-transparent'}`}>
                  {shape.render(s2)}
                  <span className="text-xs font-bold text-slate-700">{shape.label}</span>
                </button>
              ))}
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {shapeScore}/{shapeTotal}
          </div>
        </div>
      ) : shapeSub === 'fib' ? (
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">Type the Shape Name</h2>
          <div className="mt-4 flex justify-center">
            <div className={`rounded-3xl p-8 ${shapes[shapeIdx].bg} border-2 border-transparent`}>{shapes[shapeIdx].render(100)}</div>
          </div>
          {shapeFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
          {shapeFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {shapes[shapeIdx].label}</div>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <input
              type="text"
              value={shapeFibInput}
              onChange={(e) => setShapeFibInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !shapeAnswered) handleShapeFib();
              }}
              placeholder="Type the shape name..."
              disabled={shapeAnswered}
              className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
            />
            <div className="flex gap-2">
              {!shapeAnswered ? (
                <button type="button" onClick={handleShapeFib} disabled={!shapeFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">
                  Check
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShapeIdx((p) => (p + 1) % shapes.length);
                    setShapeAnswered(false);
                    setShapeFibResult(null);
                    setShapeFibInput('');
                  }}
                  className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {shapeScore}/{shapeTotal}
          </div>
        </div>
      ) : sMemoLocked ? (
        <div className="mt-5 space-y-4 text-center">
          <div className="flex justify-center">
            <div className={`rounded-3xl p-8 ${shapes[sMemoIdx].bg} border-2 border-transparent`}>{shapes[sMemoIdx].render(120)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{shapes[sMemoIdx].label}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: sMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= sMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setSMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200">
              <HiLockClosed className="mx-auto h-5 w-5" />
              <span className="mt-1 block">Unlock</span>
            </button>
          </div>
        </div>
      ) : !sMemoRunning ? (
        <div className="mt-5 space-y-5 text-center">
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Shapes</h2>
          <p className="text-sm text-slate-600">Watch and listen as shapes are shown, spelled, and named automatically.</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Repeat each shape:</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                −
              </button>
              <span className="w-8 text-center text-lg font-black text-fuchsia-700">{sMemoRepeat}</span>
              <button type="button" onClick={() => setSMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">times</span>
          </div>
          <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={sMemoLoop} onChange={(e) => setSMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop
          </label>
          <button
            type="button"
            onClick={() => {
              setSMemoRunning(true);
              setSMemoCount(0);
              setSMemoIdx(0);
              setSMemoLocked(false);
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
              Shape {sMemoIdx + 1}/{shapes.length}
            </span>
            <span>
              Repeat {sMemoCount + 1}/{sMemoRepeat}
            </span>
          </div>
          <div className="flex justify-center">
            <div className={`rounded-3xl p-8 ${shapes[sMemoIdx].bg} border-2 border-transparent transition-all`}>{shapes[sMemoIdx].render(120)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{shapes[sMemoIdx].label}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: sMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= sMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSMemoPaused((p) => !p);
                if (!sMemoPaused) window.speechSynthesis.cancel();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${sMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
            >
              {sMemoPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button type="button" onClick={() => setSMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
