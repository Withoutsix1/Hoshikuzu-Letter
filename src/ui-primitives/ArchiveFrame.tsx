import { Fragment, useId, type ReactNode } from "react";
import { STAR_FLARE_PATH } from "./starVisuals.js";
import type { ArchiveMode } from "./archiveTypes.js";

const stars = [
  [251, 183, 13],
  [400, 108, 11],
  [663, 98, 9],
  [677, 94, 12],
  [801, 179, 8],
  [826, 208, 15],
  [1107, 70, 18],
  [1135, 95, 15],
  [122, 824, 13],
  [544, 842, 12],
  [685, 865, 13],
  [1020, 809, 13],
  [1123, 841, 12],
  [1522, 840, 10],
] as const;

export default function ArchiveFrame({
  mode,
  saveEnabled,
  changeMode,
  reduced,
  paused,
  page,
  changePage,
  pageCount = 5,
  children,
}: {
  mode: ArchiveMode;
  saveEnabled: boolean;
  changeMode: (mode: ArchiveMode) => void;
  reduced: boolean;
  paused: boolean;
  page: number;
  changePage: (page: number) => void;
  pageCount?: number;
  children?: ReactNode;
}) {
  const id = `archive-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const count = Number.isSafeInteger(pageCount) && pageCount > 0 ? pageCount : 1;
  const current = Number.isSafeInteger(page) ? Math.max(0, Math.min(page, count - 1)) : 0;
  const pages = count <= 7 ? Array.from({ length: count }, (_, index) => index)
    : [...new Set([0, current - 1, current, current + 1, count - 1])].filter(index => index >= 0 && index < count).sort((a, b) => a - b);
  return (
    <div className="archive-frame" data-reduced={reduced} data-paused={paused}>
      <svg
        className="archive-constellation"
        viewBox="0 0 1672 940"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-chain`}>
            <stop offset="0" stopColor="#ddc17e" stopOpacity=".26" />
            <stop offset=".12" stopColor="#ffe4a6" stopOpacity=".88" />
            <stop offset=".45" stopColor="#edce88" stopOpacity=".65" />
            <stop offset=".73" stopColor="#e7cd99" stopOpacity=".38" />
            <stop offset="1" stopColor="#dec395" stopOpacity=".14" />
          </linearGradient>
          <linearGradient id={`${id}-title`}>
            <stop stopColor="#fff0be" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff0be" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="archive-chain-breath" fill="none" strokeWidth="1.25">
          <path
            className="archive-header-chain"
            stroke={`url(#${id}-chain)`}
            d="M0 183 H392 C503 183 554 145 628 113 C687 87 735 81 768 113 C800 144 787 188 826 208 C853 222 893 217 932 217 H1610"
          />
          <path
            stroke={`url(#${id}-title)`}
            d="M76 183 H329"
            strokeWidth="1.8"
          />
          <path
            className="archive-poem-chain"
            stroke={`url(#${id}-chain)`}
            d="M1119 95 C1180 99 1240 96 1290 98 H1412"
          />
          <path
            className="archive-footer-chain archive-footer-chain-left"
            stroke={`url(#${id}-chain)`}
            d="M-15 788 C45 803 90 815 122 824 C231 839 417 829 500 836 C575 842 592 862 639 864 C658 865 686 865 710 864"
          />
          <path
            className="archive-footer-chain"
            stroke={`url(#${id}-chain)`}
            d="M991 809 C1037 807 1058 827 1123 841 C1183 852 1418 845 1486 843 C1565 842 1623 824 1687 798"
          />
          <path
            className="archive-footer-hairline"
            stroke="#d5c08c"
            strokeOpacity=".19"
            strokeWidth=".65"
            d="M602 808 C752 805 916 808 1098 808"
          />
        </g>
        {stars.map(([x, y, size], i) => (
          <svg
            key={i}
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            viewBox="0 0 96 96"
            overflow="visible"
            className={`archive-star ${y > 700 ? "archive-bottom-star" : "archive-top-star"} ${x === 685 || x === 544 ? "archive-left-page-star" : ""}`}
            style={{ animationDelay: `${-i * 0.38}s` }}
          >
            <path d={STAR_FLARE_PATH} fill="#ffeac0" />
            <circle cx="48" cy="48" r="5" fill="#fff5df" />
          </svg>
        ))}
        <g fill="#edce91" opacity=".45">
          <circle cx="314" cy="183" r="1.3" />
          <circle cx="993" cy="809" r="1.5" />
          <circle cx="836" cy="808" r="1" />
          <circle cx="1238" cy="846" r="1.1" />
        </g>
      </svg>

      <header className="archive-heading">
        <p className="archive-eyebrow">MEMORY ARCHIVE</p>
        <h3>记忆信笺</h3>
        <p className="archive-caption">
          将此刻的记忆，
          <br />
          折进时间的信封里。
        </p>
      </header>
      <p className="archive-poem">
        那些曾经存在的日子，
        <br />
        依然在星光间闪光。
      </p>
      <p className="archive-side-poem">那些星芒，在时间里闪光。</p>

      <div className="archive-modes" role="group" aria-label="保存与读取记忆">
        {(["save", "load"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={`archive-mode ${mode === item ? "active" : ""}`}
            aria-pressed={mode === item}
            disabled={paused || (item === "save" && !saveEnabled)}
            title={
              item === "save" && !saveEnabled
                ? "当前环境未开放保存"
                : undefined
            }
            onClick={() => changeMode(item)}
          >
            {mode === item && (
              <>
                <svg
                  className="archive-mode-glint"
                  viewBox="0 0 96 96"
                  aria-hidden="true"
                >
                  <path d={STAR_FLARE_PATH} />
                </svg>
                <span className="archive-mode-dot" aria-hidden="true" />
              </>
            )}
            {item === "save" ? "保存记忆" : "读取记忆"}
          </button>
        ))}
      </div>

      <fieldset className="archive-content" disabled={paused || (mode === "save" && !saveEnabled)} aria-label="存档记录">{children}</fieldset>

      <nav className="archive-page-numbers" aria-label="记忆信笺页码">
        <button
          type="button"
          className="archive-page-arrow"
          aria-label="上一页存档"
          disabled={paused || current === 0}
          onClick={() => changePage(current - 1)}
        >
          <svg viewBox="0 0 12 20" aria-hidden="true">
            <path d="M9 3 3 10 9 17" />
          </svg>
        </button>
        {pages.map((index, position) => (
          <Fragment key={index}>
            {position > 0 && index > pages[position - 1] + 1 && <span className="archive-page-gap" aria-hidden="true">…</span>}
            <button type="button" className={current === index ? "active" : ""}
              aria-label={`第 ${index + 1} 页存档`} aria-current={current === index ? "page" : undefined}
              disabled={paused} onClick={() => changePage(index)}>
              {String(index + 1).padStart(2, "0")}
            </button>
          </Fragment>
        ))}
        <button
          type="button"
          className="archive-page-arrow"
          aria-label="下一页存档"
          disabled={paused || current === count - 1}
          onClick={() => changePage(current + 1)}
        >
          <svg viewBox="0 0 12 20" aria-hidden="true">
            <path d="m3 3 6 7-6 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
