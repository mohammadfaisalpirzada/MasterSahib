import { NextResponse } from 'next/server';

import { getGoogleSheetsClient } from '@/app/lib/googleSheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type NoticeItem = {
  id: number;
  date: string;
  tag: string;
  tagColor: string;
  title: string;
  desc: string;
};

type FacultyItem = {
  name: string;
  designation: string;
  subject: string;
  initials: string;
  bg: string;
  seniority: number;
  picture: string;
};

const tagColorMap: Record<string, string> = {
  exam: 'bg-red-100 text-red-700 border border-red-200',
  holiday: 'bg-purple-100 text-purple-700 border border-purple-200',
  schedule: 'bg-amber-100 text-amber-700 border border-amber-200',
  stipend: 'bg-green-100 text-green-700 border border-green-200',
  admission: 'bg-blue-100 text-blue-700 border border-blue-200',
  general: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const cardColors = ['#1a3a6b', '#2356a4', '#166534', '#7c2d12', '#713f12', '#3b0764', '#0c4a6e', '#831843'];

const extractSpreadsheetId = (raw: string) => {
  return raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || raw;
};

const resolveSpreadsheetId = () => {
  const raw = process.env.GGSS_STAFF_SPREADSHEET_ID?.trim() || process.env.GGSS_WEBSITE_SHEET_ID?.trim() || '';
  if (!raw) return '';
  return extractSpreadsheetId(raw);
};

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

const pick = (record: Record<string, string>, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = record[key];
    if (value && value.trim()) return value.trim();
  }
  return fallback;
};

const toInitials = (name: string) => {
  const parts = name
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (parts.length === 0) return 'ST';
  return parts.map(p => p[0] || '').join('').toUpperCase().slice(0, 4);
};

const parseSheetRows = (values: string[][]) => {
  if (!values?.length) return [] as Record<string, string>[];

  const headers = (values[0] || []).map((item) => normalizeHeader(String(item || '')));

  return values.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = String(row[index] || '').trim();
    });
    return record;
  });
};

const loadAnnouncements = async () => {
  const spreadsheetId = resolveSpreadsheetId();
  if (!spreadsheetId) return [] as NoticeItem[];
  const sheetName = process.env.GGSS_ANNOUNCEMENTS_SHEET_NAME?.trim() || 'Announcements 2026';
  const sheets = getGoogleSheetsClient();

  let rows: Record<string, string>[] = [];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName.replace(/'/g, "''")}'!A1:Z`,
    });
    rows = parseSheetRows((response.data.values as string[][]) || []);
  } catch {
    return [] as NoticeItem[];
  }

  const items: NoticeItem[] = rows
    .map((row, index) => {
      const title = pick(row, ['title', 'headline', 'news_title']);
      const desc = pick(row, ['desc', 'description', 'details', 'news_detail']);
      const tag = pick(row, ['tag', 'type', 'category'], 'General');
      const date = pick(row, ['date', 'published_date', 'created_at'], 'Latest update');
      const tagKey = tag.toLowerCase();

      if (!title) return null;

      return {
        id: index + 1,
        title,
        desc,
        date,
        tag,
        tagColor: tagColorMap[tagKey] || tagColorMap.general,
      };
    })
    .filter((item): item is NoticeItem => Boolean(item));

  return items;
};

const loadTeachers = async () => {
  const spreadsheetId = resolveSpreadsheetId();
  if (!spreadsheetId) return [] as FacultyItem[];
  const sheetName = process.env.GGSS_TEACHERS_SHEET_NAME?.trim() || 'Teachers 2026';
  const sheets = getGoogleSheetsClient();

  let rows: Record<string, string>[] = [];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName.replace(/'/g, "''")}'!A1:AZ`,
    });
    rows = parseSheetRows((response.data.values as string[][]) || []);
  } catch {
    return [] as FacultyItem[];
  }

  // Load pictures tab: columns [name, picture]
  const pictureMap: Record<string, string> = {};
  try {
    const picResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'pictures'!A1:B`,
    });
    const picValues = (picResponse.data.values as string[][]) || [];
    // skip header row
    for (let i = 1; i < picValues.length; i++) {
      const picName = (picValues[i][0] || '').trim().toLowerCase();
      const picData = (picValues[i][1] || '').trim();
      if (picName && picData) pictureMap[picName] = picData;
    }
  } catch {
    // pictures tab missing or inaccessible — continue without pictures
  }

  const teachers: FacultyItem[] = rows
    .map((row, index) => {
      const name = pick(row, ['name', 'teacher_name', 'full_name']);
      if (!name) return null;

      const designation = pick(row, ['designation', 'role', 'post'], 'Teacher');
      const subject = pick(row, ['subject', 'department', 'teaching_subject'], 'General');
      const seniorityRaw = pick(row, ['seniority', 'seniority_no', 'rank', 's_no', 'sno', 'serial_no'], String(index + 1));
      // picture: first check inline column, then pictures tab by name
      const inlinePic = pick(row, ['picture', 'image', 'photo', 'photo_url']);
      const picture = inlinePic || pictureMap[name.trim().toLowerCase()] || '';
      const seniority = Number.parseInt(seniorityRaw, 10);

      return {
        name,
        designation,
        subject,
        initials: toInitials(name),
        bg: cardColors[index % cardColors.length],
        seniority: Number.isNaN(seniority) ? index + 1 : seniority,
        picture,
      };
    })
    .filter((item): item is FacultyItem => Boolean(item))
    .sort((a, b) => a.seniority - b.seniority)
    .map((item, index) => ({ ...item, bg: cardColors[index % cardColors.length] }));

  return teachers;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || '').toLowerCase();

    if (type === 'announcements') {
      const items = await loadAnnouncements();
      return NextResponse.json({ success: true, items });
    }

    if (type === 'teachers') {
      const items = await loadTeachers();
      return NextResponse.json({ success: true, items });
    }

    return NextResponse.json(
      { success: false, message: "Query parameter 'type' is required: announcements | teachers" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      {
        success: true,
        items: [],
      },
      { status: 200 },
    );
  }
}
