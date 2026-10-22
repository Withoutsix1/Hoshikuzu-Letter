import { useEffect, useRef } from 'react';

// :focus-visible alone also matches the host's automatic first-button focus.
export function useKeyboardNavigation(clearFocus: () => void) {
  const keyboard = useRef(false);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (['Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) keyboard.current=true; };
    const pointer = () => { keyboard.current=false;clearFocus(); };
    document.addEventListener('keydown',key,true);
    document.addEventListener('pointerdown',pointer,true);
    return () => { document.removeEventListener('keydown',key,true);document.removeEventListener('pointerdown',pointer,true); };
  }, [clearFocus]);
  return keyboard;
}
