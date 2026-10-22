import { useLayoutEffect, useSyncExternalStore } from 'react';

const frames = new Map<HTMLElement, boolean>();
const listeners = new Set<() => void>();
let revision = 0;
const notify = () => { revision += 1; listeners.forEach(listener => listener()); };
export function useFrameCovered(root: HTMLElement | null, transparent: boolean) {
  useLayoutEffect(() => {
    if (!root) return;
    frames.set(root, transparent); notify();
    return () => { frames.delete(root); notify(); };
  }, [root, transparent]);
  useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => revision);
  const ordered=[...frames].filter(([element])=>element.isConnected);
  const own=ordered.findIndex(([element])=>element===root);
  return {covered:own>=0&&ordered.some(([,clear],index)=>!clear&&index>own),paused:own>=0&&ordered.some((_,index)=>index>own)};
}
