export type ReadingMode = "normal" | "special";
export function isReadingMode(value: unknown): value is ReadingMode {
  return value === "normal" || value === "special";
}
