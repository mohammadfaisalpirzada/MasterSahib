'use client';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { shuffle } from '@/app/lib/learn-utils';

type Subject = 'algebra' | 'geometry' | 'trigonometry';
type Difficulty = 'easy' | 'medium' | 'hard';
type Question = { q: string; options: string[]; answer: string };

function r(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick<T>(arr: T[]): T { return arr[r(0, arr.length - 1)]; }

function genAlgebra(diff: Difficulty): Question {
  if (diff === 'easy') {
    const x = r(1, 12);
    const c = r(1, 12);
    const ans = String(x);
    const qs = [
      { q: `x + ${c} = ${x + c}`, a: ans },
      { q: `${c} + x = ${c + x}`, a: ans },
      { q: `x - ${c} = ${x - c}`, a: ans },
      { q: `${x + c} - x = ${c}`, a: String(c) },
      { q: `${c} - x = ${c - x}`, a: String(c - x) },
      { q: `${c}x = ${c * x}`, a: ans },
      { q: `x / ${c} = ${(x / c).toFixed(1)}`, a: ans },
      { q: `2x = ${2 * x}`, a: ans },
    ];
    const q = pick(qs);
    const opts = [q.a, String(r(1, 20)), String(r(1, 20)), String(r(1, 20))];
    if (new Set(opts).size < 4) opts[3] = String(r(1, 20));
    return { q: q.q, options: shuffle(opts), answer: q.a };
  }
  if (diff === 'medium') {
    const a = r(1, 5), b = r(1, 5), c = r(1, 10);
    const x = r(1, 8);
    const qs = [
      { q: `${a}x + ${b} = ${a * x + b}`, a: String(x) },
      { q: `${a}x - ${b} = ${a * x - b}`, a: String(x) },
      { q: `Expand (x+${a})(x+${b})`, a: `x²+${a + b}x+${a * b}` },
      { q: `Expand ${a}(x+${b})`, a: `${a}x+${a * b}` },
      { q: `Expand (x+${a})(x-${b})`, a: `x²+${a - b}x-${a * b}` },
      { q: `Expand (x-${a})(x-${b})`, a: `x²-${a + b}x+${a * b}` },
      { q: `${a}x + ${c} = ${a * x + c}`, a: String(x) },
    ];
    const q = pick(qs);
    let opts = [q.a];
    if (q.a.includes('x²')) {
      const a2 = r(1, 8), b2 = r(1, 8);
      opts = [q.a, `x²+${a + b2}x+${a * b2}`, `x²+${a2 + b}x+${a2 * b}`, `x²+${a2 + b2}x+${a2 * b2}`];
    } else {
      opts = [q.a, String(r(1, 15)), String(r(1, 15)), String(r(1, 15))];
    }
    if (new Set(opts).size < 4) opts[3] = String(+q.a + r(1, 5));
    return { q: q.q, options: shuffle(opts), answer: q.a };
  }
  const a = r(1, 4), b = r(1, 4), c = r(1, 5), d = r(1, 4), e = r(1, 4);
  const x = r(1, 6);
  const qs = [
    { q: `${a}x + ${b} = ${c}x + ${d}`, a: String(x) },
    { q: `Solve: ${a}(x+${b}) = ${a * (x + b)}`, a: String(x) },
    { q: `Factorise: x²+${a + b}x+${a * b}`, a: `(x+${a})(x+${b})` },
    { q: `Factorise: x²-${a + b}x+${a * b}`, a: `(x-${a})(x-${b})` },
    { q: `Factorise: x²+${a - b}x-${a * b}`, a: `(x+${a})(x-${b})` },
    { q: `${a}x + ${b} = ${c * x + d}`, a: String(x) },
    { q: `${a}(x-${b}) = ${a * (x - b)}`, a: String(x) },
  ];
  const q = pick(qs);
  let opts = [q.a];
  if (q.a.includes(')(x')) {
    const a2 = r(1, 5), b2 = r(1, 5);
    opts = [q.a, `(x+${a2})(x+${b2})`, `(x-${a2})(x-${b2})`, `(x+${a2})(x-${b2})`];
  } else {
    opts = [q.a, String(r(1, 12)), String(r(1, 12)), String(r(1, 12))];
  }
  if (new Set(opts).size < 4) opts[3] = String(+q.a + r(1, 3));
  return { q: q.q, options: shuffle(opts), answer: q.a };
}

function genGeometry(diff: Difficulty): Question {
  const qs: Question[] = [
    { q: 'Area of rectangle 6cm × 4cm?', options: ['20 cm²', '24 cm²', '10 cm²', '36 cm²'], answer: '24 cm²' },
    { q: 'Perimeter of square side 5cm?', options: ['15 cm', '20 cm', '25 cm', '10 cm'], answer: '20 cm' },
    { q: 'Area of triangle base 8cm, height 5cm?', options: ['20 cm²', '40 cm²', '13 cm²', '30 cm²'], answer: '20 cm²' },
    { q: 'Circumference of circle radius 7cm? (π≈3.14)', options: ['21.98 cm', '43.96 cm', '14 cm', '49 cm'], answer: '43.96 cm' },
    { q: 'Area of circle radius 7cm? (π≈3.14)', options: ['153.86 cm²', '43.96 cm²', '49 cm²', '21.98 cm²'], answer: '153.86 cm²' },
    { q: 'Pythagoras: a=3, b=4, c=?', options: ['5', '6', '7', '8'], answer: '5' },
    { q: 'Pythagoras: a=5, b=12, c=?', options: ['13', '17', '15', '14'], answer: '13' },
    { q: 'Angles in triangle sum to?', options: ['180°', '360°', '90°', '270°'], answer: '180°' },
    { q: 'Angles in quadrilateral sum to?', options: ['360°', '180°', '540°', '270°'], answer: '360°' },
    { q: 'Area of parallelogram base 10cm, height 4cm?', options: ['40 cm²', '20 cm²', '14 cm²', '28 cm²'], answer: '40 cm²' },
    { q: 'Volume of cuboid 3×4×5cm?', options: ['60 cm³', '12 cm³', '20 cm³', '35 cm³'], answer: '60 cm³' },
    { q: 'Perimeter of rectangle 8cm × 3cm?', options: ['22 cm', '24 cm', '11 cm', '16 cm'], answer: '22 cm' },
  ];
  const hqs: Question[] = [
    { q: 'Pythagoras: a=7, b=24, c=?', options: ['25', '31', '23', '17'], answer: '25' },
    { q: 'Pythagoras: a=8, b=15, c=?', options: ['17', '23', '7', '20'], answer: '17' },
    { q: 'Angle at centre of circle = 2 × angle at circumference?', options: ['True', 'False', 'Depends', 'Never'], answer: 'True' },
    { q: 'Angle in a semicircle is?', options: ['90°', '180°', '45°', '60°'], answer: '90°' },
    { q: 'Area of trapezium a=5,b=7,h=4? (½(a+b)h)', options: ['24 cm²', '48 cm²', '12 cm²', '36 cm²'], answer: '24 cm²' },
    { q: 'Surface area of cube side 3cm?', options: ['54 cm²', '36 cm²', '27 cm²', '18 cm²'], answer: '54 cm²' },
    { q: 'Cyclic quadrilateral opposite angles sum to?', options: ['180°', '360°', '90°', '270°'], answer: '180°' },
    { q: 'Alternate segment theorem: angle between tangent and chord equals?', options: ['Angle in alt segment', 'Angle at centre', 'Right angle', 'Exterior angle'], answer: 'Angle in alt segment' },
    { q: 'Area of sector radius 6cm, angle 60°? (π≈3.14)', options: ['18.84 cm²', '37.68 cm²', '6.28 cm²', '12.56 cm²'], answer: '18.84 cm²' },
    { q: 'Arc length radius 5cm, angle 72°? (π≈3.14)', options: ['6.28 cm', '3.14 cm', '12.56 cm', '9.42 cm'], answer: '6.28 cm' },
  ];
  const eqs: Question[] = [
    { q: 'Area of equilateral triangle side 6cm? (√3≈1.73)', options: ['15.57 cm²', '18 cm²', '9 cm²', '10.39 cm²'], answer: '15.57 cm²' },
    { q: 'Perimeter of circle (circumference) r=3.5cm? (π≈3.14)', options: ['21.98 cm', '10.99 cm', '38.47 cm', '7 cm'], answer: '21.98 cm' },
  ];
  if (diff === 'easy') return pick(qs);
  if (diff === 'medium') return pick([...qs, ...hqs]);
  return pick([...hqs, ...eqs]);
}

function genTrigonometry(diff: Difficulty): Question {
  const qs: Question[] = [
    { q: 'In a right triangle, sin(θ) = ?', options: ['Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Opposite'], answer: 'Opposite/Hypotenuse' },
    { q: 'In a right triangle, cos(θ) = ?', options: ['Adjacent/Hypotenuse', 'Opposite/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Adjacent'], answer: 'Adjacent/Hypotenuse' },
    { q: 'In a right triangle, tan(θ) = ?', options: ['Opposite/Adjacent', 'Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Hypotenuse/Opposite'], answer: 'Opposite/Adjacent' },
    { q: 'sin(30°) = ?', options: ['0.5', '0.707', '0.866', '1'], answer: '0.5' },
    { q: 'cos(60°) = ?', options: ['0.5', '0.707', '0.866', '0.25'], answer: '0.5' },
    { q: 'tan(45°) = ?', options: ['1', '0.5', '0.866', '1.732'], answer: '1' },
    { q: 'sin(90°) = ?', options: ['1', '0', '0.5', '0.866'], answer: '1' },
    { q: 'cos(0°) = ?', options: ['1', '0', '0.5', '0.866'], answer: '1' },
  ];
  const mqs: Question[] = [
    { q: 'If sin(θ)=0.5, find θ (0° to 90°)', options: ['30°', '60°', '45°', '90°'], answer: '30°' },
    { q: 'If cos(θ)=0.5, find θ (0° to 90°)', options: ['60°', '30°', '45°', '0°'], answer: '60°' },
    { q: 'If tan(θ)=1, find θ (0° to 90°)', options: ['45°', '30°', '60°', '90°'], answer: '45°' },
    { q: 'sin(45°) = ?', options: ['0.707', '0.5', '0.866', '1'], answer: '0.707' },
    { q: 'cos(30°) = ?', options: ['0.866', '0.5', '0.707', '1'], answer: '0.866' },
    { q: 'tan(60°) = ?', options: ['1.732', '1', '0.577', '0.866'], answer: '1.732' },
    { q: 'sin(60°) = ?', options: ['0.866', '0.5', '0.707', '1'], answer: '0.866' },
    { q: 'cos(45°) = ?', options: ['0.707', '0.5', '0.866', '1'], answer: '0.707' },
  ];
  const hqs: Question[] = [
    { q: 'Right triangle: opp=5, hyp=13. Find sin(θ)', options: ['0.385', '0.923', '0.417', '2.6'], answer: '0.385' },
    { q: 'Right triangle: adj=12, hyp=13. Find cos(θ)', options: ['0.923', '0.385', '1.083', '0.417'], answer: '0.923' },
    { q: 'Right triangle: opp=3, adj=4. Find tan(θ)', options: ['0.75', '1.333', '0.6', '0.8'], answer: '0.75' },
    { q: 'Right triangle: opp=8, hyp=10. Find angle to nearest degree', options: ['53°', '37°', '45°', '60°'], answer: '53°' },
    { q: 'Right triangle: adj=9, hyp=15. Find angle to nearest degree', options: ['53°', '37°', '45°', '60°'], answer: '53°' },
    { q: 'Right triangle: opp=12, adj=5. Find angle to nearest degree', options: ['67°', '23°', '45°', '60°'], answer: '67°' },
    { q: 'sin²(θ) + cos²(θ) = ?', options: ['1', '0', 'sin²θ', 'cos²θ'], answer: '1' },
    { q: 'Right triangle: hyp=17, angle=30°. Find opposite side?', options: ['8.5', '14.7', '9.8', '17'], answer: '8.5' },
  ];
  if (diff === 'easy') return pick(qs);
  if (diff === 'medium') return pick([...qs, ...mqs]);
  return pick([...mqs, ...hqs]);
}

function genQ(subject: Subject, diff: Difficulty): Question {
  if (subject === 'algebra') return genAlgebra(diff);
  if (subject === 'geometry') return genGeometry(diff);
  return genTrigonometry(diff);
}

const SUBJECTS: { id: Subject; label: string; color: string }[] = [
  { id: 'algebra', label: 'Algebra', color: '#6366f1' },
  { id: 'geometry', label: 'Geometry', color: '#0891b2' },
  { id: 'trigonometry', label: 'Trigonometry', color: '#d97706' },
];
const DIFFS: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export default function MathSecondaryPage() {
  const [subject, setSubject] = useState<Subject>('algebra');
  const [diff, setDiff] = useState<Difficulty>('easy');
  const [q, setQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const newQ = useCallback((s: Subject, d: Difficulty) => {
    setQ(genQ(s, d));
    setSelected(null);
    setShowAns(false);
    setFeedback(null);
    setLocked(false);
  }, []);

  const handleStart = () => { setScore(0); setTotal(0); newQ(subject, diff); };

  const handleSelect = (opt: string) => {
    if (locked || !q) return;
    setSelected(opt);
    setShowAns(true);
    setLocked(true);
    setTotal(t => t + 1);
    const correct = opt === q.answer;
    if (correct) { setScore(s => s + 1); setFeedback('Correct!'); }
    else setFeedback(`Incorrect. Answer: ${q.answer}`);
  };

  const handleNext = () => newQ(subject, diff);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-xl">
        <Link href="/teaching-tools" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Secondary Mathematics</h1>
        <p className="text-sm text-slate-500 mb-5">Ages 13-16 · Practice questions with instant feedback</p>

        <div className="flex gap-2 mb-4">
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => { setSubject(s.id); setQ(null); setSelected(null); setShowAns(false); setFeedback(null); setLocked(false); }}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${subject === s.id ? 'text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              style={subject === s.id ? { backgroundColor: s.color } : {}}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          {DIFFS.map(d => (
            <button key={d.id} onClick={() => { if (!q || total === 0) { setDiff(d.id); } else { setDiff(d.id); setQ(null); setSelected(null); setShowAns(false); setFeedback(null); setLocked(false); } }}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${diff === d.id ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
              {d.label}
            </button>
          ))}
        </div>

        {total > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm">
            <span className="font-semibold text-slate-700">Score: {score}/{total}</span>
            <span className="text-xs text-slate-400">{total === 0 ? 0 : Math.round((score / total) * 100)}% correct</span>
          </div>
        )}

        {!q ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500 mb-4">Press start to get a question</p>
            <button onClick={handleStart}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: SUBJECTS.find(s => s.id === subject)!.color }}>
              Start Practice
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {SUBJECTS.find(s => s.id === subject)!.label} · {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </div>
            <p className="text-lg font-bold text-slate-800 mb-4">{q.q}</p>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let cls = 'border-slate-200 bg-white hover:border-slate-400 cursor-pointer';
                if (selected === opt && opt === q.answer) cls = 'border-emerald-500 bg-emerald-50';
                else if (selected === opt && opt !== q.answer) cls = 'border-red-400 bg-red-50';
                else if (showAns && opt === q.answer) cls = 'border-emerald-500 bg-emerald-50';
                return (
                  <button key={i} onClick={() => handleSelect(opt)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition ${cls}`}
                    disabled={locked}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold ${feedback.startsWith('Correct') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {feedback}
              </div>
            )}

            {locked && (
              <button onClick={handleNext}
                className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: SUBJECTS.find(s => s.id === subject)!.color }}>
                Next Question
              </button>
            )}
          </div>
        )}

        {!q && total > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-lg font-bold text-slate-700">Final Score: {score}/{total}</p>
            <p className="text-sm text-slate-500 mb-3">{total === 0 ? 0 : Math.round((score / total) * 100)}% correct</p>
            <button onClick={handleStart}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: SUBJECTS.find(s => s.id === subject)!.color }}>
              Start New Session
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
