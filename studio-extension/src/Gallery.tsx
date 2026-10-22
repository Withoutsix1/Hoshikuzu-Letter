import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useResource } from "./resources";
import { backgrounds, type BackgroundVariant } from "./visualAssets";
import { STAR_FLARE_PATH } from "./starVisuals";

type Category = "all" | "scenery" | "cg";
export type Artwork = {
  id: string;
  title: string;
  en: string;
  category: Exclude<Category, "all">;
  src: string;
  alt: string;
  description: string;
};
type GalleryEntry = {
  id: string;
  category: Exclude<Category, "all">;
  number: number;
  artwork: Artwork | null;
};
const entriesPerPage = 2;
const categories: { id: Category; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "scenery", label: "场景图" },
  { id: "cg", label: "剧情 CG" },
];

export default function Gallery({
  background,
  reduced,
  hover,
  open,
  returnToTitle,
  artworks = [],
}: {
  background: BackgroundVariant;
  reduced: boolean;
  hover: () => void;
  open: () => void;
  returnToTitle: () => void;
  artworks?: Artwork[];
}) {
  const { portal } = useResource();
  const [category, setCategory] = useState<Category>("all");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRegion = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRegion.current) scrollRegion.current.scrollTop = 0;
  }, [category, page]);
  // Reserved entries keep paging usable while unreleased art remains empty.
  const capacity = Math.max(3, ...['scenery', 'cg'].map(category=>artworks.filter(item=>item.category===category).length));
  const entries: GalleryEntry[] = Array.from({length:capacity},(_,index)=>['scenery','cg'].map(category=>({
    id: category+'-'+index, category: category as 'scenery'|'cg', number:index+1,
    artwork: artworks.filter(item=>item.category===category)[index]??null,
  }))).flat();
  const visible = entries.filter(
    (entry) => category === "all" || entry.category === category,
  );
  const pageCount = Math.ceil(visible.length / entriesPerPage);
  const pageEntries = visible.slice(
    page * entriesPerPage,
    (page + 1) * entriesPerPage,
  );
  const collectedCount = artworks.filter(
    (artwork) => category === "all" || artwork.category === category,
  ).length;
  const selected =
    artworks.find((artwork) => artwork.id === selectedId) ?? null;
  const closeViewer = useCallback(() => setSelectedId(null), []);
  function changePage(next: number) {
    setPage(Math.max(0, Math.min(pageCount - 1, next)));
    hover();
  }
  return (
    <>
      <section
        className="gallery-scene"
        aria-label="星光画廊"
        inert={!!selected}
      >
        <GalleryOrbits />
        <header className="gallery-heading">
          <small>THE LIGHT WE KEEP</small>
          <h3>
            星光画廊 <span>GALLERY</span>
          </h3>
          <svg
            className="gallery-title-thread"
            viewBox="0 0 530 16"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 8H530" />
            <path
              className="gallery-thread-star"
              d="m116 5 3 3-3 3-3-3Z m91 0 3 3-3 3-3-3Z"
            />
          </svg>
        </header>
        <button className="gallery-return" onClick={returnToTitle}>
          <span className="gallery-return-star" aria-hidden="true">
            ✦
          </span>
          <span>← 返回主界面</span>
        </button>
        <div className="gallery-toolbar">
          <div className="gallery-filters" role="group" aria-label="画廊分类">
            {categories.map((item) => (
              <button
                key={item.id}
                aria-pressed={category === item.id}
                onClick={() => {
                  setCategory(item.id);
                  setPage(0);
                  hover();
                }}
              >
                {item.label}
                <span>
                  {item.id === "all"
                    ? artworks.length
                    : artworks.filter((artwork) => artwork.category === item.id)
                        .length}
                </span>
              </button>
            ))}
          </div>
          <span className="gallery-count" role="status">
            {String(collectedCount).padStart(2, "0")} 幅图景
          </span>
        </div>
        <div className="gallery-scroll" ref={scrollRegion}>
          <div
            className="gallery-grid"
            aria-label={"第 " + (page + 1) + " 页画廊"}
          >
            {pageEntries.map((entry) =>
              entry.artwork ? (
                <motion.button
                  className="gallery-card"
                  key={entry.id}
                  aria-label={"查看大图：" + entry.artwork.title}
                  aria-haspopup="dialog"
                  initial={{ opacity: 0, y: reduced ? 0 : 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: reduced ? 0 : -2 }}
                  transition={{ duration: reduced ? 0 : 0.24 }}
                  onPointerEnter={hover}
                  onClick={() => {
                    setSelectedId(entry.artwork!.id);
                    open();
                  }}
                >
                  <div className="gallery-card-image">
                    <img
                      src={entry.artwork.src}
                      alt={entry.artwork.alt}
                      decoding="async"
                      draggable={false}
                    />
                    <span className="gallery-card-index">
                      SCENERY / {String(entry.number).padStart(2, "0")}{" "}
                      <i aria-hidden="true">✦</i>
                    </span>
                  </div>
                  <div className="gallery-card-caption">
                    <GalleryManuscript />
                    <div className="gallery-caption-copy">
                      <small>{entry.artwork.en}</small>
                      <strong>
                        {entry.artwork.title}
                        <span
                          className="gallery-caption-thread"
                          aria-hidden="true"
                        >
                          ✦
                        </span>
                      </strong>
                      <p>每一束光，都有抵达的时间。</p>
                    </div>
                    <span className="gallery-card-view">
                      查看大图 ↗{" "}
                      <i className="gallery-card-star" aria-hidden="true">
                        ✦
                      </i>
                    </span>
                  </div>
                  <CardCorners />
                </motion.button>
              ) : (
                <PendingArtwork key={entry.id} entry={entry} />
              ),
            )}
          </div>
        </div>
        <nav className="gallery-pages" aria-label="星光画廊页码">
          <svg
            className="gallery-page-thread"
            viewBox="0 0 440 24"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 12H440" />
            <path d="m25 9 3 3-3 3-3-3Z m390 0 3 3-3 3-3-3Z" />
          </svg>
          <button
            className="gallery-page-arrow"
            aria-label="上一页画廊"
            disabled={page === 0}
            onClick={() => changePage(page - 1)}
          >
            <svg viewBox="0 0 12 20" aria-hidden="true">
              <path d="M9 3 3 10 9 17" />
            </svg>
          </button>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              aria-label={"第 " + (index + 1) + " 页画廊"}
              aria-current={page === index ? "page" : undefined}
              onClick={() => changePage(index)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
          <button
            className="gallery-page-arrow"
            aria-label="下一页画廊"
            disabled={page === pageCount - 1}
            onClick={() => changePage(page + 1)}
          >
            <svg viewBox="0 0 12 20" aria-hidden="true">
              <path d="m3 3 6 7-6 7" />
            </svg>
          </button>
          <span className="gallery-page-status" role="status">
            第 {page + 1} / {pageCount} 页
          </span>
        </nav>
      </section>
      {portal && createPortal(
        <AnimatePresence>
          {selected && (
            <ArtworkViewer
              artwork={selected}
              close={closeViewer}
              reduced={reduced}
            />
          )}
        </AnimatePresence>,
        portal,
      )}
    </>
  );
}

