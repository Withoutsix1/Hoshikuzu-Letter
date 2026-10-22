import { useCallback, useState } from 'react';
import { useExtensionContext, INTERNAL_SYSTEM_SLOT as Slot } from '@avg-studio/sdk';
import Frame, { useVisualPreferences, useFrameMotion } from './Frame';
import TitleIdentity from './TitleIdentity';
import TitleMenu from './TitleMenu';
import Letter from './Letter';
import { key, persist, storyPhase } from './state';
import { useAppearance } from './appearance';
import { runStoryTransition } from './storyTransition';
import { loadStoryArchive } from './loadStoryArchive';
import { openingCompleted, completeOpening } from './openingSession';
export default function TitleScreen({ close }: { close: () => void }) {
  const ctx=useExtensionContext();
  const [sessionComplete,setSessionComplete]=useState(()=>openingCompleted(ctx));
  const [seenOpening]=ctx.variables.useValue(key('hasSeenOpeningLetter'));
  const [openingEnabled]=ctx.settings.useValue<boolean>('title.openingLetter');
  const [repeatOpening]=ctx.settings.useValue<boolean>('title.repeatOpeningLetter');
  const [beta]=ctx.variables.useValue(key('isBetaTester'));
  const [seenBeta]=ctx.variables.useValue(key('hasSeenBetaLetter'));
  const opening=(openingEnabled!==false && (seenOpening!==true||(repeatOpening===true&&!sessionComplete)))||(beta===true && seenBeta!==true);
  const finishOpening=()=>{
    completeOpening(ctx);setSessionComplete(true);
    ctx.variables.set(key('hasSeenBetaLetter'),true);ctx.variables.set(key('hasSeenOpeningLetter'),true);void persist(ctx);
  };
  return <Frame scene={opening?'letter':'title'}><TitleContent close={close} opening={opening} finishOpening={finishOpening}/></Frame>;
}
function TitleContent({ close, opening, finishOpening }: { close: () => void; opening: boolean; finishOpening:()=>void }) {
  const ctx = useExtensionContext();
  const { quality, reduced } = useVisualPreferences();
  const appearance = useAppearance();
  const [phase] = ctx.variables.useValue(key('storyPhase'));
  const [unlocked] = ctx.variables.useValue(key('betaTitleUnlocked'));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const {x,y,envelopeX,envelopeY,glowX,glowY,paused}=useFrameMotion();
  const run = useCallback(async (action: () => void | Promise<void>) => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : '操作未完成，请重试。'); }
    finally { setBusy(false); }
  }, [busy]);
  async function start() {
    await runStoryTransition(close,reduced);
  }
  async function resume() {
    const slots = await ctx.archive.list();
    const latest = slots.sort((a,b)=>b.modifiedTime-a.modifiedTime)[0];
    if (!latest) { setMessage('还没有存档。点击 START 开始阅读。'); return; }
    await runStoryTransition(()=>loadStoryArchive(ctx,latest.id,close),reduced);
  }
  const modal = (slot: string, props?: unknown) => run(() => ctx.system.invoke(slot, props, { modal: true }));
  if (opening) return <Letter x={envelopeX} y={envelopeY} glowX={glowX} glowY={glowY}
    reduced={reduced} paused={paused} unlocked={unlocked === true} sound={()=>{}}
    reward={()=>{ ctx.variables.set(key('betaTitleUnlocked'), true); void persist(ctx); }}
    finish={finishOpening}/ >;
  return <div className="title-scene" aria-busy={busy}>
    <TitleIdentity x={glowX} y={glowY} disabled={reduced || busy || paused} quality={quality} unlocked={unlocked === true} imageTitle={appearance.title === 'image'}/>
    <div inert={busy}>
      <TitleMenu reduced={reduced} paused={busy||paused} phase={storyPhase(phase)} hover={()=>{}}
        start={()=>void run(start)} resume={()=>void run(resume)}
        load={()=>void modal(Slot.Load, { mode: 'load', source: 'title' })}
        settings={()=>void modal(Slot.Settings)} gallery={()=>void modal(Slot.Gallery)}
        close={()=>void run(async()=>{ await persist(ctx); ctx.game.exit(); })}/>
    </div>
    {message && <p className="hoshikuzu-status" role="status">{message}</p>}
    <span className="title-version">星屑信 · 星尘落幕时</span>
  </div>;
}
