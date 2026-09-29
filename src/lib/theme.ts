/**
 * Centralized Website Theme Management System
 * 
 * Manages the entire visual style, light & sober cool color palettes ("thandy thandy colours"),
 * and automatic weekly rotation across The Master Sahib platform.
 * 
 * Changing colors here or toggling MANUAL_THEME_OVERRIDE instantly updates the entire website!
 */

export type ThemePalette = {
  id: string;
  name: string;
  description: string;
  seasonTag: string;
  // Light, soothing background and surface tokens
  bgMain: string;
  bgCard: string;
  bgCardMuted: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Cool, sober primary & accent colors (refreshing, calm tones)
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  accentFrom: string;
  accentVia: string;
  accentTo: string;
  // Navbar gradients & styling
  navGradient: string;
  navActiveBg: string;
  navActiveText: string;
  // Badges & indicators
  badgeBg: string;
  badgeText: string;
};

// 4 Sober, light, cool ("thandy") weekly color palettes:
export const COOL_SOBER_PALETTES: ThemePalette[] = [
  {
    id: 'arctic-glacier',
    name: 'Arctic Glacier & Frosted Cyan',
    description: 'Crisp, cooling arctic breeze with soft ice backgrounds and cyan-teal calm.',
    seasonTag: 'Cooling Arctic Air',
    bgMain: '#f2f8fa',
    bgCard: '#ffffff',
    bgCardMuted: '#eaf4f7',
    borderSubtle: '#dbeafe',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    primaryLight: '#e0f2fe',
    secondary: '#0d9488',
    accentFrom: '#0284c7',
    accentVia: '#0ea5e9',
    accentTo: '#0d9488',
    navGradient: 'from-slate-900 via-sky-950 to-teal-950',
    navActiveBg: 'bg-white text-sky-800',
    navActiveText: '#0369a1',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
  },
  {
    id: 'calm-sage',
    name: 'Calm Sage & Eucalyptus Mist',
    description: 'Relaxing, earthy pastel greens with soothing mint clarity.',
    seasonTag: 'Peaceful Nature Mist',
    bgMain: '#f3f7f4',
    bgCard: '#ffffff',
    bgCardMuted: '#e9f2eb',
    borderSubtle: '#d1fae5',
    textPrimary: '#064e3b',
    textSecondary: '#334155',
    textMuted: '#64748b',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#ccfbf1',
    secondary: '#059669',
    accentFrom: '#0f766e',
    accentVia: '#059669',
    accentTo: '#0284c7',
    navGradient: 'from-slate-900 via-emerald-950 to-teal-950',
    navActiveBg: 'bg-white text-teal-800',
    navActiveText: '#0f766e',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
  },
  {
    id: 'nordic-mist',
    name: 'Nordic Mist & Deep Seafoam',
    description: 'Serene Scandinavian fjord aesthetic with muted slate-blue and gentle sea foam.',
    seasonTag: 'Fjord Ocean Breeze',
    bgMain: '#f1f5f9',
    bgCard: '#ffffff',
    bgCardMuted: '#e2e8f0',
    borderSubtle: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    secondary: '#0891b2',
    accentFrom: '#1e40af',
    accentVia: '#2563eb',
    accentTo: '#0891b2',
    navGradient: 'from-slate-900 via-slate-800 to-cyan-950',
    navActiveBg: 'bg-white text-blue-800',
    navActiveText: '#1d4ed8',
    badgeBg: '#e0f2fe',
    badgeText: '#075985',
  },
  {
    id: 'alpine-lavender',
    name: 'Alpine Frost & Lavender Haze',
    description: 'Subtle high-altitude frost blended with sober periwinkle and soft lavender tones.',
    seasonTag: 'Highland Twilight Frost',
    bgMain: '#f5f6fb',
    bgCard: '#ffffff',
    bgCardMuted: '#eceef8',
    borderSubtle: '#e2e8f0',
    textPrimary: '#1e1b4b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#e0e7ff',
    secondary: '#0284c7',
    accentFrom: '#4338ca',
    accentVia: '#6366f1',
    accentTo: '#0ea5e9',
    navGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    navActiveBg: 'bg-white text-indigo-800',
    navActiveText: '#3730a3',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
  },
];

/**
 * Set to a palette ID (e.g., 'arctic-glacier') to lock in a specific theme,
 * or leave null to let it automatically rotate week-by-week.
 */
export const MANUAL_THEME_OVERRIDE: string | null = null;

/**
 * Calculates current ISO 8601 week number (1 - 53).
 */
export function getISOWeekNumber(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Returns this week's active theme palette.
 * Automatically changes every Monday with light, sober, cool colors!
 */
export function getCurrentTheme(weekOverride?: number): ThemePalette {
  if (MANUAL_THEME_OVERRIDE) {
    const found = COOL_SOBER_PALETTES.find((p) => p.id === MANUAL_THEME_OVERRIDE);
    if (found) return found;
  }
  const week = weekOverride ?? getISOWeekNumber();
  const paletteIndex = (week - 1) % COOL_SOBER_PALETTES.length;
  return COOL_SOBER_PALETTES[Math.abs(paletteIndex)];
}

/**
 * Generates root CSS custom properties dictionary.
 */
export function getThemeCssVariables(theme: ThemePalette): Record<string, string> {
  return {
    '--ms-bg-main': theme.bgMain,
    '--ms-bg-card': theme.bgCard,
    '--ms-bg-card-muted': theme.bgCardMuted,
    '--ms-border': theme.borderSubtle,
    '--ms-text-primary': theme.textPrimary,
    '--ms-text-secondary': theme.textSecondary,
    '--ms-text-muted': theme.textMuted,
    '--ms-primary': theme.primary,
    '--ms-primary-hover': theme.primaryHover,
    '--ms-primary-light': theme.primaryLight,
    '--ms-secondary': theme.secondary,
    '--ms-accent-from': theme.accentFrom,
    '--ms-accent-via': theme.accentVia,
    '--ms-accent-to': theme.accentTo,
    '--ms-badge-bg': theme.badgeBg,
    '--ms-badge-text': theme.badgeText,
  };
}
