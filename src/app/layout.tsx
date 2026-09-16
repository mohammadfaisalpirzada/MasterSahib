import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import { Providers } from "./providers";
import GoogleAnalytics from "./components/GoogleAnalytics";
import GoogleAdsense from "./components/GoogleAdsense";

export const metadata: Metadata = {
  metadataBase: new URL("https://themastersahib.com"),
  title: {
    default: "The Master Sahib | Educational Resources, Softwares & Teacher Tools",
    template: "%s | The Master Sahib",
  },
  description:
    "Explore MasterSahib educational resources, official government school forms, Cambridge IGCSE 0580 guides, Sindh Teaching License (STEDA) prep, AI software tools, and teacher utilities.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Master Sahib | Educational Resources, Softwares & Teacher Tools",
    description:
      "A comprehensive learning & teaching hub: interactive classroom tools, print-ready government forms, STEDA teacher licensing, IGCSE math guides, and AI software suites.",
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
    title: "The Master Sahib | Educational Resources & Teacher Tools",
    description:
      "Interactive classroom tools, official government forms, STEDA licensing prep, IGCSE math guides, and AI software suites by The Master Sahib.",
    images: ["/images/main_logo.png"],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/main_logo.png',
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Master Sahib",
    alternateName: ["Master Sahib", "MasterSahib", "TheMasterSahib"],
    url: "https://themastersahib.com",
    logo: "https://themastersahib.com/images/main_logo.png",
    description:
      "Educational hub and digital platform for classroom resources, teacher licensing preparation, printable government forms, and AI educational tools.",
    sameAs: [
      "https://wa.me/923458340669"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Master Sahib",
    url: "https://themastersahib.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://themastersahib.com/educational-resources?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "AI for All — Complete Mastery Program",
    description: "Hands-on, one-to-one practical AI courses covering ChatGPT, Claude, Gemini, NotebookLM, Canva AI, and curriculum design for educators and professionals.",
    provider: {
      "@type": "Organization",
      name: "The Master Sahib",
      url: "https://themastersahib.com"
    },
    offers: {
      "@type": "Offer",
      category: "Paid",
      priceCurrency: "PKR",
      price: "15000",
      url: "https://themastersahib.com/courses/ai-for-all"
    }
  }
];

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
