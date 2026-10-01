import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { OWNER_EMAIL, getAllClientProjects } from '@/lib/projects-view';
import ClientProjectsDashboard from './ClientProjectsDashboard';

export const metadata: Metadata = {
  title: 'Client Projects Dashboard | Master Sahib',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ClientProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/client-projects');
  }

  if (session.user?.email?.toLowerCase() !== OWNER_EMAIL) {
    redirect('/');
  }

  const projectsRecord = getAllClientProjects();
  const projects = Object.values(projectsRecord);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
            Owner Private Space
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
          Client Projects Space
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sync, manage access keys, and share watermarked deliverable previews with clients before final handover.
        </p>

        <div className="mt-8">
          <ClientProjectsDashboard initialProjects={projects} />
        </div>
      </div>
    </main>
  );
}
