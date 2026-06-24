'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type AssemblyItem = {
  id: string;
  time: string;
  activity: string;
  topic: string;
  speaker: string;
  duration: string;
};

type AssemblyPlan = {
  id: string;
  schoolName: string;
  className: string;
  date: string;
  totalDuration: string;
  theme: string;
  items: AssemblyItem[];
  duties: string;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = 'ms_assembly_plans';
const ITEMS_STORAGE_KEY = 'ms_assembly_current';

const loadPlans = (): AssemblyPlan[] => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const savePlans = (plans: AssemblyPlan[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plans)); } catch { /* noop */ }
};

const loadCurrent = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(ITEMS_STORAGE_KEY) || 'null'); } catch { return null; }
};

const saveCurrent = (data: unknown) => {
  try { localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(data)); } catch { /* noop */ }
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const defaultItems: AssemblyItem[] = [
  { id: '1', time: '07:50', activity: 'Recitation of Holy Quran', topic: 'Surah Yaseen (selected verses)', speaker: 'Student (assigned)', duration: '5 min' },
  { id: '2', time: '07:55', activity: 'Naat / Hamd', topic: 'Selected naat', speaker: 'Student (assigned)', duration: '5 min' },
  { id: '3', time: '08:00', activity: 'Thought of the Day', topic: 'Inspiring thought / quote', speaker: 'Student (assigned)', duration: '2 min' },
  { id: '4', time: '08:02', activity: 'Speech / Topic Presentation', topic: 'Enter topic', speaker: 'Student / Teacher name', duration: '5 min' },
  { id: '5', time: '08:07', activity: 'News Headlines', topic: 'Current events summary', speaker: 'Student (assigned)', duration: '3 min' },
  { id: '6', time: '08:10', activity: 'Principal / Teacher Address', topic: 'Weekly message / announcements', speaker: 'Principal / Class Teacher', duration: '5 min' },
  { id: '7', time: '08:15', activity: 'National Anthem', topic: 'Stand in attention', speaker: 'All students', duration: '1 min' },
  { id: '8', time: '08:16', activity: 'Dismissal', topic: 'Orderly return to classes', speaker: 'Teacher on duty', duration: '2 min' },
];

