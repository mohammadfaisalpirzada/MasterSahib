'use client';

import AgFormBuilder, {
  AgHeader, Boxes, Check, LabelRule, Rule, SignRow, digitsOnly, splitDate,
  type AgFormConfig,
} from '@/app/components/govt-forms/AgFormBuilder';
import { AG_OFFICE_FIELDS } from '@/app/lib/govtFormFields';

const ROWS = 10;

const config: AgFormConfig = {
  slug: 'pay02-payroll-amendment',
  pageTitle: 'Payroll System Amendment Form — Single Employee',
  formCode: 'FORM: PAY02',
  orientation: 'landscape',
  pageIntro:
    'The AG Sindh PAY02 amendment form used to change one employee’s payroll data — allowances, deductions, general data or salary start/stop. Fill the header, print in A4 landscape and enter the amendment rows by hand or type them below.',
  fields: [
    ...AG_OFFICE_FIELDS,
    { key: 'personalNo', label: 'Personnel Number', type: 'number', section: 'Employee', placeholder: '8 digits' },
    { key: 'employeeName', label: 'Employee Name', wide: true, section: 'Employee' },
    { key: 'cnic', label: 'National ID Card Number', type: 'cnic', section: 'Employee' },
    { key: 'bps', label: 'Grade (Pay Scale Group)', type: 'number', section: 'Employee' },
    { key: 'gradeText', label: 'Grade description', section: 'Employee', placeholder: 'BPS-16 (JST)' },
    {
      key: 'salaryStatus', label: 'Salary Status', type: 'select',
      options: ['Start', 'Stop'], section: 'Employee',
    },
    {
      key: 'amendments',
      label: 'Amendment rows',
      type: 'textarea',
      wide: true,
      section: 'Amendments',
      placeholder: 'One row per line, separated by |\nInfo Type | Field ID | New Contents | Wage Type | Amount | Effective Date | Remarks',
      hint: 'Optional. Type one row per line using | between the columns. Empty rows print blank for hand-filling.',
    },
  ],
  sheet: (v, emblem) => {
    const rows = (v.amendments || '')
      .split('\n')
      .map((line) => line.split('|').map((c) => c.trim()))
      .filter((cells) => cells.some((c) => c));
    const date = splitDate(v.formDate);

    return (
      <>
        <AgHeader
          emblem={emblem}
          title={'Payroll System\nAmendment Form'}
          subtitle="SINGLE EMPLOYEE ENTRY"
          formCode="FORM: PAY02"
          right={
            <>
              <p className="mt-1">
                Date: <Rule value={date.d} width={26} /> / <Rule value={date.m} width={26} /> / 20
                <Rule value={date.y ? date.y.slice(2) : ''} width={26} />
              </p>
              <p className="mt-1">Page No. <Rule value={v.pageNo} width={70} /></p>
            </>
          }
        />

        <div className="ag-block" style={{ border: 'none', padding: 0 }}>
          <div className="mb-2"><LabelRule label="OFFICE OF THE" value={v.officeOfThe} /></div>
          <div className="mb-3 flex items-end gap-2">
            <span className="ag-lab">FOR THE MONTH OF</span>
            <Rule value={v.forMonth} width={150} />
            <span className="ag-lab">/ 20</span>
            <Rule value={v.forYear} width={40} />
          </div>

          <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-2">
            <span className="flex items-end gap-2">
              <span className="ag-lab">DDO code (Cost Center)</span>
              <Boxes value={digitsOnly(v.ddoCode)} count={6} />
            </span>
            <span className="flex flex-1 items-end gap-2">
              <span className="ag-lab">Description:</span>
              <Rule value={v.ddoDescription} grow />
            </span>
          </div>

          <div className="mb-2 flex flex-wrap items-end gap-x-6 gap-y-2">
            <span className="flex items-end gap-2">
              <span className="ag-lab">Personnel Number:</span>
              <Boxes value={digitsOnly(v.personalNo)} count={8} />
            </span>
            <span className="flex flex-1 items-end gap-2">
              <span className="ag-lab">Employee Name:</span>
              <Rule value={v.employeeName} grow />
            </span>
            <span className="flex flex-1 items-end gap-2">
              <span className="ag-lab">National ID Card Number:</span>
              <Rule value={v.cnic} grow />
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-2">
            <span className="flex items-end gap-2">
              <span className="ag-lab">Grade (Pay Scale Group)</span>
              <Boxes value={digitsOnly(v.bps)} count={2} />
              <Rule value={v.gradeText} width={130} />
            </span>
            <span className="flex items-end gap-3">
              <span className="ag-lab">Salary Status:</span>
              <Check checked={v.salaryStatus === 'Start'} label="Start" />
              <Check checked={v.salaryStatus === 'Stop'} label="Stop" />
            </span>
          </div>
        </div>

        <table className="ag-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: '6%' }}>Info Type</th>
              <th colSpan={2}>General Data Change</th>
              <th colSpan={2}>Change in Payments / Deductions</th>
              <th rowSpan={2} style={{ width: '12%' }}>Effective Date</th>
              <th rowSpan={2} style={{ width: '20%' }}>Remarks</th>
            </tr>
            <tr>
              <th style={{ width: '8%' }}>Field ID</th>
              <th style={{ width: '20%' }}>New Contents</th>
              <th style={{ width: '12%' }}>Wage Type</th>
              <th style={{ width: '16%' }}>Amount in Rupees</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, i) => {
              const r = rows[i] || [];
              return (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, c) => (
                    <td key={c} className="h">{r[c] || ''}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <SignRow items={['Prepared By', 'Audited / Checked By', 'Entered / Verified By']} />
      </>
    );
  },
  notes: [
    'Info Type and Field ID codes come from the AG Sindh payroll manual — enter exactly what your DDO office specifies.',
    'Use PAY03 instead when the same amendment applies to several employees.',
  ],
};

export default function Pay02Page() {
  return <AgFormBuilder config={config} />;
}
