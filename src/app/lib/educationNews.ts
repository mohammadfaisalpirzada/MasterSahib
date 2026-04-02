import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import { load } from 'cheerio';

export type EducationNewsItem = {
  title: string;
  date: string;
  link: string;
  sourceName: string;
  sourceUrl: string;
  scrapedAt: string;
};

export type EducationNewsStore = {
  item: EducationNewsItem | null;
  items: EducationNewsItem[];
  updatedAt: string | null;
  lastError: string | null;
};

const NEWS_STORE_PATH = path.join(process.cwd(), 'src', 'data', 'education-news.json');
const MAX_CACHE_HOURS = Number(process.env.EDUCATION_NEWS_CACHE_HOURS ?? '18');
const REQUEST_TIMEOUT_MS = Math.max(Number(process.env.EDUCATION_NEWS_TIMEOUT_MS ?? '15000'), 5000);
const MAX_ITEMS = Math.max(Number(process.env.EDUCATION_NEWS_MAX_ITEMS ?? '8'), 1);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://themastersahib.com';
const SOURCE_URLS = (
  process.env.EDUCATION_NEWS_SOURCE_URLS?.split(',').map((item) => item.trim()).filter(Boolean) ?? [
    'https://parhopakistan.com/category/education/',
    'https://propakistani.pk/category/technology/',
  ]
);

const SOURCE_FALLBACKS: Record<string, string> = {
  'https://parhopakistan.com/category/education/': 'https://parhopakistan.com/',
  'https://propakistani.pk/category/technology/': 'https://propakistani.pk/category/tech-and-telecom/',
};

const SELECTORS = {
  article:
    process.env.EDUCATION_NEWS_ARTICLE_SELECTOR?.trim() ||
    'ul.newsticker li, .newsticker li, .breakingNews li, marquee a, li.gem-c-document-list__item, article, .post, .news-item, .views-row',
  title:
    process.env.EDUCATION_NEWS_TITLE_SELECTOR?.trim() ||
    'a, .gem-c-document-list__item-title a, h1 a, h2 a, h3 a, .entry-title a, .post-title a, .field--name-title a',
  date:
    process.env.EDUCATION_NEWS_DATE_SELECTOR?.trim() ||
    'time, .date, .entry-date, .post-date, .date-display-single, .published, .meta-date',
  link:
    process.env.EDUCATION_NEWS_LINK_SELECTOR?.trim() ||
    'a[href], .gem-c-document-list__item-title a, h1 a, h2 a, h3 a, .entry-title a, .post-title a',
};

const defaultStore: EducationNewsStore = {
  item: null,
  items: [],
  updatedAt: null,
  lastError: null,
};

const BROWSER_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Upgrade-Insecure-Requests': '1',
};

const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim();

const isUsefulHeadline = (title: string, link: string, sourceUrl: string) => {
  const normalizedTitle = cleanText(title).toLowerCase();

  if (!normalizedTitle || normalizedTitle.length < 12) {
    return false;
  }

  if (['more', 'menu', 'home', 'read more'].includes(normalizedTitle)) {
    return false;
  }

  try {
    const resolvedLink = new URL(link, sourceUrl).toString();
    const rootUrl = new URL('/', sourceUrl).toString();

    if (resolvedLink === sourceUrl || resolvedLink === rootUrl || resolvedLink.endsWith('/#')) {
      return false;
    }
  } catch {
    return false;
  }

  const words = normalizedTitle.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words);

  if (words.length >= 4 && uniqueWords.size <= Math.ceil(words.length / 3)) {
    return false;
  }

  return true;
};

const buildFallbackNewsItems = (): EducationNewsItem[] => {
  const scrapedAt = new Date().toISOString();

  return [
    {
      title: 'Educational resources are ready for your next class.',
      date: 'Live update',
      link: new URL('/teaching-tools', SITE_URL).toString(),
      sourceName: 'themastersahib.com',
      sourceUrl: SITE_URL,
      scrapedAt,
    },
    {
      title: 'Daily quiz practice is available for students right now.',
      date: 'Live update',
      link: new URL('/peace-quiz', SITE_URL).toString(),
      sourceName: 'themastersahib.com',
      sourceUrl: SITE_URL,
      scrapedAt,
    },
    {
      title: 'Resume builder and portfolio sections are active for learners.',
      date: 'Live update',
      link: new URL('/resume-builder', SITE_URL).toString(),
      sourceName: 'themastersahib.com',
      sourceUrl: SITE_URL,
      scrapedAt,
    },
    {
      title: 'Fresh education and tech headlines are syncing in the background.',
      date: 'Live update',
      link: new URL('/', SITE_URL).toString(),
      sourceName: 'themastersahib.com',
      sourceUrl: SITE_URL,
      scrapedAt,
    },
  ].slice(0, MAX_ITEMS);
};

const getSourceName = (sourceUrl: string) => {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, '');
  } catch {
    return 'education-source';
  }
};

const ensureStoreFile = async () => {
  await fs.mkdir(path.dirname(NEWS_STORE_PATH), { recursive: true });

  try {
    await fs.access(NEWS_STORE_PATH);
  } catch {
    await fs.writeFile(NEWS_STORE_PATH, JSON.stringify(defaultStore, null, 2), 'utf8');
  }
};

