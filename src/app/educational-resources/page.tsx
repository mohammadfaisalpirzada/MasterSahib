'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HiOutlineSearch, HiOutlineChatAlt2 } from 'react-icons/hi';

import {
  latestEducationalResourceTitles,
  educationalResourceItems,
} from '@/app/lib/educationalResources';

const WHAPI_NUM = '923458340669';

const categoryLabels: Record<string, string> = {
  all: 'All',
  kids: 'Kids',
  teachers: 'Teachers',
  parents: 'Parents',
};

const categoryColors: Record<string, string> = {
  all: 'bg-indigo-600 text-white',
  kids: 'bg-pink-500 text-white',
  teachers: 'bg-blue-500 text-white',
  parents: 'bg-emerald-500 text-white',
};

const categoryBg: Record<string, string> = {
  all: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  kids: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  teachers: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  parents: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
};

const ageLabels: Record<string, string> = {
  '3-6': 'Ages 3-6',
  '5-11': 'Ages 5-11',
  '7-12': 'Ages 7-12',
  '13-16': 'Ages 13+',
  general: 'Teachers',
  parents: 'Parents',
};

type SortMode = 'newest' | 'oldest' | 'az' | 'za';

const recentlyAddedTitles = new Set(latestEducationalResourceTitles);

function sortItems(items: typeof educationalResourceItems, mode: SortMode) {
  const copy = [...items];
  switch (mode) {
    case 'newest': return copy.sort((a, b) => (b.addedOn || '').localeCompare(a.addedOn || ''));
    case 'oldest': return copy.sort((a, b) => (a.addedOn || '').localeCompare(b.addedOn || ''));
    case 'az': return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'za': return copy.sort((a, b) => b.title.localeCompare(a.title));
  }
}

export default function EducationalResourcesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const sorted = useMemo(() => sortItems(educationalResourceItems, sortMode), [sortMode]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sorted.filter((tool) => {
      const matchSearch = !q || tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
      const matchCat = category === 'all' || tool.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, sorted]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: educationalResourceItems.length };
    for (const c of ['kids', 'teachers', 'parents']) {
      counts[c] = educationalResourceItems.filter((t) => t.category === c).length;
    }
    return counts;
  }, []);

  const kidsTools = useMemo(() => filtered.filter((t) => t.category === 'kids'), [filtered]);
  const teacherTools = useMemo(() => filtered.filter((t) => t.category === 'teachers'), [filtered]);
  const parentTools = useMemo(() => filtered.filter((t) => t.category === 'parents'), [filtered]);

  const showKids = category === 'all' || category === 'kids';
  const showTeachers = category === 'all' || category === 'teachers';
  const showParents = category === 'all' || category === 'parents';

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Hero */}
        <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl text-white shadow-lg">🎓</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Educational Hub</p>
              <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">Educational Resources</h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Discover fun learning tools for kids, teachers, and parents. Tap a card to start!
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">← Home</Link>
          </div>

          {/* Search + Sort */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex gap-2">
              {([{ v: 'newest', l: '🆕' }, { v: 'oldest', l: '📅' }, { v: 'az', l: 'A→Z' }, { v: 'za', l: 'Z→A' }] as const).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setSortMode(v)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    sortMode === v
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  title={v}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  category === key
                    ? categoryColors[key]
                    : categoryBg[key]
                }`}
              >
                {label} ({catCounts[key] || 0})
              </button>
            ))}
          </div>
        </section>

        {/* Kids Tools - Large colorful cards */}
        {showKids && kidsTools.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <span className="text-2xl">🧒</span> For Kids
              <span className="ml-2 rounded-full bg-pink-100 px-3 py-0.5 text-xs font-bold text-pink-600">{kidsTools.length}</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kidsTools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.status === 'Ready' && tool.href ? tool.href : '#'}
                  className={`group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                    tool.status !== 'Ready' ? 'pointer-events-none opacity-60' : 'cursor-pointer'
                  }`}
                >
                  {/* Gradient header */}
                  <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${tool.color || 'from-gray-400 to-gray-300'}`} />
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color || 'from-gray-400 to-gray-300'} text-3xl text-white shadow-lg transition group-hover:scale-110`}>
                      {tool.icon || '📚'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600">{tool.title}</h3>
                        {recentlyAddedTitles.has(tool.title) && (
                          <span className="inline-flex animate-pulse items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-500">New</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-500 line-clamp-2">{tool.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {tool.ageGroup && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                            {ageLabels[tool.ageGroup]}
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tool.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {tool.status === 'Ready' && (
                    <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                      →
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Teacher Tools */}
        {showTeachers && teacherTools.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <span className="text-2xl">👩‍🏫</span> For Teachers
              <span className="ml-2 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-600">{teacherTools.length}</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teacherTools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.status === 'Ready' && tool.href ? tool.href : '#'}
                  className={`group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                    tool.status !== 'Ready' ? 'pointer-events-none opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${tool.color || 'from-gray-400 to-gray-300'}`} />
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color || 'from-gray-400 to-gray-300'} text-3xl text-white shadow-lg transition group-hover:scale-110`}>
                      {tool.icon || '📚'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600">{tool.title}</h3>
                        {recentlyAddedTitles.has(tool.title) && (
                          <span className="inline-flex animate-pulse items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-500">New</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-500 line-clamp-2">{tool.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {tool.ageGroup && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            {ageLabels[tool.ageGroup]}
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tool.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {tool.status === 'Ready' && (
                    <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      →
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Parent Tools */}
        {showParents && parentTools.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <span className="text-2xl">👨‍👩‍👧</span> For Parents
              <span className="ml-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-600">{parentTools.length}</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parentTools.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.status === 'Ready' && tool.href ? tool.href : '#'}
                  className={`group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl ${
                    tool.status !== 'Ready' ? 'pointer-events-none opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${tool.color || 'from-gray-400 to-gray-300'}`} />
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color || 'from-gray-400 to-gray-300'} text-3xl text-white shadow-lg transition group-hover:scale-110`}>
                      {tool.icon || '📚'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600">{tool.title}</h3>
                        {recentlyAddedTitles.has(tool.title) && (
                          <span className="inline-flex animate-pulse items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-500">New</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-500 line-clamp-2">{tool.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tool.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {tool.status === 'Ready' && (
                    <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                      →
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <section className="rounded-3xl border border-white/50 bg-white/80 p-12 text-center shadow-lg backdrop-blur-sm">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 text-lg font-bold text-slate-700">No resources found</p>
            <p className="mt-2 text-sm text-slate-500">Try a different search or category</p>
            <a
              href={`https://wa.me/${WHAPI_NUM}?text=${encodeURIComponent(`Hi! I'm looking for: ${search}`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 hover:shadow-xl"
            >
              <HiOutlineChatAlt2 className="h-5 w-5" />
              Request via WhatsApp
            </a>
          </section>
        )}

        {/* Contact */}
        <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">💬</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Need something specific?</h2>
                <p className="text-sm text-slate-500">Request a custom resource via WhatsApp</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${WHAPI_NUM}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 hover:shadow-xl"
            >
              <HiOutlineChatAlt2 className="h-5 w-5" />
              WhatsApp 0345-8340669
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
