'use client';

import AgFormBuilder, {
  AgHeader, Boxes, Rule, digitsOnly,
  type AgFormConfig,
} from '@/app/components/govt-forms/AgFormBuilder';

const CATEGORIES = [
  'DDO', 'Govt. Servant', 'Rtd. Govt. Servant',
  'Other than Govt. Servant', 'Supplier/Contractor', '',
  'Govt. Institution', 'Others', '',
];

const config: AgFormConfig = {
  slug: 'ag-vendor-creation',
  pageTitle: 'AG Sindh Vendor Creation Form',
  pageIntro:
    'The Office of the Accountant General Sindh vendor creation form — used to register an employee, pensioner, supplier or institution in the payment system against a bank account. Fill the details and print the A4 sheet for DDO signature.',
  fields: [
    { key: 'bankName', label: 'Bank', section: 'Bank Details' },
    { key: 'bankBranch', label: 'Branch', section: 'Bank Details' },
    { key: 'bankAccount', label: 'Account Number', wide: true, section: 'Bank Details' },
    { key: 'sectionCode', label: 'Section (3 digits)', section: 'Vendor' },
    { key: 'vendorName', label: 'Name of Vendor', wide: true, section: 'Vendor', hint: 'Prints across the character boxes — up to 28 characters.' },
    { key: 'ddoCode', label: 'Cost Center (DDO Code)', type: 'number', section: 'Vendor' },
    {
      key: 'category', label: 'Category', type: 'select', section: 'Vendor',
      options: ['DDO', 'Govt. Servant', 'Rtd. Govt. Servant', 'Other than Govt. Servant', 'Supplier/Contractor', 'Govt. Institution', 'Others'],
    },
    { key: 'personalNo', label: 'Personnel Number (Govt. employee)', type: 'number', section: 'Search Term' },
    { key: 'cnic', label: 'CNIC — Govt. Employee', type: 'cnic', section: 'Search Term' },
    { key: 'cnicOther', label: 'CNIC — Other than Govt. Employee', type: 'cnic', section: 'Search Term' },
    { key: 'ntn', label: 'NTN / Sales Tax Number (Supplier / Contractor)', wide: true, section: 'Search Term' },
    { key: 'ftn', label: 'FTN Number (Government Institution)', wide: true, section: 'Search Term' },
  ],
  sheet: (v, emblem) => (
    <>
      <AgHeader emblem={emblem} title="Office of the Accountant General Sindh" subtitle="VENDOR CREATION FORM" />

      <div className="mb-4 flex flex-col items-end gap-2">
        <span className="flex items-end gap-2" style={{ width: 320 }}>
          <span className="ag-lab">Bank:</span><Rule value={v.bankName} grow />
        </span>
        <span className="flex items-end gap-2" style={{ width: 320 }}>
          <span className="ag-lab">Branch:</span><Rule value={v.bankBranch} grow />
        </span>
        <span className="flex items-end gap-2" style={{ width: 320 }}>
          <span className="ag-lab">Account:</span><Rule value={v.bankAccount} grow />
        </span>
      </div>

      <div className="mb-3 flex items-end gap-3">
        <span className="ag-lab">Section:</span>
        <Boxes value={v.sectionCode} count={3} w={30} h={24} />
      </div>

      <div className="mb-1 flex items-end gap-3">
        <span className="ag-lab">Name of Vendor:</span>
        <Boxes value={(v.vendorName || '').toUpperCase().slice(0, 14)} count={14} w={26} h={24} />
      </div>
      <div className="mb-3 ml-[104px]">
        <Boxes value={(v.vendorName || '').toUpperCase().slice(14, 28)} count={14} w={26} h={24} />
      </div>

      <div className="mb-3 flex items-end gap-3">
        <span className="ag-lab">Cost center:</span>
        <Boxes value={digitsOnly(v.ddoCode)} count={6} w={30} h={24} />
      </div>

      <div className="mb-4 flex items-start gap-3">
        <span className="ag-lab">Category:</span>
        <table className="ag-table" style={{ width: 'auto' }}>
          <tbody>
            {[0, 3, 6].map((start) => (
              <tr key={start}>
                {CATEGORIES.slice(start, start + 3).map((cat, i) =>
                  cat ? (
                    <td key={i} style={{ padding: 0 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'stretch' }}>
                        <span style={{ width: 26, borderRight: '1px solid #000', textAlign: 'center', fontWeight: 700 }}>
                          {v.category === cat ? '✕' : ''}
                        </span>
                        <span style={{ padding: '3px 8px', minWidth: 140 }}>{cat}</span>
                      </span>
                    </td>
                  ) : (
                    <td key={i} style={{ border: 'none' }} />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ag-block-title">Search Term:</p>
      <p className="mb-1 font-bold underline">Govt. Employee</p>
      <div className="mb-2 flex items-end gap-3">
        <span className="ag-lab">Personnel Number:</span>
        <Boxes value={digitsOnly(v.personalNo)} count={8} w={26} h={24} />
      </div>
      <div className="mb-3 flex items-end gap-3">
        <span className="ag-lab">CNIC Number:</span>
        <Boxes value={digitsOnly(v.cnic).slice(0, 5)} count={5} w={26} h={24} />
        <span className="ag-dash">---</span>
        <Boxes value={digitsOnly(v.cnic).slice(5, 12)} count={7} w={26} h={24} />
        <span className="ag-dash">---</span>
        <Boxes value={digitsOnly(v.cnic).slice(12, 13)} count={1} w={26} h={24} />
      </div>

      <p className="mb-1 font-bold underline">Other than Govt. Employee</p>
      <div className="mb-3 flex items-end gap-3">
        <span className="ag-lab">CNIC Number:</span>
        <Boxes value={digitsOnly(v.cnicOther).slice(0, 5)} count={5} w={26} h={24} />
        <span className="ag-dash">---</span>
        <Boxes value={digitsOnly(v.cnicOther).slice(5, 12)} count={7} w={26} h={24} />
        <span className="ag-dash">---</span>
        <Boxes value={digitsOnly(v.cnicOther).slice(12, 13)} count={1} w={26} h={24} />
      </div>

      <p className="mb-1 font-bold underline">Supplier / Contractor</p>
      <div className="mb-3 flex items-end gap-3">
        <span className="ag-lab">NTN / Sales Tax Number:</span>
        <Boxes value={digitsOnly(v.ntn)} count={10} w={26} h={24} />
      </div>

      <p className="mb-1 font-bold underline">Government Institution</p>
      <div className="mb-6 flex items-end gap-3">
        <span className="ag-lab">FTN Number:</span>
        <Boxes value={digitsOnly(v.ftn)} count={10} w={26} h={24} />
      </div>

      <div className="mt-10 flex justify-between border-b border-black pb-1 font-bold">
        <span>Official Stamp</span>
        <span>Signature of DDO</span>
        <span>Head of Office / Department</span>
      </div>
      <p className="mt-1 text-center font-bold">(FOR OFFICIAL USE ONLY)</p>

      <div className="mt-8 flex flex-wrap justify-between gap-4">
        <span className="ag-lab">Checked &amp; Verified by:</span>
        <span>Senior Auditor</span>
        <span>Asst. Accounts Officer</span>
        <span>Accounts Officer</span>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <span className="ag-lab">Vendor</span>
        <Boxes value="" count={8} w={30} h={24} />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <span className="flex items-end gap-2">
          <span className="ag-lab">Vendor Created By:</span><Rule value="" width={160} />
        </span>
        <span className="flex items-end gap-2">
          <span className="ag-lab">Dated:</span><Rule value="" width={160} />
        </span>
      </div>
    </>
  ),
  notes: [
    'The lower half of the sheet is for official use — leave it blank and let the AG office complete it.',
    'Attach an attested copy of the CNIC and a bank account maintenance certificate as required by your DDO.',
  ],
};

export default function VendorCreationPage() {
  return <AgFormBuilder config={config} />;
}
