'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type ExitEntry = {
  id: string;
  name: string;
  learned: string;
  subject: string;
  date: string;
};

const STORAGE_KEY = 'ms_exit_tickets';

const loadEntries = (): ExitEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveEntries = (entries: ExitEntry[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* noop */ }
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ExitTicketPage() {
  const [entries, setEntries] = useState<ExitEntry[]>([]);
  const [name, setName] = useState('');
  const [learned, setLearned] = useState('');
  const [subject, setSubject] = useState('');
  const [filterDate, setFilterDate] = useState(todayStr);

  useEffect(() => { setEntries(loadEntries()); }, []);

  const handleSubmit = useCallback(() => {
    if (!learned.trim()) return;
    const newEntry: ExitEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim() || 'Anonymous',
      learned: learned.trim(),
      subject: subject.trim() || 'General',
      date: todayStr(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setLearned('');
  }, [learned, name, subject, entries]);

  const todayEntries = entries.filter((e) => e.date === todayStr());
  const filteredEntries = filterDate
    ? entries.filter((e) => e.date === filterDate)
    : entries;

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Daily Reflection</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Exit Ticket</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Students write <strong>one thing they learned today</strong> before leaving class.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/educational-resources" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">What did you learn today?</h2>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500" />
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject / Class (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500" />
            </div>
            <textarea rows={3} value={learned} onChange={(e) => setLearned(e.target.value)} placeholder="One thing I learned today is..." className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500" />
            <button type="button" onClick={handleSubmit} disabled={!learned.trim()} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50">Submit</button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Today&apos;s Entries ({todayEntries.length})</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter by date:</span>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {filteredEntries.length === 0 ? (
              <p className="text-sm text-slate-500">No entries for this date.</p>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-6 text-slate-800">&ldquo;{entry.learned}&rdquo;</p>
                    <span className="shrink-0 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-cyan-700">{entry.subject}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span>{entry.name}</span>
                    <span>{entry.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
