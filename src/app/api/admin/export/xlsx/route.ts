import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAdmin } from '@/lib/admin';
import { getAllTeachers } from '@/lib/district-east-sheets';

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await getAllTeachers();

    const data = records.map((r, i) => ({
      'S.No': i + 1,
      Name: r.name,
      PID: r.pid,
      Designation: r.designation,
      Mobile: r.mobile || '',
      'Place of Posting': r.place_of_posting,
      'SEMIS Code': r.semis_code || '',
      Taluka: r.taluka,
      'Contractual Appointment': r.contractual_appointment,
      'Regularization Date': r.regularization_date,
      'Increments Claimed': r.increments_claimed,
      'Arrears (Rs.)': r.arrears,
      'Recurring Annual Cost (Rs.)': r.recurring_annual_cost,
      'Pensionary Implications': r.pensionary_implications || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="district-east-teachers.xlsx"',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Export failed' },
      { status: 500 }
    );
  }
}
