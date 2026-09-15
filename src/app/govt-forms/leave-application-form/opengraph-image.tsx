import { buildOgImage, ogContentType, ogSize } from '@/app/lib/govtFormOgImage';

export const alt = 'Leave Application Form (Earned / Medical) — free A4 printable form';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return buildOgImage('/govt-forms/leave-application-form');
}
