import { useCallback, useEffect, useState } from "react";
import { animate, useMotionValue } from "motion/react";
import AnimatedThread from "./AnimatedThread";
import { storyThreads, type StoryThread } from "./titleConstellation";
import type { StoryPhase } from "./model";

export default function StoryStarChains({
  phase,
  activated,
  reduced,
  onReached,
}: {
  phase: StoryPhase;
  activated: boolean;
  reduced: boolean;
  onReached: (starId: string) => void;
}) {
  const [finished, setFinished] = useState<Record<string, boolean>>({});
  const finish = useCallback(
    (id: string) => {
      setFinished((old) => (old[id] ? old : { ...old, [id]: true }));
      const edge = storyThreads.find((thread) => thread.id === id);
      if (edge) onReached(edge.to);
    },
    [onReached],
  );
  useEffect(() => {
    const visible = new Set(
      storyThreads.filter((edge) => edge.layer <= phase).map((edge) => edge.id),
    );
    setFinished((old) => {
      const ids = Object.keys(old);
      if (activated && ids.every((id) => visible.has(id))) return old;
      return activated
        ? Object.fromEntries(
            ids.filter((id) => visible.has(id)).map((id) => [id, old[id]]),
          )
        : {};
    });
  }, [phase, activated]);
  return (
    <svg
      className="story-constellation-lines"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-activated={activated}
    >
      {storyThreads
        .filter((edge) => edge.layer <= phase)
        .map((edge) => (
          <StoryChain
            key={edge.id}
            edge={edge}
            reduced={reduced}
            enabled={activated && (!edge.after || !!finished[edge.after])}
            finish={finish}
          />
        ))}
    </svg>
  );
}

function StoryChain({
  edge,
  enabled,
  reduced,
  finish,
}: {
  edge: StoryThread;
  enabled: boolean;
  reduced: boolean;
  finish: (id: string) => void;
}) {
  const drawn = useMotionValue(0);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      drawn.set(0);
      setComplete(false);
      return;
    }
    const playback = animate(drawn, 1, {
      duration: reduced ? 0 : edge.duration,
      ease: [0.22, 0.68, 0.34, 1],
      onComplete: () => {
        if (cancelled) return;
        setComplete(true);
        finish(edge.id);
      },
    });
    return () => {
      cancelled = true;
      playback.stop();
    };
  }, [enabled, reduced, drawn, edge, finish]);
  return (
    <g
      className="story-thread-breath"
      data-edge={edge.id}
      data-complete={complete}
    >
      <AnimatedThread
        className="story-thread-lit"
        path={edge.path}
        drawn={drawn}
      />
    </g>
  );
}
