import type { Scene } from './model';

export interface PreviewLine { speaker: string; text: string }
export interface PreviewScene {
  id: Scene;
  label: string;
  en: string;
  title: string;
  description: string;
  hints: string[];
}
export interface VoiceGainRule { id: string; hash: string; multiplier: number }

// Optional project content. Keep private game text and production tables in your own project.
export const previewLines: PreviewLine[] = [];
export const previewScenes: PreviewScene[] = [];
export const legacyArchivePositions: Record<string, Record<string, string>> = {};
export const voicePlaybackGains: VoiceGainRule[] = [];
