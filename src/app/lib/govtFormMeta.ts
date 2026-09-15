import type { Metadata } from 'next';

import { govtFormItems } from './govtForms';

/**
 * Per-form share metadata for the Govt Educational Forms section.
 *
 * Without this, WhatsApp / Facebook / LinkedIn fall back to the root layout and
 * show the site logo and the generic site description for every form link.
 * Each form route gets its own layout.tsx calling this, plus its own
 * opengraph-image.tsx — Next uses that file for both OG and Twitter cards, so
 * `images` is deliberately NOT set here.
 */

const SITE = 'https://themastersahib.com';

export const audienceLabel: Record<string, string> = {
  'school-office': 'School Office',
  employee: 'Government Employees',
  'ag-sindh': 'AG Sindh / Payroll',
  teacher: 'Teachers',
  student: 'Students',
  parents: 'Parents',
};

export const findGovtForm = (href: string) => govtFormItems.find((item) => item.href === href);

export function buildFormMetadata(href: string): Metadata {
  const item = findGovtForm(href);
  const title = item?.title || 'Govt Educational Form';
  const description = item?.shareDescription || item?.description || 'Free printable government form from The Master Sahib.';
  const url = `${SITE}${href}`;

  return {
    title,
    description,
    alternates: { canonical: href },
    keywords: [
      title,
      'Sindh government form',
      'printable form',
      'A4 PDF form',
      'The Master Sahib',
      item?.audience ? audienceLabel[item.audience] : '',
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Master Sahib',
      type: 'article',
      locale: 'en_PK',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
