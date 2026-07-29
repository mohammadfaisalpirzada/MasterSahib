import { NextResponse } from 'next/server';
import { getAllTeachers, addTeacher, updateTeacher, ensureSheetExists } from '@/lib/district-east-sheets';

const requiredForCreate = ['name','pid','designation','place_of_posting','taluka','contractual_appointment','regularization_date','increments_claimed'];
const requiredForUpdate = ['name','pid','designation','place_of_posting','taluka','contractual_appointment','regularization_date','increments_claimed'];

function buildPayload(body: any) {
  return {
    name: String(body.name).trim(),
    pid: String(body.pid).trim(),
    designation: String(body.designation).trim(),
    mobile: String(body.mobile || '').trim(),
    place_of_posting: String(body.place_of_posting).trim(),
    semis_code: String(body.semis_code || '').trim(),
    taluka: String(body.taluka).trim(),
    contractual_appointment: body.contractual_appointment,
    regularization_date: body.regularization_date,
    increments_claimed: Number(body.increments_claimed),
    arrears: Number(body.arrears || 0),
    recurring_annual_cost: Number(body.recurring_annual_cost || 0),
    pensionary_implications: String(body.pensionary_implications || '').trim(),
  };
}

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
    const isUpdate = Boolean(body.id);

    const requiredFields = isUpdate ? requiredForUpdate : requiredForCreate;
    for (const key of requiredFields) {
      if (body[key] === '' || body[key] === undefined || body[key] === null) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    const payload = buildPayload(body);

    await ensureSheetExists();

    if (isUpdate) {
      const record = await updateTeacher(body.id, payload);
      return NextResponse.json({ record });
    } else {
      const record = await addTeacher(payload);
      return NextResponse.json({ record }, { status: 201 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unable to submit record' },
      { status: 500 }
    );
  }
}
