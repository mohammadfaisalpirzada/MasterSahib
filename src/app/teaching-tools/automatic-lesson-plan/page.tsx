'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

type MethodologyItem = {
  methodName: string;
  howToUse: string;
};

type DayPlanItem = {
  day: string;
  topicFocus: string;
  miniObjective: string;
};

type LessonPlan = {
  days: string;
  objectives: string[];
  islamicIntegration: string;
  skillFocusedOn: string[];
  materials: string[];
  methodology: MethodologyItem[];
  openingMotivation15: string;
  activity1_15: string;
  ictActivity: string;
  discussion10: string;
  classwork: string;
  homework: string;
  reflection: string;
  dayWisePlan: DayPlanItem[];
};

type ApiResponse =
  | { success: true; plan: LessonPlan }
  | { success: false; message: string; raw?: string };

const LESSON_PLAN_RETRY_MESSAGE =
  'Please excuse us. We could not generate the lesson plan right now. Please try again later.\nمعذرت، اس وقت سبق پلان تیار نہیں ہو سکا۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔';

function toTitleCase(text: string) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function SectionCard({ title, content }: { title: string; content: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{content || 'N/A'}</p>
    </article>
  );
}

async function downloadLessonPlanPdf(
  plan: LessonPlan,
  heading: string,
  daysRequired: string
) {
  const { default: jsPDF } = await import('jspdf');

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 15;
  const LINE_H = 6;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  function addWatermark() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(54);
    doc.setTextColor(225, 225, 225);
    doc.text('TheMasterSahib', PAGE_W / 2, PAGE_H / 2, {
      angle: 45,
      align: 'center',
    });
  }

  let y = MARGIN;
  addWatermark();

  function checkPageBreak(needed = LINE_H) {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      addWatermark();
      y = MARGIN;
    }
  }

  function addHeading1(text: string) {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 8 + 3;
  }

  function addHeading2(text: string) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    const lines = doc.splitTextToSize(text.toUpperCase(), CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5.5 + 2;
  }

  function addBody(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 55);
    const lines = doc.splitTextToSize(text || 'N/A', CONTENT_W);
    for (const line of lines) {
      checkPageBreak(LINE_H);
      doc.text(line, MARGIN, y);
      y += LINE_H;
    }
    y += 2;
  }

  function addBullet(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 55);
    const lines = doc.splitTextToSize('• ' + text, CONTENT_W - 4);
    for (const line of lines) {
      checkPageBreak(LINE_H);
      doc.text(line, MARGIN + 2, y);
      y += LINE_H;
    }
  }

  function addSpacer(h = 5) {
    y += h;
  }

  function addDivider() {
    checkPageBreak(6);
    doc.setDrawColor(210, 210, 210);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;
  }

  // ── Title ─────────────────────────────────────────────────────────────────
  addHeading1(heading);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Days: ${plan.days || daysRequired}`, MARGIN, y);
  y += 7;
  addDivider();

  // ── Sections ──────────────────────────────────────────────────────────────
  addHeading2('Objectives');
  plan.objectives.forEach((o) => addBullet(o));
  addSpacer();

  addHeading2('Islamic Integration');
  addBody(plan.islamicIntegration);
  addSpacer();

  addHeading2('Skill Focused On');
  plan.skillFocusedOn.forEach((s) => addBullet(s));
  addSpacer();

  addHeading2('Materials');
  plan.materials.forEach((m) => addBullet(m));
  addSpacer();

  addHeading2('Methodology');
  plan.methodology.forEach((m) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const titleLines = doc.splitTextToSize(m.methodName, CONTENT_W);
    doc.text(titleLines, MARGIN, y);
    y += titleLines.length * 6 + 1;
    addBody(m.howToUse);
  });
  addSpacer();

  const simpleSections: [string, string][] = [
    ['Opening (Motivation) – 15 min', plan.openingMotivation15],
    ['Activity 1 – 15 min', plan.activity1_15],
    ['ICT Activity', plan.ictActivity],
    ['Discussion – 10 min', plan.discussion10],
    ['Classwork', plan.classwork],
    ['Homework', plan.homework],
    ['Reflection', plan.reflection],
  ];
  simpleSections.forEach(([title, content]) => {
    addHeading2(title);
    addBody(content);
    addSpacer();
  });

  addHeading2('Day-Wise Planning');
  plan.dayWisePlan.forEach((d, idx) => {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(d.day || `Day ${idx + 1}`, MARGIN, y);
    y += 6;
    addBody(`Topic: ${d.topicFocus || 'N/A'}`);
    addBody(`Objective: ${d.miniObjective || 'N/A'}`);
    y += 2;
  });

  // ── Footer on every page ──────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text('themastersahib.com', MARGIN, PAGE_H - 7);
    doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, PAGE_H - 7, {
      align: 'right',
    });
  }

  const filename = `${heading.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lesson_plan.pdf`;
  doc.save(filename);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderPrintMarkup(plan: LessonPlan, heading: string, daysRequired: string) {
  const objectiveItems = plan.objectives.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const skillItems = plan.skillFocusedOn.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const materialItems = plan.materials.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  const methodologyItems = plan.methodology
    .map(
      (item) =>
        `<div class="card"><h4>${escapeHtml(item.methodName || 'Method')}</h4><p>${escapeHtml(item.howToUse || 'N/A')}</p></div>`
    )
    .join('');

  const dayItems = plan.dayWisePlan
    .map(
      (item, idx) =>
        `<div class="card"><h4>${escapeHtml(item.day || `Day ${idx + 1}`)}</h4><p><strong>Topic:</strong> ${escapeHtml(item.topicFocus || 'N/A')}</p><p><strong>Objective:</strong> ${escapeHtml(item.miniObjective || 'N/A')}</p></div>`
    )
    .join('');

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapeHtml(heading)} - Lesson Plan</title>
      <style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        body {
          font-family: "Segoe UI", Tahoma, Arial, sans-serif;
          color: #1f2937;
          line-height: 1.45;
          margin: 0;
          position: relative;
        }
        body::before {
          content: "TheMasterSahib";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 72px;
          color: rgba(17, 24, 39, 0.07);
          z-index: -1;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }
        h1 { margin: 0 0 4px; font-size: 26px; }
        h2 {
          margin: 20px 0 8px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4b5563;
        }
        h4 { margin: 0 0 6px; font-size: 14px; }
        p, li { font-size: 13px; margin: 0 0 6px; }
        ul { margin: 0; padding-left: 18px; }
        .meta { color: #6b7280; font-size: 13px; margin-bottom: 10px; }
        .divider { border-bottom: 1px solid #d1d5db; margin: 8px 0 14px; }
        .grid { display: grid; gap: 10px; }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px;
          background: #ffffff;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          color: #9ca3af;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(heading)}</h1>
      <p class="meta">Days: ${escapeHtml(plan.days || daysRequired)}</p>
      <div class="divider"></div>

      <h2>Objectives</h2>
      <ul>${objectiveItems || '<li>N/A</li>'}</ul>

      <h2>Islamic Integration</h2>
      <p>${escapeHtml(plan.islamicIntegration || 'N/A')}</p>

      <h2>Skill Focused On</h2>
      <ul>${skillItems || '<li>N/A</li>'}</ul>

      <h2>Materials</h2>
      <ul>${materialItems || '<li>N/A</li>'}</ul>

      <h2>Methodology</h2>
      <div class="grid">${methodologyItems || '<p>N/A</p>'}</div>

      <h2>Opening (Motivation) - 15 Minutes</h2>
      <p>${escapeHtml(plan.openingMotivation15 || 'N/A')}</p>

      <h2>Activity 1 - 15 Minutes</h2>
      <p>${escapeHtml(plan.activity1_15 || 'N/A')}</p>

      <h2>ICT Activity</h2>
      <p>${escapeHtml(plan.ictActivity || 'N/A')}</p>

      <h2>Discussion - 10 Minutes</h2>
      <p>${escapeHtml(plan.discussion10 || 'N/A')}</p>

      <h2>Classwork</h2>
      <p>${escapeHtml(plan.classwork || 'N/A')}</p>

      <h2>Homework</h2>
      <p>${escapeHtml(plan.homework || 'N/A')}</p>

      <h2>Reflection</h2>
      <p>${escapeHtml(plan.reflection || 'N/A')}</p>

      <h2>Day-Wise Planning</h2>
      <div class="grid">${dayItems || '<p>N/A</p>'}</div>

      <div class="footer">themastersahib.com</div>
    </body>
  </html>
  `;
}

