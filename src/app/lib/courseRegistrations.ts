import 'server-only';

import { appendQuizRowToSheet, ensureSheetTabExists } from '@/app/lib/googleSheets';

const TAB = process.env.COURSE_REGISTRATIONS_SHEET_TAB?.trim() || 'Course Registrations';

const spreadsheetId = () => {
  const value = process.env.COURSE_REGISTRATIONS_SPREADSHEET_ID?.trim()
    || process.env.CONTACT_MESSAGES_SPREADSHEET_ID?.trim();
  if (!value) throw new Error('Course registration storage is not configured.');
  return value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || value;
};

export type CourseRegistration = {
  name: string;
  email: string;
  phone: string;
  city: string;
  experience: string;
  courseId: string;
};

export async function saveCourseRegistration(payload: CourseRegistration) {
  const id = spreadsheetId();
  await ensureSheetTabExists(
    TAB,
    ['timestamp', 'course_id', 'name', 'email', 'phone', 'city', 'experience', 'status'],
    { spreadsheetId: id },
  );
  await appendQuizRowToSheet({
    spreadsheetId: id,
    range: `'${TAB}'!A:H`,
    values: [
      new Date().toISOString(), payload.courseId, payload.name, payload.email,
      payload.phone, payload.city, payload.experience, 'new',
    ],
  });
}
