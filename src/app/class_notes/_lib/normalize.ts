// Curriculum clean-up for the Class Notes reader.
//
// curriculum-data.json mirrors the Google Drive "Planning" folder exactly,
// so any book dropped into the wrong class/subject folder shows up in the
// wrong place on the site (e.g. "English Islamiyat VII" under Class II English).
// This module re-files every chapter using its own title:
//   - class   : roman numeral / "Class N" / "Grade N" in the title
//   - subject : book name keywords (Riazi -> Mathematics, Mazhabi -> Islamiat ...)
//   - removes duplicate copies ("... bull 2026" vs "... 2026")
//   - merges "Computer" + "Computer Science"
//   - gives each textbook a cleaner display title and a medium label
// The original Drive folder is used only as a fallback when the title says nothing.

export type Paragraph = { text: string; isHeading?: boolean; isBullet?: boolean };

export type Chapter = {
  id: string;
  title: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  sizeFormatted: string;
  isDocx: boolean;
  isPdf: boolean;
  resourceType?: 'notes' | 'planning';
  parsedContent: { paragraphCount: number; content: Paragraph[] } | null;
  bannerImage: string | null;
  lastModified: string;
  /** Added by normalizeCurriculum */
  displayTitle?: string;
  medium?: 'English' | 'Urdu' | 'Sindhi';
};

export type Subject = {
  id: string;
  name: string;
  key: string;
  chapterCount: number;
  chapters: Chapter[];
};

export type ClassItem = {
  id: string;
  name: string;
  standardName?: string;
  subjectCount: number;
  totalFiles: number;
  subjects: Subject[];
};

const CLASS_META: Record<string, { name: string; standardName: string }> = {
  'class-ece': { name: 'Class ECE', standardName: 'Class ECE (Early Childhood)' },
  'class-i': { name: 'Class I', standardName: 'Class 1 (Grade I)' },
  'class-ii': { name: 'Class II', standardName: 'Class 2 (Grade II)' },
  'class-iii': { name: 'Class III', standardName: 'Class 3 (Grade III)' },
  'class-iv': { name: 'Class IV', standardName: 'Class 4 (Grade IV)' },
  'class-v': { name: 'Class V', standardName: 'Class 5 (Grade V)' },
  'class-vi': { name: 'Class VI', standardName: 'Class 6 (Grade VI)' },
  'class-vii': { name: 'Class VII', standardName: 'Class 7 (Grade VII)' },
  'class-viii': { name: 'Class VIII', standardName: 'Class 8 (Grade VIII)' },
  'class-ix': { name: 'Class IX', standardName: 'Class 9 (Matric Part 1)' },
  'class-x': { name: 'Class X', standardName: 'Class 10 (Matric Part 2)' },
  'class-xi-xii': { name: 'Class XI-XII', standardName: 'Class 11-12 (Intermediate)' },
};

const ROMAN_TO_CLASS: Record<string, string[]> = {
  I: ['class-i'],
  II: ['class-ii'],
  III: ['class-iii'],
  IV: ['class-iv'],
  V: ['class-v'],
  VI: ['class-vi'],
  VII: ['class-vii'],
  VIII: ['class-viii'],
  IX: ['class-ix'],
  X: ['class-x'],
  XI: ['class-xi-xii'],
  XII: ['class-xi-xii'],
  'XI-XII': ['class-xi-xii'],
  'IX-X': ['class-ix', 'class-x'],
};

