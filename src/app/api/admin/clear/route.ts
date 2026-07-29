import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { clearAllTeachers, ensureSheetExists } from '@/lib/district-east-sheets';

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureSheetExists();
    await clearAllTeachers();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
