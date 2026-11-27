export interface ChapterVideo {
  youtubeId: string;
  url: string;
  title: string;
  duration?: string;
}

const UNIT_1_VIDEO: ChapterVideo = {
  youtubeId: 'W6Moq8MhVVw',
  url: 'https://youtu.be/W6Moq8MhVVw',
  title: 'Class 9 English Unit 1: The Last Sermon of the Holy Prophet (PBUH)',
  duration: '6:21',
};

export const CHAPTER_VIDEOS: Record<string, ChapterVideo> = {
  'class-ix-english-class-ix-english-unit-1-notes': UNIT_1_VIDEO,
  'class-ix-english-class-ix-english-unit-1-solved-textbook-exercises': UNIT_1_VIDEO,
};

export function getChapterVideo(chapterId: string | undefined): ChapterVideo | null {
  if (!chapterId) return null;
  return CHAPTER_VIDEOS[chapterId] ?? null;
}
