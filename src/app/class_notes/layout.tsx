import type { Metadata } from 'next';
import { Atkinson_Hyperlegible } from 'next/font/google';

// Atkinson Hyperlegible was designed for low-vision readers: letters that are easy to confuse
// (l / I / 1, b / d) stay clearly different — a good fit for students who struggle with reading.
const readerFont = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-reader',
});

export const metadata: Metadata = {
  title: 'STBB Notes & Lesson Planning | Sindh Textbook Board Digital Notes',
  description: 'Interactive Sindh Textbook Board (STBB) digital notes, solved exercises, vocabulary, and lesson planning for Class ECE to XII.',
};

export default function ClassNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={readerFont.variable}>{children}</div>;
}
