import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GGSS_STIPEND_SESSION_COOKIE, isGgssStipendAdminUser, verifyGgssStipendSessionToken } from '@/app/lib/ggssStipendAuth';
import {
  addGgssStipendRow,
  deleteGgssStipendRow,
  getGgssStipendSheetRows,
  ggssStipendRowsToRecords,
  saveGgssStipendRow,
  toGgssStipendRecord,
} from '@/app/lib/ggssStipendRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const resolveClassKey = (columnKeys: string[]) => {
  const classAliases = ['class', 'classname'];
  const classAliasSet = new Set(classAliases.map((value) => normalize(value)));
  return columnKeys.find((key) => classAliasSet.has(normalize(key))) || '';
};

const requireSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(GGSS_STIPEND_SESSION_COOKIE)?.value;
  const session = token ? verifyGgssStipendSessionToken(token) : null;

  if (!session) {
    return {
      error: NextResponse.json({ success: false, message: 'Unauthorized stipend access.' }, { status: 401 }),
      session: null,
    };
  }

  return { error: null, session };
};

const isSameClass = (value: string, className: string) => normalize(value) === normalize(className);

export async function GET() {
  try {
    const { error, session } = await requireSession();
    if (error || !session) {
      return error;
    }

    const { context, rows } = await getGgssStipendSheetRows();
    const { columns, records } = ggssStipendRowsToRecords(rows);
    const classKey = resolveClassKey(columns.map((column) => column.key));
    const isAdmin = isGgssStipendAdminUser(session.username);

    const visibleRecords = !isAdmin && classKey
      ? records.filter((record) => isSameClass(String(record[classKey] ?? ''), session.className))
      : records;

    const availableClasses = classKey
      ? Array.from(new Set(records.map((record) => String(record[classKey] ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))
      : [];

    return NextResponse.json({
      success: true,
      columns,
      records: visibleRecords.map((record) => ({
        rowId: String(record.rowNumber),
        ...toGgssStipendRecord(record, columns),
      })),
      source: {
        sheetName: context.sheetName,
      },
      className: session.className,
      username: session.username,
      isAdmin,
      availableClasses,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load stipend records.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error, session } = await requireSession();
    if (error || !session) {
      return error;
    }
    const isAdmin = isGgssStipendAdminUser(session.username);

    const body = (await request.json()) as { data?: Record<string, string> };
    const { rows } = await getGgssStipendSheetRows();
    const { columns } = ggssStipendRowsToRecords(rows);

    if (!columns.length) {
      return NextResponse.json({ success: false, message: 'Stipend sheet header is missing.' }, { status: 400 });
    }

    const classKey = resolveClassKey(columns.map((column) => column.key));
    if (!classKey) {
      return NextResponse.json({ success: false, message: 'Class column is required in stipend sheet.' }, { status: 400 });
    }

    const nextValues: Record<string, string> = {};
    columns.forEach((column) => {
      const requestedValue = body.data?.[column.key];
      nextValues[column.key] = typeof requestedValue === 'string' ? requestedValue.trim() : '';
    });

    if (isAdmin) {
      if (!nextValues[classKey]) {
        return NextResponse.json({ success: false, message: 'Class value is required for admin entries.' }, { status: 400 });
      }
    } else {
      nextValues[classKey] = session.className;
    }

    const studentNameKey = columns.find((column) => normalize(column.label) === 'studentname')?.key;
    if (studentNameKey && !nextValues[studentNameKey]) {
      return NextResponse.json({ success: false, message: 'Student Name is required.' }, { status: 400 });
    }

    await addGgssStipendRow(nextValues, columns);

    return NextResponse.json({ success: true, message: 'Student stipend record added successfully.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to add stipend record.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { error, session } = await requireSession();
    if (error || !session) {
      return error;
    }
    const isAdmin = isGgssStipendAdminUser(session.username);

    const body = (await request.json()) as { rowId?: string; data?: Record<string, string> };
    const rowNumber = Number(body.rowId || 0);
    if (!rowNumber) {
      return NextResponse.json({ success: false, message: 'Valid rowId is required.' }, { status: 400 });
    }

    const { rows } = await getGgssStipendSheetRows();
    const { columns, records } = ggssStipendRowsToRecords(rows);
    const classKey = resolveClassKey(columns.map((column) => column.key));

    const target = records.find((record) => record.rowNumber === rowNumber);
    if (!target) {
      return NextResponse.json({ success: false, message: 'Stipend record not found.' }, { status: 404 });
    }

    if (!isAdmin && classKey && !isSameClass(String(target[classKey] ?? ''), session.className)) {
      return NextResponse.json({ success: false, message: 'You can only edit your class records.' }, { status: 403 });
    }

    const nextValues: Record<string, string> = {};
    columns.forEach((column) => {
      const requestedValue = body.data?.[column.key];
      nextValues[column.key] =
        typeof requestedValue === 'string' ? requestedValue.trim() : String(target[column.key] ?? '').trim();
    });

    if (!isAdmin && classKey) {
      nextValues[classKey] = session.className;
    }

    if (isAdmin && classKey && !String(nextValues[classKey] ?? '').trim()) {
      return NextResponse.json({ success: false, message: 'Class value is required for admin updates.' }, { status: 400 });
    }

    await saveGgssStipendRow(rowNumber, nextValues, columns);

    return NextResponse.json({
      success: true,
      message: 'Stipend record updated successfully.',
      record: {
        rowId: String(rowNumber),
        ...nextValues,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update stipend record.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error, session } = await requireSession();
    if (error || !session) {
      return error;
    }
    const isAdmin = isGgssStipendAdminUser(session.username);

    const body = (await request.json()) as { rowId?: string };
    const rowNumber = Number(body.rowId || 0);
    if (!rowNumber) {
      return NextResponse.json({ success: false, message: 'Valid rowId is required.' }, { status: 400 });
    }

    const { rows } = await getGgssStipendSheetRows();
    const { columns, records } = ggssStipendRowsToRecords(rows);
    const classKey = resolveClassKey(columns.map((column) => column.key));
    const target = records.find((record) => record.rowNumber === rowNumber);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Stipend record not found.' }, { status: 404 });
    }

    if (!isAdmin && classKey && !isSameClass(String(target[classKey] ?? ''), session.className)) {
      return NextResponse.json({ success: false, message: 'You can only delete your class records.' }, { status: 403 });
    }

    await deleteGgssStipendRow(rowNumber);
    return NextResponse.json({ success: true, message: 'Stipend record deleted successfully.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete stipend record.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
