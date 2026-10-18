import type { Metadata } from 'next';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import IbaResultViewerClient, { type IbaResultSearchIndex } from './IbaResultViewerClient';

const OWNER_EMAIL = 'mohammadfaisalpirzada@gmail.com';

// Restricted keywords/identifiers that belong exclusively to Mohammad Faisal Peerzada's row
// (Page 40, Seat KHI 129050, CNIC 4210113754699, Father: Peerzada Mohd. Kiffayatullah)
const OWNER_PRIVATE_PATTERNS = [
  'peerzada',
  'pirzada',
  'peerzado',
  'pirzado',
  '129050',
  '4210113754699',
  'kiffayatul',
  'kifayatul',
];

function isOwnerPrivateLine(text: string): boolean {
  const lower = text.toLowerCase();
  return OWNER_PRIVATE_PATTERNS.some((pat) => lower.includes(pat));
}

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'IBA Result 2008 Congratulations | Sukkur IBA PST & JST Official Gazette | Master Sahib',
  description:
    'Heartiest Congratulations to all successful PST & JST teachers of Batch 2008! Search your Name, Father Name, Seat Number, or CNIC across all 70 official Daily Kawish gazette pages, zoom clearly, and print your official page. Compiled by Master Sahib (www.themastersahib.com).',
  keywords: [
    'Sukkur IBA Test Result 2008',
    'IBA PST Result 2008 Sindh',
    'IBA JST Result 2008 Sindh',
    'Daily Kawish IBA Result July 2008',
    'Sindh Education Department 2008 Teachers Result',
    'PST JST 2008 Merit List Sindh',
    'Master Sahib',
    'www.themastersahib.com',
  ],
  openGraph: {
    title: 'IBA Result 2008 Congratulations — Sukkur IBA PST & JST Official Gazette',
    description:
      'Congratulations to Batch 2008 Teachers! Search your Name, Seat Number, or CNIC across all 70 official pages, zoom up to 300%, and print your official record.',
    url: 'https://themastersahib.com/iba-result-2008',
    siteName: 'The Master Sahib',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IBA Result 2008 Congratulations — Sukkur IBA PST & JST Official Gazette',
    description:
      'Search your Name, Seat Number, or CNIC across all 70 official pages of the 2008 Sukkur IBA PST & JST Result and print your official page.',
  },
  alternates: {
    canonical: 'https://themastersahib.com/iba-result-2008',
  },
};

export default async function IbaResult2008Page() {
  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.email?.toLowerCase() === OWNER_EMAIL;

  const indexPath = path.join(process.cwd(), 'src', 'data', 'iba-result-2008', 'search-index.json');
  const raw = await fs.readFile(indexPath, 'utf-8');
  const searchIndex = JSON.parse(raw) as IbaResultSearchIndex;

  // If the visitor is NOT logged in as mohammadfaisalpirzada@gmail.com,
  // strip Mohammad Faisal Peerzada's record from the search index so no component of his name/seat/CNIC can be found.
  if (!isOwner) {
    for (const page of searchIndex.pages) {
      page.lines = page.lines.filter((line) => !isOwnerPrivateLine(line.t));
    }
  } else {
    // Ensure clean canonical spelling is also indexed when owner is logged in
    const page40 = searchIndex.pages.find((p) => p.pageNumber === 40);
    if (page40) {
      const targetLine = page40.lines.find((l) => isOwnerPrivateLine(l.t));
      if (targetLine && !targetLine.t.toLowerCase().includes('mohammad faisal peerzada')) {
        targetLine.t = `${targetLine.t} | Mohammad Faisal Peerzada | Muhammad Faisal Pirzada | M. Faisal Peerzada`;
      }
    }
  }

  return <IbaResultViewerClient searchIndex={searchIndex} isOwner={isOwner} />;
}
