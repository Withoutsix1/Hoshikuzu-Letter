import type {ExtensionContext} from '@avg-studio/sdk';
import { voicePlaybackGains as quieterVoices } from './projectData';

interface Track {type:string;id:string;uri:string;volume:number}
interface SoundSystem {
  players:Record<string,{volume(value:number):void}>;
  tracks:Record<string,Track>;
  resolveHowlerVolume(track:Track,type:string):number;
  emitter:{on(event:string,options:{callback:(track:Track)=>void}):void};
}
const registered=new WeakSet<object>();
// Keep per-line author gain on the native track, so the voice settings slider,
// replay from LOG and restored saves all use the same multiplier.
export function registerVoicePlaybackGain(ctx:ExtensionContext) {
  const app=(ctx.getHost() as {application?:{getSubSystem(id:number):unknown}}).application;
  const sound=app?.getSubSystem(12) as SoundSystem|undefined;
  if(!sound?.emitter||registered.has(sound))return;
  registered.add(sound);
  const apply=(track:Track)=>{
    if(track.type!=='VOCAL')return;
    const uri=String(track.uri||'');
    const gain=quieterVoices.find(x=>uri.includes(x.hash)||uri.includes(x.id));
    track.volume=gain?.multiplier??1;
    sound.players['VOCAL-'+track.id]?.volume(sound.resolveHowlerVolume(track,'VOCAL'));
  };
  sound.emitter.on('sound-track-play-start',{callback:apply});
  Object.values(sound.tracks).forEach(apply);
}
