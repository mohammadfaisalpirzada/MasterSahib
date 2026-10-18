import type { Metadata } from 'next';
import fs from 'node:fs/promises';
import path from 'node:path';
import IbaResultViewerClient, { type IbaResultSearchIndex } from './IbaResultViewerClient';

export const metadata: Metadata = {
  title: 'Sukkur IBA PST & JST Test Result 2008 | Searchable Official Gazette | Master Sahib',
  description:
    'Search your Name, Father Name, Seat Number, or CNIC across all 35 official pages of the Sukkur IBA Primary & Junior School Teachers (PST / JST) Test Result 2008 (Daily Kawish). Zoom and print your exact official page. Compiled by Master Sahib (www.themastersahib.com).',
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
    title: 'Sukkur IBA PST & JST Test Result 2008 — Searchable Gazette | Master Sahib',
    description:
      'Find your name across all 35 official pages of the 2008 Sukkur IBA PST & JST Result, zoom clearly, and print your official page.',
    url: 'https://www.themastersahib.com/iba-result-2008',
    siteName: 'The Master Sahib',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.themastersahib.com/iba-result-2008',
  },
};

export default async function IbaResult2008Page() {
  const indexPath = path.join(process.cwd(), 'src', 'data', 'iba-result-2008', 'search-index.json');
  const raw = await fs.readFile(indexPath, 'utf-8');
  const searchIndex = JSON.parse(raw) as IbaResultSearchIndex;

  return <IbaResultViewerClient searchIndex={searchIndex} />;
}
