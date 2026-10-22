import { useId, type CSSProperties } from "react";
import { motion } from "motion/react";
import { STAR_FLARE_PATH } from "./starVisuals";

// Decorative stars and menu stars share the same rings, rays and silhouette.
export function StarShapeDefinition({ id }: { id: string }) {
  return (
    <g id={id}>
      <circle cx="48" cy="48" r="22" fill="none" strokeWidth="0.8" />
      <circle
        cx="48"
        cy="48"
        r="20"
        fill="none"
        strokeWidth="0.45"
        strokeDasharray="1.2 1.35"
      />
      <path d="M25 25 71 71 M25 71 71 25" fill="none" strokeWidth="0.8" />
      <path d={STAR_FLARE_PATH} stroke="none" />
      <circle cx="48" cy="48" r="2" stroke="none" />
    </g>
  );
}

export function ConstantStar({
  starId,
  color,
  white,
  x,
  y,
  layer,
  delay,
  reduced,
}: {
  starId: string;
  color: string;
  white: boolean;
  x: number;
  y: number;
  layer: number;
  delay: number;
  reduced: boolean;
}) {
  const id = `story-star-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <motion.span
      className="story-star"
      data-star={starId}
      data-layer={layer}
      data-glow={color}
      style={
        {
          left: `${x}%`,
          top: `${y}%`,
          "--star-glow": color,
          "--star-delay": `${delay}s`,
        } as CSSProperties
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.85 }}
    >
      <span className="story-star-breath">
        <span className="story-star-halo" />
        <svg viewBox="0 0 96 96" className="story-star-svg">
          <defs>
            <StarShapeDefinition id={`${id}-shape`} />
            <radialGradient id={`${id}-core`}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.3" stopColor={white ? "#fffdf7" : color} />
              <stop offset="1" stopColor={white ? "#f4f7ff" : color} />
            </radialGradient>
          </defs>
          <use
            href={`#${id}-shape`}
            fill={`url(#${id}-core)`}
            stroke={`url(#${id}-core)`}
          />
          <circle
            cx="48"
            cy="48"
            r="31"
            fill="none"
            stroke={white ? "#ffffffb3" : color}
            strokeWidth="0.8"
          />
        </svg>
      </span>
    </motion.span>
  );
}
