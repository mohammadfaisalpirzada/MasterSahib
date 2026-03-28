import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import {
  getDirectoryItems,
  getStaffSheetRows,
  rowsToRecords,
  toFriendlySheetsError,
  toFullRecord,
} from '@/app/lib/staffRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
    const session = token ? verifyStaffAdminSessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized admin access.' }, { status: 401 });
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
