import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Blogs & Educational Posters | The Master Sahib',
  description:
    'Educational circulars, government notices, guides, and informative posters for students, teachers, and parents across Pakistan.',
  openGraph: {
    title: 'Master Blogs & Educational Posters | The Master Sahib',
    description:
      'Official educational series, notifications, and updates by The Master Sahib with high-definition posters and verified information.',
    url: 'https://themastersahib.com/master_blogs',
    siteName: 'The Master Sahib',
    type: 'article',
  },
};

export default function MasterBlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