function CardCorners() {
  return (
    <span className="gallery-frame-corners" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
function PendingArtwork({ entry }: { entry: GalleryEntry }) {
  const isCG = entry.category === "cg";
  return (
    <article
      className={"gallery-pending" + (isCG ? "" : " gallery-pending-scenery")}
      aria-label={
        (isCG ? "剧情 CG" : "场景图") +
        " 尚未收录 / " +
        String(entry.number).padStart(2, "0")
      }
    >
      <GalleryFlora />
      <GalleryManuscript />
      <div className="gallery-pending-content">
        <svg
          className="gallery-pending-symbol"
          viewBox="0 0 160 160"
          aria-hidden="true"
        >
          <path className="gallery-symbol-axis" d="M80 4V156 M4 80H156" />
          <circle cx="80" cy="80" r="66" />
          <circle cx="80" cy="80" r="51" />
          <circle cx="80" cy="80" r="39" />
          <circle
            className="gallery-symbol-orbit"
            cx="80"
            cy="80"
            r="48"
            strokeDasharray="1 10"
          />
          <svg
            x="58"
            y="58"
            width="44"
            height="44"
            viewBox="0 0 96 96"
            className="gallery-symbol-core"
          >
            <path d={STAR_FLARE_PATH} />
            <circle cx="48" cy="48" r="4" />
          </svg>
        </svg>
        <small>LETTERS YET TO ARRIVE</small>
        <h4>{isCG ? "尚待来信" : "尚待星光"}</h4>
        <p>
          {isCG ? "剧情 CG 尚未收录。" : "这幅图景尚未收录。"}
          <br />
          下一幕光景，留在未来的信里。
        </p>
        <div className="gallery-pending-thread" aria-hidden="true">
          <span>✦</span>
          <span>✦</span>
        </div>
      </div>
      <span className="gallery-pending-label">
        {isCG ? "STORY CG" : "SCENERY"} /{" "}
        {String(entry.number).padStart(2, "0")}
      </span>
      <CardCorners />
    </article>
  );
}
function GalleryOrbits() {
  return (
    <svg
      className="gallery-orbits"
      viewBox="0 0 1672 941"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M1082 43C929 275 981 639 1248 694C1382 727 1529 733 1672 707 M1204-9C990 313 1157 667 1458 624C1535 615 1615 625 1686 614" />
      <circle cx="1165" cy="332" r="1.7" />
      <circle cx="1229" cy="507" r="1.2" />
      <circle cx="1547" cy="628" r="1.6" />
    </svg>
  );
}
function GalleryManuscript() {
  return (
    <svg
      className="gallery-manuscript"
      viewBox="0 0 520 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }, (_, row) => (
        <path
          key={row}
          d={
            "M" +
            (20 + row * 5) +
            " " +
            (15 + row * 20) +
            " " +
            Array.from(
              { length: 17 - (row % 3) },
              (_, column) =>
                "q" +
                (5 + (column % 4)) +
                " -5 9 -1 q-5 10 2 5 q8 -15 7 -7 l6 3",
            ).join(" ")
          }
        />
      ))}
    </svg>
  );
}
function GalleryFlora() {
  return (
    <svg
      className="gallery-flora"
      viewBox="0 0 540 270"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g transform="translate(32 272) rotate(-16)">
        <GallerySprig />
      </g>
      <g transform="translate(78 281) rotate(30) scale(.67)">
        <GallerySprig />
      </g>
      <g transform="translate(518 275) scale(-1 1) rotate(-16)">
        <GallerySprig />
      </g>
      <g transform="translate(464 281) scale(-.7 .7) rotate(30)">
        <GallerySprig />
      </g>
      <path d="M20 268Q61 236 140 259T278 261T426 259T535 268" fill="none" />
    </svg>
  );
}
function GallerySprig() {
  return (
    <g>
      <path d="M0 0Q-3-87 25-166" fill="none" />
      {Array.from({ length: 10 }, (_, index) => (
        <g
          key={index}
          transform={
            "translate(" +
            index * 1.5 +
            " " +
            (-15 - index * 14) +
            ") rotate(" +
            (index % 2 ? -143 : -13) +
            ")"
          }
        >
          <path d="M0 0C7-11 20-20 29-17C24-5 11 4 0 0Z" />
        </g>
      ))}
    </g>
  );
}

