import 'server-only';

import {
  getGoogleSheetsClient,
  ensureSheetTabExists,
  appendQuizRowToSheet,
  updateQuizRowInSheet,
} from '@/app/lib/googleSheets';

const TAB = process.env.NOTEBOOKLM_FEEDBACK_SHEET_TAB?.trim() || 'NotebookLM Feedback';
const HEADER = ['Name', 'Email', 'Before Score', 'Before Time', 'After Score', 'After Time'];

const spreadsheetId = () => {
  const value = process.env.NOTEBOOKLM_FEEDBACK_SPREADSHEET_ID?.trim()
    || process.env.GOOGLE_QUIZ_SPREADSHEET_ID?.trim();
  if (!value) throw new Error('NotebookLM feedback storage is not configured.');
  return value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || value;
};

export type NotebookLmFeedbackSubmission = {
  name: string;
  email: string;
  score: number;
  total: number;
  timestamp: string;
};

export type NotebookLmFeedbackResult =
  | { mode: 'before'; score: number; total: number }
  | { mode: 'after'; score: number; total: number; previousScore: number };

export async function submitNotebookLmFeedback(
  payload: NotebookLmFeedbackSubmission,
): Promise<NotebookLmFeedbackResult> {
  const id = spreadsheetId();
  await ensureSheetTabExists(TAB, HEADER, { spreadsheetId: id });

  const sheets = getGoogleSheetsClient();
  const range = `'${TAB}'!A:F`;
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: id, range });
  const rows = response.data.values ?? [];

  const normalizedEmail = payload.email.trim().toLowerCase();

  // rows[0] is the header; email lives in column B (index 1).
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i]?.[1] ?? '').trim().toLowerCase() === normalizedEmail) {
      rowIndex = i + 1; // 1-based sheet row number
      break;
    }
  }

  if (rowIndex === -1) {
    // First submission for this email -> append a new "before" row.
    await appendQuizRowToSheet({
      spreadsheetId: id,
      range,
      values: [
        payload.name,
        payload.email,
        String(payload.score),
        payload.timestamp,
        '',
        '',
      ],
    });
    return { mode: 'before', score: payload.score, total: payload.total };
  }

  const existingRow = rows[rowIndex - 1] ?? [];
  const existingAfter = String(existingRow[4] ?? '').trim();
  const previousScore = Number(existingRow[2] ?? 0);

  if (existingAfter === '') {
    // Second submission -> fill in the "after" columns on the same row.
    await updateQuizRowInSheet({
      spreadsheetId: id,
      range: `'${TAB}'!E${rowIndex}:F${rowIndex}`,
      values: [String(payload.score), payload.timestamp],
    });
    return { mode: 'after', score: payload.score, total: payload.total, previousScore };
  }

  // Third+ submission -> report the existing after-score without overwriting it.
  return {
    mode: 'after',
    score: Number(existingAfter) || 0,
    total: payload.total,
    previousScore,
  };
}
