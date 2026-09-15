'use client';

import Link from 'next/link';
import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react';

/**
 * Shared engine for the Accountant General Sindh / payroll forms
 * (PAY01–PAY06, vendor creation, pension option, indemnity bond, ...).
 *
 * These forms are box-grid layouts rather than paragraph certificates, so each
 * page supplies its own `sheet(values)` JSX built from the primitives exported
 * here. The engine handles the input form, shared browser storage, the emblem
 * and the A4 print rules (portrait or landscape).
 */

const OFFICE_KEY = 'ms-ag-forms-office-v1';
const DATA_KEY = 'ms-govt-forms-data-v1';
const EMBLEM_KEY = 'ms-ag-forms-emblem-v1';
const WHATSAPP_NUMBER = '923458340669';

export type AgFieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'select' | 'textarea' | 'cnic' | 'phone' | 'number';
  options?: string[];
  placeholder?: string;
  hint?: string;
  wide?: boolean;
  section?: string;
  defaultValue?: string;
};

export type AgFormConfig = {
  slug: string;
  pageTitle: string;
  pageIntro: string;
  formCode?: string;
  orientation?: 'portrait' | 'landscape';
  fields: AgFieldDef[];
  sheet: (v: Record<string, string>, emblem: string) => ReactNode;
  howTo?: string[];
  notes?: string[];
};

/* ---------------- value helpers ---------------- */

export const digitsOnly = (s: string) => (s || '').replace(/\D/g, '');

export const formatCnic = (raw: string) => {
  const d = digitsOnly(raw).slice(0, 13);
  return [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean).join('-');
};

export const formatPhone = (raw: string) => {
  const d = digitsOnly(raw).slice(0, 11);
  return [d.slice(0, 4), d.slice(4, 11)].filter(Boolean).join('-');
};

/** ISO yyyy-mm-dd -> { d, m, y } strings, blank when not set */
export const splitDate = (iso: string) => {
  const parts = (iso || '').split('-');
  if (parts.length !== 3) return { d: '', m: '', y: '' };
  return { y: parts[0], m: parts[1], d: parts[2] };
};

/* ---------------- print primitives ---------------- */

/** A row of bordered character cells, filled left-to-right from `value`. */
export function Boxes({ value = '', count, w = 17, h = 20 }: { value?: string; count: number; w?: number; h?: number }) {
  const chars = (value || '').split('');
  return (
    <span className="ag-boxes">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="ag-box" style={{ width: w, height: h }}>
          {chars[i] || ''}
        </span>
      ))}
    </span>
  );
}

/** CNIC as 5 + 7 + 1 boxes with the two dashes between them. */
export function CnicBoxes({ value = '', w = 17 }: { value?: string; w?: number }) {
  const d = digitsOnly(value).slice(0, 13);
  return (
    <span className="ag-inline">
      <Boxes value={d.slice(0, 5)} count={5} w={w} />
      <span className="ag-dash">--</span>
      <Boxes value={d.slice(5, 12)} count={7} w={w} />
      <span className="ag-dash">--</span>
      <Boxes value={d.slice(12, 13)} count={1} w={w} />
    </span>
  );
}

/** A date shown as DD / MM / YYYY boxes. */
export function DateBoxes({ value = '', w = 17 }: { value?: string; w?: number }) {
  const { d, m, y } = splitDate(value);
  return (
    <span className="ag-inline">
      <Boxes value={d} count={2} w={w} />
      <span className="ag-dash">/</span>
      <Boxes value={m} count={2} w={w} />
      <span className="ag-dash">/</span>
      <Boxes value={y} count={4} w={w} />
    </span>
  );
}

/** Underlined blank that shows the value when one was entered. */
export function Rule({ value, width, grow }: { value?: string; width?: number; grow?: boolean }) {
  return (
    <span className="ag-rule" style={{ minWidth: width, flex: grow ? 1 : undefined }}>
      {(value || '').trim()}
    </span>
  );
}

/** Small square checkbox with a label; ticked when `checked`. */
export function Check({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <span className="ag-check">
      <span className="ag-cb">{checked ? '✕' : ''}</span>
      {label}
    </span>
  );
}

/** Bold label + value on one baseline, used for the "OFFICE OF THE ____" rows. */
export function LabelRule({ label, value, width, grow = true }: { label: string; value?: string; width?: number; grow?: boolean }) {
  return (
    <span className="ag-labelrule">
      <span className="ag-lab">{label}</span>
      <Rule value={value} width={width} grow={grow} />
    </span>
  );
}

