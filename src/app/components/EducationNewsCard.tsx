type EducationNewsCardProps = {
  item: {
    title: string;
    date: string;
    link: string;
    sourceName: string;
    sourceUrl: string;
    scrapedAt: string;
  } | null;
  loading?: boolean;
  error?: string;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || 'Recently updated';
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function EducationNewsCard({
  item,
  loading = false,
  error = '',
}: EducationNewsCardProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-7 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/60 to-cyan-50/80 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
        <span className="rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-cyan-800">
          Daily Education Feed
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
          {item?.sourceName || 'Source pending'}
        </span>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {item ? (
        <>
          <h3 className="mt-4 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {item.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-white px-3 py-1">📅 {item.date}</span>
            <span className="rounded-full bg-white px-3 py-1">
              ⏱ Updated {formatDateTime(item.scrapedAt)}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Fresh education headline pulled from your configured source and cached for the dashboard.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Read Full Article →
            </a>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Open Source Page
            </a>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600">
          No news has been cached yet. Add your source URL/selectors in <code>.env.local</code> and hit
          <code className="ml-1 rounded bg-slate-100 px-1 py-0.5">/api/education-news/refresh</code>.
        </div>
      )}
    </article>
  );
}
