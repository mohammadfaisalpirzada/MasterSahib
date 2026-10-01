import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { OWNER_EMAIL, getAllClientProjects, updateProjectConfig } from '@/lib/projects-view';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.email?.toLowerCase() === OWNER_EMAIL;

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = getAllClientProjects();
  return NextResponse.json({ success: true, projects });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.email?.toLowerCase() === OWNER_EMAIL;

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, accessKey, title, watermarkText } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const updated = updateProjectConfig(projectId, {
      ...(accessKey !== undefined ? { accessKey: String(accessKey).trim() } : {}),
      ...(title ? { title: String(title).trim() } : {}),
      ...(watermarkText ? { watermarkText: String(watermarkText).trim() } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update project' },
      { status: 500 }
    );
  }
}
