import { NextResponse } from 'next/server';
import {
  NAME_KEY,
  PICTURE_KEY,
  PID_KEY,
  createStaffVerifyToken,
  deletePictureFromStaffTab,
  getDirectoryItems,
  getStaffSheetRows,
  loadPictureFromStaffTab,
  rowsToRecords,
  saveStaffRow,
  savePictureToStaffTab,
  toFriendlySheetsError,
  toPublicRecord,
  verifyStaffVerifyToken,
} from '@/app/lib/staffRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_PICTURE_CELL_CHARS = 50000;

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

    const staffName = String(record[NAME_KEY] || '').trim();
    const picture = await loadPictureFromStaffTab(staffName);
    const publicRecord = toPublicRecord(record, columns);
    publicRecord.picture = picture;

    return NextResponse.json({
      success: true,
      record: publicRecord,
      columns: columns.filter((column) => column.key !== PID_KEY && column.key !== PICTURE_KEY),
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

    const normalizedEditableUpdates: Record<string, string> = {};

    columns.forEach((column) => {
      if (!column.editable || column.key === PICTURE_KEY) {
        return;
      }

      const nextValue = body.updates?.[column.key];
      if (typeof nextValue === 'string') {
        const trimmedValue = nextValue.trim();
        nextRecord[column.key] = trimmedValue;
        normalizedEditableUpdates[column.key] = trimmedValue;
      }
    });

    if (Object.keys(normalizedEditableUpdates).length > 0) {
      await saveStaffRow(rowNumber, normalizedEditableUpdates, columns);
    }

    // Handle picture separately (saved to pictures tab, not main sheet)
    const pictureUpdate = body.updates?.[PICTURE_KEY];
    const staffName = String(target[NAME_KEY] || '').trim();
    if (typeof pictureUpdate === 'string' && staffName) {
      if (pictureUpdate.length > MAX_PICTURE_CELL_CHARS) {
        return NextResponse.json(
          { success: false, message: 'Image is too large for Google Sheet cell. Please upload a smaller/compressed photo.' },
          { status: 400 }
        );
      }

      if (pictureUpdate === '') {
        await deletePictureFromStaffTab(staffName);
      } else {
        await savePictureToStaffTab(staffName, pictureUpdate);
      }
    }

    const picture = staffName ? await loadPictureFromStaffTab(staffName) : '';
    const updatedPublicRecord = Object.fromEntries(
      columns
        .filter((column) => column.key !== PID_KEY && column.key !== PICTURE_KEY)
        .map((column) => [column.key, nextRecord[column.key] || ''])
    );
    updatedPublicRecord.picture = picture;

    return NextResponse.json({
      success: true,
      record: updatedPublicRecord,
      columns: columns.filter((column) => column.key !== PID_KEY && column.key !== PICTURE_KEY),
      message: 'Data saved successfully.',
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to save GGSS staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}