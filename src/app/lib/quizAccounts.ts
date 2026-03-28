import { Role } from './auth';

export type QuizCredential = {
  username: string;
  password: string;
};

export type QuizRoleCredentials = Record<Role, QuizCredential[]>;

const normalizeProgramKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

// Keep school-wise login setup here.
// Add a new school by adding another object key like "peerzada academy".
// Students are managed via Google Sheets 'Users' tab — add/remove/reset from there.
// Only admin and teacher credentials stay here.
export const quizAccountsByProgram: Record<string, QuizRoleCredentials> = {
  peace: {
    admin: [{ username: 'admin01', password: 'admin123' }],
    teacher: [{ username: 'teacher01', password: 'teacher123' }],
    student: [],
  },
  'dawood public school': {
    admin: [{ username: 'admin01', password: 'admin123' }],
    teacher: [{ username: 'teacher01', password: 'teacher123' }],
    student: [],
  },
  'peerzada academy': {
    admin: [{ username: 'peerzada-admin', password: 'admin123' }],
    teacher: [{ username: 'peerzada-teacher', password: 'teacher123' }],
    student: [],
  },
};

export const getQuizCredentialsForProgram = (programName: string) => {
  return quizAccountsByProgram[normalizeProgramKey(programName)] || null;
};
