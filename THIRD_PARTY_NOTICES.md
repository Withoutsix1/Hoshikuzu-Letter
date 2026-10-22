# Third-Party Notices / 第三方声明

当前纳入 Git 的公开文件未收录第三方软件源码、素材、字体、音频或运行时，也未提供游戏发行包。
当前没有独立打包分发的第三方文件；通过包管理器安装的依赖保留其自身许可，不属于本项目的 MIT 再授权。
新增实际分发文件时，应填写文件路径、作者、原始素材页、许可证链接、修改情况与必要署名；不能仅凭网站名称标记为已审核。

## 代码依赖

下表依据锁定版本的包元数据记录；依赖文件由使用者安装，不提交到本仓库。

| 包 | 本地验证版本 | 用途 | 原许可证 |
| --- | --- | --- | --- |
| `react` | 19.3.0 | 组件与 Hook 的运行依赖；声明兼容 React 18／19 | MIT |
| `react-dom` | 19.3.0 | React 的浏览器渲染与动画依赖 | MIT |
| `scheduler` | 0.28.0 | React DOM 的间接依赖 | MIT |
| `motion` | 14.0.0 | 画面切换与曲线动画 | MIT |
| `framer-motion`、`motion-dom`、`motion-utils` | 14.0.0 | Motion 的间接依赖 | MIT |
| `tslib` | 2.8.1 | Motion 的间接依赖 | 0BSD |
| `@types/react` | 19.3.0 | 开发时类型定义 | MIT |
| `csstype` | 3.2.3 | React 类型定义的间接依赖 | MIT |
| `typescript` | 5.9.3 | 类型检查和编译 | Apache-2.0 |

版本和来源固定在 `package-lock.json`；原始许可证随各依赖包提供。React 18 的实际交互行为尚未单独验证。

## 角色展示图

本仓库的四张角色展示图由项目作者声明为原创，使用 image2.5 与 Nano Banana 官方服务交替完成。
逐文件来源说明见 [ASSET_REGISTER.md](ASSET_REGISTER.md)，图片遵循 [CONTENT_LICENSE.md](CONTENT_LICENSE.md) 的项目内容规则，不采用代码的 MIT License。

## LetsGal Studio

《星屑信》使用 LetsGal Studio 制作。软件本体、SDK、专有运行时、默认模板、默认资源及第三方扩展的权利归各自权利人所有。
本公开目录不包含上述文件，也不对其授予 MIT License。游戏制作或发行的许可不自动成为这些组件源码的再授权。