/** The empty signature strip that runs along the bottom of most AG forms. */
export function SignRow({ items }: { items: string[] }) {
  return (
    <div className="ag-signrow">
      {items.map((label) => (
        <div key={label} className="ag-sign">
          <span className="ag-signline" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- component ---------------- */

export default function AgFormBuilder({ config }: { config: AgFormConfig }) {
  const landscape = config.orientation === 'landscape';

  const defaults = useMemo(() => {
    const base: Record<string, string> = {};
    config.fields.forEach((f) => {
      base[f.key] = f.defaultValue || '';
    });
    return base;
  }, [config.fields]);

  const sections = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, AgFieldDef[]>();
    config.fields.forEach((f) => {
      const name = f.section || 'Details';
      if (!map.has(name)) {
        map.set(name, []);
        order.push(name);
      }
      map.get(name)!.push(f);
    });
    return order.map((name) => ({ name, fields: map.get(name)! }));
  }, [config.fields]);

  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [emblem, setEmblem] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedEmblem = window.localStorage.getItem(EMBLEM_KEY);
      if (savedEmblem) setEmblem(savedEmblem);
      const shared = window.localStorage.getItem(DATA_KEY);
      const office = window.localStorage.getItem(OFFICE_KEY);
      const merged: Record<string, string> = {
        ...(shared ? (JSON.parse(shared) as Record<string, string>) : {}),
        ...(office ? (JSON.parse(office) as Record<string, string>) : {}),
      };
      setValues((prev) => {
        const next = { ...prev };
        Object.keys(prev).forEach((k) => {
          if (merged[k]) next[k] = merged[k];
        });
        return next;
      });
    } catch {
      /* storage blocked — the tool still works, it just will not remember */
    }
  }, []);

  const updateValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleEmblemChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError('Emblem image should be under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || '');
      setEmblem(data);
      try {
        window.localStorage.setItem(EMBLEM_KEY, data);
      } catch {
        /* ignore */
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setError('');
    try {
      const previous = window.localStorage.getItem(DATA_KEY);
      const prev = previous ? (JSON.parse(previous) as Record<string, string>) : {};
      window.localStorage.setItem(DATA_KEY, JSON.stringify({ ...prev, ...values }));
      const officeKeys = ['officeOfThe', 'ddoCode', 'ddoDescription', 'district'];
      const office: Record<string, string> = {};
      officeKeys.forEach((k) => {
        if (values[k]) office[k] = values[k];
      });
      window.localStorage.setItem(OFFICE_KEY, JSON.stringify(office));
    } catch {
      /* ignore */
    }
    setReady(true);
    setTimeout(() => document.getElementById('ag-print-area')?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15';

  return (
    <>
      <style>{`
        @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 10mm; }
        @media print {
          html, body { height: auto !important; background: #fff !important; }
          body * { visibility: hidden; }
          #ag-print-area, #ag-print-area * { visibility: visible; }
          #ag-print-area {
            position: absolute; top: 0; left: 0; width: 100%;
            padding: 0 !important; margin: 0 !important;
            border: none !important; box-shadow: none !important; border-radius: 0 !important;
            background: #fff !important;
          }
          .ag-no-print { display: none !important; }
          .ag-sheet { page-break-inside: auto; }
          .ag-block { page-break-inside: avoid; }
        }
        .ag-sheet { color: #000; font-size: 11.5px; line-height: 1.45; }
        .ag-sheet h2 { font-size: 16px; font-weight: 700; }
        .ag-boxes { display: inline-flex; vertical-align: middle; }
        .ag-box {
          border: 1px solid #000; margin-left: -1px; display: inline-flex;
          align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
          overflow: hidden;
        }
        .ag-inline { display: inline-flex; align-items: center; vertical-align: middle; }
        .ag-dash { padding: 0 3px; font-weight: 700; }
        .ag-rule {
          border-bottom: 1px solid #000; display: inline-block; min-height: 17px;
          padding: 0 4px; font-weight: 700; vertical-align: bottom;
        }
        .ag-labelrule { display: flex; align-items: flex-end; gap: 6px; width: 100%; }
        .ag-lab { font-weight: 700; white-space: nowrap; }
        .ag-check { display: inline-flex; align-items: center; gap: 4px; margin-right: 14px; white-space: nowrap; }
        .ag-cb {
          display: inline-flex; align-items: center; justify-content: center;
          width: 13px; height: 13px; border: 1px solid #000; font-size: 10px; font-weight: 700;
        }
        .ag-block { border: 1px solid #000; padding: 8px 10px; margin-bottom: 10px; }
        .ag-block-title { font-weight: 700; text-transform: uppercase; margin-bottom: 6px; font-size: 11px; }
        .ag-grid { display: grid; gap: 8px 18px; }
        .ag-signrow { display: flex; justify-content: space-between; gap: 20px; margin-top: 28px; }
        .ag-sign { flex: 1; text-align: center; font-size: 11px; }
        .ag-signline { display: block; border-top: 1px solid #000; margin-bottom: 4px; }
        .ag-table { width: 100%; border-collapse: collapse; }
        .ag-table th, .ag-table td { border: 1px solid #000; padding: 3px 4px; font-size: 10.5px; }
        .ag-table th { font-weight: 700; text-align: center; }
        .ag-table td.h { height: 22px; }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
        <div className={`mx-auto space-y-5 ${landscape ? 'max-w-6xl' : 'max-w-4xl'}`}>
          {/* Intro */}
          <div className="ag-no-print">
            <Link href="/govt-forms" className="text-sm font-semibold text-[#1a3a6b] hover:underline">
              ← Back to Govt Educational Forms
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{config.pageTitle}</h1>
              {config.formCode ? (
                <span className="rounded-full bg-[#1a3a6b] px-3 py-1 text-xs font-bold text-white">{config.formCode}</span>
              ) : null}
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                {landscape ? 'A4 Landscape' : 'A4 Portrait'}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{config.pageIntro}</p>
          </div>

          {/* Step 1 — fill */}
          <section className="ag-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Step 1 — Fill the details</p>
            <p className="mt-1 text-xs text-slate-500">
              Leave any field empty and it prints as an empty box or blank line you can fill by hand.
            </p>

            {sections.map((section) => (
              <div key={section.name} className="mt-5">
                <h3 className="border-b border-slate-200 pb-1 text-sm font-bold text-[#1a3a6b]">{section.name}</h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <label key={field.key} className={`block ${field.wide ? 'sm:col-span-2' : ''}`}>
                      <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                      {field.type === 'select' ? (
                        <select value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)} className={inputClass}>
                          <option value="">Select…</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea rows={3} value={values[field.key] || ''} onChange={(e) => updateValue(field.key, e.target.value)}
                          placeholder={field.placeholder} className={inputClass} />
                      ) : (
                        <input
                          type={field.type === 'date' ? 'date' : 'text'}
                          inputMode={field.type === 'cnic' || field.type === 'phone' || field.type === 'number' ? 'numeric' : undefined}
                          value={values[field.key] || ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (field.type === 'cnic') updateValue(field.key, formatCnic(raw));
                            else if (field.type === 'phone') updateValue(field.key, formatPhone(raw));
                            else updateValue(field.key, raw);
                          }}
                          maxLength={field.type === 'cnic' ? 15 : field.type === 'phone' ? 12 : undefined}
                          placeholder={field.placeholder}
                          className={inputClass}
                        />
                      )}
                      {field.hint ? <span className="mt-1 block text-xs text-slate-400">{field.hint}</span> : null}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <label className="block max-w-sm">
                <span className="text-sm font-semibold text-slate-700">
                  Government emblem image <span className="font-normal text-slate-400">(optional)</span>
                </span>
                <input type="file" accept="image/*" onChange={handleEmblemChange}
                  className="mt-1 w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1a3a6b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
                <span className="mt-1 block text-xs text-slate-400">
                  Upload the Pakistan state emblem once — it is reused on every AG Sindh form on this site.
                </span>
                {emblem ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEmblem('');
                      try { window.localStorage.removeItem(EMBLEM_KEY); } catch { /* ignore */ }
                    }}
                    className="mt-1 text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove emblem
                  </button>
                ) : null}
              </label>
            </div>

            {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleGenerate}
                className="rounded-xl bg-[#1a3a6b] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#14294c]">
                Generate Form
              </button>
              {ready ? (
                <button type="button" onClick={() => window.print()}
                  className="rounded-xl border-2 border-[#1a3a6b] px-5 py-2.5 text-sm font-bold text-[#1a3a6b] transition hover:bg-[#1a3a6b] hover:text-white">
                  🖨️ Print / Save as PDF ({landscape ? 'A4 Landscape' : 'A4'})
                </button>
              ) : null}
            </div>
          </section>

          {/* Step 2 — printable sheet */}
          {ready ? (
            <>
              <p className="ag-no-print text-xs font-bold uppercase tracking-widest text-teal-700">Step 2 — Preview &amp; print</p>
              {landscape ? (
                <p className="ag-no-print rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                  This form prints in landscape. If your print dialog does not switch automatically, set Layout to Landscape.
                </p>
              ) : null}

              <div className="overflow-x-auto">
                <div id="ag-print-area" className="ag-sheet min-w-[720px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  {config.sheet(values, emblem)}
                </div>
              </div>
            </>
          ) : null}

          {/* How to use */}
          <section className="ag-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">How to use</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              {(config.howTo && config.howTo.length > 0
                ? config.howTo
                : [
                    'Fill whatever you know. Employee name, CNIC, personal number and office are remembered across every form on this site.',
                    'Click Generate Form to see the filled sheet.',
                    `Click Print / Save as PDF, choose A4 ${landscape ? 'Landscape' : 'Portrait'} and turn Headers and footers OFF.`,
                    'Get it signed and stamped by the DDO / competent authority before submitting it.',
                  ]
              ).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {config.notes && config.notes.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-500">
                {config.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              This is an unofficial typing aid that reproduces the layout of the standard form so it can be filled neatly
              and printed. Your data stays in your own browser. Always check the current official form with your DDO or
              the concerned office before submission.
            </p>
          </section>

          {/* Upsell */}
          <section className="ag-no-print overflow-hidden rounded-2xl border border-[#1a3a6b]/20 bg-gradient-to-br from-[#1a3a6b] to-[#2356a4] p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">For schools &amp; DDO offices</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">Fill these forms for your whole staff in one click</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
              These forms are free forever. If your office wants staff records entered once and every government form
              generated automatically — with a submission register, Excel export and an admin login — The Master Sahib
              builds and hosts it for you.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Assalam-o-Alaikum! I am interested in an online government forms system for my office.',
                )}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-600">
                💬 WhatsApp +92 345 8340669
              </a>
              <a href="mailto:mohammadfaisalpirzada@gmail.com?subject=Govt%20Forms%20Enquiry"
                className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25">
                ✉️ Email us
              </a>
              <Link href="/contact"
                className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25">
                Contact page
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">
              The Master Sahib — themastersahib.com · Muhammad Faisal Peerzada · Karachi, Pakistan
            </p>
          </section>
        </div>
      </main>
    </>
  );
}


/**
 * The numbered label/value table used by most department proformas
 * (Time Scale, Teaching Allowance, Service Profile, Seniority, ...).
 * Pass [label, value] pairs; `numbered` adds the S.No column.
 */
export function LabelTable({
  rows,
  numbered = true,
  labelWidth = '46%',
  start = 1,
}: {
  rows: Array<[string, string | undefined]>;
  numbered?: boolean;
  labelWidth?: string;
  start?: number;
}) {
  return (
    <table className="ag-table">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={label + i}>
            {numbered ? (
              <td style={{ width: '6%', textAlign: 'center' }}>{start + i}</td>
            ) : null}
            <td style={{ width: labelWidth }}>{label}</td>
            <td className="h" style={{ fontWeight: 700 }}>{(value || '').trim()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** A bordered block of blank rows for a checklist / attachment list. */
export function CheckTable({
  head,
  rows,
  extraBlank = 0,
}: {
  head: string;
  rows: string[];
  extraBlank?: number;
}) {
  return (
    <table className="ag-table">
      <thead>
        <tr>
          <th style={{ width: '7%' }}>S. #</th>
          <th>{head}</th>
          <th style={{ width: '14%' }}>Attached</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={{ textAlign: 'center' }}>{i + 1}</td>
            <td>{r}</td>
            <td className="h" />
          </tr>
        ))}
        {Array.from({ length: extraBlank }).map((_, i) => (
          <tr key={`b-${i}`}>
            <td style={{ textAlign: 'center' }}>{rows.length + i + 1}</td>
            <td className="h" />
            <td className="h" />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Shared header used by the PAY / AG sheets. */
export function AgHeader({
  emblem,
  title,
  subtitle,
  formCode,
  right,
}: {
  emblem?: string;
  title: string;
  subtitle?: string;
  formCode?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {emblem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emblem} alt="Government Emblem" className="h-[60px] w-[60px] object-contain" />
        ) : null}
        <div>
          <h2 className="uppercase leading-tight" style={{ whiteSpace: 'pre-line' }}>{title}</h2>
          {subtitle ? <p className="text-[11.5px] font-semibold">{subtitle}</p> : null}
        </div>
      </div>
      <div className="text-right text-[11.5px]">
        {formCode ? <p className="font-bold">{formCode}</p> : null}
        {right}
      </div>
    </div>
  );
}
