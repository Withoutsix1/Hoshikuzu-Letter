import type { ExtensionContext } from '@avg-studio/sdk';

// 本机 Studio 1.11.0 / Player 1.9.9 的 host 入口。
// SDK 未暴露逐字进度；将版本相关字段集中在这一处，并在使用前检查形状。
interface DialogueController {
  textElement: HTMLElement;
  nameCardElement: HTMLElement;
  nameCardBgElement: HTMLElement;
  boxContainerElement: HTMLElement;
  boxContainerBgElement: HTMLElement;
  typewriter?: { currentGlyphIndex: number; phase: string };
  emitter: {on(event:string,options:{callback:()=>void}):void;off(event:string,name:undefined,callback:()=>void):void};
}
interface Scripting {
  getCurrentCursorIndex(): number;
  getNearestDialogueNodeBeforeIndex(index:number): {index:number};
  seekTo(index:number): boolean;
  scriptingEventEmitter?: {emit(event:'autoModeInterval',value:number):void};
}
interface Application { getSubSystem(id:number): unknown; isPreview(): boolean; }
export function engineBridge(ctx:ExtensionContext) {
  const host=ctx.getHost() as {application?:Application};
  const app=host?.application;
  if(!app?.getSubSystem)return null;
  const system=app.getSubSystem(8) as {controller?:()=>DialogueController};
  const controller=system?.controller?.();
  if(!controller?.emitter||!controller.textElement)return null;
  const input=app.getSubSystem(11) as {getCurrentChannel?:()=>string;getActiveKeysForAction?:(id:string)=>string[]};
  const scripting=app.getSubSystem(9) as Scripting;
  const sound=app.getSubSystem(12) as {isTypeOfSoundPlaying(type:string):boolean};
  return {
    controller,
    isVoicePlaying(){return sound.isTypeOfSoundPlaying('VOCAL');},
    setAutoAdvanceDelay(milliseconds:number){
      scripting.scriptingEventEmitter?.emit('autoModeInterval',milliseconds);
    },
    advance(){
      if(input.getCurrentChannel?.()!=='dialogue')return;
      const layer=controller.textElement.closest('.layer-container.dialogue');
      if(!layer)return;
      const keys=input.getActiveKeysForAction?.('internal.input.advance')??['mousedown'];
      if(keys.includes('mousedown'))layer.dispatchEvent(new MouseEvent('mousedown',{button:0,bubbles:true}));
      else {
        const key=keys.find(value=>!['wheeldown','wheelup','contextmenu','middleclick'].includes(value));
        if(key)layer.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));
      }
    },
    previous(){const previous=scripting.getNearestDialogueNodeBeforeIndex(scripting.getCurrentCursorIndex()-1);return previous.index>=0&&scripting.seekTo(previous.index);},
    canPrevious(){return app.isPreview()&&scripting.getNearestDialogueNodeBeforeIndex(scripting.getCurrentCursorIndex()-1).index>=0;},
  };
}

// 原生 stopSound 在发起淡出后即返回；此事件只在音轨实际停止后发出。
// 等待实际播放状态，快进也不能越过尚未完成的淡出。
export function waitForBgmStop(ctx:ExtensionContext):Promise<void> {
  const host=ctx.getHost() as {application?:Application};
  const sound=host.application?.getSubSystem(12) as {
    isTypeOfSoundPlaying(type:string):boolean;
    emitter:DialogueController['emitter'];
  } | undefined;
  if(!sound?.emitter||!sound.isTypeOfSoundPlaying)throw new Error('当前引擎无法等待 BGM 停止');
  const signal=ctx.flow.signal;
  return new Promise((resolve,reject)=>{
    const cleanup=()=>{
      sound.emitter.off('sound-track-play-stop',undefined,check);
      signal.removeEventListener('abort',cancel);
    };
    const cancel=()=>{cleanup();reject(new DOMException('剧情运行已取消','AbortError'));};
    const check=()=>{if(!sound.isTypeOfSoundPlaying('BGM')){cleanup();resolve();}};
    sound.emitter.on('sound-track-play-stop',{callback:check});
    signal.addEventListener('abort',cancel,{once:true});
    if(signal.aborted)cancel();else check();
  });
}
