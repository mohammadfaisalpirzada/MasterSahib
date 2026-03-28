import { NextResponse } from 'next/server';
import {
  PID_KEY,
  createStaffVerifyToken,
  getDirectoryItems,
  getStaffSheetRows,
  rowsToRecords,
  saveStaffRow,
  toFriendlySheetsError,
  toPublicRecord,
  verifyStaffVerifyToken,
} from '@/app/lib/staffRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = (url.searchParams.get('mode') || 'directory').toLowerCase();
    const { context, rows } = await getStaffSheetRows();
    const { columns, records } = rowsToRecords(rows);

    if (mode === 'directory') {
      return NextResponse.json({
        success: true,
        items: getDirectoryItems(records),
        source: {
          sheetName: context.sheetName,
        },
      });
    }

    return NextResponse.json({
      success: true,
      columns: columns.filter((column) => column.key !== PID_KEY),
      count: records.length,
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to load GGSS staff directory.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rowId?: string; pid?: string };
    const rowNumber = Number(body.rowId || 0);
    const pid = String(body.pid ?? '').trim();

    if (!rowNumber || !pid) {
      return NextResponse.json({ success: false, message: 'rowId and PID are required.' }, { status: 400 });
    }

    const { rows } = await getStaffSheetRows();
    const { columns, records } = rowsToRecords(rows);
    const record = records.find((item) => item.rowNumber === rowNumber);

    if (!record) {
      return NextResponse.json({ success: false, message: 'Staff record not found.' }, { status: 404 });
    }

    if (String(record[PID_KEY] || '').trim() !== pid) {
      return NextResponse.json({ success: false, message: 'Incorrect PID. Please try again.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      record: toPublicRecord(record, columns),
      columns: columns.filter((column) => column.key !== PID_KEY),
      verifyToken: createStaffVerifyToken({ rowNumber, verifiedAt: Date.now() }),
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to verify staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      verifyToken?: string;
      updates?: Record<string, string>;
    };

    const token = String(body.verifyToken ?? '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Verification token is required.' }, { status: 400 });
    }

    const { rowNumber } = verifyStaffVerifyToken(token);
    const { rows } = await getStaffSheetRows();
    const { columns, records } = rowsToRecords(rows);
    const target = records.find((item) => item.rowNumber === rowNumber);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Staff record not found.' }, { status: 404 });
    }

    const nextRecord: Record<string, string> = {};
    columns.forEach((column) => {
      nextRecord[column.key] = String(target[column.key] || '');
    });

    columns.forEach((column) => {
      if (!column.editable) {
        return;
      }

      const nextValue = body.updates?.[column.key];
      if (typeof nextValue === 'string') {
        nextRecord[column.key] = nextValue.trim();
      }
    });

    await saveStaffRow(rowNumber, nextRecord, columns);

    return NextResponse.json({
      success: true,
      record: Object.fromEntries(
        columns
          .filter((column) => column.key !== PID_KEY)
          .map((column) => [column.key, nextRecord[column.key] || ''])
      ),
      columns: columns.filter((column) => column.key !== PID_KEY),
      message: 'Data saved successfully.',
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to save GGSS staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}