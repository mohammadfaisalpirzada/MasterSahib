'use client';

import AgFormBuilder, {
  AgHeader, Boxes, Check, DateBoxes, Rule, SignRow, digitsOnly,
  type AgFieldDef, type AgFormConfig,
} from '@/app/components/govt-forms/AgFormBuilder';

/* ---------- input fields ---------- */

const F = (
  key: string, label: string, section: string,
  extra: Partial<AgFieldDef> = {},
): AgFieldDef => ({ key, label, section, ...extra });

const FIELDS: AgFieldDef[] = [
  F('officeOfThe', '01 Office of the', 'Office', { wide: true }),
  F('forMonth', '02 For the month of', 'Office'),
  F('forYear', 'Year (20__)', 'Office'),
  F('ddoCode', '03 DDO Code (Cost Center)', 'Office', { type: 'number' }),
  F('ddoDescription', '04 Description', 'Office', { wide: true }),
  F('employeeId', 'Employee ID (assigned by office)', 'Office'),

  F('dateOfEntry', '05 Date of Entry', 'Personnel Actions — Info Type 00', { type: 'date' }),
  F('currentGovernment', '06 Current Government', 'Personnel Actions — Info Type 00'),
  F('employeeGroup', '07 Employee Group', 'Personnel Actions — Info Type 00'),
  F('employeeGrade', '08 Employee Grade (Sub Group)', 'Personnel Actions — Info Type 00'),
  F('cnic', '09 Employee CNIC Number', 'Personnel Actions — Info Type 00', { type: 'cnic' }),
  F('dateOfBirth', '10 Date of Birth', 'Personnel Actions — Info Type 00', { type: 'date' }),
  F('dateOfEntryService', '11 Date of Entry into Government Service', 'Personnel Actions — Info Type 00', { type: 'date' }),
  F('reasonForAction', '12 Reason for Action', 'Personnel Actions — Info Type 00'),

  F('title', '13 Title', 'Personal Data — Info Type 0002', { type: 'select', options: ['Mr.', 'Miss', 'Ms.', 'Mrs.'] }),
  F('lastName', '14 Last Name', 'Personal Data — Info Type 0002'),
  F('firstName', '15 First Name', 'Personal Data — Info Type 0002'),
  F('fatherName', '16 Father / Husband Name', 'Personal Data — Info Type 0002', { wide: true }),
  F('districtOfDomicile', '17 District of Domicile', 'Personal Data — Info Type 0002'),
  F('maritalStatus', '18 Marital Status', 'Personal Data — Info Type 0002', { type: 'select', options: ['Married', 'Single', 'Widow', 'Divorced'] }),
  F('cityOfBirth', '19 City of Birth', 'Personal Data — Info Type 0002'),
  F('dateOfMarriage', '20 Date of Marriage (if applicable)', 'Personal Data — Info Type 0002', { type: 'date' }),
  F('provinceOfDomicile', '21 Province of Domicile', 'Personal Data — Info Type 0002'),
  F('noOfDependents', '22 No. of Dependents', 'Personal Data — Info Type 0002', { type: 'number' }),
  F('nationality', '23 Nationality', 'Personal Data — Info Type 0002', { defaultValue: 'Pakistani' }),
  F('religion', '24 Religion', 'Personal Data — Info Type 0002', { defaultValue: 'Islam' }),

  F('fundCenter', '26 DDO Code (Fund Center)', 'Organizational Assignment — Info Type 0001'),
  F('districtSubArea', '27 District (Sub Area)', 'Organizational Assignment — Info Type 0001'),
  F('contractGovernment', '28 Contract Government', 'Organizational Assignment — Info Type 0001', {
    type: 'select',
    options: ['Sindh Government', 'Punjab Government', 'Federal Government', 'KPK Government', 'AJK Government', 'Baluchistan Government'],
    defaultValue: 'Sindh Government',
  }),
  F('position', '29 Position', 'Organizational Assignment — Info Type 0001', { type: 'select', options: ['Gazetted', 'Non-Gazetted'] }),
  F('designation', '30 Designation', 'Organizational Assignment — Info Type 0001'),
  F('ministry', '31 Ministry (Organizational Unit)', 'Organizational Assignment — Info Type 0001'),
  F('fundSection', '32 Fund Section', 'Organizational Assignment — Info Type 0001'),
  F('payrollSection', '33 Payroll Section', 'Organizational Assignment — Info Type 0001'),
  F('buckleNumber', '34 Buckle Number (if any)', 'Organizational Assignment — Info Type 0001'),

  F('presentCareOf', '35 Care of', 'Present Address — Info Type 0006'),
  F('presentStreet', '36 House No. / Street', 'Present Address — Info Type 0006', { wide: true }),
  F('presentPostalCode', '37 Postal Code', 'Present Address — Info Type 0006'),
  F('presentCity', '38 City', 'Present Address — Info Type 0006'),
  F('presentDistrict', '39 District', 'Present Address — Info Type 0006'),
  F('presentProvince', '40 Province / Region', 'Present Address — Info Type 0006'),
  F('presentContact', '41 Contact Number', 'Present Address — Info Type 0006', { type: 'phone' }),
  F('presentHousing', '42 Company Housing', 'Present Address — Info Type 0006', { type: 'select', options: ['Yes', 'No'] }),

  F('permanentSame', 'Permanent address is', 'Permanent Address — Info Type 0006', {
    type: 'select', options: ['Same as present address', 'Different from present address'],
  }),
  F('permanentCareOf', '43 Care of', 'Permanent Address — Info Type 0006'),
  F('permanentStreet', '44 House No. / Street', 'Permanent Address — Info Type 0006', { wide: true }),
  F('permanentPostalCode', '45 Postal Code', 'Permanent Address — Info Type 0006'),
  F('permanentCity', '46 City', 'Permanent Address — Info Type 0006'),
  F('permanentDistrict', '47 District', 'Permanent Address — Info Type 0006'),
  F('permanentProvince', '48 Province / Region', 'Permanent Address — Info Type 0006'),
  F('permanentContact', '49 Contact Number', 'Permanent Address — Info Type 0006', { type: 'phone' }),
  F('permanentHousing', '50 Company Housing', 'Permanent Address — Info Type 0006', { type: 'select', options: ['Yes', 'No'] }),

  F('payScaleType', '51 Pay Scale Type', 'Basic Pay — Info Type 0008'),
  F('bpsYear', '52 BPS Year (Pay Scale Area)', 'Basic Pay — Info Type 0008'),
  F('bps', '53 Grade (Pay Scale Group)', 'Basic Pay — Info Type 0008', { type: 'number' }),
  F('payScaleLevel', '54 Pay Scale Level', 'Basic Pay — Info Type 0008'),
  F('pays', '55 Pays — wage rows', 'Basic Pay — Info Type 0008', {
    type: 'textarea', wide: true, placeholder: 'Wage Type | Description | Amount   (one per line)',
  }),
  F('leaves', '56 Leaves — balance rows', 'Basic Pay — Info Type 0008', {
    type: 'textarea', wide: true, placeholder: 'Code | Description | Balance   (one per line)',
  }),

  F('bankBranch', '57 Bank Branch (Bank Key)', 'Bank Detail — Info Type 0009', { wide: true }),
  F('bankPostalCode', '58 Postal Code', 'Bank Detail — Info Type 0009'),
  F('bankCity', '59 City', 'Bank Detail — Info Type 0009'),
  F('bankAccount', '60 Bank Account Number', 'Bank Detail — Info Type 0009', { wide: true }),
  F('paymentMethod', '61 Payment Method', 'Bank Detail — Info Type 0009'),

  F('gpfWageType', '62 Wage Type', 'GP Fund — Info Type 0057 / 9202'),
  F('gpfSubscription', '63 GPF Subscription', 'GP Fund — Info Type 0057 / 9202'),
  F('gpfInterestApplied', '64 Interest Applied', 'GP Fund — Info Type 0057 / 9202', { type: 'select', options: ['Yes', 'No'] }),
  F('gpFundBalance', '65 GP Fund Balance', 'GP Fund — Info Type 0057 / 9202'),
  F('gpFundBalanceDate', '66 GP Fund Balance Date', 'GP Fund — Info Type 0057 / 9202', { type: 'date' }),
  F('oldGpfAccountNo', '67 Old GP Fund Account Number', 'GP Fund — Info Type 0057 / 9202'),

  F('gazettedDate', '68 Date Appointed as Gazetted Officer', 'Other Data', { type: 'date' }),
  F('suspensionDate', '69 Suspension Date', 'Other Data', { type: 'date' }),
  F('adhocExpiry', '70 Expiry of Ad Hoc / Contract Date', 'Other Data', { type: 'date' }),
  F('previousPersonnelNo', '71 Previous Personnel Number (if any)', 'Other Data'),
  F('ntn', '72 National Tax Number (NTN)', 'Other Data'),
  F('leaveWithoutPay', '73 Leave Without Pay', 'Other Data'),
  F('cashCenter', '74 Cash Center', 'Other Data'),
  F('salaryStatus', '78 Payroll Status', 'Other Data', { type: 'select', options: ['Start Payment', 'Stop Payment'] }),

  F('familyRows', '75 Family Information rows', 'Tables', {
    type: 'textarea', wide: true,
    placeholder: 'Relation | First Name | Last Name | Nominee | Date of Birth | Nationality | % Share | Emp. Type | Other Nationality',
    hint: 'One family member per line, columns separated by |',
  }),
  F('allowanceRows', '76 Recurring Payments (Allowances)', 'Tables', {
    type: 'textarea', wide: true, placeholder: 'Wage Type | Description | Amount   (one per line)',
  }),
  F('deductionRows', '77 Recurring Payments (Deductions)', 'Tables', {
    type: 'textarea', wide: true, placeholder: 'Wage Type | Description | Amount   (one per line)',
  }),
  F('academicRows', 'A Academic Education — Info Type 0022', 'Tables', {
    type: 'textarea', wide: true, placeholder: 'Institute | Description of Education | Date Obtained | Marks/Grade',
  }),
  F('professionalRows', 'B Professional Qualifications — Info Type 0024', 'Tables', {
    type: 'textarea', wide: true, placeholder: 'Institute | Description of Education | Date Obtained | Marks/Grade',
  }),
];

