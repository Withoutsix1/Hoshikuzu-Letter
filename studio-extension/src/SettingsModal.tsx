import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { SettingsStar } from './SettingsPanel';
export default function SettingsModal({close,reduced,children}:{close:()=>void;reduced:boolean;children:ReactNode}){
  const panel=useRef<HTMLElement>(null),[closing,setClosing]=useState(false);
  const dismiss=useCallback(()=>{if(reduced)close();else setClosing(true);},[close,reduced]);
  const dismissRef=useRef(dismiss);dismissRef.current=dismiss;
  useEffect(()=>{
    const old=document.activeElement as HTMLElement|null;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissRef.current();}
      if(event.key!=='Tab')return;
      const controls=Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, summary, [tabindex="0"]')??[])
        .filter(node=>{
          const collapsed=node.closest('details:not([open])');
          return node.getClientRects().length>0&&(!collapsed||node===collapsed.querySelector(':scope > summary'));
        });
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',onKey,true);
    return ()=>{document.removeEventListener('keydown',onKey,true);if(old?.isConnected)old.focus();};
  },[]);
  return <motion.div className="modal-backdrop settings-backdrop" data-reduced={reduced} initial={{opacity:0}}
    animate={{opacity:closing?0:1}} transition={{duration:reduced?0:.3}} onClick={dismiss}>
    <motion.section ref={panel} className="modal-panel settings-modal" role="dialog" aria-modal="true" aria-label="体验设置"
      initial={{opacity:0,y:18}} animate={{opacity:closing?0:1,y:closing?12:0}} transition={{duration:reduced?0:.3}}
      onAnimationComplete={()=>{if(closing)close();}} onClick={event=>event.stopPropagation()} inert={closing}>
      <div className="settings-modal-heading"><button className="settings-back" aria-label="返回，关闭体验设置" onClick={dismiss}>
        <SettingsStar/><span>← 返回</span><small>BACK</small>
      </button></div>
      {children}
    </motion.section>
  </motion.div>;
}
