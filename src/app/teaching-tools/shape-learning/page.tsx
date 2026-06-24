'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type ShapeDef = {
  id: string;
  label: string;
  color: string;
  bg: string;
  render: (size: number) => React.ReactNode;
};

const SIGHT_WORDS = [
  { word: 'Cat', hint: 'A furry pet that says meow' },
  { word: 'Dog', hint: 'A pet that barks' },
  { word: 'Sun', hint: 'It shines in the sky' },
  { word: 'Hat', hint: 'You wear it on your head' },
  { word: 'Ball', hint: 'You throw and catch it' },
  { word: 'Fish', hint: 'It swims in water' },
  { word: 'Bird', hint: 'It flies in the sky' },
  { word: 'Book', hint: 'You read it' },
  { word: 'Star', hint: 'It twinkles at night' },
  { word: 'Moon', hint: 'You see it at night' },
  { word: 'Tree', hint: 'It has leaves and branches' },
  { word: 'Flower', hint: 'It is colorful and smells nice' },
  { word: 'Apple', hint: 'A red fruit' },
  { word: 'Milk', hint: 'A white drink' },
  { word: 'Car', hint: 'It has four wheels' },
  { word: 'House', hint: 'You live in it' },
  { word: 'Rain', hint: 'Water falls from the sky' },
  { word: 'Blue', hint: 'The color of the sky' },
  { word: 'Red', hint: 'The color of an apple' },
  { word: 'Big', hint: 'Opposite of small' },
];

const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

const spellWord = (word: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const letters = word.toUpperCase().split('');
  let i = 0;
  const sayNext = () => {
    if (i >= letters.length) return;
    const u = new SpeechSynthesisUtterance(letters[i]);
    u.lang = 'en-US';
    u.rate = 0.6;
    u.pitch = 1.2;
    u.onend = () => { i++; setTimeout(sayNext, 180); };
    window.speechSynthesis.speak(u);
  };
  sayNext();
};

const shapes: ShapeDef[] = [
  {
    id: 'circle', label: 'Circle', color: '#f97316', bg: '#fff7ed',
    render: (s) => <div className="rounded-full bg-orange-400" style={{ width: s, height: s }} />,
  },
  {
    id: 'heart', label: 'Heart', color: '#ec4899', bg: '#fdf2f8',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    ),
  },
  {
    id: 'star', label: 'Star', color: '#eab308', bg: '#fefce8',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#eab308"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    ),
  },
  {
    id: 'triangle', label: 'Triangle', color: '#22c55e', bg: '#f0fdf4',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#22c55e"><path d="M1 21h22L12 2 1 21z"/></svg>
    ),
  },
  {
    id: 'cone', label: 'Cone', color: '#a855f7', bg: '#faf5ff',
    render: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><ellipse cx="12" cy="20" rx="9" ry="2" fill="#a855f7"/><path d="M3 20L12 3l9 17" stroke="#a855f7" fill="#c084fc"/></svg>
    ),
  },
  {
    id: 'oval', label: 'Oval', color: '#06b6d4', bg: '#ecfeff',
    render: (s) => <div className="rounded-[50%] bg-cyan-400" style={{ width: s * 1.4, height: s }} />,
  },
  {
    id: 'rectangle', label: 'Rectangle', color: '#3b82f6', bg: '#eff6ff',
    render: (s) => <div className="rounded-md bg-blue-400" style={{ width: s * 1.5, height: s * 0.75 }} />,
  },
  {
    id: 'square', label: 'Square', color: '#10b981', bg: '#ecfdf5',
    render: (s) => <div className="rounded-md bg-emerald-400" style={{ width: s, height: s }} />,
  },
];

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown'];
const colorHex: Record<string, string> = {
  Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#eab308',
  Orange: '#f97316', Purple: '#a855f7', Pink: '#ec4899', Brown: '#a16207',
};

