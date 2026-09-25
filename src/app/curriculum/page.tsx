'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiBookOpen,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineSearch,
  HiOutlinePrinter,
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineClipboardList,
  HiOutlineAcademicCap,
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
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

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
  const [selectedClassId, setSelectedClassId] = useState<string>('class-x');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Search & Reader states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
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

  // Available subjects in current class filtered by active tab
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
        return {
          ...s,
          filteredChapters: filteredChapters.length > 0 ? filteredChapters : s.chapters,
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

  // Sync selected subject & chapter when class or tab changes
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const subjectMatch = availableSubjects.find((s) => s.id === selectedSubjectId);
      const activeSubj = subjectMatch || availableSubjects[0];
      setSelectedSubjectId(activeSubj.id);

      const isCurrentChapterInSubject = activeSubj.filteredChapters.some((ch) => ch.id === selectedChapterId);
      if (!isCurrentChapterInSubject && activeSubj.filteredChapters.length > 0) {
        setSelectedChapterId(activeSubj.filteredChapters[0].id);
      }
    }
  }, [selectedClassId, activeTab, availableSubjects]);

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
    const defaultChapter = defaultSubject?.filteredChapters?.[0] || defaultSubject?.chapters[0];
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

  // Theme Classes for the Reader Canvas
  const themeContainerClasses = {
    dark: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#FAF8F5] text-stone-900',
    light: 'bg-white text-slate-900',
  }[readerTheme];

  const themeCardClasses = {
    dark: 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-xl',
    sepia: 'bg-[#F4EFEA] border-stone-300 text-stone-800 shadow-md',
    light: 'bg-slate-50 border-slate-200 text-slate-800 shadow-md',
  }[readerTheme];

  const themeTextSizeClasses = {
    normal: 'text-sm md:text-base leading-relaxed',
    large: 'text-base md:text-lg leading-loose',
    xl: 'text-lg md:text-xl leading-loose',
  }[fontSize];

  return (
    <div className={`min-h-screen ${themeContainerClasses} flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200`}>
      
      {/* ================= TOP APPLICATION & BREADCRUMB BAR ================= */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40 px-3 md:px-6 py-2.5 flex items-center justify-between no-print shadow-sm text-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenuAlt2 className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-blue-400 transition font-semibold">
              MasterSahib
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-bold flex items-center gap-1.5">
              <HiBookOpen className="w-4 h-4" /> Digital Books & Planning
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-200 font-bold hidden sm:inline">
              {activeChapterData.currentClass?.standardName || activeChapterData.currentClass?.name}
            </span>
          </div>
        </div>

        {/* Reader Control Tools */}
        <div className="flex items-center gap-2">
          
          {/* Font Size Adjuster */}
          <div className="hidden lg:flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5 text-xs font-bold text-slate-300">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg transition ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg transition ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
              title="Large Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-1 rounded-lg transition ${fontSize === 'xl' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
              title="Extra Large Font Size"
            >
              A++
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5 text-xs font-bold text-slate-300">
            <button
              onClick={() => setReaderTheme('dark')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${readerTheme === 'dark' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              title="Dark Mode"
            >
              🌙
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${readerTheme === 'sepia' ? 'bg-[#EDE4D8] text-stone-900 shadow' : 'text-slate-400 hover:text-white'}`}
              title="Book Paper / Sepia Mode"
            >
              📜
            </button>
            <button
              onClick={() => setReaderTheme('light')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${readerTheme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
              title="Light Mode"
            >
              ☀️
            </button>
          </div>

          {/* Focus Mode (Toggle Sidebar) */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isFocusMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
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
            className={`fixed inset-y-0 left-0 z-30 md:static w-80 lg:w-88 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } no-print text-slate-200`}
          >
            {/* Top Mode Tabs: Class Notes vs Lesson Planning */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/70 space-y-3">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <HiBookOpen className="w-4 h-4 text-white" />
                  <span>Class Notes</span>
                </button>

                <button
                  onClick={() => setActiveTab('planning')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'planning'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <HiOutlineClipboardList className="w-4 h-4 text-white" />
                  <span>Planning</span>
                </button>
              </div>

              {/* Step 1: Clean Standard Class Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Select Class / Grade
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSearchQuery('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <HiOutlineSearch className="w-4 h-4 text-slate-500 absolute left-2.5 top-2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Subject Selector Bar */}
            {!searchQuery.trim() && (
              <div className="p-3 border-b border-slate-800 bg-slate-950/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
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
                          setSelectedSubjectId(subj.id);
                          if (subj.filteredChapters.length > 0) {
                            setSelectedChapterId(subj.filteredChapters[0].id);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
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

            {/* Step 3: Chapter / Topic List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
              {searchQuery.trim() ? (
                // Search Results View
                <div className="space-y-2">
                  <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <p className="p-4 text-slate-500 text-center">No results matching &quot;{searchQuery}&quot;</p>
                  ) : (
                    searchResults.map((item) => (
                      <button
                        key={item.chapter.id}
                        onClick={() => {
                          setSelectedClassId(item.classId);
                          setSelectedSubjectId(item.subjectId);
                          setSelectedChapterId(item.chapter.id);
                          setSearchQuery('');
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition ${
                          item.chapter.id === selectedChapterId
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] text-emerald-400 block font-semibold">
                          {item.className} • {item.subjectName}
                        </span>
                        <span className="font-semibold text-xs text-white block truncate">
                          {item.chapter.title}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Standard Chapter List for Selected Subject
                <div className="space-y-1">
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>{currentSubject?.name} Chapters</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {currentSubjectChapters.length} {activeTab === 'notes' ? 'Notes' : 'Plans'}
                    </span>
                  </div>

                  {currentSubjectChapters.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No resources available for this selection.</div>
                  ) : (
                    currentSubjectChapters.map((chapter, idx) => {
                      const isActive = chapter.id === selectedChapterId;
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            setSelectedChapterId(chapter.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start gap-2.5 ${
                            isActive
                              ? 'bg-blue-600 text-white font-semibold shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                          }`}
                        >
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="flex-1 truncate">
                            <span className="block truncate text-xs font-semibold">{chapter.title}</span>
                            <span className={`text-[10px] block ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                              {chapter.isDocx ? (activeTab === 'notes' ? 'Interactive Book / Notes' : 'Lesson Plan') : 'Reference PDF'}
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
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
              <span className="text-[11px] text-slate-400 block font-medium">
                MasterSahib Digital Book Series
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                Sindh Textbook & Curriculum Aligned
              </span>
            </div>
          </aside>
        )}

        {/* ================= MAIN DIGITAL BOOK READER CANVAS ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-6">
          
          {activeChapterData.chapter ? (
            <article className="max-w-4xl mx-auto space-y-8">
              
              {/* ================= E-BOOK CHAPTER HEADER & BANNER ================= */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group print:border-none print:shadow-none">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-200 w-fit mb-2">
                        <span>{activeChapterData.currentClass?.standardName || activeChapterData.currentClass?.name}</span>
                        <span>•</span>
                        <span>{activeChapterData.currentSubject?.name}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{readingTime}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                        {activeChapterData.chapter.title}
                      </h1>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full min-h-[190px] md:min-h-[260px] bg-gradient-to-r ${gradientClass} flex flex-col justify-end p-6 md:p-8 relative text-white`}
                  >
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold">
                      <span className="text-emerald-400">★</span> MasterSahib Academic Series
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">{readingTime}</span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-200">
                        <span>{activeChapterData.currentClass?.standardName || activeChapterData.currentClass?.name}</span>
                        <span>•</span>
                        <span>{activeChapterData.currentSubject?.name}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        {activeChapterData.chapter.title}
                      </h1>
                      <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
                        {activeTab === 'notes'
                          ? 'Standard Scheme of Studies, Learning Outcomes (SLOs), Lesson Summaries, and Solved Textbook Exercises.'
                          : 'Comprehensive Lesson Planning, Term Syllabus Scheme, and Teacher Pedagogical Guides.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= CHAPTER CONTENT: BOOK-STYLE READER ================= */}
              <div className={`rounded-3xl p-6 md:p-10 lg:p-12 space-y-6 ${themeCardClasses} print:bg-white print:text-black print:border-none print:shadow-none print:p-0`}>
                
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
                  <div className={`space-y-4 ${themeTextSizeClasses}`}>
                    {activeChapterData.chapter.parsedContent.content.map((p, idx) => {
                      const text = p.text;
                      const isUrdu = isUrduOrSindhi(text);

                      // Separator / Divider line
                      if (/^[―\-_=]{3,}$/.test(text)) {
                        return <hr key={idx} className="my-6 border-slate-700/60 print:border-slate-300" />;
                      }

                      // Main Section Header (e.g., ■ 1. LESSON SUMMARY, ■ 2. SHORT QUESTIONS)
                      if (/^[■●◆★]\s+[0-9]+[\.\)]/i.test(text) || /^[■●◆★]\s+[A-Z\u0600-\u06FF]/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className="mt-8 mb-4 p-3.5 md:p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border-l-4 border-blue-500 print:bg-slate-100 print:border-slate-800"
                          >
                            <h2 className={`font-extrabold text-white print:text-black text-base md:text-xl flex items-center gap-2 ${isUrdu ? 'font-urdu text-right justify-end' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
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
                            className="mt-6 mb-3 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-blue-300 font-bold text-sm md:text-base print:bg-slate-50 print:text-black"
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span>📌</span> {text.replace(/^[►▶]\s+/, '')}
                          </div>
                        );
                      }

                      // Question Detection (e.g. Q1:, Q. 1, Question 1:)
                      if (/^(Q[0-9]+[\.:\)]|Q[\.:\)]|Question\s*[0-9]*[\.:\)])/i.test(text)) {
                        return (
                          <div
                            key={idx}
                            className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-blue-500/40 space-y-1 shadow-sm print:bg-slate-50 print:border-slate-300"
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                              ❓ Question
                            </span>
                            <p className="font-bold text-white print:text-black text-sm md:text-base">
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
                            className="p-4 rounded-2xl bg-emerald-950/20 border-l-4 border-emerald-500 space-y-1 print:bg-slate-50 print:border-emerald-700"
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                              💡 Answer
                            </span>
                            <p className="text-slate-200 print:text-black leading-relaxed">
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
                            className="p-4 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 print:text-black print:bg-amber-50 space-y-1 my-3"
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className="font-bold flex items-center gap-1.5 text-xs text-amber-400 uppercase tracking-wider">
                              <HiOutlineSparkles className="w-4 h-4" /> Important Highlight
                            </span>
                            <p className="font-medium text-slate-100 print:text-black">{text}</p>
                          </div>
                        );
                      }

                      // Standard Bullet or Numbered item
                      if (p.isBullet || /^[\u2022\u25CF\-\*]\s+/.test(text)) {
                        return (
                          <div key={idx} className="flex items-start gap-3 pl-2 py-0.5" dir={isUrdu ? 'rtl' : 'ltr'}>
                            <span className="text-emerald-400 font-bold mt-1 text-sm">●</span>
                            <p className="flex-1 text-slate-300 print:text-black">
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
                            className="text-base md:text-lg font-bold text-white print:text-black border-b border-slate-800 print:border-slate-300 pb-2 pt-4 flex items-center gap-2"
                            dir={isUrdu ? 'rtl' : 'ltr'}
                          >
                            <span className="text-blue-400 print:text-black">📌</span>
                            <span>{text}</span>
                          </h3>
                        );
                      }

                      // Standard Book Paragraph
                      return (
                        <p
                          key={idx}
                          className={`text-slate-300 print:text-black leading-relaxed ${isUrdu ? 'text-right font-urdu text-base md:text-lg' : ''}`}
                          dir={isUrdu ? 'rtl' : 'ltr'}
                        >
                          {text}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  // Fallback for Reference Files or Non-parsed documents
                  <div className="text-center py-14 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                      📚
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {activeChapterData.chapter.title}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
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
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800 no-print">
                {prevChapter ? (
                  <button
                    onClick={() => {
                      setSelectedChapterId(prevChapter.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 max-w-xs p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition space-y-1 shadow-md"
                  >
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
                      <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Previous Topic
                    </span>
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {prevChapter.title}
                    </span>
                  </button>
                ) : <div />}

                {nextChapter ? (
                  <button
                    onClick={() => {
                      setSelectedChapterId(nextChapter.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 max-w-xs p-3.5 rounded-2xl bg-blue-600/20 border border-blue-500 hover:bg-blue-600/30 text-right transition space-y-1 ml-auto shadow-md"
                  >
                    <span className="text-[10px] text-blue-400 flex items-center justify-end gap-1 font-semibold uppercase">
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
              <HiOutlineDocumentText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-300">Select a Class or Chapter</h3>
              <p className="text-xs text-slate-500">Choose from the left navigation menu to begin reading.</p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading MasterSahib Digital Books...</div>}>
      <CurriculumContent />
    </Suspense>
  );
}
