import { useExtensionContext } from '@avg-studio/sdk';
import { useEffect, useState } from 'react';
import Frame, { useVisualPreferences } from './Frame';
import SettingsPanel, { StarSlider, type ChangePreference } from './SettingsPanel';
import SettingsModal from './SettingsModal';
import { key, persist } from './state';
import { settingPercent } from './settingsValues';
export default function SettingsScreen({close}:{close:()=>void}){
  return <Frame transparent scene="settings"><SettingsContent close={close}/></Frame>;
}
function SettingsContent({close}:{close:()=>void}){
  const ctx=useExtensionContext();
  const {quality,reduced,systemReduced}=useVisualPreferences();
  const [reducedPreference,setReduced]=ctx.variables.useValue(key('reducedMotion'));
  const [,setQuality]=ctx.variables.useValue(key('quality'));
  const [unmuted,setUnmuted]=ctx.variables.useValue(key('unmutedMasterVolume'));
  const [master,setMaster]=ctx.config.useValue('masterVolume');
  const [bgm,setBgm]=ctx.config.useValue('bgmVolume');
  const [se,setSe]=ctx.config.useValue('seVolume');
  const [voice,setVoice]=ctx.config.useValue('voiceVolume');
  const [textSpeed,setTextSpeed]=ctx.config.useValue('textSpeed');
  const [skip,setSkip]=ctx.config.useValue('skipMode');
  const [hostFullscreen]=ctx.game.window.useFullscreen();
  const [fullscreen,setFullscreen]=useState(hostFullscreen);
  const [changingFullscreen,setChangingFullscreen]=useState(false);
  useEffect(()=>{
    let active=true;
    const refresh=()=>{void ctx.game.window.getFullscreen().then(value=>{if(active)setFullscreen(value);});};
    refresh();
    window.addEventListener('resize',refresh);
    document.addEventListener('fullscreenchange',refresh);
    return ()=>{active=false;window.removeEventListener('resize',refresh);document.removeEventListener('fullscreenchange',refresh);};
  },[ctx,hostFullscreen]);
  const toggleFullscreen=async()=>{
    setChangingFullscreen(true);
    try{
      await ctx.game.window.toggleFullscreen();
      setFullscreen(await ctx.game.window.getFullscreen());
    }finally{setChangingFullscreen(false);}
  };
  const change:ChangePreference=(name,value)=>{
    switch(name){
      case 'quality':setQuality(value);void persist(ctx);break;
      case 'reduced':setReduced(value);void persist(ctx);break;
      case 'sound':
        if(value){setMaster(typeof unmuted==='number'&&unmuted>0?settingPercent(unmuted):100);}
        else{if(master>0)setUnmuted(settingPercent(master));setMaster(0);void persist(ctx);}
        break;
      case 'bgm':setBgm(settingPercent(Number(value)));break;
      case 'se':setSe(settingPercent(Number(value)));break;
      case 'textSpeed':{
        const speed=settingPercent(Number(value));
        setTextSpeed(speed);void ctx.config.set('autoModeTextSpeed',speed);break;
      }
    }
  };
  return <SettingsModal close={close} reduced={reduced}>
    <SettingsPanel preferences={{quality,reduced:reducedPreference===true,sound:master>0,bgm:settingPercent(bgm),se:settingPercent(se),textSpeed:settingPercent(textSpeed)}}
      change={change} systemReduced={systemReduced} fullscreenAvailable={ctx.game.window.canFullscreen()&&!changingFullscreen}
      fullscreenActive={fullscreen} fullscreen={()=>void toggleFullscreen()}
      additionalOptions={<details className="settings-additional">
        <summary>更多选项</summary>
        <StarSlider label="总音量" description="调整全部剧情声音" value={settingPercent(master)} onChange={value=>setMaster(settingPercent(value))}/>
        <StarSlider label="语音音量" description="角色对白语音" value={settingPercent(voice)} onChange={value=>setVoice(settingPercent(value))}/>
        <label className="settings-control-row"><span className="settings-label">快进范围<small>默认连续快进，也可选择仅跳过已读剧情。</small></span>
          <select aria-label="快进范围" value={skip} onChange={event=>setSkip(event.target.value==='all'?'all':'read')}><option value="read">已读剧情</option><option value="all">全部剧情</option></select>
        </label>
      </details>}/>
  </SettingsModal>;
}
