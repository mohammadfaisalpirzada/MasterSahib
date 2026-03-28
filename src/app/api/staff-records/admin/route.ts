import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  STAFF_ADMIN_SESSION_COOKIE,
  verifyStaffAdminPassword,
  verifyStaffAdminSessionToken,
} from '@/app/lib/staffAdminAuth';
import {
  deleteStaffRow,
  getDirectoryItems,
  getStaffSheetRows,
  rowsToRecords,
  saveStaffRow,
  toFriendlySheetsError,
  toFullRecord,
} from '@/app/lib/staffRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requireAdminSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  const session = token ? verifyStaffAdminSessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized admin access.' }, { status: 401 });
  }

  return null;
};

const validateAdminPassword = (password?: string) => {
  const normalizedPassword = String(password ?? '').trim();

  if (!normalizedPassword) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Admin password is required for this action.' },
        { status: 400 }
      ),
      password: '',
    };
  }

  if (!verifyStaffAdminPassword(normalizedPassword)) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Incorrect admin password.' },
        { status: 401 }
      ),
      password: '',
    };
  }

  return { error: null, password: normalizedPassword };
};

export async function GET() {
  try {
    const sessionError = await requireAdminSession();
    if (sessionError) {
      return sessionError;
    }

    const { context, rows } = await getStaffSheetRows();
    const { columns, records } = rowsToRecords(rows);

    return NextResponse.json({
      success: true,
      columns,
      records: records.map((record) => ({
        rowId: String(record.rowNumber),
        ...toFullRecord(record, columns),
      })),
      items: getDirectoryItems(records),
      source: {
        sheetName: context.sheetName,
      },
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to load GGSS admin data.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionError = await requireAdminSession();
    if (sessionError) {
      return sessionError;
    }

    const body = (await request.json()) as {
      rowId?: string;
      password?: string;
      updates?: Record<string, string>;
    };

    const passwordValidation = validateAdminPassword(body.password);
    if (passwordValidation.error) {
      return passwordValidation.error;
    }

    const rowNumber = Number(body.rowId || 0);
    if (!rowNumber) {
      return NextResponse.json({ success: false, message: 'Valid rowId is required.' }, { status: 400 });
    }

    const { rows } = await getStaffSheetRows();
    const { columns, records } = rowsToRecords(rows);
    const target = records.find((record) => record.rowNumber === rowNumber);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Staff record not found.' }, { status: 404 });
    }

    const nextRecord: Record<string, string> = {};
    columns.forEach((column) => {
      const requestedValue = body.updates?.[column.key];
      nextRecord[column.key] =
        typeof requestedValue === 'string' ? requestedValue.trim() : String(target[column.key] || '');
    });

    await saveStaffRow(rowNumber, nextRecord, columns);

    return NextResponse.json({
      success: true,
      message: 'Staff record updated successfully.',
      record: {
        rowId: String(rowNumber),
        ...toFullRecord({ rowNumber, ...nextRecord }, columns),
      },
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to update GGSS staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionError = await requireAdminSession();
    if (sessionError) {
      return sessionError;
    }

    const body = (await request.json()) as {
      rowId?: string;
      password?: string;
    };

    const passwordValidation = validateAdminPassword(body.password);
    if (passwordValidation.error) {
      return passwordValidation.error;
    }

    const rowNumber = Number(body.rowId || 0);
    if (!rowNumber) {
      return NextResponse.json({ success: false, message: 'Valid rowId is required.' }, { status: 400 });
    }

    const { rows } = await getStaffSheetRows();
    const { records } = rowsToRecords(rows);
    const target = records.find((record) => record.rowNumber === rowNumber);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Staff record not found.' }, { status: 404 });
    }

    await deleteStaffRow(rowNumber);

    return NextResponse.json({
      success: true,
      message: 'Staff record deleted successfully.',
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to delete GGSS staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
