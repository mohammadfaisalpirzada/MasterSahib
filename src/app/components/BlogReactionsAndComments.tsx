'use client';

import React, { useState, useEffect } from 'react';
import {
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiOutlinePaperAirplane,
  HiOutlineUser,
} from 'react-icons/hi';
import BlogReactionBar from './BlogReactionBar';
import type { BlogComment } from '@/lib/blog-interactions';

interface BlogReactionsAndCommentsProps {
  postId: string;
  postTitle?: string;
  isAdmin?: boolean;
  onToast?: (msg: string) => void;
}

export default function BlogReactionsAndComments({
  postId,
  postTitle = '',
  isAdmin = false,
  onToast,
}: BlogReactionsAndCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment Form state
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load comments from API
  useEffect(() => {
    if (!postId) return;

    fetch(`/api/master-blogs/interactions?postId=${encodeURIComponent(postId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  // Handle Comment Submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/master-blogs/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId,
          postTitle,
          author: author.trim() || 'Reader',
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
        setContent('');
        if (onToast) onToast('آپ کا تبصرہ کامیابی کے ساتھ گوگل شیٹ میں محفوظ ہو گیا!');
      } else {
        if (onToast) onToast(data.error || 'تبصرہ بھیجنے میں خرابی ہوئی');
      }
    } catch {
      if (onToast) onToast('نیٹ ورک کی خرابی، دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Comment (Admin only)
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('کیا آپ واقعی یہ تبصرہ ڈیلیٹ کرنا چاہتے ہیں؟')) return;

    try {
      const res = await fetch('/api/master-blogs/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_comment',
          postId,
          commentId,
        }),
      });

      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
        if (onToast) onToast('تبصرہ ڈیلیٹ ہو گیا');
      }
    } catch {
      if (onToast) onToast('ڈیلیٹ نہیں ہو سکا');
    }
  };

  return (
    <div className="mt-8 border-t border-slate-200/90 pt-6 dark:border-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. 3D Facebook-Style Emoji Reactions Bar
         ───────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Reactions / اپنا تاثر دیں (Like, Love, Sad, Clap):
        </p>
        <BlogReactionBar
          postId={postId}
          postTitle={postTitle}
          commentsCount={comments.length}
          onToast={onToast}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Comments & Discussion Section
         ───────────────────────────────────────────────────────────── */}
      <div
        id="comments-section"
        className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HiOutlineChatAlt2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Comments &amp; Discussion (تبصرے)
            </h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              {comments.length}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Saved to Google Sheets
          </span>
        </div>

        {/* Comment Submission Form */}
        <form onSubmit={handleSubmitComment} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Your Name / نام
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus-within:border-indigo-500 dark:border-slate-700 dark:bg-slate-800">
                <HiOutlineUser className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Master Sahib, Student, Teacher..."
                  maxLength={60}
                  className="w-full bg-transparent font-medium text-slate-900 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Write a Comment / اپنا تبصرہ یا رائے لکھیں *
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="تحریر یا معلوماتی پوسٹر پر اپنی قیمتی رائے یا سوال یہاں درج کریں..."
              maxLength={1000}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              <HiOutlinePaperAirplane className="h-4 w-4 rotate-90" />
              <span>{submitting ? 'ارسال ہو رہا ہے...' : 'Post Comment / تبصرہ بھیجیں'}</span>
            </button>
          </div>
        </form>

        {/* Comments Feed List */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              💬 ابھی تک کوئی تبصرہ نہیں۔ سب سے پہلے اپنی قیمتی رائے کا اظہار کریں!
            </div>
          ) : (
            comments.map((comment) => {
              const initial = (comment.author || 'R').charAt(0).toUpperCase();
              const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={comment.id}
                  className="group flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3.5 transition hover:bg-slate-100/70 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/60"
                >
                  {/* User Initial Avatar */}
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-black text-white shadow-xs">
                    {initial}
                  </div>

                  {/* Comment Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {comment.author}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Delete Comment"
                          className="text-slate-400 transition hover:text-red-600"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <p
                      className={`mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300 ${
                        comment.isUrdu ? 'font-serif text-right text-sm leading-relaxed' : 'text-left'
                      }`}
                      dir={comment.isUrdu ? 'rtl' : 'ltr'}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
