'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  HiOutlineChevronDown,
  HiOutlinePrinter,
  HiOutlineViewList,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
} from 'react-icons/hi';

import curriculumData from '@/data/curriculum-data.json';
import { normalizeCurriculum, isPlanningChapter, type Chapter, type ClassItem } from './_lib/normalize';
import { parseChapterBlocks, tableOfContents } from './_lib/parseBlocks';
import { smartCase, hasUrdu, shortTitle, topicFromSeries } from './_lib/text';
import { SpeechProvider, ListenControls, ListenSettings, SpeakButton, useSpeech } from './_components/Speech';
import { ChapterBlocks, blockSpeakItems } from './_components/Blocks';
import { Picker, subjectIcon, chapterLabel, isPdfChapter, type Tab, type SubjectView, type SearchHit } from './_components/Picker';
import css from './reader.module.css';

// ---------------------------------------------------------------- data

const CLASS_ORDER = [
  'class-ece', 'class-i', 'class-ii', 'class-iii', 'class-iv', 'class-v', 'class-vi', 'class-vii',
  'class-viii', 'class-ix', 'class-x', 'class-xi-xii', 'general-templates',
];

// Books are re-filed by their own titles (fixes files sitting in the wrong Drive folder),
// duplicates removed, Computer + Computer Science merged.
const CLASSES: ClassItem[] = normalizeCurriculum((curriculumData.classes as unknown as ClassItem[]) || []).sort((a, b) => {
  const ia = CLASS_ORDER.indexOf(a.id);
  const ib = CLASS_ORDER.indexOf(b.id);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
});

