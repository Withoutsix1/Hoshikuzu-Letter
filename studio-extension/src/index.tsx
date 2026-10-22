import { Extension, extension, method, settings, INTERNAL_SYSTEM_SLOT as Slot, type ExtensionContext, type ExtensionProps } from '@avg-studio/sdk';
import manifest from '../extension.json';
import TitleScreen from './TitleScreen';
import SaveScreen from './SaveScreen';
import SettingsScreen from './SettingsScreen';
import HistoryScreen from './HistoryScreen';
import GalleryScreen from './GalleryScreen';
import ToolbarScreen from './ToolbarScreen';
import TransitionScreen from './TransitionScreen';
import LetterScreen from './LetterScreen';
import { artworkList, key, persist, storyPhase, uiSave } from './state';
import { migrateSkipSettings, migrateVolumeSettings, migrateVoiceSettings } from './settingsValues';
import { waitForBgmStop } from './engineBridge';
import { registerVoicePlaybackGain } from './voicePlaybackGain';
export { manifest };
interface CloseProps extends ExtensionProps {close:()=>void}
export const visualUI = Object.fromEntries(Object.entries(import.meta.glob('../ui/*.json',{eager:true,import:'default'})).map(([path,value])=>[path.replace(/^.*\/([^/]+)\.json$/,'$1'),value]));

@extension({id:'title',label:'星屑信 · 星图标题',supportsSlot:Slot.Title})
export class HoshikuzuTitle extends Extension<CloseProps> {
  static settings=settings(s=>({
    titlePreset:s.enum('标题预设',['text','image'] as const).labels({text:'普通宋体星屑信',image:'鎏金星轨徽章'}).default('text'),
    backgroundPreset:s.enum('背景预设',['observatory','milky-way'] as const).labels({observatory:'天文台星空','milky-way':'星河天台'}).default('observatory'),
    openingLetter:s.boolean('首次启动先显示第一封来信').default(true),
    repeatOpeningLetter:s.boolean('每次启动显示感谢信（演示用）').default(false),
  }));
  render(){return {component:TitleScreen,props:{close:()=>this.close()}};}
}
interface SaveProps extends CloseProps { mode?:'save'|'load'; source?:'title'|'game' }
@extension({id:'archive',label:'星屑信 · 记忆信笺',supportsSlot:[Slot.Save,Slot.Load]})
export class HoshikuzuArchive extends Extension<SaveProps> {
  onClose(){this.context.archive.clearGameSnapshot();}
  render(){return {component:SaveScreen,props:{mode:this.data?.mode,source:this.data?.source,close:()=>this.close()}};}
}
@extension({id:'settings',label:'星屑信 · 设置',supportsSlot:Slot.Settings})
export class HoshikuzuSettings extends Extension<CloseProps> {render(){return {component:SettingsScreen,props:{close:()=>this.close()}};}}
@extension({id:'history',label:'星屑信 · 来信回响',supportsSlot:Slot.History})
export class HoshikuzuHistory extends Extension<CloseProps> {render(){return {component:HistoryScreen,props:{close:()=>this.close()}};}}
@extension({id:'gallery',label:'星屑信 · 星光画廊',supportsSlot:Slot.Gallery})
export class HoshikuzuGallery extends Extension<CloseProps> {render(){return {component:GalleryScreen,props:{close:()=>this.close()}};}}
@extension({id:'toolbar',label:'星屑信 · 阅读工具栏',supportsSlot:Slot.Toolbar})
export class HoshikuzuToolbar extends Extension {render(){return {component:ToolbarScreen,props:{}};}}
interface TransitionProps extends CloseProps {onReady?:()=>void|Promise<void>}
@extension({id:'transition',label:'星屑信 · 明暗转场'})
export class HoshikuzuTransition extends Extension<TransitionProps>{render(){return {component:TransitionScreen,props:{onReady:this.data?.onReady,close:()=>this.close()}};}}

@extension({id:'letter',label:'星屑信 · 内测来信'})
export class HoshikuzuLetter extends Extension<CloseProps>{render(){return {component:LetterScreen,props:{close:()=>this.close()}};}}

@extension({id:'progress',label:'星屑信 · 解锁与身份'})
export class HoshikuzuProgress extends Extension {
  static waitBgmStop=method({id:'wait-bgm-stop',title:'等待 BGM 淡出完成',
    async run(ctx){await waitForBgmStop(ctx);},
    async skip(ctx){await waitForBgmStop(ctx);},
    runImmediately(){}});
  static setReadingMode=method({title:'星屑信：切换信笺样式',schema:{special:{type:'boolean',label:'特殊来信',required:true}},async run(ctx,params){ctx.variables.set(key('readingMode'),params.special?'special':'normal');}});
  static saveSchema=uiSave;
  static settings=settings(s=>({startWithBetaLetter:s.boolean('新玩家默认为内测玩家').default(false)}));
  static onRegister(ctx:ExtensionContext){
    registerVoicePlaybackGain(ctx);
    ctx.input.registerAction({id:'hoshikuzu.ui.open-history',label:'打开阅读记录',defaultKeys:['wheelup']});
    migrateVolumeSettings(ctx);
    void migrateSkipSettings(ctx);
    void migrateVoiceSettings(ctx);
    // 修正旧迁移版的中等默认值；只运行一次，保留轻量、关闭和减少动态设置。
    if(ctx.variables.get(key('originalEffectsInitialized'))!==true){
      if(ctx.variables.get(key('quality'))==='medium')ctx.variables.set(key('quality'),'high');
      ctx.variables.set(key('originalEffectsInitialized'),true);
      void persist(ctx);
    }
    // 只初始化尚无历史记录的玩家；不会将普通玩家自动变成内测玩家。
    if(ctx.variables.get(key('betaIdentityInitialized'))!==true){
      if(ctx.settings.get<boolean>('startWithBetaLetter'))ctx.variables.set(key('isBetaTester'),true);
      ctx.variables.set(key('betaIdentityInitialized'),true);
      void persist(ctx);
    }
  }
  static unlockPhase=method({title:'星屑信：点亮剧情星链',schema:{phase:{type:'number',label:'阶段（0初始／1前置之后／2终章）',required:true}},async run(ctx,params){
    const next=storyPhase(params.phase);
    ctx.variables.set(key('storyPhase'),Math.max(storyPhase(ctx.variables.get(key('storyPhase'))),next));
    await persist(ctx);
  }});
  static setBetaIdentity=method({title:'星屑信：设置内测身份',schema:{enabled:{type:'boolean',label:'内测玩家',required:true}},async run(ctx,params){ctx.variables.set(key('isBetaTester'),params.enabled);ctx.variables.set(key('betaIdentityInitialized'),true);await persist(ctx);}});
  static unlockArtwork=method({title:'星屑信：收录画廊图片',schema:{id:{type:'string',label:'稳定图片编号',required:true},title:{type:'string',label:'图片标题',required:true},source:{type:'string',label:'项目图片 URI 或扩展 assets/ 路径',required:true},isCG:{type:'boolean',label:'剧情 CG',default:false},description:{type:'string',label:'说明',default:''}},async run(ctx,params){
    const previous=artworkList(ctx.variables.get(key('unlockedArtwork')));
    ctx.variables.set(key('unlockedArtwork'),[...previous.filter(item=>item.id!==params.id),{id:params.id,title:params.title,source:params.source,category:params.isCG?'cg':'scenery',description:params.description||''}] as never);
    await persist(ctx);
  }});
}
