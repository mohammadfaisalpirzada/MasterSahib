'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { sortedGovtFormItems, type GovtFormItem } from '@/app/lib/govtForms';

const WHATSAPP_NUMBER = '923458340669';

const audienceLabels: Record<string, string> = {
  all: 'All Forms',
  'school-office': 'School Office',
  employee: 'Employees',
  'ag-sindh': 'AG Sindh / Payroll',
  teacher: 'Teachers',
  student: 'Students',
  parents: 'Parents',
};

const audienceKeys = ['all', 'employee', 'ag-sindh', 'school-office', 'teacher', 'student', 'parents'];

export default function GovtFormsPage() {
  const [search, setSearch] = useState('');
  const [audience, setAudience] = useState('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sortedGovtFormItems.filter((item) => {
      const matchSearch =
        !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      const matchAudience = audience === 'all' || item.audience === audience;
      return matchSearch && matchAudience;
    });
  }, [search, audience]);

  const readyCount = sortedGovtFormItems.filter((i) => i.status === 'Ready').length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2d54] via-[#1a3a6b] to-[#2356a4] p-7 text-white shadow-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">The Master Sahib</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Govt Educational Forms</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
            Ready-to-print official forms for government schools — admission form, no dues, bonafide, character
            certificate and more. Enter your school and student details once, and download a clean A4 PDF you can
            print or photocopy. Free to use, nothing is uploaded to any server.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25">✅ {readyCount} forms ready</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25">🖨️ Print / Save as PDF</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/25">🔒 Data stays in your browser</span>
          </div>
        </header>

        {/* Search + filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a form…"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15 sm:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {audienceKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  audience === key
                    ? 'bg-[#1a3a6b] text-white shadow'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {audienceLabels[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <FormCard key={item.title} item={item} />
          ))}
          {filtered.length === 0 ? (
            <p className="col-span-full rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              No form matches your search yet — more forms are being added regularly.
            </p>
          ) : null}
        </div>

        {/* Request a form / upsell */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Need a form that isn&apos;t here?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Tell me which official form your school uses most and it will be added to this page. And if your school
            wants any of these as a proper <strong>online system</strong> — parents filling forms from their phone,
            records saved in an admin dashboard, Excel export and bulk printing — The Master Sahib builds and hosts it
            for you.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Assalam-o-Alaikum! I want to request / order a govt educational form for my school.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-600"
            >
              💬 WhatsApp +92 345 8340669
            </a>
            <a
              href="mailto:mohammadfaisalpirzada@gmail.com?subject=Govt%20Educational%20Forms%20Enquiry"
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
            >
              ✉️ Email
            </a>
            <Link
              href="/contact"
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
            >
              Contact page
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function FormCard({ item }: { item: GovtFormItem }) {
  const isReady = item.status === 'Ready' && item.href;

  const inner = (
    <div
      className={`group flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition ${
        isReady
          ? 'border-slate-200 hover:-translate-y-1 hover:border-[#1a3a6b]/30 hover:shadow-lg'
          : 'border-dashed border-slate-300 opacity-80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${
            item.color || 'from-slate-500 to-gray-400'
          }`}
        >
          {item.icon || '📄'}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isReady ? 'Ready' : 'Coming Soon'}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{item.description}</p>

      <div className="mt-4 flex items-center justify-between">
        {item.audience ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {audienceLabels[item.audience]}
          </span>
        ) : (
          <span />
        )}
        {isReady ? (
          <span className="text-sm font-bold text-[#1a3a6b] transition group-hover:translate-x-0.5">Open →</span>
        ) : null}
      </div>
    </div>
  );

  return isReady ? (
    <Link href={item.href as string} className="h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
