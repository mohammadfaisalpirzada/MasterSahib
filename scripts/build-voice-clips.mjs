// Records natural Urdu voice clips for the Class Notes "listen" buttons.
//
// Run on your PC (needs internet), from the project folder:
//     npm install --no-save msedge-tts
//     node scripts/build-voice-clips.mjs
//
// - Uses Microsoft Edge's free "Read Aloud" neural voice (Pakistani Urdu: ur-PK-UzmaNeural).
//   No API key, no account, no limits on the website — clips are recorded ONCE here and then
//   served as ordinary MP3 files from public/tts/ur/.
// - Safe to re-run: clips that already exist are skipped, so after adding new notes
//   (scripts/build-curriculum.mjs) just run this again and only the new Urdu is recorded.
// - Writes public/tts/ur/index.json, the list the website uses to know which clips exist.
//
// Optional:  URDU_VOICE=ur-PK-AsadNeural node scripts/build-voice-clips.mjs   (male voice)

import fs from 'fs';
import path from 'path';
import { urduSegmentsFor, clipKey } from '../src/app/class_notes/_lib/speechText.mjs';

let MsEdgeTTS;
let MP3_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
try {
  const mod = await import('msedge-tts');
  const lib = mod.MsEdgeTTS ? mod : mod.default || {};
  MsEdgeTTS = lib.MsEdgeTTS;
  if (lib.OUTPUT_FORMAT && lib.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3) MP3_FORMAT = lib.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
  if (!MsEdgeTTS) throw new Error('MsEdgeTTS not found');
} catch {
  console.error('\nPlease run this first:\n    npm install --no-save msedge-tts\n');
  process.exit(1);
}

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'src', 'data', 'curriculum-data.json');
const OUT_DIR = path.join(ROOT, 'public', 'tts', 'ur');
const VOICE = process.env.URDU_VOICE || 'ur-PK-UzmaNeural';
const RATE = '-10%'; // a little slower than normal — easier for young readers
const WORKERS = 4;

// ---------- 1. Collect every Urdu / Sindhi piece the reader can ask for ----------
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
/** @type {Map<string, string>} key -> text */
const wanted = new Map();
for (const cls of data.classes || []) {
  for (const subject of cls.subjects || []) {
    for (const chapter of subject.chapters || []) {
      const texts = [chapter.title || '', ...((chapter.parsedContent && chapter.parsedContent.content) || []).map((p) => p.text || '')];
      for (const t of texts) for (const seg of urduSegmentsFor(t)) wanted.set(clipKey(seg), seg);
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const existing = new Set(
  fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.mp3') && fs.statSync(path.join(OUT_DIR, f)).size > 0)
    .map((f) => f.slice(0, -4))
);
const todo = [...wanted].filter(([key]) => !existing.has(key));
console.log(`Urdu pieces in notes: ${wanted.size}  |  already recorded: ${wanted.size - todo.length}  |  to record now: ${todo.length}`);

// ---------- 2. Record the missing ones ----------
const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function newClient() {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, MP3_FORMAT);
  return tts;
}

function synth(tts, text) {
  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 30000);
    try {
      const { audioStream } = await tts.toStream(escapeXml(text), { rate: RATE });
      const chunks = [];
      audioStream.on('data', (c) => chunks.push(c));
      audioStream.on('error', (e) => {
        clearTimeout(timer);
        reject(e);
      });
      audioStream.on('close', () => {
        clearTimeout(timer);
        const buf = Buffer.concat(chunks);
        buf.length > 0 ? resolve(buf) : reject(new Error('empty audio'));
      });
    } catch (e) {
      clearTimeout(timer);
      reject(e);
    }
  });
}

let done = 0;
let failed = 0;
const startedAt = Date.now();

async function worker(queue) {
  let tts = await newClient();
  while (queue.length) {
    const [key, text] = queue.shift();
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const audio = await synth(tts, text);
        fs.writeFileSync(path.join(OUT_DIR, `${key}.mp3`), audio);
        ok = true;
      } catch (e) {
        if (attempt === 3) {
          failed++;
          console.warn(`  ✗ could not record: ${text.slice(0, 50)} (${e.message})`);
        } else {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          try {
            tts.close();
          } catch {}
          tts = await newClient().catch(() => tts);
        }
      }
    }
    done++;
    if (done % 50 === 0 || done === todo.length) {
      const secs = (Date.now() - startedAt) / 1000;
      const left = Math.round(((todo.length - done) * secs) / done / 60);
      console.log(`  ${done}/${todo.length} recorded${left > 0 ? `  (~${left} min left)` : ''}`);
    }
  }
  try {
    tts.close();
  } catch {}
}

if (todo.length > 0) {
  const queue = [...todo];
  await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, () => worker(queue)));
}

// ---------- 3. Write the index the website reads ----------
const present = [...wanted.keys()].filter((key) => fs.existsSync(path.join(OUT_DIR, `${key}.mp3`))).sort();
fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(present));
const mb = present.reduce((n, key) => n + fs.statSync(path.join(OUT_DIR, `${key}.mp3`)).size, 0) / 1048576;
console.log(`\nDone. ${present.length} Urdu clips ready (${mb.toFixed(1)} MB) in public/tts/ur/.${failed ? `  ${failed} failed — just run the script again.` : ''}`);
console.log('Now deploy:  vercel --prod');
process.exit(0);
