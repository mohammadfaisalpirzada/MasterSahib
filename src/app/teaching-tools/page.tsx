'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HiOutlineSearch, HiOutlineChatAlt2 } from 'react-icons/hi';

import {
  latestEducationalResourceTitles,
  sortedEducationalResourceItems,
  educationalResourceItems,
} from '@/app/lib/educationalResources';

const WHAPI_NUM = '923458340669';

const categoryLabels: Record<string, string> = {
  all: 'All Resources',
  kids: '🧒 For Kids',
  teachers: '👩‍🏫 For Teachers',
  parents: '👨‍👩‍👧 For Parents',
};

const ageLabels: Record<string, string> = {
  '3-6': 'Ages 3-6',
  '7-12': 'Ages 7-12',
  '13-16': 'Ages 13-16',
  general: 'Teachers',
  parents: 'Parents',
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const recentlyAddedTitles = new Set(latestEducationalResourceTitles);

export default function TeachingToolsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [shuffled, setShuffled] = useState(() => shuffle(sortedEducationalResourceItems));

  const handleShuffle = () => setShuffled(shuffle(sortedEducationalResourceItems));

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return shuffled.filter((tool) => {
      const matchSearch = !q || tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
      const matchCat = category === 'all' || tool.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, shuffled]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: educationalResourceItems.length };
    for (const c of ['kids', 'teachers', 'parents']) {
      counts[c] = educationalResourceItems.filter((t) => t.category === c).length;
    }
    return counts;
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Educational Hub</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Educational Resources</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Discover tools for kids, teachers, and parents. Use the tabs below to filter.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back to Home</Link>
            <button type="button" onClick={handleShuffle} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">🔀 Shuffle</button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500" />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setCategory(key)} className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${category === key ? 'bg-indigo-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {label} ({catCounts[key] || 0})
              </button>
            ))}
          </div>
        </section>

        {filtered.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2">
            {filtered.map((tool) => (
              <article key={tool.title} className="group relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{tool.title}</h2>
                    {recentlyAddedTitles.has(tool.title) ? (
                      <span className="inline-flex animate-pulse items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-red-600">New</span>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tool.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{tool.status}</span>
                </div>
                {tool.ageGroup ? (
                  <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">{ageLabels[tool.ageGroup]}</span>
                ) : null}
                <p className="mt-1 text-sm leading-6 text-slate-600">{tool.description}</p>
                <div className="mt-4">
                  {tool.href && tool.href !== '#' ? (
                    <Link href={tool.href} className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Open Resource</Link>
                  ) : (
                    <span className="inline-flex rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">Setup Pending</span>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">No resources match your search.</p>
            <a
              href={`https://wa.me/${WHAPI_NUM}?text=${encodeURIComponent(`Hi! I'm looking for an educational resource on: ${search}`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <HiOutlineChatAlt2 className="h-4 w-4" />
              Request via WhatsApp
            </a>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Missing something?</h2>
              <p className="text-sm text-slate-600">If you need a specific resource, send a message on WhatsApp and I&apos;ll add it.</p>
            </div>
            <a
              href={`https://wa.me/${WHAPI_NUM}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <HiOutlineChatAlt2 className="h-4 w-4" />
              WhatsApp 0345-8340669
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
