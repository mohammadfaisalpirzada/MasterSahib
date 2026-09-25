'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiBookOpen,
  HiOutlineSearch,
  HiOutlinePrinter,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineClipboardList,
  HiOutlineEye,
} from 'react-icons/hi';

import curriculumData from '@/data/curriculum-data.json';

type Paragraph = {
  text: string;
  isHeading?: boolean;
  isBullet?: boolean;
};

type Chapter = {
  id: string;
  title: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  sizeFormatted: string;
  isDocx: boolean;
  isPdf: boolean;
  resourceType?: 'notes' | 'planning';
  parsedContent: {
    paragraphCount: number;
    content: Paragraph[];
  } | null;
  bannerImage: string | null;
  lastModified: string;
};

type Subject = {
  id: string;
  name: string;
  key: string;
  chapterCount: number;
  chapters: Chapter[];
};

type ClassItem = {
  id: string;
  name: string;
  standardName?: string;
  subjectCount: number;
  totalFiles: number;
  subjects: Subject[];
};

const BANNER_GRADIENTS: Record<string, string> = {
  english: 'from-blue-600 via-indigo-600 to-blue-700',
  mathematics: 'from-emerald-600 via-teal-600 to-cyan-700',
  urdu: 'from-amber-600 via-orange-600 to-amber-700',
  sindhi: 'from-rose-600 via-pink-600 to-rose-700',
  science: 'from-cyan-600 via-sky-600 to-blue-600',
  computer: 'from-violet-600 via-purple-600 to-indigo-700',
  'computer-science': 'from-violet-600 via-purple-600 to-indigo-700',
  islamiat: 'from-teal-600 via-emerald-600 to-teal-700',
  'social-studies': 'from-amber-600 via-yellow-600 to-orange-600',
  biology: 'from-green-600 via-emerald-600 to-teal-700',
  chemistry: 'from-fuchsia-600 via-purple-600 to-pink-600',
  physics: 'from-blue-600 via-cyan-600 to-indigo-700',
  default: 'from-blue-600 via-indigo-600 to-purple-600',
};

const SUBJECT_ICONS: Record<string, string> = {
  english: '📖',
  mathematics: '📐',
  urdu: '📗',
  sindhi: '🪶',
  science: '🔬',
  computer: '💻',
  'computer-science': '💻',
  islamiat: '🕌',
  'social-studies': '🌍',
  biology: '🧬',
  chemistry: '🧪',
  physics: '⚡',
  general: '📋',
  'general-knowledge': '💡',
};

const CLASS_ORDER = [
  'class-ece',
  'class-i',
  'class-ii',
  'class-iii',
  'class-iv',
  'class-v',
  'class-vi',
  'class-vii',
  'class-viii',
  'class-ix',
  'class-x',
  'class-xi-xii',
  'general-templates',
];

function isUrduOrSindhi(text: string): boolean {
  if (!text) return false;
  const matches = text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  if (!matches) return false;
  // English text might contain isolated quotes or symbols, so check character count and ratio
  return matches.length >= 6 && matches.length / text.length > 0.4;
}

interface VocabItem {
  word: string;
  meaning: string;
  sentence: string;
}

interface DictationItem {
  word: string;
  meaning: string;
}

type ChapterBlock =
  | { type: 'header-banner'; text: string; subText?: string }
  | { type: 'section-header'; title: string; isUrdu: boolean }
  | { type: 'subsection-header'; title: string; isUrdu: boolean }
  | { type: 'vocab-table'; items: VocabItem[] }
  | { type: 'dictation-grid'; items: DictationItem[] }
  | { type: 'pair-table'; headers: [string, string]; rows: [string, string][] }
  | { type: 'triplet-table'; headers: [string, string, string]; rows: [string, string, string][] }
  | { type: 'question'; text: string; isUrdu: boolean }
  | { type: 'answer'; text: string; isUrdu: boolean }
  | { type: 'callout'; label: string; text: string; isUrdu: boolean }
  | { type: 'bullet'; text: string; isUrdu: boolean }
  | { type: 'heading'; text: string; isUrdu: boolean }
  | { type: 'paragraph'; text: string; isUrdu: boolean }
  | { type: 'divider' };

function cleanHeading(text: string): string {
  return text.replace(/^[■●◆★►▶]\s*/, '').trim();
}

