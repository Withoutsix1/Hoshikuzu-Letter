import { backgrounds, type Appearance } from "./visualAssets";

export default function AppearanceControls({
  appearance,
  change,
}: {
  appearance: Appearance;
  change: (appearance: Appearance) => void;
}) {
  return (
    <div
      className="appearance-controls"
      role="group"
      aria-label="主界面外观切换"
    >
      <span>主界面外观</span>
      <button
        aria-label="切换背景"
        aria-pressed={appearance.background === "observatory"}
        title="在天文台星空与星河天台之间切换"
        onClick={() =>
          change({
            ...appearance,
            background:
              appearance.background === "observatory"
                ? "milky-way"
                : "observatory",
          })
        }
      >
        背景 · {backgrounds[appearance.background].label}
        <i aria-hidden="true">⇄</i>
      </button>
      <button
        aria-label="切换标题样式"
        aria-pressed={appearance.title === "image"}
        title="在鎏金星轨徽章与文字标题之间切换"
        onClick={() =>
          change({
            ...appearance,
            title: appearance.title === "image" ? "text" : "image",
          })
        }
      >
        标题 · {appearance.title === "image" ? "鎏金徽章" : "文字"}
        <i aria-hidden="true">⇄</i>
      </button>
    </div>
  );
}
