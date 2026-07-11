'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'White', 'Black', 'Brown', 'Purple'];
const colors = COLORS.map((c) => ({ name: c }));
const colorHex: Record<string, string> = { Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#eab308', Orange: '#f97316', Pink: '#ec4899', White: '#f8fafc', Black: '#1e293b', Brown: '#a16207', Purple: '#a855f7' };

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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type WordItem = { name: string; emoji: string };
const VEGETABLES: WordItem[] = [
  { name: 'Potato', emoji: '🥔' }, { name: 'Tomato', emoji: '🍅' }, { name: 'Cabbage', emoji: '🥬' },
  { name: 'Radish', emoji: '🥕' }, { name: 'Carrot', emoji: '🥕' }, { name: 'Ladyfinger', emoji: '🥒' },
  { name: 'Peas', emoji: '🫛' }, { name: 'Onion', emoji: '🧅' }, { name: 'Brinjal', emoji: '🍆' },
  { name: 'Cucumber', emoji: '🥒' },
];
const GARDEN: WordItem[] = [
  { name: 'Grass', emoji: '🌿' }, { name: 'Flower', emoji: '🌸' }, { name: 'Tree', emoji: '🌳' },
  { name: 'Bench', emoji: '🪑' }, { name: 'Butterfly', emoji: '🦋' }, { name: 'Bird', emoji: '🐦' },
  { name: 'Swing', emoji: '🎠' }, { name: 'Stone', emoji: '🪨' }, { name: 'Fence', emoji: '🪵' },
  { name: 'Fountain', emoji: '⛲' },
];
const KITCHEN: WordItem[] = [
  { name: 'Stove', emoji: '🔥' }, { name: 'Oven', emoji: '🔥' }, { name: 'Plate', emoji: '🍽️' },
  { name: 'Pan', emoji: '🍳' }, { name: 'Bowl', emoji: '🥣' }, { name: 'Glass', emoji: '🥛' },
  { name: 'Jug', emoji: '🏺' }, { name: 'Spoon', emoji: '🥄' }, { name: 'Fork', emoji: '🍴' },
  { name: 'Kettle', emoji: '🫖' },
];

const OCCUPATIONS: WordItem[] = [
  { name: 'Doctor', emoji: '👨‍⚕️' }, { name: 'Teacher', emoji: '👩‍🏫' }, { name: 'Pilot', emoji: '👨‍✈️' },
  { name: 'Carpenter', emoji: '🪚' }, { name: 'Farmer', emoji: '👨‍🌾' }, { name: 'Tailor', emoji: '🧵' },
  { name: 'Barber', emoji: '💈' }, { name: 'Butcher', emoji: '🥩' }, { name: 'Cobbler', emoji: '👞' },
  { name: 'Policeman', emoji: '👮' },
];

const BIRDS: WordItem[] = [
  { name: 'Parrot', emoji: '🦜' }, { name: 'Peacock', emoji: '🦚' }, { name: 'Sparrow', emoji: '🐦' },
  { name: 'Ostrich', emoji: '🦩' }, { name: 'Robin', emoji: '🐦' }, { name: 'Crow', emoji: '🐦‍⬛' },
  { name: 'Penguin', emoji: '🐧' }, { name: 'Eagle', emoji: '🦅' }, { name: 'Pigeon', emoji: '🕊️' },
  { name: 'Owl', emoji: '🦉' },
];

const ANIMALS: WordItem[] = [
  { name: 'Cat', emoji: '🐱' }, { name: 'Dog', emoji: '🐶' }, { name: 'Lion', emoji: '🦁' },
  { name: 'Tiger', emoji: '🐯' }, { name: 'Fox', emoji: '🦊' }, { name: 'Monkey', emoji: '🐵' },
  { name: 'Horse', emoji: '🐴' }, { name: 'Donkey', emoji: '🫏' }, { name: 'Leopard', emoji: '🐆' },
  { name: 'Markhor', emoji: '🐐' }, { name: 'Elephant', emoji: '🐘' }, { name: 'Kangaroo', emoji: '🦘' },
  { name: 'Rabbit', emoji: '🐰' }, { name: 'Giraffe', emoji: '🦒' }, { name: 'Zebra', emoji: '🦓' },
  { name: 'Cow', emoji: '🐄' }, { name: 'Sheep', emoji: '🐑' }, { name: 'Goat', emoji: '🐐' },
  { name: 'Crocodile', emoji: '🐊' }, { name: 'Camel', emoji: '🐪' },
];

const MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getQuizOptions(list: NumWord[], correctIdx: number): NumWord[] {
  const opts = [list[correctIdx]];
  const pool = list.filter((_, i) => i !== correctIdx);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  opts.push(pool[0], pool[1], pool[2]);
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return opts;
}

const quizDelay = (label: string) => 800 + label.length * 860 + 1000 + 1500;

type Tab = 'shapes' | 'colors' | 'sight' | 'd3' | 'spell' | 'blanks' | 'teen' | 'ty' | 'days' | 'veg' | 'garden' | 'kitchen' | 'occupation' | 'birds' | 'animals' | 'months';

export default function FunLearningPage() {
  const [tab, setTab] = useState<Tab>('shapes');
  const [showAllTabs, setShowAllTabs] = useState(false);
  const [mobileTabs, setMobileTabs] = useState<Tab[]>([]);

  useEffect(() => {
    const others = tabs.filter(t => t.key !== tab).map(t => t.key);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const pick = [tab, ...shuffled.slice(0, 2)];
    setMobileTabs(pick.sort(() => Math.random() - 0.5));
  }, [tab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab') as Tab | null;
    if (t && ['shapes','colors','sight','d3','teen','ty','spell','blanks','days','veg','garden','kitchen','occupation','birds','animals','months'].includes(t)) {
      setTab(t);
    }
  }, []);

  // Parent lock state
  const [parentLocked, setParentLocked] = useState(false);
  const [parentUnlockInput, setParentUnlockInput] = useState('');
  const [parentUnlockError, setParentUnlockError] = useState(false);
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'plus' | 'minus'>('plus');
  const [mathAnswer, setMathAnswer] = useState(0);
  const lockedAtRef = useRef(0);

  const generateMathProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * a) + 1;
    const op = Math.random() < 0.5 ? 'plus' as const : 'minus' as const;
    const ans = op === 'plus' ? a + b : a - b;
    setMathNum1(a); setMathNum2(b); setMathOp(op); setMathAnswer(ans);
  }, []);

  const handleParentLock = useCallback(() => {
    lockedAtRef.current = Date.now();
    generateMathProblem();
    setParentLocked(true);
    setParentUnlockInput('');
    setParentUnlockError(false);
    try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); } catch {}
  }, [generateMathProblem]);

  const handleParentUnlock = useCallback(() => {
    if (Date.now() - lockedAtRef.current < 500) return;
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
  const [sMemoPaused, setSMemoPaused] = useState(false);

  // Colors state
  const [colorSub, setColorSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
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
  const [d3MemoPaused, setD3MemoPaused] = useState(false);

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
  const [teenMemoPaused, setTeenMemoPaused] = useState(false);

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
  const [tyMemoPaused, setTyMemoPaused] = useState(false);

  // Days state
  const [daysSub, setDaysSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [daysIdx, setDaysIdx] = useState(0);
  const [daysQuiz, setDaysQuiz] = useState(false);
  const [daysAnswered, setDaysAnswered] = useState(false);
  const [daysCorrect, setDaysCorrect] = useState(false);
  const [daysScore, setDaysScore] = useState(0);
  const [daysTotal, setDaysTotal] = useState(0);
  const [dMemoRunning, setDMemoRunning] = useState(false);
  const [dMemoLocked, setDMemoLocked] = useState(false);
  const [dMemoPaused, setDMemoPaused] = useState(false);
  const [dMemoCount, setDMemoCount] = useState(0);
  const [dMemoRepeat, setDMemoRepeat] = useState(1);
  const [dMemoLoop, setDMemoLoop] = useState(false);
  const [dMemoIdx, setDMemoIdx] = useState(0);
  const [dIntroDone, setDIntroDone] = useState(false);
  const [daysFibResult, setDaysFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [daysFibInput, setDaysFibInput] = useState('');

  // Vegetables state
  const [vegSub, setVegSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [vegIdx, setVegIdx] = useState(0);
  const [vegQuiz, setVegQuiz] = useState(false);
  const [vegAnswered, setVegAnswered] = useState(false);
  const [vegCorrect, setVegCorrect] = useState(false);
  const [vegScore, setVegScore] = useState(0);
  const [vegTotal, setVegTotal] = useState(0);
  const [vMemoRunning, setVMemoRunning] = useState(false);
  const [vMemoLocked, setVMemoLocked] = useState(false);
  const [vMemoPaused, setVMemoPaused] = useState(false);
  const [vMemoCount, setVMemoCount] = useState(0);
  const [vMemoRepeat, setVMemoRepeat] = useState(1);
  const [vMemoLoop, setVMemoLoop] = useState(false);
  const [vMemoIdx, setVMemoIdx] = useState(0);
  const [vegFibResult, setVegFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [vegFibInput, setVegFibInput] = useState('');

  // Garden state
  const [gardenSub, setGardenSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [gardenIdx, setGardenIdx] = useState(0);
  const [gardenQuiz, setGardenQuiz] = useState(false);
  const [gardenAnswered, setGardenAnswered] = useState(false);
  const [gardenCorrect, setGardenCorrect] = useState(false);
  const [gardenScore, setGardenScore] = useState(0);
  const [gardenTotal, setGardenTotal] = useState(0);
  const [gMemoRunning, setGMemoRunning] = useState(false);
  const [gMemoLocked, setGMemoLocked] = useState(false);
  const [gMemoPaused, setGMemoPaused] = useState(false);
  const [gMemoCount, setGMemoCount] = useState(0);
  const [gMemoRepeat, setGMemoRepeat] = useState(1);
  const [gMemoLoop, setGMemoLoop] = useState(false);
  const [gMemoIdx, setGMemoIdx] = useState(0);
  const [gardenFibResult, setGardenFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [gardenFibInput, setGardenFibInput] = useState('');

  // Kitchen state
  const [kitchenSub, setKitchenSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [kitchenIdx, setKitchenIdx] = useState(0);
  const [kitchenQuiz, setKitchenQuiz] = useState(false);
  const [kitchenAnswered, setKitchenAnswered] = useState(false);
  const [kitchenCorrect, setKitchenCorrect] = useState(false);
  const [kitchenScore, setKitchenScore] = useState(0);
  const [kitchenTotal, setKitchenTotal] = useState(0);
  const [kMemoRunning, setKMemoRunning] = useState(false);
  const [kMemoLocked, setKMemoLocked] = useState(false);
  const [kMemoPaused, setKMemoPaused] = useState(false);
  const [kMemoCount, setKMemoCount] = useState(0);
  const [kMemoRepeat, setKMemoRepeat] = useState(1);
  const [kMemoLoop, setKMemoLoop] = useState(false);
  const [kMemoIdx, setKMemoIdx] = useState(0);
  const [kitchenFibResult, setKitchenFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [kitchenFibInput, setKitchenFibInput] = useState('');

  // Occupations state
  const [occSub, setOccSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [occIdx, setOccIdx] = useState(0);
  const [occQuiz, setOccQuiz] = useState(false);
  const [occAnswered, setOccAnswered] = useState(false);
  const [occCorrect, setOccCorrect] = useState(false);
  const [occScore, setOccScore] = useState(0);
  const [occTotal, setOccTotal] = useState(0);
  const [occFibResult, setOccFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [occFibInput, setOccFibInput] = useState('');
  const [occMemoRunning, setOccMemoRunning] = useState(false);
  const [occMemoLocked, setOccMemoLocked] = useState(false);
  const [occMemoPaused, setOccMemoPaused] = useState(false);
  const [occMemoCount, setOccMemoCount] = useState(0);
  const [occMemoRepeat, setOccMemoRepeat] = useState(1);
  const [occMemoLoop, setOccMemoLoop] = useState(false);
  const [occMemoIdx, setOccMemoIdx] = useState(0);

  // Birds state
  const [birdSub, setBirdSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [birdIdx, setBirdIdx] = useState(0);
  const [birdQuiz, setBirdQuiz] = useState(false);
  const [birdAnswered, setBirdAnswered] = useState(false);
  const [birdCorrect, setBirdCorrect] = useState(false);
  const [birdScore, setBirdScore] = useState(0);
  const [birdTotal, setBirdTotal] = useState(0);
  const [birdFibResult, setBirdFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [birdFibInput, setBirdFibInput] = useState('');
  const [birdMemoRunning, setBirdMemoRunning] = useState(false);
  const [birdMemoLocked, setBirdMemoLocked] = useState(false);
  const [birdMemoPaused, setBirdMemoPaused] = useState(false);
  const [birdMemoCount, setBirdMemoCount] = useState(0);
  const [birdMemoRepeat, setBirdMemoRepeat] = useState(1);
  const [birdMemoLoop, setBirdMemoLoop] = useState(false);
  const [birdMemoIdx, setBirdMemoIdx] = useState(0);

  // Animals state
  const [animalSub, setAnimalSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
  const [animalIdx, setAnimalIdx] = useState(0);
  const [animalQuiz, setAnimalQuiz] = useState(false);
  const [animalAnswered, setAnimalAnswered] = useState(false);
  const [animalCorrect, setAnimalCorrect] = useState(false);
  const [animalScore, setAnimalScore] = useState(0);
  const [animalTotal, setAnimalTotal] = useState(0);
  const [animalFibResult, setAnimalFibResult] = useState<'correct' | 'wrong' | null>(null);
  const [animalFibInput, setAnimalFibInput] = useState('');
  const [animalMemoRunning, setAnimalMemoRunning] = useState(false);
  const [animalMemoLocked, setAnimalMemoLocked] = useState(false);
  const [animalMemoPaused, setAnimalMemoPaused] = useState(false);
  const [animalMemoCount, setAnimalMemoCount] = useState(0);
  const [animalMemoRepeat, setAnimalMemoRepeat] = useState(1);
  const [animalMemoLoop, setAnimalMemoLoop] = useState(false);
  const [animalMemoIdx, setAnimalMemoIdx] = useState(0);

  // Months state
  const [monthSub, setMonthSub] = useState<'quiz' | 'learn' | 'fib'>('quiz');
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

  const s2 = 80;

  const anyMemoRunning = (sMemoRunning && !sMemoPaused) || (colorMemoRunning && !colorMemoPaused) || (d3MemoRunning && !d3MemoPaused) || (teenMemoRunning && !teenMemoPaused) || (tyMemoRunning && !tyMemoPaused) || (dMemoRunning && !dMemoPaused) || (vMemoRunning && !vMemoPaused) || (gMemoRunning && !gMemoPaused) || (kMemoRunning && !kMemoPaused) || (occMemoRunning && !occMemoPaused) || (birdMemoRunning && !birdMemoPaused) || (animalMemoRunning && !animalMemoPaused) || (monthMemoRunning && !monthMemoPaused);

  useEffect(() => {
    let wakeLock: any = null;
    if (anyMemoRunning) {
      (async () => { try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); } catch {} })();
    }
    return () => { if (wakeLock) { (wakeLock as any).release().catch(() => {}); } };
  }, [anyMemoRunning]);

  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) { window.speechSynthesis.cancel(); }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

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
    if (!sMemoRunning || sMemoPaused) return;
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
  }, [sMemoRunning, sMemoPaused, sMemoIdx, sMemoCount, sMemoRepeat, sMemoLoop, sMemoLocked]);

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
    if (!d3MemoRunning || d3MemoPaused) return;
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
  }, [d3MemoRunning, d3MemoPaused, d3MemoIdx, d3MemoCount, d3MemoRepeat, d3MemoLoop, d3MemoLocked]);

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
    if (!teenMemoRunning || teenMemoPaused) return;
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
  }, [teenMemoRunning, teenMemoPaused, teenMemoIdx, teenMemoCount, teenMemoRepeat, teenMemoLoop, teenMemoLocked]);

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
    if (!tyMemoRunning || tyMemoPaused) return;
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
  }, [tyMemoRunning, tyMemoPaused, tyMemoIdx, tyMemoCount, tyMemoRepeat, tyMemoLoop, tyMemoLocked]);

  // Days memo effect
  useEffect(() => {
    if (!dMemoRunning || dMemoPaused) return;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    if (!dIntroDone) {
      speak('There are seven days in a week.');
      const t = setTimeout(() => { setDIntroDone(true); }, 3000);
      return () => clearTimeout(t);
    }
    const item = DAYS[dMemoIdx];
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setDMemoCount((c) => {
        const next = c + 1;
        if (next >= dMemoRepeat) {
          const nextIdx = (dMemoIdx + 1) % DAYS.length;
          if (nextIdx === 0 && !dMemoLoop) { setDMemoRunning(false); return 0; }
          setDMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [dMemoRunning, dMemoPaused, dMemoLocked, dMemoIdx, dMemoCount, dMemoRepeat, dMemoLoop, dIntroDone]);
  // Veg memo effect
  useEffect(() => {
    if (!vMemoRunning || vMemoPaused) return;
    const item = VEGETABLES[vMemoIdx].name;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setVMemoCount((c) => {
        const next = c + 1;
        if (next >= vMemoRepeat) {
          const nextIdx = (vMemoIdx + 1) % VEGETABLES.length;
          if (nextIdx === 0 && !vMemoLoop) { setVMemoRunning(false); return 0; }
          setVMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [vMemoRunning, vMemoPaused, vMemoLocked, vMemoIdx, vMemoCount, vMemoRepeat, vMemoLoop]);
  // Garden memo effect
  useEffect(() => {
    if (!gMemoRunning || gMemoPaused) return;
    const item = GARDEN[gMemoIdx].name;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setGMemoCount((c) => {
        const next = c + 1;
        if (next >= gMemoRepeat) {
          const nextIdx = (gMemoIdx + 1) % GARDEN.length;
          if (nextIdx === 0 && !gMemoLoop) { setGMemoRunning(false); return 0; }
          setGMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [gMemoRunning, gMemoPaused, gMemoLocked, gMemoIdx, gMemoCount, gMemoRepeat, gMemoLoop]);
  // Kitchen memo effect
  useEffect(() => {
    if (!kMemoRunning || kMemoPaused) return;
    const item = KITCHEN[kMemoIdx].name;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setKMemoCount((c) => {
        const next = c + 1;
        if (next >= kMemoRepeat) {
          const nextIdx = (kMemoIdx + 1) % KITCHEN.length;
          if (nextIdx === 0 && !kMemoLoop) { setKMemoRunning(false); return 0; }
          setKMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [kMemoRunning, kMemoPaused, kMemoLocked, kMemoIdx, kMemoCount, kMemoRepeat, kMemoLoop]);

  // Occupations memo effect
  useEffect(() => {
    if (!occMemoRunning || occMemoPaused) return;
    const item = OCCUPATIONS[occMemoIdx].name;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setOccMemoCount((c) => {
        const next = c + 1;
        if (next >= occMemoRepeat) {
          const nextIdx = (occMemoIdx + 1) % OCCUPATIONS.length;
          if (nextIdx === 0 && !occMemoLoop) { setOccMemoRunning(false); return 0; }
          setOccMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [occMemoRunning, occMemoPaused, occMemoLocked, occMemoIdx, occMemoCount, occMemoRepeat, occMemoLoop]);

  // Birds memo effect
  useEffect(() => {
    if (!birdMemoRunning || birdMemoPaused) return;
    const item = BIRDS[birdMemoIdx].name;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setBirdMemoCount((c) => {
        const next = c + 1;
        if (next >= birdMemoRepeat) {
          const nextIdx = (birdMemoIdx + 1) % BIRDS.length;
          if (nextIdx === 0 && !birdMemoLoop) { setBirdMemoRunning(false); return 0; }
          setBirdMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [birdMemoRunning, birdMemoPaused, birdMemoLocked, birdMemoIdx, birdMemoCount, birdMemoRepeat, birdMemoLoop]);

  // Animals memo effect
  useEffect(() => {
    if (!animalMemoRunning || animalMemoPaused) return;
    const item = ANIMALS[animalMemoIdx].name;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setAnimalMemoCount((c) => {
        const next = c + 1;
        if (next >= animalMemoRepeat) {
          const nextIdx = (animalMemoIdx + 1) % ANIMALS.length;
          if (nextIdx === 0 && !animalMemoLoop) { setAnimalMemoRunning(false); return 0; }
          setAnimalMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [animalMemoRunning, animalMemoPaused, animalMemoLocked, animalMemoIdx, animalMemoCount, animalMemoRepeat, animalMemoLoop]);

  // Months memo effect
  useEffect(() => {
    if (!monthMemoRunning || monthMemoPaused) return;
    const letterTime = 680, finalNameTime = 1000, pauseAfter = 3000;
    if (!monthIntroDone) {
      speak('There are twelve months in a year.');
      const t = setTimeout(() => { setMonthIntroDone(true); }, 3000);
      return () => clearTimeout(t);
    }
    const item = MONTHS_LIST[monthMemoIdx];
    const spellTimer = setTimeout(() => spellWord(item), 300);
    const advanceTimer = setTimeout(() => {
      setMonthMemoCount((c) => {
        const next = c + 1;
        if (next >= monthMemoRepeat) {
          const nextIdx = (monthMemoIdx + 1) % MONTHS_LIST.length;
          if (nextIdx === 0 && !monthMemoLoop) { setMonthMemoRunning(false); return 0; }
          setMonthMemoIdx(nextIdx); return 0;
        }
        return next;
      });
    }, 300 + item.length * letterTime + finalNameTime + pauseAfter);
    return () => { clearTimeout(spellTimer); clearTimeout(advanceTimer); };
  }, [monthMemoRunning, monthMemoPaused, monthMemoLocked, monthMemoIdx, monthMemoCount, monthMemoRepeat, monthMemoLoop, monthIntroDone]);

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
        setTimeout(() => {
          speak(item.name);
          const nextCount = colorMemoCount + 1;
          if (nextCount >= colorMemoRepeat) {
            const nextIdx = colorMemoIdx + 1;
            if (nextIdx >= colors.length && !colorMemoLoop) { setColorMemoRunning(false); return; }
            setColorMemoIdx(nextIdx);
            setColorMemoCount(0);
          } else { setColorMemoCount(nextCount); }
          setColorMemoLocked(false);
        }, item.name.length * 680 + 1000);
      };
      spell();
    }, 300);
    return () => clearTimeout(timer);
  }, [colorMemoRunning, colorMemoLocked, colorMemoPaused, colorMemoIdx, colorMemoCount, colorMemoRepeat, colorMemoLoop]);

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

  const handleDaysClick = useCallback((c: string) => { if (daysAnswered) return; setDaysAnswered(true); setDaysTotal((p) => p + 1); if (c === DAYS[daysIdx]) { setDaysScore((p) => p + 1); setDaysCorrect(true); speak(`Yes! ${c}`); } else { setDaysCorrect(false); speak(`This is ${DAYS[daysIdx]}`); } }, [daysAnswered, daysIdx]);
  const handleVegClick = useCallback((c: string) => { if (vegAnswered) return; setVegAnswered(true); setVegTotal((p) => p + 1); if (c === VEGETABLES[vegIdx].name) { setVegScore((p) => p + 1); setVegCorrect(true); speak(`Yes! ${c}`); } else { setVegCorrect(false); speak(`This is ${VEGETABLES[vegIdx].name}`); } }, [vegAnswered, vegIdx]);
  const handleGardenClick = useCallback((c: string) => { if (gardenAnswered) return; setGardenAnswered(true); setGardenTotal((p) => p + 1); if (c === GARDEN[gardenIdx].name) { setGardenScore((p) => p + 1); setGardenCorrect(true); speak(`Yes! ${c}`); } else { setGardenCorrect(false); speak(`This is ${GARDEN[gardenIdx].name}`); } }, [gardenAnswered, gardenIdx]);
  const handleKitchenClick = useCallback((c: string) => { if (kitchenAnswered) return; setKitchenAnswered(true); setKitchenTotal((p) => p + 1); if (c === KITCHEN[kitchenIdx].name) { setKitchenScore((p) => p + 1); setKitchenCorrect(true); speak(`Yes! ${c}`); } else { setKitchenCorrect(false); speak(`This is ${KITCHEN[kitchenIdx].name}`); } }, [kitchenAnswered, kitchenIdx]);
  const handleDaysFib = useCallback(() => {
    if (daysAnswered || !daysFibInput.trim()) return;
    setDaysAnswered(true); setDaysTotal(p => p + 1);
    if (daysFibInput.trim().toLowerCase() === DAYS[daysIdx].toLowerCase()) { setDaysScore(p => p + 1); setDaysCorrect(true); setDaysFibResult('correct'); speak(`Yes! ${DAYS[daysIdx]}`); }
    else { setDaysFibResult('wrong'); setDaysCorrect(false); speak(`This is ${DAYS[daysIdx]}`); }
  }, [daysAnswered, daysFibInput, daysIdx]);
  const handleVegFib = useCallback(() => {
    if (vegAnswered || !vegFibInput.trim()) return;
    setVegAnswered(true); setVegTotal(p => p + 1);
    if (vegFibInput.trim().toLowerCase() === VEGETABLES[vegIdx].name.toLowerCase()) { setVegScore(p => p + 1); setVegCorrect(true); setVegFibResult('correct'); speak(`Yes! ${VEGETABLES[vegIdx].name}`); }
    else { setVegFibResult('wrong'); setVegCorrect(false); speak(`This is ${VEGETABLES[vegIdx].name}`); }
  }, [vegAnswered, vegFibInput, vegIdx]);
  const handleGardenFib = useCallback(() => {
    if (gardenAnswered || !gardenFibInput.trim()) return;
    setGardenAnswered(true); setGardenTotal(p => p + 1);
    if (gardenFibInput.trim().toLowerCase() === GARDEN[gardenIdx].name.toLowerCase()) { setGardenScore(p => p + 1); setGardenCorrect(true); setGardenFibResult('correct'); speak(`Yes! ${GARDEN[gardenIdx].name}`); }
    else { setGardenFibResult('wrong'); setGardenCorrect(false); speak(`This is ${GARDEN[gardenIdx].name}`); }
  }, [gardenAnswered, gardenFibInput, gardenIdx]);
  const handleKitchenFib = useCallback(() => {
    if (kitchenAnswered || !kitchenFibInput.trim()) return;
    setKitchenAnswered(true); setKitchenTotal(p => p + 1);
    if (kitchenFibInput.trim().toLowerCase() === KITCHEN[kitchenIdx].name.toLowerCase()) { setKitchenScore(p => p + 1); setKitchenCorrect(true); setKitchenFibResult('correct'); speak(`Yes! ${KITCHEN[kitchenIdx].name}`); }
    else { setKitchenFibResult('wrong'); setKitchenCorrect(false); speak(`This is ${KITCHEN[kitchenIdx].name}`); }
  }, [kitchenAnswered, kitchenFibInput, kitchenIdx]);

  const handleOccClick = useCallback((c: string) => { if (occAnswered) return; setOccAnswered(true); setOccTotal((p) => p + 1); if (c === OCCUPATIONS[occIdx].name) { setOccScore((p) => p + 1); setOccCorrect(true); speak(`Yes! ${c}`); } else { setOccCorrect(false); speak(`This is ${OCCUPATIONS[occIdx].name}`); } }, [occAnswered, occIdx]);
  const handleBirdClick = useCallback((c: string) => { if (birdAnswered) return; setBirdAnswered(true); setBirdTotal((p) => p + 1); if (c === BIRDS[birdIdx].name) { setBirdScore((p) => p + 1); setBirdCorrect(true); speak(`Yes! ${c}`); } else { setBirdCorrect(false); speak(`This is ${BIRDS[birdIdx].name}`); } }, [birdAnswered, birdIdx]);
  const handleAnimalClick = useCallback((c: string) => { if (animalAnswered) return; setAnimalAnswered(true); setAnimalTotal((p) => p + 1); if (c === ANIMALS[animalIdx].name) { setAnimalScore((p) => p + 1); setAnimalCorrect(true); speak(`Yes! ${c}`); } else { setAnimalCorrect(false); speak(`This is ${ANIMALS[animalIdx].name}`); } }, [animalAnswered, animalIdx]);
  const handleMonthClick = useCallback((c: string) => { if (monthAnswered) return; setMonthAnswered(true); setMonthTotal((p) => p + 1); if (c === MONTHS_LIST[monthIdx]) { setMonthScore((p) => p + 1); setMonthCorrect(true); speak(`Yes! ${c}`); } else { setMonthCorrect(false); speak(`This is ${MONTHS_LIST[monthIdx]}`); } }, [monthAnswered, monthIdx]);

  const handleOccFib = useCallback(() => {
    if (occAnswered || !occFibInput.trim()) return;
    setOccAnswered(true); setOccTotal(p => p + 1);
    if (occFibInput.trim().toLowerCase() === OCCUPATIONS[occIdx].name.toLowerCase()) { setOccScore(p => p + 1); setOccCorrect(true); setOccFibResult('correct'); speak(`Yes! ${OCCUPATIONS[occIdx].name}`); }
    else { setOccFibResult('wrong'); setOccCorrect(false); speak(`This is ${OCCUPATIONS[occIdx].name}`); }
  }, [occAnswered, occFibInput, occIdx]);
  const handleBirdFib = useCallback(() => {
    if (birdAnswered || !birdFibInput.trim()) return;
    setBirdAnswered(true); setBirdTotal(p => p + 1);
    if (birdFibInput.trim().toLowerCase() === BIRDS[birdIdx].name.toLowerCase()) { setBirdScore(p => p + 1); setBirdCorrect(true); setBirdFibResult('correct'); speak(`Yes! ${BIRDS[birdIdx].name}`); }
    else { setBirdFibResult('wrong'); setBirdCorrect(false); speak(`This is ${BIRDS[birdIdx].name}`); }
  }, [birdAnswered, birdFibInput, birdIdx]);
  const handleAnimalFib = useCallback(() => {
    if (animalAnswered || !animalFibInput.trim()) return;
    setAnimalAnswered(true); setAnimalTotal(p => p + 1);
    if (animalFibInput.trim().toLowerCase() === ANIMALS[animalIdx].name.toLowerCase()) { setAnimalScore(p => p + 1); setAnimalCorrect(true); setAnimalFibResult('correct'); speak(`Yes! ${ANIMALS[animalIdx].name}`); }
    else { setAnimalFibResult('wrong'); setAnimalCorrect(false); speak(`This is ${ANIMALS[animalIdx].name}`); }
  }, [animalAnswered, animalFibInput, animalIdx]);
  const handleMonthFib = useCallback(() => {
    if (monthAnswered || !monthFibInput.trim()) return;
    setMonthAnswered(true); setMonthTotal(p => p + 1);
    if (monthFibInput.trim().toLowerCase() === MONTHS_LIST[monthIdx].toLowerCase()) { setMonthScore(p => p + 1); setMonthCorrect(true); setMonthFibResult('correct'); speak(`Yes! ${MONTHS_LIST[monthIdx]}`); }
    else { setMonthFibResult('wrong'); setMonthCorrect(false); speak(`This is ${MONTHS_LIST[monthIdx]}`); }
  }, [monthAnswered, monthFibInput, monthIdx]);

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
    { key: 'days', icon: '📅', label: 'Days' },
    { key: 'veg', icon: '🥦', label: 'Vegetables' },
    { key: 'garden', icon: '🌳', label: 'Garden' },
    { key: 'kitchen', icon: '🍳', label: 'Kitchen' },
    { key: 'occupation', icon: '💼', label: 'Occupations' },
    { key: 'birds', icon: '🐦', label: 'Birds' },
    { key: 'animals', icon: '🐾', label: 'Animals' },
    { key: 'months', icon: '📅', label: 'Months' },
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
      {parentLocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <HiLockClosed className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">Parent Lock</h2>
            <p className="mt-2 text-sm text-slate-500">Solve this to unlock the page</p>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
              <p className="text-2xl font-black text-slate-900">{mathNum1} {mathOp === 'plus' ? '+' : '−'} {mathNum2} = ?</p>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <input type="number" value={parentUnlockInput} onChange={(e) => { setParentUnlockInput(e.target.value); setParentUnlockError(false); }} onKeyDown={(e) => { if (e.key === 'Enter') handleParentUnlock(); }} placeholder="Type your answer" className="w-40 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200" />
              <button type="button" onClick={handleParentUnlock} className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-700">Unlock</button>
              {parentUnlockError && <p className="text-sm font-bold text-rose-500">Wrong answer, try again!</p>}
            </div>
          </div>
        </div>
      )}
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
            ) : <div />}
          </div>
          <div className="hidden md:flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
            {(showAllTabs ? tabs : tabs.slice(0, 8)).map((t) => (
              <button key={t.key} type="button" onClick={() => {
                setTab(t.key);
                setShapeAnswered(false); setShapeCorrect(false); setShapeScore(0); setShapeTotal(0); setSMemoRunning(false); setSMemoPaused(false); setSMemoLocked(false);
                setColorAnswered(false); setColorCorrect(false); setColorScore(0); setColorTotal(0); setColorQuiz(false); setColorMemoRunning(false); setColorMemoPaused(false); setColorMemoLocked(false); setColorFibResult(null); setColorFibInput('');
                setSightAnswered(false); setSightCorrect(false); setSightScore(0); setSightTotal(0);
                setD3Answered(false); setD3Correct(false); setD3Score(0); setD3Total(0); setD3MemoRunning(false); setD3MemoPaused(false); setD3MemoLocked(false); setD3FibResult(null); setD3FibInput('');
                setSpellAnswered(false); setSpellCorrect(false); setSpellScore(0); setSpellTotal(0);
                setFbAnswered(false); setFbCorrect(false); setFbScore(0); setFbTotal(0); setFbSelected(null);
                setTeenAnswered(false); setTeenCorrect(false); setTeenScore(0); setTeenTotal(0); setTeenMemoRunning(false); setTeenMemoPaused(false); setTeenMemoLocked(false); setTeenFibResult(null); setTeenFibInput('');
                setTyAnswered(false); setTyCorrect(false); setTyScore(0); setTyTotal(0); setTyMemoRunning(false); setTyMemoPaused(false); setTyMemoLocked(false); setTyFibResult(null); setTyFibInput('');
                if (t.key === 'shapes') setShapeIdx(Math.floor(Math.random() * shapes.length));
                if (t.key === 'colors') setColorIdx(Math.floor(Math.random() * COLORS.length));
                if (t.key === 'sight') setSightIdx(Math.floor(Math.random() * SIGHT_WORDS.length));
                if (t.key === 'd3') setD3Idx(Math.floor(Math.random() * shape3dList.length));
                if (t.key === 'spell') setSpellIdx(Math.floor(Math.random() * SPELL_WORDS.length));
                if (t.key === 'blanks') setFbQIdx(Math.floor(Math.random() * QUESTIONS.length));
                if (t.key === 'teen') setTeenIdx(Math.floor(Math.random() * TEEN_WORDS.length));
                if (t.key === 'ty') setTyIdx(Math.floor(Math.random() * TY_WORDS.length));
                if (t.key === 'days') { setDaysSub('quiz'); setDaysIdx(Math.floor(Math.random() * DAYS.length)); setDaysQuiz(false); setDaysAnswered(false); setDaysCorrect(false); setDaysScore(0); setDaysTotal(0); setDMemoRunning(false); setDMemoPaused(false); setDMemoLocked(false); setDaysFibResult(null); setDaysFibInput(''); }
                if (t.key === 'veg') { setVegSub('quiz'); setVegIdx(Math.floor(Math.random() * VEGETABLES.length)); setVegQuiz(false); setVegAnswered(false); setVegCorrect(false); setVegScore(0); setVegTotal(0); setVMemoRunning(false); setVMemoPaused(false); setVMemoLocked(false); setVegFibResult(null); setVegFibInput(''); }
                if (t.key === 'garden') { setGardenSub('quiz'); setGardenIdx(Math.floor(Math.random() * GARDEN.length)); setGardenQuiz(false); setGardenAnswered(false); setGardenCorrect(false); setGardenScore(0); setGardenTotal(0); setGMemoRunning(false); setGMemoPaused(false); setGMemoLocked(false); setGardenFibResult(null); setGardenFibInput(''); }
                if (t.key === 'kitchen') { setKitchenSub('quiz'); setKitchenIdx(Math.floor(Math.random() * KITCHEN.length)); setKitchenQuiz(false); setKitchenAnswered(false); setKitchenCorrect(false); setKitchenScore(0); setKitchenTotal(0); setKMemoRunning(false); setKMemoPaused(false); setKMemoLocked(false); setKitchenFibResult(null); setKitchenFibInput(''); }
                if (t.key === 'occupation') { setOccSub('quiz'); setOccIdx(Math.floor(Math.random() * OCCUPATIONS.length)); setOccQuiz(false); setOccAnswered(false); setOccCorrect(false); setOccScore(0); setOccTotal(0); setOccMemoRunning(false); setOccMemoPaused(false); setOccMemoLocked(false); setOccFibResult(null); setOccFibInput(''); }
                if (t.key === 'birds') { setBirdSub('quiz'); setBirdIdx(Math.floor(Math.random() * BIRDS.length)); setBirdQuiz(false); setBirdAnswered(false); setBirdCorrect(false); setBirdScore(0); setBirdTotal(0); setBirdMemoRunning(false); setBirdMemoPaused(false); setBirdMemoLocked(false); setBirdFibResult(null); setBirdFibInput(''); }
                if (t.key === 'animals') { setAnimalSub('quiz'); setAnimalIdx(Math.floor(Math.random() * ANIMALS.length)); setAnimalQuiz(false); setAnimalAnswered(false); setAnimalCorrect(false); setAnimalScore(0); setAnimalTotal(0); setAnimalMemoRunning(false); setAnimalMemoPaused(false); setAnimalMemoLocked(false); setAnimalFibResult(null); setAnimalFibInput(''); }
                if (t.key === 'months') { setMonthSub('quiz'); setMonthIdx(Math.floor(Math.random() * MONTHS_LIST.length)); setMonthQuiz(false); setMonthAnswered(false); setMonthCorrect(false); setMonthScore(0); setMonthTotal(0); setMonthMemoRunning(false); setMonthMemoPaused(false); setMonthMemoLocked(false); setMonthFibResult(null); setMonthFibInput(''); setMonthIntroDone(false); }
              }} className={`rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${tab === t.key ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.icon} {t.label}
              </button>
            ))}
            {!showAllTabs && tabs.length > 8 && (
              <button type="button" onClick={() => setShowAllTabs(true)} className="rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap bg-slate-200 text-slate-600 hover:bg-slate-300 transition">
                +{tabs.length - 8} more
              </button>
            )}
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
              {shapeSub === 'learn' && sMemoRunning && !sMemoLocked && !sMemoPaused && (
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
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setSMemoPaused(p => !p); if (!sMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${sMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{sMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setSMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* COLORS */}
        {tab === 'colors' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setColorSub(m); setColorAnswered(false); setColorCorrect(false); setColorMemoRunning(false); setColorMemoLocked(false); setColorFibResult(null); setColorFibInput(''); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${colorSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {colorSub === 'learn' && colorMemoRunning && !colorMemoLocked && !colorMemoPaused && (
                <button type="button" onClick={() => setColorMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {colorSub === 'quiz' ? (
              <div className="text-center">
                {!colorQuiz ? (
                  <>
                    <h2 className="mt-5 text-lg font-bold text-slate-900">Learn Colors</h2>
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
              </div>
            ) : colorSub === 'fib' ? (
              <div className="text-center">
                <h2 className="mt-5 text-lg font-bold text-slate-900">Type the Color Name</h2>
                <div className="mt-4 flex justify-center"><div className="h-24 w-24 rounded-3xl shadow-lg" style={{ backgroundColor: colorHex[colors[colorIdx].name] }} /></div>
                {colorFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {colorFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {colors[colorIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={colorFibInput} onChange={(e) => setColorFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !colorFibResult) handleColorFibSubmit(); }} placeholder="Type the color name..." disabled={!!colorFibResult} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!colorFibResult ? <button type="button" onClick={handleColorFibSubmit} disabled={!colorFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setColorIdx((p) => (p + 1) % COLORS.length); setColorFibResult(null); setColorFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
              </div>
            ) : colorMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="h-24 w-24 rounded-3xl shadow-lg" style={{ backgroundColor: colorHex[colors[colorMemoIdx % colors.length].name] }} /></div>
                <p className="text-2xl font-black text-slate-900">{colors[colorMemoIdx % colors.length].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: colorMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= colorMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setColorMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !colorMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Colors</h2>
                <p className="text-sm text-slate-600">Watch and listen as colors are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each color:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setColorMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{colorMemoRepeat}</span>
                    <button type="button" onClick={() => setColorMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={colorMemoLoop} onChange={(e) => setColorMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setColorMemoRunning(true); setColorMemoCount(0); setColorMemoIdx(0); setColorMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Color {colorMemoIdx + 1}/{colors.length}</span><span>Repeat {colorMemoCount + 1}/{colorMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="h-24 w-24 rounded-3xl shadow-lg transition-all" style={{ backgroundColor: colorHex[colors[colorMemoIdx % colors.length].name] }} /></div>
                <p className="text-2xl font-black text-slate-900">{colors[colorMemoIdx % colors.length].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: colorMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= colorMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setColorMemoPaused(p => !p); if (!colorMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${colorMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{colorMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setColorMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
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
              {d3Mode === 'learn' && d3MemoRunning && !d3MemoLocked && !d3MemoPaused && (
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
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setD3MemoPaused(p => !p); if (!d3MemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${d3MemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{d3MemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setD3MemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
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
              {teenMode === 'learn' && teenMemoRunning && !teenMemoLocked && !teenMemoPaused && (
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
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setTeenMemoPaused(p => !p); if (!teenMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${teenMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{teenMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setTeenMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
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
              {tyMode === 'learn' && tyMemoRunning && !tyMemoLocked && !tyMemoPaused && (
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
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setTyMemoPaused(p => !p); if (!tyMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${tyMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{tyMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setTyMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* DAYS OF WEEK */}
        {tab === 'days' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setDaysSub(m); setDaysAnswered(false); setDaysCorrect(false); setDaysQuiz(false); setDMemoRunning(false); setDMemoLocked(false); setDaysFibResult(null); setDaysFibInput(''); if (m === 'fib') setDaysQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${daysSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {daysSub === 'learn' && dMemoRunning && !dMemoLocked && !dMemoPaused && (
                <button type="button" onClick={() => setDMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {daysSub === 'quiz' ? (
              <div className="text-center">
                {!daysQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">📅 Days of the Week</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">There are seven days in a week.</p>
                    <p className="mt-1 text-xs text-slate-400">Click a day to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {DAYS.map((d, i) => (
                        <button key={d} type="button" onClick={() => speak(d)} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 px-5 py-3 text-base font-bold text-slate-800 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-xs text-slate-400">Day {i+1}</span><br />{d}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * DAYS.length); setDaysIdx(r); setDaysQuiz(true); setDaysAnswered(false); setDaysCorrect(false); setDaysScore(0); setDaysTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">Which day is this?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-700 shadow-inner">{DAYS[daysIdx].slice(0,2)}</div></div>
                    {daysAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${daysCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{daysCorrect ? '✅ Correct!' : `❌ It's ${DAYS[daysIdx]}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...DAYS].sort(() => Math.random() - 0.5).map((d) => (
                        <button key={d} type="button" onClick={() => handleDaysClick(d)} disabled={daysAnswered} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${daysAnswered ? 'opacity-50' : 'hover:scale-105'} ${daysAnswered && d === DAYS[daysIdx] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{d}</button>
                      ))}
                    </div>
                    {daysAnswered && <button type="button" onClick={() => { setDaysIdx((p) => (p + 1) % DAYS.length); setDaysAnswered(false); setDaysCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next Day →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {daysScore}/{daysTotal}</div>
                  </>
                )}
              </div>
            ) : daysSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Day Name</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-3xl font-black text-indigo-700 shadow-inner">{DAYS[daysIdx].slice(0,3)}</div></div>
                {daysFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {daysFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {DAYS[daysIdx]}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={daysFibInput} onChange={(e) => setDaysFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !daysAnswered) handleDaysFib(); }} placeholder="Type the day name..." disabled={daysAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!daysAnswered ? <button type="button" onClick={handleDaysFib} disabled={!daysFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setDaysIdx((p) => (p + 1) % DAYS.length); setDaysAnswered(false); setDaysFibResult(null); setDaysFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {daysScore}/{daysTotal}</div>
              </div>
            ) : dMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-700 shadow-inner">{DAYS[dMemoIdx].slice(0,2)}</div></div>
                <p className="text-2xl font-black text-slate-900">{DAYS[dMemoIdx]}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: dMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= dMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setDMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !dMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Days</h2>
                <p className="text-sm text-slate-600">Watch and listen as the days are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setDMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{dMemoRepeat}</span>
                    <button type="button" onClick={() => setDMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={dMemoLoop} onChange={(e) => setDMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setDMemoRunning(true); setDMemoCount(0); setDMemoIdx(0); setDMemoLocked(false); setDIntroDone(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Day {dMemoIdx + 1}/{DAYS.length}</span><span>Repeat {dMemoCount + 1}/{dMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-4xl font-black text-indigo-700 shadow-inner">{DAYS[dMemoIdx].slice(0,2)}</div></div>
                <p className="text-2xl font-black text-slate-900">{DAYS[dMemoIdx]}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: dMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= dMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setDMemoPaused(p => !p); if (!dMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${dMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{dMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setDMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* VEGETABLES */}
        {tab === 'veg' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setVegSub(m); setVegAnswered(false); setVegCorrect(false); setVegQuiz(false); setVMemoRunning(false); setVMemoLocked(false); setVegFibResult(null); setVegFibInput(''); if (m === 'fib') setVegQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${vegSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {vegSub === 'learn' && vMemoRunning && !vMemoLocked && !vMemoPaused && (
                <button type="button" onClick={() => setVMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {vegSub === 'quiz' ? (
              <div className="text-center">
                {!vegQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">🥦 Vegetables</h2>
                    <p className="mt-2 text-sm text-slate-600">Click a vegetable to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {VEGETABLES.map((v) => (
                        <button key={v.name} type="button" onClick={() => speak(v.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-3xl">{v.emoji}</span>
                          <span className="text-sm font-bold text-slate-700">{v.name}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * VEGETABLES.length); setVegIdx(r); setVegQuiz(true); setVegAnswered(false); setVegCorrect(false); setVegScore(0); setVegTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">Which vegetable is this?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vegIdx].emoji}</div></div>
                    {vegAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${vegCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{vegCorrect ? '✅ Correct!' : `❌ It's ${VEGETABLES[vegIdx].name}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...VEGETABLES].sort(() => Math.random() - 0.5).map((v) => (
                        <button key={v.name} type="button" onClick={() => handleVegClick(v.name)} disabled={vegAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${vegAnswered ? 'opacity-50' : 'hover:scale-105'} ${vegAnswered && v.name === VEGETABLES[vegIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{v.emoji} {v.name}</button>
                      ))}
                    </div>
                    {vegAnswered && <button type="button" onClick={() => { setVegIdx((p) => (p + 1) % VEGETABLES.length); setVegAnswered(false); setVegCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {vegScore}/{vegTotal}</div>
                  </>
                )}
              </div>
            ) : vegSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Vegetable Name</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vegIdx].emoji}</div></div>
                {vegFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {vegFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {VEGETABLES[vegIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={vegFibInput} onChange={(e) => setVegFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !vegAnswered) handleVegFib(); }} placeholder="Type the name..." disabled={vegAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!vegAnswered ? <button type="button" onClick={handleVegFib} disabled={!vegFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setVegIdx((p) => (p + 1) % VEGETABLES.length); setVegAnswered(false); setVegFibResult(null); setVegFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {vegScore}/{vegTotal}</div>
              </div>
            ) : vMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{VEGETABLES[vMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: vMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= vMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setVMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !vMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Vegetables</h2>
                <p className="text-sm text-slate-600">Watch and listen as vegetables are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setVMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{vMemoRepeat}</span>
                    <button type="button" onClick={() => setVMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={vMemoLoop} onChange={(e) => setVMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setVMemoRunning(true); setVMemoCount(0); setVMemoIdx(Math.floor(Math.random() * VEGETABLES.length)); setVMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Item {vMemoIdx + 1}/{VEGETABLES.length}</span><span>Repeat {vMemoCount + 1}/{vMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{VEGETABLES[vMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{VEGETABLES[vMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: vMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= vMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setVMemoPaused(p => !p); if (!vMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${vMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{vMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setVMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* GARDEN OBJECTS */}
        {tab === 'garden' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setGardenSub(m); setGardenAnswered(false); setGardenCorrect(false); setGardenQuiz(false); setGMemoRunning(false); setGMemoLocked(false); setGardenFibResult(null); setGardenFibInput(''); if (m === 'fib') setGardenQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${gardenSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {gardenSub === 'learn' && gMemoRunning && !gMemoLocked && !gMemoPaused && (
                <button type="button" onClick={() => setGMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {gardenSub === 'quiz' ? (
              <div className="text-center">
                {!gardenQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">🌳 Garden Objects</h2>
                    <p className="mt-2 text-sm text-slate-600">Click an object to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {GARDEN.map((o) => (
                        <button key={o.name} type="button" onClick={() => speak(o.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-3xl">{o.emoji}</span>
                          <span className="text-sm font-bold text-slate-700">{o.name}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * GARDEN.length); setGardenIdx(r); setGardenQuiz(true); setGardenAnswered(false); setGardenCorrect(false); setGardenScore(0); setGardenTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">What is this garden object?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gardenIdx].emoji}</div></div>
                    {gardenAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${gardenCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{gardenCorrect ? '✅ Correct!' : `❌ It's ${GARDEN[gardenIdx].name}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...GARDEN].sort(() => Math.random() - 0.5).map((o) => (
                        <button key={o.name} type="button" onClick={() => handleGardenClick(o.name)} disabled={gardenAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${gardenAnswered ? 'opacity-50' : 'hover:scale-105'} ${gardenAnswered && o.name === GARDEN[gardenIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{o.emoji} {o.name}</button>
                      ))}
                    </div>
                    {gardenAnswered && <button type="button" onClick={() => { setGardenIdx((p) => (p + 1) % GARDEN.length); setGardenAnswered(false); setGardenCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {gardenScore}/{gardenTotal}</div>
                  </>
                )}
              </div>
            ) : gardenSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Garden Object</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gardenIdx].emoji}</div></div>
                {gardenFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {gardenFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {GARDEN[gardenIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={gardenFibInput} onChange={(e) => setGardenFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !gardenAnswered) handleGardenFib(); }} placeholder="Type the name..." disabled={gardenAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!gardenAnswered ? <button type="button" onClick={handleGardenFib} disabled={!gardenFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setGardenIdx((p) => (p + 1) % GARDEN.length); setGardenAnswered(false); setGardenFibResult(null); setGardenFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {gardenScore}/{gardenTotal}</div>
              </div>
            ) : gMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{GARDEN[gMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: gMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= gMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setGMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !gMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Garden</h2>
                <p className="text-sm text-slate-600">Watch and listen as garden objects are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setGMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{gMemoRepeat}</span>
                    <button type="button" onClick={() => setGMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={gMemoLoop} onChange={(e) => setGMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setGMemoRunning(true); setGMemoCount(0); setGMemoIdx(Math.floor(Math.random() * GARDEN.length)); setGMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Item {gMemoIdx + 1}/{GARDEN.length}</span><span>Repeat {gMemoCount + 1}/{gMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-100 text-5xl shadow-inner">{GARDEN[gMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{GARDEN[gMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: gMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= gMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setGMemoPaused(p => !p); if (!gMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${gMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{gMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setGMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* KITCHEN OBJECTS */}
        {tab === 'kitchen' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setKitchenSub(m); setKitchenAnswered(false); setKitchenCorrect(false); setKitchenQuiz(false); setKMemoRunning(false); setKMemoLocked(false); setKitchenFibResult(null); setKitchenFibInput(''); if (m === 'fib') setKitchenQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${kitchenSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {kitchenSub === 'learn' && kMemoRunning && !kMemoLocked && !kMemoPaused && (
                <button type="button" onClick={() => setKMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {kitchenSub === 'quiz' ? (
              <div className="text-center">
                {!kitchenQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">🍳 Kitchen Objects</h2>
                    <p className="mt-2 text-sm text-slate-600">Click an object to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {KITCHEN.map((o) => (
                        <button key={o.name} type="button" onClick={() => speak(o.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-3xl">{o.emoji}</span>
                          <span className="text-sm font-bold text-slate-700">{o.name}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * KITCHEN.length); setKitchenIdx(r); setKitchenQuiz(true); setKitchenAnswered(false); setKitchenCorrect(false); setKitchenScore(0); setKitchenTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">What is this kitchen object?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kitchenIdx].emoji}</div></div>
                    {kitchenAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${kitchenCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{kitchenCorrect ? '✅ Correct!' : `❌ It's ${KITCHEN[kitchenIdx].name}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...KITCHEN].sort(() => Math.random() - 0.5).map((o) => (
                        <button key={o.name} type="button" onClick={() => handleKitchenClick(o.name)} disabled={kitchenAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${kitchenAnswered ? 'opacity-50' : 'hover:scale-105'} ${kitchenAnswered && o.name === KITCHEN[kitchenIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{o.emoji} {o.name}</button>
                      ))}
                    </div>
                    {kitchenAnswered && <button type="button" onClick={() => { setKitchenIdx((p) => (p + 1) % KITCHEN.length); setKitchenAnswered(false); setKitchenCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {kitchenScore}/{kitchenTotal}</div>
                  </>
                )}
              </div>
            ) : kitchenSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Kitchen Object</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kitchenIdx].emoji}</div></div>
                {kitchenFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {kitchenFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {KITCHEN[kitchenIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={kitchenFibInput} onChange={(e) => setKitchenFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !kitchenAnswered) handleKitchenFib(); }} placeholder="Type the name..." disabled={kitchenAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!kitchenAnswered ? <button type="button" onClick={handleKitchenFib} disabled={!kitchenFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setKitchenIdx((p) => (p + 1) % KITCHEN.length); setKitchenAnswered(false); setKitchenFibResult(null); setKitchenFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {kitchenScore}/{kitchenTotal}</div>
              </div>
            ) : kMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{KITCHEN[kMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: kMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= kMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setKMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !kMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Kitchen</h2>
                <p className="text-sm text-slate-600">Watch and listen as kitchen objects are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setKMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{kMemoRepeat}</span>
                    <button type="button" onClick={() => setKMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={kMemoLoop} onChange={(e) => setKMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setKMemoRunning(true); setKMemoCount(0); setKMemoIdx(Math.floor(Math.random() * KITCHEN.length)); setKMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Item {kMemoIdx + 1}/{KITCHEN.length}</span><span>Repeat {kMemoCount + 1}/{kMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 text-5xl shadow-inner">{KITCHEN[kMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{KITCHEN[kMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: kMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= kMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setKMemoPaused(p => !p); if (!kMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${kMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{kMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setKMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* OCCUPATIONS */}
        {tab === 'occupation' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setOccSub(m); setOccAnswered(false); setOccCorrect(false); setOccQuiz(false); setOccMemoRunning(false); setOccMemoLocked(false); setOccFibResult(null); setOccFibInput(''); if (m === 'fib') setOccQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${occSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {occSub === 'learn' && occMemoRunning && !occMemoLocked && !occMemoPaused && (
                <button type="button" onClick={() => setOccMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {occSub === 'quiz' ? (
              <div className="text-center">
                {!occQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">💼 Occupations</h2>
                    <p className="mt-2 text-sm text-slate-600">Click an occupation to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {OCCUPATIONS.map((o) => (
                        <button key={o.name} type="button" onClick={() => speak(o.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-3xl">{o.emoji}</span>
                          <span className="text-sm font-bold text-slate-700">{o.name}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * OCCUPATIONS.length); setOccIdx(r); setOccQuiz(true); setOccAnswered(false); setOccCorrect(false); setOccScore(0); setOccTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">Which occupation is this?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occIdx].emoji}</div></div>
                    {occAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${occCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{occCorrect ? '✅ Correct!' : `❌ It's ${OCCUPATIONS[occIdx].name}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...OCCUPATIONS].sort(() => Math.random() - 0.5).map((o) => (
                        <button key={o.name} type="button" onClick={() => handleOccClick(o.name)} disabled={occAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${occAnswered ? 'opacity-50' : 'hover:scale-105'} ${occAnswered && o.name === OCCUPATIONS[occIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{o.emoji} {o.name}</button>
                      ))}
                    </div>
                    {occAnswered && <button type="button" onClick={() => { setOccIdx((p) => (p + 1) % OCCUPATIONS.length); setOccAnswered(false); setOccCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {occScore}/{occTotal}</div>
                  </>
                )}
              </div>
            ) : occSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Occupation Name</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occIdx].emoji}</div></div>
                {occFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {occFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {OCCUPATIONS[occIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={occFibInput} onChange={(e) => setOccFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !occAnswered) handleOccFib(); }} placeholder="Type the name..." disabled={occAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!occAnswered ? <button type="button" onClick={handleOccFib} disabled={!occFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setOccIdx((p) => (p + 1) % OCCUPATIONS.length); setOccAnswered(false); setOccFibResult(null); setOccFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {occScore}/{occTotal}</div>
              </div>
            ) : occMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{OCCUPATIONS[occMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: occMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= occMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setOccMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !occMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Occupations</h2>
                <p className="text-sm text-slate-600">Watch and listen as occupations are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setOccMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{occMemoRepeat}</span>
                    <button type="button" onClick={() => setOccMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={occMemoLoop} onChange={(e) => setOccMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setOccMemoRunning(true); setOccMemoCount(0); setOccMemoIdx(Math.floor(Math.random() * OCCUPATIONS.length)); setOccMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Item {occMemoIdx + 1}/{OCCUPATIONS.length}</span><span>Repeat {occMemoCount + 1}/{occMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-5xl shadow-inner">{OCCUPATIONS[occMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{OCCUPATIONS[occMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: occMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= occMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setOccMemoPaused(p => !p); if (!occMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${occMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{occMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setOccMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* BIRDS */}
        {tab === 'birds' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setBirdSub(m); setBirdAnswered(false); setBirdCorrect(false); setBirdQuiz(false); setBirdMemoRunning(false); setBirdMemoLocked(false); setBirdFibResult(null); setBirdFibInput(''); if (m === 'fib') setBirdQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${birdSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {birdSub === 'learn' && birdMemoRunning && !birdMemoLocked && !birdMemoPaused && (
                <button type="button" onClick={() => setBirdMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {birdSub === 'quiz' ? (
              <div className="text-center">
                {!birdQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">🐦 Birds</h2>
                    <p className="mt-2 text-sm text-slate-600">Click a bird to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {BIRDS.map((b) => (
                        <button key={b.name} type="button" onClick={() => speak(b.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-3xl">{b.emoji}</span>
                          <span className="text-sm font-bold text-slate-700">{b.name}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * BIRDS.length); setBirdIdx(r); setBirdQuiz(true); setBirdAnswered(false); setBirdCorrect(false); setBirdScore(0); setBirdTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">Which bird is this?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdIdx].emoji}</div></div>
                    {birdAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${birdCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{birdCorrect ? '✅ Correct!' : `❌ It's ${BIRDS[birdIdx].name}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...BIRDS].sort(() => Math.random() - 0.5).map((b) => (
                        <button key={b.name} type="button" onClick={() => handleBirdClick(b.name)} disabled={birdAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${birdAnswered ? 'opacity-50' : 'hover:scale-105'} ${birdAnswered && b.name === BIRDS[birdIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{b.emoji} {b.name}</button>
                      ))}
                    </div>
                    {birdAnswered && <button type="button" onClick={() => { setBirdIdx((p) => (p + 1) % BIRDS.length); setBirdAnswered(false); setBirdCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {birdScore}/{birdTotal}</div>
                  </>
                )}
              </div>
            ) : birdSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Bird Name</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdIdx].emoji}</div></div>
                {birdFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {birdFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {BIRDS[birdIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={birdFibInput} onChange={(e) => setBirdFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !birdAnswered) handleBirdFib(); }} placeholder="Type the name..." disabled={birdAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!birdAnswered ? <button type="button" onClick={handleBirdFib} disabled={!birdFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setBirdIdx((p) => (p + 1) % BIRDS.length); setBirdAnswered(false); setBirdFibResult(null); setBirdFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {birdScore}/{birdTotal}</div>
              </div>
            ) : birdMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{BIRDS[birdMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: birdMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= birdMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setBirdMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !birdMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Birds</h2>
                <p className="text-sm text-slate-600">Watch and listen as birds are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setBirdMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{birdMemoRepeat}</span>
                    <button type="button" onClick={() => setBirdMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={birdMemoLoop} onChange={(e) => setBirdMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setBirdMemoRunning(true); setBirdMemoCount(0); setBirdMemoIdx(Math.floor(Math.random() * BIRDS.length)); setBirdMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Item {birdMemoIdx + 1}/{BIRDS.length}</span><span>Repeat {birdMemoCount + 1}/{birdMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 text-5xl shadow-inner">{BIRDS[birdMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{BIRDS[birdMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: birdMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= birdMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setBirdMemoPaused(p => !p); if (!birdMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${birdMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{birdMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setBirdMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ANIMALS */}
        {tab === 'animals' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setAnimalSub(m); setAnimalAnswered(false); setAnimalCorrect(false); setAnimalQuiz(false); setAnimalMemoRunning(false); setAnimalMemoLocked(false); setAnimalFibResult(null); setAnimalFibInput(''); if (m === 'fib') setAnimalQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${animalSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {animalSub === 'learn' && animalMemoRunning && !animalMemoLocked && !animalMemoPaused && (
                <button type="button" onClick={() => setAnimalMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {animalSub === 'quiz' ? (
              <div className="text-center">
                {!animalQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">🐾 Animals</h2>
                    <p className="mt-2 text-sm text-slate-600">Click an animal to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {ANIMALS.map((a) => (
                        <button key={a.name} type="button" onClick={() => speak(a.name)} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-3xl">{a.emoji}</span>
                          <span className="text-sm font-bold text-slate-700">{a.name}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * ANIMALS.length); setAnimalIdx(r); setAnimalQuiz(true); setAnimalAnswered(false); setAnimalCorrect(false); setAnimalScore(0); setAnimalTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">Which animal is this?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalIdx].emoji}</div></div>
                    {animalAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${animalCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{animalCorrect ? '✅ Correct!' : `❌ It's ${ANIMALS[animalIdx].name}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...ANIMALS].sort(() => Math.random() - 0.5).map((a) => (
                        <button key={a.name} type="button" onClick={() => handleAnimalClick(a.name)} disabled={animalAnswered} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${animalAnswered ? 'opacity-50' : 'hover:scale-105'} ${animalAnswered && a.name === ANIMALS[animalIdx].name ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{a.emoji} {a.name}</button>
                      ))}
                    </div>
                    {animalAnswered && <button type="button" onClick={() => { setAnimalIdx((p) => (p + 1) % ANIMALS.length); setAnimalAnswered(false); setAnimalCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {animalScore}/{animalTotal}</div>
                  </>
                )}
              </div>
            ) : animalSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Animal Name</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalIdx].emoji}</div></div>
                {animalFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {animalFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {ANIMALS[animalIdx].name}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={animalFibInput} onChange={(e) => setAnimalFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !animalAnswered) handleAnimalFib(); }} placeholder="Type the name..." disabled={animalAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!animalAnswered ? <button type="button" onClick={handleAnimalFib} disabled={!animalFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setAnimalIdx((p) => (p + 1) % ANIMALS.length); setAnimalAnswered(false); setAnimalFibResult(null); setAnimalFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {animalScore}/{animalTotal}</div>
              </div>
            ) : animalMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{ANIMALS[animalMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: animalMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= animalMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setAnimalMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !animalMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Animals</h2>
                <p className="text-sm text-slate-600">Watch and listen as animals are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAnimalMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{animalMemoRepeat}</span>
                    <button type="button" onClick={() => setAnimalMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={animalMemoLoop} onChange={(e) => setAnimalMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setAnimalMemoRunning(true); setAnimalMemoCount(0); setAnimalMemoIdx(Math.floor(Math.random() * ANIMALS.length)); setAnimalMemoLocked(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Item {animalMemoIdx + 1}/{ANIMALS.length}</span><span>Repeat {animalMemoCount + 1}/{animalMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-5xl shadow-inner">{ANIMALS[animalMemoIdx].emoji}</div></div>
                <p className="text-2xl font-black text-slate-900">{ANIMALS[animalMemoIdx].name}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: animalMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= animalMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setAnimalMemoPaused(p => !p); if (!animalMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${animalMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{animalMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setAnimalMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* MONTHS OF THE YEAR */}
        {tab === 'months' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                {(['quiz', 'learn', 'fib'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => { setMonthSub(m); setMonthAnswered(false); setMonthCorrect(false); setMonthQuiz(false); setMonthMemoRunning(false); setMonthMemoLocked(false); setMonthFibResult(null); setMonthFibInput(''); if (m === 'fib') setMonthQuiz(true); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${monthSub === m ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {m === 'quiz' ? '🎯 Quiz' : m === 'learn' ? '🔄 Auto Learn' : '✏️ Fill the Name'}
                  </button>
                ))}
              </div>
              {monthSub === 'learn' && monthMemoRunning && !monthMemoLocked && !monthMemoPaused && (
                <button type="button" onClick={() => setMonthMemoLocked(true)} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"><HiLockClosed className="h-3.5 w-3.5" /> Lock</button>
              )}
            </div>
            {monthSub === 'quiz' ? (
              <div className="text-center">
                {!monthQuiz ? (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">📅 Months of the Year</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">There are twelve months in a year.</p>
                    <p className="mt-1 text-xs text-slate-400">Click a month to hear its name, then take the quiz!</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {MONTHS_LIST.map((m, i) => (
                        <button key={m} type="button" onClick={() => speak(m)} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-pink-50 to-rose-50 px-5 py-3 text-base font-bold text-slate-800 shadow-sm transition hover:scale-105 hover:shadow-md">
                          <span className="text-xs text-slate-400">Month {i+1}</span><br />{m}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { const r = Math.floor(Math.random() * MONTHS_LIST.length); setMonthIdx(r); setMonthQuiz(true); setMonthAnswered(false); setMonthCorrect(false); setMonthScore(0); setMonthTotal(0); }} className="mt-6 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">🎯 Start Quiz</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-900">Which month is this?</h2>
                    <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-4xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthIdx].slice(0,3)}</div></div>
                    {monthAnswered && (
                      <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${monthCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{monthCorrect ? '✅ Correct!' : `❌ It's ${MONTHS_LIST[monthIdx]}`}</div>
                    )}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {[...MONTHS_LIST].sort(() => Math.random() - 0.5).map((m) => (
                        <button key={m} type="button" onClick={() => handleMonthClick(m)} disabled={monthAnswered} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${monthAnswered ? 'opacity-50' : 'hover:scale-105'} ${monthAnswered && m === MONTHS_LIST[monthIdx] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{m}</button>
                      ))}
                    </div>
                    {monthAnswered && <button type="button" onClick={() => { setMonthIdx((p) => (p + 1) % MONTHS_LIST.length); setMonthAnswered(false); setMonthCorrect(false); }} className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                    <div className="mt-4 text-sm text-slate-500">Score: {monthScore}/{monthTotal}</div>
                  </>
                )}
              </div>
            ) : monthSub === 'fib' ? (
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900">Type the Month Name</h2>
                <div className="mt-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-3xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthIdx].slice(0,3)}</div></div>
                {monthFibResult === 'correct' && <div className="mt-3 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-700">✅ Correct!</div>}
                {monthFibResult === 'wrong' && <div className="mt-3 rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-700">❌ It's {MONTHS_LIST[monthIdx]}</div>}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <input type="text" value={monthFibInput} onChange={(e) => setMonthFibInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !monthAnswered) handleMonthFib(); }} placeholder="Type the month name..." disabled={monthAnswered} className="w-56 scroll-m-20 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200 disabled:opacity-50" />
                  <div className="flex gap-2">
                    {!monthAnswered ? <button type="button" onClick={handleMonthFib} disabled={!monthFibInput.trim()} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-50">Check</button>
                    : <button type="button" onClick={() => { setMonthIdx((p) => (p + 1) % MONTHS_LIST.length); setMonthAnswered(false); setMonthFibResult(null); setMonthFibInput(''); }} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700">Next →</button>}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Score: {monthScore}/{monthTotal}</div>
              </div>
            ) : monthMemoLocked ? (
              <div className="mt-5 space-y-4 text-center">
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-4xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthMemoIdx].slice(0,3)}</div></div>
                <p className="text-2xl font-black text-slate-900">{MONTHS_LIST[monthMemoIdx]}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: monthMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= monthMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center">
                  <button type="button" onClick={() => setMonthMemoLocked(false)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-500 hover:bg-slate-200"><HiLockClosed className="mx-auto h-5 w-5" /><span className="mt-1 block">Unlock</span></button>
                </div>
              </div>
            ) : !monthMemoRunning ? (
              <div className="mt-5 space-y-5 text-center">
                <h2 className="text-lg font-bold text-slate-900">🔄 Auto Learn Months</h2>
                <p className="text-sm text-slate-600">Watch and listen as the months are shown, spelled, and named automatically.</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Repeat each:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setMonthMemoRepeat((p) => Math.max(1, p - 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">−</button>
                    <span className="w-8 text-center text-lg font-black text-fuchsia-700">{monthMemoRepeat}</span>
                    <button type="button" onClick={() => setMonthMemoRepeat((p) => Math.min(10, p + 1))} className="h-8 w-8 rounded-full bg-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-300">+</button>
                  </div>
                  <span className="text-xs text-slate-400">times</span>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={monthMemoLoop} onChange={(e) => setMonthMemoLoop(e.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Loop</label>
                <button type="button" onClick={() => { setMonthMemoRunning(true); setMonthMemoCount(0); setMonthMemoIdx(0); setMonthMemoLocked(false); setMonthIntroDone(false); }} className="rounded-xl bg-fuchsia-600 px-8 py-3 text-base font-bold text-white transition hover:bg-fuchsia-700">▶ Start</button>
              </div>
            ) : (
              <div className="mt-5 space-y-5 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Month {monthMemoIdx + 1}/{MONTHS_LIST.length}</span><span>Repeat {monthMemoCount + 1}/{monthMemoRepeat}</span></div>
                <div className="flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-4xl font-black text-pink-700 shadow-inner">{MONTHS_LIST[monthMemoIdx].slice(0,3)}</div></div>
                <p className="text-2xl font-black text-slate-900">{MONTHS_LIST[monthMemoIdx]}</p>
                <div className="flex justify-center gap-1">{Array.from({ length: monthMemoRepeat }).map((_, i) => (<div key={i} className={`h-2 w-2 rounded-full ${i <= monthMemoCount ? 'bg-fuchsia-500' : 'bg-slate-200'}`} />))}</div>
                <div className="flex justify-center gap-2">
                  <button type="button" onClick={() => { setMonthMemoPaused(p => !p); if (!monthMemoPaused) window.speechSynthesis.cancel(); }} className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${monthMemoPaused ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>{monthMemoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <button type="button" onClick={() => setMonthMemoRunning(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Stop</button>
                </div>
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

        {/* Mobile tabs grid at bottom */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:hidden">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">Switch Tool</p>
          <div className="grid grid-cols-4 gap-2">
            {(showAllTabs ? tabs : mobileTabs.map(k => tabs.find(t => t.key === k)!).filter(Boolean)).map((t) => (
              <button key={t.key} type="button" onClick={() => {
                setTab(t.key);
                setShapeAnswered(false); setShapeCorrect(false); setShapeScore(0); setShapeTotal(0); setSMemoRunning(false); setSMemoPaused(false); setSMemoLocked(false);
                setColorAnswered(false); setColorCorrect(false); setColorScore(0); setColorTotal(0); setColorQuiz(false); setColorMemoRunning(false); setColorMemoPaused(false); setColorMemoLocked(false); setColorFibResult(null); setColorFibInput('');
                setSightAnswered(false); setSightCorrect(false); setSightScore(0); setSightTotal(0);
                setD3Answered(false); setD3Correct(false); setD3Score(0); setD3Total(0); setD3MemoRunning(false); setD3MemoPaused(false); setD3MemoLocked(false); setD3FibResult(null); setD3FibInput('');
                setSpellAnswered(false); setSpellCorrect(false); setSpellScore(0); setSpellTotal(0);
                setFbAnswered(false); setFbCorrect(false); setFbScore(0); setFbTotal(0); setFbSelected(null);
                setTeenAnswered(false); setTeenCorrect(false); setTeenScore(0); setTeenTotal(0); setTeenMemoRunning(false); setTeenMemoPaused(false); setTeenMemoLocked(false); setTeenFibResult(null); setTeenFibInput('');
                setTyAnswered(false); setTyCorrect(false); setTyScore(0); setTyTotal(0); setTyMemoRunning(false); setTyMemoPaused(false); setTyMemoLocked(false); setTyFibResult(null); setTyFibInput('');
                if (t.key === 'shapes') setShapeIdx(Math.floor(Math.random() * shapes.length));
                if (t.key === 'colors') setColorIdx(Math.floor(Math.random() * COLORS.length));
                if (t.key === 'sight') setSightIdx(Math.floor(Math.random() * SIGHT_WORDS.length));
                if (t.key === 'd3') setD3Idx(Math.floor(Math.random() * shape3dList.length));
                if (t.key === 'spell') setSpellIdx(Math.floor(Math.random() * SPELL_WORDS.length));
                if (t.key === 'blanks') setFbQIdx(Math.floor(Math.random() * QUESTIONS.length));
                if (t.key === 'teen') setTeenIdx(Math.floor(Math.random() * TEEN_WORDS.length));
                if (t.key === 'ty') setTyIdx(Math.floor(Math.random() * TY_WORDS.length));
                if (t.key === 'days') { setDaysSub('quiz'); setDaysIdx(Math.floor(Math.random() * DAYS.length)); setDaysQuiz(false); setDaysAnswered(false); setDaysCorrect(false); setDaysScore(0); setDaysTotal(0); setDMemoRunning(false); setDMemoPaused(false); setDMemoLocked(false); setDaysFibResult(null); setDaysFibInput(''); }
                if (t.key === 'veg') { setVegSub('quiz'); setVegIdx(Math.floor(Math.random() * VEGETABLES.length)); setVegQuiz(false); setVegAnswered(false); setVegCorrect(false); setVegScore(0); setVegTotal(0); setVMemoRunning(false); setVMemoPaused(false); setVMemoLocked(false); setVegFibResult(null); setVegFibInput(''); }
                if (t.key === 'garden') { setGardenSub('quiz'); setGardenIdx(Math.floor(Math.random() * GARDEN.length)); setGardenQuiz(false); setGardenAnswered(false); setGardenCorrect(false); setGardenScore(0); setGardenTotal(0); setGMemoRunning(false); setGMemoPaused(false); setGMemoLocked(false); setGardenFibResult(null); setGardenFibInput(''); }
                if (t.key === 'kitchen') { setKitchenSub('quiz'); setKitchenIdx(Math.floor(Math.random() * KITCHEN.length)); setKitchenQuiz(false); setKitchenAnswered(false); setKitchenCorrect(false); setKitchenScore(0); setKitchenTotal(0); setKMemoRunning(false); setKMemoPaused(false); setKMemoLocked(false); setKitchenFibResult(null); setKitchenFibInput(''); }
                if (t.key === 'occupation') { setOccSub('quiz'); setOccIdx(Math.floor(Math.random() * OCCUPATIONS.length)); setOccQuiz(false); setOccAnswered(false); setOccCorrect(false); setOccScore(0); setOccTotal(0); setOccMemoRunning(false); setOccMemoPaused(false); setOccMemoLocked(false); setOccFibResult(null); setOccFibInput(''); }
                if (t.key === 'birds') { setBirdSub('quiz'); setBirdIdx(Math.floor(Math.random() * BIRDS.length)); setBirdQuiz(false); setBirdAnswered(false); setBirdCorrect(false); setBirdScore(0); setBirdTotal(0); setBirdMemoRunning(false); setBirdMemoPaused(false); setBirdMemoLocked(false); setBirdFibResult(null); setBirdFibInput(''); }
                if (t.key === 'animals') { setAnimalSub('quiz'); setAnimalIdx(Math.floor(Math.random() * ANIMALS.length)); setAnimalQuiz(false); setAnimalAnswered(false); setAnimalCorrect(false); setAnimalScore(0); setAnimalTotal(0); setAnimalMemoRunning(false); setAnimalMemoPaused(false); setAnimalMemoLocked(false); setAnimalFibResult(null); setAnimalFibInput(''); }
                if (t.key === 'months') { setMonthSub('quiz'); setMonthIdx(Math.floor(Math.random() * MONTHS_LIST.length)); setMonthQuiz(false); setMonthAnswered(false); setMonthCorrect(false); setMonthScore(0); setMonthTotal(0); setMonthMemoRunning(false); setMonthMemoPaused(false); setMonthMemoLocked(false); setMonthFibResult(null); setMonthFibInput(''); setMonthIntroDone(false); }
              }} className={`flex flex-col items-center gap-0.5 rounded-xl border border-slate-100 px-1 py-2.5 text-center transition ${tab === t.key ? 'border-fuchsia-300 bg-fuchsia-50 shadow-sm' : 'bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                <span className={`text-[10px] font-bold leading-tight ${tab === t.key ? 'text-fuchsia-700' : 'text-slate-600'}`}>{t.label}</span>
              </button>
            ))}
            {!showAllTabs && tabs.length > 3 && (
              <button type="button" onClick={() => setShowAllTabs(true)} className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-slate-200 px-1 py-2.5 text-center transition hover:border-slate-300 hover:bg-slate-50">
                <span className="text-lg leading-none text-slate-400">+{tabs.length - 3}</span>
                <span className="text-[10px] font-bold leading-tight text-slate-400">More</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
