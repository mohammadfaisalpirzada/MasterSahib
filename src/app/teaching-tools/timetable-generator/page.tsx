import Link from 'next/link';

import TimetableGenerator from '@/app/components/TimetableGenerator';

export default function TimetableGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Educational Resource</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Smart School Timetable Generator</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
            Generate conflict-free weekly schedules for classes, balance teacher workload, reduce idle gaps, and export the final timetable as PDF or print view.
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

        <TimetableGenerator />
      </div>
    </main>
  );
}
