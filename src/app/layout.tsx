import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import { Providers } from "./providers";
import GoogleAnalytics from "./components/GoogleAnalytics";
import GoogleAdsense from "./components/GoogleAdsense";

export const metadata: Metadata = {
  metadataBase: new URL("https://themastersahib.com"),
  title: {
    default: "TheMasterSahib",
    template: "%s | TheMasterSahib",
  },
  description: "TheMasterSahib: a learning platform for educational resources, portfolio building, and resume creation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TheMasterSahib",
    description: "Learn, practice, and grow with TheMasterSahib.",
    url: "https://themastersahib.com",
    siteName: "TheMasterSahib",
    type: "website",
    images: [
      {
        url: "/images/main_logo.png",
        width: 512,
        height: 512,
        alt: "TheMasterSahib Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheMasterSahib",
    description: "Learn, practice, and grow with TheMasterSahib.",
    images: ["/images/main_logo.png"],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/main_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.GOOGLE_ANALYTICS_ID || '';
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB || '';

  return (
    <html lang="en">
      <head>
      </head>
      <body className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <GoogleAnalytics gaId={gaId} />
        {adsenseId && <GoogleAdsense publisherId={adsenseId} />}
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
