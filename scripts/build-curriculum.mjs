import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PLANNING_DIR = 'G:\\My Drive\\Government School Work\\Planning';
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'curriculum-data.json');

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

function sanitizeKey(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Function to extract text and structure from a DOCX file using PowerShell .NET Zip reader
function parseDocx(filePath) {
  try {
    const escapedPath = filePath.replace(/'/g, "''");
    const psCommand = `
      Add-Type -AssemblyName System.IO.Compression.FileSystem
      $zip = [System.IO.Compression.ZipFile]::OpenRead('${escapedPath}')
      $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
      if ($entry) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $zip.Dispose()
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
        Write-Output $xml
      } else {
        $zip.Dispose()
      }
    `;
    const xml = execSync(`powershell -NoProfile -Command "${psCommand}"`, {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true,
    });

    if (!xml || xml.trim().length === 0) return null;

    // Parse paragraphs and tables from XML
    // Split by <w:p ...> or <w:p>
    const pRegex = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
    const paragraphs = [];
    let pMatch;
    while ((pMatch = pRegex.exec(xml)) !== null) {
      const pXml = pMatch[1];
      // Extract text inside <w:t> tags
      const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
      let textParts = [];
      let tMatch;
      while ((tMatch = tRegex.exec(pXml)) !== null) {
        textParts.push(tMatch[1]);
      }
      const fullText = textParts.join('').trim();
      if (fullText.length > 0) {
        // Detect if it's a heading or bullet point
        const isHeading = /<w:pStyle\s+w:val="Heading[1-4]"/i.test(pXml) || 
                          /^[0-9]+[\.\)]\s+[A-Z\u0600-\u06FF]/.test(fullText) ||
                          /^(UNIT|CHAPTER|LESSON|SECTION|PART)\s+[0-9A-Z]/i.test(fullText);
        const isBullet = /<w:numPr>/i.test(pXml) || /^[\u2022\u25CF\-\*]\s+/.test(fullText);
        paragraphs.push({
          text: fullText,
          isHeading,
          isBullet,
        });
      }
    }

    return {
      paragraphCount: paragraphs.length,
      content: paragraphs,
    };
  } catch (err) {
    console.error(`Error parsing DOCX ${filePath}:`, err.message);
    return null;
  }
}

function scanPlanningFolder() {
  console.log(`Scanning Planning directory: ${PLANNING_DIR}`);
  if (!fs.existsSync(PLANNING_DIR)) {
    console.error(`Directory not found: ${PLANNING_DIR}`);
    return;
  }

  const classDirs = fs.readdirSync(PLANNING_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const classesData = [];

  for (const className of classDirs) {
    const classPath = path.join(PLANNING_DIR, className);
    const classKey = sanitizeKey(className);

    const subjectDirs = fs.readdirSync(classPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    // Also check for root files inside class folder
    const directFiles = fs.readdirSync(classPath, { withFileTypes: true })
      .filter(d => d.isFile())
      .map(d => d.name);

    const subjectsData = [];

    for (const subjectName of subjectDirs) {
      if (subjectName.toLowerCase() === 'banner' || subjectName.toLowerCase() === 'banners') continue;
      
      const subjectPath = path.join(classPath, subjectName);
      const subjectKey = sanitizeKey(subjectName);

      // Check if banner folder exists in subject
      const bannerDir = path.join(subjectPath, 'banner');
      const altBannerDir = path.join(subjectPath, 'banners');
      const activeBannerDir = fs.existsSync(bannerDir) ? bannerDir : (fs.existsSync(altBannerDir) ? altBannerDir : null);
      
      let bannerFiles = [];
      if (activeBannerDir) {
        bannerFiles = fs.readdirSync(activeBannerDir, { withFileTypes: true })
          .filter(f => f.isFile() && /\.(png|jpe?g|webp|svg)$/i.test(f.name))
          .map(f => ({
            name: f.name,
            path: path.join(activeBannerDir, f.name),
            cleanName: sanitizeKey(path.basename(f.name, path.extname(f.name))),
          }));
      }

      const files = fs.readdirSync(subjectPath, { withFileTypes: true })
        .filter(f => f.isFile())
        .map(f => f.name);

      const chaptersData = [];

      for (const fileName of files) {
        const filePath = path.join(subjectPath, fileName);
        const ext = path.extname(fileName).toLowerCase();
        const baseName = path.basename(fileName, ext);
        const chapterKey = sanitizeKey(baseName);
        const stats = fs.statSync(filePath);

        let parsedContent = null;
        if (ext === '.docx') {
          console.log(`Parsing DOCX: ${className} > ${subjectName} > ${fileName}`);
          parsedContent = parseDocx(filePath);
        }

        // Match banner image
        let matchedBannerUrl = null;
        if (bannerFiles.length > 0) {
          // Find matching banner by chapterKey or unit number
          const unitMatch = baseName.match(/unit\s*([0-9]+)/i) || baseName.match(/ch(?:apter)?\s*([0-9]+)/i);
          const unitNum = unitMatch ? unitMatch[1] : null;

          const matchedFile = bannerFiles.find(b => {
            if (b.cleanName === chapterKey) return true;
            if (unitNum && (b.cleanName === `unit-${unitNum}` || b.cleanName === `unit${unitNum}` || b.cleanName === unitNum || b.cleanName.includes(`unit-${unitNum}`))) return true;
            if (chapterKey.includes(b.cleanName) || b.cleanName.includes(chapterKey)) return true;
            return false;
          });

          if (matchedFile) {
            const destDir = path.join(process.cwd(), 'public', 'curriculum-banners', classKey, subjectKey);
            fs.mkdirSync(destDir, { recursive: true });
            const destPath = path.join(destDir, matchedFile.name);
            fs.copyFileSync(matchedFile.path, destPath);
            matchedBannerUrl = `/curriculum-banners/${classKey}/${subjectKey}/${matchedFile.name}`;
            console.log(`Matched Banner for ${fileName} -> ${matchedBannerUrl}`);
          }
        }

        chaptersData.push({
          id: `${classKey}-${subjectKey}-${chapterKey}`,
          title: baseName.replace(/_/g, ' '),
          fileName,
          extension: ext.replace('.', ''),
          sizeBytes: stats.size,
          sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
          isDocx: ext === '.docx',
          isPdf: ext === '.pdf',
          parsedContent,
          bannerImage: matchedBannerUrl,
          lastModified: stats.mtime.toISOString(),
        });
      }

      if (chaptersData.length > 0) {
        subjectsData.push({
          id: `${classKey}-${subjectKey}`,
          name: subjectName,
          key: subjectKey,
          chapterCount: chaptersData.length,
          chapters: chaptersData,
        });
      }
    }

    // If there are direct files in the class folder, create a "General / Overview" subject
    if (directFiles.length > 0) {
      const generalChapters = [];
      for (const fileName of directFiles) {
        const filePath = path.join(classPath, fileName);
        const ext = path.extname(fileName).toLowerCase();
        const baseName = path.basename(fileName, ext);
        const chapterKey = sanitizeKey(baseName);
        const stats = fs.statSync(filePath);

        let parsedContent = null;
        if (ext === '.docx') {
          parsedContent = parseDocx(filePath);
        }

        generalChapters.push({
          id: `${classKey}-general-${chapterKey}`,
          title: baseName.replace(/_/g, ' '),
          fileName,
          extension: ext.replace('.', ''),
          sizeBytes: stats.size,
          sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
          isDocx: ext === '.docx',
          isPdf: ext === '.pdf',
          parsedContent,
          bannerImage: null,
          lastModified: stats.mtime.toISOString(),
        });
      }

      subjectsData.unshift({
        id: `${classKey}-general`,
        name: 'General Planning & Overview',
        key: 'general',
        chapterCount: generalChapters.length,
        chapters: generalChapters,
      });
    }

    if (subjectsData.length > 0) {
      classesData.push({
        id: classKey,
        name: className,
        subjectCount: subjectsData.length,
        totalFiles: subjectsData.reduce((acc, s) => acc + s.chapterCount, 0),
        subjects: subjectsData,
      });
    }
  }

  const database = {
    generatedAt: new Date().toISOString(),
    totalClasses: classesData.length,
    totalFiles: classesData.reduce((acc, c) => acc + c.totalFiles, 0),
    classes: classesData,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2), 'utf8');
  console.log(`Successfully generated curriculum database at ${OUTPUT_FILE}`);
  console.log(`Total Classes: ${database.totalClasses}, Total Files: ${database.totalFiles}`);
}

scanPlanningFolder();
