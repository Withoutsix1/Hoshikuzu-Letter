import { useCallback, useEffect, useState } from 'react';
import { useExtensionContext, type ArchiveSlot } from '@avg-studio/sdk';
import Frame, { Panel, useVisualPreferences } from './Frame';
import ArchiveFrame from './ArchiveFrame';
import MemoryCard from './MemoryCard';
import { archivePageCount, archiveSlotsPerPage, type Snapshot } from './model';
import { useResource } from './resources';
import { cacheReadingSnapshot,hasReadingSnapshot } from './readingSnapshot';
import { runStoryTransition } from './storyTransition';
import { loadStoryArchive } from './loadStoryArchive';
export function slotSnapshot(slot: ArchiveSlot | undefined): Snapshot | null {
  if (!slot) return null;
  const params = slot.userParams as { chapterLabel?: string } | null;
  return { line: 0, branch: null, savedAt: new Date(slot.modifiedTime).toISOString(),
    excerpt: slot.currentDialogueText || '此刻已被收藏。', thumbnail: slot.snapshotDataUri,
    speaker: slot.currentSpeaker, chapterLabel: params?.chapterLabel || slot.currentSpeaker || '星屑记录' };
}
export default function SaveScreen({ close, mode: initialMode = 'load', source = 'game' }: {
  close: () => void; mode?: 'save' | 'load'; source?: 'title' | 'game';
}) {
  const ctx=useExtensionContext();
  const [ready,setReady]=useState(()=>source==='title'||hasReadingSnapshot(ctx));
  useEffect(()=>{if(!ready)void cacheReadingSnapshot(ctx).finally(()=>setReady(true));},[ctx,ready]);
  if(!ready)return null;
  return <Frame scene="memory"><SaveContent close={close} initialMode={initialMode} source={source}/></Frame>;
}
function SaveContent({ close, initialMode, source }: { close: () => void; initialMode: 'save'|'load'; source: string }) {
  const ctx = useExtensionContext();
  const { reduced } = useVisualPreferences();
  const slots = ctx.archive.useSlots();
  const [mode,setMode] = useState(initialMode);
  const [page,setPage] = useState(0);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [overwrite,setOverwrite] = useState<number|null>(null);
  const saveEnabled = source !== 'title' && ctx.dialogue.line() !== null;
  const effectiveMode = mode === 'save' && saveEnabled ? 'save' : 'load';
  useEffect(()=>{
    const listener=(event:KeyboardEvent)=>{ if(event.key==='Escape'){event.stopPropagation(); if(overwrite!==null)setOverwrite(null); else if(!busy)close();} };
    document.addEventListener('keydown',listener,true);
    return ()=>document.removeEventListener('keydown',listener,true);
  },[close,busy,overwrite]);
  const operate = useCallback(async(id:number,confirmed=false)=>{
    if(busy)return;
    const exists=slots.some(slot=>slot.id===id);
    if(effectiveMode==='save'&&exists&&!confirmed){setOverwrite(id);return;}
    setBusy(true); setMessage('');
    try{
      if(effectiveMode==='save'){
        const saved=await ctx.archive.save(id,{confirmOverwrite: !confirmed,userParams:{chapterLabel:ctx.dialogue.line()?.speakerName || '星屑信'}});
        if(saved)setMessage('已将此刻收藏为星屑记录。');
      }else{
        if(!exists)return;
        await runStoryTransition(()=>loadStoryArchive(ctx,id,close),reduced);
      }
    }catch(error){setMessage(error instanceof Error?error.message:'存读档未完成，请重试。');}
    finally{setBusy(false);setOverwrite(null);}
  },[busy,slots,effectiveMode,ctx,close]);
  return <>
    <div inert={busy || overwrite !== null}>
      <ArchiveFrame mode={effectiveMode} saveEnabled={saveEnabled} changeMode={setMode} reduced={reduced} paused={busy} page={page} changePage={p=>setPage(Math.max(0,Math.min(archivePageCount-1,p)))}/>
      <div className="memory-scene"><div className="memory-grid" aria-label={`第 ${page+1} 页存档`}>
        {Array.from({length:archiveSlotsPerPage},(_,offset)=>{
          const index=page*archiveSlotsPerPage+offset;
          return <MemoryCard key={index} snapshot={slotSnapshot(slots.find(slot=>slot.id===index+1))} index={index} mode={effectiveMode}
            background="milky-way" readingMode="normal" reduced={reduced} hover={()=>{}} activate={()=>void operate(index+1)}/>;
        })}
      </div></div>
      <button className="hoshikuzu-close" onClick={close}>返回 <span>↗</span></button>
    </div>
    {message&&<p className="hoshikuzu-status" role="status">{message}</p>}
    {overwrite!==null&&<Panel title="覆盖这封记忆？" close={()=>setOverwrite(null)}>
      <p>第 {String(overwrite).padStart(2,'0')} 封记忆已有内容。覆盖后将保存当前剧情进度。</p>
      <div className="hoshikuzu-confirm-actions"><button onClick={()=>setOverwrite(null)}>保留原记录</button><button disabled={busy} onClick={()=>void operate(overwrite,true)}>确认覆盖</button></div>
    </Panel>}
  </>;
}