const readStore = async (): Promise<EducationNewsStore> => {
  await ensureStoreFile();

  try {
    const raw = await fs.readFile(NEWS_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<EducationNewsStore>;

    const items = Array.isArray(parsed.items)
      ? (parsed.items as EducationNewsItem[])
      : parsed.item
        ? [parsed.item as EducationNewsItem]
        : [];

    return {
      item: parsed.item ?? items[0] ?? null,
      items,
      updatedAt: parsed.updatedAt ?? null,
      lastError: parsed.lastError ?? null,
    };
  } catch {
    return defaultStore;
  }
};

const writeStore = async (store: EducationNewsStore) => {
  await ensureStoreFile();

  try {
    await fs.writeFile(NEWS_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (error) {
    console.error('Unable to persist education news JSON store.', error);
  }
};

const isStale = (updatedAt: string | null) => {
  if (!updatedAt) {
    return true;
  }

  const lastUpdated = new Date(updatedAt).getTime();
  if (Number.isNaN(lastUpdated)) {
    return true;
  }

  return Date.now() - lastUpdated > MAX_CACHE_HOURS * 60 * 60 * 1000;
};

export const parseEducationNewsItems = (html: string, sourceUrl: string): EducationNewsItem[] => {
  const $ = load(html);
  const candidates = $(SELECTORS.article).toArray();
  const elements = candidates.length > 0 ? candidates : $('a[href]').slice(0, MAX_ITEMS * 3).toArray();

  const items = elements
    .map((element) => {
      const container = $(element);
      const titleElement = container.is('a') ? container.first() : container.find(SELECTORS.title).first();
      const linkElement = container.is('a[href]') ? container.first() : container.find(SELECTORS.link).first();
      const fallbackLink = container.find('a[href]').first();

      const title =
        cleanText(titleElement.text()) ||
        cleanText(container.find('h1, h2, h3').first().text()) ||
        cleanText(container.text());

      const rawLink =
        linkElement.attr('href') ||
        titleElement.attr('href') ||
        fallbackLink.attr('href') ||
        '';

      const date = cleanText(container.find(SELECTORS.date).first().text()) || 'Education update';

      if (!title || !rawLink || !isUsefulHeadline(title, rawLink, sourceUrl)) {
        return null;
      }

      return {
        title,
        date,
        link: new URL(rawLink, sourceUrl).toString(),
        sourceName: getSourceName(sourceUrl),
        sourceUrl,
        scrapedAt: new Date().toISOString(),
      };
    })
    .filter((item): item is EducationNewsItem => Boolean(item))
    .filter(
      (item, index, array) =>
        index === array.findIndex((entry) => entry.title === item.title || entry.link === item.link),
    )
    .slice(0, MAX_ITEMS);

  if (!items.length) {
    throw new Error('No news headlines found. Please update the CSS selectors for the target website.');
  }

  return items;
};

const fetchEducationSourceHtml = async (sourceUrl: string) => {
  const targets = [sourceUrl, SOURCE_FALLBACKS[sourceUrl]].filter(
    (value, index, array): value is string => Boolean(value) && array.indexOf(value) === index,
  );

  const failures: string[] = [];

  for (const targetUrl of targets) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          ...BROWSER_HEADERS,
          Referer: targetUrl,
        },
        cache: 'no-store',
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('403 Forbidden even after browser-style headers.');
        }

        throw new Error(`HTTP ${response.status}`);
      }

      return {
        html: await response.text(),
        resolvedUrl: targetUrl,
      };
    } catch (error) {
      failures.push(`${targetUrl} => ${error instanceof Error ? error.message : 'Request failed'}`);
    }
  }

  throw new Error(failures.join(' | '));
};

export const refreshEducationNews = async (): Promise<EducationNewsStore> => {
  const collectedItems: EducationNewsItem[] = [];
  const failures: string[] = [];

  for (const sourceUrl of SOURCE_URLS) {
    try {
      const { html, resolvedUrl } = await fetchEducationSourceHtml(sourceUrl);
      const items = parseEducationNewsItems(html, resolvedUrl);
      collectedItems.push(...items);
    } catch (error) {
      failures.push(`${sourceUrl} => ${error instanceof Error ? error.message : 'Unable to fetch source.'}`);
    }
  }

  const items = collectedItems
    .filter(
      (item, index, array) =>
        index === array.findIndex((entry) => entry.title === item.title || entry.link === item.link),
    )
    .slice(0, MAX_ITEMS);

  if (!items.length) {
    throw new Error(
      failures.join(' | ') || 'No news headlines found from the configured education and tech sources.',
    );
  }

  const store: EducationNewsStore = {
    item: items[0] ?? null,
    items,
    updatedAt: items[0]?.scrapedAt ?? new Date().toISOString(),
    lastError: failures.length ? failures.join(' | ') : null,
  };

  await writeStore(store);
  return store;
};

export const getEducationNews = async (): Promise<EducationNewsStore> => {
  const store = await readStore();

  if (!store.item || isStale(store.updatedAt)) {
    try {
      return await refreshEducationNews();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to refresh education news right now.';

      if (store.items.length > 0 || store.item) {
        return {
          item: store.item ?? store.items[0] ?? null,
          items: store.items.length > 0 ? store.items : store.item ? [store.item] : [],
          updatedAt: store.updatedAt,
          lastError: message,
        };
      }

      const fallbackItems = buildFallbackNewsItems();
      return {
        item: fallbackItems[0] ?? null,
        items: fallbackItems,
        updatedAt: fallbackItems[0]?.scrapedAt ?? new Date().toISOString(),
        lastError: null,
      };
    }
  }

  if (store.items.length === 0 && store.item) {
    return {
      ...store,
      items: [store.item],
    };
  }

  if (store.items.length === 0) {
    const fallbackItems = buildFallbackNewsItems();
    return {
      item: fallbackItems[0] ?? null,
      items: fallbackItems,
      updatedAt: fallbackItems[0]?.scrapedAt ?? new Date().toISOString(),
      lastError: null,
    };
  }

  return store;
};
