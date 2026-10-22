import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { irregularStar, starRandom } from "./starVisuals";
import { StarShapeDefinition } from "./StarGlyph";
import { useKeyboardNavigation } from './keyboardNavigation';

type Props = {
  number: string;
  label: string;
  subtitle: string;
  reduced: boolean;
  paused: boolean;
  onHover: () => void;
  onClick: () => void;
  onCharged?: () => void;
};

// One interruptible progress value drives all four parts of the hover response.
// The supplied PNGs are visual references only; the star is drawn with SVG.
export default function StarMenuButton({
  number,
  label,
  subtitle,
  reduced,
  paused,
  onHover,
  onClick,
  onCharged,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const clearFocus=useCallback(()=>setFocused(false),[]);
  const keyboard=useKeyboardNavigation(clearFocus);
  const active = !paused && (hovered || focused);
  const [charged, setCharged] = useState(false);
  const [bursts, setBursts] = useState<number[]>([]);
  const sequence = useRef(0);
  const button = useRef<HTMLButtonElement>(null);
  const pointer = useRef<{x:number;y:number}|null>(null);
  const chargeCallback = useRef(onCharged);
  chargeCallback.current = onCharged;
  const progress = useMotionValue(0);
  const id = `menu-star-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const remember = (event:PointerEvent) => {
      if(event.pointerType!=='touch')pointer.current={x:event.clientX,y:event.clientY};
    };
    document.addEventListener('pointermove',remember,{capture:true,passive:true});
    return()=>document.removeEventListener('pointermove',remember,true);
  }, []);

  useEffect(() => {
    if(paused)return;
    // 浮窗移除及 inert 解锁完成后再做命中判断；鼠标不动也能开始新一轮充能。
    const frame=requestAnimationFrame(()=>{
      const point=pointer.current;
      const target=point?document.elementFromPoint(point.x,point.y):null;
      setHovered(!!target&&!!button.current?.contains(target));
    });
    return()=>cancelAnimationFrame(frame);
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    setCharged(false);
    if (paused) {
      setHovered(false);
      setFocused(false);
      setBursts([]);
      progress.jump(0);
      return;
    }
    const playback = animate(progress, active ? 1 : 0, {
      duration: reduced ? 0 : active ? 0.46 : 0.34,
      ease: [0.22, 0.68, 0.34, 1],
      onComplete: () => {
        if (cancelled || !active) return;
        setCharged(true);
        chargeCallback.current?.();
        if (!reduced) {
          const next = ++sequence.current;
          setBursts((current) => [...current, next]);
        }
      },
    });
    // stop() keeps the current value, so quick enter/leave never snaps to a keyframe.
    return () => {
      cancelled = true;
      playback.stop();
    };
  }, [active, reduced, paused, progress]);

  useEffect(() => {
    if (reduced) setBursts([]);
  }, [reduced]);

  const lift = useTransform(progress, (value) => (reduced ? 0 : -value));
  const edge = useTransform(progress, [0, 1], [-20, 120]);
  const solid = useTransform(edge, (value) => value - 20);
  const wipe = useMotionTemplate`linear-gradient(90deg, #000 ${solid}%, transparent ${edge}%)`;
  const lineOpacity = useTransform(progress, [0, 1], [0, 1]);
  const tip = useTransform(progress, [0, 1], ["0%", "100%"]);
  const tipOpacity = useTransform(
    progress,
    [0, 0.12, 0.84, 1],
    [0, 0.9, 0.8, 0],
  );
  const coreOpacity = useTransform(progress, [0, 1], [0.27, 1]);
  const glowOpacity = useTransform(progress, [0, 1], [0.035, 0.82]);
  const glowSize = useTransform(progress, [0, 1], [0.8, 1.08]);
  const ringHeadX = useTransform(
    progress,
    (p) => 48 + Math.sin(p * Math.PI * 2) * 31,
  );
  const ringHeadY = useTransform(
    progress,
    (p) => 48 - Math.cos(p * Math.PI * 2) * 31,
  );
  const ringHeadOpacity = useTransform(
    progress,
    [0, 0.06, 0.95, 1],
    [0, 1, 1, 0],
  );

  return (
    <motion.button
      ref={button}
      className={`menu-button star-menu-button ${active ? "is-lit" : ""}`}
      data-lit={active}
      data-charged={charged && active}
      aria-label={`${number} ${label} ${subtitle}`}
      whileTap={{ opacity: 0.78 }}
      onPointerEnter={(event) => {
        if (paused || event.pointerType === "touch") return;
        pointer.current={x:event.clientX,y:event.clientY};
        setHovered(true);
        onHover();
      }}
      onPointerLeave={() => setHovered(false)}
      onPointerCancel={() => setHovered(false)}
      onFocus={(event) =>
        setFocused(keyboard.current && event.currentTarget.matches(":focus-visible"))
      }
      onKeyDown={event=>{if(['Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){keyboard.current=true;setFocused(true);}}}
      onBlur={() => setFocused(false)}
      onClick={onClick}
    >
      <span className="menu-number">{number}</span>
      <span className="menu-star" aria-hidden="true">
        <motion.span
          className="menu-star-halo"
          style={{ opacity: glowOpacity, scale: glowSize }}
        >
          <span className="menu-star-halo-breath" />
        </motion.span>
        <svg viewBox="0 0 96 96" className="menu-star-svg">
          <defs>
            <radialGradient id={`${id}-gold`}>
              <stop offset="0" stopColor="#fffef7" />
              <stop offset="0.3" stopColor="#fff0c3" />
              <stop offset="1" stopColor="#eebc68" />
            </radialGradient>
            <radialGradient id={`${id}-heart`}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.25" stopColor="#fff3c7" />
              <stop offset="1" stopColor="#ffc85d" stopOpacity="0" />
            </radialGradient>
            <filter
              id={`${id}-soft`}
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="2.1" />
            </filter>
            <StarShapeDefinition id={`${id}-shape`} />
          </defs>
          <motion.g style={{ opacity: glowOpacity }}>
            <g className="menu-star-light-breath">
              <use
                href={`#${id}-shape`}
                fill="#ffc762"
                stroke="#ffc762"
                filter={`url(#${id}-soft)`}
              />
              <circle cx="48" cy="48" r="10" fill={`url(#${id}-heart)`} />
            </g>
          </motion.g>
          <motion.g style={{ opacity: coreOpacity }}>
            <use
              href={`#${id}-shape`}
              fill={`url(#${id}-gold)`}
              stroke={`url(#${id}-gold)`}
            />
          </motion.g>
          <motion.circle
            className="menu-charge-ring"
            cx="48"
            cy="48"
            r="31"
            transform="rotate(-90 48 48)"
            style={{ pathLength: progress, opacity: lineOpacity }}
          />
          <motion.circle
            className="menu-charge-head"
            cx={ringHeadX}
            cy={ringHeadY}
            r="1.5"
            style={{ opacity: ringHeadOpacity }}
          />
        </svg>
      </span>
      <span className="menu-content">
        <motion.span className="menu-text" style={{ y: lift }}>
          <strong className="menu-word">{label}</strong>
          <small className="menu-subtitle">{subtitle}</small>
          <motion.span
            className="menu-color-sweep"
            aria-hidden="true"
            style={{ maskImage: wipe, WebkitMaskImage: wipe }}
          >
            <strong className="menu-word menu-color-wave">{label}</strong>
            <small className="menu-subtitle menu-color-wave">{subtitle}</small>
          </motion.span>
        </motion.span>
        <span className="menu-underline" aria-hidden="true">
          <span className="menu-line-idle" />
          <motion.span
            className="menu-line-lit"
            style={{
              opacity: lineOpacity,
              maskImage: wipe,
              WebkitMaskImage: wipe,
            }}
          />
          <motion.span
            className="menu-line-tip"
            style={{ left: tip, opacity: tipOpacity }}
          />
        </span>
      </span>
      {bursts.map((burst) => (
        <Starburst
          key={burst}
          seed={`${id}-${burst}`}
          finish={() =>
            setBursts((current) => current.filter((n) => n !== burst))
          }
        />
      ))}
    </motion.button>
  );
}

// Each shard has its own silhouette, source point, travel distance and rotation.
// Sources cover the whole button; evenly spaced directions cover all four sides.
function Starburst({ seed, finish }: { seed: string; finish: () => void }) {
  const [shards] = useState(() => {
    const random = starRandom(seed);
    return Array.from({ length: 32 }, (_, index) => {
      const angle = ((index + random() * 0.65) / 32) * Math.PI * 2;
      const distance = 34 + random() * 72;
      const silhouette = irregularStar(random);
      return {
        x: 50 + Math.cos(angle) * (18 + random() * 29),
        y: 50 + Math.sin(angle) * (14 + random() * 32),
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance * 0.8,
        gravity: 5 + random() * 16,
        size: 3 + random() * 4.5,
        rotation: random() * 180,
        spin: (random() - 0.5) * 260,
        silhouette,
      };
    });
  });

  return (
    <span className="menu-starburst" aria-hidden="true" data-duration="2s">
      {shards.map((shard, index) => (
        <motion.span
          className="menu-burst-shard"
          key={index}
          style={{
            left: `${shard.x}%`,
            top: `${shard.y}%`,
            width: shard.size,
            height: shard.size,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.35,
            rotate: shard.rotation,
          }}
          animate={{
            x: [0, shard.dx * 0.22, shard.dx * 0.74, shard.dx],
            y: [
              0,
              shard.dy * 0.22,
              shard.dy * 0.74 + shard.gravity * 0.4,
              shard.dy + shard.gravity,
            ],
            opacity: [0, 1, 0.55, 0],
            scale: [0.35, 1, 0.6, 0.05],
            rotate: [
              shard.rotation,
              shard.rotation + shard.spin * 0.2,
              shard.rotation + shard.spin * 0.7,
              shard.rotation + shard.spin,
            ],
          }}
          transition={{
            duration: 2,
            times: [0, 0.1, 0.58, 1],
            ease: "easeOut",
          }}
          onAnimationComplete={index === shards.length - 1 ? finish : undefined}
        >
          <span style={{ clipPath: `polygon(${shard.silhouette})` }} />
        </motion.span>
      ))}
    </span>
  );
}
