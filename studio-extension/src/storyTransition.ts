import { startTransitionTiming as timing } from './useStartTransition';

let current: Promise<void> | null = null;

/** The mask must survive archive.load(), which destroys the engine's UI instances. */
export function runStoryTransition(commit: () => void | Promise<void>, reduced: boolean): Promise<void> {
  if (current) return current;
  current = perform(commit, reduced).finally(() => { current = null; });
  return current;
}

async function perform(commit: () => void | Promise<void>, reduced: boolean) {
  const view = document.getElementById('game-view');
  if (!view) throw new Error('尚未找到游戏画面，请稍后重试。');
  const mask = document.createElement('div');
  mask.className = 'hoshikuzu-story-transition';
  mask.dataset.phase = 'darkening';
  mask.setAttribute('aria-hidden', 'true');
  Object.assign(mask.style, { position:'fixed', background:'#000', opacity:'0', zIndex:'2147483647', pointerEvents:'auto', touchAction:'none' });
  const place = () => {
    const box = view.getBoundingClientRect();
    Object.assign(mask.style, { left:`${box.left}px`, top:`${box.top}px`, width:`${box.width}px`, height:`${box.height}px` });
  };
  place();
  document.body.append(mask);
  const observer = new ResizeObserver(place);
  observer.observe(view);
  window.addEventListener('resize', place);
  const blockKey = (event: KeyboardEvent) => { event.preventDefault(); event.stopImmediatePropagation(); };
  window.addEventListener('keydown', blockKey, true);
  window.addEventListener('keyup', blockKey, true);
  const animations: Animation[] = [];
  const previousFilter = view.style.getPropertyValue('filter');
  const previousPriority = view.style.getPropertyPriority('filter');
  const animate = (element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = element.animate(frames, { easing:'cubic-bezier(.42,0,.58,1)', fill:'both', ...options });
    animations.push(animation);
    return animation.finished;
  };
  let failure: unknown;
  try {
    await animate(mask, [{opacity:0}, {opacity:1}], {duration:timing.darken*1000});
    mask.style.opacity = '1';
    // Blur the incoming scene separately: opacity=0 must not remove its blur.
    view.style.setProperty('filter', reduced ? 'blur(0px)' : 'blur(12px)');
    try { await commit(); } catch (error) { failure = error; }
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    mask.dataset.phase = 'revealing';
    await Promise.all([
      animate(mask, [{opacity:1}, {opacity:0}], {duration:timing.brighten*1000}),
      animate(view, [{filter:reduced?'blur(0px)':'blur(12px)'}, {filter:'blur(0px)'}], {delay:timing.focusDelay*1000, duration:timing.focus*1000}),
    ]);
    if (failure) throw failure;
  } finally {
    animations.forEach(animation => animation.cancel());
    if (previousFilter) view.style.setProperty('filter', previousFilter, previousPriority);
    else view.style.removeProperty('filter');
    observer.disconnect();
    window.removeEventListener('resize', place);
    window.removeEventListener('keydown', blockKey, true);
    window.removeEventListener('keyup', blockKey, true);
    mask.remove();
  }
}
