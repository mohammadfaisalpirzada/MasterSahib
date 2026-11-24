'use client';

import { HiOutlineSearch, HiOutlineX, HiBookOpen, HiOutlineClipboardList } from 'react-icons/hi';
import type { Chapter, ClassItem } from '../_lib/normalize';
import { shortTitle } from '../_lib/text';

export type Tab = 'notes' | 'planning';
export type SubjectView = { id: string; name: string; key: string; chapters: Chapter[] };
export type SearchHit = { classId: string; className: string; subjectId: string; subjectName: string; chapter: Chapter; tab: Tab };

const SUBJECT_ICONS: Record<string, string> = {
  english: '📖', mathematics: '📐', urdu: '📗', sindhi: '🪶', science: '🔬', computer: '💻', islamiat: '🕌',
  'social-studies': '🌍', biology: '🧬', chemistry: '🧪', physics: '⚡', general: '📋', 'general-knowledge': '💡',
};

export const subjectIcon = (key: string) => SUBJECT_ICONS[key] || '📚';
export const chapterLabel = (ch: Chapter) => ch.displayTitle || ch.title;
export const isPdfChapter = (ch: Chapter) => ch.isPdf || !ch.isDocx;

type Props = {
  tab: Tab;
  onTab: (t: Tab) => void;
  classes: Array<ClassItem & { count: number }>;
  classId: string;
  onClass: (id: string) => void;
  subjects: SubjectView[];
  subjectId: string;
  onSubject: (s: SubjectView) => void;
  chapterId: string;
  onChapter: (subjectId: string, chapterId: string) => void;
  query: string;
  onQuery: (q: string) => void;
  hits: SearchHit[];
  onHit: (h: SearchHit) => void;
};

export function Picker(p: Props) {
  const subject = p.subjects.find((s) => s.id === p.subjectId) || p.subjects[0];
  let noteNumber = 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 p-4">
        {/* Notes / Planning */}
        <div className="grid grid-cols-2 rounded-xl bg-[var(--paper)] p-1" role="tablist" aria-label="What to read">
          {(
            [
              ['notes', 'STBB Notes', HiBookOpen],
              ['planning', 'Lesson plans', HiOutlineClipboardList],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={p.tab === value}
              onClick={() => p.onTab(value)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition ${
                p.tab === value ? 'bg-[var(--page)] text-[var(--accent-strong)] shadow-sm' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </button>
          ))}
        </div>

        {/* Class */}
        <label className="block">
          <span className="mb-1 block text-[13px] font-semibold text-[var(--ink-soft)]">Class</span>
          <select
            value={p.classId}
            onChange={(e) => p.onClass(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--page)] px-3 py-2.5 text-[15px] font-semibold text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          >
            {p.classes.map((c) => (
              <option key={c.id} value={c.id} disabled={c.count === 0}>
                {c.standardName || c.name}
                {c.count === 0 ? ' (coming soon)' : ` (${c.count})`}
              </option>
            ))}
          </select>
        </label>

        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" aria-hidden />
          <input
            type="search"
            value={p.query}
            onChange={(e) => p.onQuery(e.target.value)}
            placeholder="Search all notes"
            aria-label="Search all notes"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--page)] py-2.5 pl-9 pr-9 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
          {p.query && (
            <button
              type="button"
              onClick={() => p.onQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {p.query.trim() ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <p className="mb-2 text-[13px] font-semibold text-[var(--ink-soft)]">
            {p.hits.length === 0 ? `Nothing found for “${p.query}”. Try a shorter word.` : `${p.hits.length} result${p.hits.length === 1 ? '' : 's'}`}
          </p>
          <ul className="space-y-1.5">
            {p.hits.map((h) => (
              <li key={`${h.classId}-${h.chapter.id}`}>
                <button
                  type="button"
                  onClick={() => p.onHit(h)}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-3 py-2.5 text-left hover:border-[var(--accent)]"
                >
                  <span className="block text-[12px] font-semibold text-[var(--accent-strong)]">
                    {h.className}, {h.subjectName}
                  </span>
                  <span className="block truncate text-sm font-semibold text-[var(--ink)]">{chapterLabel(h.chapter)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {/* Subjects */}
          <div className="border-y border-[var(--line)] px-4 py-3">
            <p className="mb-2 text-[13px] font-semibold text-[var(--ink-soft)]">Subject</p>
            {p.subjects.length === 0 ? (
              <p className="text-sm text-[var(--ink-soft)]">
                No {p.tab === 'notes' ? 'notes' : 'lesson plans'} for this class yet.{' '}
                <button type="button" onClick={() => p.onTab(p.tab === 'notes' ? 'planning' : 'notes')} className="font-bold text-[var(--accent-strong)] underline">
                  See {p.tab === 'notes' ? 'lesson plans' : 'notes'}
                </button>
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {p.subjects.map((s) => {
                  const on = s.id === subject?.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => p.onSubject(s)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
                        on
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                          : 'border-[var(--line)] bg-[var(--page)] text-[var(--ink)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <span aria-hidden>{subjectIcon(s.key)}</span>
                      {s.name}
                      <span className={on ? 'text-white/80' : 'text-[var(--ink-faint)]'}>{s.chapters.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chapters */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2" aria-label="Chapters">
            <ul className="space-y-0.5">
              {(subject?.chapters || []).map((ch, i) => {
                const on = ch.id === p.chapterId;
                const pdf = isPdfChapter(ch);
                const prevPdf = i > 0 && isPdfChapter(subject!.chapters[i - 1]);
                if (!pdf) noteNumber++;
                return (
                  <li key={ch.id}>
                    {pdf && !prevPdf && <p className="mx-2 mt-4 mb-1 text-[12px] font-semibold text-[var(--ink-faint)]">Textbooks (PDF)</p>}
                    <button
                      type="button"
                      onClick={() => p.onChapter(subject!.id, ch.id)}
                      aria-current={on ? 'page' : undefined}
                      className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                        on ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'text-[var(--ink)] hover:bg-[var(--paper)]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-md text-[12px] font-bold ${
                          on ? 'bg-[var(--accent)] text-white' : 'bg-[var(--paper)] text-[var(--ink-soft)]'
                        }`}
                        aria-hidden
                      >
                        {pdf ? '📕' : noteNumber}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold leading-snug">{shortTitle(chapterLabel(ch), subject?.name)}</span>
                        {ch.medium && <span className="block text-[12px] text-[var(--ink-faint)]">{ch.medium} medium</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
