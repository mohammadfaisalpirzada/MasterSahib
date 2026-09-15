import type { Metadata } from 'next';

import { govtFormItems } from '@/app/lib/govtForms';

const readyCount = govtFormItems.filter((item) => item.status === 'Ready').length;

const description =
  `${readyCount} ready-to-print official forms for Sindh government schools and employees — admission form, no dues (Bay-Baqi), ` +
  'no inquiry, bonafide, character certificate, school leaving certificate, leave application and the AG Sindh payroll ' +
  'and pension forms. Fill your details and print a clean A4 PDF. Free, and nothing is uploaded.';

export const metadata: Metadata = {
  title: 'Govt Educational Forms',
  description,
  alternates: { canonical: '/govt-forms' },
  keywords: [
    'Sindh government forms',
    'school admission form',
    'no dues certificate',
    'bay baqi certificate',
    'no inquiry certificate',
    'bonafide certificate',
    'school leaving certificate',
    'AG Sindh forms',
    'GP Fund form',
    'pension forms Sindh',
    'printable A4 forms',
    'The Master Sahib',
  ],
  openGraph: {
    title: 'Govt Educational Forms — The Master Sahib',
    description,
    url: 'https://themastersahib.com/govt-forms',
    siteName: 'The Master Sahib',
    type: 'website',
    locale: 'en_PK',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Govt Educational Forms — The Master Sahib',
    description,
  },
};

export default function GovtFormsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
