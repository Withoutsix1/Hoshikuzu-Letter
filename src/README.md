# 通用 UI 模块

本说明与 `ui-primitives/` 中的程序按根目录 [MIT License](../LICENSE) 授权，署名为「星屑信项目贡献者」。
当前提供 9 个不依赖 Studio SDK 的独立模块，用于在其他界面中组合使用。

## 安装与检查

在仓库根目录运行 `npm ci`、`npm run check`、`npm run build`。
产物位于 `dist/ui-primitives/`，不纳入 Git。React／React DOM 18 或 19、Motion 14 由使用该模块的应用提供；本仓库验证版本固定为 React／React DOM 19.3.0、Motion 14.0.0。
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

交互场中的测量层需要由应用提供以下定位样式。曲线的颜色、粗细和其他外观由应用自行设置。

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

本批迁移保留现行工程的行为，仅对相对导入补充 NodeNext 所需的 `.js` 后缀。已通过类型检查、编译和 DOM 模拟环境下的重复启动、取消、卸载清理、曲线回弹及音频控制验证。真实浏览器布局、实际听感与 React 18 行为尚未单独验证，接入应用后应再检查。
