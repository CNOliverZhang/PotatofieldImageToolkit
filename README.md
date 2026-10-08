# 洋芋田图像工具箱（重写版）

老项目 `PotatofieldImageToolkit`（Electron 11 + Vue 2）的现代化重写版本（当前 5.0.0）。

- 运行时：Electron 44（需 Node ≥ 22.12）、[electron-vite](https://electron-vite.org) 5
- 框架：Vue 3（`<script setup lang="ts">`）+ Vue Router 4 + Pinia
- UI：`@fluentui/web-components` v3 + `@fluentui/tokens` + Font Awesome
- 图像处理：`sharp`（运行于**主进程**，渲染进程经 IPC 调用，避免阻塞 UI）
- 状态持久化：Pinia + `pinia-plugin-persistedstate`（localStorage）；
  **跨窗口共享的数据（模板库等）一律放主进程**，不要依赖多窗口共享 localStorage
- 更新：`electron-updater`，沿用老版本更新源（保持兼容）

## 开发

```bash
npm install
npm run dev        # 启动 Vite + Electron 开发模式
npm run build      # 构建主进程 / 预加载 / 渲染进程
npm run package    # 打包（win/nsis + mac/dmg）
```

新环境若 `npm run dev` 起不来：electron 44 的二进制需单独下载，
`npm rebuild` 不触发，执行
`$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"; node node_modules/electron/install.js`

## 目录结构

```
src/
  main/        主进程：窗口管理、IPC、图像处理(sharp)、更新、文件 IO
  preload/     预加载：contextBridge 暴露 window.api
  shared/      主/渲染共享类型
  renderer/    渲染进程：router / stores / composables / utils / components / pages
```

## 功能模块（11 个工具）

加水印（含全屏水印模式）、长图拼接、裁剪、分割、尺寸调整、压缩、格式转换、EXIF 读取、色彩提取、字体管理、水印模板。
「富文本制图」已外移为独立产品「洋芋田富文本编辑器」，应用内仅保留跳转入口。

单图工具支持批量形态（独立窗口）：加水印、尺寸调整、压缩、格式转换、裁剪。

## 文档

- [`PROGRESS.md`](./PROGRESS.md) —— 当前进度与未完成项（日志倒序，**续接会话先读这个**）
- [`docs/DEVELOPMENT_GUIDE.md`](./docs/DEVELOPMENT_GUIDE.md) —— 统一组件、样式规范、开发维护规范（**动手前必读**）
- [`docs/TOOL_CONSISTENCY.md`](./docs/TOOL_CONSISTENCY.md) —— 单图 vs 批量差异与统一决策记录
- [`docs/LEGACY_COMPARISON.md`](./docs/LEGACY_COMPARISON.md) —— 与老版本的实现/性能对比
- [`PLANNING.md`](./PLANNING.md) —— 初期架构规划（**部分内容已过时，以 DEVELOPMENT_GUIDE 为准**）

## 更新兼容性（重要）

新版本必须保持以下不变，老客户端才能自动更新到新版本：

- `appId`: `cn.potatofield.imagetoolkit`
- `publish.url`: `https://files.potatofield.cn/ImageToolkit/Packages/`
- `win.target`: `nsis`，`mac.target`: `dmg`
- `asar`: `false`

## 图标

打包需要 `build/icons/` 下的图标文件（从老项目 `PotatofieldImageToolkit/build/icons` 复制）：

- `icon.ico`（Windows）
- `icon.icns`（macOS）
- `icon.png`（托盘）
