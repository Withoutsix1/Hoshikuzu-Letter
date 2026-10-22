export type ArchiveMode = 'save' | 'load';

/** Display-only data. The application owns storage and game state. */
export interface ArchiveEntry {
  savedAt: string;
  excerpt: string;
  chapterLabel?: string;
  speaker?: string;
  thumbnail?: string;
}
