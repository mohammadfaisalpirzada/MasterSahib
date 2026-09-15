'use client';

import AgFormBuilder, {
  AgHeader, Boxes, Check, DateBoxes, LabelRule, Rule, SignRow, digitsOnly,
  type AgFormConfig,
} from '@/app/components/govt-forms/AgFormBuilder';
import { AG_OFFICE_FIELDS, AG_EMPLOYEE_FIELDS } from '@/app/lib/govtFormFields';

const config: AgFormConfig = {
  slug: 'pay05-temporary-gp-fund-loan',
  pageTitle: 'Temporary GP Fund Loan / Advance Form',
  formCode: 'FORM: PAY05',
  pageIntro:
    'The AG Sindh PAY05 form for a refundable (temporary) loan or advance against your General Provident Fund. Fill the loan, interest and recovery details, then print the A4 sheet for the DDO and AG office.',
  fields: [
    ...AG_OFFICE_FIELDS.filter((f) => f.key !== 'formDate' && f.key !== 'pageNo'),
    ...AG_EMPLOYEE_FIELDS,
    { key: 'oldGpfAccountNo', label: 'Old GP Fund Account No.', section: 'GP Fund' },
    { key: 'loanCode', label: 'Loan Code', section: 'Loan (Principal)', placeholder: '4 digits' },
    { key: 'loanDescription', label: 'Loan Description', wide: true, section: 'Loan (Principal)' },
    { key: 'loanApprovalDate', label: 'Approval Date of Loan', type: 'date', section: 'Loan (Principal)' },
    { key: 'loanCondition', label: 'Loan Condition', type: 'select', options: ['With Interest', 'Without Interest'], section: 'Loan (Principal)' },
    { key: 'loanInterestRate', label: 'Loan Interest (%)', section: 'Loan (Principal)', placeholder: '0' },
    { key: 'refundablePercent', label: 'Refundable percentage of GP Fund balance', type: 'select', options: ['50%', '80%'], section: 'Loan (Principal)' },
    { key: 'loanAmount', label: 'Amount of Loan (Rs.)', section: 'Loan (Principal)' },
    { key: 'firstDeductionDate', label: 'Date of First Deduction', type: 'date', section: 'Loan (Principal)' },
    { key: 'firstDeductionRate', label: 'Rate of Recovery (first)', section: 'Loan (Principal)', placeholder: 'Rs. 5,000 p.m.' },
    { key: 'lastDeductionDate', label: 'Date of Last Deduction', type: 'date', section: 'Loan (Principal)' },
    { key: 'lastDeductionRate', label: 'Rate of Recovery (last)', section: 'Loan (Principal)' },
    { key: 'outstandingLoan', label: 'Outstanding Balance of Loan (Rs.)', wide: true, section: 'Loan (Principal)' },
    { key: 'interestLoanCode', label: 'Interest Loan Code', section: 'Interest' },
    { key: 'interestDescription', label: 'Interest Description', wide: true, section: 'Interest' },
    { key: 'interestAmount', label: 'Amount of Interest (Rs.)', section: 'Interest' },
    { key: 'interestFirstDate', label: 'Date of First Deduction', type: 'date', section: 'Interest' },
    { key: 'interestFirstRate', label: 'Rate of Recovery (first)', section: 'Interest' },
    { key: 'interestLastDate', label: 'Date of Last Deduction', type: 'date', section: 'Interest' },
    { key: 'interestLastRate', label: 'Rate of Recovery (last)', section: 'Interest' },
    { key: 'outstandingInterest', label: 'Outstanding Balance of Interest (Rs.)', wide: true, section: 'Interest' },
  ],
  sheet: (v, emblem) => (
    <>
      <AgHeader emblem={emblem} title="Temporary GP Fund Loan / Advance Form" formCode="FORM: PAY05" />

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

      <p className="ag-block-title" style={{ border: 'none' }}>Temporary Loan Details:</p>
      <div className="ag-block">
        <div className="mb-3 flex flex-wrap items-end gap-x-6 gap-y-2">
          <span className="flex items-end gap-2">
            <span className="ag-lab">LOAN CODE:</span>
            <Boxes value={v.loanCode} count={4} />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">DESCRIPTION:</span>
            <Rule value={v.loanDescription} grow />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">APPROVAL DATE OF LOAN:</span>
            <DateBoxes value={v.loanApprovalDate} w={15} />
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-start justify-between gap-6">
          <span className="flex items-start gap-3">
            <span className="ag-lab">LOAN CONDITION:</span>
            <span className="flex flex-col gap-1">
              <Check checked={v.loanCondition === 'With Interest'} label="WITH INTEREST" />
              <Check checked={v.loanCondition === 'Without Interest'} label="WITHOUT INTEREST" />
            </span>
            <span className="flex items-end gap-2">
              <span className="ag-lab">LOAN INTEREST:</span>
              <Rule value={v.loanInterestRate} width={50} />
              <span>%</span>
            </span>
          </span>
          <span className="flex items-start gap-3">
            <span className="ag-lab" style={{ maxWidth: 130, whiteSpace: 'normal' }}>
              REFUNDABLE PERCENTAGE OF GP FUND BALANCE
            </span>
            <span className="flex flex-col gap-1">
              <Check checked={v.refundablePercent === '50%'} label="50%" />
              <Check checked={v.refundablePercent === '80%'} label="80%" />
            </span>
          </span>
        </div>

        <p className="ag-block-title" style={{ marginTop: 10 }}>Principal</p>
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-3">
          <span className="flex items-end gap-2">
            <span className="ag-lab">AMOUNT OF LOAN</span>
            <Rule value={v.loanAmount} width={140} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF FIRST DEDUCTION</span>
            <DateBoxes value={v.firstDeductionDate} w={15} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">RATE OF RECOVERY</span>
            <Rule value={v.firstDeductionRate} width={130} />
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-3">
          <span style={{ minWidth: 200 }} />
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF LAST DEDUCTION</span>
            <DateBoxes value={v.lastDeductionDate} w={15} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">RATE OF RECOVERY</span>
            <Rule value={v.lastDeductionRate} width={130} />
          </span>
        </div>
        <div className="mb-3 flex items-end gap-2">
          <span className="ag-lab">OUTSTANDING BALANCE OF LOAN</span>
          <Rule value={v.outstandingLoan} width={220} />
        </div>

        <p className="ag-block-title" style={{ marginTop: 10 }}>Interest</p>
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-2">
          <span className="flex items-end gap-2">
            <span className="ag-lab">LOAN CODE:</span>
            <Boxes value={v.interestLoanCode} count={4} />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">DESCRIPTION:</span>
            <Rule value={v.interestDescription} grow />
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-3">
          <span className="flex items-end gap-2">
            <span className="ag-lab">AMOUNT OF INTEREST</span>
            <Rule value={v.interestAmount} width={130} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF FIRST DEDUCTION</span>
            <DateBoxes value={v.interestFirstDate} w={15} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">RATE OF RECOVERY</span>
            <Rule value={v.interestFirstRate} width={130} />
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-3">
          <span style={{ minWidth: 200 }} />
          <span className="flex items-end gap-2">
            <span className="ag-lab">DATE OF LAST DEDUCTION</span>
            <DateBoxes value={v.interestLastDate} w={15} />
          </span>
          <span className="flex items-end gap-2">
            <span className="ag-lab">RATE OF RECOVERY</span>
            <Rule value={v.interestLastRate} width={130} />
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span className="ag-lab">OUTSTANDING BALANCE OF INTEREST</span>
          <Rule value={v.outstandingInterest} width={220} />
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
    'A temporary advance is refundable — it is recovered from your salary in monthly installments.',
    'Loan codes and wage types are assigned by the AG office; confirm them with your DDO before submitting.',
  ],
};

export default function Pay05Page() {
  return <AgFormBuilder config={config} />;
}
