import { buildOgImage, ogContentType, ogSize } from '@/app/lib/govtFormOgImage';

export const alt = 'Time Scale Application Form — free A4 printable form';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return buildOgImage('/govt-forms/time-scale-application');
}
