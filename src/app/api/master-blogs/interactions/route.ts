import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isMasterAdminEmail } from '@/lib/master-blogs';
import {
  getPostInteractions,
  getAllPostsInteractionsSummary,
  updatePostReaction,
  addPostComment,
  deletePostComment,
  ReactionType,
} from '@/lib/blog-interactions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (postId) {
      const data = getPostInteractions(postId);
      const totalReactions =
        (data.reactions.like || 0) +
        (data.reactions.love || 0) +
        (data.reactions.sad || 0) +
        (data.reactions.clap || 0) +
        (data.reactions.insightful || 0);

      return NextResponse.json({
        success: true,
        postId,
        reactions: data.reactions,
        comments: data.comments || [],
        totalReactions,
        totalComments: (data.comments || []).length,
      });
    }

    // Return summary for all posts (for grid counters)
    const summary = getAllPostsInteractionsSummary();
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/master-blogs/interactions:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, postId } = body;

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ success: false, error: 'postId is required' }, { status: 400 });
    }

    if (action === 'react') {
      const reactionType = (body.reactionType || null) as ReactionType | null;
      const previousReaction = (body.previousReaction || null) as ReactionType | null;

      const validReactions: ReactionType[] = ['like', 'love', 'sad', 'clap', 'insightful'];
      if (reactionType && !validReactions.includes(reactionType)) {
        return NextResponse.json({ success: false, error: 'Invalid reaction type' }, { status: 400 });
      }

      const updatedReactions = updatePostReaction(postId, reactionType, previousReaction);
      return NextResponse.json({
        success: true,
        postId,
        reactions: updatedReactions,
      });
    }

    if (action === 'comment') {
      const author = String(body.author || '').trim() || 'Reader';
      const content = String(body.content || '').trim();

      if (!content) {
        return NextResponse.json({ success: false, error: 'Comment content cannot be empty' }, { status: 400 });
      }

      if (content.length > 1000) {
        return NextResponse.json({ success: false, error: 'Comment is too long (max 1000 characters)' }, { status: 400 });
      }

      const newComment = addPostComment(postId, author, content);
      const postData = getPostInteractions(postId);

      return NextResponse.json({
        success: true,
        postId,
        comment: newComment,
        comments: postData.comments,
        totalComments: postData.comments.length,
      });
    }

    if (action === 'delete_comment') {
      const session = await getServerSession(authOptions);
      const isAdmin = isMasterAdminEmail(session?.user?.email);

      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin privileges required' }, { status: 401 });
      }

      const commentId = String(body.commentId || '');
      if (!commentId) {
        return NextResponse.json({ success: false, error: 'commentId is required' }, { status: 400 });
      }

      const deleted = deletePostComment(postId, commentId);
      const postData = getPostInteractions(postId);

      return NextResponse.json({
        success: deleted,
        postId,
        comments: postData.comments,
        totalComments: postData.comments.length,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/master-blogs/interactions:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
