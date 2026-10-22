# 通用 UI 模块

本说明与 `ui-primitives/` 中的程序按根目录 [MIT License](../LICENSE) 授权，署名为「星屑信项目贡献者」。
当前提供 22 个不依赖 Studio SDK 的独立模块，附公共视觉与展示数据类型和独立样式，用于在其他界面中组合使用。

## 安装与检查

在仓库根目录运行 `npm ci`、`npm run check`、`npm run build`。
JavaScript、类型声明和 `styles.css` 产物位于 `dist/ui-primitives/`，不纳入 Git。React／React DOM 18 或 19、Motion 14 由使用该模块的应用提供；本仓库验证版本固定为 React／React DOM 19.3.0、Motion 14.0.0。
当前代码包设置为 `private`，用于本地集成，不会发布到包注册表。

## 接口

| 接口 | 用途与约定 |
| --- | --- |
| `isReadingMode(value)`、`ReadingMode` | 只接受 `normal` 或 `special`，适合验证未知输入 |
| `starRandom(seed)` | 相同种子得到相同的伪随机序列，返回值在 `[0, 1)`；仅用于视觉效果，不用于安全用途 |
| `irregularStar(random)` | 接受返回 `[0, 1)` 的随机函数，生成 CSS `clip-path: polygon(...)` 的坐标内容 |
| `STAR_FLARE_PATH` | 适用于 `viewBox="0 0 96 96"` 的 SVG 路径 |
| `useKeyboardNavigation(clearFocus)` | 返回记录键盘导航状态的 ref；指针按下时复位并调用 `clearFocus`；卸载时移除监听 |
| `useFrameCovered(root, transparent)` | 后注册的不透明层会遮住前层，任意后层会暂停前层；调用方应按实际堆叠顺序注册，并自行使用返回的 `covered`／`paused` 状态 |
| `setSoundscape(enabled, volume)` | 用 Web Audio 合成持续和音；音量按 0–100 传入，关闭时停止持续振荡器 |
| `playSfx(kind, enabled, volume)` | 合成 `hover`／`click`／`open`／`reward` 短提示音；悬停音限制连续触发频率 |
| `ResourceProvider`、`useResource()` | 向 React 子树提供 `url(path)` 与 `portal`；未提供上下文时，路径默认为 `./` 加原路径，容器为 `null` |
| `useStartTransition(commit, reduced)` | 返回遮罩透明度、模糊滤镜、阶段、启动与取消接口；同一次切换结束前拒绝重复启动 |
| `startTransitionTiming` | 遮黑、渐亮、延迟聚焦与聚焦时长，单位为秒 |
| `ThreadInteraction`、`useBendingThread(path)` | 用同一个指针监听与按需动画循环，轻微拨动子树内注册的曲线；禁用时还原路径 |
| `AnimatedThread` | 根据 `drawn` MotionValue 绘制曲线，并在交互场内响应指针；`drawn=1` 时移除虚线 |
| `StarShapeDefinition({ id })` | 在 SVG 的 `defs` 中定义星形；调用方提供唯一 `id`，使用 `0 0 96 96` 坐标系 |
| `ConstantStar` | 按百分比位置、颜色、层次与延迟绘制装饰星；`reduced` 关闭入场渐变和 CSS 呼吸 |
| `StarMenuButton` | 使用调用方提供的编号、标题、副标题与回调；`paused` 禁用按钮并重置充能，`reduced` 去除位移、呼吸与爆散 |
| `Meteors({ quality, reduced })`、`Quality` | `high` 显示 3 条流星，`medium` 显示 2 条，`low`／`off` 或 `reduced=true` 时不渲染；随容器尺寸更新轨迹 |
| `ReadingModeControls({ mode, change })` | 由调用方保存 `ReadingMode`，点击时请求切换 `normal`／`special`，同步显示 `aria-pressed` |
| `Preferences`、`defaultPreferences`、`isPreferences(value)` | 偏好类型、默认值与运行时校验；质量须为四个有效值，音量和文字速度须为有限的 0–100 数值 |
| `SettingsPanel`、`ChangePreference` | 受控的质量、声音、文字速度和全屏设置面板；通过类型化回调将变更交给应用 |
| `SettingsStar`、`StarSlider` | 可独立使用的装饰星与带数值显示的滑块；滑块输入范围为 0–100 |
| `SettingsModal({ close, reduced, children })` | 原生模态设置窗口；处理背景隔离、键盘循环、退出动画、焦点返回与页面滚动恢复 |
| `ArchiveFrame`、`ArchiveMode` | 受控的保存／读取模式、分页与暂停容器；由调用方提供卡片子元素 |
| `MemoryCard`、`ArchiveEntry` | 展示时间、摘要和可选缩略图，通过 `activate` 请求应用处理操作 |
| `MemoryThumbnail({ snapshot, alt })` | 显示调用方提供的缩略图；缺图或加载失败时显示程序占位图形 |
| `Gallery`、`Artwork`、`ArtworkCategory`、`GalleryCategory` | 分类、分页和图片卡片；图片地址与文字由调用方提供 |
| `ArtworkViewer({ artwork, close, reduced, number })` | 可独立使用的原生大图模态窗口 |
| `GalleryImage({ src, alt, className, loading })` | 默认延迟加载图片；空地址或加载失败时显示带替代说明的占位 |

