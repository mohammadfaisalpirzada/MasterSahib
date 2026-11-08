import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const school = searchParams.get('school');
    const studentClass = searchParams.get('class');
    const session = searchParams.get('session') || '2026-2027';

    const supabase = createClient();

    let query = supabase
      .from('student_enrollments')
      .select(`
        id,
        gr_no,
        session_id,
        student_class,
        section,
        roll_no,
        status,
        students!inner (
          id,
          gr_no,
          student_name,
          father_name,
          gender,
          dob,
          dob_words,
          b_form_no,
          father_cnic,
          contact_no,
          address,
          religion,
          medium,
          school_id,
          status
        )
      `)
      .eq('session_id', session);

    if (studentClass) {
      query = query.ilike('student_class', studentClass);
    }

    if (school) {
      query = query.eq('students.school_id', school);
    }

    const { data, error } = await query.order('gr_no', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Flatten for easy frontend consumption
    const students = (data || []).map((row: any) => {
      const s = row.students;
      return {
        enrollmentId: row.id,
        grNo: row.gr_no,
        sessionId: row.session_id,
        studentClass: row.student_class,
        section: row.section,
        rollNo: row.roll_no,
        name: s?.student_name || '',
        fatherName: s?.father_name || '',
        gender: s?.gender || '',
        dob: s?.dob || '',
        dobWords: s?.dob_words || '',
        bFormNo: s?.b_form_no || '',
        fatherCnic: s?.father_cnic || '',
        contactNo: s?.contact_no || '',
        address: s?.address || '',
        religion: s?.religion || 'Islam',
        medium: s?.medium || 'Urdu',
        schoolId: s?.school_id || '',
      };
    });

    return NextResponse.json({ success: true, count: students.length, students });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
