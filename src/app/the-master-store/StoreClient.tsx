'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LuArrowDownToLine, LuArrowUpRight, LuSearch, LuX, LuPackageOpen, LuCheck } from 'react-icons/lu';
import { getStoreIcon } from './store-icons';

/*
 * Brand palette (@the_master_store)
 *   Deep Navy   #0A1128  — page background
 *   Electric Cyan #00D2FF — primary accent / glow
 *   Vivid Orange  #FF7A00 — secondary accent
 * The store is intentionally dark-only.
 */

export type StoreCategory = 'Education' | 'Office' | 'Scripts' | 'Utilities';

export type StoreItem = {
  id: string;
  fileName: string;
  title: string;
  category: StoreCategory;
  caption: string;
  features: string[];
  icon: string;
  version: string | null;
  format: string;
  sizeBytes: number;
  modified: string;
  downloadUrl: string;
  external: boolean;
  kind?: 'download' | 'webapp';
  github?: { owner: string; repo: string; tag: string | null; asset: string };
};

const FILTERS = ['All', 'Education', 'Office', 'Scripts', 'Utilities'] as const;
type Filter = (typeof FILTERS)[number];

/** Icon tiles alternate the two brand accents so the grid reads cyan/orange. */
const CATEGORY_STYLE: Record<StoreCategory, { tile: string; glow: string; chip: string }> = {
  Education: {
    tile: 'from-[#00D2FF] via-[#00A8E8] to-[#0066FF]',
    glow: 'shadow-[0_8px_28px_-6px_rgba(0,210,255,0.65)]',
    chip: 'bg-[#00D2FF]/10 text-[#7FE7FF] ring-[#00D2FF]/30',
  },
  Office: {
    tile: 'from-[#33E1C4] via-[#00C2D1] to-[#0089C7]',
    glow: 'shadow-[0_8px_28px_-6px_rgba(0,194,209,0.6)]',
    chip: 'bg-teal-400/10 text-teal-200 ring-teal-300/30',
  },
  Scripts: {
    tile: 'from-[#FFB347] via-[#FF7A00] to-[#E8481C]',
    glow: 'shadow-[0_8px_28px_-6px_rgba(255,122,0,0.65)]',
    chip: 'bg-[#FF7A00]/10 text-[#FFB27A] ring-[#FF7A00]/30',
  },
  Utilities: {
    tile: 'from-[#FFD166] via-[#FF9A3C] to-[#FF5E62]',
    glow: 'shadow-[0_8px_28px_-6px_rgba(255,154,60,0.6)]',
    chip: 'bg-amber-400/10 text-amber-200 ring-amber-300/30',
  },
};

