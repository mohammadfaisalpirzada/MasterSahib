import type { Metadata } from 'next';
import AdminSwipeBack from './AdminSwipeBack';

export const metadata: Metadata = {
  title: 'Admin Portal | GGSS Nishtar Road',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSwipeBack />
      {children}
    </>
  );
}
