'use client';

import React, { useState, useEffect } from 'react';
import {
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiOutlinePaperAirplane,
  HiOutlineUser,
} from 'react-icons/hi';
import type { ReactionType, BlogReactions, BlogComment } from '@/lib/blog-interactions';

interface BlogReactionsAndCommentsProps {
  postId: string;
  postTitle?: string;
  isAdmin?: boolean;
  onToast?: (msg: string) => void;
}

const EMOJI_REACTIONS: Array<{
  type: ReactionType;
  emoji: string;
  label: string;
  urduLabel: string;
  colorClass: string;
  bgClass: string;
}> = [
  {
    type: 'like',
    emoji: '👍',
    label: 'Like',
    urduLabel: 'پسند',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'hover:bg-blue-50 dark:hover:bg-blue-950/40 border-blue-200 dark:border-blue-800',
  },
  {
    type: 'love',
    emoji: '❤️',
    label: 'Love',
    urduLabel: 'محبت',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  },
  {
    type: 'sad',
    emoji: '😢',
    label: 'Sad',
    urduLabel: 'افسوس',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
  {
    type: 'clap',
    emoji: '👏',
    label: 'Clap',
    urduLabel: 'شاباش',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  },
  {
    type: 'insightful',
    emoji: '💡',
    label: 'Helpful',
    urduLabel: 'معلومات',
    colorClass: 'text-amber-500 dark:text-amber-300',
    bgClass: 'hover:bg-amber-50 dark:hover:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  },
];

export default function BlogReactionsAndComments({
  postId,
  isAdmin = false,
  onToast,
}: BlogReactionsAndCommentsProps) {
  const [reactions, setReactions] = useState<BlogReactions>({
    like: 0,
    love: 0,
    sad: 0,
    clap: 0,
    insightful: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment Form state
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load interactions from API and user reaction from localStorage
  useEffect(() => {
    if (!postId) return;

    // Load saved user reaction from localStorage
    try {
      const saved = localStorage.getItem(`mb_reaction_${postId}`) as ReactionType | null;
      if (saved) setUserReaction(saved);
    } catch {}

    // Fetch live reactions and comments from API
    fetch(`/api/master-blogs/interactions?postId=${encodeURIComponent(postId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success) {
          if (data.reactions) setReactions(data.reactions);
          if (Array.isArray(data.comments)) setComments(data.comments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  // Handle Emoji Reaction click
  const handleReact = async (type: ReactionType) => {
    const isSame = userReaction === type;
    const newReaction = isSame ? null : type;
    const prevReaction = userReaction;

    // Optimistic UI update
    setUserReaction(newReaction);
    setReactions((prev) => {
      const updated = { ...prev };
      if (prevReaction && updated[prevReaction] !== undefined) {
        updated[prevReaction] = Math.max(0, updated[prevReaction] - 1);
      }
      if (newReaction && updated[newReaction] !== undefined) {
        updated[newReaction] = (updated[newReaction] || 0) + 1;
      }
      return updated;
    });

    // Save to localStorage
    try {
      if (newReaction) {
        localStorage.setItem(`mb_reaction_${postId}`, newReaction);
      } else {
        localStorage.removeItem(`mb_reaction_${postId}`);
      }
    } catch {}

    // Sync with API
    try {
      await fetch('/api/master-blogs/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'react',
          postId,
          reactionType: newReaction,
          previousReaction: prevReaction,
        }),
      });
    } catch {
      // Revert if error
    }
  };

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
          author: author.trim() || 'Reader',
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
        setContent('');
        if (onToast) onToast('آپ کا تبصرہ کامیابی کے ساتھ شامل ہو گیا!');
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

  const totalReactionsCount =
    (reactions.like || 0) +
    (reactions.love || 0) +
    (reactions.sad || 0) +
    (reactions.clap || 0) +
    (reactions.insightful || 0);

  return (
    <div className="mt-8 border-t border-slate-200/90 pt-6 dark:border-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. Facebook-Style Emoji Reactions Section
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 dark:text-white">
              Reactions / تاثرات
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {totalReactionsCount}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click emoji to react / اپنا تاثر منتخب کریں
          </span>
        </div>

        {/* Reaction Buttons Row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {EMOJI_REACTIONS.map((item) => {
            const count = reactions[item.type] || 0;
            const isSelected = userReaction === item.type;

            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleReact(item.type)}
                className={`group flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-200 ring-2 ring-indigo-400/30'
                    : `border-slate-200 bg-white text-slate-700 shadow-xs dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 ${item.bgClass}`
                }`}
                title={`${item.label} (${item.urduLabel})`}
              >
                <span className="text-lg transition-transform group-hover:scale-125">
                  {item.emoji}
                </span>
                <span className="font-semibold">{item.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Comments & Discussion Section
         ───────────────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
            Open Discussion
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
