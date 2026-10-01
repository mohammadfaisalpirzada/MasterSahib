#!/usr/bin/env node

/**
 * Sync Client Projects Script
 * 
 * Scans 'G:\My Drive\the_master_sahib\projects_view' for client project folders.
 * Extracts preview page images, copies them to 'public/projects-view/<slug>/pages/',
 * and reports the private client review link.
 * 
 * Usage: node scripts/sync_client_projects.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const driveSourceBase = 'G:\\My Drive\\the_master_sahib\\projects_view';
const publicDestBase = path.join(projectRoot, 'public', 'projects-view');

console.log('===========================================================');
console.log('  THE MASTER SAHIB — CLIENT PROJECT VIEWER SYNC TOOL       ');
console.log('===========================================================');
console.log(`Source Folder: ${driveSourceBase}`);
console.log(`Target Public: ${publicDestBase}\n`);

if (!fs.existsSync(driveSourceBase)) {
  console.warn(`[WARNING] Source path does not exist on this machine: ${driveSourceBase}`);
  console.log('Ensure Google Drive for Desktop is running and mapped to G:\\');
  process.exit(0);
}

const folders = fs.readdirSync(driveSourceBase, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

console.log(`Found ${folders.length} project folder(s) in Drive:`);
folders.forEach((f) => console.log(` - ${f}`));

// Recursive finder for preview images
function findPreviewImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(findPreviewImages(fullPath));
    } else if (
      item.isFile() &&
      (item.name.toLowerCase().endsWith('_preview.png') ||
       item.name.toLowerCase().endsWith('.preview.png') ||
       item.name.toLowerCase().match(/^page_\d+.*\.png$/))
    ) {
      results.push({ name: item.name, path: fullPath });
    }
  }
  return results;
}

for (const folderName of folders) {
  const projectDir = path.join(driveSourceBase, folderName);
  const targetDir = path.join(publicDestBase, folderName, 'pages');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const previewImages = findPreviewImages(projectDir);
  console.log(`\nProcessing project: [${folderName}] (${previewImages.length} preview images found)`);

  // Sort them naturally so Page 1 comes before Page 2
  previewImages.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' }));

  let pageIndex = 1;
  for (const img of previewImages) {
    const targetFilename = `page-${String(pageIndex).padStart(2, '0')}.png`;
    const targetPath = path.join(targetDir, targetFilename);
    fs.copyFileSync(img.path, targetPath);
    console.log(`  ✓ Page ${pageIndex}: ${path.basename(img.path)} -> ${targetFilename}`);
    pageIndex += 1;
  }

  console.log(`\n🎉 Project [${folderName}] synced successfully!`);
  console.log(`🔗 Local Test URL: http://localhost:3000/projects-view/${folderName}`);
  console.log(`🌐 Live Client URL: https://themastersahib.com/projects-view/${folderName}?key=${folderName}2026`);
}

console.log('\n===========================================================');
console.log('All client projects synced into web space successfully!');
console.log('===========================================================');