function printLessonPlan(plan: LessonPlan, heading: string, daysRequired: string) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow popups and try again.');
  }

  const html = renderPrintMarkup(plan, heading, daysRequired);
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
}

export default function AutomaticLessonPlanPage() {
  const [chapterOrTopic, setChapterOrTopic] = useState('');
  const [className, setClassName] = useState('');
  const [units, setUnits] = useState('');
  const [daysRequired, setDaysRequired] = useState('5');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [bookFile, setBookFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<LessonPlan | null>(null);

  const heading = useMemo(() => {
    if (!chapterOrTopic || !className) return 'Lesson Plan';
    return `${toTitleCase(chapterOrTopic)} - ${className}`;
  }, [chapterOrTopic, className]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setPlan(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('chapterOrTopic', chapterOrTopic);
      formData.append('className', className);
      formData.append('units', units);
      formData.append('daysRequired', daysRequired);
      formData.append('teacherNotes', teacherNotes);
      if (bookFile) formData.append('bookFile', bookFile);

      const response = await fetch('/api/teaching-tools/automatic-lesson-plan', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        const message =
          'message' in data
            ? data.message
            : LESSON_PLAN_RETRY_MESSAGE;
        setError(message || LESSON_PLAN_RETRY_MESSAGE);
        return;
      }

      setPlan(data.plan);
    } catch {
      setError(LESSON_PLAN_RETRY_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Lesson Planning Tool</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Lesson Plan Generator</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            The teacher provides the topic, class, number of days, and an optional PDF or image. The tool prepares a
            complete lesson plan with objectives, activities, methodology, classwork, homework, and reflection.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base" dir="rtl">
            استاد موضوع، جماعت، مطلوبہ دن، اور اختیاری پی ڈی ایف یا تصویر دے گا۔ یہ ٹول مقاصد، سرگرمیوں، طریقہ تدریس،
            کلاس ورک، ہوم ورک، اور عکاسی کے ساتھ مکمل سبق پلان تیار کرے گا۔
          </p>
          <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Daily limit: 3 lesson plans per user
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/teaching-tools"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Educational Resources
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Chapter Name or Topic *</span>
              <input
                type="text"
                value={chapterOrTopic}
                onChange={(e) => setChapterOrTopic(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                placeholder="Fractions, Photosynthesis, Seerat-un-Nabi..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Class *</span>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                placeholder="Class 6"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Units / Subtopics</span>
              <input
                type="text"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                placeholder="Unit 3, Unit 4 or key subtopics"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Required Days *</span>
              <input
                type="number"
                min={1}
                max={30}
                value={daysRequired}
                onChange={(e) => setDaysRequired(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Book PDF or Image (optional)</span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Extra Teacher Notes</span>
              <textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                placeholder="Any school policy, weak students, assessment style, language preference..."
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Generating Plan...' : 'Generate Lesson Plan'}
              </button>
            </div>
          </form>

          {error ? (
            <p className="mt-4 whitespace-pre-line rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
          ) : null}
        </section>

        {plan ? (
          <section className="space-y-4">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-emerald-900">{heading}</h2>
                  <p className="mt-2 text-sm font-semibold text-emerald-800">Days: {plan.days || daysRequired}</p>
                </div>
                <button
                  type="button"
                  disabled={isPdfLoading}
                  onClick={async () => {
                    setIsPdfLoading(true);
                    try {
                      await downloadLessonPlanPdf(plan, heading, daysRequired);
                    } finally {
                      setIsPdfLoading(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPdfLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isPrintLoading}
                  onClick={() => {
                    setIsPrintLoading(true);
                    try {
                      printLessonPlan(plan, heading, daysRequired);
                    } catch (printError) {
                      const message =
                        printError instanceof Error ? printError.message : 'Unable to open print dialog right now.';
                      setError(message);
                    } finally {
                      setIsPrintLoading(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 2a2 2 0 00-2 2v4h2V4h10v4h2V4a2 2 0 00-2-2H5z" />
                    <path d="M4 9a2 2 0 00-2 2v3a2 2 0 002 2h1v2h10v-2h1a2 2 0 002-2v-3a2 2 0 00-2-2H4zm3 5h6v2H7v-2z" />
                  </svg>
                  {isPrintLoading ? 'Preparing Print...' : 'Print'}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Objectives</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {plan.objectives.map((item, idx) => (
                    <li key={`${item}-${idx}`}>• {item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Islamic Integration</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{plan.islamicIntegration || 'N/A'}</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Skill Focused On</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {plan.skillFocusedOn.map((item, idx) => (
                    <li key={`${item}-${idx}`}>• {item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Materials</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {plan.materials.map((item, idx) => (
                    <li key={`${item}-${idx}`}>• {item}</li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">
                  Methodology (Method Name + How to Use)
                </h3>
                <div className="mt-3 space-y-3">
                  {plan.methodology.map((item, idx) => (
                    <div key={`${item.methodName}-${idx}`} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-800">{item.methodName}</p>
                      <p className="mt-1 text-sm text-slate-700">{item.howToUse}</p>
                    </div>
                  ))}
                </div>
              </article>

              <SectionCard title="Opening (Motivation) - 15 Minutes" content={plan.openingMotivation15} />
              <SectionCard title="Activity 1 - 15 Minutes" content={plan.activity1_15} />
              <SectionCard title="ICT Activity (if any)" content={plan.ictActivity} />
              <SectionCard title="Discussion - 10 Minutes" content={plan.discussion10} />
              <SectionCard title="Classwork" content={plan.classwork} />
              <SectionCard title="Homework" content={plan.homework} />
              <SectionCard title="Reflection" content={plan.reflection} />

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Day-Wise Planning</h3>
                <div className="mt-3 space-y-2">
                  {plan.dayWisePlan.map((item, idx) => (
                    <div key={`${item.day}-${idx}`} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-800">{item.day || `Day ${idx + 1}`}</p>
                      <p className="mt-1 text-sm text-slate-700">Topic: {item.topicFocus || 'N/A'}</p>
                      <p className="mt-1 text-sm text-slate-700">Objective: {item.miniObjective || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
