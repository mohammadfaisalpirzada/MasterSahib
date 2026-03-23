import { Role } from './auth';

export type QuizRoleCredentials = Record<
  Role,
  {
    username: string;
    password: string;
  }
>;

const normalizeProgramKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

// Keep school-wise login setup here.
// Add a new school by adding another object key like "peerzada academy".
export const quizAccountsByProgram: Record<string, QuizRoleCredentials> = {
  peace: {
    admin: { username: 'admin01', password: 'admin123' },
    teacher: { username: 'teacher01', password: 'teacher123' },
    student: { username: 'Ahil', password: 'ahil123' },
  },
  'dawood public school': {
    admin: { username: 'admin01', password: 'admin123' },
    teacher: { username: 'teacher01', password: 'teacher123' },
    student: { username: 'student01', password: 'student123' },
  },
  'peerzada academy': {
    admin: { username: 'peerzada-admin', password: 'admin123' },
    teacher: { username: 'peerzada-teacher', password: 'teacher123' },
    student: { username: 'Ahil', password: 'ahil433' },
  },
};

export const getQuizCredentialsForProgram = (programName: string) => {
  return quizAccountsByProgram[normalizeProgramKey(programName)] || null;
};