function formatSize(bytes: number): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)} ${units[i]}`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StoreClient({ items }: { items: StoreItem[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { All: items.length, Education: 0, Office: 0, Scripts: 0, Utilities: 0 };
    for (const it of items) c[it.category]++;
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== 'All' && it.category !== filter) return false;
      if (!q) return true;
      return [it.title, it.caption, it.category, it.format, it.fileName, ...it.features]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, filter]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1128] text-slate-100">
      {/* Ambient neon glows + faint tech grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,210,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[28rem] w-[28rem] rounded-full bg-[#00D2FF]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-[28rem] h-[26rem] w-[26rem] rounded-full bg-[#FF7A00]/10 blur-[120px]" />

      {/* Hero — brand banner */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <h1 className="sr-only">The Master Store — Smart everyday tools &amp; utilities to simplify your work</h1>
          <div className="relative rounded-[28px] p-[1px] [background:linear-gradient(135deg,rgba(0,210,255,0.6),rgba(255,255,255,0.08)_40%,rgba(255,122,0,0.55))]">
            <Image
              src="/images/the-master-store-banner.jpg"
              alt="The Master Store — Smart everyday tools & utilities to simplify your work. Free & easy downloads. A project by The Master Sahib."
              width={1024}
              height={572}
              priority
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="h-auto w-full rounded-[27px] shadow-[0_30px_80px_-20px_rgba(0,210,255,0.35)]"
            />
          </div>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-2xl">
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[#00D2FF]/70" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps, tools, scripts…"
              aria-label="Search the store"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-12 pr-12 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-[#00D2FF]/60 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(0,210,255,0.15),0_0_30px_-6px_rgba(0,210,255,0.5)] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <LuX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category pills */}
      <div className="sticky top-0 z-20 border-y border-white/[0.06] bg-[#0A1128]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8 [scrollbar-width:none]">
          <div className="mr-2 flex shrink-0 items-center gap-2 border-r border-white/10 pr-4">
            <Image
              src="/images/tms-icon-48.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-[10px] shadow-[0_0_16px_-2px_rgba(0,210,255,0.55)]"
            />
            <span className="hidden text-sm font-black tracking-tight text-white sm:inline">The Master Store</span>
          </div>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-[#00D2FF] text-[#0A1128] shadow-[0_0_20px_-4px_rgba(0,210,255,0.8)]'
                    : 'bg-white/[0.04] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.08] hover:text-white hover:ring-[#00D2FF]/40'
                }`}
              >
                {f}
                <span className={`text-xs ${active ? 'text-[#0A1128]/60' : 'text-slate-500'}`}>{counts[f]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {visible.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <StoreCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center backdrop-blur">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00D2FF]/10 text-[#00D2FF] shadow-[0_0_30px_-8px_rgba(0,210,255,0.6)]">
              <LuPackageOpen className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-white">
              {items.length === 0 ? 'New tools are on the way' : 'Nothing matches that'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              {items.length === 0
                ? 'The shelves are being stocked. Check back soon.'
                : 'Try another keyword or switch back to all categories.'}
            </p>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('All');
                }}
                className="mt-6 rounded-full bg-[#00D2FF] px-5 py-2.5 text-sm font-bold text-[#0A1128] shadow-[0_0_20px_-4px_rgba(0,210,255,0.8)] transition hover:brightness-110"
              >
                Show all apps
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function StoreCard({ item }: { item: StoreItem }) {
  const Icon = getStoreIcon(item.icon);
  const style = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.Utilities;
  const isWebApp = item.kind === 'webapp';
  const size = formatSize(item.sizeBytes);
  const date = formatDate(item.modified);

  const buttonClass =
    'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#3FE0FF] to-[#00A8E8] px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-[#0A1128] shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset,0_6px_20px_-6px_rgba(0,210,255,0.9)] transition hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset,0_8px_28px_-4px_rgba(0,210,255,1)] active:scale-95';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#00D2FF]/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_-20px_rgba(0,210,255,0.45)]">
      {/* glossy sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

      <div className="relative flex items-start gap-4">
        <div
          className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-white ring-1 ring-white/25 transition duration-300 group-hover:scale-105 group-hover:-rotate-3 ${style.tile} ${style.glow}`}
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
          <Icon className="relative h-8 w-8 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-white">{item.title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${style.chip}`}>
              {item.category}
            </span>
            {item.version && (
              <span className="text-[11px] font-medium text-slate-500">v{item.version.replace(/^v/i, '')}</span>
            )}
          </div>
        </div>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-slate-300">{item.caption}</p>

      {item.features.length > 0 && (
        <ul className="relative mt-3 space-y-1.5">
          {item.features.slice(0, 3).map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-slate-400">
              <LuCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00D2FF]" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="min-h-5 flex-1" />
      <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <div className="min-w-0 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-[#FF7A00]/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#FFA552] ring-1 ring-inset ring-[#FF7A00]/30">
              {item.format}
            </span>
            {size && <span>{size}</span>}
          </div>
          {date && <div className="mt-1 truncate text-slate-500">Updated {date}</div>}
        </div>

        {isWebApp ? (
          <Link href={item.downloadUrl} className={buttonClass}>
            Open <LuArrowUpRight className="h-4 w-4" />
          </Link>
        ) : (
          <a
            href={item.downloadUrl}
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : { download: item.fileName })}
            className={buttonClass}
            aria-label={`Get ${item.title}`}
          >
            <LuArrowDownToLine className="h-4 w-4" /> Get
          </a>
        )}
      </div>
    </article>
  );
}
