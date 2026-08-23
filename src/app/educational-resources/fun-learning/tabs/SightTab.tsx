'use client';

import { useState, useEffect, useCallback } from 'react';
import { speak } from '@/app/lib/learn-utils';

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

export default function SightTab() {
  const [sightIdx, setSightIdx] = useState(() => Math.floor(Math.random() * SIGHT_WORDS.length));
  const [sightInput, setSightInput] = useState('');
  const [shuffledSight, setShuffledSight] = useState<string[]>([]);
  const [sightScore, setSightScore] = useState(0);
  const [sightTotal, setSightTotal] = useState(0);
  const [sightAnswered, setSightAnswered] = useState(false);
  const [sightCorrect, setSightCorrect] = useState(false);

  useEffect(() => {
    {
      const word = SIGHT_WORDS[sightIdx].word.toLowerCase();
      setShuffledSight(word.split('').sort(() => Math.random() - 0.5));
    }
  }, [sightIdx]);

  const handleSightSubmit = useCallback(() => {
    if (!sightInput.trim()) return;
    setSightTotal((p) => p + 1);
    setSightAnswered(true);
    if (sightInput.trim().toLowerCase() === SIGHT_WORDS[sightIdx].word.toLowerCase()) {
      setSightScore((p) => p + 1);
      setSightCorrect(true);
      speak(`Correct! ${SIGHT_WORDS[sightIdx].word}`);
    } else {
      setSightCorrect(false);
      speak(`The word is ${SIGHT_WORDS[sightIdx].word}`);
    }
  }, [sightInput, sightIdx]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
      <h2 className="text-lg font-bold text-slate-900">Spell the Word</h2>
      <p className="mt-1 text-sm text-slate-500">{SIGHT_WORDS[sightIdx].hint}</p>
      <button type="button" onClick={() => speak(SIGHT_WORDS[sightIdx].word)} className="mt-1 text-xs text-slate-400 hover:text-slate-600">
        🔊 Hear it
      </button>
      {sightAnswered && <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${sightCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{sightCorrect ? '✅ Correct!' : `❌ The word is: ${SIGHT_WORDS[sightIdx].word}`}</div>}
      <div className="mt-4">
        <div className="flex flex-wrap justify-center gap-2">
          {shuffledSight.map((ch, i) => (
            <button key={i} type="button" onClick={() => setSightInput((p) => p + ch)} disabled={sightAnswered} className="h-10 w-10 rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-50">
              {ch}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          {SIGHT_WORDS[sightIdx].word.split('').map((_, i) => (
            <div key={i} className="flex h-10 w-8 items-center justify-center rounded-lg border-b-2 border-indigo-300 bg-white text-lg font-bold text-indigo-700">
              {sightInput[i] || ''}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-2">
          <button type="button" onClick={() => setSightInput((p) => p.slice(0, -1))} disabled={sightAnswered || !sightInput} className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-300 disabled:opacity-50">
            ⌫ Back
          </button>
          {!sightAnswered && (
            <button type="button" onClick={handleSightSubmit} disabled={!sightInput.trim()} className="rounded-xl bg-fuchsia-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-700 disabled:opacity-50">
              Check
            </button>
          )}
        </div>
      </div>
      {sightAnswered && (
        <button
          type="button"
          onClick={() => {
            let n: number;
            do {
              n = Math.floor(Math.random() * SIGHT_WORDS.length);
            } while (n === sightIdx && SIGHT_WORDS.length > 1);
            setSightIdx(n);
            setSightInput('');
            setSightAnswered(false);
            setSightCorrect(false);
          }}
          className="mt-5 rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-fuchsia-700"
        >
          Next Word →
        </button>
      )}
      <div className="mt-4 text-sm text-slate-500">
        Score: {sightScore}/{sightTotal}
      </div>
    </section>
  );
}
