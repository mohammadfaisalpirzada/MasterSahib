'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react';

/**
 * Shared builder for Govt Educational Forms certificates
 * (No Dues, No Inquiry, Bonafide, Service Certificate, ...).
 *
 * The teacher / office fills the fields once — letterhead and employee details are
 * remembered in the browser and shared across every certificate — then prints an
 * A4 page or saves it as PDF. Nothing is uploaded to any server.
 */

const LETTERHEAD_KEY = 'ms-govt-forms-letterhead-v1';
const DATA_KEY = 'ms-govt-forms-data-v1';
const WHATSAPP_NUMBER = '923458340669';

export type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'select' | 'textarea' | 'cnic' | 'phone' | 'number';
  options?: string[];
  placeholder?: string;
  hint?: string;
  wide?: boolean;
  defaultValue?: string;
};

export type CertificateConfig = {
  slug: string;
  pageTitle: string;
  pageIntro: string;
  certificateHeading: string;
  certificateSubHeading?: string;
  fields: FieldDef[];
  body: (v: Record<string, string>) => ReactNode;
  /** Optional replacement for the default stamp + issuing-officer signature block. */
  signature?: (v: Record<string, string>) => ReactNode;
  footerNotes?: string[];
  howTo?: string[];
};

export type Letterhead = {
  officeName: string;
  officeSubtitle: string;
  officeAddress: string;
  semisCode: string;
  district: string;
  refNo: string;
  issueDate: string;
  issuerName: string;
  issuerDesignation: string;
  logoDataUrl: string;
  showSindhLogo: boolean;
};

const EMPTY_LETTERHEAD: Letterhead = {
  officeName: '',
  officeSubtitle: 'School Education & Literacy Department, Government of Sindh',
  officeAddress: '',
  semisCode: '',
  district: '',
  refNo: '',
  issueDate: '',
  issuerName: '',
  issuerDesignation: 'Headmaster / Principal',
  logoDataUrl: '',
  showSindhLogo: true,
};

/* ---------------- formatting helpers ---------------- */

export const formatCnic = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 13);
  return [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean).join('-');
};

export const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  return [d.slice(0, 4), d.slice(4, 11)].filter(Boolean).join('-');
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 2026-08-31 -> 31 August 2026 (returns '' for empty / invalid input) */
export const longDate = (iso: string) => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts.map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/**
 * Prints a value inside the certificate paragraph. When the field is empty it
 * renders a blank ruled space so the form can also be printed and hand-filled.
 */
export function Fill({ value, width = 150 }: { value?: string; width?: number }) {
  const text = (value || '').trim();
  if (text) return <strong className="af-fill">{text}</strong>;
  return <span className="af-fill-blank" style={{ minWidth: width }} />;
}

/* ---------------- component ---------------- */

