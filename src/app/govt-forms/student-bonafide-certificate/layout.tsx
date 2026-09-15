import type { Metadata } from 'next';

import { buildFormMetadata } from '@/app/lib/govtFormMeta';

export const metadata: Metadata = buildFormMetadata('/govt-forms/student-bonafide-certificate');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
