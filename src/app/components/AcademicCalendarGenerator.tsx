'use client';

import { useState } from 'react';
import { HiCalendar, HiLocationMarker, HiPrinter } from 'react-icons/hi';

import {
  countryOptions,
  formatCalendarDate,
  formatWeekday,
  generateAcademicCalendar,
  pakistanProvinceOptions,
  type AcademicCalendarFormValues,
  type AcademicHolidayEntry,
} from '@/app/lib/academicCalendar';

type HolidayLookupResponse = {
  success: boolean;
  holidays?: AcademicHolidayEntry[];
};

function buildDefaultValues(year = new Date().getFullYear()): AcademicCalendarFormValues {
  return {
    schoolName: '',
    academicYear: year,
    country: 'Pakistan',
    province: 'Sindh',
    sessionStart: `${year}-04-01`,
    sessionEnd: `${year + 1}-03-31`,
    weekendPattern: 'sunday-only',
    summerStart: `${year}-06-01`,
    summerEnd: `${year}-08-14`,
    winterStart: `${year}-12-22`,
    winterEnd: `${year + 1}-01-01`,
    customHolidays: '',
  };
}

export default function AcademicCalendarGenerator() {
  const [formValues, setFormValues] = useState<AcademicCalendarFormValues>(() => buildDefaultValues());
  const [result, setResult] = useState(() => generateAcademicCalendar(buildDefaultValues()));
  const [statusMessage, setStatusMessage] = useState(
    'Add school name, year, country, and vacation dates to prepare your academic calendar.',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((previous) => {
      if (name === 'academicYear') {
        const numericYear = Number(value) || new Date().getFullYear();
        return {
          ...previous,
          academicYear: numericYear,
          sessionStart: `${numericYear}-04-01`,
          sessionEnd: `${numericYear + 1}-03-31`,
          summerStart: `${numericYear}-06-01`,
          summerEnd: `${numericYear}-08-14`,
          winterStart: `${numericYear}-12-22`,
          winterEnd: `${numericYear + 1}-01-01`,
        };
      }

      if (name === 'country') {
        return {
          ...previous,
          country: value,
          province: value === 'Pakistan' ? 'Sindh' : previous.province || 'Your State / Province',
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setStatusMessage('Preparing your academic calendar...');

      let locationHolidays: AcademicHolidayEntry[] = [];

      try {
        const response = await fetch('/api/academic-calendar/holidays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });

        const data = (await response.json()) as HolidayLookupResponse;
        if (response.ok && Array.isArray(data.holidays)) {
          locationHolidays = data.holidays;
        }
      } catch {
        locationHolidays = [];
      }

      setResult(generateAcademicCalendar(formValues, locationHolidays));
      setHasGenerated(true);
      setStatusMessage(`${formValues.schoolName || 'Your school'} academic calendar has been prepared successfully.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sessionLabel = `${formValues.academicYear}-${formValues.academicYear + 1}`;

  return (
    <div className="space-y-6">
      <section className="calendar-form-panel no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Academic Calendar Planner</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Build a Full School Year Calendar</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            <HiLocationMarker className="h-4 w-4" />
            Country + Province Based
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 md:col-span-2 xl:col-span-3">
            <span className="text-sm font-semibold text-slate-800">School Name</span>
            <input
              type="text"
              name="schoolName"
              value={formValues.schoolName}
              onChange={handleChange}
              placeholder="e.g. The Masters Academy"
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Academic Year</span>
            <input
              type="number"
              name="academicYear"
              value={formValues.academicYear}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Country</span>
            <select
              name="country"
              value={formValues.country}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            >
              {countryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Province / State</span>
            {formValues.country === 'Pakistan' ? (
              <select
                name="province"
                value={formValues.province}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              >
                {pakistanProvinceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="province"
                value={formValues.province}
                onChange={handleChange}
                placeholder="e.g. Dubai, California, Ontario"
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Session Start</span>
            <input
              type="date"
              name="sessionStart"
              value={formValues.sessionStart}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Session End</span>
            <input
              type="date"
              name="sessionEnd"
              value={formValues.sessionEnd}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">School Week</span>
            <select
              name="weekendPattern"
              value={formValues.weekendPattern}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            >
              <option value="sunday-only">6-Day Week (Sunday Off)</option>
              <option value="saturday-sunday">5-Day Week (Saturday + Sunday Off)</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Summer Vacation Start</span>
            <input
              type="date"
              name="summerStart"
              value={formValues.summerStart}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Summer Vacation End</span>
            <input
              type="date"
              name="summerEnd"
              value={formValues.summerEnd}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Winter Vacation Start</span>
            <input
              type="date"
              name="winterStart"
              value={formValues.winterStart}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Winter Vacation End</span>
            <input
              type="date"
              name="winterEnd"
              value={formValues.winterEnd}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>

          <label className="space-y-2 md:col-span-2 xl:col-span-3">
            <span className="text-sm font-semibold text-slate-800">Extra Local Holidays (optional)</span>
            <textarea
              name="customHolidays"
              rows={4}
              value={formValues.customHolidays}
              onChange={handleChange}
              placeholder={`Use one line per holiday:\n2026-09-05 | Defence Day Observance\n2026-11-01 | Local Cultural Holiday`}
              className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <HiCalendar className="h-4 w-4" />
            {isGenerating ? 'Generating Calendar...' : 'Generate Academic Calendar'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!hasGenerated}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiPrinter className="h-4 w-4" />
            Print / Save PDF
          </button>

          <div className="inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            Working days and vacation summary included
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {statusMessage}
        </div>
      </section>

      <div className="calendar-print-area space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Calendar Summary</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">
            {formValues.schoolName || 'Your School'} Academic Calendar
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Session {sessionLabel} • {formValues.country}
            {formValues.province ? `, ${formValues.province}` : ''}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Total Session Days</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{result.summary.totalDays}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Working Days</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{result.summary.workingDays}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Weekend Days</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{result.summary.weekendDays}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Public Holidays</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{result.summary.holidayDays}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vacation Days</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{result.summary.breakDays}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Vacation Periods</h3>
            <div className="mt-4 space-y-3">
              {result.vacationRanges.map((range) => (
                <div key={range.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">{range.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatCalendarDate(range.start)} to {formatCalendarDate(range.end)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">Important Notes</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {result.notes.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-xl font-black text-slate-900">Month-by-Month Snapshot</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.monthSnapshot.map((month) => (
                <div key={month.monthLabel} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">{month.monthLabel}</p>
                  <p className="mt-2 text-sm text-slate-700">Working days: {month.workingDays}</p>
                  <p className="text-sm text-slate-600">Days off: {month.daysOff}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-xl font-black text-slate-900">Holiday Schedule</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Day</th>
                  <th className="px-3 py-2 font-semibold">Holiday</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.holidays.map((holiday) => (
                  <tr key={`${holiday.date}-${holiday.label}`}>
                    <td className="px-3 py-3 font-semibold text-slate-900">{formatCalendarDate(holiday.date)}</td>
                    <td className="px-3 py-3 text-slate-700">{formatWeekday(holiday.date)}</td>
                    <td className="px-3 py-3 text-slate-700">{holiday.label}</td>
                    <td className="px-3 py-3 text-slate-700">{holiday.category}</td>
                    <td className="px-3 py-3 text-slate-600">{holiday.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          .no-print,
          header {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          .calendar-print-area section {
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
