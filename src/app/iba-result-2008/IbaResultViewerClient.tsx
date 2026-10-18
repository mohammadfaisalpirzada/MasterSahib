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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [zoom, setZoom] = useState<number>(1.0);
  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(false);
  const [activeHighlight, setActiveHighlight] = useState<OcrLine | null>(null);
  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

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
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const totalPages = searchIndex.totalPages;

  const currentPageMeta = useMemo(() => {
    return searchIndex.pages.find((p) => p.pageNumber === currentPage) || searchIndex.pages[0];
  }, [searchIndex.pages, currentPage]);

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
  }, [searchQuery, currentPageMeta, activeHighlight]);

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

        const padX = 14;
        const padY = 8;
        const rx = Math.max(0, match.x - padX);
        const ry = Math.max(0, match.y - padY);
        const rw = Math.min(canvas.width - rx, Math.max(match.w + padX * 2, 580));
        const rh = Math.max(24, match.h + padY * 2);

        ctx.save();
        ctx.fillStyle = isPrimary ? 'rgba(250, 204, 21, 0.42)' : 'rgba(56, 189, 248, 0.30)';
        ctx.fillRect(rx, ry, rw, rh);

        ctx.lineWidth = isPrimary ? 4 : 2.5;
        ctx.strokeStyle = isPrimary ? '#dc2626' : '#0284c7';
        ctx.strokeRect(rx, ry, rw, rh);

        if (isPrimary) {
          // Draw a bold pointer badge on the left of the row
          const badgeW = 115;
          const badgeH = 26;
          const bx = Math.max(4, rx - badgeW - 6);
          const by = ry + (rh - badgeH) / 2;
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(bx, by, badgeW, badgeH);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText('FOUND HERE', bx + 10, by + 18);
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

  // When user clicks a search result: jump to that page, zoom in clearly, and scroll to the exact row
  const handleSelectHit = (hit: SearchHit) => {
    const newZoom = Math.max(zoom, 1.55);
    setZoom(newZoom);
    setActiveHighlight(hit.line);
    if (hit.pageNumber !== currentPage) {
      setCurrentPage(hit.pageNumber);
      setTimeout(() => {
        scrollToHighlight(hit.line, newZoom);
      }, 320);
    } else {
      setTimeout(() => {
        scrollToHighlight(hit.line, newZoom);
      }, 60);
    }
  };

  // Print ONLY the currently viewed official page in high resolution
  const handlePrintCurrentPage = () => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    // Create a clean high-resolution image of the current page (including attribution footer)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(img, 0, 0);

    // If there is an active highlight, optionally outline it subtly so the teacher can spot their row on paper too
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

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const displayWidth = Math.round((currentPageMeta?.width || 1374) * zoom);
  const displayHeight = Math.round((currentPageMeta?.height || 2094) * zoom);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-screen select-none bg-slate-950 text-slate-100"
    >
      {/* Top Official Banner */}
      <header className="border-b border-slate-800 bg-slate-900/95 px-4 py-4 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 border border-cyan-500/30">
                <HiOutlineShieldCheck className="h-4 w-4" />
                Official Newspaper Gazette Archive (2008)
              </span>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
                Compiled by Master Sahib | www.themastersahib.com
              </span>
            </div>
            <h1 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
              Sukkur IBA PST &amp; JST Test Result 2008 — Searchable Official Record
            </h1>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              Search your Name, Father/Husband Name, Seat Number (e.g. BDN, DAD, HYD, KHI, LRK, NSH, SGR), or CNIC across all 70 pages and print your exact official page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintCurrentPage}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md transition hover:bg-emerald-400"
            >
              <HiOutlinePrinter className="h-5 w-5" />
              Print This Page (#{currentPage})
            </button>
            <Link
              href="/pay-fixation-2008"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <HiOutlineDocumentText className="h-4 w-4 text-cyan-400" />
              2008 Pay Fixation Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Left Search & Directory Panel + Right High-Zoom Official Canvas Viewer */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-12">
        {/* Left Sidebar: Global Search + District Filter + Page Directory */}
        <aside className="flex flex-col gap-4 lg:col-span-4 xl:col-span-3">
          {/* Global Search Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
              Search All 70 Official Pages
            </label>
            <div className="relative mt-2">
              <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type Name, Seat No, or CNIC..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-9 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveHighlight(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  title="Clear search"
                >
                  <HiOutlineX className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category & District Filters */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400">
                  Category (PST / JST)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="All">All Categories</option>
                  <option value="PST">PST (Primary)</option>
                  <option value="JST">JST (Junior)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400">
                  District Filter
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
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
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
                  <span className="font-bold text-slate-300">
                    Matching Records ({searchResults.length}{searchResults.length >= 120 ? '+' : ''})
                  </span>
                  <span className="text-[11px] text-cyan-400">Click row to open page &amp; zoom</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
                    No direct OCR match for &ldquo;{searchQuery}&rdquo;. Because old 2008 newspaper print can have faint letters, try searching by only the first name, father name, first 6 digits of CNIC, or select your District below to inspect the page directly.
                  </div>
                ) : (
                  <div className="mt-2 max-h-[340px] space-y-1.5 overflow-y-auto pr-1">
                    {searchResults.map((hit, idx) => {
                      const isSelected =
                        currentPage === hit.pageNumber &&
                        activeHighlight?.x === hit.line.x &&
                        activeHighlight?.y === hit.line.y;
                      return (
                        <button
                          key={`${hit.pageNumber}-${hit.matchIndex}-${idx}`}
                          onClick={() => handleSelectHit(hit)}
                          className={`w-full rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/15 text-white'
                              : 'border-slate-800 bg-slate-950/80 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[11px] font-bold text-cyan-300">
                              Page {hit.pageNumber} of {totalPages}
                            </span>
                            <span className="truncate text-[11px] font-medium text-slate-400">
                              {hit.districts.join(', ')}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 font-mono text-xs text-slate-100">
                            {hit.line.t}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
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

          {/* Page-by-Page Directory Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <HiOutlineFilter className="h-4 w-4 text-cyan-400" />
                Page-Wise Index ({filteredPages.length} Pages)
              </span>
              <span className="text-[11px] text-slate-400">Sorted by Edition &amp; Page</span>
            </div>

            <div className="mt-2.5 max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
              {filteredPages.map((p) => {
                const active = p.pageNumber === currentPage;
                return (
                  <button
                    key={p.pageNumber}
                    onClick={() => {
                      setCurrentPage(p.pageNumber);
                      setActiveHighlight(null);
                    }}
                    className={`flex w-full items-start justify-between gap-2 rounded-xl border p-2.5 text-left transition ${
                      active
                        ? 'border-cyan-400 bg-cyan-500/15 text-white shadow'
                        : 'border-slate-800/90 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-5 items-center rounded px-1.5 text-[11px] font-bold ${
                            active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Page {String(p.pageNumber).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-300">
                          {p.category.startsWith('JST') ? 'JST' : 'PST'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.editionDate} (Kawish P.{p.newspaperPage})
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium text-slate-200">
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
        <section className="flex flex-col gap-3 lg:col-span-8 xl:col-span-9">
          {/* Viewer Control Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 shadow-xl">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  setActiveHighlight(null);
                }}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-40"
              >
                <HiOutlineChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold">
                <span className="text-slate-400">Page</span>
                <select
                  value={currentPage}
                  onChange={(e) => {
                    setCurrentPage(Number(e.target.value));
                    setActiveHighlight(null);
                  }}
                  className="bg-transparent font-bold text-cyan-300 outline-none"
                >
                  {searchIndex.pages.map((p) => (
                    <option key={p.pageNumber} value={p.pageNumber} className="bg-slate-900 text-white">
                      {p.pageNumber} — {p.districts.join(', ')} (Kawish P.{p.newspaperPage})
                    </option>
                  ))}
                </select>
                <span className="text-slate-400">of {totalPages}</span>
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  setActiveHighlight(null);
                }}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-40"
              >
                Next
                <HiOutlineChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* High-Clarity Zoom Controls for Teachers */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.25).toFixed(2))))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                title="Zoom Out"
              >
                <HiOutlineZoomOut className="h-4 w-4" />
              </button>

              {[
                { label: 'Fit', val: 0.75 },
                { label: '100%', val: 1.0 },
                { label: '150%', val: 1.5 },
                { label: '200%', val: 2.0 },
                { label: '250%', val: 2.5 },
                { label: '300%', val: 3.0 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setZoom(preset.val)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    Math.abs(zoom - preset.val) < 0.08
                      ? 'bg-cyan-500 text-slate-950'
                      : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <button
                onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.25).toFixed(2))))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                title="Zoom In"
              >
                <HiOutlineZoomIn className="h-4 w-4" />
              </button>

              <button
                onClick={() => setMagnifierEnabled((m) => !m)}
                className={`ml-1 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  magnifierEnabled
                    ? 'border-amber-400 bg-amber-500 text-slate-950'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Toggle Magnifier Lens to inspect small print"
              >
                <HiOutlineSearch className="h-4 w-4" />
                {magnifierEnabled ? 'Magnifier ON' : 'Magnifier Lens'}
              </button>

              <button
                onClick={handlePrintCurrentPage}
                className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <HiOutlinePrinter className="h-4 w-4" />
                Print Page
              </button>
            </div>
          </div>

          {/* Current Page Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs text-slate-300">
            <div>
              <span className="font-bold text-white">{currentPageMeta.title}</span>
              <span className="ml-2 text-slate-400">
                • Drag with mouse/finger to pan around the zoomed page
              </span>
            </div>
            <div className="flex items-center gap-3">
              {currentPageMatches.length > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-bold text-amber-300 border border-amber-500/40">
                  {currentPageMatches.length} highlighted match(es) on this page
                </span>
              )}
              <span className="font-semibold text-cyan-300">
                Compiled by Master Sahib | www.themastersahib.com
              </span>
            </div>
          </div>

          {/* Scrollable High-Zoom Canvas Container */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`relative h-[78vh] w-full overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-4 shadow-2xl ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {loadingPage && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <HiOutlineRefresh className="h-10 w-10 animate-spin text-cyan-400" />
                <p className="mt-3 text-sm font-bold text-white">
                  Loading Official High-Resolution Page {currentPage} of {totalPages}...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Compiled by Master Sahib • www.themastersahib.com
                </p>
              </div>
            )}

            {loadError && (
              <div className="my-12 mx-auto max-w-md rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6 text-center">
                <p className="text-sm font-bold text-rose-300">{loadError}</p>
                <button
                  onClick={() => setCurrentPage((p) => p)}
                  className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white"
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
                className="block rounded-lg bg-white shadow-2xl"
              />

              {/* Subtle non-intrusive security watermark overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between overflow-hidden p-10 opacity-15">
                <div className="flex justify-between text-lg font-black uppercase tracking-widest text-slate-700">
                  <span>www.themastersahib.com</span>
                  <span>Compiled by Master Sahib</span>
                </div>
                <div className="flex justify-center -rotate-12 text-3xl font-black uppercase tracking-widest text-slate-700">
                  Compiled by Master Sahib • www.themastersahib.com
                </div>
                <div className="flex justify-between text-lg font-black uppercase tracking-widest text-slate-700">
                  <span>Compiled by Master Sahib</span>
                  <span>www.themastersahib.com</span>
                </div>
              </div>
            </div>

            {/* Floating Magnifier Lens when enabled */}
            {magnifierEnabled && lensPos.visible && loadedImageRef.current && (
              <div
                className="pointer-events-none fixed z-50 overflow-hidden rounded-full border-4 border-amber-400 bg-white shadow-2xl"
                style={{
                  width: '260px',
                  height: '260px',
                  left: `${lensPos.x - 130}px`,
                  top: `${lensPos.y - 160}px`,
                  backgroundImage: `url(${canvasRef.current?.toDataURL('image/jpeg', 0.9)})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${loadedImageRef.current.naturalWidth * 2.6}px ${
                    loadedImageRef.current.naturalHeight * 2.6
                  }px`,
                  backgroundPosition: `${-lensPos.imgX * 2.6 + 130}px ${-lensPos.imgY * 2.6 + 130}px`,
                }}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
