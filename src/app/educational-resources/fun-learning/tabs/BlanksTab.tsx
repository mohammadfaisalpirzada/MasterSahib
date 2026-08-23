'use client';

import { useState, useEffect } from 'react';
import { speak } from '@/app/lib/learn-utils';

type Question = { sentence: string; blank: string; options: string[]; answer: string };

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

export default function BlanksTab() {
  const [fbQIdx, setFbQIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [fbAnswered, setFbAnswered] = useState(false);
  const [fbCorrect, setFbCorrect] = useState(false);
  const [fbSelected, setFbSelected] = useState<string | null>(null);
  const [fbScore, setFbScore] = useState(0);
  const [fbTotal, setFbTotal] = useState(0);

  const fb_q = QUESTIONS[fbQIdx];
  const fb_parts = fb_q.sentence.split('___');

  useEffect(() => {
    const q = QUESTIONS[fbQIdx];
    const txt = q.sentence.replace('___', 'blank');
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }, 300);
  }, [fbQIdx]);

  useEffect(() => {
    if (!fbAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do {
        n = Math.floor(Math.random() * QUESTIONS.length);
      } while (n === fbQIdx && QUESTIONS.length > 1);
      setFbQIdx(n);
      setFbAnswered(false);
      setFbCorrect(false);
      setFbSelected(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [fbAnswered, fbQIdx]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
      <h2 className="text-lg font-bold text-slate-900">Complete the sentence</h2>
      <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center">
        <p className="text-xl font-semibold leading-8 text-slate-800">
          {fb_parts[0]}
          <span className={`mx-1 inline-block min-w-[80px] rounded-xl border-b-4 px-3 py-1 text-xl font-bold transition-all ${fbAnswered ? (fbCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700') : 'border-indigo-300 bg-white text-indigo-600'}`}>{fbSelected || '______'}</span>
          {fb_parts[1]}
        </p>
        <button
          type="button"
          onClick={() => {
            const u = new SpeechSynthesisUtterance(fb_q.sentence.replace('___', fb_q.answer));
            u.lang = 'en-US';
            u.rate = 0.85;
            window.speechSynthesis.speak(u);
          }}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600"
        >
          🔊 Read aloud
        </button>
      </div>
      {fbAnswered && <div className={`mt-4 rounded-2xl p-3 text-sm font-bold ${fbCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{fbCorrect ? '✅ Correct!' : `❌ The answer is "${fb_q.answer}"`}</div>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {fb_q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (fbAnswered) return;
              setFbSelected(opt);
              setFbAnswered(true);
              setFbTotal((p) => p + 1);
              if (opt === fb_q.answer) {
                setFbScore((p) => p + 1);
                setFbCorrect(true);
                const u = new SpeechSynthesisUtterance(`Correct! ${fb_q.sentence.replace('___', fb_q.answer)}`);
                u.lang = 'en-US';
                u.rate = 0.85;
                window.speechSynthesis.speak(u);
              } else {
                setFbCorrect(false);
                const u = new SpeechSynthesisUtterance(`The answer is ${fb_q.answer}. ${fb_q.sentence.replace('___', fb_q.answer)}`);
                u.lang = 'en-US';
                u.rate = 0.85;
                window.speechSynthesis.speak(u);
              }
            }}
            disabled={fbAnswered}
            className={`rounded-2xl border-2 px-6 py-3 text-base font-bold transition-all ${fbAnswered && opt === fb_q.answer ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : fbAnswered && opt === fbSelected && opt !== fb_q.answer ? 'border-rose-400 bg-rose-50 text-rose-700' : fbAnswered ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50' : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {fbAnswered && (
        <button
          type="button"
          onClick={() => {
            let n: number;
            do {
              n = Math.floor(Math.random() * QUESTIONS.length);
            } while (n === fbQIdx && QUESTIONS.length > 1);
            setFbQIdx(n);
            setFbAnswered(false);
            setFbCorrect(false);
            setFbSelected(null);
          }}
          className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Next Question →
        </button>
      )}
      <div className="mt-6 text-sm text-slate-500">
        Score: {fbScore}/{fbTotal}
      </div>
    </section>
  );
}
