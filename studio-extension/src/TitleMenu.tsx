import { useCallback, useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import StarMenuButton from "./StarMenuButton";
import StoryStars from "./StoryStars";
import AnimatedThread from "./AnimatedThread";
import { menuNodes, menuThreads, storyStars } from "./titleConstellation";
import type { StoryPhase } from "./model";
import MiniConstellations from "./MiniConstellations";
import { ThreadInteraction, useBendingThread } from "./ThreadInteraction";

type Props = {
  reduced: boolean;
  paused: boolean;
  phase: StoryPhase;
  hover: () => void;
  start: () => void;
  load: () => void;
  settings: () => void;
  gallery: () => void;
  resume: () => void;
  close: () => void;
};

export default function TitleMenu({
  reduced,
  paused,
  phase,
  hover,
  start,
  load,
  settings,
  gallery,
  resume,
  close,
}: Props) {
  const actions = [start, load, settings, gallery];
  const [activated, setActivated] = useState(false);
  const [reached, setReached] = useState<Record<string, boolean>>({});
  const reachStar = useCallback((starId: string) => {
    setReached((old) => (old[starId] ? old : { ...old, [starId]: true }));
  }, []);
  const chainProgress = useMotionValue(0);
  const lightChain = useCallback(() => {
    setActivated(true);
    reachStar("START");
  }, [reachStar]);
  useEffect(() => {
    // A previewed branch must earn its arrival again after being removed.
    const visible = new Set([
      ...menuNodes.map((node) => node.label),
      ...storyStars
        .filter((star) => star.layer <= phase)
        .map((star) => star.starId),
    ]);
    setReached((old) =>
      Object.keys(old).every((id) => visible.has(id))
        ? old
        : Object.fromEntries(
            Object.entries(old).filter(([id]) => visible.has(id)),
          ),
    );
  }, [phase]);
  useEffect(() => {
    if (!activated) return;
    const playback = animate(chainProgress, 3, {
      duration: reduced ? 0 : 4.8,
      ease: "linear",
    });
    return () => playback.stop();
  }, [activated, chainProgress, reduced]);
  return (
    <ThreadInteraction disabled={reduced || paused}>
      <StoryStars
        phase={phase}
        activated={activated}
        reduced={reduced}
        onReached={reachStar}
      />
      <MiniConstellations
        phase={phase}
        activated={activated}
        reached={reached}
        reduced={reduced}
      />
      <svg
        className="title-constellation-lines"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-chain-activated={activated}
      >
        {menuThreads.map((thread, index) => (
          <MenuThread
            key={index}
            {...thread}
            index={index}
            progress={chainProgress}
            onReached={reachStar}
            completed={!!reached[menuNodes[index + 1].label]}
          />
        ))}
        <TitleOrbit />
        <circle className="title-orbit-dot" cx="493" cy="392" r="2.3" />
      </svg>
      <div className="title-constellation" aria-label="星图主菜单">
        {menuNodes.map((node, index) => (
          <div
            className={`constellation-node node-${node.label.toLowerCase()}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            key={node.label}
          >
            <StarMenuButton
              {...node}
              reduced={reduced}
              paused={paused}
              onHover={hover}
              onClick={actions[index]}
              onCharged={index === 0 ? lightChain : undefined}
            />
          </div>
        ))}
      </div>
      <div className="title-secondary-actions">
        <button onClick={resume}>
          继续阅读 <span>CONTINUE</span>
        </button>
        <i />
        <button onClick={close}>
          退出游戏 <span>CLOSE</span>
        </button>
      </div>
    </ThreadInteraction>
  );
}

function TitleOrbit() {
  const curve = useBendingThread(
    "M478 99.6 C442 143 517 234 630 292 C692 324 618 384 493 392 C410 397 351 357 321 298",
  );
  return <motion.path className="title-orbit-thread" d={curve} />;
}

function MenuThread({
  path,
  dot,
  index,
  progress,
  onReached,
  completed,
}: {
  path: string;
  dot: number[];
  index: number;
  progress: MotionValue<number>;
  onReached: (starId: string) => void;
  completed: boolean;
}) {
  const drawn = useTransform(progress, (value) =>
    Math.max(0, Math.min(1, value - index)),
  );
  const dotOpacity = useTransform(drawn, [0, 0.4, 0.65, 1], [0, 0, 0.85, 1]);
  useMotionValueEvent(drawn, "change", (value) => {
    if (value >= 1) onReached(menuNodes[index + 1].label);
  });
  return (
    <g data-segment={index} data-complete={completed}>
      <path className="title-thread-idle" d={path} />
      <AnimatedThread className="title-thread-lit" path={path} drawn={drawn} />
      <motion.circle
        className="title-thread-dot"
        cx={dot[0]}
        cy={dot[1]}
        r="1.8"
        style={{ opacity: dotOpacity }}
      />
    </g>
  );
}
