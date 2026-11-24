// Turns the flat list of paragraphs extracted from a Word file into structured reader blocks.
//
// Why this exists: scripts/build-curriculum.mjs flattens Word *tables* — every cell becomes
// its own paragraph. So a 3-column table "Root Word | Prefix Added | Opposite Word" arrives as
// nine separate lines. This parser recognises a table's header row by its words (Word, Meaning,
// Prefix, S.No., Statement, Masculine, …), works out how many columns it has, and regroups the
// following cells into rows. It also cleans up numbered exercise lines that the extractor wrongly
// flagged as headings, "-> Solved:" lines, topic bullets, and so on.

export type Paragraph = { text: string; isHeading?: boolean; isBullet?: boolean };

export type VocabItem = { word: string; meaning: string; sentence: string };
export type DictationItem = { word: string; meaning: string };

export type ChapterBlock =
  | { type: 'series'; text: string; subText?: string }
  | { type: 'section'; id: string; number?: string; title: string; isUrdu: boolean }
  | { type: 'subsection'; id: string; title: string; isUrdu: boolean }
  | { type: 'vocab'; items: VocabItem[] }
  | { type: 'dictation'; items: DictationItem[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'facts'; items: Array<{ label: string; value: string }> }
  | { type: 'question'; label: string; text: string; isUrdu: boolean }
  | { type: 'answer'; text: string; isUrdu: boolean }
  | { type: 'solved'; text: string; isUrdu: boolean }
  | { type: 'numbered'; number: string; text: string; isUrdu: boolean }
  | { type: 'callout'; label: string; text: string; isUrdu: boolean }
  | { type: 'bullet'; text: string; isUrdu: boolean }
  | { type: 'heading'; text: string; isUrdu: boolean }
  | { type: 'paragraph'; text: string; isUrdu: boolean }
  | { type: 'divider' };

const URDU_CHARS = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g;

export function isUrduText(text: string): boolean {
  if (!text) return false;
  const m = text.match(URDU_CHARS);
  if (!m) return false;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  return m.length >= 2 && m.length >= latin;
}

const SECTION_MARK = /^[■●◆★]\s*/;
const SUB_MARK = /^[►▶]\s*/;
const ANY_MARK = /^[■●◆★►▶]/;
const DIVIDER = /^[―\-_=]{3,}$/;
const QUESTION = /^(Q\s*[0-9]+\s*[.:)]|Q\s*[.:)]|Question\s*[0-9]*\s*[.:)])/i;
const ANSWER = /^(Ans\s*[0-9]*\s*[.:)]|Answer\s*[.:)])/i;
const CALLOUT = /^(Central Idea|Note|Moral|Rule|Key Point|Remember|Tip)\s*[.:]\s*(.*)$/i;
const SOLVED = /^(->|→|=>)\s*/;
const FACT = /^([A-Z][A-Za-z .'/()&-]{1,24}):\s+(\S.*)$/;

// Words that appear in table header cells across the notes (English + Urdu).
const HEADER_WORDS = new RegExp(
  [
    's\\.?\\s?no\\.?', 'sr\\.?\\s?no', 'serial', 'word', 'words', 'meanings?', 'opposites?', 'antonyms?', 'synonyms?',
    'root', 'prefix(es)?', 'suffix(es)?', 'added', 'new word', 'masculine', 'feminine', 'gender', 'singular', 'plural',
    'present', 'past', 'participle', 'forms?', 'statements?', 'true', 'false', 'status', 'vocabulary', 'textbook',
    'contextual', 'options?', 'order', 'chronolog\\w*', 'sentences?', 'reference', 'should', 'must', 'aspect',
    'pronouns?', 'stanza', 'rhym\\w*', 'poetic', 'lines?', 'line\\(s\\)', 'nouns?', 'category', 'definition',
    'explanation', 'step', 'experience', 'time slot', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
    'saturday', 'sunday', 'pen-pal', 'country', 'capital', 'dress', 'food', 'landmarks?', 'festivals?', 'tense',
    'rules?', 'examples?', 'use in', 'urdu', 'english', 'correct', 'pairing', 'types?', 'degree', 'comparative',
    'superlative', 'positive', 'verbs?', 'adjectives?', 'adverbs?', 'questions?', 'answers?', 'match(ing)?',
    'reason', 'name', 'kind of', 'base', 'spelling', 'homophones?', 'contractions?', 'full form', 'active',
    'passive', 'direct', 'indirect', 'part of speech', 'marks', 'topic', 'detail', 'description', 'activity',
    'objective', 'outcome', 'slo', 'duration', 'resources?', 'assessment', 'teacher', 'student', 'period',
    'syllables?', 'stress', 'mark', 'etymology', 'origin', 'verdict', 'justification', 'evidence', 'implication',
    'analysis', 'notes?', 'significance', 'entry', 'pair', 'scheme', 'match', 'phrase', 'idioms?', 'clauses?',
  ].join('|'),
  'i'
);
const HEADER_WORDS_RE = new RegExp(`(^|[^a-z])(${HEADER_WORDS.source})([^a-z]|$)`, 'i');
const URDU_HEADER_WORDS = /(الفاظ|لفظ|معنی|معانی|جملے|جملہ|مذکر|مؤنث|واحد|جمع|متضاد|مترادف|نمبر\s*شمار|سوال|جواب)/;

function clean(text: string): string {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function isBreak(p: Paragraph | undefined, allowQuestions = false): boolean {
  if (!p) return true;
  const t = clean(p.text);
  return (
    !!p.isHeading ||
    !!p.isBullet ||
    ANY_MARK.test(t) ||
    DIVIDER.test(t) ||
    (!allowQuestions && (QUESTION.test(t) || ANSWER.test(t)))
  );
}

/**
 * Column count from row numbering: tables with an "S.No." column (1, 2, 3 …) or a numbered
 * first column ("Stanza 1", "Stanza 2" …). The gap between the "…1" cell and the "…2" cell is
 * exactly one row, and everything before "…1" is the header row.
 */
function columnsFromNumbering(cells: string[]): number | null {
  // a = index of the first data cell = number of header cells = number of columns (at least 2).
  for (let a = 2; a <= 6 && a < cells.length; a++) {
    const m = cells[a].match(/^(.{0,24}?)\s*1$/);
    if (!m) continue;
    const prefix = m[1].trim().toLowerCase();
    const b = a + a; // the next row starts one row-width later
    if (b >= cells.length) continue;
    const m2 = cells[b].match(/^(.{0,24}?)\s*2$/);
    if (m2 && m2[1].trim().toLowerCase() === prefix) return a;
  }
  return null;
}

function isHeaderCell(p: Paragraph | undefined, insideHeaderRow = false): boolean {
  // The extractor sometimes flags a header cell ("Part of Speech") as a heading; inside a header
  // row that flag is ignored.
  if (!p || p.isBullet || (p.isHeading && !insideHeaderRow)) return false;
  const t = clean(p.text);
  if (!t || t.length > 48) return false;
  if (t.split(' ').length > 7) return false;
  // Header cells don't end in punctuation ("S.No." / "Stanza No." are the exceptions)…
  if (/[.,;!?:]$/.test(t) && !/\b(s\.?\s?no|sr\.?\s?no|no)\.$/i.test(t)) return false;
  // …don't read "Label: value" ("Teacher: SHAZIA PEERZADA")…
  if (/:\s*\S/.test(t)) return false;
  // …and start with a letter, digit or bracket, not an emoji or symbol.
  if (!/^[\p{L}\p{N}(]/u.test(t)) return false;
  if (ANY_MARK.test(t) || QUESTION.test(t) || ANSWER.test(t) || /^\d+[.)]\s/.test(t)) return false;
  return HEADER_WORDS_RE.test(t) || URDU_HEADER_WORDS.test(t);
}

/** Try to read a flattened table starting at content[i]. */
function readTable(content: Paragraph[], i: number): { headers: string[]; rows: string[][]; next: number } | null {
  const headerCells: string[] = [];
  let j = i;
  while (j < content.length && headerCells.length < 6 && isHeaderCell(content[j], headerCells.length > 0)) {
    headerCells.push(clean(content[j].text));
    j++;
  }
  if (headerCells.length < 1) return null;
  // Answer keys ("Questions 1-5 | Questions 6-10 …") hold "Q1: (B) …" lines as their cells.
  const allowQuestions = headerCells.some((h) => /^questions?\b/i.test(h));

  // Total run of cells (header + data) until something that clearly isn't a cell.
  let end = j; // header cells themselves never end the run
  while (end < content.length && !isBreak(content[end], allowQuestions)) end++;
  const total = end - i;
  const cells = content.slice(i, end).map((p) => clean(p.text));

  let cols = columnsFromNumbering(cells) ?? 0;
  if (!cols) {
    if (headerCells.length < 2) return null;
    // A data cell can look like a header ("Proper Noun" under "Noun Category"), so the header run
    // may overshoot. Pick the largest column count that divides the whole run evenly.
    cols = headerCells.length;
    for (let n = headerCells.length; n >= 2; n--) {
      if (total % n === 0 && total / n >= 2) {
        cols = n;
        break;
      }
    }
  }
  if (cols < 2 || total < cols * 2) return null; // need at least one data row

  const headers = cells.slice(0, cols);
  const rows: string[][] = [];
  for (let k = i + cols; k < end; k += cols) {
    const row = content.slice(k, k + cols).map((p) => clean(p.text));
    while (row.length < cols) row.push('');
    rows.push(row);
  }
  return { headers, rows, next: end };
}

function tableToBlock(headers: string[], rows: string[][]): ChapterBlock {
  const h = headers.map((x) => x.toLowerCase());
  // "Word | Meaning | Word | Meaning" — dictation list printed in two halves.
  if (headers.length === 4 && h[0] === h[2] && h[1] === h[3] && /word|الفاظ|لفظ/.test(h[0])) {
    const items: DictationItem[] = [];
    for (const r of rows) {
      if (r[0]) items.push({ word: r[0], meaning: r[1] });
      if (r[2]) items.push({ word: r[2], meaning: r[3] });
    }
    return { type: 'dictation', items };
  }
  if (headers.length === 2 && /^word/.test(h[0]) && /^(urdu )?meaning|معنی/.test(h[1])) {
    return { type: 'dictation', items: rows.map((r) => ({ word: r[0], meaning: r[1] })) };
  }
  // "Word | Urdu Meaning | Use in Sentence"
  if (headers.length === 3 && /word/.test(h[0]) && /meaning|معنی/.test(h[1]) && /sentence|جمل/.test(h[2])) {
    return { type: 'vocab', items: rows.map((r) => ({ word: r[0], meaning: r[1], sentence: r[2] })) };
  }
  return { type: 'table', headers, rows };
}

/** Old-style lists that come without a header row (kept for older notes). */
function readUnheaded(content: Paragraph[], i: number, size: number): { cells: string[][]; next: number } {
  const cells: string[][] = [];
  let k = i;
  while (k < content.length && !isBreak(content[k])) {
    const row = content.slice(k, k + size).map((p) => clean(p.text));
    while (row.length < size) row.push('');
    cells.push(row);
    k += size;
  }
  return { cells, next: Math.min(k, content.length) };
}

export function parseChapterBlocks(content?: Paragraph[]): ChapterBlock[] {
  if (!content || !Array.isArray(content)) return [];
  const blocks: ChapterBlock[] = [];
  let sectionCount = 0;
  let i = 0;

  while (i < content.length) {
    const p = content[i];
    const text = clean(p.text);
    if (!text) {
      i++;
      continue;
    }

    if (DIVIDER.test(text)) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    if (/^THE MASTER SAHIB EDUCATIONAL SERIES/i.test(text)) {
      blocks.push({
        type: 'series',
        text: 'The Master Sahib Educational Series',
        subText: text.replace(/^THE MASTER SAHIB EDUCATIONAL SERIES\s*/i, '').trim() || undefined,
      });
      i++;
      continue;
    }

    // ■ 1. LESSON SUMMARY  → main section
    if (SECTION_MARK.test(text)) {
      const raw = text.replace(SECTION_MARK, '').trim();
      const num = raw.match(/^([0-9]+(?:\.[0-9]+)?)[.)]?\s+/);
      const title = num ? raw.slice(num[0].length).trim() : raw;
      sectionCount++;
      blocks.push({ type: 'section', id: `sec-${sectionCount}`, number: num?.[1], title, isUrdu: isUrduText(title) });
      i++;

      const table = readTable(content, i);
      if (table) {
        blocks.push(tableToBlock(table.headers, table.rows));
        i = table.next;
        continue;
      }
      // Older notes: vocabulary / dictation lists without a header row.
      if (/DICTATION\s+WORDS/i.test(title)) {
        const { cells, next } = readUnheaded(content, i, 2);
        if (cells.length) blocks.push({ type: 'dictation', items: cells.map((c) => ({ word: c[0], meaning: c[1] })) });
        i = next;
        continue;
      }
      if (/WORDS.*(MEANING|URDU).*(SENTENCE|USE)/i.test(title)) {
        const { cells, next } = readUnheaded(content, i, 3);
        if (cells.length) blocks.push({ type: 'vocab', items: cells.map((c) => ({ word: c[0], meaning: c[1], sentence: c[2] })) });
        i = next;
        continue;
      }
      continue;
    }

    // ► A. Words & Opposites  → sub-section (also "• Topic B: …" bullets)
    const topicBullet = p.isBullet && /^[•●\-*]?\s*(Topic|Part|Section|Exercise|Activity)\s+[A-Z0-9]+\s*[:.\-–—]/i.test(text);
    if (SUB_MARK.test(text) || topicBullet) {
      const title = text.replace(SUB_MARK, '').replace(/^[•●\-*]\s*/, '').trim();
      sectionCount++;
      blocks.push({ type: 'subsection', id: `sec-${sectionCount}`, title, isUrdu: isUrduText(title) });
      i++;
      const table = readTable(content, i);
      if (table) {
        blocks.push(tableToBlock(table.headers, table.rows));
        i = table.next;
      }
      continue;
    }

    // A table that starts without a heading in front of it.
    const table = readTable(content, i);
    if (table) {
      blocks.push(tableToBlock(table.headers, table.rows));
      i = table.next;
      continue;
    }

    // "Month: September", "Subject: English", "Class: V" … → a small details panel.
    const facts: Array<{ label: string; value: string }> = [];
    let f = i;
    while (f < content.length) {
      const fp = content[f];
      const ft = clean(fp.text);
      const fm = ft.match(FACT);
      if (!fm || fp.isBullet || ft.length > 90 || CALLOUT.test(ft) || QUESTION.test(ft) || ANSWER.test(ft) || /^(q|ans|answer|question|solved)\b/i.test(fm[1]) || /^(day|step|week|part|unit|lesson|chapter|exercise)\b/i.test(fm[1])) break;
      facts.push({ label: fm[1].trim(), value: fm[2].trim() });
      f++;
    }
    if (facts.length >= 2) {
      blocks.push({ type: 'facts', items: facts });
      i = f;
      continue;
    }

    if (QUESTION.test(text)) {
      const m = text.match(QUESTION)!;
      blocks.push({
        type: 'question',
        label: m[0].replace(/[.:)]\s*$/, '').replace(/\s+/g, ''),
        text: text.slice(m[0].length).trim() || text,
        isUrdu: isUrduText(text),
      });
      i++;
      continue;
    }

    if (ANSWER.test(text)) {
      blocks.push({ type: 'answer', text: text.replace(ANSWER, '').trim(), isUrdu: isUrduText(text) });
      i++;
      continue;
    }

    if (SOLVED.test(text)) {
      blocks.push({ type: 'solved', text: text.replace(SOLVED, '').replace(/^Solved\s*:\s*/i, '').trim(), isUrdu: isUrduText(text) });
      i++;
      continue;
    }

    const callout = text.match(CALLOUT);
    if (callout) {
      blocks.push({ type: 'callout', label: callout[1], text: callout[2].trim() || text, isUrdu: isUrduText(text) });
      i++;
      continue;
    }

    // "1. The gentleman rode a white horse. -> A white horse was ridden…" — the extractor flags
    // numbered exercise lines as headings; show them as numbered items instead.
    const numbered = text.match(/^([0-9]{1,3})[.)]\s+(.+)$/);
    if (numbered && (!p.isHeading || numbered[2].length > 45 || /[.?!]$/.test(numbered[2]) || /->|→/.test(numbered[2]))) {
      const body = numbered[2];
      const arrow = body.split(/\s*(?:->|→)\s*/);
      blocks.push({ type: 'numbered', number: numbered[1], text: arrow[0].trim(), isUrdu: isUrduText(body) });
      if (arrow.length > 1 && arrow.slice(1).join(' ').trim()) {
        blocks.push({ type: 'solved', text: arrow.slice(1).join(' → ').trim(), isUrdu: isUrduText(body) });
      }
      i++;
      continue;
    }

    if (p.isBullet || /^[•●\-*]\s+/.test(text)) {
      blocks.push({ type: 'bullet', text: text.replace(/^[•●\-*]\s+/, ''), isUrdu: isUrduText(text) });
      i++;
      continue;
    }

    if (p.isHeading) {
      blocks.push({ type: 'heading', text, isUrdu: isUrduText(text) });
      i++;
      continue;
    }

    blocks.push({ type: 'paragraph', text, isUrdu: isUrduText(text) });
    i++;
  }
  return blocks;
}

/** Sections and sub-sections, for the "Contents" jump list. */
export function tableOfContents(blocks: ChapterBlock[]): Array<{ id: string; title: string; level: 1 | 2; number?: string }> {
  const out: Array<{ id: string; title: string; level: 1 | 2; number?: string }> = [];
  for (const b of blocks) {
    if (b.type === 'section') out.push({ id: b.id, title: b.title, level: 1, number: b.number });
    else if (b.type === 'subsection') out.push({ id: b.id, title: b.title, level: 2 });
  }
  return out;
}
