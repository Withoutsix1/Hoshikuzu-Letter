import { useCallback, useEffect, useRef, useState } from "react";
import { animate, type JSAnimation } from "animejs";

type Props = {
  reduced: boolean;
  choose: (branch: number) => void;
  sound: () => void;
  choices?: {text:string;enabled:boolean}[];
  confirm?: (branch:number)=>void;
  busy?: boolean;
};
export default function Causal({ reduced, choose, sound, choices, confirm, busy=false }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const jobs = useRef<JSAnimation[]>([]);
  const [branch, setBranch] = useState(0);
  const [status, setStatus] = useState("等待一个选择");
  const [connected, setConnected] = useState(false);
  const activeBranch = useRef(0);
  const cancel = useCallback(() => {
    jobs.current.forEach((job) => job.cancel());
    jobs.current = [];
  }, []);
  useEffect(() => cancel, [cancel]);

  function path(id: string) {
    return svg.current!.querySelector<SVGPathElement>(`#${id}`)!;
  }
  function node(id: string) {
    return svg.current!.querySelector<SVGCircleElement>(`#${id}`)!;
  }
  function run(
    target: Parameters<typeof animate>[0],
    params: Parameters<typeof animate>[1],
  ) {
    const job = animate(target, params);
    jobs.current.push(job);
    return job;
  }
  function setHidden(p: SVGPathElement) {
    const length = p.getTotalLength();
    p.style.strokeDasharray = `${length}`;
    p.style.strokeDashoffset = `${length}`;
  }
  const init = useCallback(() => {
    if (!svg.current) return;
    for (const p of svg.current.querySelectorAll<SVGPathElement>(
      ".causal-live",
    ))
      setHidden(p);
    for (const n of svg.current.querySelectorAll<SVGCircleElement>(
      ".causal-node",
    )) {
      n.style.opacity = "0.25";
      n.setAttribute("r", "6");
    }
    const star = svg.current.querySelector<SVGCircleElement>("#traveler")!;
    star.style.opacity = "0";
    setConnected(false);
    setStatus("等待一个选择");
  }, []);
  useEffect(() => {
    cancel();
    init();
  }, [reduced, cancel, init]);

  function travel(
    p: SVGPathElement,
    delay: number,
    duration: number,
    reverse = false,
  ) {
    const dot = node("traveler");
    const position = { progress: reverse ? 1 : 0 };
    const length = p.getTotalLength();
    run(position, {
      progress: reverse ? 0 : 1,
      delay,
      duration,
      ease: "linear",
      onBegin: () => {
        dot.style.opacity = "1";
      },
      onUpdate: () => {
        const point = p.getPointAtLength(position.progress * length);
        dot.setAttribute("cx", `${point.x}`);
        dot.setAttribute("cy", `${point.y}`);
      },
      onComplete: () => {
        dot.style.opacity = "0";
      },
    });
  }
  function establish(selected = branch) {
    cancel();
    init();
    sound();
    setBranch(selected);
    activeBranch.current = selected;
    choose(selected);
    setStatus("原因亮起 · 信沿时间抵达");
    const main = path("thread-main"),
      next = path(`thread-${selected}`);
    const first = reduced ? 1 : 680,
      second = reduced ? 1 : 840;
    run(node("node-origin"), { opacity: 1, r: 8, duration: reduced ? 0 : 180 });
    run(main, { strokeDashoffset: 0, duration: first, ease: "inOutSine" });
    travel(main, 0, first);
    run(node("node-mid"), {
      opacity: 1,
      r: 7,
      delay: first,
      duration: reduced ? 0 : 180,
    });
    run(next, {
      strokeDashoffset: 0,
      delay: first,
      duration: second,
      ease: "inOutSine",
    });
    travel(next, first, second);
    run(node(`node-${selected}`), {
      opacity: 1,
      r: [6, 11, 8],
      delay: first + second,
      duration: reduced ? 0 : 550,
      onComplete: () => {
        setConnected(true);
        setStatus("因果已建立 · 一条未来被写下");
      },
    });
  }
  function dissolve() {
    cancel();
    sound();
    setConnected(false);
    setStatus("结果暗下 · 因果向来处消退");
    const main = path("thread-main"),
      next = path(`thread-${activeBranch.current}`);
    const first = reduced ? 1 : 850,
      second = reduced ? 1 : 700;
    run(node(`node-${activeBranch.current}`), {
      opacity: 0.25,
      r: 6,
      duration: reduced ? 0 : 250,
    });
    run(next, {
      strokeDashoffset: next.getTotalLength(),
      duration: first,
      ease: "inOutSine",
    });
    travel(next, 0, first, true);
    run(node("node-mid"), {
      opacity: 0.25,
      r: 6,
      delay: first,
      duration: reduced ? 0 : 250,
    });
    run(main, {
      strokeDashoffset: main.getTotalLength(),
      delay: first,
      duration: second,
      ease: "inOutSine",
    });
    travel(main, first, second, true);
    run(node("node-origin"), {
      opacity: 0.25,
      r: 6,
      delay: first + second,
      duration: reduced ? 0 : 200,
      onComplete: () => setStatus("因果已消退 · 选择仍可重新书写"),
    });
    for (let i = 0; i < 4; i++) {
      const mote = node(`mote-${i}`);
      mote.setAttribute("cx", "760");
      mote.setAttribute("cy", `${activeBranch.current === 0 ? 110 : 330}`);
      run(mote, {
        opacity: [0, 0.6, 0],
        cx: 750 + i * 14,
        cy: (activeBranch.current === 0 ? 110 : 330) - 14 - i * 7,
        duration: reduced ? 0 : 550,
        delay: i * 60,
      });
    }
  }

  return (
    <div className="causal-scene">
      <div className="scene-kicker">
        CAUSE <span>→</span> POSSIBILITY <span>→</span> TOMORROW
      </div>
      <svg
        ref={svg}
        className="causal-map"
        viewBox="0 0 960 440"
        role="img"
        aria-label={`因果路径：${branch === 0 ? "寄出这封信" : "留下这封信"}，${status}`}
      >
        <defs>
          <filter
            id="node-light"
            x="-200%"
            y="-200%"
            width="500%"
            height="500%"
          >
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g className="causal-baseline">
          <path d="M150 220 L440 220" />
          <path d="M440 220 C570 220 600 110 760 110" />
          <path d="M440 220 C570 220 600 330 760 330" />
        </g>
        <g className="causal-ink">
          <path
            id="thread-main"
            className="causal-live"
            d="M150 220 L440 220"
          />
          <path
            id="thread-0"
            className={`causal-live ${branch === 0 ? "chosen" : ""}`}
            d="M440 220 C570 220 600 110 760 110"
          />
          <path
            id="thread-1"
            className={`causal-live ${branch === 1 ? "chosen" : ""}`}
            d="M440 220 C570 220 600 330 760 330"
          />
        </g>
        <g className="causal-rings">
          <circle cx="150" cy="220" r="18" />
          <circle cx="440" cy="220" r="14" />
          <circle cx="760" cy="110" r="18" />
          <circle cx="760" cy="330" r="18" />
        </g>
        <g className="causal-stars">
          <circle
            id="node-origin"
            className="causal-node"
            cx="150"
            cy="220"
            r="6"
          />
          <circle
            id="node-mid"
            className="causal-node"
            cx="440"
            cy="220"
            r="6"
          />
          <circle id="node-0" className="causal-node" cx="760" cy="110" r="6" />
          <circle id="node-1" className="causal-node" cx="760" cy="330" r="6" />
          <circle id="traveler" cx="150" cy="220" r="3.5" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} id={`mote-${i}`} r="1.3" opacity="0" />
          ))}
        </g>
        <g className="causal-labels">
          <text x="150" y="276" textAnchor="middle">
            一封未寄出的信
          </text>
          <text x="440" y="268" textAnchor="middle">
            你的选择
          </text>
          <text x="790" y="116">
            {choices?.[0]?.text??'寄往过去'}
          </text>
          <text x="790" y="336">
            {choices?.[1]?.text??'留在此刻'}
          </text>
        </g>
        <g className="causal-timestamps">
          <text x="150" y="300" textAnchor="middle">
            ORIGIN
          </text>
          <text x="790" y="140">
            FUTURE A
          </text>
          <text x="790" y="360">
            FUTURE B
          </text>
        </g>
      </svg>
      <div className="choice-buttons">
        <button
          className={branch === 0 ? "selected" : ""}
          disabled={busy||choices?.[0]?.enabled===false}
          onClick={() => establish(0)}
        >
          <span>✦</span> {choices?.[0]?.text??'寄出这封信'} <small>写下一条未来</small>
        </button>
        <button
          className={branch === 1 ? "selected" : ""}
          disabled={busy||choices?.[1]?.enabled===false}
          onClick={() => establish(1)}
        >
          <span>✦</span> {choices?.[1]?.text??'留下这封信'} <small>让此刻停留</small>
        </button>
      </div>
      <div className="causal-controls">
        <button className="quiet-button" disabled={busy||choices?.[branch]?.enabled===false} onClick={() => establish()}>
          ↻ {connected ? "重播建立" : "建立因果"}
        </button>
        <button className="quiet-button" disabled={busy} onClick={dissolve}>
          ↶ 消除因果
        </button>
        <span className="state-label" role="status">
          {status}
        </span>
        {confirm&&<button className="quiet-button" disabled={!connected||busy} onClick={()=>confirm(branch)}>沿着这条星链继续 →</button>}
      </div>
    </div>
  );
}
