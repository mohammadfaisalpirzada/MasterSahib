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

type PadletApiResponse = {
  success: boolean;
  items?: PadletPin[];
  message?: string;
};

const padletStyles = [
  'rotate-[-1deg] bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200',
  'rotate-[1deg] bg-gradient-to-br from-cyan-50 to-sky-100 border-cyan-200',
  'rotate-[-2deg] bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200',
  'rotate-[2deg] bg-gradient-to-br from-fuchsia-50 to-pink-100 border-fuchsia-200',
];

const formatPinDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  // Use explicit locale and manual formatting to avoid hydration mismatch
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const hour = date.getUTCHours().toString().padStart(2, '0');
  const minute = date.getUTCMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${hour}:${minute}`;
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

export default function PadletPage() {
  const [pins, setPins] = useState<PadletPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    const loadPadlet = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/padlet', { cache: 'no-store' });
        const data = (await response.json()) as PadletApiResponse;

        if (!response.ok || !data.success || !Array.isArray(data.items)) {
          throw new Error(data.message || 'Unable to load padlet ideas.');
        }

        setPins(ensureUniquePadletPins(data.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load padlet ideas.');
      } finally {
        setLoading(false);
      }
    };

    void loadPadlet();
  }, []);

  const filteredPins = pins.filter((pin) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return pin.idea.toLowerCase().includes(q) || pin.author.toLowerCase().includes(q);
  });

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Public Board</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">Padlet Idea Wall</h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Explore all posted ideas in one place. Scroll, search, and review every pinned suggestion.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by idea or author"
                className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              />
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading ideas...</div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
        ) : null}

        {!loading && !error ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPins.slice(0, visibleCount).map((pin, index) => (
              <article
                key={`${pin.id}-${pin.createdAt}-${index}`}
                className={`relative rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 ${padletStyles[pin.styleIndex % padletStyles.length]}`}
              >
                <span className="absolute -top-2 left-6 inline-flex h-4 w-4 rounded-full border border-white bg-slate-700 shadow" />
                <p className="text-sm leading-6 text-slate-800">{pin.idea}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{pin.author}</span>
                  <span>{formatPinDate(pin.createdAt)}</span>
                </div>
              </article>
            ))}

            {filteredPins.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:col-span-2 lg:col-span-3 xl:col-span-4">
                No ideas found for your search.
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading && !error && filteredPins.length > visibleCount ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 24)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Load More Ideas
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