/* ---------- printed sheet helpers ---------- */

const rowsOf = (raw: string) =>
  (raw || '')
    .split('\n')
    .map((line) => line.split('|').map((c) => c.trim()))
    .filter((cells) => cells.some((c) => c));

function NumField({ n, label, children }: { n: string; label: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold">{n} {label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function GridTable({ head, rows, count, widths }: { head: string[]; rows: string[][]; count: number; widths?: string[] }) {
  return (
    <table className="ag-table">
      <thead>
        <tr>{head.map((h, i) => <th key={h} style={widths ? { width: widths[i] } : undefined}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i}>
            {head.map((__, c) => <td key={c} className="h">{rows[i]?.[c] || ''}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DOCUMENTS = [
  'Attested copies of (i) CNIC (ii) Domicile / PRC and (iii) Form "D"',
  'Copy of Advertisement / Newspaper cutting with name of Newspapers and date of publication (In case of Fresh / Disabled quota).',
  'Result of the Examination. (FPSC, SPSC, NTS etc.)',
  'Offer of appointment / Order of Appointment',
  'Posting order',
  'Duty joining report & Charge assumption report',
  'Medical Fitness Certificate (In Original along with photocopy)',
  'Vacancy Position dully verified with FD budget.',
  'List dully signed by concerned Administrative Secretary for creation of new SAP ID (for fresh / Disable quota appointment).',
  'Summary of appointment (Showing name of appointee) dully approved by the Chief Secretary (In case of deceased quota appointment).',
  'Approval of District / Department Recruitment Committee (DRC).',
  'No objection certificate. (When applied through proper channel)',
  'i) FRC issued by NADRA, ii) Obituary and iii) Heir-ship Certificate (in case of appointment made on deceased quota).',
  'Death certificate of deceased employee issued by NADRA / Union Council (in case of appointment made on deceased quota).',
  'Attested copy of PPO / L.P.C / Pension Pay slip showing SAP ID of deceased employee whose legal heir has been appointed (In case of deceased quota appointment).',
  'Attested copies of (i) Matriculation, (ii) Intermediate, (iii) Graduation and (iv) Master Degree (Where applicable).',
  'Copies of passed manual bill(s), Cheques (For old / time barred appointment)',
  'Age relaxation order (In case of over aged appointment)',
  'Certificate that the official is not appointed in Ban Period. (Where applicable)',
  'Relieving / Resignation letter from previous job. (Where applicable)',
];

/* ---------- config ---------- */

const config: AgFormConfig = {
  slug: 'pay01-employee-master-file',
  pageTitle: 'Employee Master File Creation Form',
  formCode: 'FORM: PAY01',
  pageIntro:
    'The AG Sindh PAY01 form that creates a new employee in the payroll and GP Fund system. It prints as four A4 pages — personnel and personal data, addresses and pay, family and education, and the required-documents checklist.',
  fields: FIELDS,
  sheet: (v, emblem) => {
    const pageBreak = { pageBreakAfter: 'always' as const, breakAfter: 'page' as const };
    return (
      <>
        {/* ---------------- Page 1 ---------------- */}
        <div style={pageBreak}>
          <AgHeader
            emblem={emblem}
            title="Employee Master File Creation Form"
            subtitle="(Applicable for both Payroll and GP Fund)"
            formCode="FORM: PAY01"
            right={
              <>
                <p className="font-bold">EMPLOYEE ID (TO BE ASSIGNED BY OFFICE)</p>
                <div className="mt-1 flex justify-end"><Boxes value={v.employeeId} count={8} /></div>
              </>
            }
          />

          <div className="mb-2 flex items-end gap-2">
            <span className="ag-lab">01 OFFICE OF THE</span><Rule value={v.officeOfThe} grow />
          </div>
          <div className="mb-2 flex items-end gap-2">
            <span className="ag-lab">02 FOR THE MONTH OF</span><Rule value={v.forMonth} width={170} />
            <span className="ag-lab">/ 20</span><Rule value={v.forYear} width={45} />
          </div>
          <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <span className="flex items-end gap-2">
              <span className="ag-lab">03 DDO CODE (Cost Center)</span>
              <Boxes value={digitsOnly(v.ddoCode)} count={6} />
            </span>
            <span className="flex flex-1 items-end gap-2">
              <span className="ag-lab">04 Description:</span><Rule value={v.ddoDescription} grow />
            </span>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Personnel Actions — Info Type 00</p>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <NumField n="05" label="DATE OF ENTRY (DD/MM/YYYY)"><DateBoxes value={v.dateOfEntry} /></NumField>
              <NumField n="06" label="CURRENT GOVERNMENT"><Rule value={v.currentGovernment} width={220} /></NumField>
              <NumField n="07" label="EMPLOYEE GROUP"><Rule value={v.employeeGroup} width={220} /></NumField>
              <NumField n="08" label="EMPLOYEE GRADE (SUB GROUP)"><Rule value={v.employeeGrade} width={220} /></NumField>
              <NumField n="09" label="EMPLOYEE CNIC NUMBER"><Boxes value={digitsOnly(v.cnic)} count={13} w={16} /></NumField>
              <NumField n="10" label="DOB (DD/MM/YYYY)"><DateBoxes value={v.dateOfBirth} /></NumField>
              <NumField n="11" label="DATE OF ENTRY INTO GOVERNMENT SERVICE"><DateBoxes value={v.dateOfEntryService} /></NumField>
              <NumField n="12" label="REASON FOR ACTION"><Rule value={v.reasonForAction} width={220} /></NumField>
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Personal Data — Info Type 0002</p>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="ag-lab">13 TITLE</span>
              {['Mr.', 'Miss', 'Ms.', 'Mrs.'].map((t) => (
                <Check key={t} checked={v.title === t} label={t} />
              ))}
            </div>
            <div className="mb-2"><p className="font-bold">14 LAST NAME</p><Boxes value={(v.lastName || '').toUpperCase()} count={20} w={16} /></div>
            <div className="mb-2"><p className="font-bold">15 FIRST NAME</p><Boxes value={(v.firstName || '').toUpperCase()} count={20} w={16} /></div>
            <div className="mb-3"><p className="font-bold">16 FATHER / HUSBAND NAME</p><Boxes value={(v.fatherName || '').toUpperCase()} count={20} w={16} /></div>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <NumField n="17" label="DISTRICT OF DOMICILE"><Rule value={v.districtOfDomicile} width={220} /></NumField>
              <NumField n="18" label="MARITAL STATUS"><Rule value={v.maritalStatus} width={220} /></NumField>
              <NumField n="19" label="CITY OF BIRTH"><Rule value={v.cityOfBirth} width={220} /></NumField>
              <NumField n="20" label="DATE OF MARRIAGE (IF APPLICABLE)"><DateBoxes value={v.dateOfMarriage} /></NumField>
              <NumField n="21" label="PROVINCE OF DOMICILE"><Rule value={v.provinceOfDomicile} width={220} /></NumField>
              <NumField n="22" label="NO. OF DEPENDENTS"><Boxes value={digitsOnly(v.noOfDependents)} count={2} /></NumField>
              <NumField n="23" label="NATIONALITY"><Rule value={v.nationality} width={220} /></NumField>
              <NumField n="24" label="RELIGION"><Rule value={v.religion} width={220} /></NumField>
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Organizational Assignment — Info Type 0001</p>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <NumField n="25" label="DDO CODE (COST CENTER)"><Boxes value={digitsOnly(v.ddoCode)} count={6} /></NumField>
              <NumField n="26" label="DDO CODE (FUND CENTER)"><Boxes value={digitsOnly(v.fundCenter)} count={6} /></NumField>
              <NumField n="27" label="DISTRICT (SUB AREA)"><Rule value={v.districtSubArea} width={220} /></NumField>
              <NumField n="28" label="CONTRACT GOVERNMENT">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {['Sindh Government', 'Punjab Government', 'Federal Government', 'KPK Government', 'AJK Government', 'Baluchistan Government'].map((g) => (
                    <Check key={g} checked={v.contractGovernment === g} label={g} />
                  ))}
                </div>
              </NumField>
              <NumField n="29" label="POSITION">
                <Check checked={v.position === 'Gazetted'} label="GAZETTED" />
                <Check checked={v.position === 'Non-Gazetted'} label="NON-GAZETTED" />
              </NumField>
              <NumField n="31" label="MINISTRY (ORGANIZATIONAL UNIT)"><Boxes value={v.ministry} count={8} w={16} /></NumField>
              <NumField n="30" label="DESIGNATION"><Rule value={v.designation} width={220} /></NumField>
              <NumField n="33" label="PAYROLL SECTION"><Boxes value={v.payrollSection} count={3} /></NumField>
              <NumField n="32" label="FUND SECTION"><Boxes value={v.fundSection} count={3} /></NumField>
              <NumField n="34" label="BUCKLE NUMBER (IF ANY)"><Boxes value={v.buckleNumber} count={8} w={16} /></NumField>
            </div>
          </div>
        </div>

        {/* ---------------- Page 2 ---------------- */}
        <div style={pageBreak}>
          <div className="ag-block">
            <p className="ag-block-title">Present Address — Info Type 0006</p>
            <div className="mb-2"><p className="font-bold">35 CARE OF</p><Rule value={v.presentCareOf} grow /></div>
            <div className="mb-2"><p className="font-bold">36 HOUSE NO. / STREET</p><Rule value={v.presentStreet} grow /></div>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <NumField n="37" label="POSTAL CODE"><Boxes value={digitsOnly(v.presentPostalCode)} count={5} /></NumField>
              <NumField n="38" label="CITY"><Rule value={v.presentCity} width={160} /></NumField>
              <NumField n="39" label="DISTRICT"><Rule value={v.presentDistrict} width={160} /></NumField>
              <NumField n="40" label="PROVINCE / REGION"><Rule value={v.presentProvince} width={160} /></NumField>
              <NumField n="41" label="CONTACT NUMBER"><Rule value={v.presentContact} width={160} /></NumField>
              <NumField n="42" label="COMPANY HOUSING">
                <Check checked={v.presentHousing === 'Yes'} label="YES" />
                <Check checked={v.presentHousing === 'No'} label="NO" />
              </NumField>
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Permanent Address — Info Type 0006</p>
            <div className="mb-2 flex flex-wrap gap-6">
              <Check checked={v.permanentSame === 'Same as present address'} label="Permanent Address is same as above." />
              <Check checked={v.permanentSame === 'Different from present address'} label="Permanent Address is different from above." />
            </div>
            <div className="mb-2"><p className="font-bold">43 CARE OF</p><Rule value={v.permanentCareOf} grow /></div>
            <div className="mb-2"><p className="font-bold">44 HOUSE NO. / STREET</p><Rule value={v.permanentStreet} grow /></div>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <NumField n="45" label="POSTAL CODE"><Boxes value={digitsOnly(v.permanentPostalCode)} count={5} /></NumField>
              <NumField n="46" label="CITY"><Rule value={v.permanentCity} width={160} /></NumField>
              <NumField n="47" label="DISTRICT"><Rule value={v.permanentDistrict} width={160} /></NumField>
              <NumField n="48" label="PROVINCE / REGION"><Rule value={v.permanentProvince} width={160} /></NumField>
              <NumField n="49" label="CONTACT NUMBER"><Rule value={v.permanentContact} width={160} /></NumField>
              <NumField n="50" label="COMPANY HOUSING">
                <Check checked={v.permanentHousing === 'Yes'} label="YES" />
                <Check checked={v.permanentHousing === 'No'} label="NO" />
              </NumField>
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Basic Pay — Info Type 0008</p>
            <div className="ag-grid mb-3" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <NumField n="51" label="PAY SCALE TYPE"><Boxes value={v.payScaleType} count={3} /></NumField>
              <NumField n="52" label="BPS YEAR"><Boxes value={v.bpsYear} count={4} /></NumField>
              <NumField n="53" label="GRADE"><Boxes value={digitsOnly(v.bps)} count={3} /></NumField>
              <NumField n="54" label="PAY SCALE LEVEL"><Boxes value={v.payScaleLevel} count={3} /></NumField>
            </div>
            <p className="font-bold">55 PAYS</p>
            <GridTable head={['Wage Type', 'Description', 'Amount']} rows={rowsOf(v.pays)} count={4} widths={['20%', '50%', '30%']} />
          </div>

          <div className="ag-block">
            <p className="ag-block-title">56 Leaves — Info Type 2001</p>
            <GridTable head={['Code', 'Description', 'Balance']} rows={rowsOf(v.leaves)} count={3} widths={['20%', '50%', '30%']} />
          </div>

          <div className="ag-block">
            <p className="ag-block-title">57 Bank Detail — Info Type 0009</p>
            <div className="mb-2"><p className="font-bold">BANK BRANCH (BANK KEY)</p><Rule value={v.bankBranch} grow /></div>
            <div className="ag-grid mb-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <NumField n="58" label="POSTAL CODE"><Boxes value={digitsOnly(v.bankPostalCode)} count={5} /></NumField>
              <NumField n="59" label="CITY"><Rule value={v.bankCity} width={200} /></NumField>
            </div>
            <div className="mb-2"><p className="font-bold">60 BANK ACCOUNT NUMBER</p><Boxes value={v.bankAccount} count={20} w={16} /></div>
            <NumField n="61" label="PAYMENT METHOD"><Rule value={v.paymentMethod} width={200} /></NumField>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">GP Fund Subscription — Info Type 0057 / 9202</p>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <NumField n="62" label="WAGE TYPE"><Boxes value={v.gpfWageType} count={4} /></NumField>
              <NumField n="63" label="GPF SUBSCRIPTION"><Boxes value={digitsOnly(v.gpfSubscription)} count={6} /></NumField>
              <NumField n="64" label="INTEREST APPLIED">
                <Check checked={v.gpfInterestApplied === 'Yes'} label="YES" />
                <Check checked={v.gpfInterestApplied === 'No'} label="NO" />
              </NumField>
              <NumField n="65" label="GP FUND BALANCE"><Boxes value={digitsOnly(v.gpFundBalance)} count={8} /></NumField>
              <NumField n="66" label="GP FUND BALANCE DATE"><DateBoxes value={v.gpFundBalanceDate} /></NumField>
              <NumField n="67" label="OLD GP FUND ACCOUNT NUMBER"><Rule value={v.oldGpfAccountNo} width={200} /></NumField>
            </div>
          </div>
        </div>

        {/* ---------------- Page 3 ---------------- */}
        <div style={pageBreak}>
          <div className="ag-block">
            <p className="ag-block-title">Create Data Specification — Info Type 0041</p>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <NumField n="68" label="DATE APPOINTED AS GAZETTED OFFICER"><DateBoxes value={v.gazettedDate} /></NumField>
              <NumField n="69" label="SUSPENSION DATE"><DateBoxes value={v.suspensionDate} /></NumField>
              <NumField n="70" label="EXPIRY OF AD HOC / CONTRACT DATE"><DateBoxes value={v.adhocExpiry} /></NumField>
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Internal Data — Info Type 0032</p>
            <div className="ag-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <NumField n="71" label="PREVIOUS PERSONNEL NUMBER (IF ANY)"><Boxes value={digitsOnly(v.previousPersonnelNo)} count={8} w={16} /></NumField>
              <NumField n="72" label="NATIONAL TAX NUMBER (NTN)"><Boxes value={digitsOnly(v.ntn)} count={9} w={16} /></NumField>
              <NumField n="73" label="LEAVE WITHOUT PAY"><Boxes value={v.leaveWithoutPay} count={3} /></NumField>
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="ag-lab">74 CASH CENTER</span><Rule value={v.cashCenter} width={220} />
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">75 Family Information — Info Type 0021</p>
            <GridTable
              head={['Relation', 'First Name', 'Last Name', 'Nominee', 'Date of Birth', 'Nationality', '% Share', 'Emp. Type', 'Other Nationality']}
              rows={rowsOf(v.familyRows)}
              count={4}
            />
          </div>

          <div className="ag-block">
            <p className="ag-block-title">76 Recurring Payments (Allowances) — Info Type 0014</p>
            <GridTable head={['Wage Type', 'Description', 'Amount']} rows={rowsOf(v.allowanceRows)} count={7} widths={['20%', '50%', '30%']} />
          </div>

          <div className="ag-block">
            <p className="ag-block-title">77 Recurring Payments (Deductions) — Info Type 0014</p>
            <GridTable head={['Wage Type', 'Description', 'Amount']} rows={rowsOf(v.deductionRows)} count={4} widths={['20%', '50%', '30%']} />
          </div>

          <div className="ag-block">
            <p className="ag-block-title">78 Payroll Status — Info Type 003</p>
            <div className="flex flex-wrap items-end gap-6">
              <span className="flex gap-4">
                <Check checked={v.salaryStatus === 'Start Payment'} label="Start Payment" />
                <Check checked={v.salaryStatus === 'Stop Payment'} label="Stop Payment" />
              </span>
              <span className="flex flex-1 items-end gap-2">
                <span className="ag-lab">CNIC:</span><Rule value={v.cnic} grow />
              </span>
            </div>
          </div>

          <div className="ag-block">
            <p className="ag-block-title">Education and Qualifications</p>
            <p className="font-bold">A — Academic Education, Info Type 0022</p>
            <GridTable head={['Institute', 'Description of Education', 'Date Obtained', 'Marks / Grade']} rows={rowsOf(v.academicRows)} count={3} widths={['30%', '35%', '20%', '15%']} />
            <p className="mt-3 font-bold">B — Professional Qualifications, Info Type 0024</p>
            <GridTable head={['Institute', 'Description of Education', 'Date Obtained', 'Marks / Grade']} rows={rowsOf(v.professionalRows)} count={3} widths={['30%', '35%', '20%', '15%']} />
          </div>

          <SignRow items={['Prepared By', 'Audited / Checked By', 'Entered / Verified By', 'Employee Signature']} />
        </div>

        {/* ---------------- Page 4 — documents checklist ---------------- */}
        <div>
          <p className="font-bold">REQUIRED DOCUMENTS:</p>
          <p className="mb-3">
            Please attach copies of all these documents duly attested by Drawing &amp; Disbursing officer with official
            by name stamp.
          </p>
          <table className="ag-table">
            <thead>
              <tr>
                <th rowSpan={2} style={{ width: '6%' }}>Sr.</th>
                <th rowSpan={2}>Documents / Papers Required</th>
                <th colSpan={2} style={{ width: '14%' }}>Attached</th>
              </tr>
              <tr><th>Yes</th><th>No</th></tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((doc, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                  <td>{doc}</td>
                  <td className="h" /><td className="h" />
                </tr>
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={`blank-${i}`}>
                  <td style={{ textAlign: 'center' }}>{DOCUMENTS.length + i + 1}.</td>
                  <td className="h" /><td className="h" /><td className="h" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  },
  notes: [
    'This form prints as four A4 pages — keep them together when submitting.',
    'Info Type and wage type codes are assigned by the AG office; confirm them with your DDO.',
    'All attached documents must be attested by the Drawing & Disbursing Officer with an official by-name stamp.',
  ],
};

export default function Pay01Page() {
  return <AgFormBuilder config={config} />;
}
