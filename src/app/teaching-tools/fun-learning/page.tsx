'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { HiLockClosed } from 'react-icons/hi';

type ShapeDef = { id: string; label: string; color: string; bg: string; render: (size: number) => React.ReactNode };
type Shape3DDef = { id: string; label: string; color: string; bg: string; render: (size: number) => React.ReactNode };
type Question = { sentence: string; blank: string; options: string[]; answer: string };
type NumWord = { num: number; word: string };

const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

const spellWord = (word: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const letters = word.toUpperCase().split('');
  let i = 0;
  const sayNext = () => {
    if (i >= letters.length) { const u = new SpeechSynthesisUtterance(word); u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1; window.speechSynthesis.speak(u); return; }
    const u = new SpeechSynthesisUtterance(letters[i]);
    u.lang = 'en-US'; u.rate = 0.6; u.pitch = 1.2;
    u.onend = () => { i++; setTimeout(sayNext, 180); };
    window.speechSynthesis.speak(u);
  };
  sayNext();
};

const SIGHT_WORDS = [
  { word: 'Cat', hint: 'A furry pet that says meow' }, { word: 'Dog', hint: 'A pet that barks' },
  { word: 'Sun', hint: 'It shines in the sky' }, { word: 'Hat', hint: 'You wear it on your head' },
  { word: 'Ball', hint: 'You throw and catch it' }, { word: 'Fish', hint: 'It swims in water' },
  { word: 'Bird', hint: 'It flies in the sky' }, { word: 'Book', hint: 'You read it' },
  { word: 'Star', hint: 'It twinkles at night' }, { word: 'Moon', hint: 'You see it at night' },
  { word: 'Tree', hint: 'It has leaves and branches' }, { word: 'Flower', hint: 'It is colorful and smells nice' },
  { word: 'Apple', hint: 'A red fruit' }, { word: 'Milk', hint: 'A white drink' },
  { word: 'Car', hint: 'It has four wheels' }, { word: 'House', hint: 'You live in it' },
  { word: 'Rain', hint: 'Water falls from the sky' }, { word: 'Blue', hint: 'The color of the sky' },
  { word: 'Red', hint: 'The color of an apple' }, { word: 'Big', hint: 'Opposite of small' },
];