export default function CertificateBuilder({ config }: { config: CertificateConfig }) {
  const defaults = useMemo(() => {
    const base: Record<string, string> = {};
    config.fields.forEach((f) => {
      base[f.key] = f.defaultValue || '';
    });
    return base;
  }, [config.fields]);

  const [head, setHead] = useState<Letterhead>(EMPTY_LETTERHEAD);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const rawHead = window.localStorage.getItem(LETTERHEAD_KEY);
      if (rawHead) setHead({ ...EMPTY_LETTERHEAD, ...(JSON.parse(rawHead) as Partial<Letterhead>) });
      const rawData = window.localStorage.getItem(DATA_KEY);
      if (rawData) {
        const saved = JSON.parse(rawData) as Record<string, string>;
        setValues((prev) => {
          const merged = { ...prev };
          Object.keys(prev).forEach((k) => {
            if (saved[k]) merged[k] = saved[k];
          });
          return merged;
        });
      }
    } catch {
      /* storage blocked — the tool still works, it just will not remember */
    }
  }, []);

  const updateHead = <K extends keyof Letterhead>(key: K, value: Letterhead[K]) =>
    setHead((prev) => ({ ...prev, [key]: value }));

  const updateValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError('Logo should be under 1.5 MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateHead('logoDataUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!head.officeName.trim()) {
      setError('Please enter your School / Office name.');
      return;
    }
    setError('');
    try {
      window.localStorage.setItem(LETTERHEAD_KEY, JSON.stringify(head));
      const rawData = window.localStorage.getItem(DATA_KEY);
      const previous = rawData ? (JSON.parse(rawData) as Record<string, string>) : {};
      window.localStorage.setItem(DATA_KEY, JSON.stringify({ ...previous, ...values }));
    } catch {
      /* ignore */
    }
    setReady(true);
    setTimeout(() => document.getElementById('af-print-area')?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15';

  return (
    <>
      <style>{`
        @page { size: A4; margin: 14mm 16mm; }
        @media print {
          html, body { height: auto !important; background: #fff !important; }
          body * { visibility: hidden; }
          #af-print-area, #af-print-area * { visibility: visible; }
          #af-print-area {
            position: absolute; top: 0; left: 0; width: 100%;
            padding: 0 !important; margin: 0 !important;
            border: none !important; box-shadow: none !important; border-radius: 0 !important;
            background: #fff !important;
          }
          .af-no-print { display: none !important; }
        }
        .af-fill {
          border-bottom: 1px solid #000; padding: 0 4px; font-weight: 700; white-space: nowrap;
        }
        .af-fill-blank {
          display: inline-block; border-bottom: 1px solid #000; height: 1em; vertical-align: -2px;
        }
        .af-cert-body p { margin-bottom: 12px; }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-5">
          {/* Intro */}
          <div className="af-no-print">
            <Link href="/govt-forms" className="text-sm font-semibold text-[#1a3a6b] hover:underline">
              ← Back to Govt Educational Forms
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{config.pageTitle}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{config.pageIntro}</p>
          </div>

          {/* Step 1 — letterhead */}
          <section className="af-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Step 1 — School / Office letterhead</p>
            <p className="mt-1 text-xs text-slate-500">Fill this once — it is remembered for every form in this section.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">School / Office Name <span className="text-rose-600">*</span></span>
                <input type="text" value={head.officeName} onChange={(e) => updateHead('officeName', e.target.value)}
                  placeholder="Govt. Girls / Boys Secondary School, Nishtar Road Campus" className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Department Line</span>
                <input type="text" value={head.officeSubtitle} onChange={(e) => updateHead('officeSubtitle', e.target.value)}
                  className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">SEMIS Code</span>
                <input type="text" value={head.semisCode} onChange={(e) => updateHead('semisCode', e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                  placeholder="408070227" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">District</span>
                <input type="text" value={head.district} onChange={(e) => updateHead('district', e.target.value)}
                  placeholder="Karachi South" className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Address</span>
                <input type="text" value={head.officeAddress} onChange={(e) => updateHead('officeAddress', e.target.value)}
                  placeholder="Nishtar Road, Karachi - Sindh, Pakistan" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Reference / Letter No.</span>
                <input type="text" value={head.refNo} onChange={(e) => updateHead('refNo', e.target.value)}
                  placeholder="No. GGSS/NR/2026/____" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Date of Issue</span>
                <input type="date" value={head.issueDate} onChange={(e) => updateHead('issueDate', e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Issuing Officer Name</span>
                <input type="text" value={head.issuerName} onChange={(e) => updateHead('issuerName', e.target.value)}
                  placeholder="Name of Headmaster / Principal" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Issuing Officer Designation</span>
                <input type="text" value={head.issuerDesignation} onChange={(e) => updateHead('issuerDesignation', e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">School Logo <span className="font-normal text-slate-400">(optional)</span></span>
                <input type="file" accept="image/*" onChange={handleLogoChange}
                  className="mt-1 w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1a3a6b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
                {head.logoDataUrl ? (
                  <button type="button" onClick={() => updateHead('logoDataUrl', '')} className="mt-1 text-xs font-semibold text-rose-600 hover:underline">
                    Remove logo
                  </button>
                ) : null}
              </label>
              <label className="flex items-center gap-2 self-end pb-2">
                <input type="checkbox" checked={head.showSindhLogo} onChange={(e) => updateHead('showSindhLogo', e.target.checked)}
                  className="h-4 w-4 accent-[#1a3a6b]" />
                <span className="text-sm font-semibold text-slate-700">Show Government of Sindh logo</span>
              </label>
            </div>
          </section>

          {/* Step 2 — employee details */}
          <section className="af-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Step 2 — Employee details</p>
            <p className="mt-1 text-xs text-slate-500">Leave any field empty and it prints as a blank line you can fill by hand.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {config.fields.map((field) => (
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

            {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleGenerate}
                className="rounded-xl bg-[#1a3a6b] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#14294c]">
                Generate Certificate
              </button>
              {ready ? (
                <button type="button" onClick={() => window.print()}
                  className="rounded-xl border-2 border-[#1a3a6b] px-5 py-2.5 text-sm font-bold text-[#1a3a6b] transition hover:bg-[#1a3a6b] hover:text-white">
                  🖨️ Print / Save as PDF
                </button>
              ) : null}
            </div>
          </section>

          {/* Step 3 — printable certificate */}
          {ready ? (
            <>
              <p className="af-no-print text-xs font-bold uppercase tracking-widest text-teal-700">Step 3 — Preview &amp; print</p>

              <div id="af-print-area" className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                {/* Letterhead */}
                <div className="border-b-2 border-black pb-3">
                  <div className="flex items-center justify-between gap-3">
                    {head.showSindhLogo ? (
                      <div className="flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center">
                        <NextImage src="/images/sindh-govt-logo-black.png" alt="Government of Sindh Logo"
                          width={74} height={74} className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-[74px] w-[74px] flex-shrink-0" />
                    )}

                    <div className="flex-1 text-center">
                      <h2 className="text-[17px] font-bold uppercase leading-tight tracking-wide">{head.officeName}</h2>
                      {head.officeSubtitle ? <p className="text-[12px] font-semibold">{head.officeSubtitle}</p> : null}
                      {head.officeAddress ? <p className="text-[12px]">{head.officeAddress}</p> : null}
                      <p className="text-[12px] font-bold">
                        {head.semisCode ? <>SEMIS Code : {head.semisCode}</> : null}
                        {head.semisCode && head.district ? <span className="px-2">|</span> : null}
                        {head.district ? <>District : {head.district}</> : null}
                      </p>
                    </div>

                    <div className="flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center">
                      {head.logoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={head.logoDataUrl} alt="School Logo" className="h-full w-full object-contain" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Ref & date */}
                <div className="mt-3 flex items-end justify-between text-[12.5px] font-semibold">
                  <p>Ref. No. {head.refNo || '_______________'}</p>
                  <p>Dated: {longDate(head.issueDate) || '_______________'}</p>
                </div>

                {/* Heading */}
                <div className="mt-7 text-center">
                  <h3 className="inline-block border-b-2 border-black px-6 pb-1 text-[19px] font-bold uppercase tracking-wide">
                    {config.certificateHeading}
                  </h3>
                  {config.certificateSubHeading ? (
                    <p className="mt-2 text-[12.5px] font-semibold text-slate-700">{config.certificateSubHeading}</p>
                  ) : null}
                </div>

                {/* Body */}
                <div className="af-cert-body mt-7 text-justify text-[14px] leading-[2.1] text-black">
                  {config.body(values)}
                </div>

                {/* Signature */}
                {config.signature ? (
                  <div className="mt-14">{config.signature(values)}</div>
                ) : (
                <div className="mt-14 flex items-end justify-between">
                  <div className="text-[11.5px] text-slate-700">
                    <div className="mb-1 h-[52px] w-[130px] border border-dashed border-slate-400" />
                    <p className="text-center">Office Stamp</p>
                  </div>
                  <div className="w-[260px] text-center">
                    <div className="mb-1 h-[42px] border-b border-black" />
                    <p className="text-[13px] font-bold">{head.issuerName || '________________________'}</p>
                    <p className="text-[12px] font-semibold">{head.issuerDesignation}</p>
                    <p className="text-[11px]">{head.officeName}</p>
                  </div>
                </div>
                )}

                {config.footerNotes && config.footerNotes.length > 0 ? (
                  <div className="mt-10 border-t border-slate-400 pt-2 text-[10.5px] leading-relaxed text-slate-700">
                    {config.footerNotes.map((note, i) => (
                      <p key={i}>{note}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {/* How to use */}
          <section className="af-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">How to use</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              {(config.howTo && config.howTo.length > 0
                ? config.howTo
                : [
                    'Fill your school / office letterhead once — it is remembered for every form in this section.',
                    'Enter the employee details. Any field you leave empty prints as a blank line for hand-filling.',
                    'Click Generate Certificate, then Print / Save as PDF.',
                    'In the print dialog choose A4 paper and turn Headers and footers OFF for a clean official page.',
                    'Get it signed and stamped by the competent authority before submission.',
                  ]
              ).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Your details are saved only in this browser. Nothing is sent to any server. This is a drafting aid — the
              wording should always be checked against your department&apos;s current requirement before submission.
            </p>
          </section>

          {/* Upsell */}
          <section className="af-no-print overflow-hidden rounded-2xl border border-[#1a3a6b]/20 bg-gradient-to-br from-[#1a3a6b] to-[#2356a4] p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">For schools &amp; offices</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">Want this as an online system?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
              These forms are free forever. If your school or office wants a proper online setup — staff records saved
              once, every certificate generated in one click, serial-numbered register, Excel export and an admin login —
              The Master Sahib builds and hosts it for you.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Assalam-o-Alaikum! I am interested in an online certificate system for my school / office.',
                )}`}
                target="_blank" rel="noopener noreferrer"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-600">
                💬 WhatsApp +92 345 8340669
              </a>
              <a href="mailto:mohammadfaisalpirzada@gmail.com?subject=Govt%20Educational%20Forms%20Enquiry"
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
