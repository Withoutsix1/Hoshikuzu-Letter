import { useEffect, type CSSProperties } from "react";
import { animate, useMotionValue } from "motion/react";
import AnimatedThread from "./AnimatedThread";
import { menuNodes, storyStars } from "./titleConstellation";
import { STAR_FLARE_PATH } from "./starVisuals";
import type { StoryPhase } from "./model";

// Deliberate placement keeps satellites clear of menu labels and the title.
const offsets = [
  [
    [-27, -12],
    [-33, 15],
    [-7, -36],
  ],
  [
    [-39, -10],
    [-14, 35],
  ],
  [
    [-33, 4],
    [-12, -33],
    [-18, 33],
  ],
  [
    [-37, -8],
    [-16, 32],
  ],
  [
    [-31, -23],
    [27, 14],
    [-15, 35],
  ],
  [
    [-28, -21],
    [-35, 12],
    [28, 14],
  ],
  [
    [-26, -24],
    [17, -29],
    [33, -11],
  ],
  [
    [-26, -25],
    [24, -18],
  ],
  [
    [-26, 19],
    [19, 25],
    [34, 3],
    [18, -23],
  ],
  [
    [-23, -21],
    [25, -17],
  ],
  [
    [-18, -26],
    [23, -15],
    [28, 17],
  ],
];
const anchors = [
  ...menuNodes.map((node) => ({
    id: node.label,
    x: node.x,
    y: node.y,
    layer: 0,
    color: "#ffe299",
  })),
  ...storyStars.map((star) => ({ ...star, id: star.starId })),
];

export default function MiniConstellations({
  phase,
  activated,
  reached,
  reduced,
}: {
  phase: StoryPhase;
  activated: boolean;
  reached: Record<string, boolean>;
  reduced: boolean;
}) {
  return (
    <svg
      className="mini-constellation-plane"
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-activated={activated}
    >
      {anchors.map(
        (anchor, index) =>
          anchor.layer <= phase && (
            <g
              key={anchor.id}
              data-mini-anchor={anchor.id}
              data-reached={!!reached[anchor.id]}
            >
              {offsets[index].map(([dx, dy], branch) => {
                const x = anchor.x * 10,
                  y = anchor.y * 6;
                const endX = x + dx,
                  endY = y + dy;
                const bend = branch % 2 ? 3.8 : -3.8;
                const length = Math.hypot(dx, dy);
                const nx = (-dy / length) * bend,
                  ny = (dx / length) * bend;
                const path = `M${x} ${y} C${x + dx * 0.32 + nx} ${y + dy * 0.32 + ny} ${x + dx * 0.72 + nx} ${y + dy * 0.72 + ny} ${endX} ${endY}`;
                return (
                  <MiniBranch
                    key={branch}
                    path={path}
                    x={endX}
                    y={endY}
                    color={anchor.color}
                    branch={branch}
                    index={index}
                    activated={!!reached[anchor.id]}
                    reduced={reduced}
                  />
                );
              })}
            </g>
          ),
      )}
    </svg>
  );
}

function MiniBranch({
  path,
  x,
  y,
  color,
  branch,
  index,
  activated,
  reduced,
}: {
  path: string;
  x: number;
  y: number;
  color: string;
  branch: number;
  index: number;
  activated: boolean;
  reduced: boolean;
}) {
  const drawn = useMotionValue(0);
  useEffect(() => {
    if (!activated) {
      drawn.set(0);
      return;
    }
    const animation = animate(drawn, 1, {
      duration: reduced ? 0 : 0.95,
      delay: reduced ? 0 : branch * 0.12,
      ease: [0.22, 0.68, 0.34, 1],
    });
    return () => animation.stop();
  }, [activated, reduced, drawn, branch]);
  const size = 4.8 + ((index + branch) % 3) * 0.8;
  return (
    <g
      className="mini-branch"
      style={
        {
          "--mini-glow": color,
          "--mini-delay": `${-(index * 0.31 + branch * 0.72)}s`,
        } as CSSProperties
      }
    >
      <g className="mini-thread-breath">
        <AnimatedThread path={path} drawn={drawn} className="mini-thread" />
      </g>
      <g transform={`translate(${x} ${y})`}>
        <g className="mini-star-breath">
          <circle className="mini-star-halo" r={size * 1.25} />
          <svg
            className="mini-star"
            x={-size / 2}
            y={-size / 2}
            width={size}
            height={size}
            viewBox="0 0 96 96"
            overflow="visible"
          >
            <path d={STAR_FLARE_PATH} />
          </svg>
          <circle className="mini-star-core" r=".85" />
        </g>
      </g>
    </g>
  );
}
