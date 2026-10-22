import { useRef, useState } from 'react';
import type { InternalSystemChoiceInvocationPayload } from '@avg-studio/sdk';
import Frame, { useVisualPreferences } from './Frame';
import Causal from './Causal';
export default function ChoiceScreen({close,choices,onSelect}:{close:()=>void}&InternalSystemChoiceInvocationPayload){
  const {reduced}=useVisualPreferences();
  const guard=useRef(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const select=async(index:number)=>{
    const choice=choices[index];if(guard.current||!choice?.enabled)return;
    guard.current=true;setBusy(true);setError('');
    try{await onSelect(choice.originalIndex);close();}
    catch(error){setError(error instanceof Error?error.message:'选择未完成，请重试。');setBusy(false);guard.current=false;}
  };
  return <Frame scene="causal"><div onMouseDown={event=>event.stopPropagation()}>
    {choices.length===2?<Causal reduced={reduced} choices={choices} choose={()=>{}} sound={()=>{}} busy={busy} confirm={index=>void select(index)}/>
      :<section className="hoshikuzu-choice" aria-label="因果选择"><p>下一封信，寄往哪里？</p>{choices.map((choice,index)=><button key={choice.originalIndex} disabled={!choice.enabled||busy} onClick={()=>void select(index)}>✦ {choice.text}</button>)}</section>}
    {error&&<p className="hoshikuzu-status" role="status">{error}</p>}
  </div></Frame>;
}
