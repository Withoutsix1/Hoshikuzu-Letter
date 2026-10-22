# 星屑信 Studio UI 扩展源码

本目录提供项目原创 UI 扩展的完整软件源码：标题与星图、来信动效、阅读页、选项原型、工具栏、历史、设置、画廊、存读档、截图、转场、粒子效果及引擎接入代码。软件与本说明按根目录 [MIT License](../LICENSE) 授权，署名为「星屑信项目贡献者」。

它与 [通用模块](../src/README.md) 分开构建。通用模块不依赖 Studio；本目录保留 Studio 接入方式和对应的整套布局，适合研究或在自有工程中集成。

## 构建

使用 Node.js 22 或更新版本，在本目录运行 `npm ci`。依赖版本由本目录独立的 `package-lock.json` 锁定，Studio SDK不在依赖包中，也不从仓库下载。

通过官方渠道另行取得与你的 Studio 版本匹配的 SDK，将环境变量 `HOSHIKUZU_STUDIO_SDK` 指向其 `index.ts` 入口。例如在 PowerShell 中，将下方相对路径替换为你自己的 SDK 位置：

```powershell
$env:HOSHIKUZU_STUDIO_SDK = (Resolve-Path '../studio-sdk/index.ts').Path
npm run check
npm run build
```

`check` 与 `build` 都会先生成 `src/theme.css`；它由六份已公开的源样式生成，不纳入Git。类型检查使用临时配置引用你提供的SDK；构建后SDK、React及React DOM仍是外部依赖，代码由Studio宿主加载。输出在 `dist/`，不提交到仓库。运行依赖的原许可证随构建复制到 `dist/LICENSES/`，索引为 `dist/THIRD_PARTY.json`。

测试基准为 SDK 1.11.0。`engineBridge.ts`、截图与恢复辅助代码使用对应版本的宿主接口；接入其他版本时需要复核这些接口。没有SDK时，构建脚本会明确说明缺少的前置条件。

## 游戏内容与素材接口

[projectData.ts](src/projectData.ts) 提供可选内容输入：演示对白、场景介绍、旧存档位置映射和逐句语音增益表。公开版本默认为空；没有旧存档映射时，读取走宿主的常规存档接口，没有增益规则时保持正常音量。原项目台词、剧情节点ID与配音校准记录未复制进来。

实际游玩对白、历史、进度、选择、存档与图片解锁记录由Studio宿主传入；公开源码包含这些数据的处理逻辑，不包含真实玩家存档、路线脚本或预先解锁的数据。两份 `ui/` 布局中的预览文字已换为中性的示例。

媒体文件不随源码提供。现有资源接口使用下列逻辑文件名；集成者需要提供自己有权使用的素材，或修改资源解析与对应样式：

| 用途 | 逻辑资源名 |
| --- | --- |
| 标题背景 | `assets/observatory-sky.png`、`assets/title-starfield.png` |
| 标题图标 | `assets/title-gold-transparent.png`，默认文字标题不依赖它 |
| 存档背景 | `assets/archive-valley.png` |
| 存档边框 | `assets/archive-empty-frame.png`、`assets/archive-filled-frame.png` |
| 历史边框 | `assets/log-panel-transparent.png` |
| 环境视频 | `assets/fx_stardust_loop.webm`，关闭效果时不加载 |

源码构建不会生成图片、音乐或完整游戏包。本目录未包含完整Studio游戏工程、专有运行时、SDK源码、第三方扩展或素材制作工作流。第三方软件分别遵循自身许可证，见 [第三方声明](../THIRD_PARTY_NOTICES.md)。

## 入口与组织

- `src/index.tsx`、`extension.json`：扩展注册、保存字段、设置与方法入口。
- `TitleScreen`、`LetterScreen`、`ToolbarScreen`、`SaveScreen`、`SettingsScreen`、`HistoryScreen`、`GalleryScreen`：宿主界面接入。
- `ChoiceScreen`、`Causal`：选择界面与可复用的双分支交互原型；接入者按自己的宿主槽位注册使用。
- `ReadingPage`、`TitleMenu`、`StoryStars` 等：完整布局与程序视觉效果。
- `engineBridge`、`useEngineReading`、`nativeReadingReplacement`、`nativeRenderActivity`：宿主状态和原生画面的协调。
- `loadStoryArchive`、`readingSnapshot`、`storyTransition`：恢复、截图及跨界面转场。
- `scripts/build-theme.mjs`、`scripts/project.mjs`：样式生成、类型检查、构建与依赖许可收集。

本目录保留完整宿主接入版本；`src/ui-primitives/` 则提供经过独立使用适配的接口。两者分别维护，不应混用内部类型或样式。

验证包含使用真实SDK的类型检查及完整构建，以及合成宿主下的选项、阅读、历史、保存和转场交互检查。完整游戏运行、真实语音与媒体以及其他SDK版本仍需在接入工程中验证。