交互 Hook 需要 React 和浏览器 DOM。`useFrameCovered` 不直接控制画面渲染，也不适用于服务端渲染。
React 应用中的元素挂载后应通过状态更新传入实际 `HTMLElement`，而不是只修改一个不会触发重渲染的 ref。

`useStartTransition`、曲线交互与 `AnimatedThread` 使用 Motion。`audio.ts` 使用浏览器的 `AudioContext`，现场生成声音，不读取或附带音频素材。

## 使用示例

编译后可在 Node.js 或前端应用中使用纯函数：

```js
import { isReadingMode, starRandom, irregularStar } from './dist/ui-primitives/index.js';

const input = 'normal';
const mode = isReadingMode(input) ? input : 'normal';
const clipPath = `polygon(${irregularStar(starRandom('menu-star'))})`;
```

React 组件中的层状态示例：

```tsx
import { useCallback, useState } from 'react';
import { useFrameCovered, useKeyboardNavigation } from './dist/ui-primitives/index.js';

function Layer() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const clearFocus = useCallback(() => { /* 清除应用自己的焦点外观 */ }, []);
  const keyboard = useKeyboardNavigation(clearFocus);
  const { covered, paused } = useFrameCovered(root, false);
  return (
    <div ref={setRoot} hidden={covered} data-paused={paused}>
      <button onFocus={() => { if (keyboard.current) { /* 显示键盘焦点 */ } }}>
        继续
      </button>
    </div>
  );
}
```

## 画面切换

`useStartTransition(commit, reduced)` 的 `start()` 在遮罩完全不透明后调用同步的 `commit`，随后渐亮并恢复清晰。调用方应将 `opacity`、`filter` 接到自己的 Motion 遮罩与画面，并在 `active` 期间锁定画面操作。

```tsx
const transition = useStartTransition(() => setScreen('reading'), reduced);
const accepted = transition.start(); // 正在切换时返回 false
// transition.cancel() 可中断切换并重置动画值。
```

此 Hook 不等待异步加载；需先准备好数据，再用同步回调切换画面。`reduced=true` 关闭模糊，仍保留渐变时长与操作锁定。组件卸载会停止播放中的动画。

## 曲线交互

路径只支持绝对坐标的 `M`、`C` 指令；传入完整的三次贝塞尔曲线，坐标系应与 `width`／`height` 一致。尺寸需大于零。触摸指针不会触发拨动。

```tsx
import { useMotionValue } from 'motion/react';
import { AnimatedThread, ThreadInteraction } from './dist/ui-primitives/index.js';

function ThreadExample({ reduced }: { reduced: boolean }) {
  const drawn = useMotionValue(1);
  return (
    <div style={{ position: 'relative', width: 600, height: 360 }}>
      <ThreadInteraction disabled={reduced} width={1000} height={600}>
        <svg viewBox="0 0 1000 600" width="100%" height="100%" fill="none" stroke="#a8caff">
          <AnimatedThread path="M100 300 C300 100 700 500 900 300" drawn={drawn} className="example-thread" />
        </svg>
      </ThreadInteraction>
    </div>
  );
}
```

导入下文的独立样式并将示例放入 `hoshikuzu-primitives` 容器后，测量层已具备必要定位。单独使用逻辑时，也可以自行提供以下样式。曲线的颜色、粗细和其他外观由应用设置。

