'use client';

import AgFormBuilder, {
  AgHeader, Boxes, LabelRule, Rule, SignRow, digitsOnly, splitDate,
  type AgFormConfig,
} from '@/app/components/govt-forms/AgFormBuilder';
import { AG_OFFICE_FIELDS } from '@/app/lib/govtFormFields';

const ROWS = 11;

const config: AgFormConfig = {
  slug: 'pay03-payroll-amendment-multiple',
  pageTitle: 'Payroll System Amendment Form — Multiple Employees',
  formCode: 'FORM: PAY03',
  orientation: 'landscape',
  pageIntro:
    'The AG Sindh PAY03 amendment form for changing payroll data of several employees on one sheet. Fill the office header, optionally type the employee rows, then print in A4 landscape.',
  fields: [
    ...AG_OFFICE_FIELDS,
    {
      key: 'employeeRows',
      label: 'Employee rows',
      type: 'textarea',
      wide: true,
      section: 'Employees',
      placeholder:
        'One employee per line, separated by |\nPersonnel No. | Name | Info Type | Field ID | New Contents | Wage Type | Amount | Stop Sal. | Effective Date | Remarks',
      hint: 'Optional. Leave empty to print a blank sheet with 11 ruled rows.',
    },
  ],
  sheet: (v, emblem) => {
    const rows = (v.employeeRows || '')
      .split('\n')
      .map((line) => line.split('|').map((c) => c.trim()))
      .filter((cells) => cells.some((c) => c));
    const date = splitDate(v.formDate);

    return (
      <>
        <AgHeader
          emblem={emblem}
          title={'Payroll System\nAmendment Form'}
          subtitle="MULTIPLE EMPLOYEE ENTRY"
          formCode="FORM: PAY03"
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

        <div className="mb-2"><LabelRule label="OFFICE OF THE" value={v.officeOfThe} /></div>
        <div className="mb-3 flex items-end gap-2">
          <span className="ag-lab">FOR THE MONTH OF</span>
          <Rule value={v.forMonth} width={150} />
          <span className="ag-lab">/ 20</span>
          <Rule value={v.forYear} width={40} />
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
          <span className="flex items-end gap-2">
            <span className="ag-lab">DDO Code (Cost Center)</span>
            <Boxes value={digitsOnly(v.ddoCode)} count={6} />
          </span>
          <span className="flex flex-1 items-end gap-2">
            <span className="ag-lab">Description:</span>
            <Rule value={v.ddoDescription} grow />
          </span>
        </div>

        <table className="ag-table">
          <thead>
            <tr>
              <th colSpan={3}>Employees&apos; Details</th>
              <th rowSpan={2} style={{ width: '5%' }}>Info Type</th>
              <th colSpan={2}>General Data Change</th>
              <th colSpan={2}>Change in Payments / Deductions</th>
              <th rowSpan={2} style={{ width: '5%' }}>Stop Sal.</th>
              <th rowSpan={2} style={{ width: '10%' }}>Effective Date</th>
              <th rowSpan={2} style={{ width: '15%' }}>Remarks</th>
            </tr>
            <tr>
              <th style={{ width: '4%' }}>Sr.</th>
              <th style={{ width: '12%' }}>Personnel No.</th>
              <th style={{ width: '14%' }}>Name</th>
              <th style={{ width: '6%' }}>Field ID</th>
              <th style={{ width: '13%' }}>New Contents</th>
              <th style={{ width: '8%' }}>Wage Type</th>
              <th style={{ width: '10%' }}>Amount in Rupees</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, i) => {
              const r = rows[i] || [];
              return (
                <tr key={i}>
                  <td className="h" style={{ textAlign: 'center' }}>{r.length ? i + 1 : ''}</td>
                  {Array.from({ length: 9 }).map((__, c) => (
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
  notes: ['Use PAY02 when the amendment concerns a single employee only.'],
};

export default function Pay03Page() {
  return <AgFormBuilder config={config} />;
}