function ArtworkViewer({
  artwork,
  close,
  reduced,
}: {
  artwork: Artwork;
  close: () => void;
  reduced: boolean;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;

    closeButton.current?.focus();
    function key(event: KeyboardEvent) {
      // Capture Escape before the app's global "return to title" shortcut.
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") {
        event.preventDefault();
        closeButton.current?.focus();
      }
    }
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("keydown", key, true);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [close]);
  return (
    <motion.div
      className="gallery-viewer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <motion.div
        className="gallery-viewer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-viewer-title"
        aria-describedby="gallery-viewer-description"
        initial={{ scale: reduced ? 1 : 0.98 }}
        animate={{ scale: 1 }}
        exit={{ scale: reduced ? 1 : 0.99 }}
        transition={{ duration: reduced ? 0 : 0.24 }}
      >
        <header className="gallery-viewer-heading">
          <span>
            GALLERY <i /> SCENERY / 01
          </span>
          <button ref={closeButton} aria-label="关闭大图" onClick={close}>
            关闭 <span aria-hidden="true">×</span>
          </button>
        </header>
        <img
          className="gallery-viewer-image"
          src={artwork.src}
          alt={artwork.alt}
        />
        <footer className="gallery-viewer-caption">
          <div>
            <small>{artwork.en}</small>
            <h2 id="gallery-viewer-title">{artwork.title}</h2>
            <p id="gallery-viewer-description">{artwork.description}</p>
          </div>
          <span>ESC · 返回画廊</span>
        </footer>
      </motion.div>
    </motion.div>
  );
}
