export type ArtworkCategory = 'scenery' | 'cg';
export type GalleryCategory = 'all' | ArtworkCategory;

/** Display data supplied by the application; contains no unlock or game state. */
export interface Artwork {
  id: string;
  title: string;
  en: string;
  category: ArtworkCategory;
  src: string;
  alt: string;
  description: string;
}
