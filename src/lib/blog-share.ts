import type { BlogPost } from '@/lib/master-blogs';

export const MASTER_SERVICES_LINE =
  'Educational Consultancy • Teacher Training • Curriculum Development • School Management & Web Solutions';

export const MASTER_CONTACT_PHONE = '+92 345 8340669';
export const MASTER_WEBSITE_URL = 'https://themastersahib.com';

/**
 * Formats a clean, high-converting promotional message for WhatsApp & social sharing.
 * Contains:
 * - Post title, category, date
 * - Content summary / excerpt
 * - Direct link to post & HD poster
 * - Services by Master Sahib
 * - Direct contact & WhatsApp
 * - Official website
 */
export function formatBlogShareText(post: BlogPost, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : MASTER_WEBSITE_URL);
  const postUrl = `${base}/master_blogs?post=${encodeURIComponent(post.id)}`;

  const cleanExcerpt = (post.excerpt || post.content || '')
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const shortSummary = cleanExcerpt.length > 280 ? `${cleanExcerpt.slice(0, 277)}...` : cleanExcerpt;

  const lines = [
    `*THE MASTER SAHIB | Educational Update*`,
    ``,
    `📌 *${post.title}*`,
    `📂 *Category:* ${post.category}  |  🗓️ *Date:* ${post.date}`,
    ``,
    shortSummary ? `📝 *Summary:*\n${shortSummary}\n` : '',
    `🔗 *Read Full Article & HD Poster Online:*`,
    `${postUrl}`,
    ``,
    `─────────────────────────`,
    `💼 *Professional Services by Master Sahib:*`,
    `${MASTER_SERVICES_LINE}`,
    ``,
    `📞 *Direct Contact & WhatsApp:* ${MASTER_CONTACT_PHONE} (Muhammad Faisal Peerzada)`,
    `🌐 *Official Website:* ${MASTER_WEBSITE_URL}`,
    `─────────────────────────`,
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Directly opens WhatsApp with the complete formatted post text, services, and contact info.
 */
export function openWhatsAppShare(post: BlogPost, origin?: string): void {
  const text = formatBlogShareText(post, origin);
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Copies the complete formatted text (content + services + contact + link) to clipboard.
 */
export async function copyBlogShareText(post: BlogPost, origin?: string): Promise<boolean> {
  const text = formatBlogShareText(post, origin);
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  return false;
}
