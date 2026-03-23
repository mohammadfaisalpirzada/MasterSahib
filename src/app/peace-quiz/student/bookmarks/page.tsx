'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PeaceQuizNavbar from '../../../components/PeaceQuizNavbar';
import { fetchAuthSession } from '../../../lib/auth';
import { getQuizProgramName } from '../../../lib/quizBranding';

const BOOKMARKS_KEY_PREFIX = 'mastersahib_bookmarks';
const BOOKMARKED_PRACTICE_KEY_PREFIX = 'mastersahib_bookmarked_practice';
const LAST_SESSION_KEY = 'mastersahib_last_practice_session';

type BookmarkedQuestion = {
  id: string;
  text: string;
  options: string[];
  subject: string;
  difficulty: string;
  classLevel: string;
  programName: string;
  savedAt: string;
};

export default function BookmarksPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [programName, setProgramName] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const session = await fetchAuthSession();
      const uname = session?.username || 'Student';
      const pname = session?.programName || getQuizProgramName();
      setUsername(uname);
      setProgramName(pname);

      try {
        const raw = localStorage.getItem(`${BOOKMARKS_KEY_PREFIX}_${pname}_${uname}`);
        if (raw) {
          const parsed = JSON.parse(raw) as BookmarkedQuestion[];
          setBookmarks(parsed.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
        }
      } catch {
        setBookmarks([]);
      }
    };

    load();
  }, []);

  const removeBookmark = (id: string) => {
    const key = `${BOOKMARKS_KEY_PREFIX}_${programName}_${username}`;
    const updated = bookmarks.filter((b) => b.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setBookmarks(updated);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const startBookmarkedPractice = () => {
    if (!bookmarks.length) return;

    const practiceKey = `${BOOKMARKED_PRACTICE_KEY_PREFIX}_${programName}_${username}`;
    localStorage.setItem(practiceKey, JSON.stringify(bookmarks));

    const config = {
      classLevel: bookmarks[0].classLevel || '',
      subject: 'Bookmarked',
      difficulty: 'Easy',
      questionCount: String(bookmarks.length),
      customQuestionCount: '',
      mode: 'Bookmarks',
      programName,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(config));
    router.push('/peace-quiz/student/attempt');
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <PeaceQuizNavbar role="student" />

        <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Bookmarks</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">Saved Questions</h1>
              <p className="mt-1 text-sm text-slate-600">
                {username} · {bookmarks.length} bookmarked
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/peace-quiz/student"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700"
              >
                ← Dashboard
              </Link>
              {bookmarks.length > 0 && (
                <button
                  type="button"
                  onClick={startBookmarkedPractice}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  📚 Practice Bookmarked Only
                </button>
              )}
            </div>
          </div>

          {bookmarks.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-4xl">⭐</p>
              <p className="mt-3 text-lg font-semibold text-slate-700">No bookmarks yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Tap ⭐ on any question during practice to save it here.
              </p>
              <Link
                href="/peace-quiz/student/start-practice"
                className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Start Practice
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {bookmarks.map((bm) => {
                const isExpanded = expandedIds.has(bm.id);
                const savedDate = new Date(bm.savedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={bm.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                            {bm.subject}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              bm.difficulty.toLowerCase() === 'hard'
                                ? 'bg-rose-100 text-rose-700'
                                : bm.difficulty.toLowerCase() === 'easy'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {bm.difficulty}
                          </span>
                          {bm.classLevel && (
                            <span className="text-xs text-slate-400">Class {bm.classLevel}</span>
                          )}
                          <span className="text-xs text-slate-400">Saved {savedDate}</span>
                        </div>
                        <p className="mt-2 font-semibold text-slate-900">{bm.text}</p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => toggleExpand(bm.id)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                        >
                          {isExpanded ? 'Hide' : 'Options'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBookmark(bm.id)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          aria-label="Remove bookmark"
                        >
                          ❌
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 grid gap-2">
                        {bm.options.map((opt, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
                          >
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
