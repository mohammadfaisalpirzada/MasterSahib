'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Student = { id: string; name: string; present: boolean; date: string };

const STORAGE_KEY = 'ms_attendance';
const CLASS_KEY = 'ms_attendance_class';

const loadData = (): Student[] => {
  if (typeof window === 'undefined') return [];
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
};

const saveData = (d: Student[]) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendanceTrackerPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState('');
  const [className, setClassName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    setStudents(loadData());
    try { const c = localStorage.getItem(CLASS_KEY); if (c) setClassName(c); } catch {}
  }, []);

  const save = useCallback((d: Student[]) => { setStudents(d); saveData(d); }, []);

  const addStudent = () => {
    const n = newName.trim();
    if (!n) return;
    const d = [...students, { id: Date.now().toString(), name: n, present: false, date: today() }];
    save(d); setNewName(''); setStatusMsg(`✅ ${n} added`);
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const togglePresent = (id: string) => {
    save(students.map(s => s.id === id ? { ...s, present: !s.present } : s));
  };

  const removeStudent = (id: string) => {
    const n = students.find(s => s.id === id)?.name || '';
    save(students.filter(s => s.id !== id));
    setStatusMsg(`🗑️ ${n} removed`);
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const resetToday = () => {
    save(students.map(s => ({ ...s, present: false })));
    setStatusMsg('🔄 Reset for today');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const saveClass = () => { try { localStorage.setItem(CLASS_KEY, className); } catch {} };

  const present = students.filter(s => s.present).length;
  const d = today();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-lg space-y-4">
        <Link href="/educational-resources" className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">📋 Attendance Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">{d}</p>

          <div className="mt-4 flex items-center gap-2">
            <input type="text" value={className} onChange={e => setClassName(e.target.value)} onBlur={saveClass} placeholder="Class name..." className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{present}/{students.length}</span>
          </div>

          <div className="mt-4 flex gap-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addStudent(); }} placeholder="Student name..." className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500" />
            <button onClick={addStudent} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700">Add</button>
          </div>

          {statusMsg && <p className="mt-2 text-sm font-semibold text-emerald-600">{statusMsg}</p>}

          <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
            {students.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No students yet. Add names above!</p>}
            {students.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 transition hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePresent(s.id)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold transition ${s.present ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 bg-white text-transparent'}`}>{s.present ? '✓' : ''}</button>
                  <span className={`text-sm font-semibold ${s.present ? 'text-slate-900' : 'text-slate-600'}`}>{s.name}</span>
                </div>
                <button onClick={() => removeStudent(s.id)} className="text-xs text-slate-400 hover:text-rose-500">✕</button>
              </div>
            ))}
          </div>

          {students.length > 0 && (
            <button onClick={resetToday} className="mt-4 w-full rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Reset All for Today</button>
          )}
        </section>
      </div>
    </main>
  );
}
