import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = searchParams.get('session') || '2026-2027';
    const examTitle = searchParams.get('term') || searchParams.get('examTitle');
    const studentClass = searchParams.get('class');
    const grNo = searchParams.get('grNo');

    const supabase = createClient();

    let query = supabase
      .from('exam_results')
      .select(`
        id,
        gr_no,
        session_id,
        exam_title,
        student_class,
        roll_no,
        marks,
        total_max,
        total_obt,
        percentage,
        grade,
        attendance_total,
        attendance_present,
        remarks,
        conduct,
        created_at,
        updated_at,
        students!inner (
          student_name,
          father_name,
          school_id,
          dob,
          address
        )
      `)
      .eq('session_id', session);

    if (examTitle) {
      query = query.ilike('exam_title', examTitle);
    }
    if (studentClass) {
      query = query.ilike('student_class', studentClass);
    }
    if (grNo) {
      query = query.eq('gr_no', grNo);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0, results: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const records = Array.isArray(body) ? body : [body];

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No records provided' }, { status: 400 });
    }

    const supabase = createClient();

    const toUpsert = records.map((r: any) => ({
      gr_no: String(r.grNo || r.gr_no).trim(),
      session_id: String(r.session || r.sessionId || '2026-2027').trim(),
      exam_title: String(r.examTitle || r.exam_title).trim(),
      student_class: String(r.studentClass || r.student_class).trim(),
      roll_no: String(r.rollNo || r.roll_no || '').trim(),
      marks: r.marks || {},
      total_max: Number(r.totalMax || r.total_max || 0),
      total_obt: Number(r.totalObt || r.total_obt || 0),
      percentage: Number(r.percentage || 0),
      grade: String(r.grade || '').trim(),
      attendance_total: Number(r.attendanceTotal || r.attendance_total || 0),
      attendance_present: Number(r.attendancePresent || r.attendance_present || 0),
      remarks: String(r.remarks || '').trim(),
      conduct: String(r.conduct || '').trim(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('exam_results')
      .upsert(toUpsert, { onConflict: 'gr_no,session_id,exam_title' })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0, results: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