const shapes: ShapeDef[] = [
  { id: 'circle', label: 'Circle', color: '#f97316', bg: '#fff7ed', render: (s: number) => <div className="rounded-full bg-orange-400" style={{ width: s, height: s }} /> },
  { id: 'heart', label: 'Heart', color: '#ec4899', bg: '#fdf2f8', render: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24" fill="#ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> },
  { id: 'star', label: 'Star', color: '#eab308', bg: '#fefce8', render: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24" fill="#eab308"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { id: 'triangle', label: 'Triangle', color: '#22c55e', bg: '#f0fdf4', render: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24" fill="#22c55e"><path d="M1 21h22L12 2 1 21z"/></svg> },
  { id: 'cone', label: 'Cone', color: '#a855f7', bg: '#faf5ff', render: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><ellipse cx="12" cy="20" rx="9" ry="2" fill="#a855f7"/><path d="M3 20L12 3l9 17" stroke="#a855f7" fill="#c084fc"/></svg> },
  { id: 'oval', label: 'Oval', color: '#06b6d4', bg: '#ecfeff', render: (s: number) => <div className="rounded-[50%] bg-cyan-400" style={{ width: s * 1.4, height: s }} /> },
  { id: 'rectangle', label: 'Rectangle', color: '#3b82f6', bg: '#eff6ff', render: (s: number) => <div className="rounded-md bg-blue-400" style={{ width: s * 1.5, height: s * 0.75 }} /> },
  { id: 'square', label: 'Square', color: '#10b981', bg: '#ecfdf5', render: (s: number) => <div className="rounded-md bg-emerald-400" style={{ width: s, height: s }} /> },
];

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown'];
const colorHex: Record<string, string> = { Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#eab308', Orange: '#f97316', Purple: '#a855f7', Pink: '#ec4899', Brown: '#a16207' };

const shape3dList: Shape3DDef[] = [
  { id: 'cube', label: 'Cube', color: '#f97316', bg: '#fff7ed', render: (s: number) => <svg width={s} height={s} viewBox="0 0 100 100" fill="none"><polygon points="50,10 90,30 50,50 10,30" fill="#fb923c" stroke="#9a3412" strokeWidth="1.5"/><polygon points="50,50 90,30 90,70 50,90" fill="#f97316" stroke="#9a3412" strokeWidth="1.5"/><polygon points="10,30 50,50 50,90 10,70" fill="#fdba74" stroke="#9a3412" strokeWidth="1.5"/></svg> },
  { id: 'cuboid', label: 'Cuboid', color: '#3b82f6', bg: '#eff6ff', render: (s: number) => <svg width={s} height={s} viewBox="0 0 110 90" fill="none"><polygon points="65,10 105,25 65,40 25,25" fill="#60a5fa" stroke="#1e40af" strokeWidth="1.5"/><polygon points="65,40 105,25 105,65 65,80" fill="#3b82f6" stroke="#1e40af" strokeWidth="1.5"/><polygon points="25,25 65,40 65,80 25,65" fill="#93c5fd" stroke="#1e40af" strokeWidth="1.5"/></svg> },
  { id: 'sphere', label: 'Sphere', color: '#22c55e', bg: '#f0fdf4', render: (s: number) => <svg width={s} height={s} viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" fill="#4ade80" stroke="#15803d" strokeWidth="1.5"/><ellipse cx="38" cy="38" rx="16" ry="12" fill="#86efac" opacity="0.6"/><ellipse cx="62" cy="58" rx="10" ry="6" fill="#15803d" opacity="0.15"/></svg> },
  { id: 'cylinder', label: 'Cylinder', color: '#a855f7', bg: '#faf5ff', render: (s: number) => <svg width={s} height={s} viewBox="0 0 90 100" fill="none"><ellipse cx="45" cy="20" rx="35" ry="12" fill="#c084fc" stroke="#7e22ce" strokeWidth="1.5"/><rect x="10" y="20" width="70" height="58" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5"/><ellipse cx="45" cy="78" rx="35" ry="12" fill="#d8b4fe" stroke="#7e22ce" strokeWidth="1.5"/><rect x="10" y="20" width="35" height="58" fill="#c084fc" opacity="0.4"/></svg> },
  { id: 'cone', label: 'Cone', color: '#eab308', bg: '#fefce8', render: (s: number) => <svg width={s} height={s} viewBox="0 0 90 100" fill="none"><polygon points="45,5 85,85 5,85" fill="#facc15" stroke="#a16207" strokeWidth="1.5"/><ellipse cx="45" cy="85" rx="40" ry="10" fill="#fef08a" stroke="#a16207" strokeWidth="1.5"/><polygon points="45,5 45,85 5,85" fill="#fde047" opacity="0.5"/></svg> },
  { id: 'pyramid', label: 'Pyramid', color: '#ec4899', bg: '#fdf2f8', render: (s: number) => <svg width={s} height={s} viewBox="0 0 90 100" fill="none"><polygon points="45,5 85,85 45,70" fill="#f472b6" stroke="#be185d" strokeWidth="1.5"/><polygon points="45,5 5,85 45,70" fill="#f9a8d4" stroke="#be185d" strokeWidth="1.5"/><polygon points="5,85 85,85 45,70" fill="#ec4899" stroke="#be185d" strokeWidth="1.5"/></svg> },
];

const SPELL_WORDS = [
  { word: 'cat', hint: 'A small furry pet' }, { word: 'dog', hint: 'A pet that barks' },
  { word: 'sun', hint: 'It shines in the day' }, { word: 'hat', hint: 'You wear it on your head' },
  { word: 'ball', hint: 'Round toy you throw' }, { word: 'fish', hint: 'Swims in water' },
  { word: 'bird', hint: 'Has wings and flies' }, { word: 'book', hint: 'You read it' },
  { word: 'tree', hint: 'Tall plant with leaves' }, { word: 'star', hint: 'Twinkles at night' },
  { word: 'moon', hint: 'Seen in the night sky' }, { word: 'rain', hint: 'Water from clouds' },
  { word: 'door', hint: 'You open it to enter' }, { word: 'bell', hint: 'Makes a ringing sound' },
  { word: 'duck', hint: 'A bird that quacks' }, { word: 'frog', hint: 'Green animal that jumps' },
  { word: 'lion', hint: 'King of the jungle' }, { word: 'baby', hint: 'A very young child' },
  { word: 'cake', hint: 'A sweet birthday treat' }, { word: 'milk', hint: 'White drink from cows' },
];

const QUESTIONS: Question[] = [
  { sentence: 'The ___ is shining in the sky.', blank: 'sun', options: ['sun', 'moon', 'star', 'cloud'], answer: 'sun' },
  { sentence: 'I drink ___ every morning.', blank: 'milk', options: ['water', 'milk', 'juice', 'tea'], answer: 'milk' },
  { sentence: 'A ___ can fly in the sky.', blank: 'bird', options: ['fish', 'dog', 'bird', 'cat'], answer: 'bird' },
  { sentence: 'We sit on a ___.', blank: 'chair', options: ['table', 'chair', 'bed', 'door'], answer: 'chair' },
  { sentence: 'The ___ is green and grows in the ground.', blank: 'tree', options: ['tree', 'rock', 'house', 'car'], answer: 'tree' },
  { sentence: 'I wear a ___ on my head.', blank: 'hat', options: ['shoe', 'hat', 'glove', 'sock'], answer: 'hat' },
  { sentence: 'A ___ says woof woof.', blank: 'dog', options: ['cat', 'duck', 'dog', 'frog'], answer: 'dog' },
  { sentence: 'The ___ is very hot.', blank: 'fire', options: ['ice', 'fire', 'water', 'wind'], answer: 'fire' },
  { sentence: 'I read a ___ every night.', blank: 'book', options: ['book', 'toy', 'ball', 'cup'], answer: 'book' },
  { sentence: 'We sleep on a ___.', blank: 'bed', options: ['chair', 'table', 'bed', 'floor'], answer: 'bed' },
  { sentence: 'The ___ is swimming in the pond.', blank: 'duck', options: ['duck', 'cat', 'dog', 'frog'], answer: 'duck' },
  { sentence: 'I eat an ___ for a snack.', blank: 'apple', options: ['apple', 'bread', 'rice', 'meat'], answer: 'apple' },
  { sentence: 'The ___ is big and yellow.', blank: 'bus', options: ['car', 'bus', 'bike', 'train'], answer: 'bus' },
  { sentence: 'I have two ___ and two feet.', blank: 'hands', options: ['hands', 'eyes', 'ears', 'wings'], answer: 'hands' },
  { sentence: 'The ___ is bright at night.', blank: 'moon', options: ['sun', 'star', 'moon', 'lamp'], answer: 'moon' },
];

const TEEN_WORDS: NumWord[] = [
  { num: 13, word: 'thirteen' }, { num: 14, word: 'fourteen' }, { num: 15, word: 'fifteen' },
  { num: 16, word: 'sixteen' }, { num: 17, word: 'seventeen' }, { num: 18, word: 'eighteen' }, { num: 19, word: 'nineteen' },
];

const TY_WORDS: NumWord[] = [
  { num: 20, word: 'twenty' }, { num: 30, word: 'thirty' }, { num: 40, word: 'forty' }, { num: 50, word: 'fifty' },
  { num: 60, word: 'sixty' }, { num: 70, word: 'seventy' }, { num: 80, word: 'eighty' }, { num: 90, word: 'ninety' },
];

function getQuizOptions(list: NumWord[], correctIdx: number): NumWord[] {
  const opts = [list[correctIdx]];
  const pool = list.filter((_, i) => i !== correctIdx);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  opts.push(pool[0], pool[1], pool[2]);
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return opts;
}

const quizDelay = (label: string) => 800 + label.length * 860 + 1000 + 1500;

type Tab = 'shapes' | 'colors' | 'sight' | 'd3' | 'spell' | 'blanks' | 'teen' | 'ty';

export default function FunLearningPage() {
  const [tab, setTab] = useState<Tab>('shapes');

  // Parent lock state
  const [parentLocked, setParentLocked] = useState(false);
  const [parentUnlockInput, setParentUnlockInput] = useState('');
  const [parentUnlockError, setParentUnlockError] = useState(false);
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'plus' | 'minus'>('plus');
  const [mathAnswer, setMathAnswer] = useState(0);

  const generateMathProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * a) + 1;
    const op = Math.random() < 0.5 ? 'plus' as const : 'minus' as const;
    const ans = op === 'plus' ? a + b : a - b;
    setMathNum1(a); setMathNum2(b); setMathOp(op); setMathAnswer(ans);
  }, []);

  const handleParentLock = useCallback(() => {
    generateMathProblem();
    setParentLocked(true);
    setParentUnlockInput('');
    setParentUnlockError(false);
    try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch {}
  }, [generateMathProblem]);

  const handleParentUnlock = useCallback(() => {
    if (parentUnlockInput === String(mathAnswer)) {
      setParentLocked(false);
      setParentUnlockInput('');
      setParentUnlockError(false);
      try { if (document.exitFullscreen) document.exitFullscreen(); } catch {}
    } else { setParentUnlockError(true); }
  }, [parentUnlockInput, mathAnswer]);

  useEffect(() => {
    if (!parentLocked) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [parentLocked]);

  useEffect(() => {
    if (!parentLocked) return;
    const handler = () => { window.history.pushState(null, '', window.location.href); };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [parentLocked]);

  useEffect(() => {
    let wakeLock: any = null;
    (async () => { try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); } catch {} })();
    return () => { wakeLock?.release(); };
  }, []);

  // 2D Shapes state
  const [shapeSub, setShapeSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
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

  // Colors state
  const [colorIdx, setColorIdx] = useState(0);
  const [colorQuiz, setColorQuiz] = useState(false);
  const [currentColor, setCurrentColor] = useState('');
  const [colorScore, setColorScore] = useState(0);
  const [colorTotal, setColorTotal] = useState(0);
  const [colorAnswered, setColorAnswered] = useState(false);
  const [colorCorrect, setColorCorrect] = useState(false);

  // Sight Words state
  const [sightIdx, setSightIdx] = useState(() => Math.floor(Math.random() * SIGHT_WORDS.length));
  const [sightInput, setSightInput] = useState('');
  const [shuffledSight, setShuffledSight] = useState<string[]>([]);
  const [sightScore, setSightScore] = useState(0);
  const [sightTotal, setSightTotal] = useState(0);
  const [sightAnswered, setSightAnswered] = useState(false);
  const [sightCorrect, setSightCorrect] = useState(false);

  // 3D Shapes state
  const [d3Mode, setD3Mode] = useState<'quiz' | 'learn' | 'fib'>('quiz');
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

  // Spelling Bee state
  const [spellIdx, setSpellIdx] = useState(() => Math.floor(Math.random() * SPELL_WORDS.length));
  const [spellInput, setSpellInput] = useState('');
  const [spellAnswered, setSpellAnswered] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [spellScore, setSpellScore] = useState(0);
  const [spellTotal, setSpellTotal] = useState(0);
  const [spellLetters, setSpellLetters] = useState<string[]>([]);
  const [spellSelected, setSpellSelected] = useState<string[]>([]);

  // Fill Blanks state
  const [fbQIdx, setFbQIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [fbAnswered, setFbAnswered] = useState(false);
  const [fbCorrect, setFbCorrect] = useState(false);
  const [fbSelected, setFbSelected] = useState<string | null>(null);
  const [fbScore, setFbScore] = useState(0);
  const [fbTotal, setFbTotal] = useState(0);

  // Teen Words state
  const [teenMode, setTeenMode] = useState<'quiz' | 'learn' | 'fib'>('quiz');
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

  // Ty Words state
  const [tyMode, setTyMode] = useState<'quiz' | 'learn' | 'fib'>('quiz');
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

  const s2 = 80;

  // Effects for shape quiz auto-advance (wait for spell + name + pause)
  useEffect(() => {
    if (tab !== 'shapes' || shapeSub !== 'quiz' || !shapeAnswered) return;
    const t = setTimeout(() => { setShapeIdx((p) => (p + 1) % shapes.length); setShapeAnswered(false); setShapeCorrect(false); setShapeFibResult(null); setShapeFibInput(''); }, quizDelay(shapes[shapeIdx].label));
    return () => clearTimeout(t);
  }, [shapeAnswered, shapeSub, shapeIdx, tab]);

  // Effects for shape fib auto-advance
  useEffect(() => {
    if (tab !== 'shapes' || shapeSub !== 'fib' || !shapeAnswered) return;
    const t = setTimeout(() => { let n: number; do { n = Math.floor(Math.random() * shapes.length); } while (n === shapeIdx && shapes.length > 1); setShapeIdx(n); setShapeAnswered(false); setShapeFibResult(null); setShapeFibInput(''); }, quizDelay(shapes[shapeIdx].label));
    return () => clearTimeout(t);
  }, [shapeAnswered, shapeSub, shapeIdx, tab]);

  // Effects for shape memo auto-play
  useEffect(() => {
    if (!sMemoRunning) return;
    const shape = shapes[sMemoIdx];
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(shape.label), 300);
    const advanceTimer = setTimeout(() => {
      setSMemoCount((c) => {
        const next = c + 1;
        if (next >= sMemoRepeat) {
          const nextIdx = (sMemoIdx + 1) % shapes.length;
          if (nextIdx === 0 && !sMemoLoop) { setSMemoRunning(false); return 0; }
          setSMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + shape.label.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [sMemoRunning, sMemoIdx, sMemoCount, sMemoRepeat, sMemoLoop, sMemoLocked]);

  // Effects for 3D shapes quiz auto-advance
  useEffect(() => {
    if (tab !== 'd3' || d3Mode !== 'quiz' || !d3Answered) return;
    const t = setTimeout(() => { setD3Idx((p) => (p + 1) % shape3dList.length); setD3Answered(false); setD3Correct(false); }, quizDelay(shape3dList[d3Idx].label));
    return () => clearTimeout(t);
  }, [d3Answered, d3Mode, d3Idx, tab]);

  // Effects for 3D shapes fib auto-advance
  useEffect(() => {
    if (tab !== 'd3' || d3Mode !== 'fib' || !d3Answered) return;
    const t = setTimeout(() => { let n: number; do { n = Math.floor(Math.random() * shape3dList.length); } while (n === d3Idx && shape3dList.length > 1); setD3Idx(n); setD3Answered(false); setD3Correct(false); setD3FibResult(null); setD3FibInput(''); }, quizDelay(shape3dList[d3Idx].label));
    return () => clearTimeout(t);
  }, [d3Answered, d3Mode, d3Idx, tab]);

  // Effects for 3D memo auto-play
  useEffect(() => {
    if (!d3MemoRunning) return;
    const shape = shape3dList[d3MemoIdx];
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(shape.label), 300);
    const advanceTimer = setTimeout(() => {
      setD3MemoCount((c) => {
        const next = c + 1;
        if (next >= d3MemoRepeat) {
          const nextIdx = (d3MemoIdx + 1) % shape3dList.length;
          if (nextIdx === 0 && !d3MemoLoop) { setD3MemoRunning(false); return 0; }
          setD3MemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + shape.label.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [d3MemoRunning, d3MemoIdx, d3MemoCount, d3MemoRepeat, d3MemoLoop, d3MemoLocked]);

  // Effects for sight words shuffle
  useEffect(() => {
    if (tab === 'sight') {
      const word = SIGHT_WORDS[sightIdx].word.toLowerCase();
      setShuffledSight(word.split('').sort(() => Math.random() - 0.5));
    }
  }, [sightIdx, tab]);

  // Effects for spelling bee
  useEffect(() => {
    if (tab !== 'spell') return;
    const w = SPELL_WORDS[spellIdx].word;
    setSpellLetters(w.split('').sort(() => Math.random() - 0.5));
    setSpellSelected([]);
    setTimeout(() => { const u = new SpeechSynthesisUtterance(w); u.lang = 'en-US'; u.rate = 0.7; u.pitch = 1.1; window.speechSynthesis.speak(u); }, 400);
  }, [spellIdx, tab]);

  useEffect(() => {
    if (tab !== 'spell' || !spellAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do { n = Math.floor(Math.random() * SPELL_WORDS.length); } while (n === spellIdx && SPELL_WORDS.length > 1);
      setSpellIdx(n); setSpellInput(''); setSpellAnswered(false); setSpellCorrect(false); setSpellSelected([]);
    }, 2500);
    return () => clearTimeout(t);
  }, [spellAnswered, spellIdx, tab]);

  // Effects for fill blanks
  useEffect(() => {
    if (tab !== 'blanks') return;
    const q = QUESTIONS[fbQIdx];
    const txt = q.sentence.replace('___', 'blank');
    setTimeout(() => { const u = new SpeechSynthesisUtterance(txt); u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.speak(u); }, 300);
  }, [fbQIdx, tab]);

  useEffect(() => {
    if (tab !== 'blanks' || !fbAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do { n = Math.floor(Math.random() * QUESTIONS.length); } while (n === fbQIdx && QUESTIONS.length > 1);
      setFbQIdx(n); setFbAnswered(false); setFbCorrect(false); setFbSelected(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [fbAnswered, fbQIdx, tab]);

  // Effects for teen words
  useEffect(() => {
    if (tab !== 'teen' || teenMode !== 'quiz') return;
    setTeenQuizOpts(getQuizOptions(TEEN_WORDS, teenIdx));
  }, [teenIdx, teenMode, tab]);

  useEffect(() => {
    if (tab !== 'teen' || teenMode !== 'quiz' || !teenAnswered) return;
    const t = setTimeout(() => { setTeenIdx((p) => (p + 1) % TEEN_WORDS.length); setTeenAnswered(false); setTeenCorrect(false); setTeenFibResult(null); setTeenFibInput(''); }, quizDelay(TEEN_WORDS[teenIdx].word));
    return () => clearTimeout(t);
  }, [teenAnswered, teenMode, teenIdx, tab]);

  useEffect(() => {
    if (tab !== 'teen' || teenMode !== 'fib' || !teenAnswered) return;
    const t = setTimeout(() => { let n: number; do { n = Math.floor(Math.random() * TEEN_WORDS.length); } while (n === teenIdx && TEEN_WORDS.length > 1); setTeenIdx(n); setTeenAnswered(false); setTeenFibResult(null); setTeenFibInput(''); }, quizDelay(TEEN_WORDS[teenIdx].word));
    return () => clearTimeout(t);
  }, [teenAnswered, teenMode, teenIdx, tab]);

  useEffect(() => {
    if (!teenMemoRunning) return;
    const item = TEEN_WORDS[teenMemoIdx];
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item.word), 300);
    const advanceTimer = setTimeout(() => {
      setTeenMemoCount((c) => {
        const next = c + 1;
        if (next >= teenMemoRepeat) {
          const nextIdx = (teenMemoIdx + 1) % TEEN_WORDS.length;
          if (nextIdx === 0 && !teenMemoLoop) { setTeenMemoRunning(false); return 0; }
          setTeenMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.word.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [teenMemoRunning, teenMemoIdx, teenMemoCount, teenMemoRepeat, teenMemoLoop, teenMemoLocked]);

  // Effects for ty words
  useEffect(() => {
    if (tab !== 'ty' || tyMode !== 'quiz') return;
    setTyQuizOpts(getQuizOptions(TY_WORDS, tyIdx));
  }, [tyIdx, tyMode, tab]);

  useEffect(() => {
    if (tab !== 'ty' || tyMode !== 'quiz' || !tyAnswered) return;
    const t = setTimeout(() => { setTyIdx((p) => (p + 1) % TY_WORDS.length); setTyAnswered(false); setTyCorrect(false); setTyFibResult(null); setTyFibInput(''); }, quizDelay(TY_WORDS[tyIdx].word));
    return () => clearTimeout(t);
  }, [tyAnswered, tyMode, tyIdx, tab]);

  useEffect(() => {
    if (tab !== 'ty' || tyMode !== 'fib' || !tyAnswered) return;
    const t = setTimeout(() => { let n: number; do { n = Math.floor(Math.random() * TY_WORDS.length); } while (n === tyIdx && TY_WORDS.length > 1); setTyIdx(n); setTyAnswered(false); setTyFibResult(null); setTyFibInput(''); }, quizDelay(TY_WORDS[tyIdx].word));
    return () => clearTimeout(t);
  }, [tyAnswered, tyMode, tyIdx, tab]);

  useEffect(() => {
    if (!tyMemoRunning) return;
    const item = TY_WORDS[tyMemoIdx];
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item.word), 300);
    const advanceTimer = setTimeout(() => {
      setTyMemoCount((c) => {
        const next = c + 1;
        if (next >= tyMemoRepeat) {
          const nextIdx = (tyMemoIdx + 1) % TY_WORDS.length;
          if (nextIdx === 0 && !tyMemoLoop) { setTyMemoRunning(false); return 0; }
          setTyMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.word.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [tyMemoRunning, tyMemoIdx, tyMemoCount, tyMemoRepeat, tyMemoLoop, tyMemoLocked]);

  const handleShapeClick = useCallback((id: string) => {
    if (shapeAnswered) return;
    setShapeTotal((p) => p + 1); setShapeAnswered(true);
    if (id === shapes[shapeIdx].id) { setShapeScore((p) => p + 1); setShapeCorrect(true); speak(`Yes! ${shapes[shapeIdx].label}`); setTimeout(() => spellWord(shapes[shapeIdx].label), 800); }
    else { setShapeCorrect(false); speak(`This is a ${shapes[shapeIdx].label}`); setTimeout(() => spellWord(shapes[shapeIdx].label), 800); }
  }, [shapeAnswered, shapeIdx]);

  const handleShapeFib = useCallback(() => {
    if (!shapeFibInput.trim()) return;
    setShapeTotal((p) => p + 1); setShapeAnswered(true);
    if (shapeFibInput.trim().toLowerCase() === shapes[shapeIdx].label.toLowerCase()) { setShapeScore((p) => p + 1); setShapeFibResult('correct'); speak(`Correct! ${shapes[shapeIdx].label}`); setTimeout(() => spellWord(shapes[shapeIdx].label), 800); }
    else { setShapeFibResult('wrong'); speak(`This is a ${shapes[shapeIdx].label}`); setTimeout(() => spellWord(shapes[shapeIdx].label), 800); }
  }, [shapeFibInput, shapeIdx]);

  const handleColorClick = useCallback((c: string) => {
    if (colorAnswered) return;
    setColorTotal((p) => p + 1); setColorAnswered(true);
    if (c === currentColor) { setColorScore((p) => p + 1); setColorCorrect(true); speak(`Yes! ${c}`); }
    else { setColorCorrect(false); speak(`This is ${currentColor}`); }
  }, [colorAnswered, currentColor]);

  const handleSightSubmit = useCallback(() => {
    if (!sightInput.trim()) return;
    setSightTotal((p) => p + 1); setSightAnswered(true);
    if (sightInput.trim().toLowerCase() === SIGHT_WORDS[sightIdx].word.toLowerCase()) { setSightScore((p) => p + 1); setSightCorrect(true); speak(`Correct! ${SIGHT_WORDS[sightIdx].word}`); }
    else { setSightCorrect(false); speak(`The word is ${SIGHT_WORDS[sightIdx].word}`); }
  }, [sightInput, sightIdx]);

  const handleD3Click = useCallback((id: string) => {
    if (d3Answered) return;
    setD3Total((p) => p + 1); setD3Answered(true);
    if (id === shape3dList[d3Idx].id) { setD3Score((p) => p + 1); setD3Correct(true); speak(`Yes! ${shape3dList[d3Idx].label}`); setTimeout(() => spellWord(shape3dList[d3Idx].label), 800); }
    else { setD3Correct(false); speak(`This is a ${shape3dList[d3Idx].label}`); setTimeout(() => spellWord(shape3dList[d3Idx].label), 800); }
  }, [d3Answered, d3Idx]);

  const handleD3Fib = useCallback(() => {
    if (!d3FibInput.trim()) return;
    setD3Total((p) => p + 1); setD3Answered(true);
    if (d3FibInput.trim().toLowerCase() === shape3dList[d3Idx].label.toLowerCase()) { setD3Score((p) => p + 1); setD3FibResult('correct'); speak(`Correct! ${shape3dList[d3Idx].label}`); setTimeout(() => spellWord(shape3dList[d3Idx].label), 800); }
    else { setD3FibResult('wrong'); speak(`This is a ${shape3dList[d3Idx].label}`); setTimeout(() => spellWord(shape3dList[d3Idx].label), 800); }
  }, [d3FibInput, d3Idx]);

  const handleSpellCheck = useCallback(() => {
    const word = spellSelected.join('');
    if (!word) return;
    setSpellTotal((p) => p + 1); setSpellAnswered(true);
    if (word === SPELL_WORDS[spellIdx].word) { setSpellScore((p) => p + 1); setSpellCorrect(true); speak(`Correct! ${SPELL_WORDS[spellIdx].word}`); }
    else { setSpellCorrect(false); speak(`The word is ${SPELL_WORDS[spellIdx].word}`); }
  }, [spellSelected, spellIdx]);

  // Teen handlers
  const handleTeenQuiz = useCallback((word: string) => {
    if (teenAnswered) return;
    setTeenTotal((p) => p + 1); setTeenAnswered(true);
    if (word === TEEN_WORDS[teenIdx].word) { setTeenScore((p) => p + 1); setTeenCorrect(true); speak(`Yes! ${TEEN_WORDS[teenIdx].word}`); setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800); }
    else { setTeenCorrect(false); speak(`This is ${TEEN_WORDS[teenIdx].word}`); setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800); }
  }, [teenAnswered, teenIdx]);

  const handleTeenFib = useCallback(() => {
    if (!teenFibInput.trim()) return;
    setTeenTotal((p) => p + 1); setTeenAnswered(true);
    if (teenFibInput.trim().toLowerCase() === TEEN_WORDS[teenIdx].word.toLowerCase()) { setTeenScore((p) => p + 1); setTeenFibResult('correct'); speak(`Correct! ${TEEN_WORDS[teenIdx].word}`); setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800); }
    else { setTeenFibResult('wrong'); speak(`This is ${TEEN_WORDS[teenIdx].word}`); setTimeout(() => spellWord(TEEN_WORDS[teenIdx].word), 800); }
  }, [teenFibInput, teenIdx]);

  // Ty handlers
  const handleTyQuiz = useCallback((word: string) => {
    if (tyAnswered) return;
    setTyTotal((p) => p + 1); setTyAnswered(true);
    if (word === TY_WORDS[tyIdx].word) { setTyScore((p) => p + 1); setTyCorrect(true); speak(`Yes! ${TY_WORDS[tyIdx].word}`); setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800); }
    else { setTyCorrect(false); speak(`This is ${TY_WORDS[tyIdx].word}`); setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800); }
  }, [tyAnswered, tyIdx]);

  const handleTyFib = useCallback(() => {
    if (!tyFibInput.trim()) return;
    setTyTotal((p) => p + 1); setTyAnswered(true);
    if (tyFibInput.trim().toLowerCase() === TY_WORDS[tyIdx].word.toLowerCase()) { setTyScore((p) => p + 1); setTyFibResult('correct'); speak(`Correct! ${TY_WORDS[tyIdx].word}`); setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800); }
    else { setTyFibResult('wrong'); speak(`This is ${TY_WORDS[tyIdx].word}`); setTimeout(() => spellWord(TY_WORDS[tyIdx].word), 800); }
  }, [tyFibInput, tyIdx]);

  const fb_q = QUESTIONS[fbQIdx];
  const fb_parts = fb_q.sentence.split('___');

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'shapes', icon: '🔷', label: 'Shapes' },
    { key: 'colors', icon: '🎨', label: 'Colors' },
    { key: 'sight', icon: '📖', label: 'Sight Words' },
    { key: 'd3', icon: '🧊', label: '3D Shapes' },
    { key: 'teen', icon: '🔢', label: 'Teen Words' },
    { key: 'ty', icon: '🔟', label: 'Ty Words' },
    { key: 'spell', icon: '🐝', label: 'Spelling' },
    { key: 'blanks', icon: '📝', label: 'Fill Blanks' },
  ];

  const renderNumQuiz = (list: NumWord[], idx: number, opts: NumWord[], answered: boolean, correct: boolean, score: number, total: number, handleClick: (w: string) => void, fibMode: boolean, fibInput: string, setFibInput: (v: string) => void, fibResult: 'correct' | 'wrong' | null, handleFib: () => void, fibLabel: string) => (
    fibMode ? (
      <div className="text-center">
        <h2 className="mt-5 text-lg font-bold text-slate-900">Type the word for <span className="text-fuchsia-600">{list[idx].num}</span></h2>
        <div className="mt-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-3xl font-black text-fuchsia-700 shadow-inner">{list[idx].num}</div></div>
        {fibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
        {fibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {list[idx].word}</div>}
        <div className="mt-4 flex flex-col items-center gap-3">
          <input type="text" value={fibInput} onChange={(e) => setFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !answered) handleFib(); }} placeholder={fibLabel} disabled={answered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
          <div className="flex gap-2">
            {!answered ? <button type="button" onClick={handleFib} disabled={!fibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
            : <button type="button" onClick={() => { setTeenIdx((p) => (p + 1) % list.length); setTeenAnswered(false); setTeenFibResult(null); setTeenFibInput(''); setTyIdx((p) => (p + 1) % list.length); setTyAnswered(false); setTyFibResult(null); setTyFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
      </div>
    ) : (
      <div className="text-center">
        <h2 className="mt-5 text-lg font-bold text-slate-900">Find the word for <span className="text-fuchsia-600">{list[idx].num}</span></h2>
        <div className="mt-4 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-3xl font-black text-fuchsia-700 shadow-inner">{list[idx].num}</div></div>
        <button type="button" onClick={() => speak(list[idx].word)} className="mt-2 text-xs text-slate-400 hover:text-slate-600">🔊 Hear it</button>
        {answered && (
          <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {correct ? '✅ Correct!' : `❌ It's ${list[idx].word}`}<span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(list[idx].word) / 1000)}s...</span>
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {opts.map((opt) => (
            <button key={opt.word} type="button" onClick={() => handleClick(opt.word)} disabled={answered} className={`rounded-2xl border-2 px-5 py-3 text-base font-bold transition ${answered && opt.word === list[idx].word ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : answered && opt !== list[idx] ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-fuchsia-300 hover:bg-fuchsia-50'}`}>{opt.word}</button>
          ))}
        </div>
        <div className="mt-4 text-sm text-slate-500">Score: {score}/{total}</div>
      </div>
    )
  );

  const renderMemoConfig = (running: boolean, locked: boolean, repeat: number, setRepeat: (n: number) => void, loop: boolean, setLoop: (v: boolean) => void, start: () => void, stop: () => void, lock: () => void, title: string) => (
    locked ? null : !running ? (
      <div className="mt-5 space-y-5 text-center">
        <h2 className="text-lg font-bold text-slate-900">🔄 {title}</h2>
        <p className="text-sm text-slate-600">Watch and listen as items are shown, spelled, and named automatically.</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRepeat(Math.max(1, repeat - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
            <span className="w-8 text-center text-lg font-black text-fuchsia-700">{repeat}</span>
            <button type="button" onClick={() => setRepeat(Math.min(10, repeat + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
          </div>
          <span className="text-xs text-slate-400">times</span>
        </div>
        <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
        <button type="button" onClick={start} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
      </div>
    ) : (
      <div className="mt-5 space-y-5 text-center">
        <p className="text-2xl font-black text-slate-900">{/* label rendered by caller */}</p>
        <button type="button" onClick={stop} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
      </div>
    )
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8 pb-32 md:pb-24">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Ages 3-6 • Early Learning</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">⭐ Fun Learning for Kids</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Learn shapes, colors, sight words, 3D shapes, spelling, and more with sounds and colorful games!</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {!parentLocked ? (
              <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
            ) : <div />}
            {!parentLocked ? (
              <button type="button" onClick={handleParentLock} className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-4 w-4" /> Parent Lock</button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">🔒 Locked</span>
                <input type="number" value={parentUnlockInput} onChange={(e) => { setParentUnlockInput(e.target.value); setParentUnlockError(false); }} onKeyDown={(e) => { if (e.key === 'Enter') handleParentUnlock(); }} placeholder={`What is ${mathNum1} ${mathOp === 'plus' ? '+' : '−'} ${mathNum2}?`} className="w-28 rounded-xl border border-slate-300 px-3 py-1.5 text-center text-xs outline-none" />
                <button type="button" onClick={handleParentUnlock} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700">Unlock</button>
                {parentUnlockError && <span className="text-xs text-rose-500">Wrong!</span>}
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => {
                setTab(t.key);
                setShapeAnswered(false); setShapeCorrect(false); setShapeScore(0); setShapeTotal(0); setSMemoRunning(false); setSMemoLocked(false);
                setColorAnswered(false); setColorCorrect(false); setColorScore(0); setColorTotal(0); setColorQuiz(false);
                setSightAnswered(false); setSightCorrect(false); setSightScore(0); setSightTotal(0);
                setD3Answered(false); setD3Correct(false); setD3Score(0); setD3Total(0); setD3MemoRunning(false); setD3MemoLocked(false); setD3FibResult(null); setD3FibInput('');
                setSpellAnswered(false); setSpellCorrect(false); setSpellScore(0); setSpellTotal(0);
                setFbAnswered(false); setFbCorrect(false); setFbScore(0); setFbTotal(0); setFbSelected(null);
                setTeenAnswered(false); setTeenCorrect(false); setTeenScore(0); setTeenTotal(0); setTeenMemoRunning(false); setTeenMemoLocked(false); setTeenFibResult(null); setTeenFibInput('');
                setTyAnswered(false); setTyCorrect(false); setTyScore(0); setTyTotal(0); setTyMemoRunning(false); setTyMemoLocked(false); setTyFibResult(null); setTyFibInput('');
                if (t.key === 'shapes') setShapeIdx(Math.floor(Math.random() * shapes.length));
                if (t.key === 'colors') setColorIdx(Math.floor(Math.random() * COLORS.length));
                if (t.key === 'sight') setSightIdx(Math.floor(Math.random() * SIGHT_WORDS.length));
                if (t.key === 'd3') setD3Idx(Math.floor(Math.random() * shape3dList.length));
                if (t.key === 'spell') setSpellIdx(Math.floor(Math.random() * SPELL_WORDS.length));
                if (t.key === 'blanks') setFbQIdx(Math.floor(Math.random() * QUESTIONS.length));
                if (t.key === 'teen') setTeenIdx(Math.floor(Math.random() * TEEN_WORDS.length));
                if (t.key === 'ty') setTyIdx(Math.floor(Math.random() * TY_WORDS.length));
              }} className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === t.key ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2D SHAPES */}
        {tab === 'shapes' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setShapeSub(m); setSMemoRunning(false); setShapeAnswered(false); setShapeCorrect(false); setShapeFibResult(null); setShapeFibInput(''); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${shapeSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {shapeSub === 'learn' && sMemoRunning && !sMemoLocked && (
                <button type="button" onClick={() => setSMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {shapeSub === 'quiz' ? (
              <div className="text-center">
                <h2 className="mt-5 text-lg font-bold text-slate-900">Find the {shapes[shapeIdx].label}</h2>
                <button type="button" onClick={() => { speak(shapes[shapeIdx].label); setTimeout(() => spellWord(shapes[shapeIdx].label), 600); }} className="mt-1 text-xs text-slate-400 hover:text-slate-600">🔊 Hear & spell</button>
                {shapeAnswered && (
                  <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${shapeCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {shapeCorrect ? '✅ Correct!' : `❌ That's a ${shapes[shapeIdx].label}`}<span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(shapes[shapeIdx].label) / 1000)}s...</span>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-4">
                  {[...shapes].sort(() => Math.random() - 0.5).map((shape) => (
                    <button key={shape.id} type="button" onClick={() => handleShapeClick(shape.id)} disabled={shapeAnswered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${shapeAnswered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${shapeAnswered && shape.id === shapes[shapeIdx].id ? 'border-emerald-400' : 'border-transparent'}`}>
                      {shape.render(s2)}<span className="text-xs font-bold text-slate-700">{shape.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {shapeScore}/{shapeTotal}</div>
              </div>
            ) : shapeSub === 'fib' ? (
              <div className="text-center">
                <h2 className="mt-5 text-lg font-bold text-slate-900">Type the Shape Name</h2>
                <div className="mt-4 flex justify-center"><div className={`rounded-3xl p-8 ${shapes[shapeIdx].bg} border-2 border-transparent`}>{shapes[shapeIdx].render(100)}</div></div>
                {shapeFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {shapeFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {shapes[shapeIdx].label}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={shapeFibInput} onChange={(e) => setShapeFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !shapeAnswered) handleShapeFib(); }} placeholder="Type the shape name..." disabled={shapeAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!shapeAnswered ? <button type="button" onClick={handleShapeFib} disabled={!shapeFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setShapeIdx((p) => (p + 1) % shapes.length); setShapeAnswered(false); setShapeFibResult(null); setShapeFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {shapeScore}/{shapeTotal}</div>
              </div>
            ) : sMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className={`rounded-3xl p-8 ${shapes[sMemoIdx].bg} border-2 border-transparent`}>{shapes[sMemoIdx].render(120)}</div></div>
                <p className="text-2xl font-black text-slate-900">{shapes[sMemoIdx].label}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: sMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= sMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setSMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !sMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Shapes</h2>
                <p className="text-sm text-slate-600">Watch and listen as shapes are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each shape:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setSMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{sMemoRepeat}</span>
                    <button type="button" onClick={() => setSMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={sMemoLoop} onChange={(e) => setSMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setSMemoRunning(true); setSMemoCount(0); setSMemoIdx(0); setSMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Shape {sMemoIdx + 1}/{shapes.length}</span><span>Repeat {sMemoCount + 1}/{sMemoRepeat}</span></div>
                <div className="flex justify-center"><div className={`rounded-3xl p-8 ${shapes[sMemoIdx].bg} border-2 border-transparent transition-all`}>{shapes[sMemoIdx].render(120)}</div></div>
                <p className="text-2xl font-black text-slate-900">{shapes[sMemoIdx].label}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: sMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= sMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <button type="button" onClick={() => setSMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
              </div>
            )}
          </section>
        )}

        {/* COLORS */}
        {tab === 'colors' && (
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
                <button type="button" onClick={() => { const rand = COLORS[Math.floor(Math.random() * COLORS.length)]; setCurrentColor(rand); setColorQuiz(true); setColorAnswered(false); setColorCorrect(false); setColorScore(0); setColorTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Color Quiz</button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900">What color is this?</h2>
                <div className="mt-4 flex justify-center"><div className="h-24 w-24 rounded-3xl shadow-lg transition-all" style={{ backgroundColor: colorHex[currentColor] }} /></div>
                {colorAnswered && (
                  <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${colorCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{colorCorrect ? '✅ Correct!' : `❌ It's ${currentColor}`}</div>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {[...COLORS].sort(() => Math.random() - 0.5).map((c) => (
                    <button key={c} type="button" onClick={() => handleColorClick(c)} disabled={colorAnswered} className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${colorAnswered ? 'opacity-50' : 'hover:scale-110'}`} style={{ backgroundColor: colorHex[c] }}>{c}</button>
                  ))}
                </div>
                {colorAnswered && <button type="button" onClick={() => { setColorIdx((p) => (p + 1) % COLORS.length); setColorAnswered(false); setColorCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Color →</button>}
                <div className="mt-4 text-sm text-slate-500">Score: {colorScore}/{colorTotal}</div>
              </>
            )}
          </section>
        )}

        {/* SIGHT WORDS */}
        {tab === 'sight' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-900">Spell the Word</h2>
            <p className="mt-1 text-sm text-slate-500">{SIGHT_WORDS[sightIdx].hint}</p>
            <button type="button" onClick={() => speak(SIGHT_WORDS[sightIdx].word)} className="mt-1 text-xs text-slate-400 hover:text-slate-600">🔊 Hear it</button>
            {sightAnswered && (
              <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${sightCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{sightCorrect ? '✅ Correct!' : `❌ The word is: ${SIGHT_WORDS[sightIdx].word}`}</div>
            )}
            <div className="mt-4">
              <div className="flex flex-wrap justify-center gap-2">
                {shuffledSight.map((ch, i) => (
                  <button key={i} type="button" onClick={() => setSightInput((p) => p + ch)} disabled={sightAnswered} className="h-10 w-10 rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-50">{ch}</button>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {SIGHT_WORDS[sightIdx].word.split('').map((_, i) => (
                  <div key={i} className="flex h-10 w-8 items-center justify-center rounded-lg border-b-2 border-indigo-300 bg-white text-lg font-bold text-indigo-700">{sightInput[i] || ''}</div>
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-2">
                <button type="button" onClick={() => setSightInput((p) => p.slice(0, -1))} disabled={sightAnswered || !sightInput} className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50">⌫ Back</button>
                {!sightAnswered && <button type="button" onClick={handleSightSubmit} disabled={!sightInput.trim()} className="rounded-xl bg-fuchsia-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-700 disabled:opacity-50">Check</button>}
              </div>
            </div>
            {sightAnswered && <button type="button" onClick={() => { let n: number; do { n = Math.floor(Math.random() * SIGHT_WORDS.length); } while (n === sightIdx && SIGHT_WORDS.length > 1); setSightIdx(n); setSightInput(''); setSightAnswered(false); setSightCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Word →</button>}
            <div className="mt-4 text-sm text-slate-500">Score: {sightScore}/{sightTotal}</div>
          </section>
        )}

        {/* 3D SHAPES */}
        {tab === 'd3' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setD3Mode(m); setD3Answered(false); setD3Correct(false); setD3MemoRunning(false); setD3MemoLocked(false); setD3FibResult(null); setD3FibInput(''); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${d3Mode === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {d3Mode === 'learn' && d3MemoRunning && !d3MemoLocked && (
                <button type="button" onClick={() => setD3MemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {d3Mode === 'quiz' ? (
              <div className="text-center">
                <h2 className="mt-5 text-lg font-bold text-slate-900">Find the {shape3dList[d3Idx].label}</h2>
                <button type="button" onClick={() => { speak(shape3dList[d3Idx].label); setTimeout(() => spellWord(shape3dList[d3Idx].label), 600); }} className="mt-1 text-xs text-slate-400 hover:text-slate-600">🔊 Hear & spell</button>
                {d3Answered && (
                  <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${d3Correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {d3Correct ? '✅ Correct!' : `❌ That's a ${shape3dList[d3Idx].label}`}<span className="ml-2 text-xs font-normal opacity-75">Next in {Math.round(quizDelay(shape3dList[d3Idx].label) / 1000)}s...</span>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-4">
                  {[...shape3dList].sort(() => Math.random() - 0.5).map((shape) => (
                    <button key={shape.id} type="button" onClick={() => handleD3Click(shape.id)} disabled={d3Answered} className={`flex flex-col items-center gap-1.5 rounded-2xl p-4 transition ${d3Answered ? 'opacity-60' : 'hover:scale-110 hover:shadow-md'} ${shape.bg} border-2 ${d3Answered && shape.id === shape3dList[d3Idx].id ? 'border-emerald-400' : 'border-transparent'}`}>
                      {shape.render(s2)}<span className="text-xs font-bold text-slate-700">{shape.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {d3Score}/{d3Total}</div>
              </div>
            ) : d3Mode === 'fib' ? (
              <div className="text-center">
                <h2 className="mt-5 text-lg font-bold text-slate-900">Type the Shape Name</h2>
                <div className="mt-4 flex justify-center"><div className={`rounded-3xl p-8 ${shape3dList[d3Idx].bg} border-2 border-transparent`}>{shape3dList[d3Idx].render(100)}</div></div>
                {d3FibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {d3FibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {shape3dList[d3Idx].label}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={d3FibInput} onChange={(e) => setD3FibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !d3Answered) handleD3Fib(); }} placeholder="Type the shape name..." disabled={d3Answered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!d3Answered ? <button type="button" onClick={handleD3Fib} disabled={!d3FibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setD3Idx((p) => (p + 1) % shape3dList.length); setD3Answered(false); setD3FibResult(null); setD3FibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {d3Score}/{d3Total}</div>
              </div>
            ) : d3MemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className={`rounded-3xl p-8 ${shape3dList[d3MemoIdx].bg} border-2 border-transparent`}>{shape3dList[d3MemoIdx].render(120)}</div></div>
                <p className="text-2xl font-black text-slate-900">{shape3dList[d3MemoIdx].label}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: d3MemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= d3MemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setD3MemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !d3MemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn 3D Shapes</h2>
                <p className="text-sm text-slate-600">Watch and listen as 3D shapes are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each shape:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setD3MemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{d3MemoRepeat}</span>
                    <button type="button" onClick={() => setD3MemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={d3MemoLoop} onChange={(e) => setD3MemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setD3MemoRunning(true); setD3MemoCount(0); setD3MemoIdx(0); setD3MemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Shape {d3MemoIdx + 1}/{shape3dList.length}</span><span>Repeat {d3MemoCount + 1}/{d3MemoRepeat}</span></div>
                <div className="flex justify-center"><div className={`rounded-3xl p-8 ${shape3dList[d3MemoIdx].bg} border-2 border-transparent transition-all`}>{shape3dList[d3MemoIdx].render(120)}</div></div>
                <p className="text-2xl font-black text-slate-900">{shape3dList[d3MemoIdx].label}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: d3MemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= d3MemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <button type="button" onClick={() => setD3MemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
              </div>
            )}
          </section>
        )}

        {/* TEEN WORDS */}
        {tab === 'teen' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setTeenMode(m); setTeenAnswered(false); setTeenCorrect(false); setTeenMemoRunning(false); setTeenMemoLocked(false); setTeenFibResult(null); setTeenFibInput(''); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${teenMode === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {teenMode === 'learn' && teenMemoRunning && !teenMemoLocked && (
                <button type="button" onClick={() => setTeenMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {teenMode === 'quiz' ? (
              <div className="text-center">
                {renderNumQuiz(TEEN_WORDS, teenIdx, teenQuizOpts, teenAnswered, teenCorrect, teenScore, teenTotal, handleTeenQuiz, false, '', () => {}, null, () => {}, '')}
              </div>
            ) : teenMode === 'fib' ? (
              <div className="text-center">
                {renderNumQuiz(TEEN_WORDS, teenIdx, teenQuizOpts, teenAnswered, teenCorrect, teenScore, teenTotal, handleTeenQuiz, true, teenFibInput, setTeenFibInput, teenFibResult, handleTeenFib, 'Type the word...')}
              </div>
            ) : teenMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TEEN_WORDS[teenMemoIdx].num}</div></div>
                <p className="text-2xl font-black text-slate-900">{TEEN_WORDS[teenMemoIdx].word}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: teenMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= teenMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setTeenMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !teenMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔢 Auto Learn Teen Words</h2>
                <p className="text-sm text-slate-600">Watch and listen as teen number words (13-19) are shown, spelled, and named.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTeenMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{teenMemoRepeat}</span>
                    <button type="button" onClick={() => setTeenMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={teenMemoLoop} onChange={(e) => setTeenMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setTeenMemoRunning(true); setTeenMemoCount(0); setTeenMemoIdx(0); setTeenMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Word {teenMemoIdx + 1}/{TEEN_WORDS.length}</span><span>Repeat {teenMemoCount + 1}/{teenMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TEEN_WORDS[teenMemoIdx].num}</div></div>
                <p className="text-2xl font-black text-slate-900">{TEEN_WORDS[teenMemoIdx].word}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: teenMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= teenMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <button type="button" onClick={() => setTeenMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
              </div>
            )}
          </section>
        )}

        {/* TY WORDS */}
        {tab === 'ty' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setTyMode(m); setTyAnswered(false); setTyCorrect(false); setTyMemoRunning(false); setTyMemoLocked(false); setTyFibResult(null); setTyFibInput(''); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${tyMode === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {tyMode === 'learn' && tyMemoRunning && !tyMemoLocked && (
                <button type="button" onClick={() => setTyMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {tyMode === 'quiz' ? (
              <div className="text-center">
                {renderNumQuiz(TY_WORDS, tyIdx, tyQuizOpts, tyAnswered, tyCorrect, tyScore, tyTotal, handleTyQuiz, false, '', () => {}, null, () => {}, '')}
              </div>
            ) : tyMode === 'fib' ? (
              <div className="text-center">
                {renderNumQuiz(TY_WORDS, tyIdx, tyQuizOpts, tyAnswered, tyCorrect, tyScore, tyTotal, handleTyQuiz, true, tyFibInput, setTyFibInput, tyFibResult, handleTyFib, 'Type the word...')}
              </div>
            ) : tyMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TY_WORDS[tyMemoIdx].num}</div></div>
                <p className="text-2xl font-black text-slate-900">{TY_WORDS[tyMemoIdx].word}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: tyMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= tyMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setTyMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !tyMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔟 Auto Learn Ty Words</h2>
                <p className="text-sm text-slate-600">Watch and listen as tens number words (20-90) are shown, spelled, and named.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTyMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{tyMemoRepeat}</span>
                    <button type="button" onClick={() => setTyMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={tyMemoLoop} onChange={(e) => setTyMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setTyMemoRunning(true); setTyMemoCount(0); setTyMemoIdx(0); setTyMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Word {tyMemoIdx + 1}/{TY_WORDS.length}</span><span>Repeat {tyMemoCount + 1}/{tyMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-100 to-purple-100 text-4xl font-black text-fuchsia-700 shadow-inner">{TY_WORDS[tyMemoIdx].num}</div></div>
                <p className="text-2xl font-black text-slate-900">{TY_WORDS[tyMemoIdx].word}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: tyMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= tyMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <button type="button" onClick={() => setTyMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
              </div>
            )}
          </section>
        )}

        {/* SPELLING BEE */}
        {tab === 'spell' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-900">Spell this word</h2>
            <p className="mt-2 text-sm text-slate-500 italic">&ldquo;{SPELL_WORDS[spellIdx].hint}&rdquo;</p>
            <button type="button" onClick={() => { const u = new SpeechSynthesisUtterance(SPELL_WORDS[spellIdx].word); u.lang = 'en-US'; u.rate = 0.7; u.pitch = 1.1; window.speechSynthesis.speak(u); }} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200">🔊 Hear the word</button>
            {spellAnswered && (
              <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ${spellCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{spellCorrect ? "✅ Great job! That's correct!" : `❌ The word is: ${SPELL_WORDS[spellIdx].word}`}</div>
            )}
            <div className="mt-8 flex justify-center gap-2">
              {SPELL_WORDS[spellIdx].word.split('').map((_, i) => (
                <div key={i} className={`flex h-12 w-10 items-center justify-center rounded-xl border-b-2 text-xl font-bold transition-all ${spellSelected[i] ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-300'}`}>{spellSelected[i] || '_'}</div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {spellLetters.map((ch, i) => (
                ch ? <button key={i} type="button" onClick={() => { if (spellAnswered) return; setSpellSelected((p) => [...p, ch]); setSpellLetters((p) => p.map((c, j) => j === i ? '' : c)); }} disabled={spellAnswered} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white shadow transition hover:scale-110 hover:shadow-md disabled:opacity-30">{ch}</button>
                : <div key={i} className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200" />
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => { if (spellAnswered || spellSelected.length === 0) return; const last = spellSelected[spellSelected.length - 1]; setSpellSelected((p) => p.slice(0, -1)); setSpellLetters((p) => { const idx = p.indexOf(''); if (idx === -1) return p; const next = [...p]; next[idx] = last; return next; }); }} disabled={spellAnswered || spellSelected.length === 0} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">⌫ Undo</button>
              {!spellAnswered ? <button type="button" onClick={handleSpellCheck} disabled={spellSelected.length !== SPELL_WORDS[spellIdx].word.length} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">Check Spelling</button>
              : <button type="button" onClick={() => { let n: number; do { n = Math.floor(Math.random() * SPELL_WORDS.length); } while (n === spellIdx && SPELL_WORDS.length > 1); setSpellIdx(n); setSpellInput(''); setSpellAnswered(false); setSpellCorrect(false); setSpellSelected([]); }} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">Next Word →</button>}
            </div>
            <div className="mt-6 text-sm text-slate-500">Score: {spellScore}/{spellTotal}</div>
          </section>
        )}

        {/* FILL IN THE BLANKS */}
        {tab === 'blanks' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-900">Complete the sentence</h2>
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
              <p className="text-xl font-semibold leading-8 text-slate-800">
                {fb_parts[0]}
                <span className={`mx-1 inline-block min-w-[80px] rounded-xl border-b-4 px-3 py-1 text-xl font-bold transition-all ${fbAnswered ? (fbCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700') : 'border-indigo-300 bg-white text-indigo-600'}`}>{fbSelected || '______'}</span>
                {fb_parts[1]}
              </p>
              <button type="button" onClick={() => { const u = new SpeechSynthesisUtterance(fb_q.sentence.replace('___', fb_q.answer)); u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.speak(u); }} className="mt-3 text-xs text-slate-400 hover:text-slate-600">🔊 Read aloud</button>
            </div>
            {fbAnswered && (
              <div className={`mt-4 rounded-2xl p-3 text-sm font-bold ${fbCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{fbCorrect ? '✅ Correct!' : `❌ The answer is "${fb_q.answer}"`}</div>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {fb_q.options.map((opt) => (
                <button key={opt} type="button" onClick={() => { if (fbAnswered) return; setFbSelected(opt); setFbAnswered(true); setFbTotal((p) => p + 1); if (opt === fb_q.answer) { setFbScore((p) => p + 1); setFbCorrect(true); const u = new SpeechSynthesisUtterance(`Correct! ${fb_q.sentence.replace('___', fb_q.answer)}`); u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.speak(u); } else { setFbCorrect(false); const u = new SpeechSynthesisUtterance(`The answer is ${fb_q.answer}. ${fb_q.sentence.replace('___', fb_q.answer)}`); u.lang = 'en-US'; u.rate = 0.85; window.speechSynthesis.speak(u); } }} disabled={fbAnswered}
                  className={`rounded-2xl border-2 px-6 py-3 text-base font-bold transition-all ${fbAnswered && opt === fb_q.answer ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : fbAnswered && opt === fbSelected && opt !== fb_q.answer ? 'border-rose-400 bg-rose-50 text-rose-700' : fbAnswered ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50'}`}>{opt}</button>
              ))}
            </div>
            {fbAnswered && <button type="button" onClick={() => { let n: number; do { n = Math.floor(Math.random() * QUESTIONS.length); } while (n === fbQIdx && QUESTIONS.length > 1); setFbQIdx(n); setFbAnswered(false); setFbCorrect(false); setFbSelected(null); }} className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">Next Question →</button>}
            <div className="mt-6 text-sm text-slate-500">Score: {fbScore}/{fbTotal}</div>
          </section>
        )}

        <footer className="text-center text-xs text-slate-400">Tap 🔊 to hear pronunciation. Ages 3+</footer>
      </div>
    </main>
  );
}
