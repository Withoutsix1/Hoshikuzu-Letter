# 构建工具

本目录的 `build.mjs` 与本说明按根目录 [MIT License](../LICENSE) 授权。

在仓库根目录运行 `npm run build`，工具会依次：

1. 调用本仓库安装的 TypeScript 编译器，生成 JavaScript 和类型声明。
2. 编译成功后，将独立组件样式复制到 `dist/ui-primitives/styles.css`。

目录均相对工具自身所在的仓库解析，不依赖 Studio SDK。构建输出供本地集成，不纳入 Git。
