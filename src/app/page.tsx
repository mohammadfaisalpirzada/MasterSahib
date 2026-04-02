'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

const quickCards = [
  {
    title: 'Quiz',
    description: 'Attempt quiz modules, check progress, and practice daily.',
    href: '/peace-quiz',
    accent: 'from-cyan-500 to-sky-600',
  },
  {
    title: 'GGSS',
    description: 'Open GGSS staff and profile management workspace.',
    href: '/ggss-nishtar-road',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Contact',
    description: 'Get in touch quickly for support and collaboration.',
    href: '/contact',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Educational Resources',
    description: 'Open classroom utilities, lesson planning, and daily school helpers.',
    href: '/teaching-tools',
    accent: 'from-fuchsia-500 to-pink-600',
  },
];

const highlights = [
  { label: 'Fast Access', value: '1 Click' },
  { label: 'Modules', value: '4+' },
  { label: 'Daily Ready', value: '100%' },
];

type PadletPin = {
  id: string;
  author: string;
  idea: string;
  createdAt: string;
  styleIndex: number;
};

const padletStyles = [
  'rotate-[-1deg] bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200',
  'rotate-[1deg] bg-gradient-to-br from-cyan-50 to-sky-100 border-cyan-200',
  'rotate-[-2deg] bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200',
  'rotate-[2deg] bg-gradient-to-br from-fuchsia-50 to-pink-100 border-fuchsia-200',
];

const defaultPins: PadletPin[] = [
  {
    id: 'seed-1',
    author: 'Areeba (Class 8)',
    idea: 'Add a daily 10-question revision quiz with instant feedback.',
    createdAt: '2026-03-29T08:30:00.000Z',
    styleIndex: 0,
  },
  {
    id: 'seed-2',
    author: 'Sir Hamza',
    idea: 'Create a quick attendance summary tool for weekly parent updates.',
    createdAt: '2026-03-29T09:10:00.000Z',
    styleIndex: 1,
  },
  {
    id: 'seed-3',
    author: 'Student Council',
    idea: 'Add a shared notice pin area for events, tests, and deadlines.',
    createdAt: '2026-03-29T09:45:00.000Z',
    styleIndex: 2,
  },
];

type PadletApiResponse = {
  success: boolean;
  items?: PadletPin[];
  item?: PadletPin;
  message?: string;
};

const formatPinDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
  });
};

type VisitorCountApiResponse = {
  success: boolean;
  count?: number;
  message?: string;
};

