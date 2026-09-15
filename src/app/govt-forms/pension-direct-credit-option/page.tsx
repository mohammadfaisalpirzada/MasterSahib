'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const ROWS: Array<[string, string, boolean?]> = [
  ['PPO No.', 'ppoNo'],
  ['SAP Personnel No.', 'personalNo'],
  ['Accounts Office (From where PPO originally issued)', 'accountsOffice'],
  ['Name of Pensioner', 'pensionerName', true],
  ['Father / Husband Name', 'fatherName'],
  ['Family Pensioner Name', 'familyPensionerName', true],
  ['Spouse / Father / Mother Name', 'spouseName'],
  ['Pensioner NIC Old Number', 'oldNic'],
  ['Pensioner CNIC Number', 'cnic'],
  ['Family Pensioner CNIC Number', 'familyCnic'],
  ['Residential Address (Current)', 'currentAddress'],
  ['Residential Address (Permanent)', 'permanentAddress'],
  ['Designation & Grade at the time of Retirement', 'designationAtRetirement'],
  ['Ministry / Division / Dept. / Office', 'department'],
  ['Present NBP Address & Code No.', 'nbpAddress'],
];

const config: AgFormConfig = {
  slug: 'pension-direct-credit-option',
  pageTitle: 'Pension Direct Credit Option Form',
  pageIntro:
    'The Accountant General Sindh option form for drawing pension directly into a bank account. Fill the pensioner information, print the A4 sheet, sign it and submit it with the indemnity bond to your bank.',
  fields: [
    { key: 'ppoNo', label: 'PPO No.', section: 'Pensioner Information' },
    { key: 'personalNo', label: 'SAP Personnel No.', section: 'Pensioner Information' },
    { key: 'accountsOffice', label: 'Accounts Office (where PPO was issued)', wide: true, section: 'Pensioner Information' },
    { key: 'pensionerName', label: 'Name of Pensioner', section: 'Pensioner Information' },
    { key: 'fatherName', label: 'Father / Husband Name', section: 'Pensioner Information' },
    { key: 'familyPensionerName', label: 'Family Pensioner Name', section: 'Pensioner Information' },
    { key: 'spouseName', label: 'Spouse / Father / Mother Name', section: 'Pensioner Information' },
    { key: 'oldNic', label: 'Pensioner NIC (Old) Number', section: 'Pensioner Information' },
    { key: 'cnic', label: 'Pensioner CNIC Number', type: 'cnic', section: 'Pensioner Information' },
    { key: 'familyCnic', label: 'Family Pensioner CNIC Number', type: 'cnic', section: 'Pensioner Information' },
    { key: 'currentAddress', label: 'Residential Address (Current)', wide: true, section: 'Pensioner Information' },
    { key: 'permanentAddress', label: 'Residential Address (Permanent)', wide: true, section: 'Pensioner Information' },
    { key: 'designationAtRetirement', label: 'Designation & Grade at the time of Retirement', wide: true, section: 'Pensioner Information' },
    { key: 'department', label: 'Ministry / Division / Dept. / Office', wide: true, section: 'Pensioner Information' },
    { key: 'nbpAddress', label: 'Present NBP Address & Code No.', wide: true, section: 'Pensioner Information' },
    { key: 'signDate', label: 'Date of signing', type: 'date', section: 'Pensioner Information' },
  ],
  sheet: (v) => (
    <>
      <div className="mb-1 text-center">
        <h2>Accountant General Sindh</h2>
        <p className="text-[12.5px] font-bold">OPTION FORM FOR DIRECT CREDIT OF PENSION THROUGH BANK ACCOUNT</p>
        <p className="text-[11.5px] font-bold">Pensioner&apos;s Information (To be filled in by the Pensioner)</p>
      </div>

      <table className="ag-table" style={{ marginTop: 8 }}>
        <tbody>
          {ROWS.map(([label, key, bold]) => (
            <tr key={key}>
              <td style={{ width: '38%', fontWeight: bold ? 700 : 400 }}>{label}</td>
              <td className="h" style={{ fontWeight: 700 }}>{v[key] || ''}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={{ fontSize: '9.5px', lineHeight: 1.35, fontWeight: 700 }}>
              I hereby opt to draw pension through direct credit system and have also submitted *Indemnity Bond to the
              bank. *The Pensioner shall produce an Indemnity Bond to keep the bank indemnified about liabilities with
              all sums of money whatsoever including mark-up of his/her Pension Account. The pensioner would further
              undertake that his/her legal heirs, successors, executors shall be liable to refund excess amount, if any,
              credited to his/her Pension Account either in full or in installments (as agreed mutually) equal to such
              excess amount.
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ height: 90, verticalAlign: 'bottom', textAlign: 'center' }}>
              <span className="font-bold">(Pensioner&apos;s Signature / Thumb Impression)</span>{' '}
              Dated: <Rule value={v.signDate} width={170} />
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4 text-center font-bold">Account Verification (To be verified by the Bank)</p>
      <table className="ag-table" style={{ marginTop: 6 }}>
        <tbody>
          {['Account Title (Name)', 'Account No.', 'Branch Name / Address', 'Branch Code', 'Indemnity Bond / Lien submitted by the Pensioner'].map((label) => (
            <tr key={label}>
              <td style={{ width: '32%' }}>{label}</td>
              <td className="h" />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 text-center">
        <span className="ag-rule" style={{ display: 'inline-block', width: 240 }} />
        <p className="font-bold">Signature / Stamp of Bank Manager</p>
      </div>

      <div className="mt-4 border-t border-dashed border-black pt-2 text-center font-bold">
        To be issued by Accounts Office
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-6">
        <span className="flex items-end gap-2">Acknowledgement Receipt No. <Rule value="" width={150} /></span>
        <span className="flex items-end gap-2">Signature of Officer: <Rule value="" width={150} /></span>
      </div>
      <div className="mt-4 flex items-end gap-2">Date: <Rule value="" width={170} /></div>
    </>
  ),
  notes: [
    'The bank verification block and the Accounts Office block are filled by the bank and AG office — leave them blank.',
    'Submit this form together with the Indemnity Bond.',
  ],
};

export default function PensionOptionPage() {
  return <AgFormBuilder config={config} />;
}
