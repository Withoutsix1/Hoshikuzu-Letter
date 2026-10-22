import { toPng } from 'html-to-image';
import type { ExtensionContext } from '@avg-studio/sdk';

interface RenderLayer {pixiApp?:{stage:unknown;renderer:{view:HTMLCanvasElement;render(stage:unknown):void}}}
interface SnapshotHost { application?: {getSubSystem(id:number):unknown;getRenderLayer?(id:string):RenderLayer} }
function archiveHost(ctx:ExtensionContext) {
  const host=ctx.getHost() as SnapshotHost;
  return host?.application?.getSubSystem(19) as {cachedGameSnapshot?:string|null;getAllArchives?:()=>Promise<unknown>}|undefined;
}
export function hasReadingSnapshot(ctx:ExtensionContext){return !!archiveHost(ctx)?.cachedGameSnapshot;}
export async function cacheReadingSnapshot(ctx:ExtensionContext) {
  const node=document.querySelector<HTMLElement>('[data-reading-renderer="original"]')?.closest('.stage') as HTMLElement|null;
  const archive=archiveHost(ctx);
  if(node&&archive?.getAllArchives&&document.querySelector('[data-reading-renderer="original"]')){
    try{
      const width=node.clientWidth,height=node.clientHeight;
      const canvas=document.createElement('canvas');canvas.width=720;canvas.height=Math.round(720*height/width);
      const context=canvas.getContext('2d')!;
      context.fillStyle='#081329';context.fillRect(0,0,canvas.width,canvas.height);
      // WebGL 默认在帧结束后清空缓冲。立即渲染并拷贝实际引擎画布，保留场景、立绘和效果。
      const app=(ctx.getHost() as SnapshotHost).application;
      const view=document.querySelector<HTMLElement>('#game-view')!;
      const box=view.getBoundingClientRect();
      for(const name of ['Scene','NormalCharacter','OverlayCharacter','Widgets','Curtain','UI']){
        const pixi=app?.getRenderLayer?.(name)?.pixiApp;if(!pixi?.renderer?.view)continue;
        const renderer=pixi.renderer,source=renderer.view;if(!source.isConnected)continue;
        renderer.render(pixi.stage);
        const rect=source.getBoundingClientRect();
        context.drawImage(source,(rect.left-box.left)*720/box.width,(rect.top-box.top)*canvas.height/box.height,rect.width*720/box.width,rect.height*canvas.height/box.height);
      }
      const attributes:{element:Element;name:string;value:string|null}[]=[];
      node.querySelectorAll('svg path,svg circle,svg ellipse,svg line,svg polygon,svg polyline,svg rect,svg text,svg g').forEach(element=>{
        const style=getComputedStyle(element);
        for(const name of ['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity','fill-opacity','stroke-opacity','filter']){
          attributes.push({element,name,value:element.getAttribute(name)});element.setAttribute(name,style.getPropertyValue(name));
        }
      });
      let overlay:string;
      try{overlay=await toPng(node,{pixelRatio:1,canvasWidth:720,canvasHeight:Math.round(720*height/width),skipFonts:true,
        filter:element=>element.tagName!=='VIDEO',style:{position:'relative',inset:'auto',left:'0',top:'0',margin:'0',transform:'none',width:width+'px',height:height+'px'}});}
      finally{for(const {element,name,value} of attributes){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);}}
      const draw=async(source:string)=>{const image=new Image();image.src=source;await image.decode();context.drawImage(image,0,0,canvas.width,canvas.height);};
      await draw(overlay);
      archive.cachedGameSnapshot=canvas.toDataURL('image/jpeg',.78);
      return;
    }catch(error){console.warn('星屑信截图改用引擎截图',error);}
  }
  await ctx.archive.cacheGameSnapshot();
}
