import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useMotionValue, type MotionValue } from "motion/react";

type Point = { x: number; y: number };
type Strand = {
  original: string;
  samples: Point[];
  offsets: number[];
  output: MotionValue<string>;
};
type Field = { strands: Set<Strand> };
const ThreadField = createContext<Field | null>(null);

// One pointer listener and animation loop serve the whole constellation.
export function ThreadInteraction({
  disabled,
  children,
  width = 1000,
  height = 600,
}: {
  disabled: boolean;
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  const bounds = useRef<HTMLDivElement>(null);
  const field = useMemo<Field>(() => ({ strands: new Set() }), []);
  useEffect(() => {
    const plane = bounds.current;
    if (!plane) return;
    let cursor: Point | null = null;
    let rect = plane.getBoundingClientRect();
    let frame = 0;
    let previous = 0;
    const reset = () => {
      field.strands.forEach((strand) => {
        strand.offsets.fill(0);
        strand.output.set(strand.original);
      });
    };
    reset();
    if (disabled) return;

    const update = (time: number) => {
      const smoothing =
        1 - Math.exp(-Math.min(time - previous || 16, 40) / 115);
      previous = time;
      const sx = rect.width / width;
      const sy = rect.height / height;
      let moving = false;
      if (sx > 0 && sy > 0)
        field.strands.forEach((strand) => {
          let bent = false;
          const points = strand.samples.map((point, index, samples) => {
            // Both end stars stay fixed, including the endpoints of tiny branches.
            if (index === 0 || index === samples.length - 1) return point;
            const before = samples[index - 1];
            const after = samples[index + 1];
            const tx = (after.x - before.x) * sx;
            const ty = (after.y - before.y) * sy;
            const length = Math.hypot(tx, ty) || 1;
            const nx = -ty / length;
            const ny = tx / length;
            let target = 0;
            if (cursor) {
              const dx = point.x * sx - cursor.x;
              const dy = point.y * sy - cursor.y;
              const distance = Math.hypot(dx, dy);
              if (distance < 75) {
                const falloff = (1 - distance / 75) ** 2;
                const taper = Math.sin(
                  (Math.PI * index) / (samples.length - 1),
                );
                target =
                  (dx * nx + dy * ny >= 0 ? 1 : -1) * 3.2 * falloff * taper;
              }
            }
            const offset =
              strand.offsets[index] +
              (target - strand.offsets[index]) * smoothing;
            strand.offsets[index] =
              Math.abs(offset) < 0.01 && target === 0 ? 0 : offset;
            bent ||= Math.abs(strand.offsets[index]) > 0;
            moving ||= Math.abs(target - strand.offsets[index]) > 0.01;
            return {
              x: point.x + (nx * strand.offsets[index]) / sx,
              y: point.y + (ny * strand.offsets[index]) / sy,
            };
          });
          strand.output.set(bent ? smoothPath(points) : strand.original);
        });
      frame = moving ? requestAnimationFrame(update) : 0;
    };
    const wake = () => {
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(update);
      }
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      rect = plane.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      cursor =
        x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
          ? { x, y }
          : null;
      wake();
    };
    const leave = () => {
      cursor = null;
      wake();
    };
    const resize = new ResizeObserver(() => {
      rect = plane.getBoundingClientRect();
      leave();
    });
    resize.observe(plane);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leaveWindow);
    window.addEventListener("blur", leave);
    function leaveWindow(event: PointerEvent) {
      if (!event.relatedTarget) leave();
    }
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leaveWindow);
      window.removeEventListener("blur", leave);
      reset();
    };
  }, [disabled, field, width, height]);
  return (
    <ThreadField.Provider value={field}>
      <div
        className="thread-interaction-plane"
        ref={bounds}
        aria-hidden="true"
      />
      {children}
    </ThreadField.Provider>
  );
}

export function useBendingThread(path: string) {
  const field = useContext(ThreadField);
  const output = useMotionValue(path);
  useEffect(() => {
    const samples = samplePath(path);
    const strand = {
      original: path,
      samples,
      offsets: samples.map(() => 0),
      output,
    };
    output.set(path);
    field?.strands.add(strand);
    return () => {
      field?.strands.delete(strand);
    };
  }, [field, path, output]);
  return output;
}

// The constellation uses absolute M/C paths. Sample the original curve once,
// then fit a smooth spline through locally displaced points during interaction.
function samplePath(path: string): Point[] {
  const tokens = path.match(/[MC]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const points: Point[] = [];
  let index = 0;
  let current = { x: 0, y: 0 };
  const read = () => ({
    x: Number(tokens[index++]),
    y: Number(tokens[index++]),
  });
  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === "M") {
      current = read();
      points.push(current);
    } else if (command === "C") {
      const a = read(),
        b = read(),
        end = read();
      const steps = Math.max(
        8,
        Math.ceil(
          (Math.hypot(a.x - current.x, a.y - current.y) +
            Math.hypot(b.x - a.x, b.y - a.y) +
            Math.hypot(end.x - b.x, end.y - b.y)) /
            12,
        ),
      );
      for (let step = 1; step <= steps; step++) {
        const t = step / steps,
          u = 1 - t;
        points.push({
          x:
            u ** 3 * current.x +
            3 * u * u * t * a.x +
            3 * u * t * t * b.x +
            t ** 3 * end.x,
          y:
            u ** 3 * current.y +
            3 * u * u * t * a.y +
            3 * u * t * t * b.y +
            t ** 3 * end.y,
        });
      }
      current = end;
    } else return [];
  }
  return points;
}
function smoothPath(points: Point[]) {
  if (!points.length) return "";
  const pair = ({ x, y }: Point) => `${x.toFixed(4)} ${y.toFixed(4)}`;
  let path = `M${pair(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)],
      b = points[i],
      c = points[i + 1],
      d = points[Math.min(points.length - 1, i + 2)];
    path += ` C${pair({ x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 })} ${pair({ x: c.x - (d.x - b.x) / 6, y: c.y - (d.y - b.y) / 6 })} ${pair(c)}`;
  }
  return path;
}
