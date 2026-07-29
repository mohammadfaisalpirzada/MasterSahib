import { cookies } from 'next/headers';

export async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('district_east_admin')?.value;
  return Boolean(token && process.env.ADMIN_SESSION_TOKEN && token === process.env.ADMIN_SESSION_TOKEN);
}
