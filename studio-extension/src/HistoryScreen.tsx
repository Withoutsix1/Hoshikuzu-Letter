import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useExtensionContext } from '@avg-studio/sdk';
import Frame, { useVisualPreferences } from './Frame';
import { useResource } from './resources';

export default function HistoryScreen({close}:{close:()=>void}) {
  return <Frame transparent scene="history"><LetterHistory close={close}/></Frame>;
}

function Star({className=''}:{className?:string}) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={className==='log-heading-flare'?'M12 0 13.1 9.2 15.5 10.5 24 12 15.5 13.5 13.1 14.8 12 24 10.9 14.8 8.5 13.5 0 12 8.5 10.5 10.9 9.2Z':'M12 0c1.7 8.4 3.6 10.3 12 12-8.4 1.7-10.3 3.6-12 12C10.3 15.6 8.4 13.7 0 12 8.4 10.3 10.3 8.4 12 0Z'} fill="currentColor"/></svg>;
}

function LetterHistory({close}:{close:()=>void}) {
  const ctx=useExtensionContext(), {url}=useResource();
  const {reduced}=useVisualPreferences();
  const snapshot=ctx.history.useSnapshot();
  const panel=useRef<HTMLElement>(null), viewport=useRef<HTMLDivElement>(null);
  const content=useRef<HTMLDivElement>(null), track=useRef<HTMLDivElement>(null);
  const followLatest=useRef(true);
  const drag=useRef<{y:number;scroll:number}|null>(null);
  const [selected,setSelected]=useState(snapshot.entries.length-1);
  const [error,setError]=useState('');
  const [scroll,setScroll]=useState({max:0,offset:0,thumb:1,top:0});

  const measure=useCallback(()=>{
    const element=viewport.current;
    if(!element)return;
    const max=Math.max(0,element.scrollHeight-element.clientHeight);
    const thumb=Math.min(1,Math.max(.08,element.clientHeight/Math.max(1,element.scrollHeight)));
    setScroll({max,offset:element.scrollTop,thumb,top:max?element.scrollTop/max*(1-thumb):0});
  },[]);
  useLayoutEffect(()=>{
    const element=viewport.current;
    if(!element)return;
    const resize=()=>{if(followLatest.current)element.scrollTop=element.scrollHeight;measure();};
    const observer=new ResizeObserver(resize);
    observer.observe(element);
    if(content.current)observer.observe(content.current);
    resize();
    return ()=>observer.disconnect();
  },[measure]);
  useLayoutEffect(()=>{
    if(viewport.current)viewport.current.scrollTop=viewport.current.scrollHeight;
    followLatest.current=true;
    setSelected(snapshot.entries.length-1);
    measure();
  },[snapshot.entries.length,measure]);
  useEffect(()=>{
    const old=document.activeElement as HTMLElement|null;
    panel.current?.querySelector<HTMLElement>('.log-close')?.focus({preventScroll:true});
    const onKey=(event:globalThis.KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
      if(event.key!=='Tab')return;
      const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),[tabindex="0"]')??[]);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',onKey,true);
    return ()=>{document.removeEventListener('keydown',onKey,true);if(old?.isConnected)old.focus({preventScroll:true});};
  },[close]);

  const scrollTo=(offset:number)=>{if(viewport.current)viewport.current.scrollTop=offset;};
  const beginDrag=(event:PointerEvent<HTMLDivElement>)=>{
    if(!viewport.current||!track.current)return;
    event.preventDefault();
    const bounds=track.current.getBoundingClientRect();
    if(!(event.target as HTMLElement).closest('.log-scroll-thumb')){
      scrollTo((event.clientY-bounds.top-bounds.height*scroll.thumb/2)/(bounds.height*(1-scroll.thumb))*scroll.max);
    }
    drag.current={y:event.clientY,scroll:viewport.current.scrollTop};
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({preventScroll:true});
  };
  const moveDrag=(event:PointerEvent<HTMLDivElement>)=>{
    if(!drag.current||!track.current)return;
    const travel=track.current.getBoundingClientRect().height*(1-scroll.thumb);
    if(travel>0)scrollTo(drag.current.scroll+(event.clientY-drag.current.y)/travel*scroll.max);
  };
  const scrollKey=(event:KeyboardEvent<HTMLDivElement>)=>{
    const element=viewport.current;if(!element)return;
    const offsets:Record<string,number>={ArrowUp:-40,ArrowDown:40,PageUp:-element.clientHeight*.9,PageDown:element.clientHeight*.9};
    if(event.key==='Home'){event.preventDefault();scrollTo(0);}
    else if(event.key==='End'){event.preventDefault();scrollTo(scroll.max);}
    else if(event.key in offsets){event.preventDefault();scrollTo(element.scrollTop+offsets[event.key]);}
  };
  const replay=async(uri:string,index:number)=>{
    setSelected(index);setError('');
    try{await ctx.history.replayVoice(uri);}catch{setError('这句对白的语音暂时无法播放。');}
  };

  return <div className="log-backdrop" data-reduced-motion={reduced} onClick={close}>
    <section ref={panel} className="log-sheet" role="dialog" aria-modal="true" aria-label="来信回响" onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)close();}}>
      <img className="log-paper-image" src={url('assets/log-panel-transparent.png')} alt="" decoding="sync" draggable={false}/>
      <div className="log-surface">
        <header className="log-heading">
          <div className="log-heading-copy"><small>HOSHIKUZU / LOG</small><h2>来信回响</h2><p>ECHOES OF LETTERS</p></div>
          <svg className="log-heading-orbit" viewBox="0 0 460 94" aria-hidden="true">
            <path d="M38 40C-4 43-5 80 27 83C52 85 71 70 87 64C128 47 180 80 247 65C327 47 359 18 401 18C427 20 433 36 427 51"/>
            <path className="log-orbit-star" d="m408 22 1.7 5.3 5.6-.2-4.5 3.3 1.9 5.3-4.7-3.2-4.6 3.2 1.8-5.3-4.5-3.3 5.6.2Z"/>
          </svg>
          <div className="log-heading-rule" aria-hidden="true"><Star className="log-heading-flare"/><Star className="log-rule-tip"/></div>
          <button className="log-close" aria-label="关闭面板" onClick={close}><Star className="log-close-star"/><svg className="log-close-cross" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M21 3 3 21"/></svg><span>关闭</span></button>
        </header>
        <div className="log-body">
          <div className="backlog log-backlog" id="hoshikuzu-letter-backlog" ref={viewport} tabIndex={0} aria-label="已读对白，可滚动回看" onScroll={()=>{
            const element=viewport.current;if(element)followLatest.current=element.scrollHeight-element.clientHeight-element.scrollTop<6;
            measure();
          }}>
            <div ref={content} className="log-entries" role="list">
              {snapshot.entries.length===0&&<div className="log-empty"><Star/><p>这里将收藏你已经读过的对白。</p><small>每一封来信，都留有回响。</small></div>}
              {snapshot.entries.map((entry,index)=>{
                const narration=!entry.name||entry.name==='旁白';
                return <article className="history-item log-history-row" role="listitem" data-selected={selected===index} data-narration={narration} data-voiced={!!entry.voiceUri} key={entry.uuid??index} onClick={()=>setSelected(index)}>
                  <div className="log-timeline" aria-hidden="true"><span className="log-timeline-line"/><Star className="log-timeline-star"/><small>{String(index+1).padStart(3,'0')}</small></div>
                  <div className="log-speaker"><span className="log-speaker-lead" aria-hidden="true"><Star/></span><strong>{entry.name||'旁白'}</strong><span className="log-speaker-tail" aria-hidden="true"/></div>
                  <p className="log-entry-text">{entry.text}</p>
                  <div className="log-voice-cell">{entry.voiceUri&&<button className="log-voice" aria-label={`重听第 ${String(index+1).padStart(3,'0')} 句语音`} title="重听语音" onClick={()=>void replay(entry.voiceUri!,index)} onFocus={()=>setSelected(index)}>
                    <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 11h4l5-4v14l-5-4H5Z" fill="currentColor"/><path d="M17 10c2 2.4 2 5.6 0 8m3-11c4.6 4 4.6 10 0 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg><Star className="log-voice-star"/>
                  </button>}</div>
                </article>;
              })}
            </div>
          </div>
          {scroll.max>1&&<div ref={track} className="log-scroll-track" role="scrollbar" tabIndex={0} aria-label="阅读记录滚动条" aria-controls="hoshikuzu-letter-backlog" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={Math.round(scroll.max)} aria-valuenow={Math.round(scroll.offset)} onKeyDown={scrollKey} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
            <span className="log-scroll-thumb" style={{top:`${scroll.top*100}%`,height:`${scroll.thumb*100}%`}}><Star/><Star/></span>
          </div>}
        </div>
        {error&&<p className="log-status" role="status">{error}</p>}
      </div>
    </section>
  </div>;
}
