'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiOutlineArrowRight,
  HiOutlineArrowsExpand,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineVolumeUp,
  HiOutlineStop,
  HiOutlineX,
  HiOutlineDownload,
  HiOutlineNewspaper,
  HiOutlineBookOpen,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineShare,
  HiOutlineChatAlt2,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { getCurrentTheme } from '@/lib/theme';
import type { BlogPost } from '@/lib/master-blogs';
import BlogShareModal from './BlogShareModal';
import { openWhatsAppShare } from '@/lib/blog-share';

export default function HomeMasterBlogsBanner() {
  const theme = getCurrentTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [shareModalPost, setShareModalPost] = useState<BlogPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [detectedOrientations, setDetectedOrientations] = useState<Record<string, 'portrait' | 'landscape' | 'square'>>({});
  const [interactionsMap, setInteractionsMap] = useState<Record<string, { totalReactions: number; commentsCount: number }>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetch('/api/master-blogs')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setPosts(data.posts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/master-blogs/interactions')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.success && data.summary) {
          setInteractionsMap(data.summary);
        }
      })
      .catch(() => {});
  }, []);

  if (loading || posts.length === 0) return null;

  const currentPost = posts[currentIndex];
  const activeOrientation = detectedOrientations[currentPost.id] || currentPost.orientation || 'portrait';
  const isPortrait = activeOrientation === 'portrait';
  const isLandscape = activeOrientation === 'landscape';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const handleSmartShare = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalPost(post);
  };

  const handleWhatsAppShare = (post: BlogPost) => {
    openWhatsAppShare(post);
    showToast('Opening WhatsApp with post, services & contact...');
  };

  const handleSpeak = (post: BlogPost) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${post.title}. ${post.content}`);
    utterance.lang = post.isUrdu ? 'ur-PK' : 'en-US';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="relative border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 py-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/70">
      {/* Lightbox for HD Poster Zoom */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-h-[95vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/40"
            >
              <HiOutlineX className="h-6 w-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Poster"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex justify-center">
              <a
                href={lightboxImage}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-lg hover:bg-slate-100"
              >
                <HiOutlineDownload className="h-4 w-4 text-emerald-600" /> Download HD Poster
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Blog Share Modal with WhatsApp, HD Image, Services & Contact */}
      <BlogShareModal
        post={shareModalPost}
        isOpen={Boolean(shareModalPost)}
        onClose={() => setShareModalPost(null)}
        onToast={showToast}
      />

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur border border-slate-700 animate-fadeIn">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Label */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
            >
              <HiOutlineNewspaper className="h-4 w-4" />
              Latest Educational Poster &amp; Blog
            </span>
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              تازہ ترین معلوماتی پوسٹرز اور اپ ڈیٹس
            </span>
          </div>

          <div className="flex items-center gap-3">
            {posts.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Poster"
                  className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <HiOutlineChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-500 px-1">
                  {currentIndex + 1} / {posts.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Poster"
                  className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <HiOutlineChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <Link
              href="/master_blogs"
              className="inline-flex items-center gap-1 text-xs font-bold transition hover:underline"
              style={{ color: theme.primary }}
            >
              <span>Explore All Blogs</span>
              <HiOutlineArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Featured Showcase Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 transition duration-300">
          <div
            className={`grid gap-6 lg:gap-8 items-center p-5 sm:p-7 ${
              isPortrait
                ? 'lg:grid-cols-[360px,1fr] xl:grid-cols-[410px,1fr]'
                : isLandscape
                ? 'lg:grid-cols-[1.15fr,0.85fr]'
                : 'lg:grid-cols-[380px,1fr]'
            }`}
          >
            {/* Left: HD Poster Display */}
            <div
              className={`group relative mx-auto w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100/70 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-800/40 ${
                isPortrait
                  ? 'max-w-[330px] sm:max-w-[360px] lg:max-w-none aspect-[3/4]'
                  : isLandscape
                  ? 'aspect-[16/9]'
                  : 'max-w-[380px] aspect-square'
              }`}
              onClick={() => setLightboxImage(currentPost.imageUrl)}
            >
              <Image
                src={currentPost.imageUrl}
                alt={currentPost.title}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.02]"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    const o =
                      img.naturalHeight > img.naturalWidth * 1.12
                        ? 'portrait'
                        : img.naturalWidth > img.naturalHeight * 1.12
                        ? 'landscape'
                        : 'square';
                    setDetectedOrientations((prev) => ({ ...prev, [currentPost.id]: o }));
                  }
                }}
                unoptimized
              />

              {/* Category Pill */}
              <div className="absolute left-3 top-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-md backdrop-blur-md"
                  style={{ backgroundColor: theme.primary }}
                >
                  {currentPost.category}
                </span>
              </div>

              {/* Transparent Share Button on Image */}
              <button
                type="button"
                onClick={(e) => handleSmartShare(currentPost, e)}
                title="Share Poster & Text"
                aria-label="Share Poster & Text"
                className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/25 transition-all duration-300 hover:bg-black/75 hover:scale-105 active:scale-95"
              >
                <HiOutlineShare className="h-4 w-4 text-white" />
                <span className="text-xs">Share</span>
              </button>

              {/* Zoom Trigger Button */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-md transition group-hover:scale-105 group-hover:bg-slate-900">
                <HiOutlineArrowsExpand className="h-4 w-4" />
                <span>Zoom Poster</span>
              </div>
            </div>

            {/* Right: Bold Title, Summary & Quick Action Buttons */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendar className="h-3.5 w-3.5" />
                    {currentPost.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HiOutlineClock className="h-3.5 w-3.5" />
                    {currentPost.readTime}
                  </span>
                </div>

                {/* Bold Title */}
                <h3
                  className={`mt-2 text-xl font-black leading-snug sm:text-2xl lg:text-3xl ${
                    currentPost.isUrdu
                      ? 'font-serif text-right text-2xl leading-relaxed text-slate-900 dark:text-white sm:text-3xl'
                      : 'text-slate-900 dark:text-white'
                  }`}
                  dir={currentPost.isUrdu ? 'rtl' : 'ltr'}
                >
                  {currentPost.title}
                </h3>

                {/* Excerpt */}
                <p
                  className={`mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 ${
                    currentPost.isUrdu ? 'text-right' : 'text-left'
                  }`}
                  dir={currentPost.isUrdu ? 'rtl' : 'ltr'}
                >
                  {currentPost.excerpt}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/master_blogs"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ backgroundColor: theme.primary }}
                >
                  <HiOutlineBookOpen className="h-4 w-4" />
                  <span>پورا بلاگ پڑھیں</span>
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(currentPost)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  <span>WhatsApp Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSpeak(currentPost)}
                  title={speaking ? 'Stop' : 'Listen'}
                  className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition ${
                    speaking
                      ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {speaking ? <HiOutlineStop className="h-4 w-4" /> : <HiOutlineVolumeUp className="h-4 w-4" />}
                  <span>{speaking ? 'Stop' : 'تحریر سنیں'}</span>
                </button>

                {/* Reactions & Comments Shortcut */}
                <Link
                  href={`/master_blogs?post=${currentPost.id}`}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-600 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center -space-x-1">
                    <span>👍</span>
                    <span>❤️</span>
                    <span>😢</span>
                  </span>
                  <span>{interactionsMap[currentPost.id]?.totalReactions || 0}</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <HiOutlineChatAlt2 className="h-4 w-4 text-indigo-500" />
                  <span>{interactionsMap[currentPost.id]?.commentsCount || 0} تبصرے</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
