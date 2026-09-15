'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const config: AgFormConfig = {
  slug: 'pension-indemnity-bond',
  pageTitle: 'Pension Indemnity Bond',
  pageIntro:
    'The indemnity bond a pensioner submits to the bank along with the direct-credit option form, undertaking that any excess amount credited to the pension account will be refunded. Fill the details and print the A4 page for signatures.',
  fields: [
    { key: 'bankName', label: 'Name of Bank', wide: true, section: 'Bank' },
    { key: 'bankBranch', label: 'Branch', section: 'Bank' },
    { key: 'bankCity', label: 'City', section: 'Bank' },
    { key: 'pensionerName', label: 'Name of Pensioner', section: 'Pensioner' },
    { key: 'dateOfRetirement', label: 'Date of Retirement', type: 'date', section: 'Pensioner' },
    { key: 'ppoNo', label: 'PPO No.', section: 'Pensioner' },
    { key: 'bankAccount', label: 'Bank Account No.', section: 'Pensioner' },
    { key: 'cnic', label: 'Pensioner CNIC', type: 'cnic', section: 'Pensioner' },
    { key: 'nomineeName', label: 'Name', section: 'Co-Indemnifier / Nominee / Successor / Next of Kin' },
    { key: 'nomineeCnic', label: 'CNIC', type: 'cnic', section: 'Co-Indemnifier / Nominee / Successor / Next of Kin' },
    { key: 'nomineeAddress', label: 'Address', wide: true, section: 'Co-Indemnifier / Nominee / Successor / Next of Kin' },
    { key: 'witness1Cnic', label: 'Witness 1 — CNIC', type: 'cnic', section: 'Witnesses' },
    { key: 'witness1Date', label: 'Witness 1 — Date', type: 'date', section: 'Witnesses' },
    { key: 'witness2Cnic', label: 'Witness 2 — CNIC', type: 'cnic', section: 'Witnesses' },
    { key: 'witness2Date', label: 'Witness 2 — Date', type: 'date', section: 'Witnesses' },
  ],
  sheet: (v) => (
    <>
      <h2 className="mb-6 text-center">Indemnity Bond</h2>

      <p className="mb-1">To</p>
      <div className="mb-5 pl-16">
        <p className="mb-3">The Manager,</p>
        <p className="mb-2"><Rule value={v.bankName} width={300} /> (Name of Bank)</p>
        <p className="mb-2"><Rule value={v.bankBranch} width={300} /> (Branch)</p>
        <p className="mb-2"><Rule value={v.bankCity} width={300} /> (City)</p>
      </div>

      <p className="mb-6 text-justify" style={{ lineHeight: 2 }}>
        In compliance with the SBP&apos;s instructions for payment of pension through your Bank Branch I agree to
        indemnify you and keep you indemnified about liabilities with all sums of money whatsoever including mark-up of
        my Pension Account. I further undertake that my legal heirs, successors, executors shall be liable to refund
        excess amount, if any, credited to my Pension Account either in full or in installments equal to such excess
        amount.
      </p>

      <div className="grid grid-cols-2 gap-10">
        <div>
          <p className="mb-4 text-center font-bold underline">
            Co-Indemnifier / Nominee / Successor / Next of Kin
          </p>
          <p className="mb-3">Name: <Rule value={v.nomineeName} width={200} /></p>
          <p className="mb-3">CNIC: <Rule value={v.nomineeCnic} width={200} /></p>
          <p className="mb-1">Address: <Rule value={v.nomineeAddress} width={175} /></p>
          <p className="mb-3"><Rule value="" width={250} /></p>
          <p className="mb-3">Signature: <Rule value="" width={180} /></p>
        </div>
        <div>
          <p className="mb-4 text-center font-bold underline">Pensioner</p>
          <p className="mb-3">Name of Pensioner: <Rule value={v.pensionerName} width={160} /></p>
          <p className="mb-3">Date of Retirement: <Rule value={v.dateOfRetirement} width={160} /></p>
          <p className="mb-3">PPO No: <Rule value={v.ppoNo} width={200} /></p>
          <p className="mb-3">Bank Account No: <Rule value={v.bankAccount} width={170} /></p>
          <p className="mb-3">CNIC: <Rule value={v.cnic} width={200} /></p>
          <p className="mb-3">Signature: <Rule value="" width={190} /></p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-10">
        <div>
          <p className="mb-4 text-center font-bold underline">Witness — 1</p>
          <p className="mb-3">CNIC: <Rule value={v.witness1Cnic} width={200} /></p>
          <p className="mb-3">Signature: <Rule value="" width={180} /></p>
          <p className="mb-3">Date: <Rule value={v.witness1Date} width={200} /></p>
        </div>
        <div>
          <p className="mb-4 text-center font-bold underline">Witness — 2</p>
          <p className="mb-3">CNIC: <Rule value={v.witness2Cnic} width={200} /></p>
          <p className="mb-3">Signature: <Rule value="" width={180} /></p>
          <p className="mb-3">Date: <Rule value={v.witness2Date} width={200} /></p>
        </div>
      </div>
    </>
  ),
  notes: [
    'Submit this bond with the Pension Direct Credit Option Form.',
    'Some banks require the bond on stamp paper — confirm the value with your branch before printing.',
  ],
};

export default function IndemnityBondPage() {
  return <AgFormBuilder config={config} />;
}
