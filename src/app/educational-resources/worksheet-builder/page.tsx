'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiOutlineDownload, HiOutlinePrinter } from 'react-icons/hi';

/* ─── Website Topics with images ─── */
type WsTopic = { id: string; label: string; icon: string; words: string[]; images?: string[] };
const WEBSITE_TOPICS: WsTopic[] = [
  { id: 'shapes', label: 'Shapes', icon: '⭐', words: ['Circle', 'Heart', 'Star', 'Triangle', 'Cone', 'Oval', 'Rectangle', 'Square'], images: ['⭕', '❤️', '⭐', '🔺', '🔶', '🥚', '▬', '🟩'] },
  { id: 'colors', label: 'Colors', icon: '🌈', words: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Brown'], images: ['🔴', '🔵', '🟢', '🟡', '🟠', '🩷', '🟣', '🟤'] },
  { id: 'animals', label: 'Animals', icon: '🦁', words: ['Cat', 'Dog', 'Lion', 'Tiger', 'Fox', 'Monkey', 'Horse', 'Elephant', 'Rabbit', 'Giraffe', 'Zebra', 'Cow'], images: ['🐱', '🐶', '🦁', '🐯', '🦊', '🐵', '🐴', '🐘', '🐰', '🦒', '🦓', '🐄'] },
  { id: 'birds', label: 'Birds', icon: '🦜', words: ['Parrot', 'Peacock', 'Sparrow', 'Crow', 'Penguin', 'Eagle', 'Pigeon', 'Owl'], images: ['🦜', '🦚', '🐦', '🐦‍⬛', '🐧', '🦅', '🕊️', '🦉'] },
  { id: 'vegetables', label: 'Vegetables', icon: '🥕', words: ['Potato', 'Tomato', 'Cabbage', 'Carrot', 'Onion', 'Peas', 'Cucumber', 'Brinjal'], images: ['🥔', '🍅', '🥬', '🥕', '🧅', '🫛', '🥒', '🍆'] },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳', words: ['Stove', 'Plate', 'Pan', 'Bowl', 'Glass', 'Spoon', 'Fork', 'Kettle'], images: ['🔥', '🍽️', '🍳', '🥣', '🥛', '🥄', '🍴', '🫖'] },
  { id: 'garden', label: 'Garden', icon: '🌻', words: ['Grass', 'Flower', 'Tree', 'Bench', 'Butterfly', 'Bird', 'Swing', 'Stone'], images: ['🌿', '🌸', '🌳', '🪑', '🦋', '🐦', '🎠', '🪨'] },
  { id: 'occupations', label: 'Occupations', icon: '👨‍⚕️', words: ['Doctor', 'Teacher', 'Pilot', 'Farmer', 'Tailor', 'Policeman', 'Carpenter', 'Barber'], images: ['👨‍⚕️', '👩‍🏫', '👨‍✈️', '👨‍🌾', '🧵', '👮', '🪚', '💈'] },
  { id: 'days', label: 'Days of Week', icon: '📅', words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], images: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'] },
  { id: 'months', label: 'Months', icon: '📆', words: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], images: ['❄️', '❄️', '🌸', '🌷', '☀️', '☀️', '☀️', '🌻', '🍂', '🎃', '🍁', '🎄'] },
  { id: 'sight-words', label: 'Sight Words', icon: '👁️', words: ['Cat', 'Dog', 'Sun', 'Hat', 'Ball', 'Fish', 'Bird', 'Book', 'Star', 'Moon', 'Tree', 'Flower', 'Apple', 'Milk', 'Car', 'House'], images: ['🐱', '🐶', '☀️', '🎩', '⚽', '🐟', '🐦', '📖', '⭐', '🌙', '🌳', '🌸', '🍎', '🥛', '🚗', '🏠'] },
  { id: 'teen-numbers', label: 'Teen Numbers', icon: '🔟', words: ['13-Thirteen', '14-Fourteen', '15-Fifteen', '16-Sixteen', '17-Seventeen', '18-Eighteen', '19-Nineteen'], images: ['1️⃣3️⃣', '1️⃣4️⃣', '1️⃣5️⃣', '1️⃣6️⃣', '1️⃣7️⃣', '1️⃣8️⃣', '1️⃣9️⃣'] },
  { id: 'ty-numbers', label: 'Tens (20-90)', icon: '💯', words: ['20-Twenty', '30-Thirty', '40-Forty', '50-Fifty', '60-Sixty', '70-Seventy', '80-Eighty', '90-Ninety'], images: ['2️⃣0️⃣', '3️⃣0️⃣', '4️⃣0️⃣', '5️⃣0️⃣', '6️⃣0️⃣', '7️⃣0️⃣', '8️⃣0️⃣', '9️⃣0️⃣'] },
  { id: '3d-shapes', label: '3D Shapes', icon: '🧊', words: ['Cube', 'Cuboid', 'Sphere', 'Cylinder', 'Cone', 'Pyramid'], images: ['🧊', '📦', '🏀', '🥫', '🍦', '🔺'] },
  { id: 'fruits', label: 'Fruits', icon: '🍎', words: ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Watermelon', 'Strawberry', 'Pineapple'], images: ['🍎', '🍌', '🍊', '🍇', '🥭', '🍉', '🍓', '🍍'] },
  { id: 'body-parts', label: 'Body Parts', icon: '🧍', words: ['Head', 'Eyes', 'Nose', 'Mouth', 'Hands', 'Legs', 'Ears', 'Feet'], images: ['🗣️', '👀', '👃', '👄', '🤲', '🦵', '👂', '🦶'] },
  { id: 'transport', label: 'Transport', icon: '🚗', words: ['Car', 'Bus', 'Train', 'Bicycle', 'Airplane', 'Boat', 'Truck', 'Motorcycle'], images: ['🚗', '🚌', '🚂', '🚲', '✈️', '⛵', '🚛', '🏍️'] },
];

/* ─── Worksheet Types ─── */
const WS_TYPES = [
  { id: 'mixed', label: '🎲 Mixed (All Types)' },
  { id: 'fill-blanks', label: '📝 Fill in the Blanks' },
  { id: 'match', label: '🔗 Match Image to Word' },
  { id: 'mcq', label: '🔘 Multiple Choice' },
  { id: 'circle', label: '⭕ See Image, Pick Word' },
  { id: 'write', label: '✍️ Write the Word' },
];

/* ─── Helpers ─── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function getLabel(w: string) {
  return w.includes('-') ? w.split('-')[1] : w;
}

function getEmoji(topic: WsTopic, word: string): string {
  const idx = topic.words.indexOf(word);
  return topic.images?.[idx] || '❓';
}

/* ─── Worksheet Generator ─── */
function generateWorksheetHTML(topic: WsTopic, type: string, studentName: string, grade: string): string {
  const count = Math.min(8, topic.words.length);
  const indices = shuffle(topic.words.map((_, i) => i)).slice(0, count);
  const selectedWords = indices.map(i => topic.words[i]);
  const hasImages = !!topic.images && topic.images.length > 0;
  let body = '';

  /* ── Fill in the Blanks ── */
  if (type === 'fill-blanks' || type === 'mixed') {
    const items = selectedWords.slice(0, 6);
    body += `<div class="section"><h3>📝 Fill in the Blanks</h3>`;
    if (hasImages) {
      body += `<div class="fib-grid">`;
      items.forEach((w) => {
        const emoji = getEmoji(topic, w);
        const label = getLabel(w);
        body += `<div class="fib-row"><span class="fib-emoji">${emoji}</span><span class="fib-text">This is a <span class="blank-line"></span></span></div>`;
      });
      body += `</div>`;
    } else {
      body += `<ol class="questions">`;
      items.forEach((w) => {
        const label = getLabel(w);
        body += `<li>Write the word: <strong>${label}</strong> <span class="blank-line"></span></li>`;
      });
      body += `</ol>`;
    }
    body += `</div>`;
  }

  /* ── Multiple Choice (text shown, pick correct text) ── */
  if (type === 'mcq' || (type === 'mixed' && !hasImages)) {
    const items = selectedWords.slice(0, 5);
    body += `<div class="section"><h3>🔘 Multiple Choice — Choose the correct answer</h3><ol class="questions">`;
    items.forEach((w) => {
      const label = getLabel(w);
      const distractors = shuffle(topic.words.filter(x => x !== w)).slice(0, 3).map(x => getLabel(x));
      const opts = shuffle([label, ...distractors]);
      body += `<li><strong>${label}</strong><br/>${opts.map(o => `<span class="opt-circle">(&nbsp;)&nbsp;${o}</span>`).join('')}</li>`;
    });
    body += `</ol></div>`;
  }

  /* ── Match Image to Word (left = images, right = shuffled words) ── */
  if (type === 'match' || (type === 'mixed' && hasImages)) {
    const items = indices.slice(0, 6);
    const leftItems = items.map(i => ({ emoji: topic.images?.[i] || '❓', idx: i }));
    const rightItems = shuffle(items.map(i => ({ word: getLabel(topic.words[i]), idx: i })));
    body += `<div class="section"><h3>🔗 Match the Image to the Word — Draw a line</h3>`;
    body += `<table class="match-table"><tr>`;
    body += `<td class="match-col">`;
    leftItems.forEach((item, i) => {
      body += `<div class="match-row"><span class="match-emoji">${item.emoji}</span><span class="match-num">${i + 1}.</span><span class="match-line"></span></div>`;
    });
    body += `</td><td class="match-col">`;
    rightItems.forEach((item) => {
      const letter = String.fromCharCode(65 + rightItems.indexOf(item));
      body += `<div class="match-row"><span class="match-letter">(${letter})</span><span class="match-word">${item.word}</span><span class="match-line"></span></div>`;
    });
    body += `</td></tr></table></div>`;
  }

  /* ── Circle the Correct: SEE IMAGE → PICK THE WORD ── */
  if (type === 'circle' || (type === 'mixed' && hasImages)) {
    const items = selectedWords.slice(0, 5);
    body += `<div class="section"><h3>⭕ Look at the Picture — Circle the Correct Word</h3>`;
    body += `<div class="circle-grid">`;
    items.forEach((w) => {
      const emoji = getEmoji(topic, w);
      const label = getLabel(w);
      const distractors = shuffle(topic.words.filter(x => x !== w)).slice(0, 2).map(x => getLabel(x));
      const opts = shuffle([label, ...distractors]);
      body += `<div class="circle-card"><div class="circle-img">${emoji}</div><div class="circle-options">${opts.map(o => `<span class="opt-circle">(&nbsp;)&nbsp;${o}</span>`).join('')}</div></div>`;
    });
    body += `</div></div>`;
  }

  /* ── Write the Word: SEE IMAGE → WRITE WORD ── */
  if (type === 'write' || type === 'mixed') {
    if (hasImages) {
      const items = indices.slice(0, 8);
      body += `<div class="section"><h3>✍️ Look at the Picture — Write the Word</h3>`;
      body += `<div class="write-grid">`;
      items.forEach((i) => {
        const emoji = topic.images?.[i] || '❓';
        body += `<div class="write-card"><div class="write-img">${emoji}</div><div class="write-line-box"></div></div>`;
      });
      body += `</div></div>`;
    } else {
      const items = selectedWords.slice(0, 6);
      body += `<div class="section"><h3>✍️ Write the Word</h3><ol class="questions">`;
      items.forEach((w) => {
        body += `<li><strong>${getLabel(w)}</strong> <div class="write-line-full"></div></li>`;
      });
      body += `</ol></div>`;
    }
  }

  return `
<div class="worksheet-page">
  <div class="ws-header">
    <div class="ws-brand">The Master Sahib</div>
    <div class="ws-slogan">Learn, Build &amp; Grow</div>
  </div>
  <div class="ws-title">Worksheet — ${topic.label}</div>
  <div class="ws-meta">
    <span>Student Name: <strong>${studentName || '____________________'}</strong></span>
    <span>Grade: <strong>${grade || '________'}</strong></span>
    <span>Date: <strong>____________</strong></span>
  </div>
  <div class="ws-body">${body}</div>
  <div class="ws-footer">www.themastersahib.com</div>
</div>`;
}

/* ─── CSS for print ─── */
const WORKSHEET_CSS = `
  @page { size: A4; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; }
  .worksheet-page { max-width: 700px; margin: 0 auto; padding: 16px; }
  .ws-header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 6px; margin-bottom: 10px; }
  .ws-brand { font-size: 24px; font-weight: 900; color: #4f46e5; letter-spacing: 0.5px; }
  .ws-slogan { font-size: 11px; color: #6366f1; letter-spacing: 1.5px; margin-top: 1px; text-transform: uppercase; }
  .ws-title { font-size: 16px; font-weight: 800; text-align: center; margin-bottom: 8px; color: #0f172a; }
  .ws-meta { display: flex; justify-content: space-between; font-size: 11px; color: #475569; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; flex-wrap: wrap; gap: 4px; }
  .ws-body { font-size: 13px; line-height: 1.7; }
  .section { margin-bottom: 12px; }
  .section h3 { font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 2px; }
  .questions { padding-left: 18px; }
  .questions li { margin-bottom: 6px; }
  .blank-line { display: inline-block; min-width: 100px; border-bottom: 2px solid #1e293b; margin: 0 4px; height: 1.2em; vertical-align: bottom; }
  .opt-circle { display: inline-block; margin: 2px 12px 2px 0; font-size: 12px; }

  /* Fill in the blanks with images */
  .fib-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
  .fib-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
  .fib-emoji { font-size: 36px; flex-shrink: 0; width: 50px; text-align: center; }
  .fib-text { font-size: 13px; }

  /* Match columns */
  .match-table { width: 100%; border-collapse: collapse; }
  .match-col { width: 50%; vertical-align: top; padding: 0 8px; }
  .match-row { display: flex; align-items: center; gap: 6px; padding: 6px 0; border-bottom: 1px dotted #e2e8f0; }
  .match-emoji { font-size: 32px; width: 45px; text-align: center; flex-shrink: 0; }
  .match-num { font-weight: 700; font-size: 13px; color: #475569; width: 22px; }
  .match-letter { font-weight: 700; font-size: 13px; color: #475569; width: 28px; }
  .match-word { font-size: 13px; font-weight: 600; }
  .match-line { flex: 1; border-bottom: 1px solid #94a3b8; height: 1px; }

  /* Circle the correct (image → pick word) */
  .circle-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
  .circle-card { display: flex; align-items: center; gap: 12px; padding: 6px 8px; border: 1.5px solid #e2e8f0; border-radius: 10px; }
  .circle-img { font-size: 48px; width: 60px; text-align: center; flex-shrink: 0; }
  .circle-options { display: flex; gap: 12px; flex-wrap: wrap; }

  /* Write the word (image → write) */
  .write-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .write-card { text-align: center; padding: 8px; border: 1.5px solid #e2e8f0; border-radius: 10px; }
  .write-img { font-size: 42px; margin-bottom: 6px; }
  .write-line-box { border-bottom: 2px solid #1e293b; height: 22px; }
  .write-line-full { border-bottom: 2px solid #1e293b; height: 20px; margin-top: 4px; }

  .ws-footer { text-align: center; font-size: 10px; color: #94a3b8; border-top: 2px solid #4f46e5; padding-top: 5px; margin-top: 16px; letter-spacing: 0.5px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

/* ─── Page Component ─── */
export default function WorksheetBuilderPage() {
  const [mode, setMode] = useState<'website' | 'custom'>('website');
  const [selectedTopic, setSelectedTopic] = useState('');
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
    if (remaining <= 0) { setApiError(`Daily limit reached. You can generate 5 custom worksheets per day.`); return; }
    setLoading(true); setApiError('');
    try {
      const res = await fetch('/api/educational-resources/worksheet-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic, grade, studentName, worksheetType: customType }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Failed.'); setLoading(false); return; }
      setPreview(data.html);
      setRemaining(data.remaining ?? remaining - 1);
    } catch { setApiError('Network error.'); }
    setLoading(false);
  }, [customTopic, grade, studentName, customType, remaining]);

  const handlePrint = useCallback(() => {
    const content = previewRef.current;
    if (!content) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Worksheet - The Master Sahib</title><style>${WORKSHEET_CSS}</style></head><body>${content.innerHTML}</body></html>`);
    w.document.close(); w.print();
  }, []);

  const handleDownload = useCallback(() => {
    const content = previewRef.current;
    if (!content) return;
    const blob = new Blob([`<!DOCTYPE html><html><head><title>Worksheet</title><style>${WORKSHEET_CSS}</style></head><body>${content.innerHTML}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `worksheet-${selectedTopic || 'custom'}.html`; a.click();
    URL.revokeObjectURL(url);
  }, [selectedTopic]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8 pb-32 md:pb-24">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Educational Tool</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">📝 Worksheet Builder</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Generate beautiful printable worksheets with images from website topics, or create custom AI worksheets.</p>
          <div className="mt-4"><Link href="/educational-resources" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link></div>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setMode('website')} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${mode === 'website' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              📚 From Website <span className="ml-1 text-xs opacity-80">(Unlimited)</span>
            </button>
            <button type="button" onClick={() => setMode('custom')} className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${mode === 'custom' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              🤖 Custom AI <span className="ml-1 text-xs opacity-80">({remaining}/5)</span>
            </button>
          </div>
        </section>

        {/* Form */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
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
              <label className="mb-2 block text-xs font-bold text-slate-500">Select Topic</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 mb-5 max-h-64 overflow-y-auto">
                {WEBSITE_TOPICS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setSelectedTopic(t.id)} className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${selectedTopic === t.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <span className="text-xl">{t.icon}</span><span>{t.label}</span>
                  </button>
                ))}
              </div>
              <label className="mb-2 block text-xs font-bold text-slate-500">Worksheet Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-5">
                {WS_TYPES.map((wt) => (
                  <button key={wt.id} type="button" onClick={() => setWsType(wt.id)} className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition ${wsType === wt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {wt.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleGenerateWebsite} disabled={!selectedTopic} className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">📝 Generate Worksheet</button>
            </>
          ) : (
            <>
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
