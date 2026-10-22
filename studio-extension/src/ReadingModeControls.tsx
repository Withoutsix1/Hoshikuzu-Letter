import type { ReadingMode } from "./readingModes";

export default function ReadingModeControls({
  mode,
  change,
}: {
  mode: ReadingMode;
  change: (mode: ReadingMode) => void;
}) {
  return (
    <div
      className="letter-mode-controls"
      role="group"
      aria-label="阅读界面样式"
    >
      <span>阅读样式</span>
      <button
        aria-label="切换阅读界面样式"
        aria-pressed={mode === "special"}
        onClick={() => change(mode === "normal" ? "special" : "normal")}
      >
        普通交互 <i aria-hidden="true">⇄</i> 特殊交互
        <small>当前 · {mode === "normal" ? "冷白信纸" : "暖金叠纸"}</small>
      </button>
    </div>
  );
}
