# 通用 UI 模块

本说明与 `ui-primitives/` 中的程序按根目录 [MIT License](../LICENSE) 授权，署名为「星屑信项目贡献者」。
这里只提取不依赖 Studio SDK 的独立模块，不包含完整游戏 UI、剧情或制作素材。

## 安装与检查

在仓库根目录运行 `npm ci`、`npm run check`、`npm run build`。
产物位于 `dist/ui-primitives/`，不纳入 Git。React 18／19 由使用该模块的应用提供；本仓库的开发依赖固定为 React 19.3.0。
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

两个 Hook 需要 React 和浏览器 DOM。`useFrameCovered` 不直接控制画面渲染，也不适用于服务端渲染。
React 应用中的元素挂载后应通过状态更新传入实际 `HTMLElement`，而不是只修改一个不会触发重渲染的 ref。

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

以上模块保持现行工程中的行为。类型检查和纯函数运行抽查已完成；Hook 的浏览器交互仍需在使用者的实际界面中验证。
