'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineTrash,
  HiOutlineVolumeUp,
  HiOutlineStop,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlineClipboardCopy,
  HiOutlineArrowsExpand,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineArrowLeft,
  HiOutlineX,
} from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF, FaThumbtack } from 'react-icons/fa';
import { getCurrentTheme } from '@/lib/theme';
import type { BlogPost } from '@/lib/master-blogs';

export default function MasterBlogsPage() {
  const theme = getCurrentTheme();
  const { data: session } = useSession();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals & Active states
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Drag and Drop
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Educational Update');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('The Master Sahib');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch('/api/master-blogs', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setIsAdmin(Boolean(data.isAdmin));
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Categories list
  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Admin Actions
  const handleToggleVisibility = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/master-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-visibility', postId }),
      });
      if (res.ok) {
        showToast('Visibility status updated!');
        fetchBlogs();
      } else {
        showToast('Action failed. Admin privileges required.');
      }
    } catch {
      showToast('Network error');
    }
  };

  const handleTogglePin = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/master-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-pin', postId }),
      });
      if (res.ok) {
        showToast('Pin status updated!');
        fetchBlogs();
      }
    } catch {
      showToast('Network error');
    }
  };

  const handleDeletePost = async (postId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch('/api/master-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', postId }),
      });
      if (res.ok) {
        showToast('Post deleted successfully');
        if (activePost?.id === postId) setActivePost(null);
        fetchBlogs();
      } else {
        showToast('Delete failed');
      }
    } catch {
      showToast('Network error');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    if (!isAdmin) return;
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index || !isAdmin) return;

    const newPosts = [...posts];
    const draggedItem = newPosts[draggedItemIndex];
    newPosts.splice(draggedItemIndex, 1);
    newPosts.splice(index, 0, draggedItem);
    setDraggedItemIndex(index);
    setPosts(newPosts);
  };

  const handleDragEnd = async () => {
    setDraggedItemIndex(null);
    if (!isAdmin) return;
    setIsSavingOrder(true);
    try {
      const order = posts.map((p) => p.id);
      await fetch('/api/master-blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', order }),
      });
      showToast('Post order saved!');
    } catch {
      showToast('Failed to save order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // WhatsApp Share Helper
  const handleWhatsAppShare = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/master_blogs?post=${post.id}` : '';
    const text = `📢 *The Master Sahib Educational Update*\n📌 *${post.title}*\n📅 Date: ${post.date}\n📂 Category: ${post.category}\n\n📖 Read full article & view poster:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Facebook Share
  const handleFacebookShare = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/master_blogs?post=${post.id}` : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };

  // Copy Formatted Text
  const handleCopyText = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `*${post.title}*\n${post.date} | ${post.category}\n\n${post.content}\n\n— The Master Sahib (https://themastersahib.com)`;
    navigator.clipboard.writeText(fullText);
    showToast('Text copied to clipboard!');
  };

  // Audio Text-to-Speech
  const handleSpeak = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speakingId === post.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${post.title}. ${post.content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = post.isUrdu ? 'ur-PK' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(post.id);
    window.speechSynthesis.speak(utterance);
  };

  // Direct Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter a title for the post.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (uploadFile) formData.append('image', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);
      formData.append('content', uploadContent);
      formData.append('author', uploadAuthor);
      formData.append('date', uploadDate);

      const res = await fetch('/api/master-blogs', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        showToast('New Blog & Poster published successfully!');
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadContent('');
        setUploadFile(null);
        fetchBlogs();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to upload');
      }
    } catch {
      alert('Network error while publishing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--ms-bg-main)] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur border border-slate-700 animate-fadeIn">
          <HiOutlineCheck className="h-5 w-5 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <section
        className="relative border-b border-white/10 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryHover} 0%, ${theme.primary} 50%, ${theme.secondary} 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                <Link href="/" className="hover:underline flex items-center gap-1">
                  <HiOutlineArrowLeft className="h-3.5 w-3.5" /> Home
                </Link>
                <span>/</span>
                <span>Master Blogs</span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl flex items-center gap-3">
                <span>📢</span> Master Sahib Blogs &amp; Posters
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cyan-100 sm:text-base">
                دی ماسٹر صاحب ایجوکیشنل بلاگز، اسکول نوٹیفکیشنز، اسٹڈی گائیڈز اور معلوماتی پوسٹرز کا مکمل پورٹل۔
              </p>
            </div>

            {/* Admin Badges & Upload Button */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-black/25 p-3 backdrop-blur border border-white/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <span>👑</span>
                  <span>Master Admin Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-slate-900 shadow-md transition hover:bg-amber-100 hover:scale-105"
                >
                  <HiOutlinePlus className="h-4 w-4 text-emerald-600 font-bold" />
                  + New Poster / Blog
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-md dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs, posters, circulars by title or keyword..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                  selectedCategory === cat
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
                style={
                  selectedCategory === cat
                    ? { backgroundColor: theme.primary }
                    : undefined
                }
              >
                {cat === 'all' ? 'All Posts' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Drag and drop helper banner for admin */}
        {isAdmin && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <span>💡</span>
              <span>
                <strong>Admin Tip:</strong> You can drag &amp; drop post cards to rearrange their order, or click the eye icon to hide/publish.
              </span>
            </div>
            {isSavingOrder && <span className="animate-pulse font-bold text-amber-600">Saving order...</span>}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <p className="text-4xl">🔍</p>
            <h3 className="mt-3 text-lg font-bold text-slate-800 dark:text-white">No blog posts found</h3>
            <p className="mt-1 text-sm text-slate-500">Try changing your search terms or filter category.</p>
          </div>
        ) : (
          /* Blog / Poster Grid */
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => {
              const isSpeaking = speakingId === post.id;

              return (
                <article
                  key={post.id}
                  draggable={isAdmin}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
                    post.hidden
                      ? 'border-dashed border-red-300 opacity-75 dark:border-red-800'
                      : 'border-slate-200/80 dark:border-slate-800'
                  } ${draggedItemIndex === index ? 'opacity-40 ring-2 ring-cyan-500' : ''}`}
                >
                  {/* Poster Image Container */}
                  <div
                    className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden bg-slate-950"
                    onClick={() => setActivePost(post)}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />

                    {/* Top Badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {post.category}
                      </span>
                      {post.pinned && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-black text-white shadow-md">
                          <FaThumbtack className="h-2.5 w-2.5" /> Pinned
                        </span>
                      )}
                      {post.hidden && (
                        <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black text-white shadow-md">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Expand Poster Icon Overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage(post.imageUrl);
                      }}
                      aria-label="View Full Poster"
                      className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:scale-110 hover:bg-black/90"
                    >
                      <HiOutlineArrowsExpand className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Date & Read Time */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>📅 {post.date}</span>
                      <span>⏱️ {post.readTime}</span>
                    </div>

                    {/* Bold Title (First line of txt file) */}
                    <h2
                      onClick={() => setActivePost(post)}
                      className={`mt-2.5 cursor-pointer text-lg font-black leading-snug transition group-hover:text-cyan-600 dark:group-hover:text-cyan-400 ${
                        post.isUrdu
                          ? 'font-serif text-right text-xl leading-relaxed text-slate-900 dark:text-white'
                          : 'text-slate-900 dark:text-white'
                      }`}
                      dir={post.isUrdu ? 'rtl' : 'ltr'}
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt / Summary */}
                    <p
                      className={`mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 ${
                        post.isUrdu ? 'text-right' : 'text-left'
                      }`}
                      dir={post.isUrdu ? 'rtl' : 'ltr'}
                    >
                      {post.excerpt}
                    </p>

                    {/* Action Buttons Toolbar */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {/* Read More Button */}
                      <button
                        type="button"
                        onClick={() => setActivePost(post)}
                        className="inline-flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
                        style={{ color: theme.primary }}
                      >
                        <span>پورا پڑھیں</span>
                        <span>Read More →</span>
                      </button>

                      {/* Utility Action Icons */}
                      <div className="flex items-center gap-1.5">
                        {/* Audio Speech */}
                        <button
                          type="button"
                          onClick={(e) => handleSpeak(post, e)}
                          title={isSpeaking ? 'Stop Audio' : 'Listen to Blog'}
                          className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                            isSpeaking
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isSpeaking ? <HiOutlineStop className="h-4 w-4" /> : <HiOutlineVolumeUp className="h-4 w-4" />}
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppShare(post, e)}
                          title="Share on WhatsApp"
                          className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-500 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400"
                        >
                          <FaWhatsapp className="h-4 w-4" />
                        </button>

                        {/* Facebook Share */}
                        <button
                          type="button"
                          onClick={(e) => handleFacebookShare(post, e)}
                          title="Share on Facebook"
                          className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-400"
                        >
                          <FaFacebookF className="h-3.5 w-3.5" />
                        </button>

                        {/* Copy Text */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyText(post, e)}
                          title="Copy Full Text"
                          className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <HiOutlineClipboardCopy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Admin Control Strip */}
                    {isAdmin && (
                      <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 p-2 text-xs font-bold dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1">
                          {/* Toggle Visibility */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleVisibility(post.id, e)}
                            title={post.hidden ? 'Publish / Unhide' : 'Hide from Public'}
                            className={`flex items-center gap-1 rounded-lg px-2 py-1 transition ${
                              post.hidden
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {post.hidden ? <HiOutlineEye className="h-4 w-4" /> : <HiOutlineEyeOff className="h-4 w-4" />}
                            <span>{post.hidden ? 'Unhide' : 'Hide'}</span>
                          </button>

                          {/* Toggle Pin */}
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(post.id, e)}
                            title={post.pinned ? 'Unpin' : 'Pin to Top'}
                            className={`rounded-lg p-1.5 transition ${
                              post.pinned
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <FaThumbtack className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Delete Post */}
                        <button
                          type="button"
                          onClick={(e) => handleDeletePost(post.id, post.title, e)}
                          title="Delete Post"
                          className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Reader Modal / Full Article View */}
      {activePost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActivePost(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {activePost.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">📅 {activePost.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePost(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Poster Image */}
              <div
                className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-2xl bg-black"
                onClick={() => setLightboxImage(activePost.imageUrl)}
              >
                <Image
                  src={activePost.imageUrl}
                  alt={activePost.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur flex items-center gap-1">
                  <HiOutlineArrowsExpand className="h-3.5 w-3.5" /> Click to Zoom Poster
                </div>
              </div>

              {/* Bold Title */}
              <h2
                className={`mt-6 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl ${
                  activePost.isUrdu ? 'font-serif text-right text-3xl leading-relaxed' : ''
                }`}
                dir={activePost.isUrdu ? 'rtl' : 'ltr'}
              >
                {activePost.title}
              </h2>

              {/* Author & Read Time */}
              <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>By {activePost.author}</span>
                <span>•</span>
                <span>{activePost.readTime}</span>
              </div>

              {/* Article Content with Urdu/English formatting */}
              <div
                className={`mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-700 dark:text-slate-200 ${
                  activePost.isUrdu ? 'font-serif text-right text-lg leading-loose' : ''
                }`}
                dir={activePost.isUrdu ? 'rtl' : 'ltr'}
              >
                {activePost.content}
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleWhatsAppShare(activePost, e)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  <FaWhatsapp className="h-4 w-4" /> Share on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCopyText(activePost, e)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
                >
                  <HiOutlineClipboardCopy className="h-4 w-4" /> Copy Text
                </button>
              </div>

              <a
                href={activePost.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <HiOutlineDownload className="h-4 w-4" /> Download Poster
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox Modal for Poster Zoom */}
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
              alt="High Resolution Poster"
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

      {/* Admin Web Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Publish New Blog / Poster</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Poster Image (JPG, PNG, WebP, SVG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Title (پہلی لائن - Bold Title) *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. سندھ ٹیچنگ لائسنس 2026 گائیڈ"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <input
                    type="text"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    placeholder="e.g. Teaching License"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Blog Content / Details (Urdu or English)
                </label>
                <textarea
                  rows={6}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="یہاں بلاگ کی مکمل تفصیلات، پوائنٹس اور نوٹس لکھیں..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm leading-relaxed text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl py-3 text-sm font-black text-white shadow-lg transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  {isSubmitting ? 'Publishing...' : '🚀 Publish Blog & Poster Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
