import type { Metadata } from 'next';

import { buildFormMetadata } from '@/app/lib/govtFormMeta';

export const metadata: Metadata = buildFormMetadata('/govt-forms/pay03-payroll-amendment-multiple');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
