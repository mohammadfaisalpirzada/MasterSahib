'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineSearch,
  HiOutlinePrinter,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineFilter,
  HiOutlineX,
} from 'react-icons/hi';
import { getCurrentTheme } from '@/lib/theme';

export interface OcrLine {
  t: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IbaResultPageMeta {
  pageNumber: number;
  editionDate: string;
  newspaperPage: number;
  category: string;
  districts: string[];
  title: string;
  width: number;
  height: number;
  lines: OcrLine[];
}

export interface IbaResultSearchIndex {
  title: string;
  compiledBy: string;
  totalPages: number;
  pages: IbaResultPageMeta[];
}

interface SearchHit {
  pageNumber: number;
  editionDate: string;
  newspaperPage: number;
  category: string;
  districts: string[];
  line: OcrLine;
  matchIndex: number;
}

const PRIVATE_OWNER_QUERY_TERMS = [
  'peerzada',
  'pirzada',
  'peerzado',
  'pirzado',
  '129050',
  '4210113754699',
  'kiffayat',
  'kifayat',
  'm.faisal',
  'm faisal',
  'mohammad faisal',
  'muhammad faisal',
];

export default function IbaResultViewerClient({
  searchIndex,
  isOwner = false,
}: {
  searchIndex: IbaResultSearchIndex;
  isOwner?: boolean;
}) {
  const theme = getCurrentTheme();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [zoom, setZoom] = useState<number>(1.0);
  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(false);
  const [activeHighlight, setActiveHighlight] = useState<OcrLine | null>(null);
  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [showMobileDirectory, setShowMobileDirectory] = useState<boolean>(false);

  // Pan & Magnifier state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const [lensPos, setLensPos] = useState<{ visible: boolean; x: number; y: number; imgX: number; imgY: number }>({
    visible: false,
    x: 0,
    y: 0,
    imgX: 0,
    imgY: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerSectionRef = useRef<HTMLElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const totalPages = searchIndex.totalPages;

  const currentPageMeta = useMemo(() => {
    return searchIndex.pages.find((p) => p.pageNumber === currentPage) || searchIndex.pages[0];
  }, [searchIndex.pages, currentPage]);

  // Auto-fit zoom on mobile screens on initial mount so the single-table page fits cleanly without overflowing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vw = window.innerWidth;
      if (vw < 640) {
        const pageW = currentPageMeta?.width || 695;
        const fitScale = Math.max(0.48, Math.min(1.0, Number(((vw - 36) / pageW).toFixed(2))));
        setZoom(fitScale);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All unique districts across the 70 pages
  const allDistricts = useMemo(() => {
    const set = new Set<string>();
    searchIndex.pages.forEach((p) => p.districts.forEach((d) => set.add(d)));
    return ['All', ...Array.from(set).sort()];
  }, [searchIndex.pages]);

  // Pages filtered by District / Category
  const filteredPages = useMemo(() => {
    return searchIndex.pages.filter((p) => {
      const matchDist = selectedDistrict === 'All' || p.districts.includes(selectedDistrict);
      const matchCat =
        selectedCategory === 'All' ||
        (selectedCategory === 'PST' && p.category.includes('PST')) ||
        (selectedCategory === 'JST' && p.category.includes('JST'));
      return matchDist && matchCat;
    });
  }, [searchIndex.pages, selectedDistrict, selectedCategory]);

  // Global OCR Search across all 70 pages
  const searchResults = useMemo<SearchHit[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    // Block any search query targeting Mohammad Faisal Peerzada's record unless logged in as mohammadfaisalpirzada@gmail.com
    if (!isOwner && PRIVATE_OWNER_QUERY_TERMS.some((term) => q.includes(term))) {
      return [];
    }

    const tokens = q.split(/\s+/).filter(Boolean);
    const hits: SearchHit[] = [];

    for (const page of searchIndex.pages) {
      if (selectedDistrict !== 'All' && !page.districts.includes(selectedDistrict)) continue;
      if (
        selectedCategory !== 'All' &&
        !page.category.toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        continue;
      }

      for (let i = 0; i < page.lines.length; i++) {
        const line = page.lines[i];
        const lowerLine = line.t.toLowerCase();
        const isMatch = tokens.every((tok) => lowerLine.includes(tok));
        if (isMatch) {
          hits.push({
            pageNumber: page.pageNumber,
            editionDate: page.editionDate,
            newspaperPage: page.newspaperPage,
            category: page.category,
            districts: page.districts,
            line,
            matchIndex: i,
          });
          if (hits.length >= 120) break;
        }
      }
      if (hits.length >= 120) break;
    }
    return hits;
  }, [searchQuery, searchIndex.pages, selectedDistrict, selectedCategory, isOwner]);

  // Matches on the currently opened page
  const currentPageMatches = useMemo<OcrLine[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!isOwner && PRIVATE_OWNER_QUERY_TERMS.some((term) => q.includes(term))) {
      return [];
    }
    if (q.length < 2) return activeHighlight ? [activeHighlight] : [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const matches = currentPageMeta.lines.filter((line) => {
      const lower = line.t.toLowerCase();
      return tokens.every((tok) => lower.includes(tok));
    });
    if (activeHighlight && !matches.includes(activeHighlight)) {
      return [activeHighlight, ...matches];
    }
    return matches;
  }, [searchQuery, currentPageMeta, activeHighlight, isOwner]);

