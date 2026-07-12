'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiOutlineDownload, HiOutlinePrinter } from 'react-icons/hi';

/* ─── Website Topics Data ─── */
type WsTopic = { id: string; label: string; icon: string; words: string[]; emoji?: string[] };
const WEBSITE_TOPICS: WsTopic[] = [
  { id: 'shapes', label: 'Shapes', icon: '⭐', words: ['Circle', 'Heart', 'Star', 'Triangle', 'Cone', 'Oval', 'Rectangle', 'Square'] },
  { id: 'colors', label: 'Colors', icon: '🌈', words: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'White', 'Black', 'Brown', 'Purple'] },
  { id: 'animals', label: 'Animals', icon: '🦁', words: ['Cat', 'Dog', 'Lion', 'Tiger', 'Fox', 'Monkey', 'Horse', 'Elephant', 'Rabbit', 'Giraffe', 'Zebra', 'Cow'], emoji: ['🐱', '🐶', '🦁', '🐯', '🦊', '🐵', '🐴', '🐘', '🐰', '🦒', '🦓', '🐄'] },
  { id: 'birds', label: 'Birds', icon: '🦜', words: ['Parrot', 'Peacock', 'Sparrow', 'Crow', 'Penguin', 'Eagle', 'Pigeon', 'Owl'], emoji: ['🦜', '🦚', '🐦', '🐦‍⬛', '🐧', '🦅', '🕊️', '🦉'] },
  { id: 'vegetables', label: 'Vegetables', icon: '🥕', words: ['Potato', 'Tomato', 'Cabbage', 'Carrot', 'Onion', 'Peas', 'Cucumber', 'Brinjal'], emoji: ['🥔', '🍅', '🥬', '🥕', '🧅', '🫛', '🥒', '🍆'] },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳', words: ['Stove', 'Plate', 'Pan', 'Bowl', 'Glass', 'Spoon', 'Fork', 'Kettle'], emoji: ['🔥', '🍽️', '🍳', '🥣', '🥛', '🥄', '🍴', '🫖'] },
  { id: 'garden', label: 'Garden', icon: '🌻', words: ['Grass', 'Flower', 'Tree', 'Bench', 'Butterfly', 'Bird', 'Swing', 'Stone'], emoji: ['🌿', '🌸', '🌳', '🪑', '🦋', '🐦', '🎠', '🪨'] },
  { id: 'occupations', label: 'Occupations', icon: '👨‍⚕️', words: ['Doctor', 'Teacher', 'Pilot', 'Farmer', 'Tailor', 'Policeman', 'Carpenter', 'Barber'], emoji: ['👨‍⚕️', '👩‍🏫', '👨‍✈️', '👨‍🌾', '🧵', '👮', '🪚', '💈'] },
  { id: 'days', label: 'Days of Week', icon: '📅', words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { id: 'months', label: 'Months', icon: '📆', words: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
  { id: 'sight-words', label: 'Sight Words', icon: '👁️', words: ['Cat', 'Dog', 'Sun', 'Hat', 'Ball', 'Fish', 'Bird', 'Book', 'Star', 'Moon', 'Tree', 'Flower', 'Apple', 'Milk', 'Car', 'House'] },
  { id: 'teen-numbers', label: 'Teen Numbers', icon: '🔟', words: ['13-Thirteen', '14-Fourteen', '15-Fifteen', '16-Sixteen', '17-Seventeen', '18-Eighteen', '19-Nineteen'] },
  { id: 'ty-numbers', label: 'Tens (20-90)', icon: '💯', words: ['20-Twenty', '30-Thirty', '40-Forty', '50-Fifty', '60-Sixty', '70-Seventy', '80-Eighty', '90-Ninety'] },
  { id: '3d-shapes', label: '3D Shapes', icon: '🧊', words: ['Cube', 'Cuboid', 'Sphere', 'Cylinder', 'Cone', 'Pyramid'] },
];

/* ─── Worksheet Types ─── */
const WS_TYPES = [
  { id: 'fill-blanks', label: '📝 Fill in the Blanks' },
  { id: 'match', label: '🔗 Match the Columns' },
  { id: 'mcq', label: '🔘 Multiple Choice' },
  { id: 'circle', label: '⭕ Circle the Correct' },
  { id: 'write', label: '✍️ Write the Word' },
  { id: 'mixed', label: '🎲 Mixed Exercises' },
];

/* ─── Worksheet Generator Functions ─── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function generateWorksheetHTML(topic: WsTopic, type: string, studentName: string, grade: string): string {
  const words = shuffle(topic.words).slice(0, 8);
  const emojis = topic.emoji ? shuffle(topic.emoji).slice(0, 8) : undefined;
  let body = '';

  if (type === 'fill-blanks' || type === 'mixed') {
    body += `<div class="section"><h3>📝 Fill in the Blanks</h3><ol class="questions">`;
    words.forEach((w) => {
      const display = topic.id === 'teen-numbers' || topic.id === 'ty-numbers' ? w.split('-')[0] : w;
      const label = topic.id === 'teen-numbers' || topic.id === 'ty-numbers' ? w.split('-')[1] : w;
      const blank = '_'.repeat(label.length);
      body += `<li>The name of <strong>${display}</strong> is <span class="blank">${blank}</span>.</li>`;
    });
    body += `</ol></div>`;
  }

  if (type === 'mcq' || type === 'mixed') {
    body += `<div class="section"><h3>🔘 Multiple Choice — Circle the Correct Answer</h3><ol class="questions">`;
    words.forEach((w) => {
      const label = topic.id === 'teen-numbers' || topic.id === 'ty-numbers' ? w.split('-')[1] : w;
      const distractors = shuffle(topic.words.filter(x => x !== w)).slice(0, 3).map(x => topic.id === 'teen-numbers' || topic.id === 'ty-numbers' ? x.split('-')[1] : x);
      const opts = shuffle([label, ...distractors]);
      body += `<li><strong>${w}</strong> — ${opts.map(o => `<span class="opt">( ) ${o}</span>`).join(' ')}</li>`;
    });
    body += `</ol></div>`;
  }

  if (type === 'match' || type === 'mixed') {
    const leftWords = shuffle([...words]);
    const rightWords = shuffle([...words]);
    body += `<div class="section"><h3>🔗 Match the Columns — Draw a line from left to right</h3>`;
    body += `<div class="match-cols"><div class="col">`;
    leftWords.forEach((w, i) => { body += `<div class="match-item">${i + 1}. ${w}</div>`; });
    body += `</div><div class="col">`;
    rightWords.forEach((w) => { body += `<div class="match-item">(${String.fromCharCode(65 + rightWords.indexOf(w))}) ${w}</div>`; });
    body += `</div></div></div>`;
  }

  if (type === 'circle' || type === 'mixed') {
    body += `<div class="section"><h3>⭕ Circle the Correct Word</h3><ol class="questions">`;
    words.forEach((w) => {
      const label = topic.id === 'teen-numbers' || topic.id === 'ty-numbers' ? w.split('-')[1] : w;
      const wrong1 = shuffle(topic.words.filter(x => x !== w))[0] || w;
      const wrongLabel = topic.id === 'teen-numbers' || topic.id === 'ty-numbers' ? wrong1.split('-')[1] : wrong1;
      const opts = shuffle([label, wrongLabel]);
      body += `<li>${label} — ${opts.map(o => `<span class="opt">( ) ${o}</span>`).join('  ')}</li>`;
    });
    body += `</ol></div>`;
  }

  if (type === 'write' || type === 'mixed') {
    body += `<div class="section"><h3>✍️ Write the Word</h3>`;
    if (emojis) {
      body += `<div class="emoji-grid">`;
      emojis.forEach((e, i) => {
        const label = words[i] || '';
        body += `<div class="emoji-item"><span class="emoji-big">${e}</span><div class="write-lines">________</div></div>`;
      });
      body += `</div>`;
    } else {
      body += `<ol class="questions">`;
      words.forEach((w) => {
        body += `<li>Write the word for: <strong>${w}</strong> <div class="write-line">________________________</div></li>`;
      });
      body += `</ol>`;
    }
    body += `</div>`;
  }

  return `
<div class="worksheet-page">
  <div class="ws-header">
    <div class="ws-brand">The Master Sahib</div>
    <div class="ws-slogan">Learn, Build &amp; Grow</div>
  </div>
  <div class="ws-title">Worksheet: ${topic.label}</div>
  <div class="ws-meta">
    <span>Student Name: <strong>${studentName || '_______________'}</strong></span>
    <span>Grade: <strong>${grade || '____'}</strong></span>
    <span>Date: <strong>___________</strong></span>
  </div>
  <div class="ws-body">${body}</div>
  <div class="ws-footer">www.themastersahib.com</div>
</div>`;
}

/* ─── Page Component ─── */
export default function WorksheetBuilderPage() {
  const [mode, setMode] = useState<'website' | 'custom'>('website');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [wsType, setWsType] = useState('mixed');
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('');
  const [preview, setPreview] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customType, setCustomType] = useState('Mixed (fill blanks, MCQ, matching, short answers)');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [remaining, setRemaining] = useState(5);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/educational-resources/worksheet-builder').then(r => r.json()).then(d => setRemaining(d.remaining ?? 5)).catch(() => {});
  }, []);

  const handleGenerateWebsite = useCallback(() => {
    const topic = WEBSITE_TOPICS.find(t => t.id === selectedTopic);
    if (!topic) return;
    const html = generateWorksheetHTML(topic, wsType, studentName, grade);
    setPreview(html);
    setApiError('');
  }, [selectedTopic, wsType, studentName, grade]);

  const handleGenerateCustom = useCallback(async () => {
    if (!customTopic.trim()) { setApiError('Please enter a topic.'); return; }
    if (remaining <= 0) { setApiError(`Daily limit reached. You can generate ${5} custom worksheets per day.`); return; }
    setLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/educational-resources/worksheet-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic, grade, studentName, worksheetType: customType }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Failed to generate.'); setLoading(false); return; }
      setPreview(data.html);
      setRemaining(data.remaining ?? remaining - 1);
    } catch {
      setApiError('Network error. Please try again.');
    }
    setLoading(false);
  }, [customTopic, grade, studentName, customType, remaining]);

  const handlePrint = useCallback(() => {
    const content = previewRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Worksheet - The Master Sahib</title><style>
      @page { size: A4; margin: 12mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
      .worksheet-page { max-width: 700px; margin: 0 auto; padding: 20px; }
      .ws-header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 8px; margin-bottom: 12px; }
      .ws-brand { font-size: 22px; font-weight: 900; color: #4f46e5; letter-spacing: 0.5px; }
      .ws-slogan { font-size: 11px; color: #6366f1; letter-spacing: 1px; margin-top: 2px; }
      .ws-title { font-size: 16px; font-weight: 800; text-align: center; margin-bottom: 8px; color: #0f172a; }
      .ws-meta { display: flex; justify-content: space-between; font-size: 12px; color: #475569; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; }
      .ws-body { font-size: 13px; line-height: 1.8; }
      .section { margin-bottom: 14px; }
      .section h3 { font-size: 14px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
      .questions { padding-left: 20px; }
      .questions li { margin-bottom: 6px; }
      .blank { display: inline-block; min-width: 80px; border-bottom: 2px solid #1e293b; margin: 0 4px; }
      .opt { margin-right: 12px; font-size: 12px; }
      .match-cols { display: flex; justify-content: space-around; }
      .col { width: 45%; }
      .match-item { padding: 4px 0; font-size: 13px; border-bottom: 1px dotted #e2e8f0; }
      .emoji-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; }
      .emoji-item { padding: 6px; }
      .emoji-big { font-size: 32px; display: block; margin-bottom: 4px; }
      .write-lines { border-bottom: 2px solid #1e293b; height: 20px; }
      .write-line { border-bottom: 2px solid #1e293b; height: 20px; margin-top: 4px; }
      .ws-footer { text-align: center; font-size: 10px; color: #94a3b8; border-top: 2px solid #4f46e5; padding-top: 6px; margin-top: 20px; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>${content.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, []);

  const handleDownload = useCallback(() => {
    const content = previewRef.current;
    if (!content) return;
    const blob = new Blob([`<!DOCTYPE html><html><head><title>Worksheet</title><style>
      @page { size: A4; margin: 12mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
      .worksheet-page { max-width: 700px; margin: 0 auto; padding: 20px; }
      .ws-header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 8px; margin-bottom: 12px; }
      .ws-brand { font-size: 22px; font-weight: 900; color: #4f46e5; }
      .ws-slogan { font-size: 11px; color: #6366f1; letter-spacing: 1px; margin-top: 2px; }
      .ws-title { font-size: 16px; font-weight: 800; text-align: center; margin-bottom: 8px; }
      .ws-meta { display: flex; justify-content: space-between; font-size: 12px; color: #475569; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; }
      .ws-body { font-size: 13px; line-height: 1.8; }
      .section { margin-bottom: 14px; }
      .section h3 { font-size: 14px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
      .questions { padding-left: 20px; }
      .questions li { margin-bottom: 6px; }
      .blank { display: inline-block; min-width: 80px; border-bottom: 2px solid #1e293b; margin: 0 4px; }
      .opt { margin-right: 12px; font-size: 12px; }
      .match-cols { display: flex; justify-content: space-around; }
      .col { width: 45%; }
      .match-item { padding: 4px 0; font-size: 13px; border-bottom: 1px dotted #e2e8f0; }
      .emoji-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; }
      .emoji-item { padding: 6px; }
      .emoji-big { font-size: 32px; display: block; margin-bottom: 4px; }
      .write-lines { border-bottom: 2px solid #1e293b; height: 20px; }
      .write-line { border-bottom: 2px solid #1e293b; height: 20px; margin-top: 4px; }
      .ws-footer { text-align: center; font-size: 10px; color: #94a3b8; border-top: 2px solid #4f46e5; padding-top: 6px; margin-top: 20px; }
    </style></head><body>${content.innerHTML}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `worksheet-${selectedTopic || 'custom'}.html`; a.click();
    URL.revokeObjectURL(url);
  }, [selectedTopic]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8 pb-32 md:pb-24">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Educational Tool</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">📝 Worksheet Builder</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Generate printable worksheets from website topics or create custom ones with AI.</p>
          <div className="mt-4">
            <Link href="/educational-resources" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>

          {/* Mode Tabs */}
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setMode('website')} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${mode === 'website' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📚 From Website <span className="ml-1 text-xs opacity-80">(Unlimited)</span>
            </button>
            <button type="button" onClick={() => setMode('custom')} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${mode === 'custom' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              🤖 Custom AI <span className="ml-1 text-xs opacity-80">({remaining}/5 left)</span>
            </button>
          </div>
        </section>

        {/* Form */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          {/* Student Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-5">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Student Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter name..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Grade / Class</label>
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. KG, Grade 1, Class 3..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>

          {mode === 'website' ? (
            <>
              {/* Topic Selection */}
              <label className="mb-2 block text-xs font-bold text-slate-500">Select Topic from Website</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 mb-5">
                {WEBSITE_TOPICS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setSelectedTopic(t.id)} className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${selectedTopic === t.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <span className="text-xl">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Worksheet Type */}
              <label className="mb-2 block text-xs font-bold text-slate-500">Worksheet Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-5">
                {WS_TYPES.map((wt) => (
                  <button key={wt.id} type="button" onClick={() => setWsType(wt.id)} className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${wsType === wt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {wt.label}
                  </button>
                ))}
              </div>

              <button type="button" onClick={handleGenerateWebsite} disabled={!selectedTopic} className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                📝 Generate Worksheet
              </button>
            </>
          ) : (
            <>
              {/* Custom AI */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold text-slate-500">Topic (what should the worksheet be about?)</label>
                <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="e.g. Water cycle, Fractions, Simple machines, Pakistan studies..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold text-slate-500">Exercise Type</label>
                <select value={customType} onChange={(e) => setCustomType(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-purple-400">
                  <option value="Mixed (fill blanks, MCQ, matching, short answers)">Mixed Exercises</option>
                  <option value="Fill in the blanks only">Fill in the Blanks</option>
                  <option value="Multiple choice questions only">Multiple Choice</option>
                  <option value="Matching columns">Matching Columns</option>
                  <option value="Short answer questions">Short Answers</option>
                  <option value="True or False statements">True or False</option>
                </select>
              </div>
              <p className="mb-3 text-xs text-slate-400">⚡ {remaining} custom worksheets remaining today (limit: 5/day)</p>
              {apiError && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{apiError}</p>}
              <button type="button" onClick={handleGenerateCustom} disabled={loading || remaining <= 0 || !customTopic.trim()} className="w-full rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '⏳ Generating...' : '🤖 Generate with AI'}
              </button>
            </>
          )}
        </section>

        {/* Preview */}
        {preview && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Preview</h2>
              <div className="flex gap-2">
                <button type="button" onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700">
                  <HiOutlinePrinter className="h-4 w-4" /> Print
                </button>
                <button type="button" onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700">
                  <HiOutlineDownload className="h-4 w-4" /> Download
                </button>
              </div>
            </div>
            <div ref={previewRef} className="rounded-2xl border border-slate-200 bg-white p-6" dangerouslySetInnerHTML={{ __html: preview }} />
          </section>
        )}
      </div>
    </main>
  );
}
