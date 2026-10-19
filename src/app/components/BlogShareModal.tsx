'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  HiOutlineX,
  HiOutlineShare,
  HiOutlineDownload,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlinePhotograph,
  HiOutlineEye,
} from 'react-icons/hi';
import { FaWhatsapp, FaFacebookF } from 'react-icons/fa';
import type { BlogPost } from '@/lib/master-blogs';
import {
  formatBlogShareText,
  openWhatsAppShare,
  copyBlogShareText,
  sharePostToWhatsApp,
  MASTER_CONTACT_PHONE,
  MASTER_SERVICES_LINE,
} from '@/lib/blog-share';

interface BlogShareModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onToast?: (message: string) => void;
}

export default function BlogShareModal({
  post,
  isOpen,
  onClose,
  onToast,
}: BlogShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen || !post) return null;

  const shareText = formatBlogShareText(post);

  const handleCopy = async () => {
    const success = await copyBlogShareText(post);
    if (success) {
      setCopied(true);
      if (onToast) onToast('پوسٹ کی تمام تفصیلات، خدمات اور رابطہ کاپی ہو گیا!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsApp = async () => {
    setIsSharingImage(true);
    try {
      await sharePostToWhatsApp(post, undefined, onToast);
    } finally {
      setIsSharingImage(false);
    }
  };

  const handleFacebook = () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/master_blogs?post=${encodeURIComponent(post.id)}`
      : `https://themastersahib.com/master_blogs?post=${encodeURIComponent(post.id)}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareImageWithCaption = async () => {
    setIsSharingImage(true);
    // 1. First copy the complete text to clipboard so it is ALWAYS available if WhatsApp/app drops the text
    await copyBlogShareText(post);
    if (onToast) {
      onToast('کیپشن اور رابطہ کاپی ہو گیا! واٹس ایپ میں تصویر کے نیچے Paste کریں');
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        const res = await fetch(post.imageUrl);
        const blob = await res.blob();
        const ext = post.imageUrl.toLowerCase().includes('.png') ? 'png' : 'jpg';
        const mime = blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg');
        const file = new File([blob], `${post.id}-poster.${ext}`, { type: mime });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: post.title,
            text: shareText,
            files: [file],
          });
          setIsSharingImage(false);
          return;
        }

        await navigator.share({
          title: post.title,
          text: shareText,
          url: `${typeof window !== 'undefined' ? window.location.origin : 'https://themastersahib.com'}/master_blogs?post=${post.id}`,
        });
        setIsSharingImage(false);
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        setIsSharingImage(false);
        return;
      }
    }

    // Fallback: trigger download and open WhatsApp
    const a = document.createElement('a');
    a.href = post.imageUrl;
    a.download = `${post.id}-poster.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsSharingImage(false);
  };

  const handleDownloadPoster = () => {
    const a = document.createElement('a');
    a.href = post.imageUrl;
    a.download = `${post.id}-poster.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (onToast) onToast('پوسٹر ڈاؤنلوڈ ہو رہا ہے...');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Share Educational Poster &amp; Post
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The Master Sahib Educational Series
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        {/* Post Quick Preview Card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {post.category}
            </span>
            <h4
              className={`mt-1 line-clamp-1 text-sm font-bold text-slate-900 dark:text-white ${
                post.isUrdu ? 'font-serif text-right' : ''
              }`}
            >
              {post.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {post.date} • {post.readTime}
            </p>
          </div>
        </div>

        {/* Helper Callout for WhatsApp Auto-Copy */}
        <div className="mt-3 rounded-2xl bg-emerald-50/90 p-3 text-xs text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-start gap-2">
            <span className="font-bold text-emerald-700 dark:text-emerald-300">واٹس ایپ رہنمائی:</span>
            <p className="text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-200">
              شیئر کے بٹن پر کلک کرتے ہی تحریر خود بخود کاپی ہو جاتی ہے۔ اگر واٹس ایپ تصویر کے نیچے کیپشن نہ دکھائے تو چیٹ میں صرف <strong>Paste (پیسٹ)</strong> کر دیں۔
            </p>
          </div>
        </div>

        {/* Primary Action 1: WhatsApp (Image + Text Together) */}
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={isSharingImage}
            className="group flex w-full items-center justify-between rounded-2xl bg-[#25D366] px-4 py-3.5 text-left text-white shadow-md transition-all hover:bg-[#20ba59] hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                <FaWhatsapp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white">
                  {isSharingImage ? 'Preparing Image & Text...' : 'Share on WhatsApp (تصویر اور تحریر واٹس ایپ پر)'}
                </p>
                <p className="text-xs text-white/90">
                  تحریر خود بخود کاپی ہو جائے گی، چیٹ میں ضرورت پڑنے پر Paste کر دیں
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white group-hover:bg-white/30">
              WhatsApp
            </span>
          </button>

          {/* Primary Action 2: Copy Full Text Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="group flex w-full items-center justify-between rounded-2xl bg-slate-800 px-4 py-3 text-left text-white shadow-md transition-all hover:bg-slate-900 hover:shadow-lg active:scale-[0.99] dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                {copied ? (
                  <HiOutlineCheck className="h-5 w-5 text-emerald-400" />
                ) : (
                  <HiOutlineClipboardCopy className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white">
                  {copied ? 'Copied to Clipboard! (تحریر کاپی ہو گئی)' : 'Copy Full WhatsApp Caption (مکمل تحریر کاپی کریں)'}
                </p>
                <p className="text-xs text-white/80">
                  پوسٹ کا مکمل متن، خلاصہ، ویب سائٹ لنک اور رابطہ
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white group-hover:bg-white/30">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>

          {/* Primary Action 3: Share via Other Apps */}
          <button
            type="button"
            onClick={handleShareImageWithCaption}
            disabled={isSharingImage}
            className="group flex w-full items-center justify-between rounded-2xl bg-indigo-600 px-4 py-3 text-left text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
                <HiOutlineShare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black leading-tight text-white">
                  Share via Other Apps (All Apps)
                </p>
                <p className="text-xs text-white/90">
                  فیس بک، ٹیلی گرام، میسنجر یا دیگر ایپس پر شیئر کریں
                </p>
              </div>
            </div>
            <span className="rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white group-hover:bg-white/30">
              Share
            </span>
          </button>
        </div>

        {/* Secondary Action Buttons Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {/* Download HD Poster */}
          <button
            type="button"
            onClick={handleDownloadPoster}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <HiOutlineDownload className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Download Poster</span>
          </button>

          {/* Facebook Share Button */}
          <button
            type="button"
            onClick={handleFacebook}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            <FaFacebookF className="h-3.5 w-3.5" />
            <span>Facebook Share</span>
          </button>
        </div>

        {/* Services & Contact Banner */}
        <div className="mt-4 rounded-2xl bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/50">
          <p className="font-black text-amber-950 dark:text-amber-100">
            Master Sahib Professional Services Included in Message:
          </p>
          <p className="mt-1 leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
            {MASTER_SERVICES_LINE}
          </p>
          <p className="mt-1.5 font-bold text-[11px] text-amber-950 dark:text-amber-200">
            Contact / WhatsApp: {MASTER_CONTACT_PHONE}
          </p>
        </div>

        {/* Toggle Message Preview */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <span className="flex items-center gap-1.5">
              <HiOutlineEye className="h-3.5 w-3.5" />
              {showPreview ? 'Hide Message Preview' : 'Show Message Preview (کیا ٹیکسٹ جائے گا)'}
            </span>
            <span>{showPreview ? '▲' : '▼'}</span>
          </button>

          {showPreview && (
            <div className="mt-2 rounded-2xl bg-slate-900 p-3 text-[11px] font-mono leading-relaxed text-slate-200 dark:bg-black/80 max-h-40 overflow-y-auto whitespace-pre-wrap select-all">
              {shareText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
