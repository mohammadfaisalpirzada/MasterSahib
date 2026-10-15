import { BlogPost, extractMeaningfulExcerpt } from '@/lib/master-blogs';

export const MASTER_SERVICES_LINE =
  'Educational Consultancy • Teacher Training • Curriculum Development • School Management & Web Solutions';

export const MASTER_CONTACT_PHONE = '+92 345 8340669';
export const MASTER_WEBSITE_URL = 'https://themastersahib.com';

/**
 * Formats a clean, professional, and dignified promotional message for WhatsApp & social sharing.
 * Strictly emoji-free in accordance with editorial standards.
 * Contains:
 * - Post title, category, date
 * - Cohesive content summary / excerpt
 * - Direct link to post & HD poster
 * - Professional Services by Master Sahib
 * - Direct contact & WhatsApp
 * - Official website
 */
export function formatBlogShareText(post: BlogPost, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : MASTER_WEBSITE_URL);
  const postUrl = `${base}/master_blogs?post=${encodeURIComponent(post.id)}`;

  const summary = extractMeaningfulExcerpt(post.content || post.excerpt || '', post.isUrdu);

  const lines = [
    `*THE MASTER SAHIB | Educational Series*`,
    ``,
    `*${post.title}*`,
    `Category: ${post.category}  |  Date: ${post.date}`,
    ``,
    summary ? `*خلاصہ / Overview:*\n${summary}\n` : '',
    `*Read Full Article & HD Poster:*`,
    `${postUrl}`,
    ``,
    `-----------------------------------------`,
    `*Professional Services by Master Sahib:*`,
    `${MASTER_SERVICES_LINE}`,
    ``,
    `*Direct Contact & WhatsApp:* ${MASTER_CONTACT_PHONE} (Muhammad Faisal Peerzada)`,
    `*Official Website:* ${MASTER_WEBSITE_URL}`,
    `-----------------------------------------`,
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Converts any image Blob into a PNG Blob using an in-memory canvas.
 * Required for copying images to clipboard in Chromium-based desktop browsers.
 */
async function convertBlobToPng(blob: Blob): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((pngBlob) => {
            URL.revokeObjectURL(url);
            resolve(pngBlob);
          }, 'image/png');
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

/**
 * Shares the blog post to WhatsApp with IMAGE and TEXT TOGETHER in a single message.
 *
 * 1. Mobile & Web Share API (Android, iOS, Windows Native):
 *    Fetches poster image from post.imageUrl and builds a File object.
 *    Invokes navigator.share({ files: [file], text: caption, title: post.title }).
 *    WhatsApp automatically receives the image and places the caption underneath it in one screen!
 *
 * 2. Desktop Fallback (WhatsApp Web on PC):
 *    Copies image to clipboard (for instant Ctrl+V pasting into WhatsApp Web),
 *    triggers poster download, copies the formatted caption, and opens WhatsApp Web.
 */
export async function sharePostToWhatsApp(
  post: BlogPost,
  origin?: string,
  onToast?: (msg: string) => void
): Promise<boolean> {
  const shareText = formatBlogShareText(post, origin);

  // 1. ALWAYS copy caption to clipboard upfront so user can paste it anywhere
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
    }
  } catch (err) {
    console.warn('Initial clipboard copy failed:', err);
  }

  // 2. Try Native Web Share API with File attachment (Mobile WhatsApp & supported OS)
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      if (onToast) {
        onToast('تحریر کاپی ہو گئی ہے! اگر تصویر کے ساتھ کیپشن نہ آئے تو واٹس ایپ پر Paste کر دیں');
      }

      const imgRes = await fetch(post.imageUrl);
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        const ext = post.imageUrl.toLowerCase().includes('.png') ? 'png' : 'jpg';
        const mimeType = blob.type || (ext === 'png' ? 'image/png' : 'image/jpeg');
        const safeTitle = (post.title || 'Master_Sahib_Blog')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '_')
          .slice(0, 30);
        const fileName = `${safeTitle || 'poster'}.${ext}`;
        const file = new File([blob], fileName, { type: mimeType });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: post.title,
            text: shareText,
          });
          return true;
        }
      }
    }
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      // User cancelled native share sheet
      return false;
    }
    console.warn('Native file share failed, switching to desktop helper:', err);
  }

  // 3. Desktop Fallback (WhatsApp Web / PC Browser):
  try {
    // Try copying image to clipboard for instant Ctrl+V paste into WhatsApp Web
    try {
      const imgRes = await fetch(post.imageUrl);
      if (imgRes.ok) {
        const blob = await imgRes.blob();
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
          if (blob.type === 'image/png') {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          } else {
            const pngBlob = await convertBlobToPng(blob);
            if (pngBlob) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
            }
          }
        }
      }
    } catch {}

    // Auto-trigger image download so the file is readily available on PC
    const a = document.createElement('a');
    a.href = post.imageUrl;
    a.download = `${post.id}-poster.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Open WhatsApp Web with caption pre-filled
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (onToast) {
      onToast('تحریر کاپی اور تصویر ڈاؤنلوڈ ہو گئی! واٹس ایپ میں تصویر کے ساتھ Paste کر دیں');
    }
    return true;
  } catch {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return false;
  }
}

/**
 * Backward compatibility alias for openWhatsAppShare.
 */
export async function openWhatsAppShare(
  post: BlogPost,
  origin?: string,
  onToast?: (msg: string) => void
): Promise<boolean> {
  return sharePostToWhatsApp(post, origin, onToast);
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
