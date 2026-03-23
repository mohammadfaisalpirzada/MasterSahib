import { NextResponse } from 'next/server';
import {
  appendQuizRowToSheet,
  getFirstColumnValuesFromTab,
  getQuizRowsFromSheet,
  getQuizSheetTabs,
} from '@/app/lib/googleSheets';
import { getQuizSheetConfigForProgram } from '@/app/lib/quizSheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLASS_TAB_KEYS = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']);
const PROGRESS_TAB_NAME = 'Progress';

const toSheetRange = (sheetName: string, columnRange = 'A:Z') => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'!${columnRange}`;
};

const normalizeClassTab = (value: string) => value.trim().toLowerCase().replace(/^class\s*/i, '');

const isClassTab = (value: string) => CLASS_TAB_KEYS.has(normalizeClassTab(value));

const toKey = (value: string, index: number) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base || `column_${index + 1}`;
};

const normalizeRows = (rows: string[][]) => {
  if (!rows.length) {
    return { headers: [], items: [] as Record<string, string>[] };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header, index) => toKey(String(header ?? ''), index));

  const items = dataRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim().length > 0))
    .map((row) => {
      const item: Record<string, string> = {};
      headers.forEach((key, index) => {
        item[key] = String(row[index] ?? '').trim();
      });
      return item;
    });

  return { headers, items };
};

type ProgressRecord = {
  submitted_at: string;
  username: string;
  program_name: string;
  class_level: string;
  subject: string;
  difficulty: string;
  mode: string;
  attempted: string;
  total: string;
  accuracy_percent: string;
  review_marked: string;
  elapsed_seconds: string;
  status: string;
};

const defaultProgressRecord: ProgressRecord = {
  submitted_at: '',
  username: '',
  program_name: '',
  class_level: '',
  subject: '',
  difficulty: '',
  mode: '',
  attempted: '0',
  total: '0',
  accuracy_percent: '0',
  review_marked: '0',
  elapsed_seconds: '0',
  status: '',
};

const parseProgressRows = (rows: string[][]) => {
  if (!rows.length) {
    return [] as ProgressRecord[];
  }

  const firstRowNormalized = rows[0].map((cell) => toKey(String(cell ?? ''), 0));
  const hasHeader = firstRowNormalized.includes('username') && firstRowNormalized.includes('submitted_at');

  if (hasHeader) {
    const { items } = normalizeRows(rows);
    return items.map((item) => ({
      ...defaultProgressRecord,
      ...item,
    }));
  }

  return rows.map((row) => ({
    submitted_at: String(row[0] ?? ''),
    username: String(row[1] ?? ''),
    program_name: String(row[2] ?? ''),
    class_level: String(row[3] ?? ''),
    subject: String(row[4] ?? ''),
    difficulty: String(row[5] ?? ''),
    mode: String(row[6] ?? ''),
    attempted: String(row[7] ?? '0'),
    total: String(row[8] ?? '0'),
    accuracy_percent: String(row[9] ?? '0'),
    review_marked: String(row[10] ?? '0'),
    elapsed_seconds: String(row[11] ?? '0'),
    status: String(row[12] ?? ''),
  }));
};

const toNum = (value: string) => Number(value || 0) || 0;

