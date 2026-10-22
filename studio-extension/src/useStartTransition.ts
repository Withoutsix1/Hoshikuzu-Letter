import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  useMotionTemplate,
  useMotionValue,
  type AnimationPlaybackControlsWithThen,
} from "motion/react";

export const startTransitionTiming = {
  darken: 2,
  brighten: 1,
  focusDelay: 0.5,
  focus: 1,
} as const;

// START and archive loading share this sequence. Commit only under an opaque mask.
export default function useStartTransition(
  enterDialogue: () => void,
  reduced: boolean,
) {
  const [phase, setPhase] = useState<"idle" | "darkening" | "revealing">(
    "idle",
  );
  const opacity = useMotionValue(0);
  const blur = useMotionValue(0);
  const revealClock = useMotionValue(0);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const busy = useRef(false);
  const runId = useRef(0);
  const playbacks = useRef<AnimationPlaybackControlsWithThen[]>([]);

  const cancel = useCallback(() => {
    runId.current += 1;
    playbacks.current.forEach((playback) => playback.stop());
    playbacks.current = [];
    busy.current = false;
    opacity.set(0);
    blur.set(0);
    revealClock.set(0);
    setPhase("idle");
  }, [opacity, blur, revealClock]);

  useEffect(
    () => () => {
      runId.current += 1;
      playbacks.current.forEach((playback) => playback.stop());
    },
    [],
  );

  const start = useCallback(
    (commit = enterDialogue, finish?: () => void) => {
      if (busy.current) return false;
      busy.current = true;
      const id = ++runId.current;
      opacity.set(0);
      blur.set(0);
      revealClock.set(0);
      setPhase("darkening");
      const blackout = animate(opacity, 1, {
        duration: startTransitionTiming.darken,
        ease: "easeInOut",
        onComplete: () => {
          if (runId.current !== id) return;
          // Keep the exact opaque completion value while React mounts the reading scene.
          opacity.set(1);
          blur.set(reduced ? 0 : 12);
          commit();
          setPhase("revealing");
          const brighten = animate(opacity, 0, {
            duration: startTransitionTiming.brighten,
            ease: "easeInOut",
          });
          const focus = animate(blur, 0, {
            delay: startTransitionTiming.focusDelay,
            duration: startTransitionTiming.focus,
            ease: "easeInOut",
          });
          // A zero-to-zero blur can finish instantly. This clock preserves the full
          // fade and interaction lock even when the user has disabled blur.
          const complete = animate(revealClock, 1, {
            duration: Math.max(
              startTransitionTiming.brighten,
              startTransitionTiming.focusDelay + startTransitionTiming.focus,
            ),
            ease: "linear",
            onComplete: () => {
              if (runId.current !== id) return;
              opacity.set(0);
              blur.set(0);
              playbacks.current = [];
              busy.current = false;
              setPhase("idle");
              finish?.();
            },
          });
          playbacks.current = [brighten, focus, complete];
        },
      });
      playbacks.current = [blackout];
      return true;
    },
    [opacity, blur, revealClock, enterDialogue, reduced],
  );

  return { phase, active: phase !== "idle", opacity, filter, start, cancel };
}
