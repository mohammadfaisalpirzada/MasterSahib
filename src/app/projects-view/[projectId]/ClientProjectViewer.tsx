'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowsExpand,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineKey,
  HiOutlineClipboardCopy,
  HiOutlinePencilAlt,
  HiOutlineCheck,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import type { ClientProject } from '@/lib/projects-view';

type Props = {
  project: ClientProject;
  initialKey?: string;
};

const OWNER_EMAIL = 'mohammadfaisalpirzada@gmail.com';

export default function ClientProjectViewer({ project: initialProject, initialKey }: Props) {
  const { data: session } = useSession();
  const isOwner = session?.user?.email?.toLowerCase() === OWNER_EMAIL;

  const [project, setProject] = useState<ClientProject>(initialProject);
  const [unlocked, setUnlocked] = useState(
    isOwner || !project.accessKey || initialKey === project.accessKey
  );
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Owner in-viewer key editing
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState(project.accessKey || '');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = project.pages.length;
  const activePage = project.pages.find((p) => p.pageNumber === currentPage) || project.pages[0];

  // Auto-unlock for owner or if matching key provided
  useEffect(() => {
    if (isOwner) {
      setUnlocked(true);
    } else if (project.accessKey && initialKey === project.accessKey) {
      setUnlocked(true);
    }
  }, [isOwner, project.accessKey, initialKey]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.accessKey || keyInput.trim() === project.accessKey) {
      setUnlocked(true);
      setKeyError('');
    } else {
      setKeyError('Invalid Access Key. Please check the link or contact Master Sahib.');
    }
  };

  const handleSaveKey = async () => {
    setIsSavingKey(true);
    try {
      const res = await fetch('/api/projects-view/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, accessKey: newKeyValue }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        setIsEditingKey(false);
        showToast('Access Key updated successfully!');
      } else {
        alert(data.error || 'Failed to update key.');
      }
    } catch {
      alert('Error updating key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const getClientShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://themastersahib.com';
    return `${origin}/projects-view/${project.slug}?key=${encodeURIComponent(project.accessKey || '')}`;
  };

  const copyClientShareLink = async () => {
    const link = getClientShareLink();
    await navigator.clipboard.writeText(link);
    showToast('Client link with key copied to clipboard!');
  };

  // Prevent right-click, saving, printing & shortcut theft
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast('Right-click is disabled in client preview mode.');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys for page flip
      if (viewMode === 'single') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          setCurrentPage((prev) => Math.min(totalPages, prev + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          setCurrentPage((prev) => Math.max(1, prev - 1));
        }
      }

      // Block Ctrl+S, Ctrl+P, Ctrl+U
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'u' || e.key === 'U')
      ) {
        e.preventDefault();
        showToast('Saving and Printing are disabled in preview mode.');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, totalPages]);

  const showToast = useCallback((msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage(null);
    }, 3200);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum Sir! I have reviewed the project preview: "${project.title}". The work is approved. Please guide me on payment and sending the final printable booklet / unwatermarked files.`
  );

  // If password locked screen for client
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-5 text-2xl">
            <HiOutlineLockClosed className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Confidential Client Preview Portal. Please enter your project access key to view the pages.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter Project Access Key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center tracking-wider text-sm font-mono"
                autoFocus
              />
              {keyError ? <p className="text-xs text-rose-500 mt-2 font-medium">{keyError}</p> : null}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition shadow-md shadow-teal-600/20"
            >
              Unlock Project Preview →
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/80 text-xs text-slate-500">
            <p>Produced by <span className="text-slate-700 dark:text-slate-300 font-semibold">The Master Sahib Series</span></p>
            <p className="mt-1">For access assistance: WhatsApp +92 345 8340669</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col select-none relative"
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Print protection */}
      <style>{`
        @media print {
          body * {
            display: none !important;
          }
          body:after {
            content: "UNAUTHORIZED PRINT ATTEMPT - CONFIDENTIAL CLIENT PREVIEW ONLY";
            display: block !important;
            font-size: 24pt;
            text-align: center;
            padding: 50px;
            color: red;
          }
        }
      `}</style>

      {/* Security Toast Warning */}
      {warningMessage ? (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <span>⚠️</span> {warningMessage}
        </div>
      ) : null}

      {/* OWNER ADMIN BAR: Shown only when logged in as Mohammad Faisal Pirzada */}
      {isOwner ? (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white px-4 py-2 text-xs border-b border-indigo-700/50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                👑 OWNER MODE
              </span>
              <span className="font-semibold text-slate-200">
                Logged in as Master Sahib (Auto-unlocked)
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Key display and editing */}
              {isEditingKey ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    className="px-2 py-0.5 text-xs rounded bg-slate-800 text-white border border-indigo-400 font-mono focus:outline-none"
                    placeholder="New PIN/Key"
                  />
                  <button
                    disabled={isSavingKey}
                    onClick={handleSaveKey}
                    className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold"
                  >
                    {isSavingKey ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingKey(false)}
                    className="text-slate-300 hover:text-white px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-300">Client Key:</span>
                  <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-indigo-500/50 font-bold text-amber-300">
                    {project.accessKey || 'None'}
                  </span>
                  <button
                    onClick={() => {
                      setIsEditingKey(true);
                      setNewKeyValue(project.accessKey || '');
                    }}
                    className="text-indigo-300 hover:text-white text-xs flex items-center gap-0.5 underline ml-1"
                  >
                    <HiOutlinePencilAlt className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              )}

              <button
                onClick={copyClientShareLink}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 transition"
              >
                <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copy Client Link
              </button>

              <Link
                href="/client-projects"
                className="text-indigo-200 hover:text-white underline text-[11px]"
              >
                All Projects →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5">
              <HiOutlineShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              CLIENT PREVIEW
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {project.title}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Client: <span className="text-slate-700 dark:text-slate-300 font-medium">{project.clientName}</span> • Protected View
              </p>
            </div>
          </div>

          {/* Controls: Mode, Zoom, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                  viewMode === 'single'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Single Page Flip Mode"
              >
                <HiOutlineViewGrid className="w-3.5 h-3.5" />
                Single
              </button>
              <button
                onClick={() => setViewMode('scroll')}
                className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                  viewMode === 'scroll'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Continuous Document Scroll"
              >
                <HiOutlineViewList className="w-3.5 h-3.5" />
                All Pages
              </button>
            </div>

            {/* Zoom Controls (Single Mode) */}
            {viewMode === 'single' ? (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(70, prev - 15))}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
                  title="Zoom Out"
                >
                  <HiOutlineMinus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono text-slate-700 dark:text-slate-300">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(160, prev + 15))}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
                  title="Zoom In"
                >
                  <HiOutlinePlus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs"
              title="Toggle Fullscreen"
            >
              <HiOutlineArrowsExpand className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 overflow-y-auto">
        {viewMode === 'single' ? (
          /* Single Page / Slide Mode */
          <div className="w-full max-w-5xl flex flex-col items-center">
            {/* Page Navigation Top bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3 px-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activePage.title}</span>
              <div className="flex items-center gap-2">
                <span>
                  Page <strong className="text-slate-950 dark:text-white">{currentPage}</strong> of {totalPages}
                </span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                >
                  {project.pages.map((p) => (
                    <option key={p.pageNumber} value={p.pageNumber}>
                      Page {p.pageNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Page Canvas Container with Multi-Layer Protection & Watermark */}
            <div
              className="relative shadow-2xl rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 transition-transform duration-200"
              style={{
                width: `${Math.min(100, zoomLevel)}%`,
                maxWidth: `${(zoomLevel / 100) * 980}px`,
              }}
            >
              {/* The Page Image */}
              <div className="relative aspect-[1/1.414] w-full bg-white dark:bg-slate-900">
                <Image
                  src={activePage.imageSrc}
                  alt={activePage.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1000px"
                  priority
                  className="object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {/* LAYER 1: Diagonal Repeating Watermark Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none select-none z-10 flex items-center justify-center opacity-25 dark:opacity-30 mix-blend-darken dark:mix-blend-difference overflow-hidden"
                  aria-hidden="true"
                >
                  <div className="rotate-[-32deg] text-center space-y-16 scale-110 sm:scale-125 whitespace-nowrap text-slate-800 dark:text-white font-black tracking-widest text-xs sm:text-base uppercase select-none">
                    <p className="drop-shadow-sm">
                      {project.watermarkText}
                    </p>
                    <p className="drop-shadow-sm">
                      CONFIDENTIAL • {project.clientName} • NOT FOR PRINT
                    </p>
                    <p className="drop-shadow-sm">
                      {project.watermarkText}
                    </p>
                    <p className="drop-shadow-sm">
                      PREVIEW ONLY • THE MASTER SAHIB SERIES
                    </p>
                  </div>
                </div>

                {/* LAYER 2: Invisible Glass Click-Shield (Blocks right click / drag saving) */}
                <div
                  className="absolute inset-0 z-20 bg-transparent cursor-default"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    showToast('Right-click is disabled in client preview mode.');
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Flip Controls Navigation Bar */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                <HiOutlineChevronLeft className="w-4 h-4" /> Previous Page
              </button>

              <span className="text-xs font-mono px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 shadow-sm">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-teal-600/20"
              >
                Next Page <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="w-full mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-2.5 text-center uppercase tracking-wider">
                Jump to Page:
              </p>
              <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto pb-2 px-2 scrollbar-thin">
                {project.pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setCurrentPage(p.pageNumber)}
                    className={`flex-shrink-0 relative w-12 sm:w-16 aspect-[1/1.414] rounded-md overflow-hidden border-2 transition shadow-sm ${
                      currentPage === p.pageNumber
                        ? 'border-teal-500 ring-2 ring-teal-500/40 scale-105'
                        : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <Image
                      src={p.imageSrc}
                      alt={`Thumbnail ${p.pageNumber}`}
                      fill
                      className="object-cover pointer-events-none"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] font-bold text-center text-white py-0.5">
                      P.{p.pageNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Continuous Document Scroll Mode */
          <div className="w-full max-w-4xl space-y-8">
            {project.pages.map((p) => (
              <div
                key={p.pageNumber}
                className="relative shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-[11px] font-mono text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded font-bold">
                    Page {p.pageNumber}
                  </span>
                </div>

                <div className="relative aspect-[1/1.414] w-full bg-white dark:bg-slate-900">
                  <Image
                    src={p.imageSrc}
                    alt={p.title}
                    fill
                    sizes="(max-width: 1200px) 100vw, 900px"
                    className="object-contain pointer-events-none select-none"
                    draggable={false}
                  />

                  {/* Diagonal Repeating Watermark */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none z-10 flex items-center justify-center opacity-25 dark:opacity-30 mix-blend-darken dark:mix-blend-difference overflow-hidden"
                    aria-hidden="true"
                  >
                    <div className="rotate-[-32deg] text-center space-y-16 scale-110 sm:scale-125 whitespace-nowrap text-slate-800 dark:text-white font-black tracking-widest text-xs sm:text-base uppercase select-none">
                      <p>{project.watermarkText}</p>
                      <p>CONFIDENTIAL • {project.clientName} • NOT FOR PRINT</p>
                      <p>{project.watermarkText}</p>
                    </div>
                  </div>

                  {/* Invisible Glass Shield */}
                  <div
                    className="absolute inset-0 z-20 bg-transparent cursor-default"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      showToast('Right-click is disabled in client preview mode.');
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Client Approval & Payment Clearance Bar */}
      <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
              <span>📋</span> Reviewing as: {project.clientName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Watermarked Preview Mode. Pristine high-resolution printable PDF is delivered upon project clearance.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <a
              href={`https://wa.me/923458340669?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-600/25"
            >
              <FaWhatsapp className="w-4 h-4" />
              Approve Project & Request Final Files
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
