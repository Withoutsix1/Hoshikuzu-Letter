import { useCallback } from 'react';
import { useMotionValue } from 'motion/react';
import { useExtensionContext } from '@avg-studio/sdk';
import Frame, { useVisualPreferences } from './Frame';
import Letter from './Letter';
import { key, persist } from './state';
export default function LetterScreen({close}:{close:()=>void}){
  const ctx=useExtensionContext(),{reduced}=useVisualPreferences();
  const [unlocked]=ctx.variables.useValue(key('betaTitleUnlocked'));
  const zero=useMotionValue(0);
  const reward=useCallback(()=>{ctx.variables.set(key('betaTitleUnlocked'),true);void persist(ctx);},[ctx]);
  const finish=useCallback(()=>{ctx.variables.set(key('hasSeenBetaLetter'),true);ctx.variables.set(key('hasSeenOpeningLetter'),true);void persist(ctx);close();},[ctx,close]);
  return <Frame scene="letter"><Letter x={zero} y={zero} glowX={zero} glowY={zero} reduced={reduced} paused={false} unlocked={unlocked===true} reward={reward} finish={finish} sound={()=>{}}/></Frame>;
}
