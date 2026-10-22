import { useLayoutEffect } from 'react';
import { useExtensionContext } from '@avg-studio/sdk';
interface Layer {isRenderPaused?:boolean;setRenderPaused?(paused:boolean):void}
interface Application {getRenderLayer?(name:string):Layer|undefined}
const holds=new Map<Application,{owners:Set<HTMLElement>;previous:Map<Layer,boolean>}>();
const layers=['Scene','NormalCharacter','OverlayCharacter','Widgets','Curtain','UI'];
export function useNativeRenderActivity(root:HTMLElement|null,transparent:boolean){
 const ctx=useExtensionContext();
 useLayoutEffect(()=>{
  if(!root||transparent)return;
  const app=(ctx.getHost() as {application?:Application})?.application;if(!app?.getRenderLayer)return;
  let hold=holds.get(app);
  if(!hold){
   hold={owners:new Set(),previous:new Map()};holds.set(app,hold);
   for(const name of layers){const layer=app.getRenderLayer(name);if(layer?.setRenderPaused){hold.previous.set(layer,layer.isRenderPaused===true);layer.setRenderPaused(true);}}
  }
  hold.owners.add(root);
  return()=>{
   const current=holds.get(app);if(!current)return;current.owners.delete(root);
   if(current.owners.size===0){for(const [layer,paused] of current.previous)layer.setRenderPaused?.(paused);holds.delete(app);}
  };
 },[ctx,root,transparent]);
}
