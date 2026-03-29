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

export default function AutomaticLessonPlanPage() {
  const [chapterOrTopic, setChapterOrTopic] = useState('');
  const [className, setClassName] = useState('');
  const [units, setUnits] = useState('');
  const [daysRequired, setDaysRequired] = useState('5');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [bookFile, setBookFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
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
            : 'Please excuse us. The lesson plan service is unavailable right now. Please try again later.\nمعذرت، سبق پلان سروس اس وقت دستیاب نہیں۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔';
        setError(message || 'Please excuse us. The lesson plan service is unavailable right now. Please try again later.');
        return;
      }

      setPlan(data.plan);
    } catch {
      setError(
        'Please excuse us. We could not generate the lesson plan right now. Please try again later.\nمعذرت، اس وقت سبق پلان تیار نہیں ہو سکا۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔'
      );
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
              ← Back to Teaching Tools
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
              <h2 className="text-xl font-black text-emerald-900">{heading}</h2>
              <p className="mt-2 text-sm font-semibold text-emerald-800">Days: {plan.days || daysRequired}</p>
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
