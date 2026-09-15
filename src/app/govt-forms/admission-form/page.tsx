'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';

/**
 * Free tool: Universal School Admission Form (print / PDF).
 * The visitor only customises TWO things — School Name and SEMIS Code —
 * and gets the same A4 admission form used at GG/BSS Nishtar Road Campus,
 * ready to print in bulk. Nothing is uploaded; everything stays in the browser.
 */

const STORAGE_KEY = 'ms-admission-form-school-v1';
const WHATSAPP_NUMBER = '923458340669';

type SchoolInfo = {
  schoolName: string;
  campusLine: string;
  addressLine: string;
  semisCode: string;
  logoDataUrl: string;
  showSindhLogo: boolean;
};

const EMPTY_INFO: SchoolInfo = {
  schoolName: '',
  campusLine: '',
  addressLine: '',
  semisCode: '',
  logoDataUrl: '',
  showSindhLogo: true,
};

/* ---------- small print-form building blocks ---------- */

function Line({ label, flex = 1, note }: { label: string; flex?: number; note?: string }) {
  return (
    <div className="af-field" style={{ flex, minWidth: 0 }}>
      <span className="af-label">
        {label}
        {note ? <span className="af-note"> {note}</span> : null}
      </span>
      <span className="af-rule" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="af-section">{children}</div>;
}

export default function AdmissionFormResourcePage() {
  const [info, setInfo] = useState<SchoolInfo>(EMPTY_INFO);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SchoolInfo>;
        setInfo({ ...EMPTY_INFO, ...saved });
        if (saved.schoolName && saved.semisCode) setReady(true);
      }
    } catch {
      /* storage blocked — tool still works, just no memory */
    }
  }, []);

  const update = <K extends keyof SchoolInfo>(key: K, value: SchoolInfo[K]) =>
    setInfo((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError('Logo should be under 1.5 MB. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('logoDataUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!info.schoolName.trim()) {
      setError('Please enter the school name.');
      return;
    }
    if (!info.semisCode.trim()) {
      setError('Please enter the SEMIS code.');
      return;
    }
    setError('');
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      /* ignore */
    }
    setReady(true);
    setTimeout(() => document.getElementById('af-print-area')?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  return (
    <>
      <style>{`
        @page { size: A4; margin: 7mm; }
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
          /* Everything below is tuned so the complete form lands on ONE A4 page. */
          .af-row { margin-bottom: 5px !important; gap: 10px !important; }
          .af-label { font-size: 9.5px !important; margin-bottom: 0 !important; }
          .af-rule { height: 13px !important; }
          .af-section { margin: 7px 0 4px !important; font-size: 12px !important; }
          .af-photo { height: 96px !important; width: 78px !important; font-size: 8.5px !important; }
          .af-sign { margin-top: 6px !important; }
          .af-sign-line { height: 20px !important; }
          .af-docs { margin-top: 6px !important; padding-top: 4px !important; font-size: 9px !important; line-height: 1.35 !important; }
        }
        .af-row { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 12px; align-items: flex-end; }
        .af-field { display: flex; flex-direction: column; }
        .af-label { font-size: 11.5px; font-weight: 700; color: #111; margin-bottom: 1px; white-space: nowrap; }
        .af-note { font-weight: 400; color: #475569; }
        .af-rule { display: block; height: 18px; border-bottom: 1px solid #000; width: 100%; }
        .af-section {
          margin: 16px 0 10px; text-align: center; font-size: 14px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.04em; color: #1a3a6b; text-decoration: underline;
        }
        .af-box { display: inline-block; width: 12px; height: 12px; border: 1px solid #000; vertical-align: -1px; margin-right: 4px; }
        @media (max-width: 640px) {
          .af-label { white-space: normal; }
          .af-field { min-width: 45%; }
        }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-5">
          {/* ---------- Intro ---------- */}
          <div className="af-no-print">
            <Link href="/govt-forms" className="text-sm font-semibold text-[#1a3a6b] hover:underline">
              ← Back to Govt Educational Forms
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">School Admission Form Generator</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              This is the same A4 admission form used at GG/BSS Nishtar Road Campus, Karachi — now free for every school.
              Enter your <strong>School Name</strong> and <strong>SEMIS Code</strong>, click Generate, then print or save as PDF
              and photocopy as many blank forms as you need. Nothing is uploaded — your details stay in your own browser.
            </p>
          </div>

          {/* ---------- Step 1: customise ---------- */}
          <section className="af-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Step 1 — Customise your form</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">School Name <span className="text-rose-600">*</span></span>
                <input
                  type="text"
                  value={info.schoolName}
                  onChange={(e) => update('schoolName', e.target.value)}
                  placeholder="Govt. Girls / Boys Secondary School (GG/BSS)"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">SEMIS Code <span className="text-rose-600">*</span></span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={info.semisCode}
                  onChange={(e) => update('semisCode', e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                  placeholder="408070227"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Campus / Branch Line <span className="font-normal text-slate-400">(optional)</span></span>
                <input
                  type="text"
                  value={info.campusLine}
                  onChange={(e) => update('campusLine', e.target.value)}
                  placeholder="Nishtar Road Campus"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Address <span className="font-normal text-slate-400">(optional)</span></span>
                <input
                  type="text"
                  value={info.addressLine}
                  onChange={(e) => update('addressLine', e.target.value)}
                  placeholder="Nishtar Road, Karachi - Sindh, Pakistan"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1a3a6b] focus:ring-2 focus:ring-[#1a3a6b]/15"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">School Logo <span className="font-normal text-slate-400">(optional)</span></span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-1 w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1a3a6b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                {info.logoDataUrl ? (
                  <button type="button" onClick={() => update('logoDataUrl', '')} className="mt-1 text-xs font-semibold text-rose-600 hover:underline">
                    Remove logo
                  </button>
                ) : null}
              </label>

              <label className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  checked={info.showSindhLogo}
                  onChange={(e) => update('showSindhLogo', e.target.checked)}
                  className="h-4 w-4 accent-[#1a3a6b]"
                />
                <span className="text-sm font-semibold text-slate-700">Show Government of Sindh logo</span>
              </label>
            </div>

            {error ? <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-xl bg-[#1a3a6b] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#14294c]"
              >
                Generate Form
              </button>
              {ready ? (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl border-2 border-[#1a3a6b] px-5 py-2.5 text-sm font-bold text-[#1a3a6b] transition hover:bg-[#1a3a6b] hover:text-white"
                >
                  🖨️ Print / Save as PDF
                </button>
              ) : null}
            </div>
          </section>

          {/* ---------- Step 2: the printable form ---------- */}
          {ready ? (
            <>
              <p className="af-no-print text-xs font-bold uppercase tracking-widest text-teal-700">Step 2 — Preview &amp; print</p>

              <div id="af-print-area" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="border-b-2 border-black pb-3">
                  <div className="mb-2 flex items-start justify-between">
                    <p className="flex items-end gap-2 text-xs font-bold">
                      <span>Sr No.</span>
                      <span className="inline-block h-[15px] w-[80px] border-b border-black" />
                    </p>
                    <div className="inline-block border-2 border-black px-4 py-1 text-sm font-bold">Admission Form</div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {info.showSindhLogo ? (
                      <div className="flex h-[78px] w-[78px] flex-shrink-0 items-center justify-center">
                        <NextImage
                          src="/images/sindh-govt-logo-black.png"
                          alt="Government of Sindh Logo"
                          width={78}
                          height={78}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-[78px] w-[78px] flex-shrink-0" />
                    )}

                    <div className="flex-1 text-center">
                      <h2 className="text-[17px] font-bold uppercase leading-tight tracking-wide">{info.schoolName}</h2>
                      {info.campusLine ? (
                        <p className="text-[15px] font-bold uppercase tracking-wide">{info.campusLine}</p>
                      ) : null}
                      {info.addressLine ? <p className="text-[13px]">{info.addressLine}</p> : null}
                      <p className="text-[13px] font-bold">SEMIS Code : {info.semisCode}</p>
                    </div>

                    <div className="flex h-[78px] w-[78px] flex-shrink-0 items-center justify-center">
                      {info.logoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={info.logoDataUrl} alt="School Logo" className="h-full w-full object-contain" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <SectionTitle>Student Personal Data</SectionTitle>

                {/* The photograph box sits beside the first three rows so the form stays on one page */}
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="af-row">
                      <Line label="Roll No." note="(Allotted by office)" />
                      <Line label="GR No." note="(Allotted by office)" />
                    </div>
                    <div className="af-row">
                      <Line label="Name of Student" flex={100} />
                    </div>
                    <div className="af-row">
                      <Line label="Date of Birth" />
                      <Line label="Date of Birth (in words)" flex={2} />
                    </div>
                  </div>
                  <div className="af-photo flex h-[110px] w-[90px] flex-shrink-0 items-center justify-center border border-black text-center text-[10px] leading-tight text-slate-600">
                    <span className="px-1">Paste Recent Photograph</span>
                  </div>
                </div>
                <div className="af-row">
                  <Line label="Nationality" />
                  <Line label="Surname" />
                  <Line label="Religion" />
                </div>
                <div className="af-row">
                  <Line label="Previous Class" />
                  <Line label="School Name where last studied" flex={3} />
                </div>
                <div className="af-row">
                  <Line label="Reason for leaving Previous School" flex={2} />
                  <Line label="Date of leaving previous School" />
                </div>
                <div className="af-row">
                  <Line label="In which class admission sought out" flex={2} />
                  <Line label="Date of Admission" />
                </div>
                <div className="af-row">
                  <div className="af-field" style={{ flex: 100 }}>
                    <span className="af-label">
                      Nadra (B Form, CRC):
                      <span className="af-note">
                        &nbsp;&nbsp;<span className="af-box" />Available &nbsp;&nbsp;&nbsp;<span className="af-box" />Not Available
                        &nbsp;&nbsp;&nbsp; If Yes, No.
                      </span>
                    </span>
                    <span className="af-rule" />
                  </div>
                </div>
                <div className="af-row">
                  <Line label="Address" flex={100} />
                </div>

                <SectionTitle>Parents / Guardian&apos;s Personal Data</SectionTitle>

                <div className="af-row">
                  <Line label="Father’s Name" flex={2} />
                  <Line label="CNIC No." />
                </div>
                <div className="af-row">
                  <Line label="Father’s Cell No." />
                  <Line label="Guardian’s Cell No." />
                </div>
                <div className="af-row">
                  <Line label="Qualification" />
                  <Line label="Occupation" />
                </div>
                <div className="af-row">
                  <Line label="Company Name & Address where doing job" flex={100} />
                </div>
                <div className="af-row">
                  <Line label="Mother’s Name" flex={2} />
                  <Line label="CNIC No." />
                </div>
                <div className="af-row">
                  <Line label="Mother’s Cell No." />
                  <Line label="WhatsApp No." />
                </div>

                <div className="af-sign mt-4 flex justify-end">
                  <div className="w-[240px] text-center">
                    <div className="af-sign-line mb-1 h-[26px] border-b border-black" />
                    <p className="text-xs font-bold">Parents / Guardian&apos;s Sign.</p>
                  </div>
                </div>

                <SectionTitle>For Office Use Only</SectionTitle>

                <div className="af-row">
                  <Line label="Class in which admitted" />
                  <Line label="Date of Admission" />
                </div>
                <div className="af-row">
                  <Line label="Campus Head Signature" />
                  <Line label="Academic Incharge Signature" />
                </div>
                <div className="af-row">
                  <Line label="Prepared by" />
                  <Line label="Signature" />
                  <Line label="Date" />
                </div>

                <div className="af-docs mt-3 border-t border-slate-400 pt-2 text-[10.5px] leading-snug text-slate-800">
                  <p className="mb-1 font-bold">Documents to be attached along with:</p>
                  <p>
                    1. Previous School Leaving Certificate (TC) &nbsp;&nbsp; 2. Father &amp; Mother CNIC Copies &nbsp;&nbsp; 3. Birth / Child Registration Certificate
                    <br />
                    4. Form &quot;B&quot; Issued by NADRA Office &nbsp;&nbsp; 5. Recent Photographs (05 Nos.)
                  </p>
                </div>
              </div>
            </>
          ) : null}

          {/* ---------- How to use ---------- */}
          <section className="af-no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">How to use this form</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              <li>Type your school name and SEMIS code above (campus line, address and logo are optional).</li>
              <li>Click <strong>Generate Form</strong> — the A4 form appears below with your school heading.</li>
              <li>Click <strong>Print / Save as PDF</strong>. In the print dialog choose <em>Save as PDF</em> for a soft copy, or your printer for hard copies.</li>
              <li>In the print dialog, set paper size to <strong>A4</strong> and turn <strong>Headers and footers OFF</strong> for a clean page.</li>
              <li>Take the PDF to any photocopier and print as many blank admission forms as your school needs.</li>
            </ol>
            <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Your school details are saved only in this browser so the form is ready next time. No data is sent to any server.
            </p>
          </section>

          {/* ---------- Upsell / contact ---------- */}
          <section className="af-no-print overflow-hidden rounded-2xl border border-[#1a3a6b]/20 bg-gradient-to-br from-[#1a3a6b] to-[#2356a4] p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Want more than a paper form?</p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">Get an Online Admission Form for your school</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
              The printable form above is free forever. If your school wants parents to fill the admission form online — with
              student photo upload, automatic CNIC &amp; B-Form formatting, date-of-birth in words, an admin dashboard, record
              search, Excel export and one-click printing — The Master Sahib builds and hosts it for you.
            </p>

            <ul className="mt-4 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
              <li>✔ Custom school branding, logo &amp; SEMIS code</li>
              <li>✔ Secure admin login for your office staff</li>
              <li>✔ Student records saved &amp; searchable</li>
              <li>✔ Export to Excel / PDF, bulk printing</li>
              <li>✔ Works on mobile — parents can fill from home</li>
              <li>✔ Training &amp; support included</li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Assalam-o-Alaikum! I want an online admission form for my school. Please share details and pricing.',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-600"
              >
                💬 WhatsApp +92 345 8340669
              </a>
              <a
                href="mailto:mohammadfaisalpirzada@gmail.com?subject=Online%20Admission%20Form%20Enquiry"
                className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25"
              >
                ✉️ Email us
              </a>
              <Link
                href="/contact"
                className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25"
              >
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
