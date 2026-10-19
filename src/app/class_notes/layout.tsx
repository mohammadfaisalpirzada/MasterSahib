import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'STBB Notes & Lesson Planning | Sindh Textbook Board Digital Notes',
  description: 'Interactive Sindh Textbook Board (STBB) digital notes, solved exercises, vocabulary, and lesson planning for Class ECE to XII.',
};

export default function ClassNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
