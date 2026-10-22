import { useLayoutEffect } from 'react';
import { useExtensionContext } from '@avg-studio/sdk';

// 引擎隐藏对白时会卸载工具栏。此样式不能跟随 Frame 的内联样式一起消失。
const nativeReadingCss=`
.hoshikuzu-native-reading-replaced .layer-container.dialogue .dialogue-box,
.hoshikuzu-native-reading-replaced .layer-container.dialogue .dialogue-box-bg,
.hoshikuzu-native-reading-replaced .layer-container.dialogue .dialog-bg,
.hoshikuzu-native-reading-replaced .layer-container.dialogue .name-card,
.hoshikuzu-native-reading-replaced .layer-container.dialogue .name-card-bg,
.hoshikuzu-native-reading-replaced .layer-container.dialogue .name-bg,
.hoshikuzu-native-reading-replaced .layer-container.dialogue .text {
  opacity:0!important;visibility:hidden!important;pointer-events:none!important;
}
.hoshikuzu-native-reading-replaced .wait-for-icon,
.hoshikuzu-native-reading-replaced .dialogue-wait-cursor {display:none!important;pointer-events:none!important;}
`;

export function useNativeReadingReplacement():void {
  const ctx=useExtensionContext();
  useLayoutEffect(()=>{
    const app=(ctx.getHost() as {application?:{getRootContainerElement?:()=>HTMLElement;getSubSystem?:(id:number)=>unknown}}).application;
    const root=app?.getRootContainerElement?.();
    if(!root)return;
    const document=root.ownerDocument;
    if(!document.getElementById('hoshikuzu-native-reading-style')){
      const style=document.createElement('style');
      style.id='hoshikuzu-native-reading-style';
      style.textContent=nativeReadingCss;
      document.head.append(style);
    }
    root.classList.add('hoshikuzu-native-reading-replaced');
    return()=>{
      const dialogue=app?.getSubSystem?.(8) as {isDialogueHidden?:()=>boolean}|undefined;
      // 隐藏后的卸载仍保留屏蔽，恢复时先挂载同一阅读界面再显示。
      if(!dialogue?.isDialogueHidden?.())root.classList.remove('hoshikuzu-native-reading-replaced');
    };
  },[ctx]);
}
