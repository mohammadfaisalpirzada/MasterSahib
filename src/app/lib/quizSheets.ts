import 'server-only';

type QuizSheetConfig = {
  spreadsheetId: string;
  range?: string;
};

const normalizeProgramKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

// Server-only Google Sheet mapping.
// Add school names here and keep spreadsheet IDs off the client.
const quizSheetConfigs: Record<string, QuizSheetConfig> = {
  peace: {
    spreadsheetId: '1OUytM2WNjTESUiBCGTG8LYX9j63ervF-qh9MbyQYTMk',
    range: 'A:Z',
  },
  'peace international school': {
    spreadsheetId: '1OUytM2WNjTESUiBCGTG8LYX9j63ervF-qh9MbyQYTMk',
    range: 'A:Z',
  },
};

export const getQuizSheetConfigForProgram = (programName: string) => {
  return quizSheetConfigs[normalizeProgramKey(programName)] || null;
};
