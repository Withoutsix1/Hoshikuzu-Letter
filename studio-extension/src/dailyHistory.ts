import type { ExtensionContext, HistoryEntry } from '@avg-studio/sdk';
import { dailyHistoryIndex as index } from './projectData';

const blockDays=index.blockDays as Record<string,number>;
const textDays=index.textDays as Record<string,number[]>;
const voiceDays=index.voiceDays as Record<string,number>;
const firstText=index.firstTextByDay as Record<string,string>;
const normalize=(text:string)=>text.replace(/\s+/g,'');

function daysFor(entry:HistoryEntry):number[]|undefined {
  const hash=entry.voiceUri?.match(/\b[0-9a-f]{32}\b/i)?.[0];
  const voiced=hash&&voiceDays[hash.toLowerCase()];
  const text=normalize(entry.text);
  return voiced?[voiced]:text?textDays[text]:undefined;
}

interface Node {getData():{localization?:{blockId?:string}}}
interface Stream {getCurrentCursorIndex():number;getNodes():Node[]}
export function activeHistoryDay(ctx:ExtensionContext,entries:HistoryEntry[]):number|undefined {
  const app=(ctx.getHost() as {application?:{getSubSystem(id:number):unknown}}).application;
  const stream=app?.getSubSystem(9) as Stream|undefined;
  if(stream?.getNodes&&stream.getCurrentCursorIndex){
    const nodes=stream.getNodes();
    for(let i=Math.min(stream.getCurrentCursorIndex(),nodes.length-1);i>=0;i--){
      const id=nodes[i].getData().localization?.blockId;
      if(id&&blockDays[id])return blockDays[id];
    }
  }
  for(let i=entries.length-1;i>=0;i--){const days=daysFor(entries[i]);if(days?.length===1)return days[0];}
}

// History is also the engine's read/choice state. Scope the visible backlog
// without clearing that state or changing save compatibility.
export function entriesForDay(entries:HistoryEntry[],day:number|undefined):HistoryEntry[] {
  if(!day||!entries.length)return [];
  let boundary=-1;
  for(let i=entries.length-1;i>=0;i--){
    const days=daysFor(entries[i]);
    if(days&&!days.includes(day)){boundary=i;break;}
    if(normalize(entries[i].text)===firstText[String(day)]){boundary=i-1;break;}
  }
  // A unique current-day line anchors old saves too; repeated short reactions
  // before this anchor cannot pull the preceding day's ending into the LOG.
  let start=-1;
  for(let i=boundary+1;i<entries.length;i++){
    const days=daysFor(entries[i]);
    if(days?.length===1&&days[0]===day){start=i;break;}
  }
  if(start<0)return [];
  return entries.slice(start).filter(entry=>{if(!normalize(entry.text))return false;const days=daysFor(entry);return !days||days.includes(day);});
}