const DIGIT_TO_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Classes this chapter belongs to according to its title, or null if the title doesn't say. */
export function detectClassesFromTitle(title: string): string[] | null {
  // "Class ECE", "Class 1", "Grade 1", "Class VI"
  if (/\bclass\s+ece\b|\bece\b/i.test(title)) return ['class-ece'];
  const explicit = title.match(/\b(?:class|grade)\s+([0-9]{1,2}|[ivx]{1,4})\b/i);
  if (explicit) {
    const raw = explicit[1].toUpperCase();
    const roman = /^[0-9]+$/.test(raw) ? DIGIT_TO_ROMAN[parseInt(raw, 10)] : raw;
    if (roman && ROMAN_TO_CLASS[roman]) return ROMAN_TO_CLASS[roman];
  }

  const tokens = title.split(/[\s,_()]+/).filter(Boolean);
  const counts = new Map<string, number>();
  tokens.forEach((tok, i) => {
    let t = tok.replace(/[.:;]+$/, '');
    // Ranges like "I-XII" (all grades) say nothing about one class — only IX-X / XI-XII count.
    if (t.includes('-')) {
      const up = t.toUpperCase();
      if (up === 'IX-X' || up === 'XI-XII') counts.set(up, (counts.get(up) || 0) + 1);
      return;
    }
    // Single letters "I" / "V" / "X" must be uppercase; "I" only when doubled ("Math I I 2026")
    // so the English pronoun is never mistaken for Class I.
    if (t.length === 1) {
      if (!/^[IVX]$/.test(t)) return;
      if (t === 'I' && tokens[i + 1] !== 'I' && tokens[i - 1] !== 'I') return;
    } else {
      if (!/^[ivx]+$/i.test(t)) return;
      // lowercase multi-letter roman ("vii science") is fine, but mixed words like "Vi" are not
      if (t !== t.toUpperCase() && t !== t.toLowerCase()) return;
      t = t.toUpperCase();
    }
    if (ROMAN_TO_CLASS[t]) counts.set(t, (counts.get(t) || 0) + 1);
  });

  if (counts.size === 0) return null;
  // "Asan Sindhi IX-X X 2026" — an explicit range wins over the single numeral next to it.
  if (counts.has('IX-X')) return ROMAN_TO_CLASS['IX-X'];
  if (counts.has('XI-XII')) return ROMAN_TO_CLASS['XI-XII'];
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) return null; // ambiguous — keep folder
  return ROMAN_TO_CLASS[sorted[0][0]];
}

type SubjectDef = { key: string; name: string };
const S = {
  english: { key: 'english', name: 'English' },
  urdu: { key: 'urdu', name: 'Urdu' },
  sindhi: { key: 'sindhi', name: 'Sindhi' },
  mathematics: { key: 'mathematics', name: 'Mathematics' },
  science: { key: 'science', name: 'Science' },
  gk: { key: 'general-knowledge', name: 'General Knowledge' },
  sst: { key: 'social-studies', name: 'Social Studies' },
  islamiat: { key: 'islamiat', name: 'Islamiat' },
  computer: { key: 'computer', name: 'Computer' },
  general: { key: 'general', name: 'General Planning & Overview' },
} satisfies Record<string, SubjectDef>;

// Order matters: specific book names first, language readers last.
const SUBJECT_RULES: Array<[RegExp, SubjectDef]> = [
  [/\b(math|maths|mathematics|riazi)\b/i, S.mathematics],
  [/\b(islamiyat|islamiat|ismaiyat|mazhabi)\b/i, S.islamiat],
  [/\bgeneral\s+knowledge\b/i, S.gk],
  [/\b(social\s+studies|sst|mashrati|smajhi|samajhi)\b/i, S.sst],
  [/\bcomputer\b/i, S.computer],
  [/\bscience\b/i, S.science],
  [/\b(qaida|asan\s+urdu|urdu\s+reader|salees\s+urdu)\b/i, S.urdu],
  [/\b(asan\s+sindhi|sindhi\s+reader)\b/i, S.sindhi],
  [/\b(my\s+english|english\s+book|secondary\s+stage\s+english)\b/i, S.english],
];

// Used only for chapters sitting in a class's loose "General" folder.
const LANGUAGE_FALLBACK: Array<[RegExp, SubjectDef]> = [
  [/\burdu\b/i, S.urdu],
  [/\bsindhi\b/i, S.sindhi],
  [/\benglish\b/i, S.english],
];

const SUBJECT_ORDER = [
  'english', 'urdu', 'sindhi', 'mathematics', 'science', 'general-knowledge',
  'social-studies', 'islamiat', 'computer', 'general',
];

function detectSubject(title: string, folderKey: string, folderName: string): SubjectDef {
  for (const [re, def] of SUBJECT_RULES) if (re.test(title)) return def;
  if (folderKey === 'general') {
    for (const [re, def] of LANGUAGE_FALLBACK) if (re.test(title)) return def;
  }
  if (folderKey === 'computer-science') return S.computer;
  const known = Object.values(S).find((d) => d.key === folderKey);
  return known || { key: folderKey, name: folderName };
}

function detectMedium(title: string, subjectKey: string): Chapter['medium'] {
  const first = title.trim().split(/\s+/)[0]?.toLowerCase();
  const map: Record<string, Chapter['medium']> = { english: 'English', urdu: 'Urdu', sindhi: 'Sindhi' };
  const medium = map[first];
  // "Urdu Riazi" = Maths in Urdu medium; but "Urdu Reader" is just the Urdu subject.
  if (!medium || medium.toLowerCase() === subjectKey) return undefined;
  return medium;
}

