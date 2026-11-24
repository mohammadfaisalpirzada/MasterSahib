import AdminDashboardClient from './AdminDashboardClient';
import { requireAdminPortalAccess } from '@/app/lib/adminPortalAccess';

export const dynamic = 'force-dynamic';

export default async function GgssAdminPage() {
  await requireAdminPortalAccess('/ggss-nishtar-road/admin');
  return <AdminDashboardClient />;
}
