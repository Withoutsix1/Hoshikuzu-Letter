# 星屑信 | Hoshikuzu Letter

《星屑信》是一部正在制作中的免费校园恋爱视觉小说。

四月，新学期开始。高二学生月白秋一与朋友们的日常，从同好会延伸至星时山的旧邮局。一封信能否跨越时间？在闲聊、相处与追问中，那些还没说出口的话，渐渐有了想要送达的人。

[阅读作品介绍](content-preview/story/README.md) · [认识主要人物](content-preview/characters/README.md)

## 项目状态

- 开发中，使用 LetsGal Studio 制作。
- 首个公开目标：Day01 展示及后续免费试玩版本。
- 本仓库目前提供作品与人物介绍、一组通用 UI 模块和四位女主的标准立绘展示；尚未提供可运行游戏或完整开发工程。
- `Hoshikuzu-Letter` 为暂用仓库名，不代表已确定正式外文名。

## 当前提供的内容

- 非剧透作品梗概，以及月白秋一、比叡雏、椿静夜、神崎琉璃、雪丸奏的简短介绍。
- 项目状态、贡献规则及内容授权说明。
- 已按 MIT 授权的 19 个独立模块：导航与层状态、阅读模式、星形生成、提示音合成、资源上下文、画面切换、曲线交互、星形菜单与装饰、流星、阅读控件、偏好校验、设置面板和弹窗、存档框架、信笺卡片与缩略图，附独立样式。
- 四位女主的标准立绘展示版：比叡雏、椿静夜、神崎琉璃、雪丸奏。
- 音乐展示暂缓；通过专项核查后才会增加。

## 角色展示

| 比叡雏 | 椿静夜 | 神崎琉璃 | 雪丸奏 |
| :---: | :---: | :---: | :---: |
| <img src="showcase/sprites/hina-standard.jpg" width="160" alt="比叡雏标准立绘展示版"> | <img src="showcase/sprites/shizuya-standard.jpg" width="160" alt="椿静夜标准立绘展示版"> | <img src="showcase/sprites/ruri-standard.jpg" width="160" alt="神崎琉璃标准立绘展示版"> | <img src="showcase/sprites/kanade-standard.jpg" width="160" alt="雪丸奏标准立绘展示版"> |

人物身份与性格介绍见 [主要人物](content-preview/characters/README.md)。

当前开发版本的标准立绘，仅提供展示版。项目作者确认四图为原创，使用 image2.5 与 Nano Banana 官方服务交替完成。
图片不属于 MIT 授权范围，未授予独立再利用许可；详见 [展示说明](showcase/README.md)、[素材登记](ASSET_REGISTER.md)及[内容授权范围](CONTENT_LICENSE.md)。

## 公开范围与许可证

项目采用“代码开源、部分游戏内容公开、完整游戏计划免费发行”的方式。
`src/ui-primitives/` 中的代码及其使用说明、根目录的包与类型检查配置采用 [MIT License](LICENSE)，署名为「星屑信项目贡献者」。
具体文件范围见 [内容授权范围](CONTENT_LICENSE.md)；游戏创作内容、其他介绍文档及第三方组件分别管理。

- [内容授权范围](CONTENT_LICENSE.md)
- [第三方声明](THIRD_PARTY_NOTICES.md)
- [已公开素材登记](ASSET_REGISTER.md)
- [贡献说明](CONTRIBUTING.md)

完整游戏工程、未公开剧情、制作母版、完整语音库、素材制作工作流及未经核准的资源保持私有。

## 使用代码

需要 Node.js 22 或更新版本。在仓库根目录运行：

```sh
npm ci
npm run check
npm run build
```

详细接口和使用示例见 [代码说明](src/README.md)。模块不依赖 Studio SDK；React 组件与 Hook 需要 React 18 或 19，动画功能另需 Motion 14，交互与音频功能需要浏览器环境。

## 免费发行

游戏计划免费提供。具体版本在素材和构建组件的发行核查完成后发布；当前尚无公开下载包。
免费游玩不代表美术、剧本、音乐或配音可以独立再利用。
