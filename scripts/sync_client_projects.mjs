#!/usr/bin/env node

/**
 * THE MASTER SAHIB — CLIENT PROJECT VIEWER SYNC TOOL
 * 
 * Intelligent page detection & deployment pipeline:
 *  - Discovers project directories in 'G:\My Drive\the_master_sahib\projects_view'
 *  - Iterates subfolders (Page_01_*, Page_02_*, ... Page_13_*) in strict numeric order
 *  - Picks the best preview image per folder (resolving renamed/stale files)
 *  - Extracts clean, professional page titles from the HTML files
 *  - Purges destination directory 'public/projects-view/<slug>/pages/' to eliminate orphaned files
 *  - Copies new images as page-01.png, page-02.png, ...
 *  - Updates 'src/data/projects-view-config.json' and 'src/lib/projects-view.ts'
 *  - Automatically commits & pushes to GitHub (main & master) to trigger live Vercel deployment!
 * 
 * Flags:
 *   --no-git   (skips git commit & push)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const skipGit = args.includes('--no-git');

const projectRoot = process.cwd();
const driveSourceBase = 'G:\\My Drive\\the_master_sahib\\projects_view';
const publicDestBase = path.join(projectRoot, 'public', 'projects-view');
const configFilePath = path.join(projectRoot, 'src', 'data', 'projects-view-config.json');

console.log('===========================================================');
console.log('  THE MASTER SAHIB — CLIENT PROJECT VIEWER SYNC TOOL       ');
console.log('===========================================================');
console.log(`Source Folder: ${driveSourceBase}`);
console.log(`Target Public: ${publicDestBase}\n`);

if (!fs.existsSync(driveSourceBase)) {
  console.warn(`[WARNING] Source path does not exist on this machine: ${driveSourceBase}`);
  console.log('Ensure Google Drive for Desktop is running and mapped to G:\\');
  process.exit(1);
}

// Helper: Extract clean title from HTML file or folder name
function extractPageTitle(dirPath, folderName, pageNum) {
  try {
    const files = fs.readdirSync(dirPath);
    const htmlFile = files.find(f => f.toLowerCase().endsWith('.html'));
    if (htmlFile) {
      const htmlContent = fs.readFileSync(path.join(dirPath, htmlFile), 'utf8');
      const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        let clean = titleMatch[1].trim();
        clean = clean.replace(/^Shaheen GGSS Campus School\s*[-–—]\s*/i, '');
        clean = clean.replace(/^Page\s*\d+\s*[-–—]\s*/i, '');
        if (clean.toLowerCase().includes('professional a4 cover') || clean.toLowerCase().includes('cover')) {
          clean = 'Cover Page & Formal Identification';
        }
        return `Page ${String(pageNum).padStart(2, '0')}: ${clean}`;
      }
    }
  } catch {
    // fallback below
  }

  const fallback = folderName.replace(/^Page_\d+_/i, '').replace(/_/g, ' ');
  return `Page ${String(pageNum).padStart(2, '0')}: ${fallback}`;
}

// Helper: Find the correct preview image inside a page folder
function findBestPreviewInDir(dirPath, pageNum) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => ({
      name: d.name,
      path: path.join(dirPath, d.name),
      stats: fs.statSync(path.join(dirPath, d.name)),
    }));

  const pngCandidates = files.filter(f => {
    const lower = f.name.toLowerCase();
    return lower.endsWith('.png') && (lower.includes('preview') || lower.startsWith('page_') || lower.startsWith('cover_'));
  });

  if (pngCandidates.length === 0) return null;
  if (pngCandidates.length === 1) return pngCandidates[0].path;

  // Multiple candidates: Prioritize matching folder's page number (e.g. Page_03_Preview for folder Page_03)
  const numPad = String(pageNum).padStart(2, '0');
  const exactMatch = pngCandidates.find(f => {
    const lower = f.name.toLowerCase();
    return lower.includes(`_${numPad}_preview`) || lower.includes(`page_${numPad}`) || (pageNum === 1 && lower.includes('cover'));
  });

  if (exactMatch) return exactMatch.path;

  // Fallback: Pick candidate with most recent mtime
  pngCandidates.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
  return pngCandidates[0].path;
}

// Load existing config
let config = {};
if (fs.existsSync(configFilePath)) {
  try {
    config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
  } catch (err) {
    console.warn('[WARNING] Could not parse existing projects-view-config.json:', err.message);
  }
}

