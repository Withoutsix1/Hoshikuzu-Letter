import type { ExtensionContext } from '@avg-studio/sdk';
import { key, persist } from './state';

export async function migrateVoiceSettings(ctx:ExtensionContext):Promise<void> {
  if(ctx.variables.get(key('voicePlaybackPolicyVersion'))===2)return;
  // Native voice playback replaces the previous voice only when a new voice
  // starts. Narration and other unvoiced content leave it playing.
  await ctx.config.set('stopVoiceOnNextDialogue',false);
  await ctx.config.set('autoModeTextSpeed',ctx.config.get('textSpeed'));
  ctx.variables.set(key('voicePlaybackPolicyVersion'),2);
  await persist(ctx);
}

export async function migrateSkipSettings(ctx:ExtensionContext):Promise<void> {
  if(ctx.variables.get(key('skipRangeInitialized'))===true)return;
  // 引擎默认仅快进已读内容，会在下一句未读对白停止。首次接入或升级时修正；
  // 之后 CONFIG 中手动选择的范围继续由引擎保存，不在每次启动或点击时覆盖。
  await ctx.config.set('skipMode','all');
  ctx.variables.set(key('skipRangeInitialized'),true);
  await persist(ctx);
}

// Studio 1.11.0 和内置 Player 的 Config API 均使用 0–100；Sound API 才使用 0–1。
export function settingPercent(value:number):number {
  return Number.isFinite(value)?Math.round(Math.max(0,Math.min(100,value))):100;
}
export function migrateVolumeSettings(ctx:ExtensionContext):void {
  if(ctx.variables.get(key('volumePercentInitialized'))===true)return;
  // 旧版扩展误写入了百分之一的音量。只修复明显的小数，保留整数 1% 的设置。
  for(const name of ['masterVolume','bgmVolume','seVolume','voiceVolume'] as const){
    const value=ctx.config.get(name);
    if(value>0&&value<1)ctx.config.set(name,settingPercent(value*100));
  }
  const unmuted=ctx.variables.get(key('unmutedMasterVolume'));
  // 这个扩展自有字段在旧版默认为 1，更新为与引擎一致的百分制。
  if(typeof unmuted==='number'&&unmuted>0&&unmuted<=1)ctx.variables.set(key('unmutedMasterVolume'),settingPercent(unmuted*100));
  ctx.variables.set(key('volumePercentInitialized'),true);
  void persist(ctx);
}
