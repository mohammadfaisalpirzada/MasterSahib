'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import ShapesTab from './tabs/ShapesTab';
import ColorsTab from './tabs/ColorsTab';
import SightTab from './tabs/SightTab';
import D3Tab from './tabs/D3Tab';
import TeenTab from './tabs/TeenTab';
import TyTab from './tabs/TyTab';
import SpellTab from './tabs/SpellTab';
import BlanksTab from './tabs/BlanksTab';
import DaysTab from './tabs/DaysTab';
import VegTab from './tabs/VegTab';
import GardenTab from './tabs/GardenTab';
import KitchenTab from './tabs/KitchenTab';
import OccupationTab from './tabs/OccupationTab';
import BirdsTab from './tabs/BirdsTab';
import AnimalsTab from './tabs/AnimalsTab';
import MonthsTab from './tabs/MonthsTab';

type Tab = 'shapes' | 'colors' | 'sight' | 'd3' | 'spell' | 'blanks' | 'teen' | 'ty' | 'days' | 'veg' | 'garden' | 'kitchen' | 'occupation' | 'birds' | 'animals' | 'months';

const tabs: { key: Tab; icon: string; label: string }[] = [
  { key: 'shapes', icon: '🔷', label: 'Shapes' },
  { key: 'colors', icon: '🎨', label: 'Colors' },
  { key: 'sight', icon: '📖', label: 'Sight Words' },
  { key: 'd3', icon: '🧊', label: '3D Shapes' },
  { key: 'teen', icon: '🔢', label: 'Teen Words' },
  { key: 'ty', icon: '🔟', label: 'Ty Words' },
  { key: 'spell', icon: '🐝', label: 'Spelling' },
  { key: 'blanks', icon: '📝', label: 'Fill Blanks' },
  { key: 'days', icon: '📅', label: 'Days' },
  { key: 'veg', icon: '🥦', label: 'Vegetables' },
  { key: 'garden', icon: '🌳', label: 'Garden' },
  { key: 'kitchen', icon: '🍳', label: 'Kitchen' },
  { key: 'occupation', icon: '💼', label: 'Occupations' },
  { key: 'birds', icon: '🐦', label: 'Birds' },
  { key: 'animals', icon: '🐾', label: 'Animals' },
  { key: 'months', icon: '📅', label: 'Months' },
];

