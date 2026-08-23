'use client';

import { useState, useEffect, useCallback } from 'react';
import { speak } from '@/app/lib/learn-utils';

const SPELL_WORDS = [
  { word: 'cat', hint: 'A small furry pet' },
  { word: 'dog', hint: 'A pet that barks' },
  { word: 'sun', hint: 'It shines in the day' },
  { word: 'hat', hint: 'You wear it on your head' },
  { word: 'ball', hint: 'Round toy you throw' },
  { word: 'fish', hint: 'Swims in water' },
  { word: 'bird', hint: 'Has wings and flies' },
  { word: 'book', hint: 'You read it' },
  { word: 'tree', hint: 'Tall plant with leaves' },
  { word: 'star', hint: 'Twinkles at night' },
  { word: 'moon', hint: 'Seen in the night sky' },
  { word: 'rain', hint: 'Water from clouds' },
  { word: 'door', hint: 'You open it to enter' },
  { word: 'bell', hint: 'Makes a ringing sound' },
  { word: 'duck', hint: 'A bird that quacks' },
  { word: 'frog', hint: 'Green animal that jumps' },
  { word: 'lion', hint: 'King of the jungle' },
  { word: 'baby', hint: 'A very young child' },
  { word: 'cake', hint: 'A sweet birthday treat' },
  { word: 'milk', hint: 'White drink from cows' },
];

export default function SpellTab() {
  const [spellIdx, setSpellIdx] = useState(() => Math.floor(Math.random() * SPELL_WORDS.length));
  const [spellInput, setSpellInput] = useState('');
  const [spellAnswered, setSpellAnswered] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [spellScore, setSpellScore] = useState(0);
  const [spellTotal, setSpellTotal] = useState(0);
  const [spellLetters, setSpellLetters] = useState<string[]>([]);
  const [spellSelected, setSpellSelected] = useState<string[]>([]);

  useEffect(() => {
    const w = SPELL_WORDS[spellIdx].word;
    setSpellLetters(w.split('').sort(() => Math.random() - 0.5));
    setSpellSelected([]);
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(w);
      u.lang = 'en-US';
      u.rate = 0.7;
      u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }, 400);
  }, [spellIdx]);

  useEffect(() => {
    if (!spellAnswered) return;
    const t = setTimeout(() => {
      let n: number;
      do {
        n = Math.floor(Math.random() * SPELL_WORDS.length);
      } while (n === spellIdx && SPELL_WORDS.length > 1);
      setSpellIdx(n);
      setSpellInput('');
      setSpellAnswered(false);
      setSpellCorrect(false);
      setSpellSelected([]);
    }, 2500);
    return () => clearTimeout(t);
  }, [spellAnswered, spellIdx]);

  const handleSpellCheck = useCallback(() => {
    const word = spellSelected.join('');
    if (!word) return;
    setSpellTotal((p) => p + 1);
    setSpellAnswered(true);
    if (word === SPELL_WORDS[spellIdx].word) {
      setSpellScore((p) => p + 1);
      setSpellCorrect(true);
      speak(`Correct! ${SPELL_WORDS[spellIdx].word}`);
    } else {
      setSpellCorrect(false);
      speak(`The word is ${SPELL_WORDS[spellIdx].word}`);
    }
  }, [spellSelected, spellIdx]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
      <h2 className="text-xl font-bold text-slate-900">Spell this word</h2>
      <p className="mt-2 text-sm text-slate-500 italic">&ldquo;{SPELL_WORDS[spellIdx].hint}&rdquo;</p>
      <button
        type="button"
        onClick={() => {
          const u = new SpeechSynthesisUtterance(SPELL_WORDS[spellIdx].word);
          u.lang = 'en-US';
          u.rate = 0.7;
          u.pitch = 1.1;
          window.speechSynthesis.speak(u);
        }}
        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200"
      >
        🔊 Hear the word
      </button>
      {spellAnswered && <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ${spellCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{spellCorrect ? "✅ Great job! That's correct!" : `❌ The word is: ${SPELL_WORDS[spellIdx].word}`}</div>}
      <div className="mt-8 flex justify-center gap-2">
        {SPELL_WORDS[spellIdx].word.split('').map((_, i) => (
          <div key={i} className={`flex h-12 w-10 items-center justify-center rounded-xl border-b-2 text-xl font-bold transition-all ${spellSelected[i] ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-300'}`}>
            {spellSelected[i] || '_'}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {spellLetters.map((ch, i) =>
          ch ? (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (spellAnswered) return;
                setSpellSelected((p) => [...p, ch]);
                setSpellLetters((p) => p.map((c, j) => (j === i ? '' : c)));
              }}
              disabled={spellAnswered}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white shadow transition hover:scale-110 hover:shadow-md disabled:opacity-30"
            >
              {ch}
            </button>
          ) : (
            <div key={i} className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-200" />
          ),
        )}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (spellAnswered || spellSelected.length === 0) return;
            const last = spellSelected[spellSelected.length - 1];
            setSpellSelected((p) => p.slice(0, -1));
            setSpellLetters((p) => {
              const idx = p.indexOf('');
              if (idx === -1) return p;
              const next = [...p];
              next[idx] = last;
              return next;
            });
          }}
          disabled={spellAnswered || spellSelected.length === 0}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          ⌫ Undo
        </button>
        {!spellAnswered ? (
          <button type="button" onClick={handleSpellCheck} disabled={spellSelected.length !== SPELL_WORDS[spellIdx].word.length} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50">
            Check Spelling
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              let n: number;
              do {
                n = Math.floor(Math.random() * SPELL_WORDS.length);
              } while (n === spellIdx && SPELL_WORDS.length > 1);
              setSpellIdx(n);
              setSpellInput('');
              setSpellAnswered(false);
              setSpellCorrect(false);
              setSpellSelected([]);
            }}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Next Word →
          </button>
        )}
      </div>
      <div className="mt-6 text-sm text-slate-500">
        Score: {spellScore}/{spellTotal}
      </div>
    </section>
  );
}
