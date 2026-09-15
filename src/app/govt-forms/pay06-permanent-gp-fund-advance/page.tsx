'use client';

import AgFormBuilder, {
  AgHeader, Boxes, Check, DateBoxes, LabelRule, Rule, SignRow, digitsOnly,
  type AgFormConfig,
} from '@/app/components/govt-forms/AgFormBuilder';
import { AG_OFFICE_FIELDS, AG_EMPLOYEE_FIELDS } from '@/app/lib/govtFormFields';

const config: AgFormConfig = {
  slug: 'pay06-permanent-gp-fund-advance',
  pageTitle: 'Permanent GP Fund Advance Form',
  formCode: 'FORM: PAY06',
  pageIntro:
    'The AG Sindh PAY06 form for a non-refundable (permanent) advance from your General Provident Fund balance. Fill your employee and loan details, then print the A4 sheet for the DDO and AG office.',
  fields: [
    ...AG_OFFICE_FIELDS.filter((f) => f.key !== 'formDate' && f.key !== 'pageNo'),
    ...AG_EMPLOYEE_FIELDS,
    { key: 'oldGpfAccountNo', label: 'Old GP Fund Account No.', section: 'GP Fund' },
    { key: 'permanentLoanDate', label: 'Date of Permanent Loan', type: 'date', section: 'GP Fund' },
    { key: 'totalAmount', label: 'Total Amount (Rs.)', section: 'GP Fund', placeholder: '500,000/-' },
    {
      key: 'nonRefundablePercent', label: 'Non-refundable percentage of GP Fund balance',
      type: 'select', options: ['80%', '100%', 'Other'], section: 'GP Fund',
    },
    { key: 'otherPercent', label: 'If Other, specify percentage', section: 'GP Fund', placeholder: '75%' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'GP Fund' },
    { key: 'dateOfAppointment', label: 'Date of Appointment', type: 'date', section: 'GP Fund' },
  ],
  sheet: (v, emblem) => (
    <>
      <AgHeader emblem={emblem} title="Permanent GP Fund Advance Form" formCode="FORM: PAY06" />

      <div className="mb-2"><LabelRule label="OFFICE OF THE" value={v.officeOfThe} /></div>
      <div className="mb-4 flex items-end gap-2">
        <span className="ag-lab">FOR THE MONTH OF</span>
        <Rule value={v.forMonth} width={150} />
        <span className="ag-lab">/ 20</span>
        <Rule value={v.forYear} width={40} />
      </div>

      <div className="ag-block">
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-2">
          <span className="flex items-end gap-2">
            <span className="ag-lab">DDO CODE (Cost Center)</span>
            <Boxes value={digitsOnly(v.ddoCode)} count={6} />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">DESCRIPTION:</span>
            <Rule value={v.ddoDescription} grow />
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-2">
          <span className="flex items-end gap-2">
            <span className="ag-lab">PERSONNEL NO.</span>
            <Boxes value={digitsOnly(v.personalNo)} count={8} />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">EMPLOYEE NAME</span>
            <Rule value={v.employeeName} grow />
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-end gap-x-8 gap-y-2">
          <span className="flex items-end gap-2">
            <span className="ag-lab">CNIC:</span>
            <Boxes value={digitsOnly(v.cnic).slice(0, 5)} count={5} />
            <span className="ag-dash">--</span>
            <Boxes value={digitsOnly(v.cnic).slice(5, 12)} count={7} />
            <span className="ag-dash">--</span>
            <Boxes value={digitsOnly(v.cnic).slice(12, 13)} count={1} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">BPS:</span>
            <Boxes value={digitsOnly(v.bps)} count={2} />
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">DESIGNATION:</span>
            <Rule value={v.designation} grow />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">PERIOD OF SERVICE:</span>
            <Rule value={v.periodOfService} grow />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">OLD GP FUND ACCOUNT NO.</span>
            <Rule value={v.oldGpfAccountNo} grow />
          </span>
        </div>
      </div>

      <p className="ag-block-title" style={{ border: 'none' }}>Permanent Loan Details:</p>
      <div className="ag-block">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF PERMANENT LOAN:</span>
            <DateBoxes value={v.permanentLoanDate} />
          </span>
          <span className="flex flex-1 items-end gap-2" style={{ minWidth: 220 }}>
            <span className="ag-lab">TOTAL AMOUNT:</span>
            <Rule value={v.totalAmount} grow />
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-start gap-4">
          <span className="ag-lab" style={{ maxWidth: 170, whiteSpace: 'normal' }}>
            NON-REFUNDABLE PERCENTAGE OF GP FUND BALANCE:
          </span>
          <span className="flex flex-col gap-1">
            <Check checked={v.nonRefundablePercent === '80%'} label="80%" />
            <Check checked={v.nonRefundablePercent === '100%'} label="100%" />
            <span className="flex items-end gap-2">
              <Check checked={v.nonRefundablePercent === 'Other'} label="Other" />
              <Rule value={v.nonRefundablePercent === 'Other' ? v.otherPercent : ''} width={70} />
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF BIRTH:</span>
            <DateBoxes value={v.dateOfBirth} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF APPOINTMENT:</span>
            <DateBoxes value={v.dateOfAppointment} />
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-[280px]">
          <p className="mb-2 text-right font-bold">Employee Specimen Signature</p>
          {[1, 2, 3].map((n) => (
            <p key={n} className="mb-3 flex items-end gap-2">
              <span>{n}</span>
              <span className="ag-rule" style={{ flex: 1 }} />
            </p>
          ))}
        </div>
      </div>

      <SignRow items={['Prepared By', 'Audited / Checked By', 'Entered / Verified By']} />
    </>
  ),
  notes: [
    'A permanent (non-refundable) advance is not recovered from your salary — check your GP Fund balance before applying.',
    'Attach the GP Fund balance statement and the sanction order required by your DDO.',
  ],
};

export default function Pay06Page() {
  return <AgFormBuilder config={config} />;
}
