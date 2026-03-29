import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  STAFF_ADMIN_SESSION_COOKIE,
  verifyStaffAdminPassword,
  verifyStaffAdminSessionToken,
} from '@/app/lib/staffAdminAuth';
import {
  addSheetColumn,
  addStaffRow,
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
      updatesList?: Array<{
        rowId?: string;
        updates?: Record<string, string>;
      }>;
    };

    const passwordValidation = validateAdminPassword(body.password);
    if (passwordValidation.error) {
      return passwordValidation.error;
    }

    const { rows } = await getStaffSheetRows();
    const { columns, records } = rowsToRecords(rows);

    if (Array.isArray(body.updatesList)) {
      if (body.updatesList.length === 0) {
        return NextResponse.json({ success: false, message: 'updatesList cannot be empty.' }, { status: 400 });
      }

      const updatedRecords: Array<Record<string, string>> = [];

      for (const item of body.updatesList) {
        const rowNumber = Number(item.rowId || 0);
        if (!rowNumber) {
          return NextResponse.json({ success: false, message: 'Each batch item must include a valid rowId.' }, { status: 400 });
        }

        const target = records.find((record) => record.rowNumber === rowNumber);
        if (!target) {
          return NextResponse.json({ success: false, message: `Staff record not found for rowId ${rowNumber}.` }, { status: 404 });
        }

        const nextRecord: Record<string, string> = {};
        columns.forEach((column) => {
          const requestedValue = item.updates?.[column.key];
          nextRecord[column.key] =
            typeof requestedValue === 'string' ? requestedValue.trim() : String(target[column.key] || '');
        });

        await saveStaffRow(rowNumber, nextRecord, columns);
        updatedRecords.push({ rowId: String(rowNumber), ...toFullRecord({ rowNumber, ...nextRecord }, columns) });
      }

      return NextResponse.json({
        success: true,
        message: `${updatedRecords.length} staff record(s) updated successfully.`,
        records: updatedRecords,
      });
    }

    const rowNumber = Number(body.rowId || 0);
    if (!rowNumber) {
      return NextResponse.json({ success: false, message: 'Valid rowId is required.' }, { status: 400 });
    }

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

export async function POST(request: Request) {
  try {
    const sessionError = await requireAdminSession();
    if (sessionError) {
      return sessionError;
    }

    const body = (await request.json()) as {
      password?: string;
      data?: Record<string, string>;
      newColumns?: Array<{ label: string; value: string }>;
    };

    const passwordValidation = validateAdminPassword(body.password);
    if (passwordValidation.error) {
      return passwordValidation.error;
    }

    const { rows } = await getStaffSheetRows();
    const { columns } = rowsToRecords(rows);
    if (!columns.length) {
      return NextResponse.json({ success: false, message: 'Sheet header is missing. Cannot add a new row.' }, { status: 400 });
    }

    const nameColumn = columns.find((column) => {
      return column.key.toLowerCase() === 'name' || column.label.trim().toLowerCase() === 'name';
    });

    const nextValues: Record<string, string> = {};
    columns.forEach((column) => {
      const requestedValue = body.data?.[column.key];
      const allowInput = column.editable || column.key.toLowerCase() === 'name' || column.label.trim().toLowerCase() === 'name';
      nextValues[column.key] = allowInput && typeof requestedValue === 'string' ? requestedValue.trim() : '';
    });

    if (nameColumn && !String(nextValues[nameColumn.key] ?? '').trim()) {
      return NextResponse.json({ success: false, message: 'Name is required to add a new staff record.' }, { status: 400 });
    }

    // Validate new column labels — each must be a non-empty string.
    const sanitizedNewColumns = (body.newColumns ?? [])
      .filter((col) => typeof col.label === 'string' && col.label.trim())
      .map((col) => ({ label: col.label.trim(), value: String(col.value ?? '').trim() }));

    await addStaffRow(nextValues, columns, sanitizedNewColumns.length ? sanitizedNewColumns : undefined);

    return NextResponse.json({
      success: true,
      message: 'New staff record added successfully.',
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to add new GGSS staff record.');
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

export async function PUT(request: Request) {
  try {
    const sessionError = await requireAdminSession();
    if (sessionError) {
      return sessionError;
    }

    const body = (await request.json()) as {
      password?: string;
      columnLabel?: string;
    };

    const passwordValidation = validateAdminPassword(body.password);
    if (passwordValidation.error) {
      return passwordValidation.error;
    }

    const columnLabel = String(body.columnLabel ?? '').trim();
    if (!columnLabel) {
      return NextResponse.json({ success: false, message: 'Column name is required.' }, { status: 400 });
    }

    // Reject if a column with the same label already exists.
    const { rows } = await getStaffSheetRows();
    const { columns } = rowsToRecords(rows);
    const duplicate = columns.find(
      (col) => col.label.trim().toLowerCase() === columnLabel.toLowerCase(),
    );
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: `A column named "${duplicate.label}" already exists.` },
        { status: 409 },
      );
    }

    const result = await addSheetColumn(columnLabel);

    return NextResponse.json({
      success: true,
      message: `Column "${result.columnLabel}" added successfully.`,
      columnLabel: result.columnLabel,
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to add new column to GGSS staff sheet.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
