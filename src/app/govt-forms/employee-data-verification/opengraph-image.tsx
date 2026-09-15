import { buildOgImage, ogContentType, ogSize } from '@/app/lib/govtFormOgImage';

export const alt = 'Employees Data Verification Proforma — free A4 printable form';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return buildOgImage('/govt-forms/employee-data-verification');
}
