# Content License / 内容授权范围

本仓库按实际文件分别说明许可，仓库可访问性不等于获得独立复用许可。

## 原创代码

以下文件由项目权利人确认可按根目录 [LICENSE](LICENSE) 的标准 MIT License 授权，公开署名为「星屑信项目贡献者」：

| 文件 | 用途 |
| --- | --- |
| `src/ui-primitives/keyboardNavigation.ts` | 区分键盘与指针导航的 React Hook |
| `src/ui-primitives/frameActivity.ts` | 多层界面的遮挡与暂停状态 Hook |
| `src/ui-primitives/readingModes.ts` | 阅读模式类型与判断 |
| `src/ui-primitives/starVisuals.ts` | 可复现随机数和星形轮廓生成 |
| `src/ui-primitives/audio.ts` | 浏览器内合成的界面提示音与背景和音 |
| `src/ui-primitives/resources.tsx` | React 资源路径与挂载容器上下文 |
| `src/ui-primitives/useStartTransition.ts` | 可取消、避免重复启动的画面切换 Hook |
| `src/ui-primitives/ThreadInteraction.tsx` | 指针拨动曲线的共享交互场与 Hook |
| `src/ui-primitives/AnimatedThread.tsx` | 可绘制、可弯曲的 SVG 曲线组件 |
| `src/ui-primitives/StarGlyph.tsx` | SVG 星形定义与可配置的装饰星 |
| `src/ui-primitives/StarMenuButton.tsx` | 支持指针、键盘和充能反馈的星形菜单按钮 |
| `src/ui-primitives/Meteors.tsx` | 根据容器尺寸与质量设置绘制流星 |
| `src/ui-primitives/ReadingModeControls.tsx` | 受控的阅读样式切换按钮 |
| `src/ui-primitives/visualTypes.ts` | 独立的视觉质量类型 |
| `src/ui-primitives/preferences.ts` | 偏好类型、默认值与输入校验 |
| `src/ui-primitives/SettingsPanel.tsx` | 受控的偏好面板、星形开关与滑块 |
| `src/ui-primitives/SettingsModal.tsx` | 支持焦点循环和退出清理的原生设置弹窗 |
| `src/ui-primitives/ArchiveFrame.tsx` | 可配置分页、保存能力与暂停状态的存档展示框架 |
| `src/ui-primitives/MemoryCard.tsx` | 由调用方提供数据与操作的信笺卡片 |
| `src/ui-primitives/MemoryThumbnail.tsx` | 支持缺图与加载失败回退的缩略图 |
| `src/ui-primitives/archiveTypes.ts` | 存档模式与展示记录类型，不包含游戏进度 |
| `src/ui-primitives/styles.css` | 上述组件使用的独立样式与程序动效 |
| `src/ui-primitives/index.ts` | 模块导出入口 |
| `src/README.md` | 随代码提供的接口与使用说明 |
| `tools/build.mjs`、`tools/README.md` | 代码编译、样式复制及工具使用说明 |
| `package.json`、`package-lock.json`、`tsconfig.json` | 代码包、依赖锁定与类型检查／编译配置 |

未列入的文件不因位于本仓库而自动采用 MIT。
第三方依赖遵循自身许可；Studio SDK、默认模板与运行时不在本项目的 MIT 授权范围内。

## 游戏创作内容与项目文档

`content-preview/`、`showcase/`、`music-preview/` 中的故事、人物、图片、音频，以及未另行开放许可的介绍文档，不属于 MIT。
对于项目依法享有版权的原创表达，除文件另有许可外，保留全部适用权利。
公开浏览或正常 GitHub 平台操作不表示授予独立商业复用、重新发行、制作衍生游戏或再授权的许可。
AI 生成内容中不受著作权保护的元素、第三方依法享有的权利，不因本声明改变。

当前公开的作品与人物介绍位于 `content-preview/story/`、`content-preview/characters/`，属于游戏创作内容，不适用 MIT；公开范围不包含完整剧本、内部人物档案或路线设定。

当前选择公开的四位女主标准立绘展示版位于 `showcase/sprites/`，文字与图片的具体文件见 [ASSET_REGISTER.md](ASSET_REGISTER.md)。
这些图片供本项目浏览展示，未授予独立再利用许可；原始透明制作图和完整差分不在公开范围内。

## 第三方内容

第三方组件、素材、字体、音效及运行时遵循自身许可证。本项目不对其重新授予 MIT。
实际公开或随游戏发行的第三方文件会列入 `THIRD_PARTY_NOTICES.md`。

## 游戏版本

免费游戏的下载、安装与游玩条件，以具体版本随附说明及适用素材授权为准。
需要超出通常许可范围使用受保护的内容时，应先获得相关权利人的许可。