export default function AssemblyPlannerPage() {
  const [schoolName, setSchoolName] = useState('Your School Name');
  const [className, setClassName] = useState('');
  const [date, setDate] = useState(todayStr());
  const [totalDuration, setTotalDuration] = useState('30');
  const [theme, setTheme] = useState('');
  const [items, setItems] = useState<AssemblyItem[]>(defaultItems);
  const [duties, setDuties] = useState('');
  const [notes, setNotes] = useState('');
  const [savedPlans, setSavedPlans] = useState<AssemblyPlan[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [numItems, setNumItems] = useState(8);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedPlans(loadPlans());
    const current = loadCurrent();
    if (current) {
      setSchoolName(current.schoolName || 'Your School Name');
      setClassName(current.className || '');
      setDate(current.date || todayStr());
      setTotalDuration(current.totalDuration || '30');
      setTheme(current.theme || '');
      setItems(current.items || defaultItems);
      setDuties(current.duties || '');
      setNotes(current.notes || '');
      setNumItems(current.items?.length || 8);
    }
  }, []);

  useEffect(() => {
    saveCurrent({ schoolName, className, date, totalDuration, theme, items, duties, notes });
  }, [schoolName, className, date, totalDuration, theme, items, duties, notes]);

  const updateItem = useCallback((id: string, field: keyof AssemblyItem, value: string) => {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { id: Date.now().toString(36), time: '08:00', activity: '', topic: '', speaker: '', duration: '3 min' }]);
    setNumItems((n) => n + 1);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setNumItems((n) => Math.max(0, n - 1));
  }, []);

  const handleSave = useCallback(() => {
    const plan: AssemblyPlan = {
      id: Date.now().toString(36),
      schoolName,
      className,
      date,
      totalDuration,
      theme,
      items,
      duties,
      notes,
      createdAt: new Date().toISOString(),
    };
    const plans = [plan, ...savedPlans];
    setSavedPlans(plans);
    savePlans(plans);
  }, [schoolName, className, date, totalDuration, theme, items, duties, notes, savedPlans]);

  const handleLoad = useCallback((plan: AssemblyPlan) => {
    setSchoolName(plan.schoolName);
    setClassName(plan.className);
    setDate(plan.date);
    setTotalDuration(plan.totalDuration);
    setTheme(plan.theme);
    setItems(plan.items);
    setDuties(plan.duties);
    setNotes(plan.notes);
    setNumItems(plan.items.length);
    setShowSaved(false);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Teacher Resource</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Weekly Assembly Plan Maker</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Create, customize, and print A4-ready assembly plans with topics, speakers, duties, and time slots.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
            <button type="button" onClick={handlePrint} className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">🖨️ Print / PDF</button>
            <button type="button" onClick={handleSave} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">💾 Save Plan</button>
            <button type="button" onClick={() => setShowSaved(!showSaved)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">📂 Saved Plans ({savedPlans.length})</button>
          </div>
        </section>

        {showSaved && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Saved Plans</h2>
            {savedPlans.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No saved plans yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{plan.schoolName} — {plan.date}</p>
                      <p className="text-xs text-slate-500">{plan.className || 'All classes'} · {plan.totalDuration} min · {plan.items.length} items</p>
                    </div>
                    <button type="button" onClick={() => handleLoad(plan)} className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-200">Load</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div ref={printRef} id="assembly-plan-print" className="space-y-6 print:space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border-none print:shadow-none print:p-0">
            <h2 className="text-lg font-bold text-slate-900 print:hidden">Plan Details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">School Name</label>
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 print:border-none print:p-0 print:font-bold print:text-base" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class / Grade</label>
                <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. Class 7-10" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 print:border-none print:p-0" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 print:border-none print:p-0" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Duration</label>
                <input type="text" value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} placeholder="e.g. 30 minutes" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 print:border-none print:p-0" />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Theme / Occasion</label>
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Spring Festival, Iqbal Day, Weekly Assembly" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-4">
            <div className="mb-3 flex items-center justify-between print:hidden">
              <h2 className="text-lg font-bold text-slate-900">Assembly Schedule ({items.length} items)</h2>
              <button type="button" onClick={addItem} className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200">+ Add Item</button>
            </div>

            <div className="print:block">
              <div className="mb-4 text-center print:block hidden">
                <h2 className="text-xl font-bold">{schoolName}</h2>
                <p className="text-sm">Weekly Assembly Plan</p>
                <p className="text-sm">{className ? `Class: ${className} | ` : ''}Date: {date} | Duration: {totalDuration} min{theme ? ` | Theme: ${theme}` : ''}</p>
                <div className="mt-1 border-b border-slate-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b-2 border-slate-300 bg-slate-50 print:bg-slate-100">
                    <tr>
                      <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 w-16">Time</th>
                      <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600">Activity</th>
                      <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600">Topic / Details</th>
                      <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600">Speaker / Incharge</th>
                      <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 w-20">Duration</th>
                      <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 w-10 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 print:border-slate-300">
                        <td className="px-3 py-2">
                          <input type="text" value={item.time} onChange={(e) => updateItem(item.id, 'time', e.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none print:border-none print:p-0" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={item.activity} onChange={(e) => updateItem(item.id, 'activity', e.target.value)} placeholder="Activity name" className="w-full bg-transparent text-sm text-slate-900 outline-none print:border-none print:p-0" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={item.topic} onChange={(e) => updateItem(item.id, 'topic', e.target.value)} placeholder="Topic / details" className="w-full bg-transparent text-sm text-slate-600 outline-none print:border-none print:p-0" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={item.speaker} onChange={(e) => updateItem(item.id, 'speaker', e.target.value)} placeholder="Speaker name" className="w-full bg-transparent text-sm text-slate-900 outline-none print:border-none print:p-0" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="text" value={item.duration} onChange={(e) => updateItem(item.id, 'duration', e.target.value)} className="w-full bg-transparent text-sm text-slate-600 outline-none print:border-none print:p-0" />
                        </td>
                        <td className="px-3 py-2 print:hidden">
                          <button type="button" onClick={() => removeItem(item.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-4">
            <h2 className="text-lg font-bold text-slate-900 print:text-base">Duty Roster</h2>
            <textarea rows={3} value={duties} onChange={(e) => setDuties(e.target.value)} placeholder="e.g. Stage management: Student A & B&#10;Discipline: Teacher on duty&#10;Sound system: Lab assistant&#10;Photography: Student C" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 print:border-none print:p-0 print:resize-none" />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border print:border-slate-300 print:shadow-none print:p-4">
            <h2 className="text-lg font-bold text-slate-900 print:text-base">Additional Notes</h2>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions, reminders, or notes for this assembly..." className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 print:border-none print:p-0 print:resize-none" />
          </section>
        </div>
      </div>
    </main>
  );
}
