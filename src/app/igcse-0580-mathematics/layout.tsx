import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cambridge IGCSE Mathematics 0580 Learning Department | The Master Sahib',
  description:
    'A 40-week Cambridge IGCSE Mathematics 0580 learning pathway with chapter guides, curated resources, worked examples and live question-answer practice.',
  keywords: [
    'IGCSE 0580',
    'IGCSE Mathematics',
    'Cambridge IGCSE Maths',
    '0580 study guide',
    'IGCSE revision',
    'Cambridge Maths 0580',
    'IGCSE Number Concepts',
    'IGCSE Algebra',
    'IGCSE Geometry',
    'Sabrina IGCSE',
    'free IGCSE study guide',
    'IGCSE practice questions',
    'Cambridge 0580 syllabus 2028',
  ],
  openGraph: {
    title: 'Cambridge IGCSE Mathematics 0580 Learning Department',
    description:
      'A complete 40-week Cambridge IGCSE Mathematics 0580 pathway with chapter resources and live question practice.',
    url: 'https://themastersahib.com/igcse-0580-mathematics',
    siteName: 'TheMasterSahib',
    type: 'website',
    images: [
      {
        url: '/images/main_logo.png',
        width: 512,
        height: 512,
        alt: 'Cambridge IGCSE Mathematics 0580 Learning Department',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cambridge IGCSE Mathematics 0580 Learning Department',
    description:
      'A 40-week learning pathway with chapter resources and live question practice.',
    images: ['/images/main_logo.png'],
  },
  alternates: {
    canonical: '/igcse-0580-mathematics',
  },
};

export default function IGCSELayout({ children }: { children: React.ReactNode }) {
  return children;
}
