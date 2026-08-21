import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { getDrivePresentations } from '@/lib/google-drive-presentations';
import PresentationLibrary from './PresentationLibrary';

export const metadata: Metadata = { title: 'My Presentations', robots: { index: false, follow: false } };

const OWNER_EMAIL = 'mohammadfaisalpirzada@gmail.com';
export const dynamic = 'force-dynamic';

export default async function MyPresentationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin?callbackUrl=/my-presentations');
  if (session.user?.email?.toLowerCase() !== OWNER_EMAIL) redirect('/');
  const presentations = await getDrivePresentations();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Private space</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">My Presentations</h1>
        <div className="mt-8">
          <PresentationLibrary presentations={presentations} driveConnected={Boolean((session as typeof session & { googleDriveAccessToken?: string }).googleDriveAccessToken)} />
        </div>
      </div>
    </main>
  );
}
