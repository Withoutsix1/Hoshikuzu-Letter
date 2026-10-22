import { AnimatePresence, motion } from "motion/react";
import type { ReadingMode } from "./readingModes";
import { STAR_FLARE_PATH } from "./starVisuals";

const PAPER_STAR_CORE =
  "M48 15 Q53 39 78 48 Q53 53 48 81 Q43 53 18 48 Q43 43 48 15Z";
type Props = {
  mode: ReadingMode;
  reduced: boolean;
  paused: boolean;
  index: number;
  page: { speaker: string; text: string };
  place?: string;
  caption?: string;
  revealed: number;
  auto: boolean;
  skip: boolean;
  burst: number;
  last: boolean;
  pageCount?: number;
  advance: () => void;
  toggleAuto: () => void;
  toggleSkip: () => void;
  log: () => void;
  save: () => void;
  settings: () => void;
  back: () => void;
  hide: () => void;
  hiding?: boolean;
  onHidden?: () => void;
};
export default function ReadingPage({
  mode,
  reduced,
  paused,
  index,
  page,
  place,
  caption,
  revealed,
  auto,
  skip,
  burst,
  last,
  pageCount,
  advance,
  toggleAuto,
  toggleSkip,
  log,
  save,
  settings,
  back,
  hide,
  hiding = false,
  onHidden,
}: Props) {
  const active = !reduced && !paused;
  const complete = revealed >= page.text.length;
  const speaker = page.speaker === '旁白' ? '' : page.speaker;
  return (
    <motion.div
      className={`letter-reading reading-${mode} ${active ? "reading-motion" : ""}`}
      data-reading-mode={mode}
      data-page={index + 1}
      data-hiding={hiding}
      inert={hiding || paused}
      initial={{ opacity: 0 }}
      animate={{ opacity: hiding ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : hiding ? 0.45 : 0.3, ease: "easeInOut" }}
      onAnimationComplete={() => { if (hiding) onHidden?.(); }}
    >
      <button className="reading-scene-input" aria-label="推进场景对白" onClick={advance}
        onContextMenu={event=>{event.preventDefault();event.stopPropagation();hide();}} tabIndex={-1} />
      <header className="reading-header">
        {(place || caption) && <div className="reading-place">
          <span>{place}</span>
          {caption && <p>{caption}</p>}
        </div>}
        <button className="reading-return" onClick={back}>
          返回主页面 <span aria-hidden="true">↗</span>
        </button>
      </header>
      <div className="reading-frame">
        {mode === "special" && (
          <div className="letter-paper-layers" aria-hidden="true">
            <span className="letter-underleaf leaf-one">
              <Manuscript />
            </span>
            <span className="letter-underleaf leaf-two" />
            <span className="letter-underleaf leaf-three" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            className="reading-paper-shell"
            key={mode}
            initial={{ opacity: 0, y: reduced ? 0 : 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            <article
              className="reading-paper"
              aria-label={mode === "normal" ? "普通交互信笺" : "特殊交互信笺"}
            >
              <span className="reading-paper-grain" aria-hidden="true" />
              <PaperConstellation />
              {mode === "special" && <Manuscript />}
              <header className="reading-paper-heading">
                <h3 aria-hidden={!speaker || undefined}>
                  {speaker && <><PaperStar /><span>{speaker}</span></>}
                </h3>
                <div className="reading-page-count">
                  <span>{String(index + 1).padStart(2, "0")}{pageCount ? ` / ${String(pageCount).padStart(2, "0")}` : ''}</span>
                </div>
              </header>
              <p className="reading-copy" aria-live="off">
                <span className="reading-copy-size" aria-hidden="true">
                  {page.text}
                </span>
                <span className="reading-copy-revealed">
                  {page.text.slice(0, revealed)}
                  {!complete && (
                    <i className="reading-cursor" aria-hidden="true" />
                  )}
                </span>
              </p>
              <button
                className="reading-advance"
                aria-label="推进对白"
                onClick={advance}
              >
                <span
                  className={`reading-next-star ${complete ? "ready" : "writing"}`}
                  aria-hidden="true"
                >
                  <PaperStar />
                  {active &&
                    burst > 0 &&
                    [0, 1, 2, 3].map((i) => (
                      <motion.i
                        key={`${burst}-${i}`}
                        initial={{ opacity: 0.9, x: 0, y: 0 }}
                        animate={{
                          opacity: 0,
                          x: [20, -18, 17, -13][i],
                          y: [-18, -13, 19, 18][i],
                        }}
                        transition={{ duration: 0.48 }}
                      >
                        ✦
                      </motion.i>
                    ))}
                </span>
              </button>
            </article>
          </motion.div>
        </AnimatePresence>
        <nav className="reading-toolbar" aria-label="信笺工具栏"
          onMouseDownCapture={event=>event.stopPropagation()}
          onKeyDownCapture={event=>event.stopPropagation()}
          onKeyUpCapture={event=>event.stopPropagation()}>
          <ToolbarThread />
          <button
            aria-label="自动阅读"
            aria-pressed={auto}
            disabled={last && complete}
            onClick={toggleAuto}
          >
            <ToolIcon kind="AUTO" />
            <span>AUTO</span>
          </button>
          <button
            aria-label="快进阅读"
            aria-pressed={skip}
            disabled={last && complete}
            onClick={toggleSkip}
          >
            <ToolIcon kind="SKIP" />
            <span>SKIP</span>
          </button>
          <button aria-label="查看阅读记录" onClick={log}>
            <ToolIcon kind="LOG" />
            <span>LOG</span>
          </button>
          <button aria-label="保存阅读位置" onClick={save}>
            <ToolIcon kind="SAVE" />
            <span>SAVE</span>
          </button>
          <button aria-label="打开阅读设置" onClick={settings}>
            <ToolIcon kind="CONFIG" />
            <span>CONFIG</span>
          </button>
          <ToolbarThread reverse />
        </nav>
        <div className="reading-underbar">
          <span role="status">
            {auto ? "自动阅读中" : skip ? "快进阅读中" : "点击信纸，续读下一句"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PaperStar({
  x,
  y,
  size,
}: { x?: number; y?: number; size?: number } = {}) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      aria-hidden="true"
    >
      <path d={STAR_FLARE_PATH} opacity="0.6" />
      <path d={PAPER_STAR_CORE} />
    </svg>
  );
}
function PaperConstellation() {
  return (
    <svg
      className="paper-constellation"
      viewBox="0 0 700 180"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="paper-trace"
        d="M16 141 Q38 125 48 113 T84 109 M48 113 L44 151 M610 150 Q623 131 647 134 T690 109 M633 141 L657 170"
      />
      <path d="M43 105 51 113 43 121 35 113Z M623 143 631 151 623 159 615 151Z" />
    </svg>
  );
}
function Manuscript() {
  return (
    <svg className="letter-manuscript" viewBox="0 0 350 185" aria-hidden="true">
      {Array.from({ length: 10 }, (_, row) => (
        <path
          key={row}
          d={`M${20 + row * 2} ${15 + row * 17} ${Array.from(
            { length: 11 - (row % 3) },
            (_, col) =>
              `q${5 + (col % 3)} -${4 + (row % 4)} 9 -1 q-5 10 2 5 q8 -15 7 -7 l6 3`,
          ).join(" ")}`}
        />
      ))}
    </svg>
  );
}
function ToolIcon({
  kind,
}: {
  kind: "AUTO" | "SKIP" | "LOG" | "SAVE" | "CONFIG";
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {kind === "AUTO" && <path d="M7 4 19 12 7 20Z" />}
      {kind === "SKIP" && <path d="m5 6 6 6-6 6M13 6l6 6-6 6" />}
      {kind === "LOG" && <path d="M5 6h14M5 12h14M5 18h14" />}
      {kind === "SAVE" && (
        <>
          <path d="M5 3h12l3 3v15H4V3Z M8 3v6h8V3 M8 21v-8h8v8" />
          <path d="M12 15v3" />
        </>
      )}
      {kind === "CONFIG" && (
        <>
          <path d="M9.283 5.440 L10.670 5.026 L10.676 2.694 L13.324 2.694 L13.330 5.026 L14.717 5.440 L14.717 5.440 L15.991 6.128 L17.644 4.483 L19.517 6.356 L17.872 8.009 L18.560 9.283 L18.560 9.283 L18.974 10.670 L21.306 10.676 L21.306 13.324 L18.974 13.330 L18.560 14.717 L18.560 14.717 L17.872 15.991 L19.517 17.644 L17.644 19.517 L15.991 17.872 L14.717 18.560 L14.717 18.560 L13.330 18.974 L13.324 21.306 L10.676 21.306 L10.670 18.974 L9.283 18.560 L9.283 18.560 L8.009 17.872 L6.356 19.517 L4.483 17.644 L6.128 15.991 L5.440 14.717 L5.440 14.717 L5.026 13.330 L2.694 13.324 L2.694 10.676 L5.026 10.670 L5.440 9.283 L5.440 9.283 L6.128 8.009 L4.483 6.356 L6.356 4.483 L8.009 6.128 L9.283 5.440Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
function ToolbarThread({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg
      className={`toolbar-thread ${reverse ? "reverse" : ""}`}
      viewBox="0 0 145 30"
      aria-hidden="true"
    >
      <path d="M0 17 Q35 12 64 17 T140 15 M105 12l4 4-4 4-4-4Z M35 12l3 4-3 4-3-4Z" />
      <circle cx="133" cy="16" r="1.5" />
    </svg>
  );
}
