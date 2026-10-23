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
| `src/ui-primitives/Gallery.tsx` | 由调用方提供图片的分类、分页与图景卡片界面 |
| `src/ui-primitives/ArtworkViewer.tsx` | 支持键盘、焦点返回与滚动恢复的原生大图窗口 |
| `src/ui-primitives/GalleryImage.tsx` | 图片展示与加载失败占位 |
| `src/ui-primitives/galleryTypes.ts` | 图片和画廊分类的展示类型 |
| `src/ui-primitives/modalLifecycle.ts` | 设置与大图窗口共用的焦点筛选和滚动锁辅助程序 |
| `src/ui-primitives/styles.css` | 上述组件使用的独立样式与程序动效 |
| `src/ui-primitives/index.ts` | 模块导出入口 |
| `src/README.md` | 随代码提供的接口与使用说明 |
| `tools/build.mjs`、`tools/README.md` | 代码编译、样式复制及工具使用说明 |
| `package.json`、`package-lock.json`、`tsconfig.json` | 代码包、依赖锁定与类型检查／编译配置 |

`studio-extension/` 中的原创源程序、软件配置、UI布局、源样式、构建脚本及代码使用说明也按标准 MIT 授权；范围包括宿主接入程序，但不扩展至另行取得的 SDK、运行时或第三方依赖。该目录没有附带游戏媒体、完整剧情或实际存档。详细覆盖见 [代码迁移覆盖](CODE_MIGRATION.md)。

未列入的文件不因位于本仓库而自动采用 MIT。
第三方依赖遵循自身许可；Studio SDK、默认模板与运行时不在本项目的 MIT 授权范围内。

## 游戏创作内容与项目文档

`content-preview/`、`showcase/`、`music-preview/` 中的故事、人物、图片、音频，以及未另行开放许可的介绍文档，不属于 MIT。
对于项目依法享有版权的原创表达，除文件另有许可外，保留全部适用权利。
公开浏览或正常 GitHub 平台操作不表示授予独立商业复用、重新发行、制作衍生游戏或再授权的许可。
AI 生成内容中不受著作权保护的元素、第三方依法享有的权利，不因本声明改变。

当前公开的作品与人物介绍位于 `content-preview/story/`、`content-preview/characters/`，属于游戏创作内容，不适用 MIT；公开范围不包含完整剧本、内部人物档案或路线设定。

当前选择公开的七张图片包括：`showcase/sprites/` 中四位女主标准立绘、`showcase/backgrounds/` 中两张校园背景、`showcase/cg/` 中一张课堂 CG。文字与图片的具体文件见 [ASSET_REGISTER.md](ASSET_REGISTER.md)。
这些图片均为缩小的项目展示版，未授予独立再利用许可；原始制作图、分层文件和完整差分不在公开范围内。

## 第三方内容

第三方组件、素材、字体、音效及运行时遵循自身许可证。本项目不对其重新授予 MIT。
实际公开或随游戏发行的第三方文件会列入 `THIRD_PARTY_NOTICES.md`。

## 游戏版本

免费游戏的下载、安装与游玩条件，以具体版本随附说明及适用素材授权为准。
需要超出通常许可范围使用受保护的内容时，应先获得相关权利人的许可。

## 音乐试听与游戏音频

`music-preview/` 中三段各约45秒的配乐试听为AI生成音乐的选定节选，不适用MIT，未另外授予独立采样、改编、商用或素材包再发行许可。游戏包中的音乐、配音和音效依各自来源及随包说明使用；OtoLogic音效适用CC BY 4.0，其许可权利优先于本项目对其他内容的限制。见 [音频来源说明](AUDIO_SOURCES.md)。
