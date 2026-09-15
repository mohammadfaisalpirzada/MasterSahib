import { buildOgImage, ogContentType, ogSize } from '@/app/lib/govtFormOgImage';

export const alt = 'Character Certificate — free A4 printable form';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return buildOgImage('/govt-forms/character-certificate');
}
