import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { SettingsStar } from './SettingsPanel.js';
import { lockScrolling, tabStops } from './modalLifecycle.js';

export default function SettingsModal({ close, reduced, children }: {
  close: () => void;
  reduced: boolean;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
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
    } catch (error) {
      unlock();
      throw error;
    }
    return () => {
      const wasOpen = element.open;
      if (wasOpen) element.close();
      unlock();
      if (wasOpen && previousFocus?.isConnected && !element.ownerDocument.querySelector('dialog:modal')) previousFocus.focus();
    };
  }, []);

  return (
    <motion.dialog ref={dialog} className="modal-backdrop settings-backdrop" aria-label="体验设置" aria-modal="true"
      data-reduced={reduced} data-closing={closing} initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }} transition={{ duration: reduced ? 0 : .3 }}
      onKeyDownCapture={event => {
        if (event.key !== 'Tab') return;
        const element = event.currentTarget;
        const controls = tabStops(element);
        const first = controls[0], last = controls[controls.length - 1];
        const active = element.ownerDocument.activeElement;
        if (!first) { event.preventDefault(); element.focus(); }
        else if (event.shiftKey && (active === first || !element.contains(active))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (active === last || !element.contains(active))) {
          event.preventDefault(); first.focus();
        }
      }}
      onCancel={event => { event.preventDefault(); dismiss(); }} onClick={dismiss}>
      <motion.section className="modal-panel settings-modal"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: closing ? 0 : 1, y: closing ? 12 : 0 }}
        transition={{ duration: reduced ? 0 : .3 }} onAnimationComplete={() => { if (closing) finish(); }}
        onClick={event => event.stopPropagation()} inert={closing}>
        <div className="settings-modal-heading">
          <button type="button" className="settings-back" aria-label="返回，关闭体验设置" onClick={dismiss}>
            <SettingsStar /><span>← 返回</span><small>BACK</small>
          </button>
        </div>
        {children}
      </motion.section>
    </motion.dialog>
  );
}