```css
.thread-interaction-plane {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
```

在交互场之外，`useBendingThread` 保持输入路径。禁用交互、指针离开或组件卸载时会清理对应动画与监听。

## 界面提示音与资源上下文

在用户点击等手势中调用 `playSfx('click', true, 35)`，以符合浏览器的声音启动规则。持续和音由 `setSoundscape(true, 35)` 开启；界面离开或静音时，调用方应显式执行 `setSoundscape(false, 0)`。两者在同一模块实例中共享音频上下文。

资源上下文可用于为组件注入应用自己的资源地址转换函数与挂载容器：

```tsx
<ResourceProvider value={{ url: path => `/media/${path}`, portal: overlayRoot }}>
  <YourInterface />
</ResourceProvider>
```

子组件通过 `useResource()` 取得对应的 `url` 和 `portal`；这里只传递容器，不自动创建 Portal。

基础逻辑已通过类型检查、编译和 DOM 模拟环境下的重复启动、取消、卸载清理、曲线回弹及音频控制验证。可视组件、曲线交互、画面切换、设置面板、弹窗、存档展示和画廊组件另通过了 Edge 桌面与手机尺寸检查，覆盖鼠标、键盘、触摸、减少动效、样式隔离和焦点恢复。实际听感、React 18 及其他浏览器行为尚未单独验证。

## 独立视觉组件与样式

在支持 CSS 导入的前端构建环境中，导入编译后的样式，并为使用这些组件的区域添加 `hoshikuzu-primitives` 容器。样式和动画名称均有命名范围，未附带外部字体、图片或音频文件。

```tsx
import './dist/ui-primitives/styles.css';
import { useState } from 'react';
import { ConstantStar, Meteors, ReadingModeControls, StarMenuButton, type ReadingMode } from './dist/ui-primitives/index.js';

function VisualExample({ paused, reduced }: { paused: boolean; reduced: boolean }) {
  const [mode, setMode] = useState<ReadingMode>('normal');
  return (
    <div className={`hoshikuzu-primitives ${paused ? 'ambient-paused' : ''}`}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <StarMenuButton number="01" label="PREVIEW" subtitle="预览"
          paused={paused} reduced={reduced}
          onHover={() => {}} onClick={() => { /* 打开应用自己的界面 */ }}
          onCharged={() => { /* 单次充能完成 */ }} />
      </div>
      <div aria-hidden="true" style={{ position: 'relative', height: 220 }}>
        <ConstantStar starId="example-blue" color="#8dbdff" white
          x={45} y={50} layer={0} delay={0} reduced={reduced} />
        <Meteors quality="high" reduced={reduced} />
      </div>
      <ReadingModeControls mode={mode} change={setMode} />
    </div>
  );
}
```

包路径方式也可使用 `@hoshikuzu-letter/ui-primitives/styles.css`；该导出指向同一份构建样式。页面整体布局、背景与组件尺寸由应用提供。装饰星和流星的父层需要相对定位和非零尺寸。

`StarMenuButton` 的 `onClick` 负责实际操作；充能只触发可选的 `onCharged`，不会代替点击。触摸点击可以激活按钮，不触发悬停充能。组件使用 `type="button"`，放入表单不会提交。

暂停时，将 `paused` 传给菜单按钮，并为容器添加 `ambient-paused` 类以暂停装饰星与流星的 CSS 动画。减少动效时，将 `reduced` 同时传给相关组件；应用可根据自己的设置或 `prefers-reduced-motion` 决定此值。

上述可视组件为独立使用增加了按钮类型、暂停禁用与减少动效属性；流星的质量类型已从原先混合数据模型中单独提取。未迁入完整标题菜单布局或剧情阶段数据。

## 设置面板与弹窗

`SettingsPanel` 接收完整的 `preferences` 和 `change(key, value)` 回调。调用方负责保存偏好，并将音量、文字速度、质量与全屏请求接入应用的对应能力。初始化时复制 `defaultPreferences`，从存储等位置读取未知数据时可先用 `isPreferences` 校验。

