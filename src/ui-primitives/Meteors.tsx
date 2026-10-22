import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Quality } from "./visualTypes.js";

const meteors = [
  {
    x: 94,
    y: 6,
    endX: 56,
    endY: 47,
    duration: 10.5,
    delay: -1.6,
    color: "#c8dcff",
  },
  {
    x: 74,
    y: 2,
    endX: 27,
    endY: 45,
    duration: 13.7,
    delay: -6.7,
    color: "#fff1c8",
  },
  {
    x: 104,
    y: 18,
    endX: 72,
    endY: 47,
    duration: 17.3,
    delay: -11.2,
    color: "#d9e8ff",
  },
];

export default function Meteors({
  quality,
  reduced,
}: {
  quality: Quality;
  reduced: boolean;
}) {
  const plane = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = plane.current;
    if (!element) return;
    function measure() {
      setSize({ width: element!.clientWidth, height: element!.clientHeight });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [quality, reduced]);
  if (reduced || quality === "low" || quality === "off") return null;
  return (
    <div ref={plane} className="meteor-plane" aria-hidden="true">
      {meteors.slice(0, quality === "high" ? 3 : 2).map((meteor, index) => {
        const dx = ((meteor.endX - meteor.x) / 100) * size.width;
        const dy = ((meteor.endY - meteor.y) / 100) * size.height;
        return (
          <span
            className="meteor-track"
            key={index}
            style={
              {
                left: `${meteor.x}%`,
                top: `${meteor.y}%`,
                animationDuration: `${meteor.duration}s`,
                animationDelay: `${meteor.delay}s`,
                "--meteor-color": meteor.color,
                "--meteor-travel-x": `${dx}px`,
                "--meteor-travel-y": `${dy}px`,
                "--meteor-angle": `${(Math.atan2(-dy, -dx) * 180) / Math.PI}deg`,
              } as CSSProperties
            }
          >
            <span className="meteor-streak" />
          </span>
        );
      })}
    </div>
  );
}
