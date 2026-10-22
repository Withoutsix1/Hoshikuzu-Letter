import type { ExtensionContext } from '@avg-studio/sdk';

const completedSessions=new WeakSet<object>();
function session(ctx:ExtensionContext){
  const app=(ctx.getHost() as {application?:object&{getConfig?:()=>{gameId?:string}}}).application;
  return {identity:app??ctx,key:`hoshikuzu.ui.returnToTitle:${app?.getConfig?.().gameId??location.pathname}`};
}
export function openingCompleted(ctx:ExtensionContext):boolean {
  const {identity,key}=session(ctx);
  // Player 的“返回主界面”会重载页面；一次性标记仅用于这次内部返回。
  try{
    const returning=sessionStorage.getItem(key)==='1';sessionStorage.removeItem(key);
    if(returning)completedSessions.add(identity);
  }catch{/* 某些嵌入环境禁用 storage 时，仍保留引擎实例内的记录。 */}
  return completedSessions.has(identity);
}
export function completeOpening(ctx:ExtensionContext):void {completedSessions.add(session(ctx).identity);}
export function returnToTitle(ctx:ExtensionContext):void {
  const {identity,key}=session(ctx);completedSessions.add(identity);
  try{sessionStorage.setItem(key,'1');}catch{/* Preview 可直接沿用引擎实例记录。 */}
  ctx.flow.restart();
}
