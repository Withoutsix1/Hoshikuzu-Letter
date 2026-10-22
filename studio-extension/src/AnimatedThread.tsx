import { motion, useTransform, type MotionValue } from "motion/react";
import { useBendingThread } from "./ThreadInteraction";

export default function AnimatedThread({
  path,
  drawn,
  className,
}: {
  path: string;
  drawn: MotionValue<number>;
  className: string;
}) {
  const curve = useBendingThread(path);
  // Normalized dash lengths must scale with the path, not a non-scaling stroke.
  // Remove dashes entirely at completion: 100% is a continuous solid path.
  const dash = useTransform(drawn, (value) =>
    value >= 1 ? "none" : `${Math.max(0, value)} 1`,
  );
  return (
    <motion.path
      className={className}
      d={curve}
      pathLength={1}
      style={{ strokeDasharray: dash, strokeDashoffset: 0, opacity: drawn }}
    />
  );
}
