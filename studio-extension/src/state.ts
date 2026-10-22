import manifest from '../extension.json';
import { defineSave, type ExtensionContext } from '@avg-studio/sdk';
import type { StoryPhase } from './model';
export const key = (name: string) => `${manifest.id}.${name}`;
export const uiSave = defineSave({
  readingMode: { type:'string',persistence:'slot',default:'normal' },
  readingPlace: { type:'string',persistence:'slot',default:'' },
  readingCaption: { type:'string',persistence:'slot',default:'' },
  storyPhase: { type: 'number', persistence: 'shared', default: 0 },
  isBetaTester: { type: 'boolean', persistence: 'shared', default: false },
  betaIdentityInitialized: { type: 'boolean', persistence: 'shared', default: false },
  hasSeenBetaLetter: { type: 'boolean', persistence: 'shared', default: false },
  hasSeenOpeningLetter: { type: 'boolean', persistence: 'shared', default: false },
  betaTitleUnlocked: { type: 'boolean', persistence: 'shared', default: false },
  quality: { type: 'string', persistence: 'shared', default: 'high' },
  originalEffectsInitialized: { type: 'boolean', persistence: 'shared', default: false },
  unmutedMasterVolume: { type: 'number', persistence: 'shared', default: 100 },
  volumePercentInitialized: { type: 'boolean', persistence: 'shared', default: false },
  skipRangeInitialized: { type: 'boolean', persistence: 'shared', default: false },
  voicePlaybackPolicyVersion: { type: 'number', persistence: 'shared', default: 0 },
  reducedMotion: { type: 'boolean', persistence: 'shared', default: false },
  unlockedArtwork: { type: 'list', persistence: 'shared', default: [] as Artwork[] },
});
export type Artwork = { id: string; title: string; category: 'scenery' | 'cg'; source: string; description: string };
export function storyPhase(value: unknown): StoryPhase {
  return value === 1 || value === 2 ? value : 0;
}
export function artworkList(value: unknown): Artwork[] {
  return Array.isArray(value) ? value.filter((item): item is Artwork =>
    !!item && typeof item.id === 'string' && typeof item.title === 'string' &&
    typeof item.source === 'string' && (item.category === 'cg' || item.category === 'scenery')) : [];
}
export async function persist(ctx: ExtensionContext) { await ctx.archive.flushShared(); }
