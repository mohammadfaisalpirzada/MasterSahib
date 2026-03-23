export type Role = 'admin' | 'teacher' | 'student';

const AUTH_STORAGE_KEY = 'mastersahib_auth';

export type AuthSession = {
  role: Role;
  source: 'peace-quiz';
  username?: string;
  programName?: string;
};

export const getAuthStorageKey = () => AUTH_STORAGE_KEY;

export const parseAuthSession = (value: string | null): AuthSession | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AuthSession>;
    if (
      (parsed.role === 'admin' || parsed.role === 'teacher' || parsed.role === 'student') &&
      parsed.source === 'peace-quiz'
    ) {
      return parsed as AuthSession;
    }
  } catch {
    return null;
  }

  return null;
};
