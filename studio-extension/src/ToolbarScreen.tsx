import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useExtensionContext, INTERNAL_SYSTEM_SLOT as Slot } from '@avg-studio/sdk';
import Frame, { useVisualPreferences, useFrameMotion } from './Frame';
import ReadingPage from './ReadingPage';
import { useEngineReading } from './useEngineReading';
import { key } from './state';
import { cacheReadingSnapshot } from './readingSnapshot';
import { returnToTitle } from './openingSession';
import { useNativeReadingReplacement } from './nativeReadingReplacement';
export default function ToolbarScreen(){
  useNativeReadingReplacement();
  return <Frame transparent scene="dialogue"><ReadingContent/></Frame>;
}
function ReadingContent(){
  const ctx=useExtensionContext();
  const auto=ctx.dialogue.useAutoMode(),skip=ctx.dialogue.useSkipMode();
  const {line,reading,bridge,index}=useEngineReading();
  const [textSpeed]=ctx.config.useValue('textSpeed');
  const [autoTextSpeed]=ctx.config.useValue('autoModeTextSpeed');
  const {reduced}=useVisualPreferences();
  const [mode]=ctx.variables.useValue(key('readingMode'));
  const [place]=ctx.variables.useValue(key('readingPlace'));
  const [caption]=ctx.variables.useValue(key('readingCaption'));
  const [burst,setBurst]=useState(0);
  const [hiding,setHiding]=useState(false);
  const hidePending=useRef(false);
  const {paused}=useFrameMotion();
  useLayoutEffect(()=>{
    if(autoTextSpeed!==textSpeed)void ctx.config.set('autoModeTextSpeed',textSpeed);
  },[ctx,textSpeed,autoTextSpeed]);
  useLayoutEffect(()=>{
    if(!auto||!line)return;
    const entry=ctx.history.entries().at(-1);
    if(entry?.text!==line.text)return;
    const followsVoice=!!entry.voiceUri||!!bridge?.isVoicePlaying();
    // Native AUTO waits for voice and typing; only its extra pause changes.
    bridge?.setAutoAdvanceDelay(followsVoice?800:2000);
  },[ctx,auto,index,line?.text,bridge?.controller,paused]);
  useEffect(()=>{
    if(!line){hidePending.current=false;setHiding(false);}
  },[line]);
  useEffect(()=>{
    let opening=false;
    return ctx.input.onAction('hoshikuzu.ui.open-history',()=>{
      if(opening||hidePending.current||!ctx.dialogue.line())return;
      opening=true;
      ctx.dialogue.setAutoMode(false);
      ctx.dialogue.setSkipMode(false);
      void ctx.system.invoke(Slot.History,undefined,{modal:true}).finally(()=>{opening=false;});
    });
  },[ctx]);
  if(!line)return null;
  const hide=()=>{
    if(paused||hidePending.current)return;
    hidePending.current=true;
    ctx.dialogue.setAutoMode(false);
    ctx.dialogue.setSkipMode(false);
    setHiding(true);
  };
  const open=(slot:string,props?:unknown)=>{void ctx.system.invoke(slot,props,{modal:true});};
  const log=()=>{
    ctx.dialogue.setAutoMode(false);
    ctx.dialogue.setSkipMode(false);
    open(Slot.History);
  };
  const save=async()=>{
    ctx.dialogue.setAutoMode(false);
    ctx.dialogue.setSkipMode(false);
    // Electron 截图必须在存档面板出现之前完成。
    await cacheReadingSnapshot(ctx);
    await ctx.system.invoke(Slot.Save,{mode:'save',source:'game'},{modal:true});
  };
  return <div className="hoshikuzu-reading" data-reading-renderer="original" data-hiding={hiding}
    onMouseDown={event=>{event.stopPropagation();if(hiding)event.preventDefault();}}
    onContextMenu={event=>{event.preventDefault();event.stopPropagation();}}
    onKeyDownCapture={event=>{if(hiding){event.stopPropagation();event.preventDefault();}}}
    onKeyUpCapture={event=>{if(hiding){event.stopPropagation();event.preventDefault();}}}>
    <ReadingPage mode={mode==='special'?'special':'normal'} reduced={reduced} paused={paused}
      place={typeof place==='string'?place:''} caption={typeof caption==='string'?caption:''}
      index={index} page={{speaker:line.speakerName||'',text:reading.text}} revealed={reading.revealed}
      auto={auto} skip={skip} burst={burst} last={false}
      advance={()=>{setBurst(value=>value+1);bridge?.advance();}}
      toggleAuto={()=>ctx.dialogue.setAutoMode(!auto)} toggleSkip={()=>ctx.dialogue.setSkipMode(!skip)}
      log={log} save={()=>void save()} settings={()=>open(Slot.Settings)}
      back={()=>returnToTitle(ctx)} hide={hide} hiding={hiding}
      onHidden={()=>{if(hidePending.current)ctx.dialogue.hideBox();}}/>
  </div>;
}