export default function FunLearningPage() {
  const [tab, setTab] = useState<Tab>('shapes');
  const [showAllTabs, setShowAllTabs] = useState(false);
  const [mobileTabs, setMobileTabs] = useState<Tab[]>([]);

  useEffect(() => {
    const others = tabs.filter((t) => t.key !== tab).map((t) => t.key);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const pick = [tab, ...shuffled.slice(0, 2)];
    setMobileTabs(pick.sort(() => Math.random() - 0.5));
  }, [tab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab') as Tab | null;
    if (t && ['shapes', 'colors', 'sight', 'd3', 'teen', 'ty', 'spell', 'blanks', 'days', 'veg', 'garden', 'kitchen', 'occupation', 'birds', 'animals', 'months'].includes(t)) {
      setTab(t);
    }
  }, []);

  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel();
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  // Parent lock state
  const [parentLocked, setParentLocked] = useState(false);
  const [parentUnlockInput, setParentUnlockInput] = useState('');
  const [parentUnlockError, setParentUnlockError] = useState(false);
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'plus' | 'minus'>('plus');
  const [mathAnswer, setMathAnswer] = useState(0);
  const lockedAtRef = useRef(0);

  const generateMathProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * a) + 1;
    const op = Math.random() < 0.5 ? ('plus' as const) : ('minus' as const);
    const ans = op === 'plus' ? a + b : a - b;
    setMathNum1(a);
    setMathNum2(b);
    setMathOp(op);
    setMathAnswer(ans);
  }, []);

  const handleParentLock = useCallback(() => {
    lockedAtRef.current = Date.now();
    generateMathProblem();
    setParentLocked(true);
    setParentUnlockInput('');
    setParentUnlockError(false);
    try {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } catch {}
  }, [generateMathProblem]);

  const handleParentUnlock = useCallback(() => {
    if (Date.now() - lockedAtRef.current < 500) return;
    if (parentUnlockInput === String(mathAnswer)) {
      setParentLocked(false);
      setParentUnlockInput('');
      setParentUnlockError(false);
      try {
        if (document.exitFullscreen) document.exitFullscreen();
      } catch {}
    } else {
      setParentUnlockError(true);
    }
  }, [parentUnlockInput, mathAnswer]);

  useEffect(() => {
    if (!parentLocked) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [parentLocked]);

  useEffect(() => {
    if (!parentLocked) return;
    const handler = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [parentLocked]);

  // Block keyboard shortcuts and context menu when locked
  useEffect(() => {
    if (!parentLocked) return;
    const blockKeys = (e: KeyboardEvent) => {
      // Block Escape, F5, F11, Ctrl+W, Ctrl+R, Alt+Left, Alt+Right, Meta+Left, Meta+Right
      if (e.key === 'Escape' || e.key === 'F5' || e.key === 'F11' || e.key === 'F12' || (e.ctrlKey && (e.key === 'w' || e.key === 'r' || e.key === 'l')) || (e.altKey && e.key === 'ArrowLeft') || (e.altKey && e.key === 'ArrowRight') || (e.metaKey && e.key === 'ArrowLeft') || (e.metaKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    window.addEventListener('keydown', blockKeys, true);
    window.addEventListener('contextmenu', blockContext, true);
    return () => {
      window.removeEventListener('keydown', blockKeys, true);
      window.removeEventListener('contextmenu', blockContext, true);
    };
  }, [parentLocked]);

  const renderTab = () => {
    switch (tab) {
      case 'shapes':
        return <ShapesTab />;
      case 'colors':
        return <ColorsTab />;
      case 'sight':
        return <SightTab />;
      case 'd3':
        return <D3Tab />;
      case 'teen':
        return <TeenTab />;
      case 'ty':
        return <TyTab />;
      case 'spell':
        return <SpellTab />;
      case 'blanks':
        return <BlanksTab />;
      case 'days':
        return <DaysTab />;
      case 'veg':
        return <VegTab />;
      case 'garden':
        return <GardenTab />;
      case 'kitchen':
        return <KitchenTab />;
      case 'occupation':
        return <OccupationTab />;
      case 'birds':
        return <BirdsTab />;
      case 'animals':
        return <AnimalsTab />;
      case 'months':
        return <MonthsTab />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8 pb-32 md:pb-24">
      {parentLocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <HiLockClosed className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">Parent Lock</h2>
            <p className="mt-2 text-sm text-slate-500">Solve this to unlock the page</p>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
              <p className="text-2xl font-black text-slate-900">
                {mathNum1} {mathOp === 'plus' ? '+' : '−'} {mathNum2} = ?
              </p>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <input
                type="number"
                value={parentUnlockInput}
                onChange={(e) => {
                  setParentUnlockInput(e.target.value);
                  setParentUnlockError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleParentUnlock();
                }}
                placeholder="Type your answer"
                className="w-40 rounded-xl border-2 border-slate-300 px-4 py-3 text-center text-lg font-bold text-slate-900 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200"
              />
              <button type="button" onClick={handleParentUnlock} className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-700">
                Unlock
              </button>
              {parentUnlockError && <p className="text-sm font-bold text-rose-500">Wrong answer, try again!</p>}
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Ages 3-6 • Early Learning</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">⭐ Fun Learning for Kids</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Learn shapes, colors, sight words, 3D shapes, spelling, and more with sounds and colorful games!</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {!parentLocked ? (
              <Link href="/educational-resources" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                ← Back
              </Link>
            ) : (
              <div />
            )}
            {!parentLocked ? (
              <button type="button" onClick={handleParentLock} className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700">
                <HiLockClosed className="h-4 w-4" /> Parent Lock
              </button>
            ) : (
              <div />
            )}
          </div>
          <div className="hidden md:flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
            {(showAllTabs ? tabs : tabs.slice(0, 8)).map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition ${tab === t.key ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t.icon} {t.label}
              </button>
            ))}
            {!showAllTabs && tabs.length > 8 && (
              <button type="button" onClick={() => setShowAllTabs(true)} className="rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap bg-slate-200 text-slate-600 hover:bg-slate-300 transition">
                +{tabs.length - 8} more
              </button>
            )}
          </div>
        </section>

        {renderTab()}

        <footer className="text-center text-xs text-slate-400">Tap 🔊 to hear pronunciation. Ages 3+</footer>

        {/* Mobile tabs grid at bottom */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:hidden">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">Switch Tool</p>
          <div className="grid grid-cols-4 gap-2">
            {(showAllTabs ? tabs : mobileTabs.map((k) => tabs.find((t) => t.key === k)!).filter(Boolean)).map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex flex-col items-center gap-0.5 rounded-xl border border-slate-100 px-1 py-2.5 text-center transition ${tab === t.key ? 'border-fuchsia-300 bg-fuchsia-50 shadow-sm' : 'bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                <span className={`text-[10px] font-bold leading-tight ${tab === t.key ? 'text-fuchsia-700' : 'text-slate-600'}`}>{t.label}</span>
              </button>
            ))}
            {!showAllTabs && tabs.length > 3 && (
              <button type="button" onClick={() => setShowAllTabs(true)} className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-slate-200 px-1 py-2.5 text-center transition hover:border-slate-300 hover:bg-slate-50">
                <span className="text-lg leading-none text-slate-400">+{tabs.length - 3}</span>
                <span className="text-[10px] font-bold leading-tight text-slate-400">More</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
