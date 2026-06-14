import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Master Sahib Upgraded Salary Calculator 2026 (estimated)',
  description:
    'Estimate upgraded salary for 2026 with basic pay, adhoc relief, fixed allowance, and conveyance increase calculations.',
  alternates: {
    canonical: '/upgraded-salary-calculator',
  },
  openGraph: {
    title: 'Master Sahib Upgraded Salary Calculator 2026 (estimated)',
    description:
      'Quickly estimate upgraded salary for 2026 using basic pay, adhoc relief, fixed allowance, and conveyance increase.',
    url: '/upgraded-salary-calculator',
    siteName: 'TheMasterSahib',
    type: 'website',
    images: [
      {
        url: '/images/main_logo.png',
        width: 512,
        height: 512,
        alt: 'Master Sahib Upgraded Salary Calculator 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Master Sahib Upgraded Salary Calculator 2026 (estimated)',
    description:
      'Estimate upgraded salary for 2026 with basic pay, adhoc relief, fixed allowance, and conveyance increase calculations.',
    images: ['/images/main_logo.png'],
  },
};

export default function UpgradedSalaryCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
