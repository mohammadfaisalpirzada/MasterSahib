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
  HiOutlineCheckCircle,
  HiOutlineBookmark,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineSparkles,
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

function CurriculumContent() {
  const searchParams = useSearchParams();
  const classes: ClassItem[] = curriculumData.classes;

  // Selected state
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'class-ece');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Initialize selected class & chapter from query params if available
  useEffect(() => {
    const classParam = searchParams?.get('class');
    const chapterParam = searchParams?.get('chapter');
    if (classParam && classes.some((c) => c.id === classParam)) {
      setSelectedClassId(classParam);
    }
    if (chapterParam) {
      setSelectedChapterId(chapterParam);
    }
  }, [searchParams, classes]);

  // Current active class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Automatically expand subjects of current class
  useEffect(() => {
    if (currentClass) {
      const initialExpanded: Record<string, boolean> = {};
      currentClass.subjects.forEach((subj) => {
        initialExpanded[subj.id] = true;
      });
      setExpandedSubjects(initialExpanded);

      // Default select first chapter of first subject if none selected or not in current class
      const allClassChapters = currentClass.subjects.flatMap((s) => s.chapters);
      const isCurrentSelectedInClass = allClassChapters.some((ch) => ch.id === selectedChapterId);
      if (!isCurrentSelectedInClass && allClassChapters.length > 0) {
        setSelectedChapterId(allClassChapters[0].id);
      }
    }
  }, [currentClass]);

  // Active Subject & Active Chapter lookup
  const activeChapterData = useMemo(() => {
    for (const c of classes) {
      for (const s of c.subjects) {
        const found = s.chapters.find((ch) => ch.id === selectedChapterId);
        if (found) {
          return { currentClass: c, currentSubject: s, chapter: found };
        }
      }
    }
    const defaultSubject = currentClass?.subjects[0];
    const defaultChapter = defaultSubject?.chapters[0];
    return {
      currentClass,
      currentSubject: defaultSubject,
      chapter: defaultChapter,
    };
  }, [classes, currentClass, selectedChapterId]);

  // Next & Prev navigation items
  const allCurrentClassChapters = useMemo(() => {
    return (currentClass?.subjects || []).flatMap((s) =>
      s.chapters.map((ch) => ({ ...ch, subjectName: s.name }))
    );
  }, [currentClass]);

  const currentIndex = allCurrentClassChapters.findIndex((ch) => ch.id === selectedChapterId);
  const prevChapter = currentIndex > 0 ? allCurrentClassChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < allCurrentClassChapters.length - 1
      ? allCurrentClassChapters[currentIndex + 1]
      : null;

  // Search Results across all curriculum
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: Array<{
      classId: string;
      className: string;
      subjectName: string;
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
              className: c.name,
              subjectName: s.name,
              chapter: ch,
            });
          }
        }
      }
    }
    return results.slice(0, 20); // Limit to top 20
  }, [classes, searchQuery]);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSubjectKey = activeChapterData?.currentSubject?.key || 'default';
  const gradientClass = BANNER_GRADIENTS[currentSubjectKey] || BANNER_GRADIENTS.default;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Breadcrumb Bar & Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
            aria-label="Toggle Table of Contents"
          >
            {isSidebarOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenuAlt2 className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <HiBookOpen className="w-4 h-4" /> Class Notes & Planning
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-slate-200 font-bold hidden sm:inline">
              {activeChapterData.currentClass?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            title="Download clean print-ready PDF"
          >
            <HiOutlinePrinter className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main App Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden">
        
        {/* ================= LEFT SIDEBAR (Table of Contents / Navigation) ================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 md:static w-80 lg:w-88 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } no-print`}
        >
          {/* Class Selector Dropdown */}
          <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Class / Grade
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                {currentClass?.totalFiles} Resources
              </span>
            </div>

            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSearchQuery('');
              }}
              className="w-full bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.totalFiles} Notes & Plans)
                </option>
              ))}
            </select>

            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes, chapters, topics..."
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

          {/* Table of Contents Tree */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {searchQuery.trim() ? (
              // Search Results Mode
              <div className="space-y-2">
                <div className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <p className="p-3 text-slate-500 text-center">No notes matching &quot;{searchQuery}&quot;</p>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.chapter.id}
                      onClick={() => {
                        setSelectedClassId(item.classId);
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
              // Standard Subject / Chapter Tree
              currentClass?.subjects.map((subject) => {
                const isExpanded = expandedSubjects[subject.id] !== false;
                return (
                  <div key={subject.id} className="space-y-1">
                    <button
                      onClick={() => toggleSubject(subject.id)}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-emerald-400">📁</span>
                        <span>{subject.name}</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-normal">
                          {subject.chapterCount}
                        </span>
                        {isExpanded ? (
                          <HiOutlineChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <HiOutlineChevronRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-0.5 pl-3 border-l border-slate-800 ml-3">
                        {subject.chapters.map((chapter) => {
                          const isActive = chapter.id === selectedChapterId;
                          return (
                            <button
                              key={chapter.id}
                              onClick={() => {
                                setSelectedChapterId(chapter.id);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-r-xl transition flex items-start gap-2 ${
                                isActive
                                  ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="text-slate-500 mt-0.5">
                                {chapter.isDocx ? '📄' : '📕'}
                              </span>
                              <div className="flex-1 truncate">
                                <span className="block truncate">{chapter.title}</span>
                                <span className="text-[10px] text-slate-500 block">
                                  {chapter.isDocx ? 'Lesson Plan / Notes' : 'Reference PDF'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
            <span className="text-[11px] text-slate-500 block">
              Government School Curriculum System
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">
              MasterSahib Digital Books
            </span>
          </div>
        </aside>

        {/* ================= MAIN CHAPTER READER VIEW ================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 space-y-6">
          
          {activeChapterData.chapter ? (
            <article className="max-w-4xl mx-auto space-y-6">
              
              {/* ================= CUSTOM CHAPTER COVER BANNER ================= */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group print:border-none print:shadow-none">
                {activeChapterData.chapter.bannerImage ? (
                  <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[380px] bg-slate-900">
                    <Image
                      src={activeChapterData.chapter.bannerImage}
                      alt={activeChapterData.chapter.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-200 w-fit mb-2">
                        <span>{activeChapterData.currentClass?.name}</span>
                        <span>•</span>
                        <span>{activeChapterData.currentSubject?.name}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                        {activeChapterData.chapter.title}
                      </h1>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-full min-h-[180px] md:min-h-[260px] bg-gradient-to-r ${gradientClass} flex flex-col justify-end p-6 md:p-8 relative text-white`}
                  >
                    {/* MasterSahib Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-semibold">
                      <span className="text-emerald-400">★</span> MasterSahib Academic Series
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider text-slate-200">
                        <span>{activeChapterData.currentClass?.name}</span>
                        <span>•</span>
                        <span>{activeChapterData.currentSubject?.name}</span>
                      </div>
                      <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        {activeChapterData.chapter.title}
                      </h1>
                      <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
                        Standard Scheme of Studies, Learning Outcomes (SLOs), Lesson Plans, and Solved Questions under Sindh Curriculum.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar for Print/Download */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 no-print shadow-sm">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <HiOutlineCheckCircle className="w-4 h-4" /> Ready to View & Print
                  </span>
                  <span>•</span>
                  <span>{activeChapterData.chapter.isDocx ? 'Structured Digital Document' : 'Official Reference Book'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition"
                  >
                    <HiOutlinePrinter className="w-4 h-4" />
                    <span>Download / Print Clean PDF</span>
                  </button>
                </div>
              </div>

              {/* ================= CHAPTER CONTENT BODY ================= */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-6 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
                
                {/* Print Header for PDF Export */}
                <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">The Master Sahib Educational Hub</h2>
                      <p className="text-xs text-slate-600">Government School Curriculum & Lesson Plannings</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold">{activeChapterData.currentClass?.name} - {activeChapterData.currentSubject?.name}</p>
                      <p className="text-slate-500">https://themastersahib.com</p>
                    </div>
                  </div>
                </div>

                {activeChapterData.chapter.parsedContent &&
                activeChapterData.chapter.parsedContent.content.length > 0 ? (
                  <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base print:text-black">
                    {activeChapterData.chapter.parsedContent.content.map((p, idx) => {
                      if (p.isHeading) {
                        return (
                          <h2
                            key={idx}
                            className="text-lg md:text-xl font-bold text-white print:text-black border-b border-slate-800 print:border-slate-300 pb-2 pt-4 flex items-center gap-2"
                          >
                            <span className="text-blue-400 print:text-black">📌</span>
                            <span>{p.text}</span>
                          </h2>
                        );
                      }

                      if (p.isBullet) {
                        return (
                          <div key={idx} className="flex items-start gap-3 pl-2 py-1">
                            <span className="text-emerald-400 print:text-black mt-1">●</span>
                            <p className="flex-1 text-slate-300 print:text-black">{p.text}</p>
                          </div>
                        );
                      }

                      return (
                        <p key={idx} className="text-slate-300 print:text-black text-sm md:text-base">
                          {p.text}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  // Fallback for Reference Files or Non-parsed documents
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto text-2xl">
                      📚
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {activeChapterData.chapter.title}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      This curriculum resource is linked and organized in the MasterSahib Government School Database ({activeChapterData.chapter.sizeFormatted}).
                    </p>
                    <div className="flex justify-center gap-3 pt-2 no-print">
                      <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg"
                      >
                        🖨️ Open Print & PDF View
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* ================= BOTTOM NEXT / PREV NAVIGATION ================= */}
              <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-800 no-print">
                {prevChapter ? (
                  <button
                    onClick={() => {
                      setSelectedChapterId(prevChapter.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 max-w-xs p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition space-y-1"
                  >
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold uppercase">
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
                    className="flex-1 max-w-xs p-3.5 rounded-2xl bg-blue-600/20 border border-blue-500 hover:bg-blue-600/30 text-right transition space-y-1 ml-auto"
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading MasterSahib Curriculum Books...</div>}>
      <CurriculumContent />
    </Suspense>
  );
}
