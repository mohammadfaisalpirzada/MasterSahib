import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";
import { Providers } from "./providers";



export const metadata: Metadata = {
  metadataBase: new URL("https://themastersahib.com"),
  title: {
    default: "TheMasterSahib",
    template: "%s | TheMasterSahib",
  },
  description: "TheMasterSahib: a learning platform for quiz practice, portfolio building, and resume creation.",
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
    icon: '/images/main_logo.png',
    shortcut: '/images/main_logo.png',
    apple: '/images/main_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body className="min-h-screen bg-gradient-to-b from-indigo-50 to-white"
          >
       <Providers>
         <AppShell>{children}</AppShell>
       </Providers>
      </body>
    </html>
  );
}
