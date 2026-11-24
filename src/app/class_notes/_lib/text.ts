// Display helpers for the reader.

const KEEP_UPPER = new Set([
  'STBB', 'BSEK', 'SLO', 'SLOS', 'MCQ', 'MCQS', 'Q&A', 'AI', 'PDF', 'UK', 'USA', 'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'ECE', 'SSC', 'HSC', 'URL', 'IT', 'ICT', 'TV', 'DNA', 'SI', 'CPU', 'RAM',
]);

const PROPER = new Set([
  'urdu', 'english', 'sindhi', 'arabic', 'pakistan', 'pakistani', 'sindh', 'karachi', 'lahore', 'islam', 'islamic',
  'allah', 'quran', 'prophet', 'quaid', 'quaid-e-azam', 'allama', 'iqbal', 'jinnah', 'mohenjo-daro', 'mohenjo', 'daro',
  'baghdad', 'caliph', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'eid',
]);

/** "1. LESSON SUMMARY & SLOS" -> "Lesson summary & SLOs". Leaves mixed-case titles alone. */
export function smartCase(title: string): string {
  const letters = title.replace(/[^A-Za-z]/g, '');
  if (letters.length < 4 || letters !== letters.toUpperCase()) return title;
  let first = true;
  return title.replace(/[A-Za-z][A-Za-z'&]*/g, (word) => {
    const up = word.toUpperCase();
    let out: string;
    if (KEEP_UPPER.has(up)) out = up === 'SLOS' ? 'SLOs' : up === 'MCQS' ? 'MCQs' : up;
    else if (/^[A-Z]$/.test(word) && !first) out = word; // section letters: "Part A"
    else if (PROPER.has(word.toLowerCase())) out = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    else out = word.toLowerCase();
    if (first && out === out.toLowerCase()) out = out.charAt(0).toUpperCase() + out.slice(1);
    first = false;
    return out;
  }).replace(/([:—–-]\s+)([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

const URDU = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
export const hasUrdu = (t: string) => URDU.test(t || '');

/** "Class IX English Unit 4 Notes" (in Class IX > English) -> "Unit 4 notes". */
export function shortTitle(title: string, subjectName?: string): string {
  let t = title.replace(/^class\s+([ivx]+|[0-9]+|ece)\b[\s,:-]*/i, '');
  if (subjectName) {
    const esc = subjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(`^${esc}\\b[\\s,:-]*`, 'i'), '');
  }
  t = t.trim();
  if (!t || t.length < 3) return title;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * The first line of every notes file reads like
 * "THE MASTER SAHIB EDUCATIONAL SERIES CLASS IX ENGLISH — UNIT 4PAKISTAN AND NATIONAL PRIDE(4.1 The Great Visionaries | 4.4 …)".
 * Pull out the real topic ("Pakistan and National Pride") and the lessons inside the brackets.
 */
export function topicFromSeries(subText?: string): { topic?: string; lessons: string[] } {
  if (!subText) return { lessons: [] };
  const lessonsMatch = subText.match(/\(([^)]*)\)/);
  const lessons = lessonsMatch
    ? lessonsMatch[1].split('|').map((x) => x.replace(/^\s*[0-9]+(\.[0-9]+)?\s*/, '').trim()).filter(Boolean)
    : [];
  const m = subText.replace(/\(.*$/, '').match(/(?:unit|chapter|lesson)\s*[0-9]+\s*[:—–-]?\s*(.+)$/i);
  const small = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'on', 'to', 'for', 'with', 'at', 'by', 'or']);
  const topic = m
    ? smartCase(m[1].trim()).replace(/[A-Za-z][\w'-]*/g, (w, offset: number) =>
        offset > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)
      )
    : undefined;
  return { topic: topic && topic.length > 3 ? topic : undefined, lessons };
}
