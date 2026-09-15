'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const FINGERS = ['انگوٹھا', 'شہادت کی انگلی', 'درمیانی انگلی', 'انگوٹھی والی انگلی', 'چھوٹی انگلی'];

const config: AgFormConfig = {
  slug: 'pensioner-fingerprints',
  pageTitle: 'Pensioner Fingerprints Form (پینشنرز انگلیوں اور انگوٹھوں کے نشانات)',
  pageIntro:
    'The Urdu fingerprint and attestation form submitted with a pension case — both hands, plus the witness attestation (تصدیق نامہ). Fill the names in Urdu or English, print the A4 sheet, then take the fingerprints on paper.',
  fields: [
    { key: 'pensionerName', label: 'نام پینشنر — Name of Pensioner', section: 'پینشنر کی معلومات' },
    { key: 'fatherName', label: 'ولد / بنت / زوجیت — Father / Husband', section: 'پینشنر کی معلومات' },
    { key: 'designation', label: 'عہدہ — Designation', section: 'پینشنر کی معلومات' },
    { key: 'personalNo', label: 'پینشنر پرسنل نمبر (کمپیوٹر سلپ) — Personal No.', wide: true, section: 'پینشنر کی معلومات' },
    { key: 'institutionName', label: 'ادارے کا نام — Institution where retired', wide: true, section: 'پینشنر کی معلومات' },
    { key: 'pensionerMobile', label: 'موبائل نمبر — Mobile Number', type: 'phone', section: 'پینشنر کی معلومات' },
    { key: 'cnic', label: 'شناختی کارڈ نمبر — CNIC', type: 'cnic', section: 'پینشنر کی معلومات' },
    { key: 'witnessName', label: 'نام گواہ — Witness Name', section: 'گواہ / تصدیق نامہ' },
    { key: 'witnessFather', label: 'ولدیت — Witness Father / Husband', section: 'گواہ / تصدیق نامہ' },
    { key: 'witnessDesignation', label: 'گواہ کا عہدہ — Witness Designation', section: 'گواہ / تصدیق نامہ' },
    { key: 'witnessCnic', label: 'گواہ شناختی کارڈ نمبر — Witness CNIC', type: 'cnic', section: 'گواہ / تصدیق نامہ' },
    { key: 'witnessMobile', label: 'گواہ موبائل نمبر — Witness Mobile', type: 'phone', section: 'گواہ / تصدیق نامہ' },
    { key: 'retirementDate', label: 'تاریخ ریٹائرمنٹ — Date of Retirement', type: 'date', section: 'گواہ / تصدیق نامہ' },
  ],
  sheet: (v) => (
    <div dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Alvi Nastaleeq', 'Nafees Nastaleeq', serif", lineHeight: 2.2 }}>
      <div style={{ border: '1px solid #000', padding: '10px 0', textAlign: 'center', marginBottom: 22 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>پینشنرز انگلیوں اور انگوٹھوں کے نشانات</span>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-x-6 gap-y-3">
        <span className="flex items-end gap-2">نام پینشنر <Rule value={v.pensionerName} width={160} /></span>
        <span className="flex items-end gap-2">ولد / بنت / زوجیت <Rule value={v.fatherName} width={160} /></span>
        <span className="flex items-end gap-2">عہدہ <Rule value={v.designation} width={140} /></span>
      </div>
      <div className="mb-5 flex items-end gap-2">
        پینشنر پرسنل نمبر (جاری برائے کمپیوٹر سلپ) <Rule value={v.personalNo} width={200} />
      </div>

      <p className="mb-2 font-bold">دایاں ہاتھ (Right Hand)</p>
      <table className="ag-table" style={{ marginBottom: 20 }}>
        <thead>
          <tr>{FINGERS.map((f) => <th key={f} style={{ width: '20%' }}>{f}</th>)}</tr>
        </thead>
        <tbody>
          <tr>{FINGERS.map((f) => <td key={f} style={{ height: 110 }} />)}</tr>
        </tbody>
      </table>

      <p className="mb-2 font-bold">بایاں ہاتھ (Left Hand)</p>
      <table className="ag-table" style={{ marginBottom: 20 }}>
        <thead>
          <tr>{FINGERS.map((f) => <th key={f} style={{ width: '20%' }}>{f}</th>)}</tr>
        </thead>
        <tbody>
          <tr>{FINGERS.map((f) => <td key={f} style={{ height: 110 }} />)}</tr>
        </tbody>
      </table>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <span className="flex items-end gap-2">
          ادارے کا نام (جہاں پینشنر ریٹائرڈ ہوا / ہوئی) <Rule value={v.institutionName} width={200} />
        </span>
        <span className="flex items-end gap-2">دستخط <Rule value="" width={140} /></span>
      </div>
      <div className="mb-6 flex flex-wrap items-end gap-x-8 gap-y-3">
        <span className="flex items-end gap-2">پینشنر کا موبائل نمبر <Rule value={v.pensionerMobile} width={150} /></span>
        <span className="flex items-end gap-2">شناختی کارڈ نمبر <Rule value={v.cnic} width={170} /></span>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold">گواہ</span>
        <span className="font-bold">﴿ تصدیق نامہ ﴾</span>
        <span />
      </div>

      <p className="mb-2 flex flex-wrap items-end gap-2">
        میں مسمی / مسمات <Rule value={v.witnessName} width={170} />
        ولد / بنت / زوجیت <Rule value={v.witnessFather} width={170} />
      </p>
      <p className="mb-2 flex flex-wrap items-end gap-2">
        متعلقہ ادارے میں بطور <Rule value={v.witnessDesignation} width={160} />
        ملازم ہوں اور گواہی دیتا / دیتی ہوں کہ میں مسمی / مسمات <Rule value={v.pensionerName} width={150} />
      </p>
      <p className="mb-2 flex flex-wrap items-end gap-2">
        ولد / بنت / زوجیت <Rule value={v.fatherName} width={160} />
        کو ذاتی طور پر جانتا / جانتی ہوں جو کہ متعلقہ ادارے میں بطور <Rule value={v.designation} width={140} />
      </p>
      <p className="mb-5 flex flex-wrap items-end gap-2">
        ملازم تھے / تھی جو کہ مورخہ <Rule value={v.retirementDate} width={130} />
        کو ریٹائرڈ ہوئے / ہوئیں۔ انہوں نے میری موجودگی میں اور میرے سامنے / روبرو مندرجہ بالا انگلیوں کے نشانات اور دستخط کیے ہیں۔
      </p>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <span className="flex items-end gap-2">نام گواہ <Rule value={v.witnessName} width={150} /></span>
        <span className="flex items-end gap-2">ولدیت <Rule value={v.witnessFather} width={150} /></span>
        <span className="flex items-end gap-2">دستخط <Rule value="" width={120} /></span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <span className="flex items-end gap-2">شناختی کارڈ نمبر <Rule value={v.witnessCnic} width={150} /></span>
        <span className="flex items-end gap-2">موبائل نمبر <Rule value={v.witnessMobile} width={140} /></span>
        <span className="flex items-end gap-2">
          انگوٹھے کا نشان گواہ:
          <span style={{ display: 'inline-block', width: 60, height: 60, border: '1px solid #000' }} />
        </span>
      </div>
    </div>
  ),
  howTo: [
    'Fill the pensioner and witness details (Urdu typing works, or type in English).',
    'Click Generate Form, then Print / Save as PDF on A4 with Headers and footers OFF.',
    'Take the fingerprints of both hands on the printed page with a proper ink pad.',
    'Get the witness to sign and thumb-mark the attestation (تصدیق نامہ), then attach it to the pension case.',
  ],
  notes: [
    'Nastaliq rendering depends on the Urdu fonts installed on your computer. If the script looks plain, install Jameel Noori Nastaleeq or Noto Nastaliq Urdu.',
    'Fingerprints must be taken on the printed paper — they cannot be added digitally.',
  ],
};

export default function PensionerFingerprintsPage() {
  return <AgFormBuilder config={config} />;
}