const computeDailyStreak = (dateStrings: string[]) => {
  if (!dateStrings.length) {
    return 0;
  }

  const uniqueDates = new Set(
    dateStrings
      .map((value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!uniqueDates.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getSubjectAccuracyMap = (records: ProgressRecord[]) => {
  const map = new Map<string, { total: number; count: number }>();

  records.forEach((record) => {
    const subject = record.subject.trim() || 'Unknown';
    const accuracy = toNum(record.accuracy_percent);
    const current = map.get(subject) || { total: 0, count: 0 };
    map.set(subject, {
      total: current.total + accuracy,
      count: current.count + 1,
    });
  });

  const scored = Array.from(map.entries()).map(([subject, values]) => ({
    subject,
    average: values.count ? values.total / values.count : 0,
  }));

  scored.sort((a, b) => b.average - a.average);
  return scored;
};

const getProgressSummary = (records: ProgressRecord[]) => {
  if (!records.length) {
    return {
      totalAttempts: 0,
      averageAccuracy: 0,
      dailyStreak: 0,
      lastAttemptScore: '0/0',
      lastAttemptDuration: '0 min',
      weakSubject: 'N/A',
      strongSubject: 'N/A',
      lastClassLevel: '-',
      weeklyAccuracies: [] as number[],
    };
  }

  const sorted = [...records].sort((left, right) => {
    const leftTime = new Date(left.submitted_at).getTime() || 0;
    const rightTime = new Date(right.submitted_at).getTime() || 0;
    return rightTime - leftTime;
  });

  const last = sorted[0];
  const averageAccuracy = Math.round(
    records.reduce((sum, record) => sum + toNum(record.accuracy_percent), 0) / records.length
  );
  const dailyStreak = computeDailyStreak(records.map((record) => record.submitted_at));
  const subjectScores = getSubjectAccuracyMap(records);
  const strongSubject = subjectScores[0]?.subject || 'N/A';
  const weakSubject = subjectScores[subjectScores.length - 1]?.subject || 'N/A';
  const weeklyAccuracies = sorted
    .slice(0, 7)
    .map((record) => Math.max(0, Math.min(100, Math.round(toNum(record.accuracy_percent)))))
    .reverse();

  return {
    totalAttempts: records.length,
    averageAccuracy,
    dailyStreak,
    lastAttemptScore: `${toNum(last.attempted)}/${toNum(last.total)}`,
    lastAttemptDuration: `${Math.max(1, Math.round(toNum(last.elapsed_seconds) / 60))} min`,
    weakSubject,
    strongSubject,
    lastClassLevel: last.class_level || '-',
    weeklyAccuracies,
  };
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const programName = url.searchParams.get('programName') || '';
    const mode = (url.searchParams.get('mode') || 'questions').toLowerCase();
    const classLevel = url.searchParams.get('classLevel') || '';
    const username = url.searchParams.get('username') || '';

    const sheetConfig = getQuizSheetConfigForProgram(programName);

    if (!sheetConfig && !process.env.GOOGLE_QUIZ_SPREADSHEET_ID) {
      throw new Error(`No secure sheet mapping found for ${programName || 'this school'}. Add it in src/app/lib/quizSheets.ts.`);
    }

    if (mode === 'classes') {
      const classes = await getQuizSheetTabs({
        spreadsheetId: sheetConfig?.spreadsheetId,
      });

      return NextResponse.json({
        success: true,
        classes: classes.filter(isClassTab),
      });
    }

    if (mode === 'subjects') {
      if (!classLevel) {
        throw new Error('Missing classLevel for subjects mode.');
      }

      const firstColumnValues = await getFirstColumnValuesFromTab(classLevel, {
        spreadsheetId: sheetConfig?.spreadsheetId,
      });

      const normalizedSubjects = Array.from(
        new Set(
          firstColumnValues.filter((value) => {
            const normalized = value.trim().toLowerCase();
            return normalized !== 'subject' && normalized !== 'subjects';
          })
        )
      );

      return NextResponse.json({
        success: true,
        subjects: normalizedSubjects,
      });
    }

    if (mode === 'student-summary') {
      if (!username) {
        throw new Error('Missing username for student-summary mode.');
      }

      const rows = await getQuizRowsFromSheet({
        spreadsheetId: sheetConfig?.spreadsheetId,
        range: toSheetRange(PROGRESS_TAB_NAME),
      });

      const allRecords = parseProgressRows(rows as string[][]);
      const userRecords = allRecords.filter((record) => {
        const sameUser = record.username.trim().toLowerCase() === username.trim().toLowerCase();
        const sameProgram = !programName || record.program_name.trim().toLowerCase() === programName.trim().toLowerCase();
        return sameUser && sameProgram;
      });

      return NextResponse.json({
        success: true,
        summary: getProgressSummary(userRecords),
      });
    }

    if (mode === 'student-history') {
      if (!username) {
        throw new Error('Missing username for student-history mode.');
      }

      const rows = await getQuizRowsFromSheet({
        spreadsheetId: sheetConfig?.spreadsheetId,
        range: toSheetRange(PROGRESS_TAB_NAME),
      });

      const allRecords = parseProgressRows(rows as string[][]);
      const userRecords = allRecords
        .filter((record) => {
          const sameUser = record.username.trim().toLowerCase() === username.trim().toLowerCase();
          const sameProgram = !programName || record.program_name.trim().toLowerCase() === programName.trim().toLowerCase();
          return sameUser && sameProgram && record.submitted_at;
        })
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

      return NextResponse.json({
        success: true,
        records: userRecords,
      });
    }

    const rows = await getQuizRowsFromSheet({
      spreadsheetId: sheetConfig?.spreadsheetId,
      range: classLevel ? toSheetRange(classLevel) : sheetConfig?.range,
    });
    const normalized = normalizeRows(rows as string[][]);

    return NextResponse.json({
      success: true,
      totalRows: normalized.items.length,
      headers: normalized.headers,
      items: normalized.items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch quiz questions.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      programName?: string;
      username?: string;
      classLevel?: string;
      subject?: string;
      difficulty?: string;
      mode?: string;
      attempted?: number;
      total?: number;
      reviewMarked?: number;
      elapsedSeconds?: number;
      submittedAt?: string;
      status?: string;
    };

    const programName = body.programName || '';
    const username = (body.username || '').trim();
    if (!username) {
      throw new Error('username is required for saving progress.');
    }

    const sheetConfig = getQuizSheetConfigForProgram(programName);
    if (!sheetConfig && !process.env.GOOGLE_QUIZ_SPREADSHEET_ID) {
      throw new Error(`No secure sheet mapping found for ${programName || 'this school'}. Add it in src/app/lib/quizSheets.ts.`);
    }

    const attempted = Math.max(0, Number(body.attempted ?? 0) || 0);
    const total = Math.max(0, Number(body.total ?? 0) || 0);
    const accuracy = total > 0 ? Math.round((attempted / total) * 100) : 0;

    await appendQuizRowToSheet({
      spreadsheetId: sheetConfig?.spreadsheetId,
      range: toSheetRange(PROGRESS_TAB_NAME),
      values: [
        body.submittedAt || new Date().toISOString(),
        username,
        programName,
        body.classLevel || '',
        body.subject || '',
        body.difficulty || '',
        body.mode || 'Practice',
        String(attempted),
        String(total),
        String(accuracy),
        String(Math.max(0, Number(body.reviewMarked ?? 0) || 0)),
        String(Math.max(0, Number(body.elapsedSeconds ?? 0) || 0)),
        body.status || 'submitted',
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Progress saved to Google Sheet.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save student progress.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