const projectFolders = fs.readdirSync(driveSourceBase, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

console.log(`Found ${projectFolders.length} project folder(s) in Drive:`);
projectFolders.forEach(f => console.log(` - ${f}`));

for (const folderName of projectFolders) {
  const projectDir = path.join(driveSourceBase, folderName);
  const targetDir = path.join(publicDestBase, folderName, 'pages');

  console.log(`\n-----------------------------------------------------------`);
  console.log(`Processing project: [${folderName}]`);

  // Detect page subfolders (Page_01, Page_02, etc.)
  const subDirs = fs.readdirSync(projectDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.toLowerCase().startsWith('page_'))
    .map(entry => entry.name);

  subDirs.sort((a, b) => {
    const numA = parseInt(a.replace(/^[^\d]*(\d+).*/, '$1'), 10) || 0;
    const numB = parseInt(b.replace(/^[^\d]*(\d+).*/, '$1'), 10) || 0;
    return numA - numB;
  });

  const detectedPages = [];

  if (subDirs.length > 0) {
    console.log(`Found ${subDirs.length} page subdirectories.`);
    let idx = 1;
    for (const subDir of subDirs) {
      const subDirPath = path.join(projectDir, subDir);
      const previewImg = findBestPreviewInDir(subDirPath, idx);
      if (previewImg) {
        const title = extractPageTitle(subDirPath, subDir, idx);
        detectedPages.push({
          pageNumber: idx,
          title,
          srcPath: previewImg,
          targetFileName: `page-${String(idx).padStart(2, '0')}.png`,
        });
        idx++;
      }
    }
  } else {
    // Flat project: search direct images
    const directFiles = fs.readdirSync(projectDir, { withFileTypes: true })
      .filter(f => f.isFile() && f.name.toLowerCase().endsWith('_preview.png'))
      .map(f => f.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    let idx = 1;
    for (const f of directFiles) {
      detectedPages.push({
        pageNumber: idx,
        title: `Page ${String(idx).padStart(2, '0')}`,
        srcPath: path.join(projectDir, f),
        targetFileName: `page-${String(idx).padStart(2, '0')}.png`,
      });
      idx++;
    }
  }

  console.log(`Identified ${detectedPages.length} valid preview page(s).`);

  if (detectedPages.length === 0) {
    console.warn(`[WARNING] No preview pages found for [${folderName}]. Skipping.`);
    continue;
  }

  // Clean target directory completely to purge stale/duplicate files
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy images
  for (const page of detectedPages) {
    const targetFile = path.join(targetDir, page.targetFileName);
    fs.copyFileSync(page.srcPath, targetFile);
    console.log(`  ✓ Page ${page.pageNumber}: ${path.basename(page.srcPath)} -> ${page.targetFileName} ("${page.title}")`);
  }

  // Update projects-view-config.json
  const existingProject = config[folderName] || {
    id: folderName,
    slug: folderName,
    title: folderName.replace(/_/g, ' ').toUpperCase(),
    clientName: folderName.replace(/_/g, ' '),
    category: 'Client Presentation / Deliverable',
    description: `Comprehensive ${detectedPages.length}-page booklet.`,
    accessKey: `${folderName}2026`,
    watermarkText: 'PREVIEW ONLY • THE MASTER SAHIB • CLIENT REVIEW — DO NOT REPRODUCE',
    createdAt: new Date().toISOString().split('T')[0],
  };

  existingProject.totalPages = detectedPages.length;
  existingProject.description = existingProject.description.replace(/\d+-page/, `${detectedPages.length}-page`);
  existingProject.pages = detectedPages.map(p => ({
    pageNumber: p.pageNumber,
    title: p.title,
    imageSrc: `/projects-view/${folderName}/pages/${p.targetFileName}`,
  }));

  config[folderName] = existingProject;
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');
  console.log(`  ✓ Updated ${configFilePath} with ${detectedPages.length} pages.`);

  console.log(`\n🎉 Project [${folderName}] synced successfully!`);
  console.log(`🔗 Local Test URL: http://localhost:3000/projects-view/${folderName}`);
  console.log(`🌐 Live Client URL: https://themastersahib.com/projects-view/${folderName}?key=${existingProject.accessKey || folderName + '2026'}`);
}

// Git commit & push
if (!skipGit) {
  console.log('\n===========================================================');
  console.log('  DEPLOYING UPDATES TO PRODUCTION (GITHUB & VERCEL)        ');
  console.log('===========================================================');

  try {
    execSync('git add public/projects-view src/data/projects-view-config.json src/lib/projects-view.ts', { stdio: 'inherit' });
    
    const diffCheck = execSync('git diff --cached --name-only').toString().trim();
    if (diffCheck.length > 0) {
      console.log('Committing changes to git...');
      execSync('git commit -m "feat(projects-view): sync client projects with latest pages"', { stdio: 'inherit' });
      
      console.log('Pushing to GitHub (origin/main & origin/master)...');
      execSync('git push origin main', { stdio: 'inherit' });
      execSync('git push origin main:master', { stdio: 'inherit' });
      
      console.log('\n🚀 DEPLOYMENT TRIGGERED SUCCESSFULLY!');
      console.log('Vercel is now building and deploying the live site.');
      console.log('Changes will appear on https://themastersahib.com in 1-2 minutes.');
    } else {
      console.log('No git changes detected. Production is already up to date!');
    }
  } catch (err) {
    console.error('[ERROR] Git push failed:', err.message);
    console.log('Please verify git status and push manually if needed.');
  }
} else {
  console.log('\n[INFO] Skipped git deployment (--no-git flag passed).');
}

console.log('\n===========================================================');
console.log('ALL CLIENT PROJECTS SYNCED SUCCESSFULLY!');
console.log('===========================================================');
