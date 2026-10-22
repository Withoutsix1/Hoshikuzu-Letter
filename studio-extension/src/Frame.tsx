import { createContext, useContext, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useExtensionContext } from '@avg-studio/sdk';
import { ResourceProvider } from './resources';
import { key } from './state';
import { Stardust } from './Particles';
import Meteors from './Meteors';
import type { Quality } from './model';
import css from './theme.css?inline';
import integrationCss from './integration.css?inline';
import { backgrounds } from './visualAssets';
import { useAppearance } from './appearance';
import { useFrameCovered } from './frameActivity';
import { useNativeRenderActivity } from './nativeRenderActivity';
const VisualMotionContext=createContext<{x:MotionValue<number>;y:MotionValue<number>;envelopeX:MotionValue<number>;envelopeY:MotionValue<number>;glowX:MotionValue<number>;glowY:MotionValue<number>;paused:boolean}|null>(null);
export function useFrameMotion(){const value=useContext(VisualMotionContext);if(!value)throw new Error('Frame motion unavailable');return value;}
export function useVisualPreferences() {
  const ctx = useExtensionContext();
  const [raw] = ctx.variables.useValue(key('quality'));
  const [reducedRaw] = ctx.variables.useValue(key('reducedMotion'));
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReduced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const quality: Quality = raw === 'medium' || raw === 'low' || raw === 'off' ? raw : 'high';
  return { quality, systemReduced, reduced: reducedRaw === true || systemReduced || quality === 'off' };
}
export default function Frame({ scene = 'title', children, transparent = false }: {
  scene?: string; children: ReactNode; transparent?: boolean;
}) {
  const ctx = useExtensionContext();
  const { quality, reduced } = useVisualPreferences();
  const appearance = useAppearance();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0, scale: 1 });
  const {covered,paused} = useFrameCovered(root, transparent);
  useNativeRenderActivity(root,transparent&&!['settings','history'].includes(scene));
  const video = useRef<HTMLVideoElement>(null);
  useLayoutEffect(() => {
    if (!root) return;
    const measure = () => {
      const box = root.getBoundingClientRect();
      if (box.width > 0) setViewport(previous => {
        const next = { width: box.width, height: box.height, scale: root.clientWidth / box.width };
        return previous.width === next.width && previous.height === next.height && previous.scale === next.scale ? previous : next;
      });
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(root);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [root]);
  useEffect(() => { if (paused) video.current?.pause(); else void video.current?.play().catch(()=>{}); }, [paused]);
  const url = useCallback((path: string) => ctx.extensionResource.url(path), [ctx]);
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const spring = { stiffness:65, damping:24, mass:0.7 };
  const px = useSpring(pointerX, spring), py = useSpring(pointerY, spring);
  const x = useTransform(px, [-1, 1], [-10, 10]), y = useTransform(py, [-1, 1], [-10, 10]);
  const envelopeX = useTransform(px, [-1, 1], [-5, 5]), envelopeY = useTransform(py, [-1, 1], [-5, 5]);
  const glowX = useTransform(px, [-1, 1], [-8, 8]), glowY = useTransform(py, [-1, 1], [-8, 8]);
  return <div ref={setRoot} data-covered={covered} data-paused={paused} className={`hoshikuzu-ui ${transparent ? 'hoshikuzu-transparent' : ''}`}>
    <style>{css}{integrationCss}</style>
    <ResourceProvider value={{ url, portal: stage }}>
      <div ref={setStage} className={`stage scene-${scene}`} style={viewport.width ? { width:viewport.width, height:viewport.height, transform:`scale(${viewport.scale})`, transformOrigin:'top left' } : undefined}
      onPointerMove={event => {
        if (paused || reduced || quality==='low' || quality==='off' || event.pointerType === 'touch') return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - box.left) / box.width * 2 - 1);
        pointerY.set((event.clientY - box.top) / box.height * 2 - 1);
      }} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
        {!transparent && <div className="stage-visuals">
          {scene!=='letter' && <motion.img className="title-background-image" src={url(scene === 'memory' ? 'assets/archive-valley.png' : backgrounds[appearance.background].src.replace(/^\.\//, ''))} data-background={scene === 'memory' ? 'archive-valley' : appearance.background} style={{ x:glowX, y:glowY, scale: 1.06 }} alt="" draggable={false}/>}
          <div className="stage-sky"/><div className="stage-grain"/>
          {!reduced && quality !== 'off' && <>
            {(quality === 'high' || quality === 'medium') && <video ref={video} className="ambient-video" src={url('assets/fx_stardust_loop.webm')} muted loop autoPlay playsInline aria-hidden="true"/>}
            <motion.div className="stardust-parallax" style={{x,y}}>
              <Stardust quality={quality} reduced={reduced} paused={paused} letter={scene === 'letter'}/>
            </motion.div>
            <div className="meteor-window" aria-hidden="true"><motion.div className="meteor-parallax" style={{x,y}}><Meteors quality={quality} reduced={reduced}/></motion.div></div>
          </>}
        </div>}
        <VisualMotionContext.Provider value={{x,y,envelopeX,envelopeY,glowX,glowY,paused}}><div className="scene-content">{children}</div></VisualMotionContext.Provider>
      </div>
    </ResourceProvider>
  </div>;
}
export function Panel({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,a[href],[tabindex="0"]') ?? []);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); if (old?.isConnected) old.focus(); };
  }, [close]);
  return <div className="modal-backdrop" onClick={close}>
    <section ref={panel} className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}>
      <div className="modal-heading"><div><small>HOSHIKUZU / 星屑信</small><h2>{title}</h2></div><button className="modal-close" aria-label="关闭面板" onClick={close}>×</button></div>
      {children}
    </section>
  </div>;
}
