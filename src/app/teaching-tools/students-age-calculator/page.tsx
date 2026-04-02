'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type AgeResult = {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
};

function calculateAge(dateOfBirth: string, asOfDate: string): AgeResult | null {
  if (!dateOfBirth || !asOfDate) return null;

  const birth = new Date(dateOfBirth);
  const asOf = new Date(asOfDate);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(asOf.getTime()) || birth > asOf) {
    return null;
  }

  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();

  if (days < 0) {
    const previousMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalMonths = years * 12 + months;

  return { years, months, days, totalMonths };
}

function getRecommendedClass(ageYears: number): string {
  if (ageYears < 3) return 'Too Young for Formal Schooling';
  if (ageYears === 3) return 'Play Group';
  if (ageYears === 4) return 'Nursery';
  if (ageYears === 5) return 'Prep / KG';
  if (ageYears === 6) return 'Class 1';
  if (ageYears === 7) return 'Class 2';
  if (ageYears === 8) return 'Class 3';
  if (ageYears === 9) return 'Class 4';
  if (ageYears === 10) return 'Class 5';
  if (ageYears === 11) return 'Class 6';
  if (ageYears === 12) return 'Class 7';
  if (ageYears === 13) return 'Class 8';
  if (ageYears === 14) return 'Class 9';
  if (ageYears === 15) return 'Class 10';
  if (ageYears === 16) return 'Class 11 (1st Year)';
  if (ageYears === 17) return 'Class 12 (2nd Year)';
  return 'College / Higher Education';
}

function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StudentsAgeCalculatorPage() {
  const [dob, setDob] = useState('');
  const [asOfDate, setAsOfDate] = useState(getTodayISODate());

  const result = useMemo(() => calculateAge(dob, asOfDate), [dob, asOfDate]);
  const recommendedClass = result ? getRecommendedClass(result.years) : null;

  return (
    <main className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Tool of the Day</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Students Age Calculator</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Student ki age calculate karein aur age ke mutabiq recommended class hasil karein.
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

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Date of Birth</span>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Calculate As Of</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-500"
            />
          </label>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!dob ? (
            <p className="text-sm text-slate-600">Date of birth select karein taake result show ho.</p>
          ) : !result ? (
            <p className="text-sm text-rose-600">Invalid date range. DOB, As Of date se bari nahin ho sakti.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Years</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{result.years}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Months</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{result.months}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Days</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{result.days}</p>
                </article>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Recommended Class</p>
                <p className="mt-1 text-xl font-black text-emerald-900">{recommendedClass}</p>
                <p className="mt-2 text-sm text-emerald-800">
                  Estimated on {result.years} years ({result.totalMonths} total months) age bracket.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
