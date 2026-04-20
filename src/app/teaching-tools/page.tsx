'use client';

import Link from 'next/link';

import {
  latestEducationalResourceTitles,
  sortedEducationalResourceItems,
} from '@/app/lib/educationalResources';

const latestToolSet = new Set(latestEducationalResourceTitles);

export default function TeachingToolsPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">New Workspace</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Educational Resources</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Use this space to manage and expand your daily educational resources. Every tool added here can also appear automatically inside the navbar dropdown.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Home
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Request New Resource
            </Link>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {sortedEducationalResourceItems.map((tool) => (
            <article
              key={tool.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{tool.title}</h2>
                  {latestToolSet.has(tool.title) ? (
                    <span className="inline-flex animate-pulse items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                      New
                    </span>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    tool.status === 'Ready'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {tool.status}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{tool.description}</p>
              <div className="mt-4">
                {tool.href && tool.href !== '#' ? (
                  <Link
                    href={tool.href}
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Open Resource
                  </Link>
                ) : (
                  <span className="inline-flex rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                    Setup Pending
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
