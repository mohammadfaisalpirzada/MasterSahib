'use client';

import React, { useState, useEffect } from 'react';
import {
  FbLikeIcon,
  FbLoveIcon,
  FbSadIcon,
  FbClapIcon,
  FbHelpfulIcon,
} from './FacebookReactionIcons';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import type { ReactionType, BlogReactions } from '@/lib/blog-interactions';

interface BlogReactionBarProps {
  postId: string;
  postTitle?: string;
  initialReactions?: BlogReactions;
  commentsCount?: number;
  onCommentClick?: () => void;
  compact?: boolean;
  onToast?: (msg: string) => void;
}

const REACTIONS_CONFIG: Array<{
  type: ReactionType;
  label: string;
  urduLabel: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  activeColor: string;
  activeBg: string;
}> = [
  {
    type: 'like',
    label: 'Like',
    urduLabel: 'پسند',
    Icon: FbLikeIcon,
    activeColor: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-50 border-blue-300 dark:bg-blue-950/60 dark:border-blue-700',
  },
  {
    type: 'love',
    label: 'Love',
    urduLabel: 'محبت',
    Icon: FbLoveIcon,
    activeColor: 'text-rose-600 dark:text-rose-400',
    activeBg: 'bg-rose-50 border-rose-300 dark:bg-rose-950/60 dark:border-rose-700',
  },
  {
    type: 'sad',
    label: 'Sad',
    urduLabel: 'افسوس',
    Icon: FbSadIcon,
    activeColor: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-50 border-amber-300 dark:bg-amber-950/60 dark:border-amber-700',
  },
  {
    type: 'clap',
    label: 'Clap',
    urduLabel: 'شاباش',
    Icon: FbClapIcon,
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700',
  },
  {
    type: 'insightful',
    label: 'Helpful',
    urduLabel: 'معلومات',
    Icon: FbHelpfulIcon,
    activeColor: 'text-amber-500 dark:text-amber-300',
    activeBg: 'bg-amber-50 border-amber-300 dark:bg-amber-950/60 dark:border-amber-700',
  },
];

export default function BlogReactionBar({
  postId,
  postTitle = '',
  initialReactions,
  commentsCount,
  onCommentClick,
  compact = false,
  onToast,
}: BlogReactionBarProps) {
  const [reactions, setReactions] = useState<BlogReactions>(
    initialReactions || { like: 0, love: 0, sad: 0, clap: 0, insightful: 0 }
  );
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);

  // Sync initial reactions if prop changes
  useEffect(() => {
    if (initialReactions) {
      setReactions(initialReactions);
    }
  }, [initialReactions]);

  // Load user reaction from localStorage and listen to cross-component sync
  useEffect(() => {
    if (!postId) return;

    try {
      const saved = localStorage.getItem(`mb_reaction_${postId}`) as ReactionType | null;
      if (saved) setUserReaction(saved);
    } catch {}

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{
        postId: string;
        reactions: BlogReactions;
        userReaction: ReactionType | null;
      }>;
      if (customEvent.detail && customEvent.detail.postId === postId) {
        setReactions(customEvent.detail.reactions);
        setUserReaction(customEvent.detail.userReaction);
      }
    };

    window.addEventListener('master_sahib_reaction_updated', handleSync);
    return () => {
      window.removeEventListener('master_sahib_reaction_updated', handleSync);
    };
  }, [postId]);

  const handleReact = async (type: ReactionType, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isSame = userReaction === type;
    const newReaction = isSame ? null : type;
    const prevReaction = userReaction;

    // Optimistic UI updates
    setUserReaction(newReaction);
    const updatedReactions: BlogReactions = { ...reactions };
    if (prevReaction && updatedReactions[prevReaction] !== undefined) {
      updatedReactions[prevReaction] = Math.max(0, updatedReactions[prevReaction] - 1);
    }
    if (newReaction && updatedReactions[newReaction] !== undefined) {
      updatedReactions[newReaction] = (updatedReactions[newReaction] || 0) + 1;
    }
    setReactions(updatedReactions);

    // Save to localStorage
    try {
      if (newReaction) {
        localStorage.setItem(`mb_reaction_${postId}`, newReaction);
      } else {
        localStorage.removeItem(`mb_reaction_${postId}`);
      }
    } catch {}

    // Broadcast update across other components on page
    try {
      window.dispatchEvent(
        new CustomEvent('master_sahib_reaction_updated', {
          detail: {
            postId,
            reactions: updatedReactions,
            userReaction: newReaction,
          },
        })
      );
    } catch {}

    if (onToast && newReaction) {
      onToast(`آپ کا تاثر (${type}) محفوظ ہو گیا!`);
    }

    // Sync to API and Google Sheets
    try {
      const res = await fetch('/api/master-blogs/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'react',
          postId,
          postTitle,
          reactionType: newReaction,
          previousReaction: prevReaction,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reactions) {
          setReactions(data.reactions);
        }
      }
    } catch {
      // Keep optimistic state
    }
  };

  const total =
    (reactions.like || 0) +
    (reactions.love || 0) +
    (reactions.sad || 0) +
    (reactions.clap || 0) +
    (reactions.insightful || 0);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 ${
        compact
          ? 'py-2 px-1'
          : 'rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/60'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Facebook 3D Emoji Reaction Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {REACTIONS_CONFIG.map(({ type, label, urduLabel, Icon, activeColor, activeBg }) => {
          const count = reactions[type] || 0;
          const isSelected = userReaction === type;

          return (
            <button
              key={type}
              type="button"
              onClick={(e) => handleReact(type, e)}
              className={`group relative flex items-center gap-1 rounded-full border transition-all duration-200 active:scale-95 ${
                compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
              } ${
                isSelected
                  ? `${activeBg} shadow-sm ring-1 ring-indigo-400/50`
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
              title={`${label} (${urduLabel})`}
            >
              <Icon size={compact ? 20 : 24} />
              {count > 0 && (
                <span
                  className={`text-[11px] font-black leading-none ${
                    isSelected ? activeColor : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Total Summary & Comments Trigger */}
      <div className="flex items-center gap-2">
        {total > 0 && (
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {total} {total === 1 ? 'reaction' : 'reactions'}
          </span>
        )}

        {onCommentClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick();
            }}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
          >
            <HiOutlineChatAlt2 className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[11px]">
              {commentsCount !== undefined ? commentsCount : 0} کمنٹس
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