function unitNumber(title: string): number | null {
  const m = title.match(/(?:unit|chapter|lesson|ch)[\s\-_.:#]*([0-9]+)/i) || title.match(/^([0-9]+)[\s\-_.:]/);
  return m ? parseInt(m[1], 10) : null;
}

/** Notes first in unit order, textbook PDFs last. */
function sortChapters(chapters: Chapter[]): Chapter[] {
  return [...chapters].sort((a, b) => {
    const pa = isPdfChapter(a);
    const pb = isPdfChapter(b);
    if (pa !== pb) return pa ? 1 : -1;
    const na = unitNumber(a.title);
    const nb = unitNumber(b.title);
    if (na !== null && nb !== null && na !== nb) return na - nb;
    if (na !== null && nb === null) return -1;
    if (nb !== null && na === null) return 1;
    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/** Strict split: the Notes tab never shows lesson plans and vice versa. */
function subjectsFor(cls: ClassItem | undefined, tab: Tab): SubjectView[] {
  if (!cls) return [];
  return cls.subjects
    .map((s) => ({
      id: s.id,
      name: s.name,
      key: s.key,
      chapters: sortChapters(s.chapters.filter((ch) => (tab === 'planning' ? isPlanningChapter(ch) : !isPlanningChapter(ch)))),
    }))
    .filter((s) => s.chapters.length > 0);
}

const bestChapter = (chapters: Chapter[]) =>
  chapters.find((ch) => ch.isDocx && (ch.parsedContent?.content?.length || 0) > 0) || chapters[0] || null;

const CLASS_COUNTS: Record<Tab, Record<string, number>> = { notes: {}, planning: {} };
for (const c of CLASSES) {
  for (const tab of ['notes', 'planning'] as const) {
    CLASS_COUNTS[tab][c.id] = subjectsFor(c, tab).reduce((n, s) => n + s.chapters.length, 0);
  }
}

// ---------------------------------------------------------------- small hooks

const LAST_VISIT = 'ms_last_active_curriculum_v2';
const PREFS = 'ms_notes_reader_prefs_v1';

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode / storage off: fine, we just won't remember
  }
}
function recall(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Where the site's menu bar currently ends on screen (0 once it has scrolled away), so the reader
 * bar sits right under it and then takes over the top of the screen.
 */
function useSiteHeaderBottom(): number {
  const [bottom, setBottom] = useState(0);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-site-header]');
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setBottom(Math.max(0, Math.round(el.getBoundingClientRect().bottom))));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return bottom;
}

// ---------------------------------------------------------------- page

type Sheet = 'picker' | 'contents' | 'settings' | null;
type ReaderTheme = 'light' | 'sepia' | 'dark';
type FontSize = 'normal' | 'large' | 'xl';

function NotesReader() {
  const searchParams = useSearchParams();
  const { handleTapWord, stop: stopSpeech } = useSpeech();

  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('notes');
  const [classId, setClassId] = useState('class-ix');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [practice, setPractice] = useState(false);
  const chapterRef = useRef(chapterId);
  chapterRef.current = chapterId;

  // 1. Restore: URL first (shared links), then where this student left off, then Class IX.
  useEffect(() => {
    if (ready) return;
    let c = searchParams?.get('class') || '';
    let s = searchParams?.get('subject') || '';
    let ch = searchParams?.get('chapter') || '';
    let t = (searchParams?.get('tab') as Tab) || 'notes';
    if (!CLASSES.some((x) => x.id === c)) {
      try {
        const saved = JSON.parse(recall(LAST_VISIT) || 'null');
        if (saved?.classId && CLASSES.some((x) => x.id === saved.classId)) {
          c = saved.classId;
          s = saved.subjectId || '';
          ch = saved.chapterId || '';
          t = saved.tab || 'notes';
        }
      } catch {
        // ignore a broken saved value
      }
    }
    if (!CLASSES.some((x) => x.id === c)) c = CLASSES.some((x) => x.id === 'class-ix') ? 'class-ix' : CLASSES[0]?.id || '';
    setClassId(c);
    setTab(t === 'planning' ? 'planning' : 'notes');
    setSubjectId(s);
    setChapterId(ch);
    try {
      const prefs = JSON.parse(recall(PREFS) || '{}');
      if (prefs.theme) setTheme(prefs.theme);
      if (prefs.fontSize) setFontSize(prefs.fontSize);
      if (typeof prefs.practice === 'boolean') setPractice(prefs.practice);
    } catch {
      // ignore
    }
    setReady(true);
  }, [ready, searchParams]);

  useEffect(() => {
    if (ready) store(PREFS, JSON.stringify({ theme, fontSize, practice }));
  }, [ready, theme, fontSize, practice]);

  const currentClass = useMemo(() => CLASSES.find((c) => c.id === classId) || CLASSES[0], [classId]);
  const subjects = useMemo(() => subjectsFor(currentClass, tab), [currentClass, tab]);

  // 2. Keep a valid subject + chapter for the chosen class/tab.
  useEffect(() => {
    if (!ready) return;
    if (subjects.length === 0) {
      setSubjectId('');
      setChapterId('');
      return;
    }
    const owner = subjects.find((s) => s.chapters.some((ch) => ch.id === chapterRef.current));
    if (owner) {
      setSubjectId(owner.id);
      return;
    }
    const savedSubject = recall(`ms_last_subj_${classId}_${tab}`);
    const savedChapter = recall(`ms_last_chap_${classId}_${tab}`);
    const subj = subjects.find((s) => s.id === subjectId) || subjects.find((s) => s.id === savedSubject) || subjects[0];
    setSubjectId(subj.id);
    const keep = subj.chapters.find((ch) => ch.id === savedChapter);
    setChapterId((keep || bestChapter(subj.chapters))?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, classId, tab, subjects]);

  const subject = subjects.find((s) => s.id === subjectId) || subjects[0];
  const chapter = subject?.chapters.find((ch) => ch.id === chapterId) || null;
  const chapterIndex = subject && chapter ? subject.chapters.indexOf(chapter) : -1;
  const prev = chapterIndex > 0 ? subject!.chapters[chapterIndex - 1] : null;
  const next = subject && chapterIndex >= 0 && chapterIndex < subject.chapters.length - 1 ? subject.chapters[chapterIndex + 1] : null;

  // 3. Remember + keep the URL shareable.
  useEffect(() => {
    if (!ready || !classId) return;
    store(LAST_VISIT, JSON.stringify({ classId, subjectId, chapterId, tab, timestamp: Date.now() }));
    if (subjectId) store(`ms_last_subj_${classId}_${tab}`, subjectId);
    if (chapterId) store(`ms_last_chap_${classId}_${tab}`, chapterId);
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('class', classId);
      params.set('tab', tab);
      if (subjectId) params.set('subject', subjectId);
      else params.delete('subject');
      if (chapterId) params.set('chapter', chapterId);
      else params.delete('chapter');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    } catch {
      // ignore
    }
  }, [ready, classId, subjectId, chapterId, tab]);

  useEffect(() => {
    stopSpeech();
  }, [chapterId, stopSpeech]);

  const openChapter = useCallback((sId: string, cId: string) => {
    setSubjectId(sId);
    setChapterId(cId);
    setSheet(null);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // ------------------------------------------------ content
  const blocks = useMemo(() => parseChapterBlocks(chapter?.parsedContent?.content), [chapter]);
  // The body without the series line, and without dividers that only add empty space
  // (at the top, doubled up, or right before a section heading).
  const body = useMemo(() => {
    const rest = blocks.filter((b) => b.type !== 'series');
    return rest.filter(
      (b, i) => !(b.type === 'divider' && (i === 0 || rest[i - 1]?.type === 'divider' || rest[i + 1]?.type === 'section' || i === rest.length - 1))
    );
  }, [blocks]);
  const toc = useMemo(() => tableOfContents(body), [body]);
  const listenItems = useMemo(() => {
    const items = blockSpeakItems(body);
    return chapter ? [{ key: 'title', text: chapterLabel(chapter) }, ...items] : items;
  }, [body, chapter]);
  const urduChapter = useMemo(
    () => ['urdu', 'sindhi', 'islamiat'].includes(subject?.key || '') || hasUrdu(chapter?.title || ''),
    [subject, chapter]
  );
  const minutes = Math.max(2, Math.round((chapter?.parsedContent?.paragraphCount || 0) / 20));
  const unit = chapter ? unitNumber(chapter.title) : null;
  const series = blocks.find((b) => b.type === 'series');
  const { topic, lessons } = topicFromSeries(series && series.type === 'series' ? series.subText : undefined);
  const nameOf = (ch: Chapter) => shortTitle(chapterLabel(ch), subject?.name);
  const heading = chapter ? topic || nameOf(chapter) : '';

  const hits: SearchHit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: SearchHit[] = [];
    for (const c of CLASSES) {
      for (const s of c.subjects) {
        for (const ch of s.chapters) {
          if (
            chapterLabel(ch).toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            (ch.parsedContent?.content || []).some((p) => p.text.toLowerCase().includes(q))
          ) {
            out.push({
              classId: c.id,
              className: c.standardName || c.name,
              subjectId: s.id,
              subjectName: s.name,
              chapter: ch,
              tab: isPlanningChapter(ch) ? 'planning' : 'notes',
            });
            if (out.length >= 30) return out;
          }
        }
      }
    }
    return out;
  }, [query]);

  // ------------------------------------------------ layout: sticky offsets, progress, active section
  const siteHeaderH = useSiteHeaderBottom();
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(56);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const update = () => setBarH(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const stickyOffset = siteHeaderH + barH;

  const articleRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = articleRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight + stickyOffset;
        setProgress(total > 0 ? Math.min(1, Math.max(0, (stickyOffset - rect.top) / total)) : 0);
        let current = '';
        for (const item of toc) {
          const h = document.getElementById(item.id);
          if (h && h.getBoundingClientRect().top - stickyOffset - 40 <= 0) current = item.id;
        }
        setActiveSection(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [toc, stickyOffset, chapterId]);

  // Esc closes sheets; lock page scroll while a sheet is open on phones.
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(null);
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [sheet]);

  const jumpTo = (id: string) => {
    setSheet(null);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const pickerProps = {
    tab,
    onTab: (t: Tab) => setTab(t),
    classes: CLASSES.map((c) => ({ ...c, count: CLASS_COUNTS[tab][c.id] || 0 })),
    classId,
    onClass: (id: string) => {
      setClassId(id);
      setSubjectId('');
      setQuery('');
    },
    subjects,
    subjectId: subject?.id || '',
    onSubject: (s: SubjectView) => {
      const ch = bestChapter(s.chapters);
      setSubjectId(s.id);
      setChapterId(ch?.id || '');
    },
    chapterId,
    onChapter: openChapter,
    query,
    onQuery: setQuery,
    hits,
    onHit: (h: SearchHit) => {
      setTab(h.tab);
      setClassId(h.classId);
      openChapter(h.subjectId, h.chapter.id);
    },
  };

  const sizeClass = fontSize === 'xl' ? css.sizeXl : fontSize === 'large' ? css.sizeLarge : css.sizeNormal;
  const vars = { '--sticky-offset': `${stickyOffset}px` } as CSSProperties;

  return (
    <div className={`${css.reader} min-h-screen`} data-theme={theme} style={vars} dir="ltr">
      {/* ---------------------------------------------------------- reader bar */}
      <div
        ref={barRef}
        style={{ top: siteHeaderH }}
        className="no-print sticky z-30 border-b border-[var(--line)] bg-[var(--page)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--page)]/85"
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-3 py-2 sm:px-5">
          <button
            type="button"
            onClick={() => setSheet('picker')}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 text-left hover:bg-[var(--paper)] lg:hidden"
            aria-label="Choose class, subject and chapter"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-lg" aria-hidden>
              {subjectIcon(subject?.key || '')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-[var(--ink-soft)]">
                {currentClass?.standardName || currentClass?.name}
                {subject ? `, ${subject.name}` : ''}
              </span>
              <span className="block truncate text-[15px] font-bold text-[var(--ink)]">
                {chapter ? heading : 'Choose a chapter'}
              </span>
            </span>
            <HiOutlineChevronDown className="h-5 w-5 shrink-0 text-[var(--ink-soft)]" aria-hidden />
          </button>

          <p className="hidden min-w-0 flex-1 truncate px-1 text-[15px] font-bold text-[var(--ink)] lg:block">
            {chapter ? heading : 'STBB Notes'}
          </p>

          {toc.length > 1 && (
            <button
              type="button"
              onClick={() => setSheet('contents')}
              className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)] xl:hidden"
              aria-label="Contents of this chapter"
            >
              <HiOutlineViewList className="h-5 w-5" />
              <span className="hidden sm:inline">Contents</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSheet('settings')}
            className="flex h-10 min-w-10 items-center justify-center rounded-xl px-2.5 text-[15px] font-bold text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
            aria-label="Text size, colours and practice mode"
          >
            Aa
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)] sm:flex"
            aria-label="Print or save as PDF"
          >
            <HiOutlinePrinter className="h-5 w-5" />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>
        <div className="h-[3px] w-full bg-transparent" aria-hidden>
          <div className={`${css.progress} h-full bg-[var(--accent)]`} style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      {/* ---------------------------------------------------------- columns */}
      <div className="mx-auto flex max-w-[1440px] items-start gap-6 px-0 sm:px-5 lg:gap-8">
        {/* Desktop picker */}
        <aside
          className="no-print sticky hidden w-[290px] shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--page)] lg:flex lg:flex-col"
          style={{ top: stickyOffset + 16, height: `calc(100dvh - ${stickyOffset + 32}px)`, marginTop: 16 }}
          aria-label="Choose class, subject and chapter"
        >
          <Picker {...pickerProps} />
        </aside>

        {/* Chapter */}
        <main className="min-w-0 flex-1 pb-16 pt-4 sm:pt-6">
          {chapter ? (
            <article ref={articleRef} className="mx-auto max-w-[760px]">
              {/* Header */}
              <header className="px-4 sm:px-0">
                {chapter.bannerImage && (
                  <div className="mb-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--page)]">
                    <Image
                      src={chapter.bannerImage}
                      alt=""
                      width={1200}
                      height={500}
                      className="block h-auto w-full object-contain"
                      priority
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex items-stretch gap-4">
                  {unit !== null && !isPdfChapter(chapter) && (
                    <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[var(--accent)] py-2 text-white sm:w-20" aria-hidden>
                      <span className="text-[12px] font-semibold opacity-90">{tab === 'planning' ? 'Plan' : 'Unit'}</span>
                      <span className="text-[2rem] font-bold leading-none sm:text-[2.6rem]">{unit}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1 self-center">
                    <p className="text-[13px] font-semibold text-[var(--accent-strong)]">
                      {currentClass?.standardName || currentClass?.name}
                      {subject ? `, ${subject.name}` : ''}
                      {topic ? `, ${nameOf(chapter)}` : ''}
                    </p>
                    <h1 className="mt-1 text-[1.6rem] font-bold leading-tight text-[var(--ink)] sm:text-[2.1rem]">
                      <SpeakButton id="title" text={heading} className="me-2 align-middle" />
                      {heading}
                    </h1>
                    {lessons.length > 0 && (
                      <p className="mt-1.5 text-[15px] text-[var(--ink-soft)]">Lessons: {lessons.join(', ')}</p>
                    )}
                    {!isPdfChapter(chapter) && (
                      <p className="mt-1 text-[13px] text-[var(--ink-faint)]">
                        About {minutes} minutes to read
                        {chapter.medium ? `. ${chapter.medium} medium` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {blocks.length > 0 && (
                  <div className="no-print mt-5 flex flex-wrap items-center gap-2">
                    <ListenControls items={listenItems} />
                    {blocks.some((b) => b.type === 'answer') && (
                      <button
                        type="button"
                        onClick={() => setPractice(!practice)}
                        aria-pressed={practice}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                          practice
                            ? 'border-[var(--pen)] bg-[var(--pen-soft)] text-[var(--pen)]'
                            : 'border-[var(--line)] bg-[var(--page)] text-[var(--ink-soft)] hover:border-[var(--pen)]'
                        }`}
                        title="Cover the answers so you can test yourself"
                      >
                        <span aria-hidden>✍️</span> {practice ? 'Practice mode on' : 'Practice mode'}
                      </button>
                    )}
                  </div>
                )}

                {/* Phone/tablet contents strip */}
                {toc.length > 1 && (
                  <nav className={`no-print mt-5 -mx-4 overflow-x-auto px-4 xl:hidden ${css.noScrollbar}`} aria-label="Jump to a section">
                    <ul className="flex w-max gap-2 pb-1">
                      {toc.filter((t) => t.level === 1).map((t) => (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => jumpTo(t.id)}
                            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                              activeSection === t.id
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                : 'border-[var(--line)] bg-[var(--page)] text-[var(--ink-soft)] hover:border-[var(--accent)]'
                            }`}
                          >
                            {t.number ? `${t.number}. ` : ''}
                            {smartCase(t.title).slice(0, 42)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </header>

              {/* Body */}
              <div
                className={`mt-6 border-y border-[var(--line)] bg-[var(--page)] px-4 py-6 sm:rounded-3xl sm:border sm:px-8 sm:py-8 ${sizeClass}`}
                onClick={handleTapWord}
              >
                <div className="mb-6 hidden border-b border-black pb-3 print:block">
                  <p className="font-bold">The Master Sahib: STBB Notes</p>
                  <p className="text-xs">
                    {currentClass?.name}, {subject?.name}. themastersahib.com
                  </p>
                </div>

                {blocks.length > 0 ? (
                  <ChapterBlocks blocks={body} urduChapter={urduChapter} practice={practice} />
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-4xl" aria-hidden>📕</p>
                    <h2 className="mt-3 text-lg font-bold">{chapterLabel(chapter)}</h2>
                    <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--ink-soft)]">
                      This is the official STBB textbook ({chapter.sizeFormatted}). It can’t be read on this page yet.
                      Open a unit’s notes from the chapter list to study it here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSheet('picker')}
                      className="mt-5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white lg:hidden"
                    >
                      Choose a chapter
                    </button>
                  </div>
                )}
              </div>

              {/* Previous / next */}
              <nav className="no-print mt-6 grid grid-cols-2 gap-3 px-4 sm:px-0" aria-label="Other chapters">
                {prev ? (
                  <button
                    type="button"
                    onClick={() => openChapter(subject!.id, prev.id)}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--page)] p-3.5 text-left hover:border-[var(--accent)]"
                  >
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--ink-faint)]">
                      <HiOutlineArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm font-bold text-[var(--ink)]">{nameOf(prev)}</span>
                  </button>
                ) : (
                  <span />
                )}
                {next ? (
                  <button
                    type="button"
                    onClick={() => openChapter(subject!.id, next.id)}
                    className="rounded-2xl bg-[var(--accent)] p-3.5 text-right text-white hover:bg-[var(--accent-strong)]"
                  >
                    <span className="flex items-center justify-end gap-1 text-[12px] font-semibold text-white/85">
                      Next <HiOutlineArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm font-bold">{nameOf(next)}</span>
                  </button>
                ) : (
                  <span />
                )}
              </nav>
            </article>
          ) : (
            <div className="mx-auto max-w-md px-6 py-20 text-center">
              <p className="text-4xl" aria-hidden>📚</p>
              <h1 className="mt-3 text-xl font-bold">
                {subjects.length === 0 ? `No ${tab === 'notes' ? 'notes' : 'lesson plans'} for this class yet` : 'Choose a chapter to start reading'}
              </h1>
              <p className="mt-2 text-[15px] text-[var(--ink-soft)]">
                {subjects.length === 0
                  ? `Try ${tab === 'notes' ? 'lesson plans' : 'STBB notes'}, or pick another class.`
                  : 'Pick your class, subject and unit.'}
              </p>
              <button
                type="button"
                onClick={() => setSheet('picker')}
                className="mt-5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white lg:hidden"
              >
                Choose class and chapter
              </button>
            </div>
          )}
        </main>

        {/* Desktop "On this page" */}
        {toc.length > 1 && (
          <aside
            className="no-print sticky hidden w-[220px] shrink-0 xl:block"
            style={{ top: stickyOffset + 16, maxHeight: `calc(100dvh - ${stickyOffset + 32}px)`, marginTop: 16 }}
            aria-label="On this page"
          >
            <p className="mb-2 px-2 text-[13px] font-bold text-[var(--ink)]">On this page</p>
            <ul className="space-y-0.5 overflow-y-auto pr-1" style={{ maxHeight: `calc(100dvh - ${stickyOffset + 70}px)` }}>
              {toc.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(t.id)}
                    className={`block w-full rounded-lg py-1.5 text-left text-[13px] leading-snug transition ${t.level === 2 ? 'pl-5 pr-2' : 'px-2 font-semibold'} ${
                      activeSection === t.id
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {t.number ? `${t.number}. ` : ''}
                    {smartCase(t.title)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {/* ---------------------------------------------------------- sheets (phones/tablets; settings everywhere) */}
      {sheet && (
        <div className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-[#0d1424]/55" aria-label="Close" onClick={() => setSheet(null)} />
          <div
            className={`${css.sheetIn} relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-[var(--page)] text-[var(--ink)] shadow-2xl sm:max-w-lg sm:rounded-3xl ${
              sheet === 'picker' ? 'h-[88dvh] sm:h-[80dvh]' : ''
            }`}
          >
            <span className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-[var(--line)] sm:hidden" aria-hidden />
            <div className="flex items-center justify-between border-b border-[var(--line)] py-2.5 pl-5 pr-3">
              <h2 className="text-base font-bold">
                {sheet === 'picker' ? 'Choose a chapter' : sheet === 'contents' ? 'In this chapter' : 'Reading settings'}
              </h2>
              <button type="button" onClick={() => setSheet(null)} className="rounded-full p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper)]" aria-label="Close">
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {sheet === 'picker' && (
              <div className="min-h-0 flex-1">
                <Picker {...pickerProps} />
              </div>
            )}

            {sheet === 'contents' && (
              <ul className="min-h-0 flex-1 overflow-y-auto p-2">
                {toc.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(t.id)}
                      className={`block w-full rounded-xl py-2.5 text-left text-[15px] leading-snug ${t.level === 2 ? 'pl-8 pr-3 text-[var(--ink-soft)]' : 'px-3 font-semibold'} ${
                        activeSection === t.id ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'hover:bg-[var(--paper)]'
                      }`}
                    >
                      {t.number ? `${t.number}. ` : ''}
                      {smartCase(t.title)}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {sheet === 'settings' && (
              <div className="space-y-5 overflow-y-auto p-5">
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-[var(--ink-soft)]">Text size</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['normal', 'A', 'text-base'],
                        ['large', 'A', 'text-xl'],
                        ['xl', 'A', 'text-2xl'],
                      ] as const
                    ).map(([v, l, size]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFontSize(v)}
                        aria-pressed={fontSize === v}
                        aria-label={v === 'normal' ? 'Normal text' : v === 'large' ? 'Large text' : 'Extra large text'}
                        className={`h-12 rounded-xl border font-bold ${size} ${
                          fontSize === v ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'border-[var(--line)]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-[var(--ink-soft)]">Page colour</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['light', 'White', '#ffffff', '#1b2540'],
                        ['sepia', 'Paper', '#fbf6ec', '#33291c'],
                        ['dark', 'Night', '#151d2c', '#e7ecf5'],
                      ] as const
                    ).map(([v, label, bg, fg]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTheme(v)}
                        aria-pressed={theme === v}
                        className={`h-12 rounded-xl border-2 text-sm font-bold ${theme === v ? 'border-[var(--accent)]' : 'border-[var(--line)]'}`}
                        style={{ background: bg, color: fg }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <ListenSettings />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] p-3">
                  <input type="checkbox" checked={practice} onChange={(e) => setPractice(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                  <span>
                    <span className="block text-[15px] font-bold">Practice mode</span>
                    <span className="block text-sm text-[var(--ink-soft)]">Answers stay covered until you tap them, so you can test yourself first.</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSheet(null);
                    setTimeout(() => window.print(), 50);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] py-3 text-sm font-bold sm:hidden"
                >
                  <HiOutlinePrinter className="h-5 w-5" /> Print or save as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function ClassNotesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center opacity-60">Loading STBB Notes…</div>}>
      <SpeechProvider>
        <NotesReader />
      </SpeechProvider>
    </Suspense>
  );
}