  // Draw the current page image + highlight boxes onto protected HTML5 Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw yellow highlight boxes for matched teacher rows
    if (currentPageMatches.length > 0) {
      for (const match of currentPageMatches) {
        const isPrimary =
          activeHighlight &&
          activeHighlight.x === match.x &&
          activeHighlight.y === match.y &&
          activeHighlight.t === match.t;

        const padX = 12;
        const padY = 8;
        const rx = Math.max(0, match.x - padX);
        const ry = Math.max(0, match.y - padY);
        const rw = Math.min(canvas.width - rx, Math.max(match.w + padX * 2, 580));
        const rh = Math.max(24, match.h + padY * 2);

        ctx.save();
        ctx.fillStyle = isPrimary ? 'rgba(250, 204, 21, 0.42)' : 'rgba(13, 148, 136, 0.28)';
        ctx.fillRect(rx, ry, rw, rh);

        ctx.lineWidth = isPrimary ? 4 : 2.5;
        ctx.strokeStyle = isPrimary ? '#dc2626' : '#0f766e';
        ctx.strokeRect(rx, ry, rw, rh);

        if (isPrimary) {
          const badgeW = 115;
          const badgeH = 24;
          const bx = Math.max(6, rx);
          const by = Math.max(4, ry - badgeH - 2);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(bx, by, badgeW, badgeH);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px Arial, sans-serif';
          ctx.fillText('FOUND HERE', bx + 10, by + 17);
        }
        ctx.restore();
      }
    }
  }, [currentPageMatches, activeHighlight]);

  // Scroll the viewer container to bring the active highlight into the center of the viewport
  const scrollToHighlight = useCallback(
    (line: OcrLine, targetZoom?: number) => {
      const container = scrollContainerRef.current;
      if (!container || !currentPageMeta) return;
      const z = targetZoom ?? zoom;

      const centerX = (line.x + line.w / 2) * z;
      const centerY = (line.y + line.h / 2) * z;

      const nextScrollLeft = Math.max(0, centerX - container.clientWidth / 2);
      const nextScrollTop = Math.max(0, centerY - container.clientHeight / 2);

      container.scrollTo({
        left: nextScrollLeft,
        top: nextScrollTop,
        behavior: 'smooth',
      });
    },
    [currentPageMeta, zoom]
  );

  // Fetch single page image via protected API when currentPage changes
  useEffect(() => {
    let cancelled = false;
    setLoadingPage(true);
    setLoadError('');

    (async () => {
      try {
        const res = await fetch(`/api/iba-result-2008/page/${currentPage}`, {
          headers: {
            'x-ms-viewer': 'iba-2008',
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to load page ${currentPage}`);
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          if (cancelled) {
            URL.revokeObjectURL(objectUrl);
            return;
          }
          loadedImageRef.current = img;
          setLoadingPage(false);
          drawCanvas();
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          if (!cancelled) {
            setLoadError('Unable to render official scan page. Please refresh.');
            setLoadingPage(false);
          }
        };
        img.src = objectUrl;
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Error loading page');
          setLoadingPage(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, drawCanvas]);

  // Redraw canvas whenever highlights change
  useEffect(() => {
    if (!loadingPage) {
      drawCanvas();
    }
  }, [loadingPage, drawCanvas]);

  // Fit-to-screen helper for mobile and desktop
  const handleFitZoom = () => {
    const container = scrollContainerRef.current;
    const pageW = currentPageMeta?.width || 695;
    if (container) {
      const availW = Math.max(280, container.clientWidth - 24);
      const nextZoom = Math.max(0.45, Math.min(1.4, Number((availW / pageW).toFixed(2))));
      setZoom(nextZoom);
    } else {
      setZoom(0.75);
    }
  };

  // When user clicks a search result: jump to that page, zoom in clearly, and scroll to the exact row
  const handleSelectHit = (hit: SearchHit) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const newZoom = isMobile ? Math.max(zoom, 1.15) : Math.max(zoom, 1.45);
    setZoom(newZoom);
    setActiveHighlight(hit.line);

    // On mobile, smoothly scroll down to the viewer section so the teacher immediately sees their highlighted row
    if (isMobile && viewerSectionRef.current) {
      viewerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (hit.pageNumber !== currentPage) {
      setCurrentPage(hit.pageNumber);
      setTimeout(() => {
        scrollToHighlight(hit.line, newZoom);
      }, 340);
    } else {
      setTimeout(() => {
        scrollToHighlight(hit.line, newZoom);
      }, 80);
    }
  };

  // Print ONLY the currently viewed official page in high resolution
  const handlePrintCurrentPage = () => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(img, 0, 0);

    if (activeHighlight) {
      const padX = 12;
      const padY = 6;
      const rx = Math.max(0, activeHighlight.x - padX);
      const ry = Math.max(0, activeHighlight.y - padY);
      const rw = Math.min(tempCanvas.width - rx, Math.max(activeHighlight.w + padX * 2, 560));
      const rh = Math.max(22, activeHighlight.h + padY * 2);
      tCtx.save();
      tCtx.lineWidth = 3;
      tCtx.strokeStyle = '#dc2626';
      tCtx.strokeRect(rx, ry, rw, rh);
      tCtx.restore();
    }

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
    const printWin = window.open('', '_blank', 'width=950,height=1200');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>IBA Test Result 2008 - Page ${currentPage} - Compiled by Master Sahib</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              background: #ffffff;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .print-header {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #1e293b;
              border-bottom: 1.5px solid #0f172a;
              padding-bottom: 4px;
              margin-bottom: 6px;
            }
            .print-header strong {
              font-weight: 700;
            }
            img {
              max-width: 100%;
              max-height: 94vh;
              width: auto;
              height: auto;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <span><strong>Official Sukkur IBA PST &amp; JST Test Result 2008</strong> (${currentPageMeta.title})</span>
            <span><strong>Compiled by Master Sahib</strong> | www.themastersahib.com</span>
          </div>
          <img src="${dataUrl}" onload="setTimeout(function(){ window.focus(); window.print(); }, 250);" />
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Mouse drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    const canvas = canvasRef.current;
    if (isDragging && container) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      container.scrollLeft = dragStart.scrollLeft - dx;
      container.scrollTop = dragStart.scrollTop - dy;
    }

    if (magnifierEnabled && canvas && loadedImageRef.current) {
      const rect = canvas.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      if (relX >= 0 && relY >= 0 && relX <= rect.width && relY <= rect.height) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        setLensPos({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          imgX: relX * scaleX,
          imgY: relY * scaleY,
        });
      } else {
        setLensPos((prev) => ({ ...prev, visible: false }));
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setLensPos((prev) => ({ ...prev, visible: false }));
  };

  // Prevent Ctrl+S bulk save
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const displayWidth = Math.round((currentPageMeta?.width || 695) * zoom);
  const displayHeight = Math.round((currentPageMeta?.height || 2140) * zoom);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-screen select-none pb-12"
      style={{ backgroundColor: theme.bgMain, color: theme.textPrimary }}
    >
      {/* Top Light & Sober Official Hero Section matching MasterSahib global theme */}
      <header
        className="border-b px-3 py-4 shadow-sm sm:px-6 sm:py-5"
        style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
      >
        <div className="mx-auto flex max-w-[1550px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider sm:text-xs"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              >
                <HiOutlineShieldCheck className="h-4 w-4" />
                Official 2008 Newspaper Gazette
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 sm:text-xs">
                Compiled by Master Sahib | www.themastersahib.com
              </span>
            </div>
            <h1
              className="mt-2 text-xl font-black tracking-tight sm:text-2xl lg:text-3xl"
              style={{ color: theme.textPrimary }}
            >
              Sukkur IBA PST &amp; JST Test Result 2008 — Searchable Gazette
            </h1>
            <p className="mt-1 text-xs leading-relaxed sm:text-sm" style={{ color: theme.textSecondary }}>
              Heartiest Congratulations to Batch 2008 Teachers! Search your Name, Father Name, Seat Number (BDN, DAD, HYD, KHI, LRK, NSH, SGR), or CNIC across all 70 pages, zoom clearly, and print your official page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">
            <button
              onClick={handlePrintCurrentPage}
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: theme.primary }}
            >
              <HiOutlinePrinter className="h-5 w-5" />
              Print Page #{currentPage} (A4)
            </button>
            <Link
              href="/pay-fixation-2008"
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border bg-white px-3.5 py-2.5 text-xs font-bold shadow-sm transition hover:bg-slate-50"
              style={{ borderColor: theme.borderSubtle, color: theme.textPrimary }}
            >
              <HiOutlineDocumentText className="h-4 w-4" style={{ color: theme.primary }} />
              2008 Pay Fixation Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Mobile-First Search & Controls + High-Clarity Light Canvas Viewer */}
      <div className="mx-auto grid max-w-[1550px] grid-cols-1 gap-4 p-3 sm:p-5 lg:grid-cols-12">
        {/* Left Sidebar: Global Search + District Filter + Page Directory */}
        <aside className="flex flex-col gap-4 lg:col-span-4 xl:col-span-3">
          {/* Global Search Card */}
          <div
            className="rounded-2xl border p-4 shadow-sm"
            style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
          >
            <label
              className="block text-xs font-bold uppercase tracking-wider"
              style={{ color: theme.primary }}
            >
              Search All 70 Official Pages
            </label>
            <div className="relative mt-2">
              <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Name, Seat No, or CNIC..."
                className="w-full rounded-xl border bg-slate-50/70 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2"
                style={{ borderColor: theme.borderSubtle }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveHighlight(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Clear search"
                >
                  <HiOutlineX className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category & District Filters */}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Category (PST / JST)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-slate-50/70 px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                  style={{ borderColor: theme.borderSubtle }}
                >
                  <option value="All">All Categories</option>
                  <option value="PST">PST (Primary)</option>
                  <option value="JST">JST (Junior)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Select District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const dist = e.target.value;
                    setSelectedDistrict(dist);
                    if (dist !== 'All') {
                      const firstMatch = searchIndex.pages.find((p) => p.districts.includes(dist));
                      if (firstMatch) setCurrentPage(firstMatch.pageNumber);
                    }
                  }}
                  className="mt-1 w-full rounded-xl border bg-slate-50/70 px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white"
                  style={{ borderColor: theme.borderSubtle }}
                >
                  {allDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Search Results across all pages */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Matching Records ({searchResults.length}{searchResults.length >= 120 ? '+' : ''})
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: theme.primary }}>
                    Tap row to open &amp; zoom
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div
                    className="mt-2 rounded-xl border p-3 text-xs leading-relaxed text-slate-600"
                    style={{ backgroundColor: theme.bgCardMuted, borderColor: theme.borderSubtle }}
                  >
                    No direct OCR match for &ldquo;{searchQuery}&rdquo;. Try searching by only your first name, father name, first 6 digits of CNIC, or select your District above to browse the page directly.
                  </div>
                ) : (
                  <div className="mt-2 max-h-[280px] sm:max-h-[340px] space-y-2 overflow-y-auto pr-1">
                    {searchResults.map((hit, idx) => {
                      const isSelected =
                        currentPage === hit.pageNumber &&
                        activeHighlight?.x === hit.line.x &&
                        activeHighlight?.y === hit.line.y;
                      return (
                        <button
                          key={`${hit.pageNumber}-${hit.matchIndex}-${idx}`}
                          onClick={() => handleSelectHit(hit)}
                          className={`w-full rounded-xl border p-2.5 text-left transition shadow-sm ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400/50'
                              : 'border-slate-200 bg-white hover:border-teal-500 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                            >
                              Page {hit.pageNumber} of {totalPages}
                            </span>
                            <span className="truncate text-[11px] font-bold text-slate-600">
                              {hit.districts.join(', ')}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 font-mono text-xs font-semibold text-slate-900">
                            {hit.line.t}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-slate-500">
                            {hit.category} • {hit.editionDate} (Kawish Page {hit.newspaperPage})
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Page-by-Page Directory Card (Collapsible on Mobile for clean screen space) */}
          <div
            className="rounded-2xl border p-4 shadow-sm"
            style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <HiOutlineFilter className="h-4 w-4" style={{ color: theme.primary }} />
                Page-Wise Index ({filteredPages.length} Pages)
              </span>
              <button
                type="button"
                onClick={() => setShowMobileDirectory((v) => !v)}
                className="rounded-lg border px-2.5 py-1 text-[11px] font-bold lg:hidden"
                style={{ borderColor: theme.borderSubtle, color: theme.primary }}
              >
                {showMobileDirectory ? 'Hide List' : 'Show All Pages'}
              </button>
            </div>

            <div
              className={`mt-2.5 max-h-[340px] space-y-1.5 overflow-y-auto pr-1 ${
                showMobileDirectory ? 'block' : 'hidden lg:block'
              }`}
            >
              {filteredPages.map((p) => {
                const active = p.pageNumber === currentPage;
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      setCurrentPage(p.pageNumber);
                      setActiveHighlight(null);
                      setShowMobileDirectory(false);
                    }}
                    className={`flex w-full items-start justify-between gap-2 rounded-xl border p-2.5 text-left transition ${
                      active
                        ? 'border-teal-600 bg-teal-50/80 shadow-sm'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="inline-flex h-5 items-center rounded px-1.5 text-[11px] font-bold text-white"
                          style={{ backgroundColor: active ? theme.primary : '#475569' }}
                        >
                          Page {String(p.pageNumber).padStart(2, '0')}
                        </span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                          {p.category.startsWith('JST') ? 'JST' : 'PST'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {p.editionDate} (P.{p.newspaperPage})
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-slate-800">
                        District: {p.districts.join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Viewer Area */}
        <section ref={viewerSectionRef} className="flex flex-col gap-3 lg:col-span-8 xl:col-span-9">
          {/* Mobile & Desktop Friendly Control Toolbar */}
          <div
            className="flex flex-col gap-3 rounded-2xl border p-3 sm:px-4 sm:py-3 shadow-sm xl:flex-row xl:items-center xl:justify-between"
            style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
          >
            {/* Row 1: Page Navigation */}
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  setActiveHighlight(null);
                }}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-xl border bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                style={{ borderColor: theme.borderSubtle }}
              >
                <HiOutlineChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <div
                className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border bg-slate-50 px-2.5 py-1.5 text-xs font-bold"
                style={{ borderColor: theme.borderSubtle }}
              >
                <span className="hidden sm:inline text-slate-500">Page</span>
                <select
                  value={currentPage}
                  onChange={(e) => {
                    setCurrentPage(Number(e.target.value));
                    setActiveHighlight(null);
                  }}
                  className="max-w-[190px] sm:max-w-[260px] truncate bg-transparent font-bold outline-none"
                  style={{ color: theme.primary }}
                >
                  {searchIndex.pages.map((p) => (
                    <option key={p.pageNumber} value={p.pageNumber} className="bg-white text-slate-900">
                      Page {p.pageNumber} of {totalPages} — {p.districts.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  setActiveHighlight(null);
                }}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                style={{ borderColor: theme.borderSubtle }}
              >
                Next
                <HiOutlineChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Row 2: High-Clarity Zoom Controls & Print */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:justify-start">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.2).toFixed(2))))}
                  className="inline-flex items-center rounded-xl border bg-white p-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                  style={{ borderColor: theme.borderSubtle }}
                  title="Zoom Out"
                >
                  <HiOutlineZoomOut className="h-4 w-4" />
                </button>

                <button
                  onClick={handleFitZoom}
                  className="rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  style={{ borderColor: theme.borderSubtle }}
                >
                  Fit Screen
                </button>

                {[
                  { label: '100%', val: 1.0 },
                  { label: '150%', val: 1.5 },
                  { label: '200%', val: 2.0 },
                  { label: '250%', val: 2.5 },
                ].map((preset) => {
                  const isActive = Math.abs(zoom - preset.val) < 0.08;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setZoom(preset.val)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'border bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: theme.primary }
                          : { borderColor: theme.borderSubtle }
                      }
                    >
                      {preset.label}
                    </button>
                  );
                })}

                <button
                  onClick={() => setZoom((z) => Math.min(3.2, Number((z + 0.2).toFixed(2))))}
                  className="inline-flex items-center rounded-xl border bg-white p-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                  style={{ borderColor: theme.borderSubtle }}
                  title="Zoom In"
                >
                  <HiOutlineZoomIn className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMagnifierEnabled((m) => !m)}
                  className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    magnifierEnabled
                      ? 'border-amber-500 bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  style={!magnifierEnabled ? { borderColor: theme.borderSubtle } : undefined}
                  title="Toggle Magnifier Lens to inspect small print"
                >
                  <HiOutlineSearch className="h-4 w-4" />
                  {magnifierEnabled ? 'Lens ON' : 'Lens'}
                </button>

                <button
                  onClick={handlePrintCurrentPage}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                  style={{ backgroundColor: theme.primary }}
                >
                  <HiOutlinePrinter className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Current Page Info Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-xs"
            style={{ backgroundColor: theme.bgCardMuted, borderColor: theme.borderSubtle }}
          >
            <div className="min-w-0">
              <span className="font-bold text-slate-900">{currentPageMeta.title}</span>
              <span className="ml-2 hidden sm:inline text-slate-600">
                • Swipe or drag to move around when zoomed in
              </span>
            </div>
            <div className="flex items-center gap-3">
              {currentPageMatches.length > 0 && (
                <span className="rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 font-bold text-red-700">
                  {currentPageMatches.length} highlighted match(es) on this page
                </span>
              )}
              <span className="font-bold" style={{ color: theme.primary }}>
                Compiled by Master Sahib
              </span>
            </div>
          </div>

          {/* Scrollable High-Zoom Light Canvas Container */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`relative h-[74vh] sm:h-[80vh] w-full overflow-auto rounded-2xl border bg-slate-200/70 p-2 sm:p-4 shadow-inner ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ borderColor: theme.borderSubtle, WebkitOverflowScrolling: 'touch' }}
          >
            {loadingPage && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
                <HiOutlineRefresh className="h-10 w-10 animate-spin" style={{ color: theme.primary }} />
                <p className="mt-3 text-sm font-bold text-slate-900">
                  Loading Official Gazette Page {currentPage} of {totalPages}...
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Compiled by Master Sahib • www.themastersahib.com
                </p>
              </div>
            )}

            {loadError && (
              <div className="my-12 mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
                <p className="text-sm font-bold text-rose-800">{loadError}</p>
                <button
                  onClick={() => setCurrentPage((p) => p)}
                  className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Retry Loading Page
                </button>
              </div>
            )}

            <div
              className="relative mx-auto transition-all duration-150"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                }}
                className="block rounded-xl border border-slate-300 bg-white shadow-lg"
              />

              {/* Subtle non-intrusive security watermark overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between overflow-hidden p-6 sm:p-10 opacity-10">
                <div className="flex justify-between text-xs sm:text-base font-black uppercase tracking-widest text-slate-800">
                  <span>www.themastersahib.com</span>
                  <span>Compiled by Master Sahib</span>
                </div>
                <div className="flex justify-center -rotate-12 text-lg sm:text-2xl font-black uppercase tracking-widest text-slate-800">
                  Compiled by Master Sahib • www.themastersahib.com
                </div>
                <div className="flex justify-between text-xs sm:text-base font-black uppercase tracking-widest text-slate-800">
                  <span>Compiled by Master Sahib</span>
                  <span>www.themastersahib.com</span>
                </div>
              </div>
            </div>

            {/* Floating Magnifier Lens when enabled */}
            {magnifierEnabled && lensPos.visible && loadedImageRef.current && (
              <div
                className="pointer-events-none fixed z-50 overflow-hidden rounded-full border-4 border-amber-500 bg-white shadow-2xl"
                style={{
                  width: '250px',
                  height: '250px',
                  left: `${lensPos.x - 125}px`,
                  top: `${lensPos.y - 155}px`,
                  backgroundImage: `url(${canvasRef.current?.toDataURL('image/jpeg', 0.9)})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${loadedImageRef.current.naturalWidth * 2.5}px ${
                    loadedImageRef.current.naturalHeight * 2.5
                  }px`,
                  backgroundPosition: `${-lensPos.imgX * 2.5 + 125}px ${-lensPos.imgY * 2.5 + 125}px`,
                }}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
