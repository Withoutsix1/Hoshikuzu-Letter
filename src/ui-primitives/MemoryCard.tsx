import { useLayoutEffect, useRef } from "react";
import type { ArchiveEntry, ArchiveMode } from "./archiveTypes.js";
import { STAR_FLARE_PATH } from "./starVisuals.js";
import MemoryThumbnail from "./MemoryThumbnail.js";

export default function MemoryCard({
  snapshot,
  index,
  mode,
  reduced,
  disabled = false,
  locale = "zh-CN",
  timeZone = "Asia/Hong_Kong",
  hover,
  activate,
}: {
  snapshot: ArchiveEntry | null;
  index: number;
  mode: ArchiveMode;
  reduced: boolean;
  disabled?: boolean;
  locale?: string;
  timeZone?: string;
  hover: () => void;
  activate: () => void;
}) {
  const card = useRef<HTMLButtonElement>(null);
  const filled = snapshot !== null;
  useLayoutEffect(() => {
    const element = card.current;
    if (!element || !filled) return;
    function updatePhotoPivot() {
      const style = getComputedStyle(element!);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      // The square photo's center stays still while its frame scales.
      element!.style.setProperty(
        "--memory-photo-pivot-y",
        `${height * 0.285 + width * 0.1265}px`,
      );
    }
    updatePhotoPivot();
    const observer = new ResizeObserver(updatePhotoPivot);
    observer.observe(element);
    return () => observer.disconnect();
  }, [filled]);
  const label = String(index + 1).padStart(2, "0");
  const date = snapshot ? new Date(snapshot.savedAt) : null;
  const validDate = date !== null && !Number.isNaN(date.getTime());
  let timestamp = "时间未知";
  if (validDate) {
    try { timestamp = date.toLocaleString(locale, { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }); }
    catch { timestamp = date.toISOString(); }
  }
  const action = mode === "save" ? (snapshot ? "覆盖" : "保存") : "读取";
  return (
    <button
      ref={card}
      type="button"
      className={`memory-card ${snapshot ? "filled" : "empty"}`}
      aria-label={`${action}第 ${label} 封记忆${snapshot ? `，${snapshot.excerpt}` : "，空白信笺"}`}
      disabled={disabled || (mode === "load" && !snapshot)}
      data-reduced={reduced}
      onPointerEnter={event => { if (event.pointerType !== "touch" && !event.currentTarget.matches(":disabled")) hover(); }}
      onClick={event => { if (!event.currentTarget.matches(":disabled")) activate(); }}
    >
      <span className="memory-card-frame" aria-hidden="true" />
      <span className="memory-card-topline">
        <span>LETTER {label}</span>
        {snapshot && (
          <time dateTime={validDate ? snapshot.savedAt : undefined}>{timestamp}</time>
        )}
      </span>
      {snapshot ? (
        <>
          <MemoryThumbnail snapshot={snapshot} />
          <span className="memory-card-copy">
            <strong>{snapshot.chapterLabel || snapshot.speaker || "星屑记录"}</strong>
            <span>{snapshot.excerpt}</span>
          </span>
          <span className="memory-card-load" aria-hidden="true">
            {mode === "save" ? "SAVE" : "LOAD"}
          </span>
        </>
      ) : (
        <>
          <svg
            className="memory-empty-star"
            viewBox="0 0 96 96"
            aria-hidden="true"
          >
            <ellipse
              cx="48"
              cy="48"
              rx="30"
              ry="16"
              transform="rotate(-24 48 48)"
            />
            <path d={STAR_FLARE_PATH} />
          </svg>
          <span className="memory-card-empty-copy">
            <strong>尚未寄出的信</strong>
            <span>
              {mode === "save" ? (
                <>
                  点击，将此刻
                  <br />
                  收藏为星屑记录。
                </>
              ) : (
                <>
                  空白信笺
                  <br />
                  等待下一次来信。
                </>
              )}
            </span>
          </span>
        </>
      )}
    </button>
  );
}
