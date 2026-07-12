'use client';

/* ─── Speech ────────────────────────────────────────────────────── */

export const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

export const spellWord = (word: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const letters = word.toUpperCase().split('');
  let i = 0;
  const sayNext = () => {
    if (i >= letters.length) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
      return;
    }
    const u = new SpeechSynthesisUtterance(letters[i]);
    u.lang = 'en-US'; u.rate = 0.6; u.pitch = 1.2;
    u.onend = () => { i++; setTimeout(sayNext, 180); };
    window.speechSynthesis.speak(u);
  };
  sayNext();
};

/** Say the word, then spell it letter by letter, then say the word again. */
export const speakThenSpell = (word: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1;
  u.onend = () => { setTimeout(() => spellWord(word), 300); };
  window.speechSynthesis.speak(u);
};

/** Speak text, call onEnd when finished. */
export const speakWithCallback = (text: string, onEnd: () => void) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1;
  u.onend = onEnd;
  window.speechSynthesis.speak(u);
};

/* ─── Quiz helpers ──────────────────────────────────────────────── */

/** Delay in ms before auto-advancing after a quiz answer is spoken. */
export const quizDelay = (label: string) => 800 + label.length * 860 + 1000 + 1500;

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Generate `count` unique options around `correct` for a quiz. */
export function generateOptions(correct: number, count = 4): number[] {
  const opts = new Set<number>([correct]);
  let attempts = 0;
  while (opts.size < count && attempts < 200) {
    attempts++;
    const offset = Math.floor(Math.random() * 20) - 10;
    const alt = correct + offset;
    if (alt >= 0 && alt !== correct) opts.add(alt);
  }
  return shuffle([...opts]);
}

/* ─── Number words ──────────────────────────────────────────────── */

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const TEENS = ['thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export const numberWord = (n: number): string => {
  if (n >= 0 && n <= 12) return ONES[n];
  if (n >= 13 && n <= 19) return TEENS[n - 13];
  if (n % 10 === 0 && n >= 20 && n <= 90) return TENS[n / 10];
  if (n >= 20 && n <= 99) return `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}`;
  return String(n);
};

/* ─── Learn mode type ───────────────────────────────────────────── */

export type LearnMode = 'learn' | 'quiz' | 'type';