```tsx
import { useState } from 'react';
import './dist/ui-primitives/styles.css';
import { defaultPreferences, SettingsPanel, SettingsModal, type ChangePreference, type Preferences } from './dist/ui-primitives/index.js';

function SettingsExample({ systemReduced }: { systemReduced: boolean }) {
  const [preferences, setPreferences] = useState<Preferences>(() => ({ ...defaultPreferences }));
  const [open, setOpen] = useState(false);
  const change: ChangePreference = (key, value) => setPreferences(current => ({ ...current, [key]: value }));
  return (
    <div className="hoshikuzu-primitives">
      <button type="button" onClick={() => setOpen(true)}>设置</button>
      {open && (
        <SettingsModal reduced={preferences.reduced || systemReduced} close={() => setOpen(false)}>
          <SettingsPanel preferences={preferences} change={change} systemReduced={systemReduced}
            fullscreenAvailable={false} fullscreen={() => {}} />
        </SettingsModal>
      )}
    </div>
  );
}
```

面板也可以直接放入页面。`fullscreenAvailable` 决定全屏按钮是否可用，`fullscreenActive` 表示当前状态，`fullscreen` 回调负责调用应用的全屏能力。`additionalOptions` 可追加应用自己的设置项。每个面板使用独立的标题 ID，允许在同页呈现多个实例。

`SettingsModal` 需要浏览器支持原生 `HTMLDialogElement.showModal()`。通过条件渲染挂载弹窗，在 `close` 回调中移除它；窗口打开期间会隔离背景操作并锁定页面滚动。返回按钮、Escape 与遮罩点击都能关闭，Tab／Shift+Tab 在可用控件之间循环，折叠区域内的隐藏控件不会进入循环。面板内部点击会保持窗口打开。

`reduced=true` 时立即关闭；其他情况下等待 0.3 秒退出动画后通知 `close`。重复关闭只通知一次；外部卸载也会清理滚动锁和恢复可返回的焦点。应用应将 `preferences.reduced || systemReduced` 同步传给需要减少动效的其他组件。

偏好校验覆盖有效质量值、布尔开关和有限的数值范围，不要求数值为整数。滑块输入按步长 1 提交数值，调用方传入的 `value` 应在 0–100 内。实际声音、文字显现和浏览器全屏能力须在接入应用后验证。


## 存档展示

`ArchiveFrame` 负责模式与分页界面；`MemoryCard` 只展示传入的 `ArchiveEntry`。`savedAt` 建议使用带时区的 ISO 时间字符串，`excerpt` 为纯文本；`chapterLabel`、`speaker`、`thumbnail` 均可省略。数据中没有引擎状态、剧情行号或路线字段。

```tsx
import { useState } from 'react';
import './dist/ui-primitives/styles.css';
import { ArchiveFrame, MemoryCard, type ArchiveEntry, type ArchiveMode } from './dist/ui-primitives/index.js';

function ArchiveExample({ entries, pageCount, saveEnabled, paused, reduced, operate }: {
  entries: (ArchiveEntry | null)[][];
  pageCount: number;
  saveEnabled: boolean;
  paused: boolean;
  reduced: boolean;
  operate: (mode: ArchiveMode, page: number, slot: number) => void;
}) {
  const [mode, setMode] = useState<ArchiveMode>('load');
  const [page, setPage] = useState(0);
  const slots = entries[page] ?? Array<ArchiveEntry | null>(6).fill(null);
  return (
    <div className="hoshikuzu-primitives">
      <ArchiveFrame mode={mode} changeMode={setMode} saveEnabled={saveEnabled}
        paused={paused} reduced={reduced} page={page} pageCount={pageCount} changePage={setPage}>
        {slots.map((snapshot, slot) => (
          <MemoryCard key={`${page}-${slot}`} snapshot={snapshot} index={page * 6 + slot}
            mode={mode} reduced={reduced} hover={() => {}}
            activate={() => operate(mode, page, slot)} />
        ))}
      </ArchiveFrame>
    </div>
  );
}
```

页码与卡片编号从 0 开始传入，显示时加 1。`pageCount` 默认为 5；非正安全整数按 1 页显示。框架将当前页限制在有效范围，超过 7 页时只显示首尾和当前页附近的按钮，不创建全部页码；调用方仍须同步自己的页码和数据，尤其在页数减少时。桌面布局适合每页 6 张卡片，视口宽度不超过 720px 时切为单列。

`paused` 禁用模式、分页和子区域内的原生表单控件，并暂停装饰动画。`saveEnabled=false` 禁用保存模式按钮；当前处于保存模式时也禁用卡片区域。卡片自身的 `disabled` 可单独禁用某个槽位，读取模式下空卡片自动禁用。自定义子元素的非原生交互须由应用自行锁定。

