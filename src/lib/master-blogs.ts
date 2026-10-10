import fs from 'fs';
import path from 'path';

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
};

export type BlogMetadataStore = {
  hiddenIds: string[];
  pinnedIds: string[];
  customOrder: string[];
  overrides: Record<string, Partial<BlogPost>>;
};

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

function parseTextFile(rawContent: string, fallbackTitle: string): {
  title: string;
  content: string;
  category: string;
  date: string;
  author: string;
} {
  const lines = rawContent.split(/\r?\n/);
  let title = '';
  let category = 'Educational Update';
  let date = '';
  let author = 'The Master Sahib';
  let bodyLines: string[] = [];

  let firstLineExtracted = false;

  if (rawContent.includes('---')) {
    const parts = rawContent.split(/---/);
    const headerPart = parts[0];
    const bodyPart = parts.slice(1).join('---');

    for (const line of headerPart.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.toLowerCase().startsWith('title:')) {
        title = trimmed.slice(6).trim();
        firstLineExtracted = true;
      } else if (trimmed.toLowerCase().startsWith('category:')) {
        category = trimmed.slice(9).trim();
      } else if (trimmed.toLowerCase().startsWith('date:')) {
        date = trimmed.slice(5).trim();
      } else if (trimmed.toLowerCase().startsWith('author:')) {
        author = trimmed.slice(7).trim();
      } else if (!firstLineExtracted) {
        title = trimmed;
        firstLineExtracted = true;
      }
    }
    bodyLines = bodyPart.split(/\r?\n/);
  } else {
    // No '---' separator:
    let isParsingHeaders = true;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed && !firstLineExtracted) continue;

      if (!firstLineExtracted) {
        if (trimmed.toLowerCase().startsWith('title:')) {
          title = trimmed.slice(6).trim();
        } else {
          title = trimmed;
        }
        firstLineExtracted = true;
      } else {
        if (isParsingHeaders && trimmed.toLowerCase().startsWith('category:')) {
          category = trimmed.slice(9).trim();
        } else if (isParsingHeaders && trimmed.toLowerCase().startsWith('date:')) {
          date = trimmed.slice(5).trim();
        } else if (isParsingHeaders && trimmed.toLowerCase().startsWith('author:')) {
          author = trimmed.slice(7).trim();
        } else {
          isParsingHeaders = false;
          bodyLines.push(line);
        }
      }
    }
  }

  if (!title) {
    title = fallbackTitle;
  }

  const content = bodyLines.join('\n').trim();

  return {
    title,
    content,
    category,
    date: date || new Date().toISOString().split('T')[0],
    author,
  };
}

export function getAllBlogPosts(isAdmin: boolean = false): BlogPost[] {
  try {
    if (!fs.existsSync(BLOGS_DIR)) {
      fs.mkdirSync(BLOGS_DIR, { recursive: true });
    }

    // Auto-sync from Local Google Drive folder if available
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

    const metadata = getMetadataStore();
    const posts: BlogPost[] = [];

    imageFiles.forEach((imgFile: string) => {
      const baseName = path.parse(imgFile).name;
      const id = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const imgPath = `/master_blogs/${imgFile}`;

      // Check if paired text file exists (.txt or .md)
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
      const cleanExcerpt = parsed.content
        .replace(/^[#*-•\s]+/gm, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 180);

      const isHidden = metadata.hiddenIds.includes(id);
      const isPinned = metadata.pinnedIds.includes(id);
      const customOrderIndex = metadata.customOrder.indexOf(id);

      const post: BlogPost = {
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
      };

      posts.push(post);
    });

    // Also look for standalone text files without images
    const textOnlyFiles = files.filter(
      (f: string) =>
        textExtensions.includes(path.extname(f).toLowerCase()) &&
        !imageFiles.some(
          (img: string) => path.parse(img).name.toLowerCase() === path.parse(f).name.toLowerCase()
        )
    );

    textOnlyFiles.forEach((txtFile: string) => {
      const baseName = path.parse(txtFile).name;
      const id = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      let textContent = '';
      try {
        textContent = fs.readFileSync(path.join(BLOGS_DIR, txtFile), 'utf-8');
      } catch {}

      const defaultTitle = baseName.replace(/^[0-9]+[_-]/, '').replace(/[_-]+/g, ' ');
      const parsed = parseTextFile(textContent, defaultTitle);
      const isUrdu = detectIsUrdu(`${parsed.title} ${parsed.content}`);
      const cleanExcerpt = parsed.content
        .replace(/^[#*-•\s]+/gm, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 180);

      const isHidden = metadata.hiddenIds.includes(id);
      const isPinned = metadata.pinnedIds.includes(id);
      const customOrderIndex = metadata.customOrder.indexOf(id);

      posts.push({
        id,
        filename: txtFile,
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
      });
    });

    // Sort posts:
    // 1. Pinned posts first
    // 2. Custom order (if set)
    // 3. Date descending
    posts.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // If not admin, filter out hidden posts
    if (!isAdmin) {
      return posts.filter((p) => !p.hidden);
    }

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}