/** "English Math II II bull 2026" -> "English Math II · 2026" */
export function cleanTitle(title: string): string {
  const tokens = title.replace(/\bbull\b/gi, ' ').split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    if (out.length && out[out.length - 1].toLowerCase() === t.toLowerCase()) continue;
    out.push(t);
  }
  let s = out.join(' ').replace(/\s+,/g, ',').trim();
  s = s.replace(/\s+(20[0-9]{2}(?:-[0-9]{1,4})?)$/, ' · $1');
  return s;
}

function dedupeKey(ch: Chapter): string {
  return `${cleanTitle(ch.title).toLowerCase()}|${ch.extension.toLowerCase()}`;
}

function isBulletinCopy(ch: Chapter): boolean {
  return /\bbull\b/i.test(ch.title);
}

/** Short stable hash, used to give Urdu-titled files (whose ids came out empty) a unique id. */
function shortHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** build-curriculum.mjs drops non-English letters from ids, so two Urdu-titled files can share one id. */
function withUniqueIds(rawClasses: ClassItem[]): ClassItem[] {
  const counts = new Map<string, number>();
  for (const c of rawClasses) for (const s of c.subjects) for (const ch of s.chapters) counts.set(ch.id, (counts.get(ch.id) || 0) + 1);
  return rawClasses.map((c) => ({
    ...c,
    subjects: c.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.map((ch) =>
        (counts.get(ch.id) || 0) > 1 || ch.id.endsWith('-') ? { ...ch, id: `${ch.id.replace(/-+$/, '')}-${shortHash(ch.fileName || ch.title)}` } : ch
      ),
    })),
  }));
}

export function normalizeCurriculum(input: ClassItem[]): ClassItem[] {
  const rawClasses = withUniqueIds(input);
  // classId -> subjectKey -> { def, chapters }
  const buckets = new Map<string, Map<string, { def: SubjectDef; chapters: Chapter[] }>>();
  const keepAsIs: ClassItem[] = [];

  const put = (classId: string, def: SubjectDef, ch: Chapter) => {
    if (!buckets.has(classId)) buckets.set(classId, new Map());
    const subj = buckets.get(classId)!;
    if (!subj.has(def.key)) subj.set(def.key, { def, chapters: [] });
    const bucket = subj.get(def.key)!;
    const key = dedupeKey(ch);
    const existingIdx = bucket.chapters.findIndex((c) => dedupeKey(c) === key);
    if (existingIdx === -1) {
      bucket.chapters.push(ch);
    } else if (isBulletinCopy(bucket.chapters[existingIdx]) && !isBulletinCopy(ch)) {
      bucket.chapters[existingIdx] = ch; // prefer the regular copy
    }
  };

  for (const cls of rawClasses) {
    // Templates are deliberately cross-class ("Urdu Grades I-XII") — leave untouched.
    if (!CLASS_META[cls.id]) {
      keepAsIs.push({
        ...cls,
        subjects: cls.subjects.map((s) => ({
          ...s,
          chapters: s.chapters.map((ch) => ({ ...ch, displayTitle: cleanTitle(ch.title) })),
        })),
      });
      continue;
    }
    for (const subj of cls.subjects) {
      for (const ch of subj.chapters) {
        const targetClasses = detectClassesFromTitle(ch.title) || [cls.id];
        const def = detectSubject(ch.title, subj.key, subj.name);
        const enriched: Chapter = {
          ...ch,
          displayTitle: cleanTitle(ch.title),
          medium: ch.isPdf ? detectMedium(ch.title, def.key) : undefined,
        };
        for (const target of targetClasses) put(target, def, enriched);
      }
    }
  }

  const result: ClassItem[] = [];
  for (const [classId, subjMap] of buckets) {
    const meta = CLASS_META[classId];
    const subjects: Subject[] = [...subjMap.values()]
      .filter((b) => b.chapters.length > 0)
      .sort((a, b) => {
        const ia = SUBJECT_ORDER.indexOf(a.def.key);
        const ib = SUBJECT_ORDER.indexOf(b.def.key);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.def.name.localeCompare(b.def.name);
      })
      .map((b) => ({
        id: `${classId}-${b.def.key}`,
        name: b.def.name,
        key: b.def.key,
        chapterCount: b.chapters.length,
        chapters: b.chapters,
      }));
    if (subjects.length === 0) continue;
    result.push({
      id: classId,
      name: meta.name,
      standardName: meta.standardName,
      subjectCount: subjects.length,
      totalFiles: subjects.reduce((n, s) => n + s.chapterCount, 0),
      subjects,
    });
  }
  return [...result, ...keepAsIs];
}

export function isPlanningChapter(ch: Chapter): boolean {
  return ch.resourceType === 'planning' || /\bplan/i.test(ch.title);
}
