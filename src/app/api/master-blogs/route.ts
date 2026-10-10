import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import {
  getAllBlogPosts,
  getMetadataStore,
  saveMetadataStore,
  isMasterAdminEmail,
} from '@/lib/master-blogs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = isMasterAdminEmail(session?.user?.email);
    const posts = getAllBlogPosts(isAdmin);

    return NextResponse.json({
      posts,
      isAdmin,
      userEmail: session?.user?.email ?? null,
    });
  } catch (error) {
    console.error('API Error in GET /api/master-blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs', posts: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!isMasterAdminEmail(userEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized: Master Admin privileges required.' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // Handling Multipart Form Data Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File | null;
      const title = (formData.get('title') as string) || 'Master Sahib Update';
      const category = (formData.get('category') as string) || 'Educational Update';
      const content = (formData.get('content') as string) || '';
      const author = (formData.get('author') as string) || 'The Master Sahib';
      const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];

      if (!imageFile && !content.trim()) {
        return NextResponse.json(
          { error: 'Please provide either a poster image or blog text.' },
          { status: 400 }
        );
      }

      const blogsDir = path.join(process.cwd(), 'public', 'master_blogs');
      if (!fs.existsSync(blogsDir)) {
        fs.mkdirSync(blogsDir, { recursive: true });
      }

      // Generate clean filename
      const safeSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || `post-${Date.now()}`;

      const timestamp = Date.now();
      const baseFilename = `${timestamp}-${safeSlug}`;

      // Save Image if present
      let imageFilename = '';
      if (imageFile) {
        const ext = path.extname(imageFile.name) || '.jpg';
        imageFilename = `${baseFilename}${ext}`;
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        fs.writeFileSync(path.join(blogsDir, imageFilename), buffer);
      }

      // Save Text File with First Line as Title
      const textFilename = `${baseFilename}.txt`;
      const textFileContent = `${title.trim()}\nCategory: ${category}\nDate: ${date}\nAuthor: ${author}\n---\n${content.trim()}`;
      fs.writeFileSync(path.join(blogsDir, textFilename), textFileContent, 'utf-8');

      return NextResponse.json({
        success: true,
        message: 'Blog & Poster published successfully!',
        post: getAllBlogPosts(true).find((p) => p.filename.startsWith(baseFilename)),
      });
    }

    // Handling JSON Action Requests (Hide, Pin, Reorder, Delete)
    const body = await request.json();
    const { action, postId, order } = body;
    const metadata = getMetadataStore();

    if (action === 'toggle-visibility' && postId) {
      if (metadata.hiddenIds.includes(postId)) {
        metadata.hiddenIds = metadata.hiddenIds.filter((id) => id !== postId);
      } else {
        metadata.hiddenIds.push(postId);
      }
      saveMetadataStore(metadata);
      return NextResponse.json({ success: true, metadata });
    }

    if (action === 'toggle-pin' && postId) {
      if (metadata.pinnedIds.includes(postId)) {
        metadata.pinnedIds = metadata.pinnedIds.filter((id) => id !== postId);
      } else {
        metadata.pinnedIds.push(postId);
      }
      saveMetadataStore(metadata);
      return NextResponse.json({ success: true, metadata });
    }

    if (action === 'reorder' && Array.isArray(order)) {
      metadata.customOrder = order;
      saveMetadataStore(metadata);
      return NextResponse.json({ success: true, metadata });
    }

    if (action === 'delete' && postId) {
      const blogsDir = path.join(process.cwd(), 'public', 'master_blogs');
      if (fs.existsSync(blogsDir)) {
        const files = fs.readdirSync(blogsDir);
        files.forEach((file) => {
          const baseName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          if (baseName === postId || file.includes(postId)) {
            try {
              fs.unlinkSync(path.join(blogsDir, file));
            } catch (err) {
              console.error(`Error deleting file ${file}:`, err);
            }
          }
        });
      }
      // Also clean from metadata
      metadata.hiddenIds = metadata.hiddenIds.filter((id) => id !== postId);
      metadata.pinnedIds = metadata.pinnedIds.filter((id) => id !== postId);
      metadata.customOrder = metadata.customOrder.filter((id) => id !== postId);
      saveMetadataStore(metadata);

      return NextResponse.json({ success: true, message: 'Post deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (error) {
    console.error('API Error in POST /api/master-blogs:', error);
    return NextResponse.json({ error: 'Server error processing request' }, { status: 500 });
  }
}
