/**
 * THE MASTER STORE — SYNC SCRIPT  (no AI, no network)
 *
 * Scans the store source folder (default: G:\My Drive\the_master_sahib\softwares)
 * and writes src/data/store-data.json, which /store renders.
 *
 * For every file (e.g. MyApp.apk) an optional sidecar text file with the SAME
 * base name (MyApp.txt) supplies the store listing:
 *
 *   Title: Daily Report Generator
 *   Category: Education            (Education | Office | Scripts | Utilities)
 *   Caption: One punchy line about what it does.
 *   Icon: Smartphone               (optional — Lucide name, see src/app/store/store-icons.ts)
 *   Version: 1.2                   (optional)
 *   Link: https://drive.google.com/file/d/XXXX/view   (optional)
 *   - Feature bullet one
 *   - Feature bullet two
 *
 * Without "Key:" lines, line 1 = title, line 2 = caption, "- " lines = features.
 *
 * LINK-ONLY APPS (easiest for GitHub-built APKs): put ONLY a .txt in the folder, no app file:
 *   Title: Master Sahib PDF Viewer
 *   Link: https://github.com/<you>/<repo>/releases/download/latest/<App>.apk
 * The store then reads size, date and version (from latest-version.json, if the release has
 * one) live from GitHub every hour — new GitHub builds show up with no re-sync or redeploy.
 *
 * Download link: "Link:" from the txt wins (Drive /file/d/ID links are turned into
 * direct-download links). Otherwise the file is copied to public/store-files/ and
 * served from the site itself.
 *
 * Run:  npm run sync:store            (or: node scripts/sync-store.ts "D:\other\folder")
 * Then deploy:  vercel --prod
 */
import fs from 'node:fs';
import path from 'node:path';

type StoreCategory = 'Education' | 'Office' | 'Scripts' | 'Utilities';

type StoreItem = {
  id: string;
  fileName: string;
  title: string;
  category: StoreCategory;
  caption: string;
  features: string[];
  icon: string;
  version: string | null;
  format: string;
  sizeBytes: number;
  modified: string;
  downloadUrl: string;
  external: boolean;
  /** Set when the link is a GitHub release asset — /the-master-store reads size, date & version live from GitHub. */
  github?: GitHubAsset;
};

type GitHubAsset = { owner: string; repo: string; tag: string | null; asset: string };

const projectRoot = process.cwd();
const sourceDir =
  process.argv[2] || process.env.STORE_SOURCE_DIR || 'G:\\My Drive\\the_master_sahib\\softwares';
const outFile = path.join(projectRoot, 'src', 'data', 'store-data.json');
const publicDir = path.join(projectRoot, 'public', 'store-files');
const LARGE_FILE_BYTES = 90 * 1024 * 1024;

const CATEGORIES: StoreCategory[] = ['Education', 'Office', 'Scripts', 'Utilities'];
const IGNORE = /^(desktop\.ini|thumbs\.db|\.ds_store)$|^~\$|^_|\.(tmp|crdownload|part|gdoc|gsheet|gslides|gform|lnk)$/i;

const EXT_DEFAULTS: Record<string, { category: StoreCategory; icon: string }> = {
  apk: { category: 'Utilities', icon: 'Smartphone' },
  exe: { category: 'Utilities', icon: 'AppWindow' },
  msi: { category: 'Utilities', icon: 'AppWindow' },
  zip: { category: 'Utilities', icon: 'FileArchive' },
  rar: { category: 'Utilities', icon: 'FileArchive' },
  '7z': { category: 'Utilities', icon: 'FileArchive' },
  py: { category: 'Scripts', icon: 'FileCode' },
  js: { category: 'Scripts', icon: 'FileCode' },
  ps1: { category: 'Scripts', icon: 'Terminal' },
  bat: { category: 'Scripts', icon: 'Terminal' },
  cmd: { category: 'Scripts', icon: 'Terminal' },
  sh: { category: 'Scripts', icon: 'Terminal' },
  xlsx: { category: 'Office', icon: 'FileSpreadsheet' },
  xlsm: { category: 'Office', icon: 'FileSpreadsheet' },
  xls: { category: 'Office', icon: 'FileSpreadsheet' },
  csv: { category: 'Office', icon: 'FileSpreadsheet' },
  docx: { category: 'Office', icon: 'FileText' },
  pptx: { category: 'Office', icon: 'Presentation' },
  pdf: { category: 'Education', icon: 'BookOpen' },
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

function prettifyName(base: string): string {
  return base
    .replace(/[_\-.]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bv?\d+(\.\d+)+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeCategory(raw: string | undefined, fallback: StoreCategory): StoreCategory {
  if (!raw) return fallback;
  const r = raw.trim().toLowerCase();
  const hit = CATEGORIES.find((c) => r.startsWith(c.toLowerCase().slice(0, 4)));
  if (hit) return hit;
  if (/school|teach|learn|study|exam|math|student/.test(r)) return 'Education';
  if (/excel|word|sheet|report|office|document/.test(r)) return 'Office';
  if (/script|python|automation|code|bot/.test(r)) return 'Scripts';
  return 'Utilities';
}

function directDriveLink(url: string): string {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]{10,})/);
  return m ? `https://drive.google.com/uc?export=download&id=${m[1]}` : url;
}

