import { NextRequest, NextResponse } from 'next/server';
import {
  getTeachersDropdownList,
  verifyTeacherAccess,
  verifyTeacherForEdit,
  updateTeacherRecord,
  TeacherRecordData,
} from '@/app/lib/teacherPersonalRecords';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const list = await getTeachersDropdownList();
    return NextResponse.json({
      success: true,
      teachers: list,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Teachers list load nahi ho saki.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, rowNumber, personalNumber, viewToken } = body;

    if (!rowNumber || !personalNumber) {
      return NextResponse.json(
        { success: false, message: 'Teacher ka intikhab aur Personal Number lazmi hain.' },
        { status: 400 }
      );
    }

    const rowNum = Number(rowNumber);
    if (isNaN(rowNum) || rowNum < 2) {
      return NextResponse.json(
        { success: false, message: 'Ghalat row number.' },
        { status: 400 }
      );
    }

    if (action === 'reverify-edit') {
      if (!viewToken) {
        return NextResponse.json(
          { success: false, message: 'Existing session token missing.' },
          { status: 401 }
        );
      }

      const { editToken } = await verifyTeacherForEdit(viewToken, rowNum, String(personalNumber));
      return NextResponse.json({
        success: true,
        editToken,
        message: 'Password tasdeeq hogaya. Ab aap record mein changing kar sakty hain.',
      });
    }

    // Default action: 'verify' for view access
    const result = await verifyTeacherAccess(rowNum, String(personalNumber));
    return NextResponse.json({
      success: true,
      token: result.token,
      record: result.record,
      message: 'Personal number verified successfully.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Tasdeeq ke doran masla pesh aya.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { rowNumber, editToken, data } = body as {
      rowNumber: number;
      editToken: string;
      data: Partial<TeacherRecordData>;
    };

    if (!rowNumber || !editToken || !data) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters for update.' },
        { status: 400 }
      );
    }

    const rowNum = Number(rowNumber);
    const updated = await updateTeacherRecord(editToken, rowNum, data);

    return NextResponse.json({
      success: true,
      record: updated,
      message: 'Record kamyabi sy Google Sheet may update hogaya hai.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Record update nahi ho saka.';
    return NextResponse.json(
      { success: false, message: msg },
      { status: 400 }
    );
  }
}
