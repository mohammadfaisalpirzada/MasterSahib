'use client';

import Link from 'next/link';

const tools = [
  {
    title: 'Students Age Calculator',
    description: 'Tool of the Day: calculate exact student age and get recommended class as per age.',
    status: 'Ready',
    href: '/teaching-tools/students-age-calculator',
  },
  {
    title: 'Resume Builder',
    description: 'Create teacher CV/resume quickly for applications and profile updates.',
    status: 'Ready',
    href: '/resume-builder',
  },
  {
    title: 'Lesson Plan Generator',
    description: 'Upload a book PDF/image or enter topic details to create a complete lesson plan.',
    status: 'Ready',
    href: '/teaching-tools/automatic-lesson-plan',
  },
  {
    title: 'Attendance Tracker',
    description: 'Simple attendance workflow for class-wise management.',
    status: 'Ready',
    href: '#',
  },
  {
    title: 'Worksheet Builder',
    description: 'Create practice sheets and print-ready activities.',
    status: 'Coming Soon',
  },
  {
    title: 'Class Routine Board',
    description: 'Keep your daily timetable and activity timeline in one place.',
    status: 'Coming Soon',
  },
];

export default function TeachingToolsPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">New Workspace</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Teaching Tools</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Use this space to manage and expand your daily teaching tools. Each card can be connected to your custom utility pages.
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
              Request New Tool
            </Link>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <article
              key={tool.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">{tool.title}</h2>
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
                    Open Tool
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