卡片的 `hover` 仅响应可操作状态下的非触摸指针，`activate` 仅通知应用；所有按钮使用 `type="button"`。将 `reduced` 同时传给框架与卡片可关闭呼吸动画、悬停位移和过渡。卡片需要浏览器支持 `ResizeObserver`，卸载时清理尺寸监听。

时间默认按 `zh-CN` 和 `Asia/Hong_Kong` 显示，可用 `locale`／`timeZone` 覆盖；无效日期显示“时间未知”，无效格式选项回退为 ISO 时间。缩略图直接使用调用方提供的地址，空值或加载失败时显示占位；更换为新地址后会重新加载。单独使用 `MemoryThumbnail` 时，父元素应提供相对定位及尺寸，也可用 `alt` 指定替代文字。

边框由 CSS 绘制，不附带制作 PNG、截图或实际存档。持久化、截图生成、覆盖确认、保存失败处理与游戏恢复由应用实现；`saveEnabled` 只控制界面，应用仍应在执行回调时检查自己的保存条件。


## 画廊与大图窗口

`Gallery` 接受 `Artwork[]`，按 `scenery`（场景图）与 `cg`（剧情 CG）分类，每页显示最多两张卡片。图片对象包含唯一的 `id`、`title`、`en`（副标题）、`category`、`src`、`alt` 和 `description`。文字按普通文本显示，地址直接交给浏览器加载；可传入应用自己的资源地址。

```tsx
import './dist/ui-primitives/styles.css';
import { Gallery, type Artwork } from './dist/ui-primitives/index.js';

function GalleryExample({ artworks, paused, reduced }: {
  artworks: Artwork[];
  paused: boolean;
  reduced: boolean;
}) {
  return (
    <div className="hoshikuzu-primitives">
      <Gallery artworks={artworks} paused={paused} reduced={reduced}
        open={artwork => { /* 图片窗口已请求打开，可记录浏览事件 */ }}
        hover={() => { /* 可选的界面提示反馈 */ }} />
    </div>
  );
}
```

分类与页码由组件维护，切换分类回到第一页；数据减少时自动收敛到有效页，正在查看的图片被移除时卸载大图窗口。页码超过7页时使用首尾及当前页附近的有限按钮窗口。`reservedPerCategory` 默认为0，不创建待收录槽位；需要占位时可传正整数，每类最多预留1000个。空列表显示空态和第1/1页。图片ID应在当前列表内唯一，传入的数据应只包含应用允许展示的图片。

`onReturn` 可选，传入后显示返回按钮。`open(artwork)` 通知图片打开请求，窗口由组件自身呈现；`hover` 用于分类/分页反馈及非触摸指针悬停。`paused` 禁用画廊的卡片、分类、页码和返回操作，并暂停装饰动画；已打开的大图仍可关闭。`reduced` 关闭装饰呼吸、图片缩放与界面过渡。视口不超过800px时按单列排版。

大图窗口也可单独使用：条件渲染 `ArtworkViewer`，在 `close` 回调中将其移除。`number` 为从1开始的展示编号，默认1。窗口需要原生 `dialog.showModal()`；打开后背景不可操作，初始焦点位于关闭按钮，Tab与Shift+Tab在关闭按钮及可滚动面板之间循环。Escape、关闭按钮或背景点击发出一次关闭通知，减少动效时立即关闭，其他情况等待退出动画。

设置与大图窗口共用按文档计数的滚动锁：嵌套窗口关闭后，底层窗口仍保持锁定；最后一层关闭或外部卸载会恢复原滚动设置，并按条件返回仍存在的焦点。说明较长时可滚动查看，关闭按钮保持在顶部。

`GalleryImage` 可单独使用，`loading` 默认为 `lazy`，大图窗口采用 `eager`。缺少地址或加载失败时显示“图片暂不可用”和替代说明；更换地址后重新加载。独立使用时由应用提供尺寸及样式。`modalLifecycle.ts` 为组件内部共用辅助程序，不从公共入口导出。

本组组件只提供浏览界面，不包含游戏图片、解锁条件、资源目录或SDK。图片权利与可展示范围、解锁状态和图片地址由应用管理。