export default function HomePage() {
  const HOME_PADLET_LIMIT = 4;
  const { data: session } = useSession();
  const [pins, setPins] = useState<PadletPin[]>(defaultPins);
  const [ideaAuthor, setIdeaAuthor] = useState('');
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [ideaText, setIdeaText] = useState('');
  const [ideaError, setIdeaError] = useState('');
  const [padletLoading, setPadletLoading] = useState(true);
  const [padletSaving, setPadletSaving] = useState(false);

  useEffect(() => {
    const countVisit = async () => {
      try {
        const alreadyCounted = sessionStorage.getItem('ms_visited');
        if (!alreadyCounted) {
          const response = await fetch('/api/visitor-count', { method: 'POST' });
          const data = (await response.json()) as VisitorCountApiResponse;
          if (data.success && typeof data.count === 'number') {
            setVisitorCount(data.count);
            sessionStorage.setItem('ms_visited', '1');
          }
        } else {
          const response = await fetch('/api/visitor-count');
          const data = (await response.json()) as VisitorCountApiResponse;
          if (data.success && typeof data.count === 'number') {
            setVisitorCount(data.count);
          }
        }
      } catch {
        // Visitor counter is non-critical
      }
    };

    void countVisit();
  }, []);

  useEffect(() => {
    const loadPadlet = async () => {
      try {
        setPadletLoading(true);
        const response = await fetch('/api/padlet', { cache: 'no-store' });
        const data = (await response.json()) as PadletApiResponse;

        if (!response.ok || !data.success || !Array.isArray(data.items)) {
          throw new Error(data.message || 'Unable to load ideas.');
        }

        setPins(data.items);
      } catch (error) {
        setIdeaError(error instanceof Error ? error.message : 'Unable to load ideas.');
      } finally {
        setPadletLoading(false);
      }
    };

    void loadPadlet();
  }, []);

  const handleAddIdea = async () => {
    const author = ideaAuthor.trim() || 'Anonymous';
    const idea = ideaText.trim();

    if (!idea) {
      setIdeaError('Please write an idea before posting.');
      return;
    }

    try {
      setPadletSaving(true);
      setIdeaError('');

      const response = await fetch('/api/padlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, idea }),
      });

      const data = (await response.json()) as PadletApiResponse;
      if (!response.ok || !data.success || !data.item) {
        throw new Error(data.message || 'Unable to save idea.');
      }

      setPins((current) => [data.item as PadletPin, ...current]);
      setIdeaText('');
      setIdeaAuthor('');
    } catch (error) {
      setIdeaError(error instanceof Error ? error.message : 'Unable to save idea.');
    } finally {
      setPadletSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="absolute -left-20 top-[-120px] h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute right-[-90px] top-14 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div className="space-y-6">
              <p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Master Sahib Workspace
              </p>

              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                One Clean Entry
                <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  For Learning + Teaching
                </span>
              </h1>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/peace-quiz"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
                >
                  Open Quiz
                </Link>
                <Link
                  href="/teaching-tools"
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
                >
                  Open Educational Resources
                </Link>
                {!session ? (
                  <button
                    onClick={() => signIn('google')}
                    className="rounded-2xl border border-cyan-300 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                  >
                    Sign in with Google
                  </button>
                ) : (
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                    Welcome, {session.user?.name || 'User'}!
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
              <div className="grid grid-cols-3 gap-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                    <p className="text-xl font-black text-slate-900 sm:text-2xl">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Visitors</span>
                <span className="text-xl font-black text-cyan-800">
                  {visitorCount !== null ? visitorCount.toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Access</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Core Modules</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
              <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              <div className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900">
                Open
                <span className="ml-2 transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="rounded-full border border-cyan-200 bg-cyan-100/80 px-2 py-1 text-cyan-800">
                  Public board: no login required
                </span>
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Community Idea Padlet</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Anyone can drop a new idea. Notes are pinned here in a live wall style so everyone can see and build on them.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <p className="text-sm font-bold text-slate-900">Post a New Idea</p>
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={ideaAuthor}
                  onChange={(event) => setIdeaAuthor(event.target.value)}
                  placeholder="Your name (optional)"
                  className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                />
                <textarea
                  rows={4}
                  value={ideaText}
                  onChange={(event) => setIdeaText(event.target.value)}
                  placeholder="Write your idea..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddIdea}
                    disabled={padletSaving}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {padletSaving ? 'Pinning...' : 'Pin Idea'}
                  </button>
                  {ideaError ? <p className="text-sm font-medium text-rose-600">{ideaError}</p> : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {padletLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:col-span-2">
                  Loading ideas...
                </div>
              ) : null}

              {!padletLoading && pins.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:col-span-2">
                  No ideas yet. Be the first to pin one.
                </div>
              ) : null}

              {pins.slice(0, HOME_PADLET_LIMIT).map((pin) => (
                <article
                  key={pin.id}
                  className={`relative rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 ${padletStyles[pin.styleIndex % padletStyles.length]}`}
                >
                  <span className="absolute -top-2 left-6 inline-flex h-4 w-4 rounded-full border border-white bg-slate-700 shadow" />
                  <p className="pr-2 text-sm leading-6 text-slate-800">{pin.idea}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{pin.author}</span>
                    <span>{formatPinDate(pin.createdAt)}</span>
                  </div>
                </article>
              ))}

              {!padletLoading && pins.length > HOME_PADLET_LIMIT ? (
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                  <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    +{pins.length - HOME_PADLET_LIMIT} more ideas available
                  </span>
                  <Link
                    href="/padlet"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Open Idea Wall →
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Master Sahib</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">Learning Hub</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Clean digital workspace for quiz, GGSS management, and daily teaching flow.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <Link href="/peace-quiz" className="transition hover:text-slate-900">Quiz</Link>
              <Link href="/ggss-nishtar-road" className="transition hover:text-slate-900">GGSS</Link>
              <Link href="/teaching-tools" className="transition hover:text-slate-900">Educational Resources</Link>
              <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Workspace</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <p>Fast module access</p>
              <p>Teacher daily tools</p>
              <p>Profile & data workflow</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Support</p>
            <p className="mt-3 text-sm text-slate-600">Need a new tool? Share requirements in Contact.</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Request Feature
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Master Sahib. All rights reserved.</p>
            <p>Built for practical daily use.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

