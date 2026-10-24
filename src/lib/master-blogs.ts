import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const MASTER_ADMIN_EMAILS = [
  'mohammadfaisalpirzada@gmail.com',
  'master.sahib.series@gmail.com',
];

export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export type BlogPost = {
  id: string;
  filename: string;
  title: string;
  content: string;
  urduContent?: string;
  englishContent?: string;
  hasUrdu?: boolean;
  hasEnglish?: boolean;
  excerpt: string;
  imageUrl: string;
  date: string;
  category: string;
  author: string;
  pinned: boolean;
  hidden: boolean;
  order: number;
  readTime: string;
  isUrdu: boolean;
  driveFileId?: string;
  textDriveFileId?: string;
  width?: number;
  height?: number;
  orientation: 'portrait' | 'landscape' | 'square';
};

export type BlogMetadataStore = {
  hiddenIds: string[];
  pinnedIds: string[];
  customOrder: string[];
  overrides: Record<string, Partial<BlogPost>>;
};

export const MASTER_BLOGS_FOLDER_ID = '1Pl3pR3BPIcCZ2-pC9LbQNzDPDMbfKF6u';
const BLOGS_DIR = path.join(process.cwd(), 'public', 'master_blogs');
const METADATA_FILE = path.join(process.cwd(), 'src', 'data', 'master_blogs_metadata.json');

export function getMetadataStore(): BlogMetadataStore {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading blog metadata store:', err);
  }
  return {
    hiddenIds: [],
    pinnedIds: [],
    customOrder: [],
    overrides: {},
  };
}

export function saveMetadataStore(store: BlogMetadataStore): void {
  try {
    const dir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(METADATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving blog metadata store:', err);
  }
}

function detectIsUrdu(text: string): boolean {
  const urduArabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return urduArabicRegex.test(text);
}

function calculateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 150));
  return `${minutes} min read`;
}

function isDecorativeLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return /^[=\-_*#~`|]{3,}$/.test(trimmed);
}

function getImageDimensionsFromBuffer(buffer: Buffer): { width: number; height: number } | null {
  if (!buffer || buffer.length < 24) return null;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      const len = buffer.readUInt16BE(offset + 2);
      offset += 2 + len;
    }
  }
  return null;
}

export function resolveOrientation(width?: number | null, height?: number | null): 'portrait' | 'landscape' | 'square' {
  if (!width || !height) return 'portrait';
  if (height > width * 1.12) return 'portrait';
  if (width > height * 1.12) return 'landscape';
  return 'square';
}

