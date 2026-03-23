'use client';

import { useRouter } from 'next/navigation';
import { getAuthStorageKey } from '../lib/auth';

type RoleLogoutButtonProps = {
  redirectTo?: string;
  className?: string;
};

export default function RoleLogoutButton({
  redirectTo = '/peace-quiz',
  className = '',
}: RoleLogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(getAuthStorageKey());
    router.push(redirectTo);
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 ${className}`.trim()}
    >
      Logout
    </button>
  );
}
