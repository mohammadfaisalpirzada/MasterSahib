import 'server-only';

import { appendQuizRowToSheet, ensureSheetTabExists } from '@/app/lib/googleSheets';

const CONTACT_MESSAGES_TAB = process.env.CONTACT_MESSAGES_SHEET_TAB?.trim() || 'Contact Messages';

const requiredContactSheetEnv = () => {
  const explicit = process.env.CONTACT_MESSAGES_SPREADSHEET_ID?.trim();
  if (explicit) return explicit;

  throw new Error('Missing CONTACT_MESSAGES_SPREADSHEET_ID. Set it to the dedicated "themastersahib" Google Sheet URL/ID.');
};

const normalizeSpreadsheetId = (input: string) => {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || input;
};

export type ContactMessagePayload = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export const saveContactMessage = async (payload: ContactMessagePayload) => {
  const spreadsheetId = normalizeSpreadsheetId(requiredContactSheetEnv());

  await ensureSheetTabExists(
    CONTACT_MESSAGES_TAB,
    ['timestamp', 'name', 'phone', 'email', 'message', 'source'],
    { spreadsheetId }
  );

  await appendQuizRowToSheet({
    spreadsheetId,
    range: `'${CONTACT_MESSAGES_TAB}'!A:F`,
    values: [
      new Date().toISOString(),
      payload.name,
      payload.phone,
      payload.email,
      payload.message,
      'website-contact-form',
    ],
  });
};