/** github.com/{owner}/{repo}/releases/download/{tag}/{asset}  or  .../releases/latest/download/{asset} */
function parseGitHubAsset(url: string): GitHubAsset | null {
  const m = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)\/releases\/(?:download\/([^/]+)|latest\/download)\/([^/?#]+)/i);
  return m ? { owner: m[1], repo: m[2], tag: m[3] ? decodeURIComponent(m[3]) : null, asset: decodeURIComponent(m[4]) } : null;
}

function extFromUrl(url: string): string {
  const m = url.split(/[?#]/)[0].match(/\.([a-z0-9]{1,5})$/i);
  return m ? m[1].toLowerCase() : '';
}

type Sidecar = {
  title?: string;
  category?: string;
  caption?: string;
  icon?: string;
  version?: string;
  link?: string;
  features: string[];
};

function parseSidecar(text: string): Sidecar {
  const out: Sidecar = { features: [] };
  const loose: string[] = [];
  for (const rawLine of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const bullet = line.match(/^[-*•]\s+(.+)/);
    if (bullet) {
      out.features.push(bullet[1].trim());
      continue;
    }
    const kv = line.match(/^(title|name|category|tag|caption|subtitle|icon|version|link|url|download)\s*[:=]\s*(.+)$/i);
    if (kv) {
      const key = kv[1].toLowerCase();
      const val = kv[2].trim();
      if (key === 'title' || key === 'name') out.title = val;
      else if (key === 'category' || key === 'tag') out.category = val;
      else if (key === 'caption' || key === 'subtitle') out.caption = val;
      else if (key === 'icon') out.icon = val;
      else if (key === 'version') out.version = val;
      else out.link = val;
      continue;
    }
    loose.push(line);
  }
  // Plain format: line 1 = title, line 2 = caption, rest = features
  if (!out.title && loose.length) out.title = loose.shift();
  if (!out.caption && loose.length) out.caption = loose.shift();
  out.features.push(...loose);
  return out;
}

function copyIfChanged(src: string, dest: string, stat: fs.Stats): void {
  if (fs.existsSync(dest)) {
    const d = fs.statSync(dest);
    if (d.size === stat.size && d.mtimeMs >= stat.mtimeMs) return;
  }
  fs.copyFileSync(src, dest);
  fs.utimesSync(dest, stat.atime, stat.mtime);
}

function main(): void {
  console.log('THE MASTER STORE — sync');
  console.log(`Source: ${sourceDir}`);
  if (!fs.existsSync(sourceDir)) {
    console.error('Source folder not found. Is Google Drive for Desktop running and mapped to G:\\ ?');
    process.exit(1);
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true }).filter((e) => e.isFile() && !IGNORE.test(e.name));
  const byBase = new Map<string, string[]>();
  for (const e of entries) {
    const base = path.parse(e.name).name.toLowerCase();
    byBase.set(base, [...(byBase.get(base) ?? []), e.name]);
  }

  fs.mkdirSync(publicDir, { recursive: true });
  const items: StoreItem[] = [];
  const usedIds = new Set<string>();
  const servedLocally = new Set<string>();

  for (const e of entries) {
    const parsed = path.parse(e.name);
    const ext = parsed.ext.replace('.', '').toLowerCase();
    const siblings = byBase.get(parsed.name.toLowerCase()) ?? [];
    if (ext === 'txt') {
      if (siblings.length > 1) continue; // sidecar of another file — handled with that file
      // Link-only listing: a .txt on its own whose "Link:" points to the download
      // (e.g. a GitHub release APK). No need to copy the app into Drive.
      const meta = parseSidecar(fs.readFileSync(path.join(sourceDir, e.name), 'utf8'));
      if (!meta.link || !/^https?:\/\//i.test(meta.link)) {
        console.warn(`  skip  ${e.name} (no matching app file and no "Link:")`);
        continue;
      }
      const gh = parseGitHubAsset(meta.link);
      const linkExt = extFromUrl(meta.link);
      const defaults = EXT_DEFAULTS[linkExt] ?? { category: 'Utilities' as StoreCategory, icon: 'Package' };
      let id = slugify(parsed.name);
      while (usedIds.has(id)) id += '-x';
      usedIds.add(id);
      items.push({
        id,
        fileName: gh?.asset ?? '',
        title: meta.title || prettifyName(parsed.name),
        category: normalizeCategory(meta.category, defaults.category),
        caption: meta.caption || `${(linkExt || 'app').toUpperCase()} download from The Master Sahib.`,
        features: meta.features.slice(0, 4),
        icon: meta.icon || defaults.icon,
        version: meta.version ?? null,
        format: linkExt ? linkExt.toUpperCase() : 'LINK',
        sizeBytes: 0,
        modified: fs.statSync(path.join(sourceDir, e.name)).mtime.toISOString(),
        downloadUrl: gh ? meta.link : directDriveLink(meta.link),
        external: true,
        ...(gh ? { github: gh } : {}),
      });
      console.log(`  ok    ${e.name}  (link-only${gh ? ` → GitHub ${gh.owner}/${gh.repo}` : ''})`);
      continue;
    }

    const full = path.join(sourceDir, e.name);
    const stat = fs.statSync(full);
    const sidecarName = siblings.find((s) => s.toLowerCase().endsWith('.txt'));
    const meta: Sidecar = sidecarName
      ? parseSidecar(fs.readFileSync(path.join(sourceDir, sidecarName), 'utf8'))
      : { features: [] };
    const defaults = EXT_DEFAULTS[ext] ?? { category: 'Utilities' as StoreCategory, icon: 'Package' };

    let id = slugify(parsed.name);
    while (usedIds.has(id)) id += '-x';
    usedIds.add(id);

    let downloadUrl: string;
    let external = false;
    const gh = meta.link ? parseGitHubAsset(meta.link) : null;
    if (meta.link && /^https?:\/\//i.test(meta.link)) {
      downloadUrl = gh ? meta.link : directDriveLink(meta.link);
      external = true;
    } else {
      if (stat.size > LARGE_FILE_BYTES) {
        console.warn(`  WARN  ${e.name} is ${(stat.size / 1048576).toFixed(0)} MB — too big for Vercel. Add "Link:" (Drive share link) to ${parsed.name}.txt`);
      }
      const safeName = `${id}${parsed.ext.toLowerCase()}`;
      copyIfChanged(full, path.join(publicDir, safeName), stat);
      servedLocally.add(safeName);
      downloadUrl = `/store-files/${safeName}`;
    }

    items.push({
      id,
      fileName: e.name,
      title: meta.title || prettifyName(parsed.name),
      category: normalizeCategory(meta.category, defaults.category),
      caption: meta.caption || `${ext.toUpperCase()} download from The Master Sahib.`,
      features: meta.features.slice(0, 4),
      icon: meta.icon || defaults.icon,
      version: meta.version ?? null,
      format: ext.toUpperCase() || 'FILE',
      sizeBytes: stat.size,
      modified: stat.mtime.toISOString(),
      downloadUrl,
      external,
      ...(gh ? { github: gh } : {}),
    });
    console.log(`  ok    ${e.name}${sidecarName ? `  ← ${sidecarName}` : '  (no .txt — using defaults)'}`);
  }

  // Remove copies of files that were deleted/renamed in the source folder
  for (const f of fs.readdirSync(publicDir)) {
    if (!servedLocally.has(f)) {
      try {
        fs.unlinkSync(path.join(publicDir, f));
        console.log(`  removed stale public/store-files/${f}`);
      } catch {
        console.warn(`  could not remove stale public/store-files/${f} — delete it manually`);
      }
    }
  }

  items.sort((a, b) => b.modified.localeCompare(a.modified));
  fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + '\n');
  console.log(`\nWrote ${items.length} item(s) → src/data/store-data.json`);
  console.log('Next: run  vercel --prod  to publish.');
}

main();
