import { buildSectionOgImage, ogContentType, ogSize } from '@/app/lib/govtFormOgImage';
import { govtFormItems } from '@/app/lib/govtForms';

export const alt = 'Govt Educational Forms — free printable A4 forms from The Master Sahib';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return buildSectionOgImage(govtFormItems.filter((item) => item.status === 'Ready').length);
}
