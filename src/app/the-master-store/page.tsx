import type { Metadata, Viewport } from 'next';
import storeData from '@/data/store-data.json';
import StoreClient, { type StoreItem } from './StoreClient';
import { withLiveGitHubInfo } from './github-live';

// Re-read GitHub release info at most once an hour (ISR).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Master Store | Smart Tools & Utilities by The Master Sahib',
  description: 'Smart everyday tools & utilities to simplify your work — Android apps, Windows tools, Excel templates and scripts by The Master Sahib.',
  alternates: { canonical: '/the-master-store' },
  icons: {
    icon: [
      { url: '/images/tms-icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/images/tms-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/images/tms-apple-icon.png', sizes: '180x180' },
  },
  openGraph: {
    title: 'The Master Store',
    description: 'Smart everyday tools & utilities to simplify your work.',
    url: '/the-master-store',
    type: 'website',
    images: [{ url: '/images/the-master-store-banner.jpg', width: 1024, height: 572, alt: 'The Master Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Master Store',
    description: 'Smart everyday tools & utilities to simplify your work.',
    images: ['/images/the-master-store-banner.jpg'],
  },
};

export const viewport: Viewport = { themeColor: '#0A1128' };

/** Web apps hosted on the site itself — always listed, independent of the Drive folder sync. */
const pinnedApps: StoreItem[] = [
  {
    id: 'msve-video-editor',
    fileName: '',
    title: 'Video Editor - Master Sahib',
    category: 'Utilities',
    caption: 'AI video merger, sequence editor & social SEO studio — right in your browser.',
    features: [
      'Drag & drop multi-clip timeline with 1-click reordering',
      'Export in 1080p / 720p for 16:9, 9:16 and 1:1',
      'Auto YouTube titles, hashtags and Reel hooks',
    ],
    icon: 'Video',
    version: '3.0',
    format: 'WEB APP',
    sizeBytes: 0,
    modified: '',
    downloadUrl: '/the-master-store/video-editor',
    external: false,
    kind: 'webapp',
  },
];

export default async function StorePage() {
  const synced = await withLiveGitHubInfo(storeData.items as unknown as StoreItem[]);
  const items = [...pinnedApps, ...synced];
  return <StoreClient items={items} />;
}
