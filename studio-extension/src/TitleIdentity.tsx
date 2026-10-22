import { useState, type CSSProperties } from "react";
import { motion, type MotionValue } from "motion/react";
import { irregularStar, STAR_FLARE_PATH, starRandom } from "./starVisuals";
import type { Quality } from "./model";
import { ThreadInteraction, useBendingThread } from "./ThreadInteraction";
import { useResource } from "./resources";

type Props = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  quality: Quality;
  unlocked: boolean;
  disabled: boolean;
  imageTitle: boolean;
};

const dustPositions = [
  [18, 48],
  [20, 46],
  [22, 42],
  [24, 35],
  [25, 29],
  [29, 24],
  [36, 16],
  [45, 12],
  [54, 12],
  [60, 14],
  [65, 17],
  [68, 20],
  [70, 23],
  [76, 27],
  [28, 55],
  [32, 58],
  [36, 60],
  [31, 53],
];

export default function TitleIdentity({
  x,
  y,
  quality,
  unlocked,
  disabled,
  imageTitle,
}: Props) {
  const wordmark = useResource().url("assets/title-gold-transparent.png");
  const [dust] = useState(() => {
    const random = starRandom("hoshikuzu-title-orbit");
    return dustPositions.map(([left, top]) => ({
      left,
      top,
      size: 3 + random() * 3.5,
      rotation: random() * 180,
      duration: 2.8 + random() * 1.8,
      delay: random() * -4.5,
      silhouette: irregularStar(random),
    }));
  });
  const count = { high: 18, medium: 12, low: 8, off: 0 }[quality];

  return (
    <motion.div className="title-mark title-identity" style={{ x, y }}>
      <ThreadInteraction disabled={disabled} width={440} height={480}>
        <svg
          className="identity-orbits"
          viewBox="0 0 440 480"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g className="identity-chain">
            <IdentityThread path="M74 233 C44 190 106 104 154 75 C195 41 251 47 276 87 C292 105 301 122 300 134" />
            <IdentityThread path="M74 233 C85 271 149 291 216 260" />
            <path
              className="identity-fine-chain"
              d="M74 233 58 146 119 112 M276 87 298 49"
            />
          </g>
        </svg>
        <div className="identity-stars" aria-hidden="true">
          {[
            { left: 16.8, top: 48.55, size: 28, delay: -0.7 },
            { left: 62.73, top: 18.13, size: 32, delay: -2.1 },
            { left: 29, top: 28.7, size: 15, delay: -1.3 },
            { left: 74.7, top: 33, size: 12, delay: -2.8 },
          ].map((star, index) => (
            <span
              className="identity-star"
              key={index}
              style={
                {
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: star.size,
                  height: star.size,
                  "--breath-delay": `${star.delay}s`,
                } as CSSProperties
              }
            >
              <span className="identity-star-breath">
                <span className="identity-star-halo" />
                <svg viewBox="0 0 96 96">
                  <path d={STAR_FLARE_PATH} />
                </svg>
              </span>
            </span>
          ))}
        </div>
        <div className="identity-dust-plane" aria-hidden="true">
          {dust.slice(0, count).map((shard, index) => (
            <span
              className="identity-dust menu-burst-shard"
              key={index}
              style={{
                left: `${shard.left}%`,
                top: `${shard.top}%`,
                width: shard.size,
                height: shard.size,
                animationDuration: `${shard.duration}s`,
                animationDelay: `${shard.delay}s`,
              }}
            >
              <span
                style={{
                  clipPath: `polygon(${shard.silhouette})`,
                  transform: `rotate(${shard.rotation}deg)`,
                }}
              />
            </span>
          ))}
        </div>
        <div className="title-logo">
          <h2 className={imageTitle ? "has-wordmark-image" : "songti-title"} data-title-preset={imageTitle ? "image" : "text"}>
            星屑信
            {imageTitle && (
              <img
                className="title-wordmark-image"
                src={wordmark}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="async"
              />
            )}
          </h2>
          <p className="title-roman">HOSHIKUZU NO TEGAMI</p>
        </div>
        <div className="title-poem">
          <p>在无数的可能性之中，</p>
          <p>总有一封信，会抵达你。</p>
        </div>
        {unlocked && (
          <span className="title-beta-mark">✦ 第一封信的见证者</span>
        )}
      </ThreadInteraction>
    </motion.div>
  );
}

function IdentityThread({ path }: { path: string }) {
  const curve = useBendingThread(path);
  return <motion.path d={curve} />;
}
