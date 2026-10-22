# 原创代码迁移覆盖

截至本轮，既有73项代码／配置盘点已逐项处理，所有软件源码与必要配置均已公开。新增的两份原创UI布局也已纳入。

公开目录由两部分组成：

- [通用模块](src/README.md)：22个独立模块、公共类型、样式和构建工具。
- [完整Studio UI扩展源码](studio-extension/README.md)：完整布局、宿主接入、粒子、历史、选项、存读档、截图和转场等源码，包含独立依赖锁定与构建入口。

原盘点中的70项软件文件已加入完整源码包。其余3项已明确归类：生成样式由公开构建脚本重建；两个工程专属数据表通过公开的类型化配置接口提供，原数据保持私有。混合模型中的演示对白与场景文案也通过该接口由使用方提供，程序类型与处理逻辑已保留。

完整源文件不等于完整游戏：实际剧情、玩家存档、媒体素材、SDK和专有运行时仍由对应工程或宿主提供。软件许可范围见 [CONTENT_LICENSE](CONTENT_LICENSE.md)，第三方依赖见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md)。

| 原软件盘点项 | 处理结果 |
| --- | --- |
| `src/AnimatedThread.tsx` | [已公开源码](studio-extension/src/AnimatedThread.tsx) |
| `src/appearance.ts` | [已公开源码](studio-extension/src/appearance.ts) |
| `src/AppearanceControls.tsx` | [已公开源码](studio-extension/src/AppearanceControls.tsx) |
| `src/archive.css` | [已公开源码](studio-extension/src/archive.css) |
| `src/ArchiveFrame.tsx` | [已公开源码](studio-extension/src/ArchiveFrame.tsx) |
| `src/audio.ts` | [已公开源码](studio-extension/src/audio.ts) |
| `src/Causal.tsx` | [已公开源码](studio-extension/src/Causal.tsx) |
| `src/ChoiceScreen.tsx` | [已公开源码](studio-extension/src/ChoiceScreen.tsx) |
| `src/engineBridge.ts` | [已公开源码](studio-extension/src/engineBridge.ts) |
| `src/Frame.tsx` | [已公开源码](studio-extension/src/Frame.tsx) |
| `src/frameActivity.ts` | [已公开源码](studio-extension/src/frameActivity.ts) |
| `src/gallery.css` | [已公开源码](studio-extension/src/gallery.css) |
| `src/Gallery.tsx` | [已公开源码](studio-extension/src/Gallery.tsx) |
| `src/GalleryScreen.tsx` | [已公开源码](studio-extension/src/GalleryScreen.tsx) |
| `src/history.css` | [已公开源码](studio-extension/src/history.css) |
| `src/HistoryScreen.tsx` | [已公开源码](studio-extension/src/HistoryScreen.tsx) |
| `src/index.tsx` | [已公开源码](studio-extension/src/index.tsx) |
| `src/integration.css` | [已公开源码](studio-extension/src/integration.css) |
| `src/keyboardNavigation.ts` | [已公开源码](studio-extension/src/keyboardNavigation.ts) |
| `src/legacyDay01Positions.json` | 工程数据保持私有；读取接口见 `projectData.ts` |
| `src/letter.css` | [已公开源码](studio-extension/src/letter.css) |
| `src/Letter.tsx` | [已公开源码](studio-extension/src/Letter.tsx) |
| `src/LetterScreen.tsx` | [已公开源码](studio-extension/src/LetterScreen.tsx) |
| `src/loadStoryArchive.ts` | [已公开源码](studio-extension/src/loadStoryArchive.ts) |
| `src/MemoryCard.tsx` | [已公开源码](studio-extension/src/MemoryCard.tsx) |
| `src/MemoryThumbnail.tsx` | [已公开源码](studio-extension/src/MemoryThumbnail.tsx) |
| `src/Meteors.tsx` | [已公开源码](studio-extension/src/Meteors.tsx) |
| `src/MiniConstellations.tsx` | [已公开源码](studio-extension/src/MiniConstellations.tsx) |
| `src/model.ts` | [已公开源码](studio-extension/src/model.ts) |
| `src/nativeReadingReplacement.ts` | [已公开源码](studio-extension/src/nativeReadingReplacement.ts) |
| `src/nativeRenderActivity.ts` | [已公开源码](studio-extension/src/nativeRenderActivity.ts) |
| `src/openingSession.ts` | [已公开源码](studio-extension/src/openingSession.ts) |
| `src/Particles.tsx` | [已公开源码](studio-extension/src/Particles.tsx) |
| `src/ReadingModeControls.tsx` | [已公开源码](studio-extension/src/ReadingModeControls.tsx) |
| `src/readingModes.ts` | [已公开源码](studio-extension/src/readingModes.ts) |
| `src/ReadingPage.tsx` | [已公开源码](studio-extension/src/ReadingPage.tsx) |
| `src/readingSnapshot.ts` | [已公开源码](studio-extension/src/readingSnapshot.ts) |
| `src/resources.tsx` | [已公开源码](studio-extension/src/resources.tsx) |
| `src/SaveScreen.tsx` | [已公开源码](studio-extension/src/SaveScreen.tsx) |
| `src/settings.css` | [已公开源码](studio-extension/src/settings.css) |
| `src/SettingsModal.tsx` | [已公开源码](studio-extension/src/SettingsModal.tsx) |
| `src/SettingsPanel.tsx` | [已公开源码](studio-extension/src/SettingsPanel.tsx) |
| `src/SettingsScreen.tsx` | [已公开源码](studio-extension/src/SettingsScreen.tsx) |
| `src/settingsValues.ts` | [已公开源码](studio-extension/src/settingsValues.ts) |
| `src/StarGlyph.tsx` | [已公开源码](studio-extension/src/StarGlyph.tsx) |
| `src/StarMenuButton.tsx` | [已公开源码](studio-extension/src/StarMenuButton.tsx) |
| `src/starVisuals.ts` | [已公开源码](studio-extension/src/starVisuals.ts) |
| `src/state.ts` | [已公开源码](studio-extension/src/state.ts) |
| `src/StoryStarChains.tsx` | [已公开源码](studio-extension/src/StoryStarChains.tsx) |
| `src/StoryStars.tsx` | [已公开源码](studio-extension/src/StoryStars.tsx) |
| `src/storyTransition.ts` | [已公开源码](studio-extension/src/storyTransition.ts) |
| `src/styles.css` | [已公开源码](studio-extension/src/styles.css) |
| `src/theme.css` | 构建生成；源样式与构建算法均已公开 |
| `src/ThreadInteraction.tsx` | [已公开源码](studio-extension/src/ThreadInteraction.tsx) |
| `src/titleConstellation.ts` | [已公开源码](studio-extension/src/titleConstellation.ts) |
| `src/TitleIdentity.tsx` | [已公开源码](studio-extension/src/TitleIdentity.tsx) |
| `src/TitleMenu.tsx` | [已公开源码](studio-extension/src/TitleMenu.tsx) |
| `src/TitleScreen.tsx` | [已公开源码](studio-extension/src/TitleScreen.tsx) |
| `src/ToolbarScreen.tsx` | [已公开源码](studio-extension/src/ToolbarScreen.tsx) |
| `src/TransitionScreen.tsx` | [已公开源码](studio-extension/src/TransitionScreen.tsx) |
| `src/useEngineReading.ts` | [已公开源码](studio-extension/src/useEngineReading.ts) |
| `src/useStartTransition.ts` | [已公开源码](studio-extension/src/useStartTransition.ts) |
| `src/visualAssets.ts` | [已公开源码](studio-extension/src/visualAssets.ts) |
| `src/vite-env.d.ts` | [已公开源码](studio-extension/src/vite-env.d.ts) |
| `src/voicePlaybackGain.ts` | [已公开源码](studio-extension/src/voicePlaybackGain.ts) |
| `src/voicePlaybackGains.json` | 工程数据保持私有；读取接口见 `projectData.ts` |
| `package.json` | [已公开源码](studio-extension/package.json) |
| `package-lock.json` | [已公开源码](studio-extension/package-lock.json) |
| `extension.json` | [已公开源码](studio-extension/extension.json) |
| `tsconfig.json` | [已公开源码](studio-extension/tsconfig.json) |
| `vite.config.ts` | [已公开源码](studio-extension/vite.config.ts) |
| `README.md` | [已公开源码](studio-extension/README.md) |
| `scripts/build-theme.mjs` | [已公开源码](studio-extension/scripts/build-theme.mjs) |
| `ui/dialogue-normal.json` | [已公开源码](studio-extension/ui/dialogue-normal.json) |
| `ui/dialogue-special.json` | [已公开源码](studio-extension/ui/dialogue-special.json) |