export function extractMeaningfulExcerpt(content: string, isUrdu?: boolean): string {
  if (!content) return '';
  const lines = content.split(/\r\n|\r|\n/);
  const candidates: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isDecorativeLine(line)) continue;
    // Skip metadata lines, section headers, and dividers
    if (/^(category|date|author|platform|website|authority)\s*:/i.test(line)) continue;
    if (/^part\s*\d+/i.test(line) || /^حصہ\s*\d+/i.test(line)) continue;
    if (/^(english|urdu)\s+(essay|overview|guide|reflection|details)/i.test(line)) continue;
    if (/^[#*•\s=-]+$/.test(line)) continue;

    const cleanLine = line.replace(/^[#*•\-\s]+/, '').trim();
    if (cleanLine.length >= 25) {
      candidates.push(cleanLine);
    }
  }

  if (candidates.length === 0) {
    return content.slice(0, 180).trim();
  }

  if (isUrdu) {
    const urduCandidate = candidates.find((c) => detectIsUrdu(c));
    if (urduCandidate) {
      return urduCandidate.length > 240 ? `${urduCandidate.slice(0, 237)}...` : urduCandidate;
    }
  } else {
    const enCandidate = candidates.find((c) => !detectIsUrdu(c));
    if (enCandidate) {
      return enCandidate.length > 240 ? `${enCandidate.slice(0, 237)}...` : enCandidate;
    }
  }

  const first = candidates[0];
  return first.length > 240 ? `${first.slice(0, 237)}...` : first;
}

export function splitBilingualContent(rawText: string): {
  urduContent: string;
  englishContent: string;
  hasUrdu: boolean;
  hasEnglish: boolean;
} {
  if (!rawText) {
    return { urduContent: '', englishContent: '', hasUrdu: false, hasEnglish: false };
  }

  const lines = rawText.split(/\r?\n/);

  // Strategy 1: Check for explicit "PART 1" / "PART 2" or "حصہ" markers
  let part1Idx = -1;
  let part2Idx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (isDecorativeLine(line)) continue;
    if (/^PART\s*1\b/i.test(line) || /^حصہ\s*(اول|1)\b/i.test(line)) {
      if (part1Idx === -1) part1Idx = i;
    } else if (/^PART\s*2\b/i.test(line) || /^حصہ\s*(دوم|2)\b/i.test(line)) {
      if (part2Idx === -1) part2Idx = i;
    }
  }

  if (part1Idx !== -1 && part2Idx !== -1 && part2Idx > part1Idx) {
    const p1Lines = lines.slice(part1Idx + 1, part2Idx);
    const p2Lines = lines.slice(part2Idx + 1);

    const cleanLines = (arr: string[]) => {
      while (arr.length && (isDecorativeLine(arr[0].trim()) || !arr[0].trim())) arr.shift();
      while (arr.length && (isDecorativeLine(arr[arr.length - 1].trim()) || !arr[arr.length - 1].trim())) arr.pop();
      return arr.join('\n').trim();
    };

    const p1Text = cleanLines(p1Lines);
    const p2Text = cleanLines(p2Lines);

    if (detectIsUrdu(p1Text) && !detectIsUrdu(p2Text)) {
      return { urduContent: p1Text, englishContent: p2Text, hasUrdu: true, hasEnglish: true };
    } else if (!detectIsUrdu(p1Text) && detectIsUrdu(p2Text)) {
      return { urduContent: p2Text, englishContent: p1Text, hasUrdu: true, hasEnglish: true };
    }
  }

  // Strategy 2: Paragraph-based segregation if no explicit PART markers
  const paragraphs = rawText.split(/\n\s*\n/);
  const urduBlocks: string[] = [];
  const englishBlocks: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed || isDecorativeLine(trimmed)) continue;
    if (/^(category|date|author|platform|website|authority)\s*:/i.test(trimmed)) continue;

    if (detectIsUrdu(trimmed)) {
      urduBlocks.push(trimmed);
    } else if (/[a-zA-Z]/.test(trimmed)) {
      englishBlocks.push(trimmed);
    }
  }

  const urduText = urduBlocks.join('\n\n').trim();
  const enText = englishBlocks.join('\n\n').trim();

  const hasUrdu = urduText.length > 30;
  const hasEnglish = enText.length > 30;

  return {
    urduContent: urduText,
    englishContent: enText,
    hasUrdu,
    hasEnglish,
  };
}

function parseTextFile(rawContent: string, fallbackTitle: string): {
  title: string;
  content: string;
  urduContent?: string;
  englishContent?: string;
  hasUrdu?: boolean;
  hasEnglish?: boolean;
  category: string;
  date: string;
  author: string;
} {
  const lines = rawContent.split(/\r\n|\r|\n/);
  let title = '';
  let secondaryTitle = '';
  let category = 'Educational Update';
  let date = '';
  let author = 'The Master Sahib';
  const bodyLines: string[] = [];
  let inHeaderSection = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (isDecorativeLine(trimmed)) {
      continue;
    }

    if (!trimmed) {
      if (title && !inHeaderSection) {
        bodyLines.push('');
      }
      continue;
    }

    const colonMatch = trimmed.match(/^([a-zA-Z\s]+)\s*:\s*(.+)$/);
    if (colonMatch) {
      const key = colonMatch[1].trim().toLowerCase();
      const val = colonMatch[2].trim();
      if (key === 'title') {
        title = val;
        continue;
      }
      if (key === 'category') {
        category = val;
        continue;
      }
      if (key === 'date') {
        date = val;
        continue;
      }
      if (key === 'author') {
        author = val;
        continue;
      }
      if (key === 'platform' || key === 'website' || key === 'authority') {
        continue;
      }
    }

    // Skip section headers like "PART 1: ...", "PART 2: ..."
    if (/^part\s*\d+/i.test(trimmed) || /^حصہ\s*\d+/i.test(trimmed)) {
      inHeaderSection = false;
      continue;
    }

    if (/^(english|urdu)\s+(essay|overview|guide|reflection|details)/i.test(trimmed)) {
      inHeaderSection = false;
      continue;
    }

    if (!title) {
      title = trimmed;
    } else if (inHeaderSection && !secondaryTitle && (detectIsUrdu(trimmed) !== detectIsUrdu(title))) {
      secondaryTitle = trimmed;
    } else {
      inHeaderSection = false;
      bodyLines.push(line);
    }
  }

  const resolvedTitle = secondaryTitle
    ? `${title} | ${secondaryTitle}`
    : (title || fallbackTitle);

  return {
    title: resolvedTitle,
    content: bodyLines.join('\n').trim(),
    category,
    date: date || new Date().toISOString().split('T')[0],
    author,
  };
}

function getGoogleDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/^"|"$/g, '').trim();
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

  if (!email || !key) return null;

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

// Fetch posts directly from Google Drive cloud folder
async function fetchGoogleDriveBlogPosts(metadata: BlogMetadataStore): Promise<BlogPost[]> {
  const drive = getGoogleDriveClient();
  if (!drive) return [];

  try {
    const res = await drive.files.list({
      q: `'${MASTER_BLOGS_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime, imageMediaMetadata)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const files = res.data.files || [];
    if (files.length === 0) return [];

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const textExtensions = ['.txt', '.md'];

    const imageFiles = files.filter(
      (f) =>
        f.mimeType?.startsWith('image/') ||
        imageExtensions.some((ext) => f.name?.toLowerCase().endsWith(ext))
    );

    const textFiles = files.filter(
      (f) =>
        f.mimeType?.startsWith('text/') ||
        textExtensions.some((ext) => f.name?.toLowerCase().endsWith(ext))
    );

    const posts: BlogPost[] = [];

    for (const img of imageFiles) {
      if (!img.id || !img.name) continue;
      const baseName = path.parse(img.name).name;
      const id = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const matchingTxt = textFiles.find(
        (t) => t.name && path.parse(t.name).name.toLowerCase() === baseName.toLowerCase()
      );

      let textContent = '';
      if (matchingTxt?.id) {
        try {
          const textRes = await drive.files.get(
            { fileId: matchingTxt.id, alt: 'media' },
            { responseType: 'text' }
          );
          textContent = String(textRes.data);
        } catch (err) {
          console.error(`Error reading ${matchingTxt.name} from Google Drive:`, err);
        }
      }

      const defaultTitle = baseName.replace(/^[0-9]+[_-]/, '').replace(/[_-]+/g, ' ');
      const parsed = textContent
        ? parseTextFile(textContent, defaultTitle)
        : {
            title: defaultTitle,
            content: 'Master Sahib official infographic & educational poster.',
            category: 'Educational Poster',
            date: img.modifiedTime ? img.modifiedTime.split('T')[0] : new Date().toISOString().split('T')[0],
            author: 'The Master Sahib',
          };

      const isUrdu = parsed.hasUrdu || detectIsUrdu(`${parsed.title} ${parsed.content}`);
      const cleanExcerpt = extractMeaningfulExcerpt(parsed.content, isUrdu);

      const isHidden = metadata.hiddenIds.includes(id);
      const isPinned = metadata.pinnedIds.includes(id);
      const customOrderIndex = metadata.customOrder.indexOf(id);

      const imgMeta = (img as { imageMediaMetadata?: { width?: number; height?: number } }).imageMediaMetadata;
      const width = imgMeta?.width ?? undefined;
      const height = imgMeta?.height ?? undefined;
      const orientation = resolveOrientation(width, height);

      posts.push({
        id,
        filename: img.name,
        title: parsed.title,
        content: parsed.content || parsed.title,
        excerpt: cleanExcerpt || parsed.title,
        imageUrl: `/api/master-blogs/${img.id}`,
        date: parsed.date,
        category: parsed.category,
        author: parsed.author,
        pinned: isPinned,
        hidden: isHidden,
        order: customOrderIndex !== -1 ? customOrderIndex : 9999,
        readTime: calculateReadTime(parsed.content || parsed.title),
        isUrdu,
        driveFileId: img.id ?? undefined,
        textDriveFileId: matchingTxt?.id ?? undefined,
        width,
        height,
        orientation,
      });
    }

    // Standalone text files without an image
    const textOnlyFiles = textFiles.filter(
      (t) =>
        t.name &&
        !imageFiles.some(
          (img) => img.name && path.parse(img.name).name.toLowerCase() === path.parse(t.name!).name.toLowerCase()
        )
    );

    for (const txt of textOnlyFiles) {
      if (!txt.id || !txt.name) continue;
      const baseName = path.parse(txt.name).name;
      const id = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

      let textContent = '';
      try {
        const textRes = await drive.files.get(
          { fileId: txt.id, alt: 'media' },
          { responseType: 'text' }
        );
        textContent = String(textRes.data);
      } catch {}

      const defaultTitle = baseName.replace(/^[0-9]+[_-]/, '').replace(/[_-]+/g, ' ');
      const parsed = parseTextFile(textContent, defaultTitle);
      const isUrdu = detectIsUrdu(`${parsed.title} ${parsed.content}`);
      const cleanExcerpt = extractMeaningfulExcerpt(parsed.content, isUrdu);

      const isHidden = metadata.hiddenIds.includes(id);
      const isPinned = metadata.pinnedIds.includes(id);
      const customOrderIndex = metadata.customOrder.indexOf(id);

      posts.push({
        id,
        filename: txt.name,
        title: parsed.title,
        content: parsed.content,
        excerpt: cleanExcerpt || parsed.title,
        imageUrl: '/images/main_logo.png',
        date: parsed.date,
        category: parsed.category,
        author: parsed.author,
        pinned: isPinned,
        hidden: isHidden,
        order: customOrderIndex !== -1 ? customOrderIndex : 9999,
        readTime: calculateReadTime(parsed.content),
        isUrdu,
        driveFileId: undefined,
        textDriveFileId: txt.id ?? undefined,
        orientation: 'portrait',
      });
    }

    return posts;
  } catch (error) {
    console.error('Error fetching Google Drive blog posts:', error);
    return [];
  }
}

// Fallback to local files
function fetchLocalBlogPosts(metadata: BlogMetadataStore): BlogPost[] {
  try {
    if (!fs.existsSync(BLOGS_DIR)) {
      fs.mkdirSync(BLOGS_DIR, { recursive: true });
    }

    // Auto-sync from Local Google Drive folder on Windows if available
    const LOCAL_DRIVE_DIR = 'G:\\My Drive\\the_master_sahib\\master_blogs';
    if (fs.existsSync(LOCAL_DRIVE_DIR)) {
      try {
        const driveFiles = fs.readdirSync(LOCAL_DRIVE_DIR);
        driveFiles.forEach((file: string) => {
          const srcPath = path.join(LOCAL_DRIVE_DIR, file);
          const destPath = path.join(BLOGS_DIR, file);
          try {
            if (!fs.existsSync(destPath) || fs.statSync(srcPath).mtimeMs > fs.statSync(destPath).mtimeMs) {
              fs.copyFileSync(srcPath, destPath);
            }
          } catch {}
        });
      } catch (e) {
        console.error('Error auto-syncing from G: Drive:', e);
      }
    }

    const files = fs.readdirSync(BLOGS_DIR);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const textExtensions = ['.txt', '.md'];

    const imageFiles = files.filter((file: string) =>
      imageExtensions.includes(path.extname(file).toLowerCase())
    );

    const posts: BlogPost[] = [];

    imageFiles.forEach((imgFile: string) => {
      const baseName = path.parse(imgFile).name;
      const id = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const imgPath = `/master_blogs/${imgFile}`;

      let textContent = '';
      const matchingTxt = files.find(
        (f: string) =>
          path.parse(f).name.toLowerCase() === baseName.toLowerCase() &&
          textExtensions.includes(path.extname(f).toLowerCase())
      );

      let fileStatDate = new Date().toISOString().split('T')[0];
      try {
        const stat = fs.statSync(path.join(BLOGS_DIR, imgFile));
        fileStatDate = stat.mtime.toISOString().split('T')[0];
      } catch {}

      if (matchingTxt) {
        try {
          textContent = fs.readFileSync(path.join(BLOGS_DIR, matchingTxt), 'utf-8');
        } catch (e) {
          console.error(`Error reading ${matchingTxt}:`, e);
        }
      }

      const defaultTitle = baseName.replace(/^[0-9]+[_-]/, '').replace(/[_-]+/g, ' ');
      const parsed = textContent
        ? parseTextFile(textContent, defaultTitle)
        : {
            title: defaultTitle,
            content: 'Master Sahib official infographic & educational poster.',
            category: 'Educational Poster',
            date: fileStatDate,
            author: 'The Master Sahib',
          };

      const isUrdu = detectIsUrdu(`${parsed.title} ${parsed.content}`);
      const cleanExcerpt = extractMeaningfulExcerpt(parsed.content, isUrdu);

      const isHidden = metadata.hiddenIds.includes(id);
      const isPinned = metadata.pinnedIds.includes(id);
      const customOrderIndex = metadata.customOrder.indexOf(id);

      let width: number | undefined;
      let height: number | undefined;
      try {
        const buf = fs.readFileSync(path.join(BLOGS_DIR, imgFile));
        const dims = getImageDimensionsFromBuffer(buf);
        if (dims) {
          width = dims.width;
          height = dims.height;
        }
      } catch {}
      const orientation = resolveOrientation(width, height);

      posts.push({
        id,
        filename: imgFile,
        title: parsed.title,
        content: parsed.content || parsed.title,
        excerpt: cleanExcerpt || parsed.title,
        imageUrl: imgPath,
        date: parsed.date || fileStatDate,
        category: parsed.category,
        author: parsed.author,
        pinned: isPinned,
        hidden: isHidden,
        order: customOrderIndex !== -1 ? customOrderIndex : 9999,
        readTime: calculateReadTime(parsed.content || parsed.title),
        isUrdu,
        width,
        height,
        orientation,
      });
    });

    return posts;
  } catch (err) {
    console.error('Error in fetchLocalBlogPosts:', err);
    return [];
  }
}

export async function getAllBlogPosts(isAdmin: boolean = false): Promise<BlogPost[]> {
  try {
    const metadata = getMetadataStore();

    // 1. Try fetching live from Google Drive first
    let posts = await fetchGoogleDriveBlogPosts(metadata);

    // 2. If Google Drive returned no posts or is not reachable, fallback to local storage
    if (posts.length === 0) {
      posts = fetchLocalBlogPosts(metadata);
    }

    // 3. Sort: pinned first -> custom order -> date descending
    posts.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 4. Filter hidden if not admin
    if (!isAdmin) {
      return posts.filter((p) => !p.hidden);
    }

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Upload new post to Google Drive folder when uploaded from Web Admin
export async function uploadBlogPostToDrive(params: {
  imageBuffer?: Buffer;
  imageFilename?: string;
  imageMimeType?: string;
  textContent: string;
  textFilename: string;
}): Promise<{ imageDriveId?: string; textDriveId?: string }> {
  const drive = getGoogleDriveClient();
  if (!drive) return {};

  const result: { imageDriveId?: string; textDriveId?: string } = {};

  try {
    // Upload Text File to Drive
    const textStream = Readable.from([params.textContent]);
    const textUpload = await drive.files.create({
      requestBody: {
        name: params.textFilename,
        parents: [MASTER_BLOGS_FOLDER_ID],
      },
      media: {
        mimeType: 'text/plain',
        body: textStream,
      },
      fields: 'id',
    });
    result.textDriveId = textUpload.data.id ?? undefined;

    // Upload Image File to Drive if provided
    if (params.imageBuffer && params.imageFilename) {
      const imageStream = Readable.from([params.imageBuffer]);
      const imageUpload = await drive.files.create({
        requestBody: {
          name: params.imageFilename,
          parents: [MASTER_BLOGS_FOLDER_ID],
        },
        media: {
          mimeType: params.imageMimeType || 'image/png',
          body: imageStream,
        },
        fields: 'id',
      });
      result.imageDriveId = imageUpload.data.id ?? undefined;
    }
  } catch (err) {
    console.error('Error uploading blog post to Google Drive:', err);
  }

  return result;
}

// Delete post from Google Drive
export async function deleteBlogPostFromDrive(fileIds: (string | undefined)[]): Promise<void> {
  const drive = getGoogleDriveClient();
  if (!drive) return;

  for (const id of fileIds) {
    if (!id) continue;
    try {
      await drive.files.update({
        fileId: id,
        requestBody: { trashed: true },
      });
    } catch (err) {
      console.error(`Error trashing Drive file ${id}:`, err);
    }
  }
}
