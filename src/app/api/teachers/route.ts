import { NextResponse } from 'next/server';
import { getAllTeachers, addTeacher, ensureSheetExists } from '@/lib/district-east-sheets';

const required = ['name','pid','designation','place_of_posting','taluka','contractual_appointment','regularization_date','increments_claimed','arrears','recurring_annual_cost','pensionary_implications'];

export async function GET() {
  try {
    await ensureSheetExists();
    const records = await getAllTeachers();
    return NextResponse.json({ records });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to load records' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    for (const key of required) {
      if (body[key] === '' || body[key] === undefined || body[key] === null) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    const payload = {
      name: String(body.name).trim(),
      pid: String(body.pid).trim(),
      designation: String(body.designation).trim(),
      cnic: String(body.cnic || '').trim(),
      mobile: String(body.mobile || '').trim(),
      place_of_posting: String(body.place_of_posting).trim(),
      semis_code: String(body.semis_code || '').trim(),
      taluka: String(body.taluka).trim(),
      contractual_appointment: body.contractual_appointment,
      regularization_date: body.regularization_date,
      increments_claimed: Number(body.increments_claimed),
      arrears: Number(body.arrears),
      recurring_annual_cost: Number(body.recurring_annual_cost),
      pensionary_implications: String(body.pensionary_implications).trim(),
      remarks: String(body.remarks || '').trim(),
    };

    await ensureSheetExists();
    const record = await addTeacher(payload);
    return NextResponse.json({ record }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to submit record' },
      { status: 500 }
    );
  }
}
