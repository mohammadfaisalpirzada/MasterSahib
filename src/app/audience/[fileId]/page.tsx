import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDriveClient } from '@/lib/google-drive-presentations';
import AudiencePdfViewer from './AudiencePdfViewer';

export const metadata: Metadata = { title: 'Audience Presentation', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AudiencePage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/audience/${fileId}`)}`);
  let title = 'Audience Presentation';
  try {
    const file = await getDriveClient().files.get({ fileId, fields: 'name,appProperties' });
    title = file.data.name?.replace(/\.pdf$/i, '') || title;
  } catch { /* The PIN screen intentionally reveals no Drive details on access failure. */ }
  return <AudiencePdfViewer fileId={fileId} title={title} />;
}
