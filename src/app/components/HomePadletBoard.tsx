'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${day} ${month}`;
};

const ensureUniquePadletPins = (items: PadletPin[]): PadletPin[] => {
  const seenIds = new Map<string, number>();
  return items.map((item) => {
    const count = seenIds.get(item.id) || 0;
    seenIds.set(item.id, count + 1);
    if (count === 0) {
      return item;
    }
    return {
      ...item,
      id: `${item.id}-${count}`,
    };
  });
};

const HOME_PADLET_LIMIT = 4;

export default function HomePadletBoard() {
  const [pins, setPins] = useState<PadletPin[]>(defaultPins);
  const [ideaAuthor, setIdeaAuthor] = useState('');
  const [ideaText, setIdeaText] = useState('');
  const [ideaError, setIdeaError] = useState('');
  const [padletLoading, setPadletLoading] = useState(true);
  const [padletSaving, setPadletSaving] = useState(false);

  useEffect(() => {
    const loadPadlet = async () => {
      try {
        setPadletLoading(true);
        const response = await fetch('/api/padlet', { cache: 'no-store' });
        const data = (await response.json()) as PadletApiResponse;

        if (!response.ok || !data.success || !Array.isArray(data.items)) {
          throw new Error(data.message || 'Unable to load ideas.');
        }

        setPins(ensureUniquePadletPins(data.items));
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

      setPins((current) => ensureUniquePadletPins([data.item as PadletPin, ...current]));
      setIdeaText('');
      setIdeaAuthor('');
    } catch (error) {
      setIdeaError(error instanceof Error ? error.message : 'Unable to save idea.');
    } finally {
      setPadletSaving(false);
    }
  };

  return (
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

            {pins.slice(0, HOME_PADLET_LIMIT).map((pin, index) => (
              <article
                key={`${pin.id}-${pin.createdAt}-${index}`}
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
  );
}
