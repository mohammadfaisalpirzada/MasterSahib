export type Role = 'admin' | 'teacher' | 'student';

export type AuthSession = {
  role: Role;
  source: 'peace-quiz';
  username: string;
  programName: string;
};

export const roleRouteMap: Record<Role, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/peace-quiz/student',
};

type AuthSessionApiResponse = {
  success: boolean;
  session: AuthSession | null;
};

export const fetchAuthSession = async (): Promise<AuthSession | null> => {
  try {
    const response = await fetch('/api/peace-quiz/auth/session', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthSessionApiResponse;
    if (!data.success) {
      return null;
    }

    if (!data.session) {
      return null;
    }

    const { role, source, username, programName } = data.session;
    if (!role || source !== 'peace-quiz' || !username || !programName) {
      return null;
    }

    return data.session;
  } catch {
    return null;
  }
};
