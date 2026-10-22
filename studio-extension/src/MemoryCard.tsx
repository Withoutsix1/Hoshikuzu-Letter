import { useLayoutEffect, useRef } from "react";
import type { Snapshot } from "./model";
import type { BackgroundVariant } from "./visualAssets";
import type { ReadingMode } from "./readingModes";
import { STAR_FLARE_PATH } from "./starVisuals";
import MemoryThumbnail from "./MemoryThumbnail";
import { useResource } from "./resources";

export default function MemoryCard({
  snapshot,
  index,
  mode,
  background,
  readingMode,
  reduced,
  hover,
  activate,
}: {
  snapshot: Snapshot | null;
  index: number;
  mode: "save" | "load";
  background: BackgroundVariant;
  readingMode: ReadingMode;
  reduced: boolean;
  hover: () => void;
  activate: () => void;
}) {
  const { url } = useResource();
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
  const action = mode === "save" ? (snapshot ? "覆盖" : "保存") : "读取";
  return (
    <button
      ref={card}
      className={`memory-card ${snapshot ? "filled" : "empty"}`}
      aria-label={`${action}第 ${label} 封记忆${snapshot ? `，${snapshot.excerpt}` : "，空白信笺"}`}
      disabled={mode === "load" && !snapshot}
      data-reduced={reduced}
      onPointerEnter={hover}
      onClick={activate}
    >
      <img
        className="memory-card-art"
        src={
          snapshot
            ? url("assets/archive-filled-frame.png")
            : url("assets/archive-empty-frame.png")
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <span className="memory-card-topline">
        <span>LETTER {label}</span>
        {snapshot && (
          <time dateTime={snapshot.savedAt}>
            {new Date(snapshot.savedAt).toLocaleString("zh-CN", {
              timeZone: "Asia/Hong_Kong",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </time>
        )}
      </span>
      {snapshot ? (
        <>
          <MemoryThumbnail
            snapshot={snapshot}
            background={background}
            mode={readingMode}
          />
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
