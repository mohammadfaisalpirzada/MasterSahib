import fs from 'fs';
import path from 'path';

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

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'master_blogs_interactions.json');
const TMP_FILE = path.join('/tmp', 'master_blogs_interactions.json');

// In-memory cache for fast response times
let memoryStore: InteractionsStore | null = null;

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

export function getInteractionsStore(): InteractionsStore {
  if (memoryStore) return memoryStore;

  const tryPaths = [DATA_FILE, TMP_FILE];
  for (const filePath of tryPaths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        memoryStore = JSON.parse(raw);
        return memoryStore || {};
      }
    } catch {}
  }

  memoryStore = {};
  return memoryStore;
}

export function saveInteractionsStore(store: InteractionsStore): void {
  memoryStore = store;
  const jsonStr = JSON.stringify(store, null, 2);

  // Try writing to DATA_FILE
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, jsonStr, 'utf-8');
  } catch {
    // If running in read-only environment like Vercel Lambda, save to /tmp
    try {
      const tmpDir = path.dirname(TMP_FILE);
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      fs.writeFileSync(TMP_FILE, jsonStr, 'utf-8');
    } catch (e) {
      console.error('Error saving interactions to tmp:', e);
    }
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

export function getAllPostsInteractionsSummary(): Record<string, { reactions: BlogReactions; commentsCount: number; totalReactions: number }> {
  const store = getInteractionsStore();
  const summary: Record<string, { reactions: BlogReactions; commentsCount: number; totalReactions: number }> = {};

  for (const [id, data] of Object.entries(store)) {
    const rx = data.reactions || getDefaultReactions();
    const totalReactions = (rx.like || 0) + (rx.love || 0) + (rx.sad || 0) + (rx.clap || 0) + (rx.insightful || 0);
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
  previousReaction?: ReactionType | null
): BlogReactions {
  const store = getInteractionsStore();
  if (!store[postId]) {
    store[postId] = {
      reactions: getDefaultReactions(),
      comments: [],
    };
  }

  const reactions = store[postId].reactions;

  // Decrement previous reaction if present
  if (previousReaction && reactions[previousReaction] !== undefined && reactions[previousReaction] > 0) {
    reactions[previousReaction] = Math.max(0, reactions[previousReaction] - 1);
  }

  // Increment new reaction if selected
  if (newReaction && reactions[newReaction] !== undefined) {
    reactions[newReaction] = (reactions[newReaction] || 0) + 1;
  }

  saveInteractionsStore(store);
  return reactions;
}

export function addPostComment(
  postId: string,
  author: string,
  content: string
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
