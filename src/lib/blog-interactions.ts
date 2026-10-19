import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

export type ReactionType = 'like' | 'love' | 'sad' | 'clap' | 'insightful';

export type BlogReactions = {
  like: number;
  love: number;
  sad: number;
  clap: number;
  insightful: number;
};

export type BlogComment = {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
  isUrdu?: boolean;
};

export type PostInteractions = {
  reactions: BlogReactions;
  comments: BlogComment[];
};

export type InteractionsStore = Record<string, PostInteractions>;

const DATA_FILE = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src', 'data', 'master_blogs_interactions.json');
const TMP_FILE = path.join('/tmp', 'master_blogs_interactions.json');
const SPREADSHEET_ID =
  process.env.CONTACT_MESSAGES_SPREADSHEET_ID || '1CYtSqzXNlVu-Wh_iqJp6jvGwm_fvHKJ3sbm5fX-UKTM';

let memoryStore: InteractionsStore | null = null;
let gsheetInitialized = false;

function detectIsUrdu(text: string): boolean {
  const urduArabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return urduArabicRegex.test(text);
}

function getDefaultReactions(): BlogReactions {
  return {
    like: 0,
    love: 0,
    sad: 0,
    clap: 0,
    insightful: 0,
  };
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!email || !privateKey) return null;

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export function getInteractionsStore(): InteractionsStore {
  if (memoryStore) return memoryStore;

  const tryPaths = [DATA_FILE, TMP_FILE];
  for (const filePath of tryPaths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        memoryStore = JSON.parse(raw);
        if (memoryStore) return memoryStore;
      }
    } catch {}
  }

  memoryStore = {};
  return memoryStore;
}

export function saveInteractionsStore(store: InteractionsStore): void {
  memoryStore = store;
  const jsonStr = JSON.stringify(store, null, 2);

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, jsonStr, 'utf-8');
  } catch {
    try {
      const tmpDir = path.dirname(TMP_FILE);
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(TMP_FILE, jsonStr, 'utf-8');
    } catch {}
  }
}

/**
 * Sync reactions to Google Sheet in the background (fire-and-forget)
 */
async function syncReactionsToGSheet(postId: string, postTitle: string, reactions: BlogReactions) {
  try {
    const sheets = getSheetsClient();
    if (!sheets) return;

    const total =
      (reactions.like || 0) +
      (reactions.love || 0) +
      (reactions.sad || 0) +
      (reactions.clap || 0) +
      (reactions.insightful || 0);

    const rowValues = [
      postId,
      postTitle || postId,
      reactions.like || 0,
      reactions.love || 0,
      reactions.sad || 0,
      reactions.clap || 0,
      reactions.insightful || 0,
      total,
      new Date().toISOString(),
    ];

    // Find if postId exists in BlogReactions
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'BlogReactions'!A:I",
    });

    const rows = res.data.values || [];
    let rowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === postId) {
        rowIndex = i + 1; // 1-indexed
        break;
      }
    }

    if (rowIndex !== -1) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'BlogReactions'!A${rowIndex}:I${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] },
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "'BlogReactions'!A:I",
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] },
      });
    }
  } catch (err) {
    console.error('Error syncing reaction to Google Sheet:', err);
  }
}

/**
 * Sync comment to Google Sheet in background (fire-and-forget)
 */
async function syncCommentToGSheet(comment: BlogComment, postTitle?: string) {
  try {
    const sheets = getSheetsClient();
    if (!sheets) return;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "'BlogComments'!A:F",
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            comment.id,
            comment.postId,
            postTitle || comment.postId,
            comment.author,
            comment.content,
            comment.createdAt,
          ],
        ],
      },
    });
  } catch (err) {
    console.error('Error syncing comment to Google Sheet:', err);
  }
}

/**
 * Loads historical reactions and comments from Google Sheet on startup
 */
