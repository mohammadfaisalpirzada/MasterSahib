'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'ms_typing_tutor';

type TypingRecord = {
  date: string;
  wpm: number;
  accuracy: number;
  level: string;
  duration: number;
};

type SavedData = {
  records: TypingRecord[];
  highestLevel: string;
  streak: number;
  lastPracticeDate: string;
};

const LEVELS = [
  { id: 'beginner', label: 'Beginner', text: 'The cat sat on the mat. A dog ran in the park. The sun is hot and bright. We like to play and run.' },
  { id: 'easy', label: 'Easy', text: 'The quick brown fox jumps over the lazy dog. She sells sea shells by the sea shore. How much wood would a woodchuck chuck if a woodchuck could chuck wood?' },
  { id: 'medium', label: 'Medium', text: 'Practice makes perfect, and consistency is the key to mastering any skill. Every great journey begins with a single step. The only way to do great work is to love what you do. Stay curious, keep learning, and never give up on your dreams.' },
  { id: 'hard', label: 'Hard', text: 'Technology is best when it brings people together. In the modern era of digital transformation, coding has become an essential literacy skill, much like reading and writing. The ability to understand and leverage technology empowers individuals to solve complex problems, create innovative solutions, and connect with communities worldwide.' },
  { id: 'expert', label: 'Expert', text: 'The advancement of artificial intelligence and machine learning has revolutionized the way we interact with information and automate decision-making processes across industries. From autonomous vehicles navigating complex urban environments to sophisticated language models capable of generating human-like text, the pace of innovation continues to accelerate at an unprecedented rate, challenging our traditional notions of work, creativity, and intelligence itself.' },
];

const getDefaultData = (): SavedData => ({
  records: [],
  highestLevel: 'beginner',
  streak: 0,
  lastPracticeDate: '',
});

const loadData = (): SavedData => {
  if (typeof window === 'undefined') return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...getDefaultData(), ...JSON.parse(raw) } : getDefaultData();
  } catch { return getDefaultData(); }
};

const saveData = (d: SavedData) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* noop */ }
};

const today = () => new Date().toISOString().slice(0, 10);