export default function ShapeLearningPage() {
  const [mode, setMode] = useState<'shapes' | 'colors' | 'sight'>('shapes');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [colorQuiz, setColorQuiz] = useState(false);
  const [currentColor, setCurrentColor] = useState('');
  const [sightInput, setSightInput] = useState('');
  const [sightIdx, setSightIdx] = useState(() => Math.floor(Math.random() * SIGHT_WORDS.length));
  const [shuffledSight, setShuffledSight] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'sight') {
      const word = SIGHT_WORDS[sightIdx].word.toLowerCase();
      setShuffledSight(word.split('').sort(() => Math.random() - 0.5));
    }
  }, [sightIdx, mode]);

  const handleShapeClick = useCallback((id: string) => {
    if (answered) return;
    setTotal((p) => p + 1);
    setAnswered(true);
    if (id === shapes[currentIdx].id) {
      setScore((p) => p + 1);
      setCorrect(true);
      speak(`Yes! ${shapes[currentIdx].label}`);
      setTimeout(() => spellWord(shapes[currentIdx].label), 800);
    } else {
      setCorrect(false);
      speak(`This is a ${shapes[currentIdx].label}`);
      setTimeout(() => spellWord(shapes[currentIdx].label), 800);
    }
  }, [answered, currentIdx]);

  const nextShape = useCallback(() => {
    setCurrentIdx((p) => (p + 1) % shapes.length);
    setAnswered(false);
    setCorrect(false);
  }, []);

  const handleColorClick = useCallback((c: string) => {
    if (answered) return;
    setTotal((p) => p + 1);
    setAnswered(true);
    if (c === currentColor) {
      setScore((p) => p + 1);
      setCorrect(true);
      speak(`Yes! ${c}`);
    } else {
      setCorrect(false);
      speak(`This is ${currentColor}`);
    }
  }, [answered, currentColor]);

  const nextColor = useCallback(() => {
    setColorIdx((p) => (p + 1) % COLORS.length);
    setAnswered(false);
    setCorrect(false);
  }, []);

  const startColorQuiz = useCallback(() => {
    const rand = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentColor(rand);
    setColorQuiz(true);
    setAnswered(false);
    setCorrect(false);
    setScore(0);
    setTotal(0);
  }, []);

  const handleSightSubmit = useCallback(() => {
    if (!sightInput.trim()) return;
    setTotal((p) => p + 1);
    setAnswered(true);
    if (sightInput.trim().toLowerCase() === SIGHT_WORDS[sightIdx].word.toLowerCase()) {
      setScore((p) => p + 1);
      setCorrect(true);
      speak(`Correct! ${SIGHT_WORDS[sightIdx].word}`);
    } else {
      setCorrect(false);
      speak(`The word is ${SIGHT_WORDS[sightIdx].word}`);
    }
  }, [sightInput, sightIdx]);

  const nextSight = useCallback(() => {
    let n: number;
    do { n = Math.floor(Math.random() * SIGHT_WORDS.length); } while (n === sightIdx && SIGHT_WORDS.length > 1);
    setSightIdx(n);
    setSightInput('');
    setAnswered(false);
    setCorrect(false);
  }, [sightIdx]);

  const s = 80;

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Ages 3-4 • Early Learning</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">⭐ Fun Learning for Kids</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Learn shapes, colors, and sight words with sounds and colorful games!</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {(['shapes', 'colors', 'sight'] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setAnswered(false); setCorrect(false); setScore(0); setTotal(0); }} className={`rounded-full px-5 py-2 text-sm font-bold transition ${mode === m ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {m === 'shapes' ? '🔷 Shapes' : m === 'colors' ? '🎨 Colors' : '📖 Sight Words'}
              </button>
            ))}
          </div>
        </section>

        {mode === 'shapes' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-900">Find the {shapes[currentIdx].label}</h2>
            <button type="button" onClick={() => { speak(shapes[currentIdx].label); setTimeout(() => spellWord(shapes[currentIdx].label), 600); }} className="mt-1 text-xs text-slate-400 hover:text-slate-600">🔊 Hear & spell</button>

            {answered && (
              <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {correct ? '✅ Correct!' : `❌ That's a ${shapes[currentIdx].label}`}
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-center gap-4">
              {[...shapes].sort(() => Math.random() - 0.5).map((shape) => (
                <button key={shape.id} type="button" onClick={() => handleShapeClick(shape.id)} disabled={answered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${answered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${answered && shape.id === shapes[currentIdx].id ? 'border-emerald-400' : 'border-transparent'}`}>
                  {shape.render(s)}
                  <span className="text-xs font-bold text-slate-700">{shape.label}</span>
                </button>
              ))}
            </div>

            {answered && (
              <button type="button" onClick={nextShape} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Shape →</button>
            )}

            <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
          </section>
        )}

        {mode === 'colors' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            {!colorQuiz ? (
              <>
                <h2 className="text-lg font-bold text-slate-900">Learn Colors</h2>
                <p className="mt-2 text-sm text-slate-600">Click a color to hear its name, then take the quiz!</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => speak(c)} className="flex flex-col items-center gap-1">
                      <div className="h-16 w-16 rounded-2xl shadow-md transition hover:scale-110" style={{ backgroundColor: colorHex[c] }} />
                      <span className="text-xs font-bold text-slate-700">{c}</span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={startColorQuiz} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Color Quiz</button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">What color is this?</h2>
                <div className="mt-4 flex justify-center">
                  <div className="h-24 w-24 rounded-3xl shadow-lg transition-all" style={{ backgroundColor: colorHex[currentColor] }} />
                </div>

                {answered && (
                  <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {correct ? '✅ Correct!' : `❌ It's ${currentColor}`}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {[...COLORS].sort(() => Math.random() - 0.5).map((c) => (
                    <button key={c} type="button" onClick={() => handleColorClick(c)} disabled={answered} className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${answered ? 'opacity-50' : 'hover:scale-110'}`} style={{ backgroundColor: colorHex[c] }}>
                      {c}
                    </button>
                  ))}
                </div>

                {answered && (
                  <button type="button" onClick={nextColor} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Color →</button>
                )}

                <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
              </>
            )}
          </section>
        )}

        {mode === 'sight' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-900">Spell the Word</h2>
            <p className="mt-1 text-sm text-slate-500">{SIGHT_WORDS[sightIdx].hint}</p>
            <button type="button" onClick={() => speak(SIGHT_WORDS[sightIdx].word)} className="mt-1 text-xs text-slate-400 hover:text-slate-600">🔊 Hear it</button>

            {answered && (
              <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {correct ? '✅ Correct!' : `❌ The word is: ${SIGHT_WORDS[sightIdx].word}`}
              </div>
            )}

            <div className="mt-4">
              <div className="flex flex-wrap justify-center gap-2">
                {shuffledSight.map((ch, i) => (
                  <button key={i} type="button" onClick={() => setSightInput((p) => p + ch)} disabled={answered} className="h-10 w-10 rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-50">
                    {ch}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {SIGHT_WORDS[sightIdx].word.split('').map((_, i) => (
                  <div key={i} className="h-10 w-8 rounded-lg border-b-2 border-indigo-300 bg-white flex items-center justify-center text-lg font-bold text-indigo-700">
                    {sightInput[i] || ''}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-2">
                <button type="button" onClick={() => setSightInput((p) => p.slice(0, -1))} disabled={answered || !sightInput} className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50">⌫ Back</button>
                {!answered && (
                  <button type="button" onClick={handleSightSubmit} disabled={!sightInput.trim()} className="rounded-xl bg-fuchsia-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                )}
              </div>
            </div>

            {answered && (
              <button type="button" onClick={nextSight} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Word →</button>
            )}

            <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
          </section>
        )}

        <footer className="text-center text-xs text-slate-400">Tap the speaker buttons 🔊 to hear pronunciation. Ages 3+</footer>
      </div>
    </main>
  );
}
