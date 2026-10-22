import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type MotionValue } from "motion/react";

type Props = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  glowX: MotionValue<number>;
  glowY: MotionValue<number>;
  reduced: boolean;
  paused: boolean;
  unlocked: boolean;
  reward: () => void;
  finish: () => void;
  sound: (kind: "hover" | "open") => void;
};
export default function Letter({
  x,
  y,
  glowX,
  glowY,
  reduced,
  paused,
  unlocked,
  reward,
  finish,
  sound,
}: Props) {
  const [phase, setPhase] = useState<"closed" | "opening" | "reading">(
    "closed",
  );
  const [hovered, setHovered] = useState(false);
  const [rewardVisible, setRewardVisible] = useState(false);
  const guard = useRef(false);
  const wasUnlocked = useRef(unlocked);
  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(
      () => {
        setPhase("reading");
        reward();
        setRewardVisible(true);
      },
      reduced ? 20 : 1450,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reduced, reward]);
  useEffect(() => {
    if (!rewardVisible) return;
    const timer = window.setTimeout(
      () => setRewardVisible(false),
      reduced ? 1800 : 2400,
    );
    return () => window.clearTimeout(timer);
  }, [rewardVisible, reduced]);
  function open() {
    if (guard.current) return;
    guard.current = true;
    setHovered(false);
    setPhase("opening");
    sound("open");
  }
  const openNow = phase !== "closed";
  const seconds = (n: number) => (reduced ? 0 : n);
  return (
    <div className={`letter-scene phase-${phase}`}>
      <div className="letter-caption">
        <span>TO THE FIRST WITNESS</span>
        <p>
          {phase === "closed"
            ? "有一封信，正在等你。"
            : phase === "opening"
              ? "星光，沿着折痕抵达。"
              : "谢谢你，让这段旅程有了开始。"}
        </p>
      </div>
      <motion.div
        className="envelope-aura"
        style={{ x: glowX, y: glowY }}
        animate={{
          opacity: openNow
            ? 0.12
            : hovered
              ? 0.38
              : paused || reduced
                ? 0.24
                : [0.18, 0.3, 0.18],
        }}
        transition={{
          duration: seconds(openNow || hovered || paused ? 0.22 : 3.6),
          repeat: openNow || hovered || paused || reduced ? 0 : Infinity,
        }}
      />
      <motion.div className="envelope-parallax" style={{ x, y }}>
        <motion.div
          className="envelope-float"
          animate={{ y: !openNow && !paused && !reduced ? [0, -2, 0] : 0 }}
          transition={{
            duration: seconds(openNow || paused ? 0.18 : 4.2),
            repeat: !openNow && !paused && !reduced ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <motion.button
            type="button"
            className="envelope"
            aria-label="打开第一封信"
            disabled={openNow}
            onPointerEnter={() => {
              setHovered(true);
              sound("hover");
            }}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            onClick={open}
            animate={{
              y: phase === "reading" ? 155 : hovered ? -2 : openNow ? 3 : 0,
              scale: phase === "reading" ? 0.86 : hovered ? 1.012 : 1,
              opacity: phase === "reading" ? 0.12 : 1,
            }}
            transition={{
              duration: seconds(phase === "reading" ? 0.6 : 0.2),
              ease: "easeOut",
            }}
          >
            <span className="envelope-back" />
            <motion.span
              className="paper-preview"
              animate={{ y: openNow ? -115 : 0, opacity: openNow ? 1 : 0 }}
              transition={{
                duration: seconds(0.75),
                delay: seconds(0.48),
                ease: [0.2, 0.75, 0.3, 1],
              }}
            >
              <span>致第一封信的见证者</span>
              <i />
              <i />
              <i />
            </motion.span>
            <span className="envelope-front">
              <span className="envelope-address">致 · 初见的你</span>
              <span className="envelope-postmark">
                HOSHIKUZU
                <br />
                FIRST LETTER
              </span>
            </span>
            <motion.span
              className="envelope-flap"
              animate={{ rotateX: openNow ? 180 : 0 }}
              transition={{
                duration: seconds(0.62),
                delay: seconds(0.12),
                ease: [0.3, 0, 0.2, 1],
              }}
            />
            <motion.span
              className="envelope-seal"
              animate={{
                opacity: openNow ? 0 : 1,
                scale: openNow ? 0.9 : hovered ? 1.035 : 1,
              }}
              transition={{ duration: seconds(0.15) }}
            >
              <span>✦</span>
            </motion.span>
            <span className="envelope-rim" />
          </motion.button>
          {!openNow && (
            <div
              className={`envelope-satellites ${hovered ? "gathered" : ""}`}
              aria-hidden="true"
            >
              {[0, 1, 2, 3].map((i) => (
                <span key={i}>✦</span>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {phase === "reading" && (
          <motion.article
            className="letter-paper"
            initial={{ opacity: 0, y: 48, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: seconds(0.6), ease: [0.2, 0.75, 0.3, 1] }}
          >
            <span className="paper-number">
              LETTER 001 <span>✦</span>
            </span>
            <h2>致第一封信的见证者</h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: seconds(0.3), duration: seconds(0.45) }}
            >
              <p>
                在故事抵达终点之前，
                <br />
                你先听见了它最初的回声。
              </p>
              <p>
                谢谢你停留、阅读，
                <br />
                也谢谢你把一点星光，留在这封信里。
              </p>
              <p className="letter-signature">
                愿下一次来信，仍能与你相遇。
                <br />
                <span>—— 星屑信</span>
              </p>
              <button className="paper-action" onClick={finish}>
                收好这封信 <span>→</span>
              </button>
            </motion.div>
          </motion.article>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {rewardVisible && (
          <motion.div
            className="reward-toast"
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: seconds(0.25) }}
          >
            <span>✦</span>
            <div>
              <small>
                {wasUnlocked.current ? "这份纪念已收藏" : "已获得特殊称号"}
              </small>
              <strong>第一封信的见证者</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === "closed" && (
        <div className="letter-prompt">
          <span className="tiny-star">✦</span> 点击信封 · 收到第一封来信
        </div>
      )}
    </div>
  );
}
