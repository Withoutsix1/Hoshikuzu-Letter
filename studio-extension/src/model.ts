export type Scene =
  "letter" | "title" | "dialogue" | "causal" | "memory" | "ambient" | "gallery";
export type Quality = "high" | "medium" | "low" | "off";
export type StoryPhase = 0 | 1 | 2;
export const particleCounts = { high: 80, medium: 48, low: 16, off: 0 };
export const storyPhaseLabels = ["初始", "前置剧情之后", "终章"] as const;
export function isStoryPhase(value: unknown): value is StoryPhase {
  return value === 0 || value === 1 || value === 2;
}
export interface Preferences {
  quality: Quality;
  sound: boolean;
  bgm: number;
  se: number;
  textSpeed: number;
  reduced: boolean;
}
export interface BetaState {
  isBetaTester: boolean;
  hasSeenBetaLetter: boolean;
  betaTitleUnlocked: boolean;
}
export interface Snapshot {
  line: number;
  branch: number | null;
  savedAt: string;
  excerpt: string;
  storyPhase?: StoryPhase;
  thumbnail?: string;
  speaker?: string;
  chapterLabel?: string;
  background?: "observatory" | "milky-way";
  readingMode?: "normal" | "special";
}
export const archivePageCount = 5;
export const archiveSlotsPerPage = 6;
export const archiveSlotCount = archivePageCount * archiveSlotsPerPage;
export function expandSlots(slots: (Snapshot | null)[]): (Snapshot | null)[] {
  return Array.from({ length: archiveSlotCount }, (_, i) => slots[i] ?? null);
}
export interface HistoryLine {
  speaker: string;
  text: string;
  line: number;
}

export const defaultBeta: BetaState = {
  isBetaTester: true,
  hasSeenBetaLetter: false,
  betaTitleUnlocked: false,
};
export const defaultPreferences: Preferences = {
  quality: "high",
  sound: false,
  bgm: 35,
  se: 35,
  textSpeed: 55,
  reduced: false,
};
export function isBeta(value: unknown): value is BetaState {
  if (!value || typeof value !== "object") return false;
  return ["isBetaTester", "hasSeenBetaLetter", "betaTitleUnlocked"].every(
    (key) => typeof (value as Record<string, unknown>)[key] === "boolean",
  );
}
export function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const v = value as Preferences;
  return (
    ["high", "medium", "low", "off"].includes(v.quality) &&
    typeof v.sound === "boolean" &&
    typeof v.reduced === "boolean" &&
    ["bgm", "se", "textSpeed"].every((key) => {
      const n = v[key as keyof Preferences];
      return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;
    })
  );
}
export function isSlots(value: unknown): value is (Snapshot | null)[] {
  return (
    Array.isArray(value) &&
    (value.length === archiveSlotsPerPage ||
      value.length === archiveSlotCount) &&
    value.every(
      (s) =>
        s === null ||
        (typeof s === "object" &&
          Number.isInteger(s.line) &&
          s.line >= 0 &&
          s.line < 6 &&
          (s.branch === null || s.branch === 0 || s.branch === 1) &&
          typeof s.savedAt === "string" &&
          typeof s.excerpt === "string" &&
          (s.storyPhase === undefined || isStoryPhase(s.storyPhase)) &&
          (s.thumbnail === undefined ||
            (typeof s.thumbnail === "string" &&
              s.thumbnail.length <= 300000 &&
              /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s.thumbnail))) &&
          (s.background === undefined ||
            s.background === "observatory" ||
            s.background === "milky-way") &&
          (s.readingMode === undefined ||
            s.readingMode === "normal" ||
            s.readingMode === "special")),
    )
  );
}
export { previewLines as lines, previewScenes as scenes } from './projectData';
