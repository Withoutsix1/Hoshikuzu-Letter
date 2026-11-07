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

export const dailyHistoryIndex = { blockDays: {} as Record<string, number>, textDays: {} as Record<string, number[]>, voiceDays: {} as Record<string, number>, firstTextByDay: {} as Record<string, string> };
export interface PhoneSystemNotice { thread: string; fromDay: number; id: string; text: string; orderOffset: number }
export const phoneSystemNotices: PhoneSystemNotice[] = [];