export async function loadInteractionsFromGSheetOnce(): Promise<void> {
  if (gsheetInitialized) return;
  gsheetInitialized = true;

  try {
    const sheets = getSheetsClient();
    if (!sheets) return;

    const store = getInteractionsStore();

    // 1. Read Reactions
    try {
      const rxRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "'BlogReactions'!A2:I",
      });

      const rxRows = rxRes.data.values || [];
      for (const row of rxRows) {
        const pId = String(row[0] || '').trim();
        if (!pId) continue;

        if (!store[pId]) {
          store[pId] = { reactions: getDefaultReactions(), comments: [] };
        }

        store[pId].reactions = {
          like: parseInt(row[2] || '0', 10) || 0,
          love: parseInt(row[3] || '0', 10) || 0,
          sad: parseInt(row[4] || '0', 10) || 0,
          clap: parseInt(row[5] || '0', 10) || 0,
          insightful: parseInt(row[6] || '0', 10) || 0,
        };
      }
    } catch {}

    // 2. Read Comments
    try {
      const cmRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "'BlogComments'!A2:F",
      });

      const cmRows = cmRes.data.values || [];
      for (const row of cmRows) {
        const cId = String(row[0] || '').trim();
        const pId = String(row[1] || '').trim();
        if (!cId || !pId) continue;

        if (!store[pId]) {
          store[pId] = { reactions: getDefaultReactions(), comments: [] };
        }

        const exists = store[pId].comments.some((c) => c.id === cId);
        if (!exists) {
          const content = String(row[4] || '');
          store[pId].comments.push({
            id: cId,
            postId: pId,
            author: String(row[3] || 'Reader'),
            content,
            createdAt: String(row[5] || new Date().toISOString()),
            isUrdu: detectIsUrdu(content),
          });
        }
      }
    } catch {}

    saveInteractionsStore(store);
  } catch (err) {
    console.error('Error loading interactions from GSheet:', err);
  }
}

export function getPostInteractions(postId: string): PostInteractions {
  const store = getInteractionsStore();
  if (!store[postId]) {
    store[postId] = {
      reactions: getDefaultReactions(),
      comments: [],
    };
  }
  return store[postId];
}

export function getAllPostsInteractionsSummary(): Record<
  string,
  { reactions: BlogReactions; commentsCount: number; totalReactions: number }
> {
  const store = getInteractionsStore();
  const summary: Record<
    string,
    { reactions: BlogReactions; commentsCount: number; totalReactions: number }
  > = {};

  for (const [id, data] of Object.entries(store)) {
    const rx = data.reactions || getDefaultReactions();
    const totalReactions =
      (rx.like || 0) +
      (rx.love || 0) +
      (rx.sad || 0) +
      (rx.clap || 0) +
      (rx.insightful || 0);
    summary[id] = {
      reactions: rx,
      commentsCount: Array.isArray(data.comments) ? data.comments.length : 0,
      totalReactions,
    };
  }

  return summary;
}

export function updatePostReaction(
  postId: string,
  newReaction: ReactionType | null,
  previousReaction?: ReactionType | null,
  postTitle?: string
): BlogReactions {
  const store = getInteractionsStore();
  if (!store[postId]) {
    store[postId] = {
      reactions: getDefaultReactions(),
      comments: [],
    };
  }

  const reactions = store[postId].reactions;

  // Decrement previous reaction
  if (previousReaction && reactions[previousReaction] !== undefined && reactions[previousReaction] > 0) {
    reactions[previousReaction] = Math.max(0, reactions[previousReaction] - 1);
  }

  // Increment new reaction
  if (newReaction && reactions[newReaction] !== undefined) {
    reactions[newReaction] = (reactions[newReaction] || 0) + 1;
  }

  saveInteractionsStore(store);

  // Sync to Google Sheet asynchronously
  syncReactionsToGSheet(postId, postTitle || postId, reactions).catch(() => {});

  return reactions;
}

export function addPostComment(
  postId: string,
  author: string,
  content: string,
  postTitle?: string
): BlogComment {
  const store = getInteractionsStore();
  if (!store[postId]) {
    store[postId] = {
      reactions: getDefaultReactions(),
      comments: [],
    };
  }

  const comment: BlogComment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    postId,
    author: author.trim() || 'Reader',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    isUrdu: detectIsUrdu(content),
  };

  store[postId].comments.unshift(comment);
  saveInteractionsStore(store);

  // Sync to Google Sheet asynchronously
  syncCommentToGSheet(comment, postTitle).catch(() => {});

  return comment;
}

export function deletePostComment(postId: string, commentId: string): boolean {
  const store = getInteractionsStore();
  if (!store[postId] || !Array.isArray(store[postId].comments)) {
    return false;
  }

  const initialLength = store[postId].comments.length;
  store[postId].comments = store[postId].comments.filter((c) => c.id !== commentId);

  if (store[postId].comments.length !== initialLength) {
    saveInteractionsStore(store);
    return true;
  }

  return false;
}
