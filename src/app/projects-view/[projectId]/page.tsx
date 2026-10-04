import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientProject } from '@/lib/projects-view';
import ClientProjectViewer from './ClientProjectViewer';

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ key?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = getClientProject(projectId);

  if (!project) {
    return {
      title: 'Project Preview Not Found | The Master Sahib',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${project.title} — Protected Client Preview`,
    description: `Private client review portal for ${project.clientName}. Hosted securely by The Master Sahib.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function ProjectPreviewPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const { key } = await searchParams;

  const project = getClientProject(projectId);

  if (!project) {
    notFound();
  }

  return <ClientProjectViewer project={project} initialKey={key} />;
}
