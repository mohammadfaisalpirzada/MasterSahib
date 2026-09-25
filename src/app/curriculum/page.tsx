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
  english: 'from-blue-900 via-indigo-950 to-slate-950',
  mathematics: 'from-emerald-900 via-teal-950 to-slate-950',
  urdu: 'from-amber-900 via-orange-950 to-slate-950',
  sindhi: 'from-rose-900 via-pink-950 to-slate-950',
  science: 'from-cyan-900 via-sky-950 to-slate-950',
  computer: 'from-violet-900 via-purple-950 to-slate-950',
  'computer-science': 'from-violet-900 via-purple-950 to-slate-950',
  islamiat: 'from-teal-900 via-emerald-950 to-slate-950',
  'social-studies': 'from-amber-800 via-stone-900 to-slate-950',
  biology: 'from-green-900 via-emerald-950 to-slate-950',
  chemistry: 'from-fuchsia-900 via-purple-950 to-slate-950',
  physics: 'from-blue-950 via-cyan-950 to-slate-950',
  default: 'from-slate-900 via-indigo-950 to-slate-950',
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
    container: 'bg-slate-100 text-slate-900',
    header: 'bg-white/95 border-slate-200 text-slate-800 shadow-sm',
    headerButton: 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200',
    sidebar: 'bg-white border-slate-200 text-slate-800',
    sidebarHeader: 'bg-slate-50 border-slate-200',
    sidebarSelect: 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500',
    sidebarSearch: 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400',
    sidebarSubjectActive: 'bg-blue-600 text-white shadow',
    sidebarSubjectInactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
    sidebarChapterActive: 'bg-blue-600 text-white font-semibold shadow-md',
    sidebarChapterInactive: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
    sidebarChapterBadgeActive: 'bg-white/20 text-white',
    sidebarChapterBadgeInactive: 'bg-slate-200 text-slate-600',
    card: 'bg-white border-slate-200 shadow-xl text-slate-900',
    sectionHeader: 'bg-blue-50/80 border-blue-600 text-blue-950',
    sectionTitle: 'text-blue-950 font-extrabold',
    subSectionHeader: 'bg-slate-100 border-slate-300 text-slate-900 font-bold',
    questionBox: 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-sm',
    questionBadge: 'bg-blue-600 text-white font-bold',
    questionText: 'text-slate-900 font-bold',
    answerBox: 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-sm',
    answerBadge: 'bg-emerald-600 text-white font-bold',
    answerText: 'text-slate-800',
    calloutBox: 'bg-amber-50/90 border-amber-500 text-amber-950 shadow-sm',
    calloutBadge: 'text-amber-800 font-bold',
    calloutText: 'text-slate-900 font-medium',
    bulletDot: 'text-blue-600 font-bold',
    paragraph: 'text-slate-800 leading-relaxed',
    divider: 'border-slate-200',
    navButton: 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm',
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
    sectionHeader: 'bg-blue-950/40 border-blue-500 text-blue-200',
    sectionTitle: 'text-white font-extrabold',
    subSectionHeader: 'bg-slate-800/80 border-slate-700 text-blue-300 font-bold',
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
    sectionHeader: 'bg-[#F3EAD7] border-[#A87B4F] text-[#3D2C1B]',
    sectionTitle: 'text-[#241A10] font-extrabold',
    subSectionHeader: 'bg-[#F0E6D2] border-[#D8C7B0] text-[#4A3722] font-bold',
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
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <HiBookOpen className="w-4 h-4" />
                  <span>Class Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('planning')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'planning'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <HiOutlineClipboardList className="w-4 h-4" />
                  <span>Planning</span>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-6 text-left" dir="ltr">
          
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

                {activeChapterData.chapter.parsedContent &&
                activeChapterData.chapter.parsedContent.content.length > 0 ? (
                  <div className={`space-y-4 ${themeTextSizeClasses} text-left`} dir="ltr">
                    {activeChapterData.chapter.parsedContent.content.map((p, idx) => {
                      const text = p.text;
                      const isUrdu = isUrduOrSindhi(text);

                      // Separator / Divider line
                      if (/^[―\-_=]{3,}$/.test(text)) {
                        return <hr key={idx} className={`my-6 ${styles.divider} print:border-slate-300`} />;
                      }

                      // Main Section Header (e.g., ■ 1. LESSON SUMMARY, ■ 2. WORDS, URDU MEANINGS...)
                      if (/^[■●◆★]\s+[0-9]+[\.\)]/i.test(text) || /^[■●◆★]\s+[A-Z\u0600-\u06FF]/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className={`mt-8 mb-4 p-3.5 md:p-4 rounded-2xl ${styles.sectionHeader} border-l-4 text-center print:bg-slate-100 print:border-slate-800`}
                          >
                            <h2 className={`font-extrabold ${styles.sectionTitle} print:text-black text-base md:text-xl flex items-center justify-center gap-2 ${isUrdu ? 'font-urdu' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                              <span>📘</span>
                              <span>{text.replace(/^[■●◆★]\s+/, '')}</span>
                            </h2>
                          </div>
                        );
                      }

                      // Subsection Header (e.g. ► Part A: ..., ► Part B: ...)
                      if (/^[►▶]\s+/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className={`mt-6 mb-3 px-4 py-2.5 rounded-xl ${styles.subSectionHeader} border text-center font-bold text-sm md:text-base print:bg-slate-50 print:text-black flex items-center justify-center gap-2`}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span>📌</span>
                            <span>{text.replace(/^[►▶]\s+/, '')}</span>
                          </div>
                        );
                      }

                      // Header Line from top of notes (e.g. THE MASTER SAHIB EDUCATIONAL SERIES...)
                      if (/^THE MASTER SAHIB EDUCATIONAL SERIES/i.test(text)) {
                        return (
                          <div key={idx} className="text-center py-2 border-b border-slate-200 dark:border-slate-800 mb-6">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
                              The Master Sahib Educational Series
                            </span>
                            <span className="text-xs font-semibold opacity-75 block mt-0.5">
                              {text.replace(/^THE MASTER SAHIB EDUCATIONAL SERIES\s*/i, '')}
                            </span>
                          </div>
                        );
                      }

                      // Question Detection (e.g. Q1:, Q. 1, Question 1:)
                      if (/^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question\s*[0-9]*[\.:\)])/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className={`mt-6 p-4 rounded-2xl ${styles.questionBox} border space-y-1.5 print:bg-slate-50 print:border-slate-300 text-left`}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={`inline-block px-2.5 py-0.5 rounded-full ${styles.questionBadge} text-xs uppercase tracking-wider mb-1`}>
                              ❓ Question
                            </span>
                            <p className={`${styles.questionText} print:text-black text-sm md:text-base leading-snug ${isUrdu ? 'text-right font-urdu' : 'text-left'}`}>
                              {text}
                            </p>
                          </div>
                        );
                      }

                      // Answer Detection (e.g. Ans:, Answer:, Ans 1:)
                      if (/^(Ans[0-9]*[\.:\)]|Answer[\.:\)])/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl ${styles.answerBox} border-l-4 space-y-1.5 print:bg-slate-50 print:border-emerald-700 text-left`}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={`inline-block px-2.5 py-0.5 rounded-full ${styles.answerBadge} text-xs uppercase tracking-wider mb-1`}>
                              💡 Answer
                            </span>
                            <p className={`${styles.answerText} print:text-black leading-relaxed ${isUrdu ? 'text-right font-urdu text-base md:text-lg' : 'text-left'}`}>
                              {text.replace(/^(Ans[0-9]*[\.:\)]|Answer[\.:\)])\s*/i, '')}
                            </p>
                          </div>
                        );
                      }

                      // Central Idea / Note / Moral Callout Box
                      if (/^(Central Idea|Note|Moral|Rule|Key Point)[\.:\s]/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl ${styles.calloutBox} border-l-4 space-y-1 my-3 text-left`}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className={`font-bold flex items-center gap-1.5 text-xs ${styles.calloutBadge} uppercase tracking-wider`}>
                              <HiOutlineSparkles className="w-4 h-4" /> Important Highlight
                            </span>
                            <p className={`${styles.calloutText} print:text-black leading-relaxed ${isUrdu ? 'text-right font-urdu' : 'text-left'}`}>
                              {text}
                            </p>
                          </div>
                        );
                      }

                      // Standard Bullet or Numbered item
                      if (p.isBullet || /^[\u2022\u25CF\-\*]\s+/.test(text)) {
                        return (
                          <div key={idx} className={`flex items-start gap-3 pl-2 py-1 ${isUrdu ? 'flex-row-reverse text-right' : 'text-left'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                            <span className={`${styles.bulletDot} mt-1 text-sm`}>●</span>
                            <p className={`flex-1 ${styles.paragraph} print:text-black ${isUrdu ? 'font-urdu text-right' : 'text-left'}`}>
                              {text.replace(/^[\u2022\u25CF\-\*]\s+/, '')}
                            </p>
                          </div>
                        );
                      }

                      // Generic Heading
                      if (p.isHeading) {
                        return (
                          <h3
                            key={idx}
                            className={`text-base md:text-lg font-bold ${styles.sectionTitle} text-center border-b ${styles.divider} print:border-slate-300 pb-2 pt-5 flex items-center justify-center gap-2`}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span>📌</span>
                            <span>{text}</span>
                          </h3>
                        );
                      }

                      // Pure Urdu Line
                      if (isUrdu) {
                        return (
                          <p
                            key={idx}
                            className={`${styles.paragraph} print:text-black text-right font-urdu text-base md:text-lg leading-relaxed`}
                            dir="rtl"
                          >
                            {text}
                          </p>
                        );
                      }

                      // Standard Book Paragraph (Strictly Left-to-Right for English)
                      return (
                        <p
                          key={idx}
                          className={`${styles.paragraph} print:text-black text-left text-sm md:text-base leading-relaxed`}
                          dir="ltr"
                        >
                          {text}
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