export default function TypingTutorPage() {
  const [data, setData] = useState<SavedData>(getDefaultData());
  const [level, setLevel] = useState('beginner');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<{ wpm: number; accuracy: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setData(loadData()); }, []);

  const currentLevel = LEVELS.find((l) => l.id === level) || LEVELS[0];
  const nextLevelIdx = LEVELS.findIndex((l) => l.id === level) + 1;
  const nextLevel = nextLevelIdx < LEVELS.length ? LEVELS[nextLevelIdx] : null;

  const handleStart = useCallback(() => {
    setInput('');
    setFinished(false);
    setResults(null);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    if (!startTime) return;
    if (val.length >= currentLevel.text.length) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const words = currentLevel.text.split(' ').length;
      const wpm = Math.round(words / elapsed);
      const correct = val.split('').filter((ch, i) => ch === currentLevel.text[i]).length;
      const accuracy = Math.round((correct / val.length) * 100);

      setResults({ wpm, accuracy });
      setFinished(true);

      const record: TypingRecord = { date: today(), wpm, accuracy, level, duration: Math.round(elapsed * 60) };

      const updated = { ...data, records: [...data.records, record] };

      const todayRecords = updated.records.filter((r) => r.date === today());
      if (todayRecords.length === 1) {
        const lastDate = updated.lastPracticeDate;
        if (lastDate) {
          const diff = Math.round((Date.parse(today()) - Date.parse(lastDate)) / 86400000);
          updated.streak = diff === 1 ? updated.streak + 1 : diff === 0 ? updated.streak : 1;
        } else {
          updated.streak = 1;
        }
        updated.lastPracticeDate = today();
      }

      if (accuracy >= 80 && wpm >= 20 && nextLevel) {
        const levelOrder = LEVELS.map((l) => l.id);
        const currentIdx = levelOrder.indexOf(level);
        const highestIdx = levelOrder.indexOf(updated.highestLevel);
        if (currentIdx >= highestIdx && nextLevel) {
          updated.highestLevel = nextLevel.id;
        }
      }

      setData(updated);
      saveData(updated);
      setStartTime(null);
    }
  }, [startTime, currentLevel.text, level, data, nextLevel]);

  const progress = currentLevel.text.length > 0 ? Math.round((input.length / currentLevel.text.length) * 100) : 0;

  const isCorrect = (i: number) => input[i] === currentLevel.text[i];
  const stats = useMemo(() => {
    const r = data.records;
    if (r.length === 0) return { avgWpm: 0, avgAcc: 0, total: 0, bestWpm: 0 };
    return {
      avgWpm: Math.round(r.reduce((s, x) => s + x.wpm, 0) / r.length),
      avgAcc: Math.round(r.reduce((s, x) => s + x.accuracy, 0) / r.length),
      total: r.length,
      bestWpm: Math.max(...r.map((x) => x.wpm)),
    };
  }, [data.records]);

  const todayRecords = data.records.filter((r) => r.date === today());
  const weekRecords = data.records.filter((r) => {
    const d = new Date(r.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    return d >= weekAgo;
  });

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Skill Builder</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Typing Practice Tutor</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Improve your typing speed and accuracy across multiple levels. Track your daily practice, streaks, and progress.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg WPM</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.avgWpm}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Accuracy</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.avgAcc}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">🔥 Streak</p>
            <p className="mt-1 text-2xl font-black text-orange-500">{data.streak} days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Sessions</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Level: {currentLevel.label}</h2>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => {
                const levelOrder = LEVELS.map((x) => x.id);
                const currentIdx = levelOrder.indexOf(data.highestLevel);
                const lvlIdx = levelOrder.indexOf(l.id);
                const unlocked = lvlIdx <= currentIdx + 1;
                return (
                  <button key={l.id} type="button" onClick={() => { if (unlocked) { setLevel(l.id); setFinished(false); setInput(''); setResults(null); } }} disabled={!unlocked} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${level === l.id ? 'bg-fuchsia-600 text-white' : unlocked ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    {l.label} {!unlocked && '🔒'}
                  </button>
                );
              })}
            </div>
          </div>

          {!finished ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 font-mono text-sm leading-7 text-slate-700">
                {currentLevel.text.split('').map((ch, i) => {
                  let cls = '';
                  if (i < input.length) cls = isCorrect(i) ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
                  return <span key={i} className={`rounded px-0.5 ${cls}`}>{ch}</span>;
                })}
              </div>

              {!startTime && !finished ? (
                <button type="button" onClick={handleStart} className="rounded-xl bg-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-700">Start Typing</button>
              ) : (
                <textarea ref={inputRef} value={input} onChange={handleInputChange} placeholder="Type the text above here..." className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-fuchsia-500" rows={4} />
              )}

              {startTime && (
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{progress}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-fuchsia-50 to-pink-50 border border-fuchsia-200 p-5">
                <h3 className="text-lg font-bold text-fuchsia-900">Session Complete!</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="text-xs font-semibold text-slate-500">Speed</p>
                    <p className="text-2xl font-black text-slate-900">{results?.wpm} <span className="text-sm font-normal text-slate-500">WPM</span></p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center">
                    <p className="text-xs font-semibold text-slate-500">Accuracy</p>
                    <p className="text-2xl font-black text-slate-900">{results?.accuracy}%</p>
                  </div>
                </div>
                {results && results.accuracy >= 80 && results.wpm >= 20 && nextLevel ? (
                  <p className="mt-3 text-sm font-semibold text-emerald-700">🎉 You unlocked {nextLevel.label} level!</p>
                ) : null}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleStart} className="rounded-xl bg-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-fuchsia-700">Try Again</button>
                {nextLevel && results && results.accuracy >= 80 && results.wpm >= 20 && (
                  <button type="button" onClick={() => { setLevel(nextLevel.id); setFinished(false); setInput(''); setResults(null); }} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Next Level →</button>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <button type="button" onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-lg font-bold text-slate-900">
            Practice History {showHistory ? '▲' : '▼'}
          </button>
          {showHistory && (
            <div className="mt-4 space-y-3">
              {data.records.length === 0 ? (
                <p className="text-sm text-slate-500">No practice sessions yet.</p>
              ) : (
                data.records.slice().reverse().slice(0, 30).map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
                    <span className="font-semibold text-slate-700">{r.date}</span>
                    <span className="text-fuchsia-700 font-bold">{r.wpm} WPM</span>
                    <span className="text-slate-600">{r.accuracy}%</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{r.level}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Weekly Activity</h2>
          <div className="mt-4 flex items-end gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const ds = d.toISOString().slice(0, 10);
              const dayRecords = weekRecords.filter((r) => r.date === ds);
              const avg = dayRecords.length > 0 ? Math.round(dayRecords.reduce((s, r) => s + r.wpm, 0) / dayRecords.length) : 0;
              const maxH = 120;
              const h = avg > 0 ? Math.max(20, (avg / 120) * maxH) : 4;
              return (
                <div key={ds} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-md bg-fuchsia-100 transition-all" style={{ height: `${h}px` }} title={`${ds}: ${avg} WPM`} />
                  <span className="text-[10px] font-semibold text-slate-500">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
