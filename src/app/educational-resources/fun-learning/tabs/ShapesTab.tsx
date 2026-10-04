'use client';

import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { speak, spellWord, quizDelay } from '@/app/lib/learn-utils';

type ShapeDef = { id: string; label: string; color: string; bg: string; render: (size: number) => ReactNode };

const shapes: ShapeDef[] = [
  {
    id: 'circle',
    label: 'Circle',
    color: '#f97316',
    bg: '#fff7ed',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="#fb923c" stroke="#ea580c" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    color: '#3b82f6',
    bg: '#eff6ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <rect x="8" y="24" width="84" height="52" rx="6" fill="#60a5fa" stroke="#2563eb" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'oval',
    label: 'Oval',
    color: '#06b6d4',
    bg: '#ecfeff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="44" ry="28" fill="#22d3ee" stroke="#0891b2" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'heart',
    label: 'Heart',
    color: '#ec4899',
    bg: '#fdf2f8',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#f472b6"
          stroke="#db2777"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'pentagon',
    label: 'Pentagon',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="50,10 92,40 76,88 24,88 8,40" fill="#a78bfa" stroke="#7c3aed" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'octagon',
    label: 'Octagon',
    color: '#ef4444',
    bg: '#fef2f2',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="32,10 68,10 90,32 90,68 68,90 32,90 10,68 10,32" fill="#f87171" stroke="#dc2626" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'square',
    label: 'Square',
    color: '#10b981',
    bg: '#ecfdf5',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <rect x="14" y="14" width="72" height="72" rx="8" fill="#34d399" stroke="#059669" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'triangle',
    label: 'Triangle',
    color: '#22c55e',
    bg: '#f0fdf4',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="50,12 92,86 8,86" fill="#4ade80" stroke="#16a34a" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'star',
    label: 'Star',
    color: '#eab308',
    bg: '#fefce8',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'cone',
    label: 'Cone',
    color: '#d946ef',
    bg: '#fdf4ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <ellipse cx="50" cy="80" rx="36" ry="10" fill="#e879f9" stroke="#c026d3" strokeWidth="3" />
        <path d="M14 80L50 14l36 66" stroke="#c026d3" strokeWidth="3" fill="#f0abfc" />
        <ellipse cx="50" cy="80" rx="36" ry="10" fill="#d946ef" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'diamond',
    label: 'Diamond',
    color: '#0284c7',
    bg: '#f0f9ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="28,24 72,24 92,48 50,88 8,48" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="28,24 72,24 50,48" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="8,48 28,24 50,48" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="92,48 72,24 50,48" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="8,48 50,48 50,88" fill="#0284c7" opacity="0.25" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="92,48 50,48 50,88" fill="#0369a1" opacity="0.2" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'rhombus',
    label: 'Rhombus',
    color: '#9333ea',
    bg: '#faf5ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="36,18 90,18 64,82 10,82" fill="#c084fc" stroke="#9333ea" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'hexagon',
    label: 'Hexagon',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="50,10 88,30 88,70 50,90 12,70 12,30" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'crescent',
    label: 'Crescent',
    color: '#f59e0b',
    bg: '#fffbeb',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <path
          d="M48 12 A38 38 0 1 1 48 88 A28 38 0 0 0 48 12 Z"
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'semicircle',
    label: 'Semicircle',
    color: '#6366f1',
    bg: '#eef2ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <path d="M12 66 A38 38 0 0 1 88 66 Z" fill="#818cf8" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'trapezoid',
    label: 'Trapezoid',
    color: '#f43f5e',
    bg: '#fff1f2',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="26,22 74,22 92,78 8,78" fill="#fb7185" stroke="#e11d48" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'parallelogram',
    label: 'Parallelogram',
    color: '#14b8a6',
    bg: '#f0fdfa',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="32,24 92,24 68,76 8,76" fill="#2dd4bf" stroke="#0d9488" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'heptagon',
    label: 'Heptagon',
    color: '#84cc16',
    bg: '#f7fee7',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="50,10 84,26 92,61 68,90 32,90 8,61 16,26" fill="#a3e635" stroke="#65a30d" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'cross',
    label: 'Cross',
    color: '#ef4444',
    bg: '#fef2f2',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="36,12 64,12 64,36 88,36 88,64 64,64 64,88 36,88 36,64 12,64 12,36 36,36" fill="#f87171" stroke="#dc2626" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'arrow',
    label: 'Arrow',
    color: '#3b82f6',
    bg: '#eff6ff',
    render: (s: number) => (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <polygon points="12,38 52,38 52,20 88,50 52,80 52,62 12,62" fill="#60a5fa" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    ),
  },
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

    const cleanInput = shapeFibInput.trim().toLowerCase().replace(/[-\s]+/g, '');
    const cleanTarget = shapes[shapeIdx].label.toLowerCase().replace(/[-\s]+/g, '');

    const isMatch =
      cleanInput === cleanTarget ||
      (cleanTarget === 'semicircle' && (cleanInput === 'halfcircle' || cleanInput === 'semi')) ||
      (cleanTarget === 'rhombus' && (cleanInput === 'rohumus' || cleanInput === 'diamond')) ||
      (cleanTarget === 'diamond' && cleanInput === 'rhombus') ||
      (cleanTarget === 'crescent' && (cleanInput === 'cresecent' || cleanInput === 'cresent' || cleanInput === 'moon')) ||
      (cleanTarget === 'trapezoid' && cleanInput === 'trapezium');

    if (isMatch) {
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
      const correct = clickedId === shapes[shapeTestIdx % shapes.length].id;
      setShapeTestCorrect(correct);
      if (correct) setShapeTestScore((p) => p + 1);
      setTimeout(() => {
        setShapeTestIdx((p) => (p + 1) % shapes.length);
        setShapeTestAnswered(false);
        setShapeTestCorrect(false);
      }, quizDelay(shapes[shapeTestIdx % shapes.length].label));
    },
    [shapeTestAnswered, shapeTestIdx],
  );

  const quizShuffledShapes = useMemo(() => {
    return [...shapes].sort(() => Math.random() - 0.5);
  }, [shapeIdx]);

  const correctTestShape = shapes[shapeTestIdx % shapes.length];
  const testOptions = useMemo(() => {
    const others = shapes
      .filter((s) => s.id !== correctTestShape.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correctTestShape, ...others].sort(() => Math.random() - 0.5);
  }, [shapeTestIdx]);

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
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">🎯 Which shape did you hear?</h2>
          <p className="mt-1 text-xs text-slate-400">Listen carefully and tap the correct shape</p>
          <button
            type="button"
            onClick={() => speak(correctTestShape.label)}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-100"
          >
            🔊 Hear Shape Again
          </button>
          {shapeTestAnswered && (
            <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${shapeTestCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {shapeTestCorrect ? '✅ Correct!' : `❌ That's a ${correctTestShape.label}`}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {testOptions.map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => handleShapeTestClick(shape.id)}
                disabled={shapeTestAnswered}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 sm:p-5 transition ${
                  shapeTestAnswered ? 'opacity-70' : 'hover:scale-110 hover:shadow-md'
                } ${shape.bg} border-2 ${
                  shapeTestAnswered && shape.id === correctTestShape.id
                    ? 'border-emerald-500 ring-2 ring-emerald-300'
                    : 'border-transparent'
                }`}
              >
                {shape.render(s2)}
                {shapeTestAnswered && (
                  <span className="text-xs font-bold text-slate-700">{shape.label}</span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Score: {shapeTestScore}/{shapeTestTotal}
          </div>
        </div>
      ) : shapeSub === 'quiz' ? (
        <div className="text-center">
          <h2 className="mt-5 text-lg font-bold text-slate-900">Find the {shapes[shapeIdx].label}</h2>
          <button
            type="button"
            onClick={() => {
              speak(shapes[shapeIdx].label);
              setTimeout(() => spellWord(shapes[shapeIdx].label), 600);
            }}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-800"
          >
            🔊 Hear & spell
          </button>
          {shapeAnswered && (
            <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${shapeCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {shapeCorrect ? '✅ Correct!' : `❌ That's a ${shapes[shapeIdx].label}`}
              <span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(shapes[shapeIdx].label) / 1000)}s...</span>
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {quizShuffledShapes.map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => handleShapeClick(shape.id)}
                disabled={shapeAnswered}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 sm:p-4 transition ${
                  shapeAnswered ? 'opacity-60' : 'hover:scale-105 hover:shadow-md'
                } ${shape.bg} border-2 ${
                  shapeAnswered && shape.id === shapes[shapeIdx].id
                    ? 'border-emerald-500 ring-2 ring-emerald-300'
                    : 'border-transparent'
                }`}
              >
                {shape.render(64)}
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
            <div className={`rounded-3xl p-8 ${shapes[shapeIdx].bg} border-2 border-transparent shadow-sm`}>{shapes[shapeIdx].render(110)}</div>
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
              placeholder="Type shape name..."
              disabled={shapeAnswered}
              className="w-64 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50"
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
            <div className={`rounded-3xl p-8 ${shapes[sMemoIdx].bg} border-2 border-transparent shadow-sm`}>{shapes[sMemoIdx].render(120)}</div>
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
          <h2 className="text-lg font-bold text-slate-900">🔄 Memorize Shapes ({shapes.length} Shapes)</h2>
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
            className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700 shadow-md hover:shadow-lg"
          >
            ▶ Start Memorize
          </button>

          {/* Interactive Shape Explorer Gallery */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">✨ Tap Any Shape to Listen & Spell</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {shapes.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => {
                    speak(shape.label);
                    setTimeout(() => spellWord(shape.label), 700);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 sm:p-4 transition hover:scale-105 hover:shadow-md ${shape.bg} border border-slate-100`}
                >
                  {shape.render(56)}
                  <span className="text-xs font-bold text-slate-700">{shape.label}</span>
                </button>
              ))}
            </div>
          </div>
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
            <div className={`rounded-3xl p-8 ${shapes[sMemoIdx].bg} border-2 border-transparent transition-all shadow-sm`}>{shapes[sMemoIdx].render(120)}</div>
          </div>
          <p className="text-2xl font-black text-slate-900">{shapes[sMemoIdx].label}</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: sMemoRepeat }).map((_, i) => (
              <div key={i} className={`h-2 w-2 rounded-full ${i <= sMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSMemoIdx((p) => (p - 1 + shapes.length) % shapes.length);
                setSMemoCount(0);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              ← Prev
            </button>
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
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSMemoIdx((p) => (p + 1) % shapes.length);
                setSMemoCount(0);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Next →
            </button>
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSMemoRunning(false);
              }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              Stop
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
