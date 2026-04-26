import 'server-only';

import {
  appendQuizRowToSheet,
  ensureSheetTabExists,
  getQuizRowsFromSheet,
} from '@/app/lib/googleSheets';

export type PadletIdea = {
  id: string;
  author: string;
  idea: string;
  createdAt: string;
  styleIndex: number;
};

const PADLET_TAB = process.env.PADLET_SHEET_TAB?.trim() || 'Padlet';

const defaultIdeas: PadletIdea[] = [
  {
    id: 'seed-1',
    author: 'Areeba (Class 8)',
    idea: 'Add a daily 10-question revision quiz with instant feedback.',
    createdAt: '2026-03-29T08:30:00.000Z',
    styleIndex: 0,
  },
  {
    id: 'seed-2',
    author: 'Sir Hamza',
    idea: 'Create a quick attendance summary tool for weekly parent updates.',
    createdAt: '2026-03-29T09:10:00.000Z',
    styleIndex: 1,
  },
  {
    id: 'seed-3',
    author: 'Student Council',
    idea: 'Add a shared notice pin area for events, tests, and deadlines.',
    createdAt: '2026-03-29T09:45:00.000Z',
    styleIndex: 2,
  },
  {
    id: 'seed-4',
    author: 'Hina (Class 9)',
    idea: 'Create a homework checklist wall where students mark completed tasks daily.',
    createdAt: '2026-03-29T10:05:00.000Z',
    styleIndex: 3,
  },
  {
    id: 'seed-5',
    author: 'Science Club',
    idea: 'Post one low-cost science experiment idea every Friday with material list.',
    createdAt: '2026-03-29T10:20:00.000Z',
    styleIndex: 0,
  },
  {
    id: 'seed-6',
    author: 'Bilal (Class 10)',
    idea: 'Add a peer tutoring request board for Math, English, and Science.',
    createdAt: '2026-03-29T10:35:00.000Z',
    styleIndex: 1,
  },
  {
    id: 'seed-7',
    author: 'Urdu Department',
    idea: 'Share weekly vocabulary challenge with top 3 student submissions.',
    createdAt: '2026-03-29T10:50:00.000Z',
    styleIndex: 2,
  },
  {
    id: 'seed-8',
    author: 'Farwa (Class 7)',
    idea: 'Add a reading corner recommendation list with short student reviews.',
    createdAt: '2026-03-29T11:05:00.000Z',
    styleIndex: 3,
  },
  {
    id: 'seed-9',
    author: 'Computer Lab Team',
    idea: 'Create a digital safety tip of the week section in simple Urdu and English.',
    createdAt: '2026-03-29T11:20:00.000Z',
    styleIndex: 0,
  },
  {
    id: 'seed-10',
    author: 'Asma (Class 8)',
    idea: 'Start a lost and found updates board with classroom location tags.',
    createdAt: '2026-03-29T11:35:00.000Z',
    styleIndex: 1,
  },
  {
    id: 'seed-11',
    author: 'Sports Committee',
    idea: 'Publish practice schedules and team selection notices in one pinned thread.',
    createdAt: '2026-03-29T11:50:00.000Z',
    styleIndex: 2,
  },
  {
    id: 'seed-12',
    author: 'Nimra (Class 6)',
    idea: 'Add a clean classroom challenge scoreboard between sections.',
    createdAt: '2026-03-29T12:05:00.000Z',
    styleIndex: 3,
  },
  {
    id: 'seed-13',
    author: 'Art Teacher',
    idea: 'Showcase one student artwork every week with a short inspiration note.',
    createdAt: '2026-03-29T12:20:00.000Z',
    styleIndex: 0,
  },
  {
    id: 'seed-14',
    author: 'Sara (Class 9)',
    idea: 'Collect career questions from students and answer 5 each Monday.',
    createdAt: '2026-03-29T12:35:00.000Z',
    styleIndex: 1,
  },
  {
    id: 'seed-15',
    author: 'Library Volunteer Team',
    idea: 'Post monthly borrowed books highlights to encourage reading habits.',
    createdAt: '2026-03-29T12:50:00.000Z',
    styleIndex: 2,
  },
];

const normalizeSpreadsheetId = (input: string) => {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || input;
};

const resolvePadletSpreadsheetId = () => {
  const explicit = process.env.PADLET_SPREADSHEET_ID?.trim();
  if (explicit) {
    return normalizeSpreadsheetId(explicit);
  }

  const fallback = process.env.CONTACT_MESSAGES_SPREADSHEET_ID?.trim();
  if (fallback) {
    return normalizeSpreadsheetId(fallback);
  }

  throw new Error('Missing PADLET_SPREADSHEET_ID (or CONTACT_MESSAGES_SPREADSHEET_ID fallback).');
};

const parseStyleIndex = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
};

const toPadletRows = (rows: string[][]): PadletIdea[] => {
  if (rows.length <= 1) {
    return [];
  }

  return rows
    .slice(1)
    .filter((row) => String(row[3] ?? '').trim())
    .map((row) => ({
      id: String(row[0] ?? '').trim(),
      createdAt: String(row[1] ?? '').trim(),
      author: String(row[2] ?? '').trim() || 'Anonymous',
      idea: String(row[3] ?? '').trim(),
      styleIndex: parseStyleIndex(String(row[4] ?? '0')),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const ensurePadletTabAndSeed = async () => {
  const spreadsheetId = resolvePadletSpreadsheetId();

  await ensureSheetTabExists(
    PADLET_TAB,
    ['id', 'timestamp', 'author', 'idea', 'style_index'],
    { spreadsheetId }
  );

  const rows = (await getQuizRowsFromSheet({
    spreadsheetId,
    range: `'${PADLET_TAB}'!A:E`,
  })) as string[][];

  if (rows.length <= 1) {
    for (const idea of defaultIdeas) {
      await appendQuizRowToSheet({
        spreadsheetId,
        range: `'${PADLET_TAB}'!A:E`,
        values: [idea.id, idea.createdAt, idea.author, idea.idea, String(idea.styleIndex)],
      });
    }

    return defaultIdeas;
  }

  return toPadletRows(rows);
};

export const getPadletIdeas = async () => {
  return ensurePadletTabAndSeed();
};

export const addPadletIdea = async (payload: { author: string; idea: string }) => {
  const spreadsheetId = resolvePadletSpreadsheetId();
  const existing = await ensurePadletTabAndSeed();

  const next: PadletIdea = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    author: payload.author.trim() || 'Anonymous',
    idea: payload.idea.trim(),
    styleIndex: existing.length % 4,
  };

  await appendQuizRowToSheet({
    spreadsheetId,
    range: `'${PADLET_TAB}'!A:E`,
    values: [next.id, next.createdAt, next.author, next.idea, String(next.styleIndex)],
  });

  return next;
};