function parseChapterBlocks(content?: Array<{ text: string; isHeading?: boolean; isBullet?: boolean }>): ChapterBlock[] {
  if (!content || !Array.isArray(content)) return [];
  const blocks: ChapterBlock[] = [];
  let i = 0;
  while (i < content.length) {
    const p = content[i];
    const text = (p.text || '').trim();
    if (!text) {
      i++;
      continue;
    }

    if (/^[―\-_=]{3,}$/.test(text)) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    if (/^THE MASTER SAHIB EDUCATIONAL SERIES/i.test(text)) {
      blocks.push({
        type: 'header-banner',
        text: 'The Master Sahib Educational Series',
        subText: text.replace(/^THE MASTER SAHIB EDUCATIONAL SERIES\s*/i, '').trim(),
      });
      i++;
      continue;
    }

    if (/^[■●◆★]\s+[0-9]+[\.\)]/i.test(text) || /^[■●◆★]\s+[A-Z\u0600-\u06FF]/i.test(text)) {
      const title = cleanHeading(text);
      const isUrdu = isUrduOrSindhi(title);
      blocks.push({ type: 'section-header', title, isUrdu });
      i++;

      // Check if this section is DICTATION WORDS
      if (/DICTATION\s+WORDS/i.test(title)) {
        while (i < content.length && /^(Word|Meaning|Urdu Meaning|الفاظ|معنی)$/i.test(content[i].text.trim())) {
          i++;
        }
        const dictItems: DictationItem[] = [];
        while (i < content.length) {
          const itemText = (content[i].text || '').trim();
          if (
            /^[■●◆★►▶]/i.test(itemText) ||
            /^[―\-_=]{3,}$/.test(itemText) ||
            /^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question)/i.test(itemText)
          ) {
            break;
          }
          if (itemText) {
            const word = itemText;
            const meaning =
              i + 1 < content.length && !/^[■●◆★►▶]/.test(content[i + 1].text)
                ? content[i + 1].text.trim()
                : '';
            dictItems.push({ word, meaning });
            i += 2;
          } else {
            i++;
          }
        }
        if (dictItems.length > 0) {
          blocks.push({ type: 'dictation-grid', items: dictItems });
        }
        continue;
      }

      // Check if this section is VOCABULARY: WORDS, URDU MEANINGS & USE IN SENTENCES
      if (/WORDS.*(?:MEANING|URDU).*(?:SENTENCE|USE)/i.test(title) || /VOCABULARY/i.test(title)) {
        if (i < content.length && /^(Word|الفاظ)$/i.test(content[i].text.trim())) {
          i++;
          if (i < content.length && /(Meaning|معنی)/i.test(content[i].text.trim())) i++;
          if (i < content.length && /(Sentence|جملے|جملہ)/i.test(content[i].text.trim())) i++;
        }

        const vocabItems: VocabItem[] = [];
        while (i < content.length) {
          const itemText = (content[i].text || '').trim();
          if (
            /^[■●◆★►▶]/i.test(itemText) ||
            /^[―\-_=]{3,}$/.test(itemText) ||
            /^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question)/i.test(itemText)
          ) {
            break;
          }
          if (itemText) {
            const word = itemText;
            const meaning =
              i + 1 < content.length && !/^[■●◆★►▶]/.test(content[i + 1].text)
                ? content[i + 1].text.trim()
                : '';
            const sentence =
              i + 2 < content.length && !/^[■●◆★►▶]/.test(content[i + 2].text)
                ? content[i + 2].text.trim()
                : '';
            vocabItems.push({ word, meaning, sentence });
            i += 3;
          } else {
            i++;
          }
        }
        if (vocabItems.length > 0) {
          blocks.push({ type: 'vocab-table', items: vocabItems });
        }
        continue;
      }

      continue;
    }

    if (/^[►▶]\s+/i.test(text)) {
      const title = cleanHeading(text);
      const isUrdu = isUrduOrSindhi(title);
      blocks.push({ type: 'subsection-header', title, isUrdu });
      i++;

      if (
        /Words\s*&\s*(Opposites|Antonyms|Synonyms)|Masculine\s*&\s*Feminine|Singular\s*&\s*Plural/i.test(title)
      ) {
        let h1 = 'Word';
        let h2 = 'Meaning / Opposite';
        if (i < content.length && /^(Word|Masculine|Singular)/i.test(content[i].text.trim())) {
          h1 = content[i].text.trim();
          i++;
          if (
            i < content.length &&
            /^(Opposite|Antonym|Synonym|Feminine|Plural)/i.test(content[i].text.trim())
          ) {
            h2 = content[i].text.trim();
            i++;
          }
        }
        const pairs: [string, string][] = [];
        while (i < content.length) {
          const itemText = (content[i].text || '').trim();
          if (
            /^[■●◆★►▶]/i.test(itemText) ||
            /^[―\-_=]{3,}$/.test(itemText) ||
            /^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question)/i.test(itemText)
          ) {
            break;
          }
          if (itemText) {
            const col1 = itemText;
            const col2 =
              i + 1 < content.length && !/^[■●◆★►▶]/.test(content[i + 1].text)
                ? content[i + 1].text.trim()
                : '';
            pairs.push([col1, col2]);
            i += 2;
          } else {
            i++;
          }
        }
        if (pairs.length > 0) {
          blocks.push({ type: 'pair-table', headers: [h1, h2], rows: pairs });
        }
        continue;
      }

      if (/Forms\s+of\s+Verbs/i.test(title)) {
        let h1 = 'Present (1st Form)';
        let h2 = 'Past (2nd Form)';
        let h3 = 'Past Participle (3rd Form)';
        if (i < content.length && /Present/i.test(content[i].text.trim())) {
          h1 = content[i].text.trim();
          i++;
          if (i < content.length && /Past/i.test(content[i].text.trim())) {
            h2 = content[i].text.trim();
            i++;
          }
          if (i < content.length && /Participle/i.test(content[i].text.trim())) {
            h3 = content[i].text.trim();
            i++;
          }
        }
        const triplets: [string, string, string][] = [];
        while (i < content.length) {
          const itemText = (content[i].text || '').trim();
          if (
            /^[■●◆★►▶]/i.test(itemText) ||
            /^[―\-_=]{3,}$/.test(itemText) ||
            /^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question)/i.test(itemText)
          ) {
            break;
          }
          if (itemText) {
            const col1 = itemText;
            const col2 =
              i + 1 < content.length && !/^[■●◆★►▶]/.test(content[i + 1].text)
                ? content[i + 1].text.trim()
                : '';
            const col3 =
              i + 2 < content.length && !/^[■●◆★►▶]/.test(content[i + 2].text)
                ? content[i + 2].text.trim()
                : '';
            triplets.push([col1, col2, col3]);
            i += 3;
          } else {
            i++;
          }
        }
        if (triplets.length > 0) {
          blocks.push({ type: 'triplet-table', headers: [h1, h2, h3], rows: triplets });
        }
        continue;
      }

      continue;
    }

    if (/^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question\s*[0-9]*[\.:\)])/i.test(text)) {
      blocks.push({ type: 'question', text, isUrdu: isUrduOrSindhi(text) });
      i++;
      continue;
    }

    if (/^(Ans[0-9]*[\.:\)]|Answer[\.:\)])/i.test(text)) {
      blocks.push({
        type: 'answer',
        text: text.replace(/^(Ans[0-9]*[\.:\)]|Answer[\.:\)])\s*/i, '').trim(),
        isUrdu: isUrduOrSindhi(text),
      });
      i++;
      continue;
    }

    if (/^(Central Idea|Note|Moral|Rule|Key Point)[\.:\s]/i.test(text)) {
      const match = text.match(/^(Central Idea|Note|Moral|Rule|Key Point)[\.:\s]*(.*)/i);
      blocks.push({
        type: 'callout',
        label: match ? match[1] : 'Important Highlight',
        text: match && match[2] ? match[2].trim() : text,
        isUrdu: isUrduOrSindhi(text),
      });
      i++;
      continue;
    }

    if (p.isBullet || /^[\u2022\u25CF\-\*]\s+/.test(text)) {
      blocks.push({
        type: 'bullet',
        text: text.replace(/^[\u2022\u25CF\-\*]\s+/, ''),
        isUrdu: isUrduOrSindhi(text),
      });
      i++;
      continue;
    }

    if (p.isHeading) {
      blocks.push({ type: 'heading', text, isUrdu: isUrduOrSindhi(text) });
      i++;
      continue;
    }

    blocks.push({ type: 'paragraph', text, isUrdu: isUrduOrSindhi(text) });
    i++;
  }
  return blocks;
}

