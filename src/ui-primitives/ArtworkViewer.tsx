import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import GalleryImage from './GalleryImage.js';
import type { Artwork } from './galleryTypes.js';
import { lockScrolling, tabStops } from './modalLifecycle.js';

export default function ArtworkViewer({ artwork, close, reduced, number = 1 }: {
  artwork: Artwork;
  close: () => void;
  reduced: boolean;
  number?: number;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const requested = useRef(false);
  const notified = useRef(false);
  const closeRef = useRef(close);
  closeRef.current = close;
  const finish = useCallback(() => {
    if (notified.current) return;
    notified.current = true;
    dialog.current?.close();
    closeRef.current();
  }, []);
  const dismiss = useCallback(() => {
    if (requested.current) return;
    requested.current = true;
    if (reduced) finish();
    else setClosing(true);
  }, [finish, reduced]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = element.ownerDocument.activeElement as HTMLElement | null;
    const unlock = lockScrolling(element.ownerDocument);
    try {
      if (!element.open) element.showModal();
      closeButton.current?.focus({ preventScroll: true });
    }
    catch (error) { unlock(); throw error; }
    return () => {
      const wasOpen = element.open;
      if (wasOpen) element.close();
      unlock();
      if (wasOpen && previousFocus?.isConnected && !element.ownerDocument.querySelector('dialog:modal')) previousFocus.focus();
    };
  }, []);

  return (
    <motion.dialog ref={dialog} className="gallery-viewer-backdrop" aria-modal="true"
      aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} data-reduced={reduced} data-closing={closing}
      initial={{ opacity: 0 }} animate={{ opacity: closing ? 0 : 1 }} transition={{ duration: reduced ? 0 : .2 }}
      onCancel={event => { event.preventDefault(); dismiss(); }}
      onClick={event => { if (event.target === event.currentTarget) dismiss(); }}
      onKeyDownCapture={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismiss(); return; }
        if (event.key !== 'Tab') return;
        const element = event.currentTarget;
        const controls = tabStops(element);
        const first = controls[0], last = controls[controls.length - 1];
        const active = element.ownerDocument.activeElement;
        if (!first) { event.preventDefault(); element.focus(); }
        else if (event.shiftKey && (active === first || !element.contains(active))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (active === last || !element.contains(active))) { event.preventDefault(); first.focus(); }
      }}>
      <motion.section className="gallery-viewer" tabIndex={0} aria-label="图片与说明，可滚动查看"
        initial={{ scale: reduced ? 1 : .98 }} animate={{ scale: closing && !reduced ? .99 : 1 }}
        transition={{ duration: reduced ? 0 : .24 }} onClick={event => event.stopPropagation()}
        onAnimationComplete={() => { if (closing) finish(); }}>
        <header className="gallery-viewer-heading">
          <span>GALLERY <i /> {artwork.category === 'cg' ? 'STORY CG' : 'SCENERY'} / {String(number).padStart(2, '0')}</span>
          <button ref={closeButton} type="button" aria-label="关闭大图" onClick={dismiss}>关闭 <span aria-hidden="true">×</span></button>
        </header>
        <GalleryImage key={artwork.src} className="gallery-viewer-image" src={artwork.src} alt={artwork.alt} loading="eager" />
        <footer className="gallery-viewer-caption">
          <div><small>{artwork.en}</small><h2 id={`${id}-title`}>{artwork.title}</h2><p id={`${id}-description`}>{artwork.description}</p></div>
          <span>ESC · 返回画廊</span>
        </footer>
      </motion.section>
    </motion.dialog>
  );
}
