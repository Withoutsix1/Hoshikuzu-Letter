import { useEffect, useRef } from 'react';
import { useVisualPreferences } from './Frame';
import { runStoryTransition } from './storyTransition';
export default function TransitionScreen({ close, onReady }: { close: () => void; onReady?: () => void | Promise<void> }) {
  const called = useRef(false);
  const { reduced } = useVisualPreferences();
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    void runStoryTransition(() => onReady?.(), reduced)
      .catch(error => console.error('星屑信转场未完成', error)).finally(close);
  }, [close, onReady, reduced]);
  return null;
}