function extractUnitNumber(title: string): number | null {
  const match = title.match(/(?:unit|chapter|lesson|part|ch|u)[\s\-_.:#]*([0-9]+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const leadingNum = title.match(/^([0-9]+)[\s\-_.:]/);
  if (leadingNum && leadingNum[1]) {
    return parseInt(leadingNum[1], 10);
  }
  return null;
}

function isPdfChapter(ch: Chapter): boolean {
  return (
    ch.isPdf === true ||
    ch.extension.toLowerCase() === '.pdf' ||
    ch.title.toLowerCase().includes('.pdf') ||
    ch.title.toLowerCase().includes('textbook pdf') ||
    ch.title.toLowerCase().includes('complete book') ||
    !ch.isDocx
  );
}

// Sort chapters so interactive notes (Unit 1, Unit 2...) are top and PDF books are always at the very bottom
function sortChapters(chapters: Chapter[]): Chapter[] {
  return [...chapters].sort((a, b) => {
    const aIsPdf = isPdfChapter(a);
    const bIsPdf = isPdfChapter(b);

    // 1. Non-PDF interactive chapters ALWAYS come before PDF files
    if (!aIsPdf && bIsPdf) return -1;
    if (aIsPdf && !bIsPdf) return 1;

    // 2. Numerical Unit/Chapter order (Unit 1, Unit 2, Unit 3...)
    const numA = extractUnitNumber(a.title);
    const numB = extractUnitNumber(b.title);
    if (numA !== null && numB !== null) {
      if (numA !== numB) return numA - numB;
    } else if (numA !== null) {
      return -1;
    } else if (numB !== null) {
      return 1;
    }

    // 3. Fallback natural sorting
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
  });
}

// Find best interactive chapter (never defaulting to PDF)
function getBestDefaultChapter(chapters: Chapter[]): Chapter | null {
  if (!chapters || chapters.length === 0) return null;
  const sorted = sortChapters(chapters);
  const docxChapter = sorted.find(
    (ch) => ch.isDocx || (ch.parsedContent && ch.parsedContent.content.length > 0)
  );
  if (docxChapter) return docxChapter;
  return sorted[0];
}

const THEME_STYLES = {
  light: {
    container: 'bg-[#f4f7fb] text-slate-900',
    header: 'bg-white/95 border-b border-slate-200/80 text-slate-800 shadow-sm',
    headerButton: 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700',
    sidebar: 'bg-white border-r border-slate-200/80 text-slate-800',
    sidebarHeader: 'bg-gradient-to-b from-blue-50/60 to-white border-b border-slate-200/80',
    sidebarSelect: 'bg-slate-50/90 border border-slate-300/80 text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm',
    sidebarSearch: 'bg-slate-50/90 border border-slate-300/80 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 shadow-sm',
    sidebarSubjectActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20',
    sidebarSubjectInactive: 'bg-blue-50/60 text-slate-700 hover:bg-blue-100/70 border border-blue-100/80',
    sidebarChapterActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20',
    sidebarChapterInactive: 'text-slate-700 hover:bg-blue-50/70 hover:text-blue-900 border border-transparent',
    sidebarChapterBadgeActive: 'bg-white/20 text-white',
    sidebarChapterBadgeInactive: 'bg-blue-100/80 text-blue-700 font-bold',
    card: 'bg-white border border-indigo-100/80 shadow-xl shadow-indigo-100/40 text-slate-900 rounded-3xl',
    sectionHeader: 'bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-200/80 text-blue-950 shadow-sm',
    sectionTitle: 'text-blue-950 font-black',
    subSectionHeader: 'bg-blue-50/80 border border-blue-200/80 text-blue-950 font-bold',
    questionBox: 'bg-blue-50/60 border border-blue-200/80 text-blue-950 shadow-sm',
    questionBadge: 'bg-blue-600 text-white font-bold',
    questionText: 'text-slate-900 font-bold',
    answerBox: 'bg-emerald-50/70 border-l-4 border-emerald-500 text-emerald-950 shadow-sm',
    answerBadge: 'bg-emerald-600 text-white font-bold',
    answerText: 'text-slate-800',
    calloutBox: 'bg-amber-50/80 border-l-4 border-amber-500 text-amber-950 shadow-sm',
    calloutBadge: 'text-amber-800 font-bold',
    calloutText: 'text-slate-900 font-medium',
    bulletDot: 'text-blue-600 font-bold',
    paragraph: 'text-slate-800 leading-relaxed',
    divider: 'border-slate-200/80',
    navButton: 'bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-800 shadow-sm',
  },
  dark: {
    container: 'bg-slate-950 text-slate-100',
    header: 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-sm',
    headerButton: 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700',
    sidebar: 'bg-slate-900 border-slate-800 text-slate-200',
    sidebarHeader: 'bg-slate-950/70 border-slate-800',
    sidebarSelect: 'bg-slate-900 border-slate-700 text-white focus:ring-blue-500',
    sidebarSearch: 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500',
    sidebarSubjectActive: 'bg-blue-600 text-white shadow',
    sidebarSubjectInactive: 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700/60',
    sidebarChapterActive: 'bg-blue-600 text-white font-semibold shadow-md',
    sidebarChapterInactive: 'text-slate-300 hover:bg-slate-800/70 hover:text-white',
    sidebarChapterBadgeActive: 'bg-white/20 text-white',
    sidebarChapterBadgeInactive: 'bg-slate-800 text-slate-400',
    card: 'bg-slate-900/90 border-slate-800 shadow-2xl text-slate-100',
    sectionHeader: 'bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 text-blue-200 shadow-sm',
    sectionTitle: 'text-white font-extrabold',
    subSectionHeader: 'bg-slate-800/80 border border-slate-700 text-blue-300 font-bold',
    questionBox: 'bg-slate-950/60 border-blue-500/40 text-slate-100 shadow-sm',
    questionBadge: 'bg-blue-500/20 text-blue-400 font-bold',
    questionText: 'text-white font-bold',
    answerBox: 'bg-emerald-950/30 border-emerald-500 text-slate-100 shadow-sm',
    answerBadge: 'bg-emerald-500/20 text-emerald-400 font-bold',
    answerText: 'text-slate-200',
    calloutBox: 'bg-amber-950/30 border-amber-500 text-amber-100 shadow-sm',
    calloutBadge: 'text-amber-400 font-bold',
    calloutText: 'text-slate-100 font-medium',
    bulletDot: 'text-emerald-400 font-bold',
    paragraph: 'text-slate-200 leading-relaxed',
    divider: 'border-slate-800',
    navButton: 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 shadow-md',
  },
  sepia: {
    container: 'bg-[#FAF6EE] text-[#2D261E]',
    header: 'bg-[#F2EADB]/95 border-[#E2D5C3] text-[#2D261E] shadow-sm',
    headerButton: 'bg-[#EAE0D0] border-[#D8C9B3] text-[#3D3328] hover:bg-[#DFD3C1]',
    sidebar: 'bg-[#F5EEDB] border-[#E2D5C3] text-[#2D261E]',
    sidebarHeader: 'bg-[#EFE5D3] border-[#E2D5C3]',
    sidebarSelect: 'bg-[#FBF7F0] border-[#D8C9B3] text-[#2D261E] focus:ring-amber-600',
    sidebarSearch: 'bg-[#FBF7F0] border-[#D8C9B3] text-[#2D261E] placeholder:text-[#8C7A6B]',
    sidebarSubjectActive: 'bg-[#8B5E34] text-white shadow',
    sidebarSubjectInactive: 'bg-[#EAE0D0] text-[#3D3328] hover:bg-[#DFD3C1] border-[#D8C9B3]',
    sidebarChapterActive: 'bg-[#8B5E34] text-white font-semibold shadow-md',
    sidebarChapterInactive: 'text-[#3D3328] hover:bg-[#EAE0D0] hover:text-[#1A1510]',
    sidebarChapterBadgeActive: 'bg-white/20 text-white',
    sidebarChapterBadgeInactive: 'bg-[#E0D4C2] text-[#5C4D3E]',
    card: 'bg-[#FFFDF9] border-[#E8DEC8] shadow-xl text-[#2D261E]',
    sectionHeader: 'bg-gradient-to-r from-[#F6EFE0] via-[#EFE5D3] to-[#F6EFE0] border border-[#D8C7B0] text-[#3D2C1B] shadow-sm',
    sectionTitle: 'text-[#241A10] font-extrabold',
    subSectionHeader: 'bg-[#F0E6D2] border border-[#D8C7B0] text-[#4A3722] font-bold',
    questionBox: 'bg-[#F6EFE0] border-[#D6C2A7] text-[#2D261E] shadow-sm',
    questionBadge: 'bg-[#8B5E34] text-white font-bold',
    questionText: 'text-[#241A10] font-bold',
    answerBox: 'bg-[#EDF5EB] border-[#5A8760] text-[#1E3020] shadow-sm',
    answerBadge: 'bg-[#437549] text-white font-bold',
    answerText: 'text-[#1E3020]',
    calloutBox: 'bg-[#FFF8E7] border-[#C2943A] text-[#3D2F10] shadow-sm',
    calloutBadge: 'text-[#8A6318] font-bold',
    calloutText: 'text-[#2D220A] font-medium',
    bulletDot: 'text-[#8B5E34] font-bold',
    paragraph: 'text-[#2D261E] leading-relaxed',
    divider: 'border-[#E8DEC8]',
    navButton: 'bg-[#FFFDF9] border-[#E8DEC8] text-[#2D261E] hover:bg-[#F7F1E5] shadow-sm',
  },
};

function CurriculumContent() {
  const searchParams = useSearchParams();

  // Sort classes according to standard grade sequence
  const rawClasses: ClassItem[] = (curriculumData.classes as unknown as ClassItem[]) || [];
  const classes = useMemo(() => {
    return [...rawClasses].sort((a, b) => {
      const idxA = CLASS_ORDER.indexOf(a.id);
      const idxB = CLASS_ORDER.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [rawClasses]);

  // Main Tab State: 'notes' | 'planning'
  const [activeTab, setActiveTab] = useState<'notes' | 'planning'>('notes');

  // Selected hierarchy states
  const [selectedClassId, setSelectedClassId] = useState<string>('class-viii');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Search & Reader states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Initialize from query params if available
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'notes' || tabParam === 'planning') {
      setActiveTab(tabParam);
    }

    const classParam = searchParams?.get('class');
    const chapterParam = searchParams?.get('chapter');
    if (classParam && classes.some((c) => c.id === classParam)) {
      setSelectedClassId(classParam);
    }
    if (chapterParam) {
      setSelectedChapterId(chapterParam);
    }
  }, [searchParams, classes]);

  // Active Class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Available subjects in current class filtered by active tab and ALWAYS with chapters sorted properly (PDF at bottom)
  const availableSubjects = useMemo(() => {
    if (!currentClass) return [];
    return currentClass.subjects
      .map((s) => {
        const filteredChapters = s.chapters.filter((ch) => {
          if (activeTab === 'planning') {
            return ch.resourceType === 'planning' || ch.title.toLowerCase().includes('plan');
          }
          return ch.resourceType !== 'planning' || s.chapters.every((c) => c.resourceType === 'planning');
        });
        const finalChapters = filteredChapters.length > 0 ? filteredChapters : s.chapters;
        return {
          ...s,
          filteredChapters: sortChapters(finalChapters),
        };
      })
      .filter((s) => s.filteredChapters.length > 0);
  }, [currentClass, activeTab]);

  // Active Subject
  const currentSubject = useMemo(() => {
    if (selectedSubjectId) {
      const found = availableSubjects.find((s) => s.id === selectedSubjectId);
      if (found) return found;
    }
    return availableSubjects[0] || currentClass?.subjects[0];
  }, [availableSubjects, currentClass, selectedSubjectId]);

  // Smart Sync & Memory: Whenever class or tab changes, recall user's last visited unit or pick first interactive unit (not PDF)
  useEffect(() => {
    if (availableSubjects.length > 0) {
      let savedChapterId = '';
      let savedSubjectId = '';
      try {
        if (typeof window !== 'undefined') {
          savedChapterId = localStorage.getItem(`ms_last_chap_${selectedClassId}_${activeTab}`) || '';
          savedSubjectId = localStorage.getItem(`ms_last_subj_${selectedClassId}_${activeTab}`) || '';
        }
      } catch {
        // ignore storage errors
      }

      // Find target subject
      let targetSubject = availableSubjects.find((s) => s.id === savedSubjectId);
      if (!targetSubject && selectedSubjectId) {
        targetSubject = availableSubjects.find((s) => s.id === selectedSubjectId);
      }
      if (!targetSubject) {
        targetSubject = availableSubjects[0];
      }

      setSelectedSubjectId(targetSubject.id);

      // Check if savedChapterId exists in targetSubject
      const hasSavedChapter = targetSubject.filteredChapters.some((ch) => ch.id === savedChapterId);
      if (savedChapterId && hasSavedChapter) {
        setSelectedChapterId(savedChapterId);
      } else {
        // Pick best default chapter (prioritizing interactive notes / docx, never defaulting to PDF)
        const best = getBestDefaultChapter(targetSubject.filteredChapters);
        if (best) {
          setSelectedChapterId(best.id);
        }
      }
    }
  }, [selectedClassId, activeTab, availableSubjects]);

  // User selects a specific chapter -> save to localStorage
  const handleSelectChapter = (subjId: string, chapId: string) => {
    setSelectedSubjectId(subjId);
    setSelectedChapterId(chapId);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ms_last_chap_${selectedClassId}_${activeTab}`, chapId);
        localStorage.setItem(`ms_last_subj_${selectedClassId}_${activeTab}`, subjId);
      }
    } catch {}
  };

  // Active Chapter Lookup
  const activeChapterData = useMemo(() => {
    for (const c of classes) {
      for (const s of c.subjects) {
        const found = s.chapters.find((ch) => ch.id === selectedChapterId);
        if (found) {
          return { currentClass: c, currentSubject: s, chapter: found };
        }
      }
    }
    const defaultSubject = availableSubjects[0] || currentClass?.subjects[0];
    const defaultChapter = getBestDefaultChapter(defaultSubject?.filteredChapters || defaultSubject?.chapters || []);
    return {
      currentClass,
      currentSubject: defaultSubject,
      chapter: defaultChapter,
    };
  }, [classes, currentClass, availableSubjects, selectedChapterId]);

  // Chapters list for Next/Prev in current subject
  const currentSubjectChapters = useMemo(() => {
    return currentSubject?.filteredChapters || currentSubject?.chapters || [];
  }, [currentSubject]);

  const currentIndex = currentSubjectChapters.findIndex((ch) => ch.id === selectedChapterId);
  const prevChapter = currentIndex > 0 ? currentSubjectChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < currentSubjectChapters.length - 1
      ? currentSubjectChapters[currentIndex + 1]
      : null;

  // Estimated reading time
  const readingTime = useMemo(() => {
    const pCount = activeChapterData?.chapter?.parsedContent?.paragraphCount || 0;
    if (pCount === 0) return '2 min read';
    const minutes = Math.max(2, Math.round(pCount / 20));
    return `${minutes} min read`;
  }, [activeChapterData]);

  // Structured Chapter Blocks (Vocab tables, Dictation grids, Headings, Q&A)
  const parsedBlocks = useMemo(() => {
    return parseChapterBlocks(activeChapterData?.chapter?.parsedContent?.content);
  }, [activeChapterData]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: Array<{
      classId: string;
      className: string;
      subjectName: string;
      subjectId: string;
      chapter: Chapter;
    }> = [];

    for (const c of classes) {
      for (const s of c.subjects) {
        for (const ch of s.chapters) {
          if (
            ch.title.toLowerCase().includes(query) ||
            s.name.toLowerCase().includes(query) ||
            c.name.toLowerCase().includes(query) ||
            (ch.parsedContent?.content || []).some((p) => p.text.toLowerCase().includes(query))
          ) {
            results.push({
              classId: c.id,
              className: c.standardName || c.name,
              subjectName: s.name,
              subjectId: s.id,
              chapter: ch,
            });
          }
        }
      }
    }
    return results.slice(0, 25);
  }, [classes, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const currentSubjectKey = activeChapterData?.currentSubject?.key || 'default';
  const gradientClass = BANNER_GRADIENTS[currentSubjectKey] || BANNER_GRADIENTS.default;

  const styles = THEME_STYLES[readerTheme];

  const themeTextSizeClasses = {
    normal: 'text-sm md:text-base leading-relaxed',
    large: 'text-base md:text-lg leading-loose',
    xl: 'text-lg md:text-xl leading-loose',
  }[fontSize];

  return (
    <div className={`min-h-screen ${styles.container} flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200 text-left`} dir="ltr">
      
      {/* ================= TOP APPLICATION & BREADCRUMB BAR ================= */}
      <header className={`border-b ${styles.header} backdrop-blur sticky top-0 z-40 px-3 md:px-6 py-2.5 flex items-center justify-between no-print`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`md:hidden p-2 rounded-xl border ${styles.headerButton}`}
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenuAlt2 className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
              MasterSahib
            </Link>
            <span className="opacity-40">/</span>
            <span className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <HiBookOpen className="w-4 h-4" /> Digital Books & Planning
            </span>
            <span className="opacity-40 hidden sm:inline">/</span>
            <span className="font-semibold hidden sm:inline opacity-90">
              {activeChapterData.currentClass?.standardName || activeChapterData.currentClass?.name}
            </span>
          </div>
        </div>

        {/* Reader Control Tools */}
        <div className="flex items-center gap-2">
          
          {/* Font Size Adjuster */}
          <div className="hidden lg:flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-bold border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg transition ${fontSize === 'normal' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg transition ${fontSize === 'large' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'}`}
              title="Large Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-1 rounded-lg transition ${fontSize === 'xl' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'}`}
              title="Extra Large Font Size"
            >
              A++
            </button>
          </div>

          {/* Theme Switcher: Light, Book/Sepia, Dark */}
          <div className="flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-bold border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setReaderTheme('light')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${readerTheme === 'light' ? 'bg-white text-blue-600 shadow font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
              title="Day / Light Mode (Clean White & High Contrast)"
            >
              ☀️ <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${readerTheme === 'sepia' ? 'bg-[#EAE0D0] text-[#3D3328] shadow font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
              title="Book Paper / Sepia Mode"
            >
              📜 <span className="hidden sm:inline">Sepia</span>
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${readerTheme === 'dark' ? 'bg-slate-700 text-white shadow font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
              title="Night / Dark Mode"
            >
              🌙 <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Focus Mode (Toggle Sidebar) */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isFocusMode ? 'bg-blue-600 border-blue-500 text-white' : styles.headerButton
            }`}
            title="Toggle Focus / Fullscreen Book Mode"
          >
            <HiOutlineEye className="w-4 h-4" />
            <span>Focus Mode</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
            title="Download clean print-ready PDF"
          >
            <HiOutlinePrinter className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex-1 flex max-w-[1680px] w-full mx-auto overflow-hidden">
        
        {/* ================= LEFT SIDEBAR (Class -> Subject -> Chapter Hierarchy) ================= */}
        {!isFocusMode && (
          <aside
            className={`fixed inset-y-0 left-0 z-30 md:static w-80 lg:w-88 flex-shrink-0 ${styles.sidebar} border-r flex flex-col transition-all duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } no-print text-left`}
            dir="ltr"
          >
            {/* Top Mode Tabs: Class Notes vs Lesson Planning */}
            <div className={`p-3 border-b ${styles.sidebarHeader} space-y-3`}>
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-inner">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-extrabold ring-1 ring-blue-400/50'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <HiBookOpen className={`w-4 h-4 ${activeTab === 'notes' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                  <span className={activeTab === 'notes' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}>Class Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('planning')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'planning'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 font-extrabold ring-1 ring-emerald-400/50'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <HiOutlineClipboardList className={`w-4 h-4 ${activeTab === 'planning' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span className={activeTab === 'planning' ? 'text-white' : 'text-slate-800 dark:text-slate-100'}>Planning</span>
                </button>
              </div>

              {/* Step 1: Clean Standard Class Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 block px-1">
                  Select Class / Grade
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSearchQuery('');
                  }}
                  className={`w-full ${styles.sidebarSelect} border hover:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 shadow-sm transition cursor-pointer`}
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="py-1">
                      {c.standardName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes, questions, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${styles.sidebarSearch} border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-left`}
                />
                <HiOutlineSearch className="w-4 h-4 opacity-50 absolute left-2.5 top-2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1.5 opacity-60 hover:opacity-100 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Subject Selector Bar */}
            {!searchQuery.trim() && (
              <div className={`p-3 border-b ${styles.sidebarHeader}`}>
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-2 px-1">
                  Select Subject
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {availableSubjects.map((subj) => {
                    const isSelected = subj.id === currentSubject?.id;
                    const icon = SUBJECT_ICONS[subj.key] || '📚';
                    return (
                      <button
                        key={subj.id}
                        onClick={() => {
                          const bestChap = getBestDefaultChapter(subj.filteredChapters);
                          handleSelectChapter(subj.id, bestChap ? bestChap.id : '');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected ? styles.sidebarSubjectActive : styles.sidebarSubjectInactive
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{subj.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Chapter / Topic List (Interactive Notes first, PDF Reference Book at bottom) */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs text-left" dir="ltr">
              {searchQuery.trim() ? (
                // Search Results View
                <div className="space-y-2">
                  <div className="px-2 text-[11px] font-bold opacity-70 uppercase tracking-wider">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <p className="p-4 opacity-60 text-center">No results matching &quot;{searchQuery}&quot;</p>
                  ) : (
                    searchResults.map((item) => (
                      <button
                        key={item.chapter.id}
                        onClick={() => {
                          setSelectedClassId(item.classId);
                          handleSelectChapter(item.subjectId, item.chapter.id);
                          setSearchQuery('');
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition ${
                          item.chapter.id === selectedChapterId
                            ? 'bg-blue-600/20 border-blue-500 text-blue-600 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold text-left">
                          {item.className} • {item.subjectName}
                        </span>
                        <span className="font-semibold text-xs block truncate text-left">
                          {item.chapter.title}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Standard Chapter List for Selected Subject
                <div className="space-y-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold opacity-70 uppercase tracking-wider">
                    <span>{currentSubject?.name} Chapters</span>
                    <span className="text-[10px] opacity-60 font-normal">
                      {currentSubjectChapters.length} {activeTab === 'notes' ? 'Notes' : 'Plans'}
                    </span>
                  </div>

                  {currentSubjectChapters.length === 0 ? (
                    <div className="p-4 text-center opacity-60">No resources available for this selection.</div>
                  ) : (
                    currentSubjectChapters.map((chapter, idx) => {
                      const isActive = chapter.id === selectedChapterId;
                      const isPdf = isPdfChapter(chapter);

                      return (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            if (currentSubject) {
                              handleSelectChapter(currentSubject.id, chapter.id);
                            }
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start gap-2.5 ${
                            isActive ? styles.sidebarChapterActive : styles.sidebarChapterInactive
                          } ${isPdf ? 'mt-3 border-t border-slate-300 dark:border-slate-800 pt-3' : ''}`}
                        >
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 shrink-0 ${
                            isActive ? styles.sidebarChapterBadgeActive : styles.sidebarChapterBadgeInactive
                          }`}>
                            {isPdf ? '📕' : idx + 1}
                          </span>
                          <div className="flex-1 min-w-0 text-left">
                            <span className="block truncate text-xs font-semibold text-left">{chapter.title}</span>
                            <span className={`text-[10px] block text-left ${isActive ? 'text-white/80' : 'opacity-60'}`}>
                              {isPdf ? 'Official Textbook (PDF)' : (activeTab === 'notes' ? 'Interactive Book / Notes' : 'Lesson Plan')}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </nav>

            {/* Sidebar Footer */}
            <div className={`p-3 border-t ${styles.sidebarHeader} text-center`}>
              <span className="text-[11px] opacity-70 block font-medium">
                MasterSahib Digital Book Series
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Sindh Textbook & Curriculum Aligned
              </span>
            </div>
          </aside>
        )}

        {/* ================= MAIN DIGITAL BOOK READER CANVAS ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-6 text-left relative" dir="ltr">
          {readerTheme === 'light' && (
            <>
              <div className="fixed -left-20 top-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none -z-10" />
              <div className="fixed right-[-60px] top-1/3 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl pointer-events-none -z-10" />
            </>
          )}
          
          {activeChapterData.chapter ? (
            <article className="max-w-4xl mx-auto space-y-8 text-left" dir="ltr">
              
              {/* ================= E-BOOK CHAPTER HEADER & BANNER ================= */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl group print:border-none print:shadow-none">
                {activeChapterData.chapter.bannerImage ? (
                  <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[360px] bg-slate-900">
                    <Image
                      src={activeChapterData.chapter.bannerImage}
                      alt={activeChapterData.chapter.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8 text-center items-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-200 w-fit mb-2">
                        <span>{activeChapterData.currentClass?.standardName || activeChapterData.currentClass?.name}</span>
                        <span>•</span>
                        <span>{activeChapterData.currentSubject?.name}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{readingTime}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md text-center max-w-2xl mx-auto">
                        {activeChapterData.chapter.title}
                      </h1>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full min-h-[190px] md:min-h-[250px] bg-gradient-to-r ${gradientClass} flex flex-col justify-end p-6 md:p-8 relative text-white text-center items-center`}
                  >
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold">
                      <span className="text-emerald-400">★</span> MasterSahib Academic Series
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">{readingTime}</span>
                    </div>

                    <div className="space-y-2 relative z-10 text-center max-w-2xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-200">
                        <span>{activeChapterData.currentClass?.standardName || activeChapterData.currentClass?.name}</span>
                        <span>•</span>
                        <span>{activeChapterData.currentSubject?.name}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight text-center">
                        {activeChapterData.chapter.title}
                      </h1>
                      <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto text-center">
                        {activeTab === 'notes'
                          ? 'Standard Scheme of Studies, Learning Outcomes (SLOs), Lesson Summaries, and Solved Textbook Exercises.'
                          : 'Comprehensive Lesson Planning, Term Syllabus Scheme, and Teacher Pedagogical Guides.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= CHAPTER CONTENT: BOOK-STYLE READER ================= */}
              <div className={`rounded-3xl p-6 md:p-10 lg:p-12 space-y-6 ${styles.card} border print:bg-white print:text-black print:border-none print:shadow-none print:p-0 text-left`} dir="ltr">
                
                {/* Print Header for PDF Export */}
                <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">The Master Sahib Educational Hub</h2>
                      <p className="text-xs text-slate-600">Government School Curriculum & Digital Books</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold">{activeChapterData.currentClass?.name} - {activeChapterData.currentSubject?.name}</p>
                      <p className="text-slate-500">https://themastersahib.com</p>
                    </div>
                  </div>
                </div>

                {parsedBlocks && parsedBlocks.length > 0 ? (
                  <div className={`space-y-4 ${themeTextSizeClasses} text-left`} dir="ltr">
                    {parsedBlocks.map((block, idx) => {
                      // Top educational series banner
                      if (block.type === 'header-banner') {
                        return (
                          <div key={idx} className="text-center py-2 border-b border-slate-200 dark:border-slate-800 mb-6">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
                              {block.text}
                            </span>
                            {block.subText && (
                              <span className="text-xs font-semibold opacity-75 block mt-0.5">
                                {block.subText}
                              </span>
                            )}
                          </div>
                        );
                      }

                      // Separator / Divider line
                      if (block.type === 'divider') {
                        return <hr key={idx} className={`my-6 ${styles.divider} print:border-slate-300`} />;
                      }

                      // Main Section Header (e.g. 1. LESSON SUMMARY, 2. WORDS, URDU MEANINGS...)
                      if (block.type === 'section-header') {
                        return (
                          <div
                            key={idx}
                            className={`mt-10 mb-5 p-3.5 sm:p-4 rounded-2xl ${styles.sectionHeader} text-center print:bg-slate-100 print:border-slate-800 shadow-sm`}
                          >
                            <h2
                              className={`font-black ${styles.sectionTitle} print:text-black text-base sm:text-lg md:text-xl tracking-wide uppercase ${
                                block.isUrdu ? 'font-urdu' : ''
                              }`}
                              dir={block.isUrdu ? 'rtl' : 'ltr'}
                            >
                              {block.title}
                            </h2>
                          </div>
                        );
                      }

                      // Subsection Header (e.g. Part A: ..., Part B: ...)
                      if (block.type === 'subsection-header') {
                        return (
                          <div
                            key={idx}
                            className={`mt-6 mb-3 px-4 py-2.5 rounded-xl ${styles.subSectionHeader} text-center font-bold text-sm sm:text-base print:bg-slate-50 print:text-black`}
                            dir={block.isUrdu ? 'rtl' : 'ltr'}
                          >
                            <h3 className={block.isUrdu ? 'font-urdu' : ''}>{block.title}</h3>
                          </div>
                        );
                      }

                      // Structured Vocabulary Table: Words, Urdu Meanings & Sentences
                      if (block.type === 'vocab-table') {
                        return (
                          <div key={idx} className="my-6 space-y-3">
                            {/* Desktop & Tablet Table View */}
                            <div className="hidden sm:block overflow-hidden rounded-2xl border border-blue-200/80 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900/90">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs md:text-sm font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4 w-[26%] text-left">Word</th>
                                    <th className="py-3 px-4 w-[28%] text-right font-urdu text-sm md:text-base">اردو معنی (Urdu Meaning)</th>
                                    <th className="py-3 px-4 w-[46%] text-left">Use in Sentence</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-sm md:text-base">
                                  {block.items.map((item, itemIdx) => (
                                    <tr
                                      key={itemIdx}
                                      className={`transition-colors ${
                                        itemIdx % 2 === 0
                                          ? 'bg-transparent'
                                          : 'bg-blue-50/40 dark:bg-slate-800/30'
                                      } hover:bg-blue-50/80 dark:hover:bg-slate-800/60`}
                                    >
                                      <td className="py-3 px-4 font-bold text-blue-900 dark:text-blue-300 align-top">
                                        {item.word}
                                      </td>
                                      <td className="py-3 px-4 font-urdu text-right text-emerald-800 dark:text-emerald-400 font-medium text-base md:text-lg align-top" dir="rtl">
                                        {item.meaning}
                                      </td>
                                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 leading-relaxed align-top">
                                        {item.sentence}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="sm:hidden space-y-2.5">
                              {block.items.map((item, itemIdx) => (
                                <div
                                  key={itemIdx}
                                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-sm space-y-2"
                                >
                                  <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <span className="font-extrabold text-base text-blue-950 dark:text-blue-200">
                                      {item.word}
                                    </span>
                                    <span className="font-urdu text-base font-semibold text-emerald-700 dark:text-emerald-400" dir="rtl">
                                      {item.meaning}
                                    </span>
                                  </div>
                                  {item.sentence && (
                                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                                        Sentence:
                                      </span>
                                      <span>{item.sentence}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // Structured Dictation Words Grid
                      if (block.type === 'dictation-grid') {
                        return (
                          <div key={idx} className="my-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {block.items.map((item, dIdx) => (
                              <div
                                key={dIdx}
                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 transition"
                              >
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                  {item.word}
                                </span>
                                <span className="font-urdu text-emerald-700 dark:text-emerald-400 text-base font-medium" dir="rtl">
                                  {item.meaning}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // Grammar 2-column Pair Table (Antonyms, Synonyms, Gender, Plural)
                      if (block.type === 'pair-table') {
                        return (
                          <div key={idx} className="my-5 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs md:text-sm font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                  <th className="py-2.5 px-4 w-1/2 text-left">{block.headers[0]}</th>
                                  <th className="py-2.5 px-4 w-1/2 text-left">{block.headers[1]}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-base">
                                {block.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{row[0]}</td>
                                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      // Grammar 3-column Triplet Table (Forms of Verbs)
                      if (block.type === 'triplet-table') {
                        return (
                          <div key={idx} className="my-5 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                              <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs md:text-sm font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                  <th className="py-2.5 px-4 w-1/3 text-left">{block.headers[0]}</th>
                                  <th className="py-2.5 px-4 w-1/3 text-left">{block.headers[1]}</th>
                                  <th className="py-2.5 px-4 w-1/3 text-left">{block.headers[2]}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm md:text-base">
                                {block.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                                    <td className="py-2.5 px-4 font-semibold text-blue-900 dark:text-blue-300">{row[0]}</td>
                                    <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">{row[1]}</td>
                                    <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">{row[2]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      // Question Detection (e.g. Q1:, Q. 1, Question 1:)
                      if (block.type === 'question') {
                        return (
                          <div
                            key={idx}
                            className={`mt-6 p-4 rounded-2xl ${styles.questionBox} border space-y-1.5 print:bg-slate-50 print:border-slate-300 text-left`}
                            dir={block.isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={`inline-block px-2.5 py-0.5 rounded-full ${styles.questionBadge} text-xs uppercase tracking-wider mb-1`}>
                              ❓ Question
                            </span>
                            <p className={`${styles.questionText} print:text-black text-sm md:text-base leading-snug ${block.isUrdu ? 'text-right font-urdu' : 'text-left'}`}>
                              {block.text}
                            </p>
                          </div>
                        );
                      }

                      // Answer Detection (e.g. Ans:, Answer:, Ans 1:)
                      if (block.type === 'answer') {
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl ${styles.answerBox} border-l-4 space-y-1.5 print:bg-slate-50 print:border-emerald-700 text-left`}
                            dir={block.isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={`inline-block px-2.5 py-0.5 rounded-full ${styles.answerBadge} text-xs uppercase tracking-wider mb-1`}>
                              💡 Answer
                            </span>
                            <p className={`${styles.answerText} print:text-black leading-relaxed ${block.isUrdu ? 'text-right font-urdu text-base md:text-lg' : 'text-left'}`}>
                              {block.text}
                            </p>
                          </div>
                        );
                      }

                      // Central Idea / Note / Moral Callout Box
                      if (block.type === 'callout') {
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl ${styles.calloutBox} border-l-4 space-y-1 my-3 text-left`}
                            dir={block.isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={`font-bold flex items-center gap-1.5 text-xs ${styles.calloutBadge} uppercase tracking-wider`}>
                              <HiOutlineSparkles className="w-4 h-4" /> {block.label}
                            </span>
                            <p className={`${styles.calloutText} print:text-black leading-relaxed ${block.isUrdu ? 'text-right font-urdu' : 'text-left'}`}>
                              {block.text}
                            </p>
                          </div>
                        );
                      }

                      // Standard Bullet or Numbered item
                      if (block.type === 'bullet') {
                        return (
                          <div key={idx} className={`flex items-start gap-3 pl-2 py-1 ${block.isUrdu ? 'flex-row-reverse text-right' : 'text-left'}`} dir={block.isUrdu ? 'rtl' : 'ltr'}>
                            <span className={`${styles.bulletDot} mt-1 text-sm`}>●</span>
                            <p className={`flex-1 ${styles.paragraph} print:text-black ${block.isUrdu ? 'font-urdu text-right' : 'text-left'}`}>
                              {block.text}
                            </p>
                          </div>
                        );
                      }

                      // Generic Heading
                      if (block.type === 'heading') {
                        return (
                          <h3
                            key={idx}
                            className={`text-base md:text-lg font-bold ${styles.sectionTitle} text-center border-b ${styles.divider} print:border-slate-300 pb-2 pt-5`}
                            dir={block.isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={block.isUrdu ? 'font-urdu' : ''}>{block.text}</span>
                          </h3>
                        );
                      }

                      // Standard Book Paragraph
                      return (
                        <p
                          key={idx}
                          className={`${styles.paragraph} print:text-black ${
                            block.isUrdu ? 'text-right font-urdu text-base md:text-lg' : 'text-left text-sm md:text-base'
                          } leading-relaxed`}
                          dir={block.isUrdu ? 'rtl' : 'ltr'}
                        >
                          {block.text}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  // Fallback for Reference Files or Non-parsed documents
                  <div className="text-center py-14 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                      📚
                    </div>
                    <h3 className={`text-xl font-bold ${styles.sectionTitle}`}>
                      {activeChapterData.chapter.title}
                    </h3>
                    <p className="text-xs opacity-70 max-w-md mx-auto">
                      This curriculum resource is indexed and cataloged in the MasterSahib Educational Database ({activeChapterData.chapter.sizeFormatted}).
                    </p>
                    <div className="flex justify-center gap-3 pt-2 no-print">
                      <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg transition flex items-center gap-2"
                      >
                        <HiOutlinePrinter className="w-4 h-4" />
                        <span>Open Print & PDF View</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* ================= BOTTOM NEXT / PREV CHAPTER NAVIGATION ================= */}
              <div className={`flex items-center justify-between gap-4 pt-4 border-t ${styles.divider} no-print`}>
                {prevChapter ? (
                  <button
                    onClick={() => {
                      if (currentSubject) {
                        handleSelectChapter(currentSubject.id, prevChapter.id);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex-1 max-w-xs p-3.5 rounded-2xl ${styles.navButton} border text-left transition space-y-1`}
                  >
                    <span className="text-[10px] opacity-70 flex items-center gap-1 font-semibold uppercase">
                      <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Previous Topic
                    </span>
                    <span className="text-xs font-bold block truncate">
                      {prevChapter.title}
                    </span>
                  </button>
                ) : <div />}

                {nextChapter ? (
                  <button
                    onClick={() => {
                      if (currentSubject) {
                        handleSelectChapter(currentSubject.id, nextChapter.id);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex-1 max-w-xs p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-right transition space-y-1 ml-auto shadow-md`}
                  >
                    <span className="text-[10px] text-blue-100 flex items-center justify-end gap-1 font-semibold uppercase">
                      Next Topic <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold text-white block truncate">
                      {nextChapter.title}
                    </span>
                  </button>
                ) : <div />}
              </div>

            </article>
          ) : (
            <div className="text-center py-20 space-y-3">
              <HiOutlineDocumentText className="w-12 h-12 opacity-40 mx-auto" />
              <h3 className="text-lg font-bold opacity-80">Select a Class or Chapter</h3>
              <p className="text-xs opacity-60">Choose from the left navigation menu to begin reading.</p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-60">Loading MasterSahib Digital Books...</div>}>
      <CurriculumContent />
    </Suspense>
  );
}
