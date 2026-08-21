'use client';

import Script from 'next/script';

export default function GoogleAdsense({ publisherId }: { publisherId: string }) {
  if (!publisherId) return null;

  return (
    <Script
      id="adsense-auto"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
    />
  );
}
