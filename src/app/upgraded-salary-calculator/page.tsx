'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const salaryMonths = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
];

const toNumber = (value: string) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

function NumberInput({
  label,
  value,
  onChange,
  onFocus,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <input
        type="number"
        min="0"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );
}

function ResultRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-base font-black text-slate-950">Rs. {formatCurrency(value)}</span>
    </div>
  );
}

export default function UpgradedSalaryCalculatorPage() {
  const [salaryMonth, setSalaryMonth] = useState(salaryMonths[0]);
  const [basicPay, setBasicPay] = useState('38190');
  const [adhoc2025, setAdhoc2025] = useState('4583');
  const [adhoc2022, setAdhoc2022] = useState('2862');
  const [conveyance, setConveyance] = useState('2856');
  const [isShowingSample, setIsShowingSample] = useState(true);

  const clearSampleValues = () => {
    if (!isShowingSample) return;

    setBasicPay('');
    setAdhoc2025('');
    setAdhoc2022('');
    setConveyance('');
    setIsShowingSample(false);
  };

  const result = useMemo(() => {
    const oldBasic = toNumber(basicPay);
    const adhoc2025Amount = toNumber(adhoc2025);
    const adhoc2022Fixed = toNumber(adhoc2022);
    const oldConveyance = toNumber(conveyance);

    const adhoc2025TenPercent = (adhoc2025Amount / 12) * 10;
    const effectiveAdhoc = adhoc2025TenPercent + adhoc2022Fixed;
    const basicSevenPercent = oldBasic * 0.07;
    const methodOneIncrement = basicSevenPercent;
    const methodOneUpgradedBasic = oldBasic + methodOneIncrement + effectiveAdhoc;

    const basicWithAdhoc = oldBasic + effectiveAdhoc;
    const basicWithAdhocSevenPercent = basicWithAdhoc * 0.07;
    const methodTwoIncrement = basicWithAdhocSevenPercent;
    const methodTwoUpgradedBasic = basicWithAdhoc + methodTwoIncrement;

    const conveyanceIncrease = oldConveyance * 0.5;
    const upgradedConveyance = oldConveyance + conveyanceIncrease;
    const methodOneTotalIncrement = methodOneIncrement + conveyanceIncrease;
    const methodTwoTotalIncrement = methodTwoIncrement + conveyanceIncrease;

    return {
      oldBasic,
      adhoc2025Amount,
      adhoc2025TenPercent,
      adhoc2022Fixed,
      oldConveyance,
      effectiveAdhoc,
      basicSevenPercent,
      methodOneIncrement,
      methodOneUpgradedBasic,
      basicWithAdhoc,
      basicWithAdhocSevenPercent,
      methodTwoIncrement,
      methodTwoUpgradedBasic,
      conveyanceIncrease,
      upgradedConveyance,
      methodOneTotalIncrement,
      methodTwoTotalIncrement,
    };
  }, [adhoc2022, adhoc2025, basicPay, conveyance]);

  const hasAnyInput =
    result.oldBasic > 0 ||
    result.adhoc2025Amount > 0 ||
    result.adhoc2022Fixed > 0 ||
    result.oldConveyance > 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Salary Utility</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Master Sahib Upgraded Salary Calculator 2026 (estimated)
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            January 2026 se June 2026 tak kisi bhi month ki basic pay enter karein. Calculator dono methods ka
            increment compare karega aur conveyance increase alag show karega.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Core Modules
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
            <p className="text-sm font-bold text-violet-950">Add your current salary data</p>
            <p className="mt-1 text-sm leading-6 text-violet-800">
              Apni current basic pay, Adhoc Relief 2025, Adhoc 2022 fixed amount, aur conveyance allowance enter karein.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <label className="space-y-2">
              <span className="text-sm font-bold text-slate-800">Salary Month</span>
              <select
                value={salaryMonth}
                onChange={(event) => setSalaryMonth(event.target.value)}
                className="min-h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                {salaryMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <NumberInput
              label="Basic Pay"
              value={basicPay}
              onChange={setBasicPay}
              onFocus={clearSampleValues}
              placeholder="e.g. 45000"
            />
            <NumberInput
              label="Adhoc 12% (2025)"
              value={adhoc2025}
              onChange={setAdhoc2025}
              onFocus={clearSampleValues}
              placeholder="2025 amount"
            />
            <NumberInput
              label="Adhoc 15% Fixed (2022)"
              value={adhoc2022}
              onChange={setAdhoc2022}
              onFocus={clearSampleValues}
              placeholder="fixed amount"
            />
            <NumberInput
              label="Conveyance"
              value={conveyance}
              onChange={setConveyance}
              onFocus={clearSampleValues}
              placeholder="allowance"
            />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
                  Method 1
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Basic 7% Before Adhoc</h2>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                {salaryMonth}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4">
              <ResultRow label="Old Basic Pay" value={result.oldBasic} />
              <ResultRow label="7% of Basic Pay" value={result.basicSevenPercent} />
              <ResultRow label="Converted Adhoc 10% (2025)" value={result.adhoc2025TenPercent} />
              <ResultRow label="Adhoc 15% Fixed (2022)" value={result.adhoc2022Fixed} />
              <ResultRow label="Effective Adhoc Reference" value={result.effectiveAdhoc} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-violet-700">7% Increment</p>
                <p className="mt-1 text-2xl font-black text-violet-950">
                  Rs. {formatCurrency(result.methodOneIncrement)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">New Basic Total</p>
                <p className="mt-1 text-2xl font-black text-emerald-950">
                  Rs. {formatCurrency(result.methodOneUpgradedBasic)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-950 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                Total Increment With Conveyance
              </p>
              <p className="mt-2 text-3xl font-black">
                Rs. {formatCurrency(result.methodOneTotalIncrement)}
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-indigo-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                  Method 2
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Basic + Adhoc, Then 7%</h2>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                {salaryMonth}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4">
              <ResultRow label="Old Basic Pay" value={result.oldBasic} />
              <ResultRow label="Converted Adhoc 10% (2025)" value={result.adhoc2025TenPercent} />
              <ResultRow label="Adhoc 15% Fixed (2022)" value={result.adhoc2022Fixed} />
              <ResultRow label="Basic + Effective Adhoc" value={result.basicWithAdhoc} />
              <ResultRow label="7% of Basic + Effective Adhoc" value={result.basicWithAdhocSevenPercent} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">7% Increment</p>
                <p className="mt-1 text-2xl font-black text-indigo-950">
                  Rs. {formatCurrency(result.methodTwoIncrement)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">New Basic Total</p>
                <p className="mt-1 text-2xl font-black text-emerald-950">
                  Rs. {formatCurrency(result.methodTwoUpgradedBasic)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-950 p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                Total Increment With Conveyance
              </p>
              <p className="mt-2 text-3xl font-black">
                Rs. {formatCurrency(result.methodTwoTotalIncrement)}
              </p>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
              Conveyance
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">50% Separate Increase</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Conveyance increase basic pay mein add nahin hota. Yeh dono methods ke total increment
              mein alag add hota hai.
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4">
            <ResultRow label="Old Conveyance" value={result.oldConveyance} />
            <ResultRow label="50% Conveyance Increase" value={result.conveyanceIncrease} />
            <ResultRow label="New Conveyance Total" value={result.upgradedConveyance} />
          </div>
        </section>

        {!hasAnyInput ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Values enter karein, result automatic calculate ho jayega.
          </p>
        ) : null}
      </div>
    </main>
  );
}
