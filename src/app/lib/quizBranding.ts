export const QUIZ_PROGRAM_NAME_KEY = 'mastersahib_quiz_program_name';
export const DEFAULT_QUIZ_PROGRAM_NAME = 'Peace';
export const QUIZ_PROGRAM_NAME_UPDATED_EVENT = 'quiz-program-name-updated';

const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ').slice(0, 60);

export const getQuizProgramName = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_QUIZ_PROGRAM_NAME;
  }

  const saved = window.localStorage.getItem(QUIZ_PROGRAM_NAME_KEY);
  const normalized = normalizeName(saved ?? '');
  return normalized || DEFAULT_QUIZ_PROGRAM_NAME;
};

export const setQuizProgramName = (value: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalized = normalizeName(value);
  const finalName = normalized || DEFAULT_QUIZ_PROGRAM_NAME;
  window.localStorage.setItem(QUIZ_PROGRAM_NAME_KEY, finalName);
  window.dispatchEvent(new Event(QUIZ_PROGRAM_NAME_UPDATED_EVENT));
};
