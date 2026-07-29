import { isAdmin } from '@/lib/admin';
import { getTeachersCsvRows } from '@/lib/district-east-sheets';

const q = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;

export async function GET() {
  if (!(await isAdmin())) return new Response('Unauthorized', { status: 401 });

  try {
    const { headers, rows } = await getTeachersCsvRows();
    const body = [headers, ...rows]
      .map(r => r.map(q).join(','))
      .join('\n');

    return new Response('\ufeff' + body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="district-east-teachers.csv"',
      },
    });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : 'Export failed', { status: 500 });
  }
}
