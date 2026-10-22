import { useLayoutEffect, useState } from 'react';
import { useExtensionContext } from '@avg-studio/sdk';
import { engineBridge } from './engineBridge';

export function useEngineReading() {
  const ctx=useExtensionContext();
  const line=ctx.dialogue.useLine();
  const history=ctx.history.useSnapshot();
  const [reading,setReading]=useState({text:line?.text??'',revealed:0,available:false});
  const bridge=engineBridge(ctx);
  useLayoutEffect(()=>{
    if(!line||!bridge)return;
    // The native wait/auto cursor is a sibling of the hidden dialogue elements.
    // Keep the marker through line changes so a newly mounted cursor cannot flash.
    const layer=bridge.controller.textElement.closest('.layer-container.dialogue');
    layer?.classList.add('hoshikuzu-native-reading-replaced');
    return()=>{layer?.classList.remove('hoshikuzu-native-reading-replaced');};
  },[bridge?.controller,!!line]);
  useLayoutEffect(()=>{
    if(!line||!bridge)return;
    const controller=bridge.controller;
    const native=[controller.nameCardElement,controller.nameCardBgElement,controller.boxContainerElement,controller.boxContainerBgElement,controller.textElement].filter(Boolean);
    native.forEach(element=>element.classList.add('hoshikuzu-native-reading-hidden'));
    let frame=0;
    const sync=()=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        const text=controller.textElement.textContent||line.text;
        const writer=controller.typewriter;
        const glyphs=writer?.phase==='finished'?Array.from(text).length:writer?.currentGlyphIndex??0;
        const revealed=Array.from(text).slice(0,glyphs).join('').length;
        setReading(previous=>previous.text===text&&previous.revealed===revealed&&previous.available?previous:{text,revealed,available:true});
      });
    };
    const observer=new MutationObserver(sync);
    observer.observe(controller.textElement,{subtree:true,childList:true,characterData:true,attributes:true});
    controller.emitter.on('status',{callback:sync});sync();
    return ()=>{
      observer.disconnect();cancelAnimationFrame(frame);controller.emitter.off('status',undefined,sync);
      native.forEach(element=>element.classList.remove('hoshikuzu-native-reading-hidden'));
    };
  },[ctx,line?.text,line?.speakerName]);
  return {line,reading,bridge,index:Math.max(0,history.entries.length-1)};
}
