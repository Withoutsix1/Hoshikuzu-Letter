import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useExtensionContext,INTERNAL_SYSTEM_SLOT as Slot,type ExtensionContext} from '@avg-studio/sdk';
import Frame,{useFrameMotion} from './Frame';
import {key} from './state';
import phoneCss from './storyPhone.css?inline';
import {phoneSystemNotices} from './projectData';

export interface PhoneMessage {id:string;thread:string;speaker:string;outgoing:boolean;kind:'text'|'image'|'voice'|'file'|'system';text:string;asset?:string;voiceId?:string;duration?:number;fileName?:string;fileSize?:string;day:number;minute:number;sequence:string;order:number}
interface PhoneState {messages:PhoneMessage[];thread:string;title:string;count:number;sequence:string;day:number;minute:number}
interface Sound {tracks:Record<string,{id:string;uri:string;type:string}>;players:Record<string,{playing():boolean}>;loadTrack(t:{id:string;uri:string;type:string}):void;play(type:string,id:string):void;stop(type:string,id:string):void;emitter:{on(e:string,o:{callback:(t:{type:string;id:string})=>void}):void}}
const registered=new WeakSet<object>();
const names:Record<string,string>={akihito:'月白秋一',hina:'比叡雏',saeki:'佐伯',kanade:'雪丸奏',ruri:'神崎学姐',shizuya:'椿静夜'};
const avatarFiles:Record<string,string>={'月白秋一':'akihito','秋一':'akihito','比叡雏':'hina','佐伯':'saeki','雪丸奏':'kanade','神崎琉璃':'ruri','神崎学姐':'ruri','椿静夜':'shizuya','椿学姐':'shizuya'};
export const plainChat=(s:string)=>s.replace(/\*\*(.*?)\*\*/gs,'$1').replace(/`([^`]+)`/g,'$1').replace(/^【(?:消息|秒回|回复)】/,'');
function sound(ctx:ExtensionContext){return (ctx.getHost() as {application:{getSubSystem(n:number):unknown}}).application?.getSubSystem(12) as Sound|undefined}
function state(ctx:ExtensionContext):PhoneState {try{return JSON.parse(String(ctx.variables.get(key('storyPhoneState'))||'{}'))}catch{return {} as PhoneState}}
export function registerVoiceExclusivity(ctx:ExtensionContext){
 const s=sound(ctx);if(!s?.emitter||registered.has(s))return;registered.add(s);
 s.emitter.on('sound-track-play-start',{callback:t=>{if(t.type==='VOCAL')for(const track of Object.values(s.tracks))if(track.type==='VOCAL'&&track.id!==t.id)s.stop('VOCAL',track.id)}});
}
export function finishPhoneStep(ctx:ExtensionContext){void ctx.ui.hide('hoshikuzu.ui/story-phone')}
export function hideStoryPhone(ctx:ExtensionContext){void ctx.ui.hide('hoshikuzu.ui/story-phone')}
export function appendPhoneMessage(ctx:ExtensionContext,p:Record<string,unknown>,show=true):Promise<void>|void {
 const old=state(ctx),day=Number(p.storyDay)||1,minute=Number(p.storyMinute)||0,order=Number(p.storyOrder)||day*100000+minute;
 const thread=String(p.groupId||p.friend||'hina'),sequence=String(p.sequenceId||'');
 let text=plainChat(String(p.message||'')),kind=String(p.contentType||'text') as PhoneMessage['kind'];
 if(p.voiceId){kind='voice';text=text.replace(/^语音\s*·\s*/,'')}
 if(/^文件\s*·/.test(text)){kind='file';text=text.replace(/^文件\s*·\s*/,'')}
 const message:PhoneMessage={id:sequence,sequence,thread,speaker:String(p.speakerName||names[String(p.presetId)]||'系统'),outgoing:p.direction==='outgoing',kind,text,asset:String(p.imageAsset||p.fileAsset||p.voiceAsset||''),voiceId:String(p.voiceId||''),duration:Number(p.duration)||undefined,fileName:String(p.fileName||text),fileSize:String(p.fileSize||''),day,minute,order};
 const messages=Array.isArray(old.messages)?old.messages.filter(m=>m.id!==sequence&&(m.order??0)<=order):[];
 const notice=(id:string,text:string,offset:number)=>{if(!messages.some(m=>m.id===id))messages.push({...message,id,kind:'system',speaker:'系统',text,asset:'',voiceId:'',order:order-offset,minute:Math.max(0,minute-1)})};
 for(const n of phoneSystemNotices)if(thread===n.thread&&day>=n.fromDay)notice(n.id,n.text,n.orderOffset);
 messages.push(message);
 messages.sort((a,b)=>a.order-b.order);
 const next:PhoneState={messages,thread,sequence,day,minute,title:String(p.threadTitle||(p.groupId==='d01_class_2b'?'二年B班':p.groupId?'超自然民俗探索同好会':'比叡雏')),count:Number(p.memberCount)||0};
 ctx.variables.set(key('storyPhoneState'),JSON.stringify(next));
 if(!show){hideStoryPhone(ctx);return;}
 registerVoiceExclusivity(ctx);
 return ctx.ui.show('hoshikuzu.ui/story-phone',{}, {modal:true});
}
function resource(ctx:ExtensionContext,path:string){if(!path)return '';try{return path.startsWith('assets/phone/')?ctx.extensionResource.url(path):ctx.asset.resolve(path).url}catch{return path}}
const clock=(minute:number)=>`${String(Math.floor(minute/60)%24).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
const weekday=(day:number)=>['周日','周一','周二','周三','周四','周五','周六'][day%7];
export default function StoryPhone({close}:{close:()=>void}){
 return <Frame scene="phone" transparent><style>{phoneCss}</style><Phone close={close}/></Frame>;
}
function Phone({close}:{close:()=>void}){
 const ctx=useExtensionContext(),[raw]=ctx.variables.useValue(key('storyPhoneState'));
 const {paused}=useFrameMotion();
 let data:PhoneState;try{data=JSON.parse(String(raw||'{}'))}catch{data={} as PhoneState}
 const messages=(data.messages||[]).filter(m=>m.thread===data.thread),log=useRef<HTMLDivElement>(null);
 const [view,setView]=useState<PhoneMessage|null>(null),[playing,setPlaying]=useState('');
 useLayoutEffect(()=>{
  const node=log.current,follow=()=>node?.scrollTo({top:node.scrollHeight});follow();setView(null);
  const raf=requestAnimationFrame(follow),timer=setTimeout(follow,80),pictures=[...(node?.querySelectorAll('img')||[])];pictures.forEach(p=>p.addEventListener('load',follow));
  return()=>{cancelAnimationFrame(raf);clearTimeout(timer);pictures.forEach(p=>p.removeEventListener('load',follow))};
 },[data.sequence]);
 useEffect(()=>{const timer=setInterval(()=>{const s=sound(ctx);setPlaying(Object.values(s?.tracks||{}).find(t=>t.type==='VOCAL'&&s?.players['VOCAL-'+t.id]?.playing())?.id||'')},120);return()=>clearInterval(timer)},[ctx]);
 const openLog=()=>void ctx.system.invoke(Slot.History,undefined,{modal:true});
 const next=()=>finishPhoneStep(ctx);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(paused)return;if(e.key===' '||e.key==='Enter'){e.preventDefault();next()}if(e.key==='Escape'){setView(null)}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)},[ctx,data.sequence,paused]);
 const play=(m:PhoneMessage)=>{
  const s=sound(ctx);if(!s||!m.voiceId)return;
  if(s.players['VOCAL-'+m.voiceId]?.playing()){s.stop('VOCAL',m.voiceId);setPlaying('');return}
  if(!s.tracks['VOCAL-'+m.voiceId])s.loadTrack({id:m.voiceId,uri:m.asset||'',type:'VOCAL'});
  s.play('VOCAL',m.voiceId);setPlaying(m.voiceId);
 };
 const leave=()=>close();
 return <div className="story-phone-stage" onMouseDown={e=>e.stopPropagation()}>
  <div className="story-phone-controls"><button onClick={openLog}>LOG</button></div>
  <section className="story-phone-shell" aria-label="LIME聊天界面">
   <div className="story-phone-status"><time>{clock(data.minute||0)}</time><i/><span>▮▮▮　◔　▰</span></div>
   <header className="story-phone-header"><button onClick={leave} aria-label="收起手机">‹</button><strong>{data.title}{data.count?` (${data.count})`:''}</strong><span>•••</span></header>
   <div className="story-phone-log" ref={log}>
    {messages.map((m,i)=>{
     const previous=messages[i-1],stamp=!previous||previous.day!==m.day||m.minute-previous.minute>=2;
     return <div key={m.id} data-message-id={m.id}>
      {stamp&&<div className="phone-time-divider">{weekday(m.day)} {clock(m.minute)}</div>}
      {m.kind==='system'?<p className="phone-system-message">{m.text}</p>:<div className={`phone-message ${m.outgoing?'outgoing':''}`}>
       <div className="phone-avatar">{avatarFiles[m.speaker]?<img src={resource(ctx,`assets/phone/avatar_${avatarFiles[m.speaker]}.png`)} alt={`${m.speaker}头像`}/>:m.speaker.replace('月白','').slice(0,1)}</div>
       <div className="phone-message-column">{!m.outgoing&&<small>{m.speaker}</small>}
        {m.kind==='voice'?<><button className={`phone-bubble voice-bubble ${playing===m.voiceId?'playing':''}`} onClick={()=>play(m)} style={{minWidth:Math.min(280,110+(m.duration||5)*5)}} aria-label={`播放${m.speaker}的语音`}><span className="voice-waves"><svg viewBox="0 0 26 24" width="23" height="24" aria-hidden="true"><path d="M5 10a3 3 0 0 1 0 4M9 7a7 7 0 0 1 0 10M13 4a11 11 0 0 1 0 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><b>{Math.max(1,Math.round(m.duration||1))}″</b></button><div className="voice-transcript">{m.text}</div></>:
         m.kind==='image'?<button className="phone-bubble photo-bubble" onClick={()=>setView(m)}><img src={resource(ctx,m.asset||'')} alt={m.text||'聊天图片'}/></button>:
         m.kind==='file'?<button className="phone-bubble file-bubble" onClick={()=>{if(m.asset)setView(m)}} aria-disabled={!m.asset}><span><b>{m.fileName}</b><small>{m.fileSize||'文件'}</small></span><i>{(m.fileName||'').split('.').pop()?.toUpperCase()||'文件'}</i></button>:
         <p className="phone-bubble">{m.text}</p>}
        {m.outgoing&&<small className="phone-read">已读</small>}
       </div>
      </div>}
     </div>
    })}
   </div>
   <footer className="story-phone-compose"><span>◉</span><div/><span>☺</span><button onClick={next} className="phone-continue">继续</button></footer>
  </section>
  {view&&<div className="phone-media-view" role="dialog" aria-label={view.kind==='file'?'文件预览':'照片预览'}><button onClick={()=>setView(null)}>关闭</button>{view.kind==='file'?<iframe title={view.fileName} src={resource(ctx,view.asset||'')}/>:<img alt={view.text||'照片'} src={resource(ctx,view.asset||'')}/>}</div>}
 </div>;
}
