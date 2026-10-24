import type { IconType } from 'react-icons';
import {
  LuAppWindow, LuBot, LuBookOpen, LuBrain, LuCalculator, LuCalendarDays, LuChartColumn,
  LuClipboardList, LuCode, LuCpu, LuDatabase, LuFileArchive, LuFileCode, LuFileSpreadsheet,
  LuFileText, LuFilm, LuFolder, LuGlobe, LuGraduationCap, LuImage, LuLanguages, LuLayers,
  LuListChecks, LuLock, LuMail, LuMessageSquare, LuMonitor, LuMusic, LuNotebookPen, LuPackage,
  LuPalette, LuPresentation, LuPrinter, LuPuzzle, LuQrCode, LuReceipt, LuRocket, LuRuler,
  LuScan, LuSchool, LuSettings, LuShieldCheck, LuSigma, LuSmartphone, LuSparkles, LuTable,
  LuTerminal, LuTimer, LuUsers, LuVideo, LuWallet, LuWorkflow, LuWrench, LuZap,
} from 'react-icons/lu';

/** Icon names usable in a sidecar .txt ("Icon: Smartphone"). Unknown names fall back to Package. */
export const STORE_ICONS: Record<string, IconType> = {
  AppWindow: LuAppWindow, Bot: LuBot, BookOpen: LuBookOpen, Brain: LuBrain, Calculator: LuCalculator,
  Calendar: LuCalendarDays, Chart: LuChartColumn, ClipboardList: LuClipboardList, Code: LuCode, Cpu: LuCpu,
  Database: LuDatabase, FileArchive: LuFileArchive, FileCode: LuFileCode, FileSpreadsheet: LuFileSpreadsheet,
  FileText: LuFileText, Film: LuFilm, Folder: LuFolder, Globe: LuGlobe, GraduationCap: LuGraduationCap,
  Image: LuImage, Languages: LuLanguages, Layers: LuLayers, ListChecks: LuListChecks, Lock: LuLock,
  Mail: LuMail, MessageSquare: LuMessageSquare, Monitor: LuMonitor, Music: LuMusic, NotebookPen: LuNotebookPen,
  Package: LuPackage, Palette: LuPalette, Presentation: LuPresentation, Printer: LuPrinter, Puzzle: LuPuzzle,
  QrCode: LuQrCode, Receipt: LuReceipt, Rocket: LuRocket, Ruler: LuRuler, Scan: LuScan, School: LuSchool,
  Settings: LuSettings, ShieldCheck: LuShieldCheck, Sigma: LuSigma, Smartphone: LuSmartphone,
  Sparkles: LuSparkles, Table: LuTable, Terminal: LuTerminal, Timer: LuTimer, Users: LuUsers, Video: LuVideo,
  Wallet: LuWallet, Workflow: LuWorkflow, Wrench: LuWrench, Zap: LuZap,
};

const lowerMap = Object.fromEntries(Object.entries(STORE_ICONS).map(([k, v]) => [k.toLowerCase(), v]));

export function getStoreIcon(name: string | undefined): IconType {
  if (!name) return LuPackage;
  return STORE_ICONS[name] ?? lowerMap[name.replace(/[\s_-]/g, '').toLowerCase()] ?? LuPackage;
}
