import { buildOgImage, ogContentType, ogSize } from '@/app/lib/govtFormOgImage';

export const alt = 'School Leaving Certificate (TC) — free A4 printable form';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return buildOgImage('/govt-forms/school-leaving-certificate');
}
