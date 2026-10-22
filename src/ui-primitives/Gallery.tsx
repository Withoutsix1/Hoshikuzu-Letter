import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import ArtworkViewer from './ArtworkViewer.js';
import GalleryImage from './GalleryImage.js';
import type { Artwork, ArtworkCategory, GalleryCategory } from './galleryTypes.js';
import { STAR_FLARE_PATH } from './starVisuals.js';

type GalleryEntry = { id: string; category: ArtworkCategory; number: number; artwork: Artwork | null };
const categories: { id: GalleryCategory; label: string }[] = [
  { id: 'all', label: '全部' }, { id: 'scenery', label: '场景图' }, { id: 'cg', label: '剧情 CG' },
];

export default function Gallery({ artworks = [], reduced, paused = false, reservedPerCategory = 0, hover, open, onReturn }: {
  artworks?: Artwork[];
  reduced: boolean;
  paused?: boolean;
  reservedPerCategory?: number;
  hover?: () => void;
  open?: (artwork: Artwork) => void;
  onReturn?: () => void;
}) {
  const [category, setCategory] = useState<GalleryCategory>('all');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRegion = useRef<HTMLDivElement>(null);
  const reserved = Number.isSafeInteger(reservedPerCategory) && reservedPerCategory > 0 ? Math.min(1000, reservedPerCategory) : 0;
  const grouped = { scenery: artworks.filter(item => item.category === 'scenery'), cg: artworks.filter(item => item.category === 'cg') };
  const lengths = { scenery: Math.max(reserved, grouped.scenery.length), cg: Math.max(reserved, grouped.cg.length) };
  const entries: GalleryEntry[] = [];
  for (let index = 0; index < Math.max(lengths.scenery, lengths.cg); index++) {
    for (const kind of ['scenery', 'cg'] as const) {
      if (index < lengths[kind]) entries.push({ id: `${kind}-${index}`, category: kind, number: index + 1, artwork: grouped[kind][index] ?? null });
    }
  }
  const visible = entries.filter(entry => category === 'all' || entry.category === category);
  const pageCount = Math.max(1, Math.ceil(visible.length / 2));
  const current = Math.min(page, pageCount - 1);
  const pageEntries = visible.slice(current * 2, current * 2 + 2);
  const pages = pageCount <= 7 ? Array.from({ length: pageCount }, (_, index) => index)
    : [...new Set([0, current - 1, current, current + 1, pageCount - 1])].filter(index => index >= 0 && index < pageCount).sort((a, b) => a - b);
  const collectedCount = category === 'all' ? artworks.length : grouped[category].length;
  const selected = entries.find(entry => entry.artwork?.id === selectedId) ?? null;
  const closeViewer = useCallback(() => setSelectedId(null), []);
  useEffect(() => {
    if (scrollRegion.current) scrollRegion.current.scrollTop = 0;
  }, [category, current]);
  useEffect(() => { if (page !== current) setPage(current); }, [page, current]);
  useEffect(() => {
    if (selectedId !== null && !selected) setSelectedId(null);
  }, [selectedId, selected]);
  function changePage(next: number) { setPage(next); hover?.(); }
  return <>
    <section className="gallery-scene" aria-label="星光画廊" data-reduced={reduced} data-paused={paused}>
      <GalleryOrbits />
      <header className="gallery-heading">
        <small>THE LIGHT WE KEEP</small><h3>星光画廊 <span>GALLERY</span></h3>
        <svg className="gallery-title-thread" viewBox="0 0 530 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8H530" /><path className="gallery-thread-star" d="m116 5 3 3-3 3-3-3Z m91 0 3 3-3 3-3-3Z" /></svg>
      </header>
      {onReturn && <button type="button" className="gallery-return" disabled={paused} onClick={onReturn}><span className="gallery-return-star" aria-hidden="true">✦</span><span>← 返回</span></button>}
      <div className="gallery-toolbar">
        <div className="gallery-filters" role="group" aria-label="画廊分类">
          {categories.map(item => <button type="button" key={item.id} disabled={paused} aria-pressed={category === item.id}
            onClick={() => { setCategory(item.id); setPage(0); hover?.(); }}>
            {item.label}<span>{item.id === 'all' ? artworks.length : grouped[item.id].length}</span>
          </button>)}
        </div>
        <span className="gallery-count" role="status">{String(collectedCount).padStart(2, '0')} 幅图景</span>
      </div>
      <div className="gallery-scroll" ref={scrollRegion}>
        <div className="gallery-grid" aria-label={`第 ${current + 1} 页画廊`}>
          {!pageEntries.length && <p className="gallery-empty" role="status">尚未收录图景。</p>}
          {pageEntries.map(entry => entry.artwork ? <motion.button type="button" className="gallery-card" key={entry.id}
            aria-label={`查看大图：${entry.artwork.title}`} aria-haspopup="dialog" disabled={paused}
            initial={{ opacity: 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: reduced || paused ? 0 : -2 }} transition={{ duration: reduced ? 0 : .24 }}
            onPointerEnter={event => { if (!paused && event.pointerType !== 'touch') hover?.(); }}
            onClick={() => { setSelectedId(entry.artwork!.id); open?.(entry.artwork!); }}>
            <div className="gallery-card-image">
              <GalleryImage key={entry.artwork.src} src={entry.artwork.src} alt={entry.artwork.alt} />
              <span className="gallery-card-index">{entry.category === 'cg' ? 'STORY CG' : 'SCENERY'} / {String(entry.number).padStart(2, '0')} <i aria-hidden="true">✦</i></span>
            </div>
            <div className="gallery-card-caption"><GalleryManuscript /><div className="gallery-caption-copy">
              <small>{entry.artwork.en}</small><strong>{entry.artwork.title}<span className="gallery-caption-thread" aria-hidden="true">✦</span></strong>
              <p>每一束光，都有抵达的时间。</p></div>
              <span className="gallery-card-view">查看大图 ↗ <i className="gallery-card-star" aria-hidden="true">✦</i></span>
            </div><CardCorners />
          </motion.button> : <PendingArtwork key={entry.id} entry={entry} />)}
        </div>
      </div>
      <nav className="gallery-pages" aria-label="星光画廊页码">
        <svg className="gallery-page-thread" viewBox="0 0 440 24" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12H440" /><path d="m25 9 3 3-3 3-3-3Z m390 0 3 3-3 3-3-3Z" /></svg>
        <button type="button" className="gallery-page-arrow" aria-label="上一页画廊" disabled={paused || current === 0} onClick={() => changePage(current - 1)}><svg viewBox="0 0 12 20" aria-hidden="true"><path d="M9 3 3 10 9 17" /></svg></button>
        {pages.map((index, position) => <Fragment key={index}>
          {position > 0 && index > pages[position - 1] + 1 && <span aria-hidden="true">…</span>}
          <button type="button" aria-label={`第 ${index + 1} 页画廊`} aria-current={current === index ? 'page' : undefined}
            disabled={paused} onClick={() => changePage(index)}>{String(index + 1).padStart(2, '0')}</button>
        </Fragment>)}
        <button type="button" className="gallery-page-arrow" aria-label="下一页画廊" disabled={paused || current === pageCount - 1} onClick={() => changePage(current + 1)}><svg viewBox="0 0 12 20" aria-hidden="true"><path d="m3 3 6 7-6 7" /></svg></button>
        <span className="gallery-page-status" role="status">第 {current + 1} / {pageCount} 页</span>
      </nav>
    </section>
    {selected?.artwork && <ArtworkViewer key={selected.artwork.id} artwork={selected.artwork} number={selected.number} reduced={reduced} close={closeViewer} />}
  </>;
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
