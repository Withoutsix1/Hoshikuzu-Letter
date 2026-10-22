import { useId, type CSSProperties, type ReactNode } from "react";
import type { Preferences } from "./preferences.js";
import type { Quality } from "./visualTypes.js";

export type ChangePreference = <K extends keyof Preferences>(
  key: K,
  value: Preferences[K],
) => void;

export function SettingsStar({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`settings-star ${className}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path d="M16 1 C17.7 12.2 19.8 14.3 31 16 C19.8 17.7 17.7 19.8 16 31 C14.3 19.8 12.2 17.7 1 16 C12.2 14.3 14.3 12.2 16 1Z" />
    </svg>
  );
}

function StarSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={`settings-switch ${checked ? "on" : ""}`}
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
    >
      <span className="settings-switch-dot" />
      <span className="settings-switch-handle">
        <SettingsStar />
      </span>
    </button>
  );
}

function SettingsSection({
  id,
  title,
  english,
  action,
  children,
}: {
  id: string;
  title: string;
  english: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="settings-section" aria-labelledby={id}>
      <div className="settings-section-heading">
        <SettingsStar />
        <h3 id={id}>{title}</h3>
        <span>{english}</span>
        {action}
      </div>
      <div className="settings-section-body">{children}</div>
    </section>
  );
}

export function StarSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="settings-slider-row">
      <span className="settings-label">
        {label}
        <small>{description}</small>
      </span>
      <span
        className="settings-range"
        style={{ "--range-value": `${value}%` } as CSSProperties}
      >
        <span className="settings-range-track" aria-hidden="true">
          <span className="settings-range-ticks">
            {[0, 20, 40, 60, 80, 100].map((tick) => (
              <i key={tick} className={tick <= value ? "lit" : ""} />
            ))}
          </span>
          <SettingsStar className="settings-range-star" />
        </span>
        <input
          aria-label={label}
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
      <output aria-label={`${label}数值`}>{value}</output>
    </label>
  );
}

const qualities: { value: Quality; label: string }[] = [
  { value: "high", label: "完整" },
  { value: "medium", label: "平衡" },
  { value: "low", label: "简洁" },
  { value: "off", label: "关闭" },
];

export default function SettingsPanel({
  preferences,
  change,
  systemReduced,
  fullscreen,
  fullscreenAvailable = true,
  fullscreenActive = false,
  additionalOptions,
}: {
  preferences: Preferences;
  change: ChangePreference;
  systemReduced: boolean;
  fullscreen: () => void;
  fullscreenAvailable?: boolean;
  fullscreenActive?: boolean;
  additionalOptions?: ReactNode;
}) {
  const id = `settings-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className="settings-experience" data-reduced={preferences.reduced || systemReduced}>
      <svg
        className="settings-orbits"
        viewBox="0 0 1480 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M-40 50 C60 105 155 78 180 -30 M-30 88 C70 140 175 100 205 -30 M1370 -30 C1310 130 1370 263 1510 285 M1350 -30 C1270 188 1375 359 1510 386" />
        <path
          className="settings-orbit-dots"
          d="M1405 -30 C1340 154 1400 255 1510 280"
        />
      </svg>
      <aside className="settings-intro">
        <p className="settings-kicker">THE LIGHT WE KEEP</p>
        <h2>体验设置</h2>
        <p className="settings-english">LETTER EXPERIENCE</p>
        <span className="settings-intro-rule" />
        <p className="settings-poem">
          把动效调整到舒适的强度，
          <br />
          让这封信以最合适的方式，
          <br />
          抵达你的阅读时光。
        </p>
      </aside>
      <div className="settings-pane">
        <SettingsSection
          id={`${id}-visual`}
          title="星光表现"
          english="VISUAL EFFECTS"
        >
          <div className="settings-control-row">
            <span className="settings-label">
              UI 特效质量<small>由应用接收并保存设置。</small>
            </span>
            <div
              className="settings-quality"
              role="group"
              aria-label="UI 特效质量"
            >
              {qualities.map(({ value, label }) => (
                <button
      type="button"
                  key={value}
                  className={preferences.quality === value ? "active" : ""}
                  aria-pressed={preferences.quality === value}
                  onClick={() => change("quality", value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-control-row">
            <span className="settings-label">
              减少动态<small>降低界面动效强度，获得更平静的体验。</small>
            </span>
            <StarSwitch
              label="减少动态"
              checked={preferences.reduced}
              onChange={() => change("reduced", !preferences.reduced)}
            />
          </div>
          {systemReduced && (
            <p className="settings-system-note">
              当前系统已开启减少动态；应用应同步减少界面动效。
            </p>
          )}
        </SettingsSection>
        <SettingsSection
          id={`${id}-sound`}
          title="声音记录"
          english="SOUND"
          action={
            <div className="settings-sound-action">
              <span>声音</span>
              <StarSwitch
                label="声音"
                checked={preferences.sound}
                onChange={() => change("sound", !preferences.sound)}
              />
            </div>
          }
        >
          <StarSlider
            label="环境音量"
            description="调整应用接入的背景声音"
            value={preferences.bgm}
            onChange={(value) => change("bgm", value)}
          />
          <StarSlider
            label="音效音量"
            description="调整应用接入的音效"
            value={preferences.se}
            onChange={(value) => change("se", value)}
          />
        </SettingsSection>
        <SettingsSection
          id={`${id}-reading`}
          title="阅读方式"
          english="READING"
        >
          <StarSlider
            label="文字速度"
            description="对白逐字显现"
            value={preferences.textSpeed}
            onChange={(value) => change("textSpeed", value)}
          />
          <p className="settings-system-note">文字显示与自动阅读的实际行为由应用处理。</p>
        </SettingsSection>
        <SettingsSection
          id={`${id}-display`}
          title="显示选项"
          english="DISPLAY"
        >
          <div className="settings-control-row settings-display-row">
            <span className="settings-label">
              全屏体验
              <small>
                由应用提供全屏能力，可根据运行环境禁用。
              </small>
            </span>
            <button type="button" className="settings-fullscreen" onClick={fullscreen} disabled={!fullscreenAvailable} aria-pressed={fullscreenActive} title={fullscreenAvailable ? undefined : '当前环境暂不支持全屏'}>
              <span>
                {fullscreenActive ? '退出全屏' : '进入全屏'} <b aria-hidden="true">↗</b>
              </span>
              <small>FULLSCREEN</small>
            </button>
          </div>
          {additionalOptions}
        </SettingsSection>
      </div>
    </div>
  );
}
