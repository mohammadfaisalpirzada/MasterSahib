// Text helpers shared by the Class Notes reader (browser) and scripts/build-voice-clips.mjs (Node).
// Both sides MUST split and hash text identically, otherwise the browser would look for a
// recorded Urdu clip under a different file name than the one the script saved. Keep this
// file plain JavaScript (no TypeScript syntax) so Node can import it directly.

const ARABIC_SCRIPT_G = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;
const SINDHI_ONLY = /[ڄڃڇڏڍڊڌڙڪڳڱڻٻٽٺٿڀڦ]/;

/** @typedef {'en' | 'ur' | 'sd'} SpeechLang */

/**
 * @param {string} text
 * @returns {SpeechLang}
 */
export function detectLang(text) {
  const arabic = (text.match(ARABIC_SCRIPT_G) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  if (arabic === 0 || arabic < latin) return 'en';
  return SINDHI_ONLY.test(text) ? 'sd' : 'ur';
}

/**
 * Strip decorative symbols that sound odd when read aloud.
 * @param {string} text
 * @returns {string}
 */
export function cleanForSpeech(text) {
  return text
    .replace(/[■●◆★►▶❓💡•]/g, ' ')
    .replace(/_{2,}/g, ' blank ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mixed lines ("Brave — بہادر") are split so each part is read by the right voice.
 * @param {string} text
 * @returns {Array<{ text: string, lang: SpeechLang }>}
 */
export function splitByScript(text) {
  /** @type {Array<{ text: string, lang: SpeechLang }>} */
  const parts = [];
  const re =
    /([؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿\s\d.,،؛؟۔!:()"'-]*)|([^؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const chunk = m[0].trim();
    if (!chunk || !/[\p{L}\p{N}]/u.test(chunk)) continue;
    parts.push({ text: chunk, lang: m[1] ? detectLang(chunk) : 'en' });
  }
  return parts;
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  const parts = text
    .split(/(?<=[.!?؟۔])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text];
}

/** Characters that make up a "word" when a student taps on text. */
export const WORD_CHAR = /[\p{L}\p{M}\p{N}'’-]/u;
export const WORD_SPLIT = /[^\p{L}\p{M}\p{N}'’-]+/u;

/**
 * File name (without extension) of the recorded clip for this text.
 * cyrb53 hash of the whitespace-normalised text, as 14 hex characters.
 * @param {string} text
 * @returns {string}
 */
export function clipKey(text) {
  const str = text.replace(/\s+/g, ' ').trim();
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return n.toString(16).padStart(14, '0');
}

/**
 * Every Urdu/Sindhi piece the reader could ask for, from one block of notes text:
 * the whole text, each sentence, and each single word (for tap-a-word).
 * @param {string} text
 * @returns {string[]}
 */
export function urduSegmentsFor(text) {
  /** @type {Set<string>} */
  const out = new Set();
  const add = (/** @type {string} */ t) => {
    for (const seg of splitByScript(cleanForSpeech(t))) if (seg.lang !== 'en') out.add(seg.text);
  };
  add(text);
  // The reader strips these prefixes before showing/reading a block.
  add(text.replace(/^(Ans[0-9]*[.:)]|Answer[.:)])\s*/i, ''));
  add(text.replace(/^(Central Idea|Note|Moral|Rule|Key Point)[.:\s]*/i, ''));
  for (const s of splitSentences(text)) add(s);
  for (const w of text.split(WORD_SPLIT)) {
    const word = w.replace(/^['’-]+|['’-]+$/g, '');
    if (word) add(word);
  }
  return [...out];
}
