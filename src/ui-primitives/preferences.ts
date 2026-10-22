import type { Quality } from "./visualTypes.js";

export interface Preferences {
  quality: Quality;
  sound: boolean;
  bgm: number;
  se: number;
  textSpeed: number;
  reduced: boolean;
}

export const defaultPreferences: Preferences = {
  quality: "high",
  sound: false,
  bgm: 35,
  se: 35,
  textSpeed: 55,
  reduced: false,
};

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
