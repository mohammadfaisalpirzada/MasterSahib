import type { StoreItem } from './StoreClient';

/** How often (seconds) the store re-reads GitHub release info. */
export const GITHUB_REVALIDATE_SECONDS = 3600;

type ReleaseAsset = { name: string; size: number; updated_at: string; browser_download_url: string };
type Release = { tag_name: string; name: string | null; published_at: string; assets: ReleaseAsset[] };

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'themastersahib-store' };
  // Optional: raises GitHub's limit from 60 to 5000 requests/hour.
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function fetchRelease(owner: string, repo: string, tag: string | null): Promise<Release | null> {
  const endpoint = tag
    ? `https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`
    : `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  try {
    const res = await fetch(endpoint, { headers: ghHeaders(), next: { revalidate: GITHUB_REVALIDATE_SECONDS } });
    return res.ok ? ((await res.json()) as Release) : null;
  } catch {
    return null;
  }
}

/** Reads versionName from a latest-version.json asset, if the release publishes one. */
async function fetchVersion(release: Release): Promise<string | null> {
  const asset = release.assets.find((a) => a.name.toLowerCase() === 'latest-version.json');
  if (!asset) return null;
  try {
    const res = await fetch(asset.browser_download_url, { next: { revalidate: GITHUB_REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const data = (await res.json()) as { versionName?: string; version?: string };
    return data.versionName ?? data.version ?? null;
  } catch {
    return null;
  }
}

/** Fills size, last-updated date and version from GitHub for items linked to a release asset. */
export async function withLiveGitHubInfo(items: StoreItem[]): Promise<StoreItem[]> {
  return Promise.all(
    items.map(async (item) => {
      const gh = item.github;
      if (!gh) return item;
      const release = await fetchRelease(gh.owner, gh.repo, gh.tag);
      if (!release) return item; // GitHub down / rate-limited → keep the synced values
      const asset = release.assets.find((a) => a.name === gh.asset);
      const version = await fetchVersion(release);
      return {
        ...item,
        sizeBytes: asset?.size ?? item.sizeBytes,
        modified: asset?.updated_at ?? release.published_at ?? item.modified,
        version: version ?? item.version,
      };
    }),
  );
}
