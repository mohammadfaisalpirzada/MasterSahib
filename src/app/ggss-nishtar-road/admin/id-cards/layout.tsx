import { requireAdminPortalAccess } from '@/app/lib/adminPortalAccess';

export const dynamic = 'force-dynamic';

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPortalAccess('/ggss-nishtar-road/admin/id-cards');
  return <>{children}</>;
}
