import { useEffect, useRef, useState } from "react";
import {
  tsParticles,
  type Container,
  type ISourceOptions,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { loadShadowEffect } from "@tsparticles/effect-shadow";
import { particleCounts, type Quality } from "./model";

let engineReady: Promise<void> | undefined;
let instance = 0;
export function Stardust({
  quality,
  paused,
  reduced,
  letter,
}: {
  quality: Quality;
  paused: boolean;
  reduced: boolean;
  letter: boolean;
}) {
  const [id] = useState(() => `stardust-${++instance}`);
  const container = useRef<Container | undefined>(undefined);
  const pauseRequested = useRef(paused || reduced);
  pauseRequested.current = paused || reduced;
  const [error, setError] = useState(false);
  useEffect(() => {
    if (quality === "off") return;
    let disposed = false;
    let own: Container | undefined;
    const number = letter
      ? Math.min(18, particleCounts[quality])
      : particleCounts[quality];
    const palette = ["#ffe3a0", "#91bdff", "#f3f7ff"];
    const groups = Object.fromEntries(
      palette.map((color, index) => [
        `glow-${index}`,
        {
          number: {
            value: Math.floor(number / 3) + (index < number % 3 ? 1 : 0),
          },
          paint: {
            color: { value: color },
            fill: { enable: true, color: { value: color } },
          },
          effect: {
            type: "shadow",
            options: {
              shadow: {
                color: { value: color },
                blur: quality === "low" ? 8 : 14,
                offset: { x: 0, y: 0 },
              },
            },
          },
          opacity: {
            value: { min: 0.28, max: 0.92 },
            animation: {
              enable: !reduced,
              speed: 0.62 + index * 0.12,
              sync: true,
              startValue: "random",
            },
          },
        },
      ]),
    );
    const options: ISourceOptions = {
      fullScreen: { enable: false },
      fpsLimit: quality === "low" ? 30 : 60,
      detectRetina: true,
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      background: { color: "transparent" },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: { enable: quality !== "low" && !reduced, mode: "attract" },
          onClick: { enable: false },
        },
        modes: {
          attract: { distance: 140, duration: 0.35, speed: 0.35, factor: 2 },
        },
      },
      particles: {
        number: { value: number, density: { enable: false } },
        groups,
        paint: { color: { value: palette[0] }, fill: { enable: true } },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.28, max: 0.92 },
          animation: {
            enable: !reduced,
            speed: 0.72,
            sync: true,
            startValue: "random",
          },
        },
        size: { value: { min: 0.7, max: 2.2 } },
        links: { enable: false },
        move: {
          enable: !reduced,
          speed: 0.13,
          direction: "top",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
      },
    };
    engineReady ??= loadSlim(tsParticles).then(() =>
      loadShadowEffect(tsParticles),
    );
    void engineReady
      .then(async () => {
        if (disposed) return;
        own = await tsParticles.load({ id, options });
        if (disposed) {
          own?.destroy();
          return;
        }
        container.current = own;
        if (pauseRequested.current) own?.pause();
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      own?.destroy();
      if (container.current === own) container.current = undefined;
    };
  }, [id, quality, reduced, letter]);
  useEffect(() => {
    if (paused || reduced) container.current?.pause();
    else container.current?.play();
  }, [paused, reduced]);
  // The engine owns this canvas; no other animation library touches it.
  return (
    <div className="particle-plane" aria-hidden="true">
      <div id={id} />
      {error && <span className="particle-error">星屑暂不可用</span>}
    </div>
  );
}
