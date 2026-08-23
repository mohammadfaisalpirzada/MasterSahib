import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import { Providers } from "./providers";
import GoogleAnalytics from "./components/GoogleAnalytics";
import GoogleAdsense from "./components/GoogleAdsense";

export const metadata: Metadata = {
  metadataBase: new URL("https://themastersahib.com"),
  title: {
    default: "The Master Sahib",
    template: "%s | The Master Sahib",
  },
  description: "The Master Sahib: a learning platform for educational resources, portfolio building, and resume creation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Master Sahib",
    description: "Learn, practice, and grow with The Master Sahib.",
    url: "https://themastersahib.com",
    siteName: "The Master Sahib",
    type: "website",
    images: [
      {
        url: "/images/main_logo.png",
        width: 512,
        height: 512,
        alt: "The Master Sahib Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Master Sahib",
    description: "Learn, practice, and grow with The Master Sahib.",
    images: ["/images/main_logo.png"],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/main_logo.png',
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Master Sahib",
  alternateName: ["Master Sahib", "MasterSahib", "TheMasterSahib"],
  url: "https://themastersahib.com",
  logo: "https://themastersahib.com/images/main_logo.png",
  description:
    "The Master Sahib: a learning platform for educational resources, portfolio building, and resume creation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.GOOGLE_ANALYTICS_ID || '';
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB || '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ms-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-slate-950 dark:to-slate-950">
        <GoogleAnalytics gaId={gaId} />
        {adsenseId && <GoogleAdsense publisherId={adsenseId} />}
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
