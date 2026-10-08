# 新老版本对比文档（实现方案 / 功能表现 / 性能）

> 新版：`potatofield-image-toolkit`（Electron 44 + Vue 3 + electron-vite + Fluent v3 + 主进程 sharp）
> 老版：`PotatofieldImageToolkit`（Electron 11 + Vue 2 + electron-vue/Webpack4）
> 梳理时间：2026-09-29 · 2026-10-08 修订（更新版本号；§5 三项差异**仍未处理**，非过时）

---

## 1. 架构与图像处理链路（根本差异）

| 维度 | 老版本 | 新版本 |
|---|---|---|
| 进程模型 | `nodeIntegration:true`、`enableRemoteModule:true`、`webSecurity:false`；**图像处理全在渲染进程** | 沙箱 + contextIsolation + preload；**所有图像处理在主进程** `src/main/image.ts` |
| 主要图像手段 | DOM canvas + `html2canvas`（截图式渲染）+ `cropperjs`；仅压缩页用了 sharp | 统一 sharp（libvips 8.15.3），op：resize / convert / compress / watermark / append / extract / metadata |
| 输出链路 | `canvas.toDataURL()` → 去 base64 头 → `Buffer.from(url,'base64')` → `fs.writeFile`（整图以 base64 常驻内存） | `sharp(...).toFile()` 直接落盘；预览时才 `toBuffer()` 且**已等比缩放** |
| UI | Element UI 2 | Fluent UI Web Components + Font Awesome |
| 状态 | Vuex 3 + vuex-electron（localStorage） | Pinia + pinia-plugin-persistedstate |

---

## 2. 老版本的硬限制（新版不存在）

| 限制 | 老版本 | 证据 | 新版 |
|---|---|---|---|
| 单边 16000px | 拼接/富文本制图按 `Math.min(..., 16000/height, ...)` 降采样 | `splicer/editor.vue:584,592`、`textToImage/editor.vue:1258` | 无单边限制，实测 120000px 高度正常输出 |
| 面积 256000000 px（256MP） | 同上公式里的 `Math.sqrt(256000000/(w*h))` | 同上 | 上限为 libvips 的 268402689 px（268MP），且**超限是快速失败并给出中文提示** |
| canvas 超限时输出空白 | `toDataURL()` 超限返回空白且**没有判空兜底** → 默默写出坏图 | 同上链路 | 不会：超限直接抛错，不产出文件 |
| 整图 base64 常驻内存 | 老链路必然占用数倍于图片的内存 | 多处 `editor.vue` | 流式处理，实测 240MP 时进程 RSS 仅 145MB |

**关键差异**：老版本遇到大图是「悄悄降采样 / 悄悄输出空白」，用户拿到的图尺寸不对或全白；新版是「要么正确输出，要么明确报错」。

---

## 3. 逐工具对比

| 工具 | 老版本实现 | 新版本实现 | 表现/性能差异 |
|---|---|---|---|
| 加水印 | 真实 DOM + CSS `@font-face` 注入字体文件 → `html2canvas` 截图；有阴影模糊半径手动缩放的 hack | sharp composite：文字走 SVG `<text font-family>` → librsvg 解析；图片水印直接 composite | 新版**快得多**、无截图失真；字体按系统字体名命中（已验证 librsvg 可命中中英文字体），装完即可用于导出 |
| 全屏水印 | 同上 + 目录批量 | 复用 `WatermarkControls`（`lockTile`） | 同上 |
| 长图拼接 | 逐张 canvas 按 EXIF 旋转修正 → `html2canvas` 拼接；单边 16000 / 256MP 限制 | sharp composite：对齐（横向等高/纵向等宽）+ 可选边距/底色 | 新版无尺寸焦虑；新增边距、底色、拖拽排序、缩略图；预览等比缩放 |
| 裁剪 | cropperjs 取区域 + sharp 切割 | cropperjs 取区域 + 主进程 `extract` | 基本一致；新版单图多了单位切换、比例模式、九宫格定位 |
| 分割 | sharp extract | 主进程 `extract` 逐块 | 一致，新版加了输出设置 |
| 富文本制图 | CKEditor5 + html2canvas + sharp | **已独立为「洋芋田富文本编辑器」**，工具箱内改为引导页 + 外链 | 功能外移，不再是本仓库范围 |
| 尺寸调整 | canvas `drawImage` + `toDataURL(quality)` | sharp `resize` | 新版质量更好（libvips 重采样）、无 canvas 限制 |
| 压缩 | **唯一用 sharp 的地方**（`withMetadata().rotate()` → 按格式输出） | sharp `compress` op | 新版少了 `.rotate()`（见 §5） |
| 格式转换 | canvas + `toDataURL` | sharp `toFormat` | 新版支持更完整的格式参数 |
| EXIF | exif-js | `exifr`（已落地，`main/image.ts` 的 `readImageMeta`） | — |
| 色彩提取 | colorthief | colorthief | 一致 |
| 字体管理 | 在线字体库下载安装 + 字体库目录 | 双 Tab（线上/系统）+ 安装到系统 + 缓存自动清理 | 新版不保留字体文件，靠系统字体名渲染 |

---

## 4. 批量处理

| 项 | 老版本 | 新版本 |
|---|---|---|
| 形态 | 每个工具一个 BrowserWindow（托盘多窗口） | 主窗口 tab + 独立批量窗口（`window:open`，按 key 去重） |
| 导入 | 选文件夹 + `ReadDirectory`（**同步** `readdirSync` 递归） | `directoryScanner`（异步，返回 `fileList` + `errorList`） |
| 保持相对目录 | 支持（`path.relative` 拼输出路径） | 支持（`resolveBatchOutputPath` / `keepRelative`） |
| 未自定义目录时 | 写到源文件同目录 | 沿用保存位置设置（含常用位置） |

---

## 5. 功能范围变化（相对老版本）

| # | 事项 | 说明 |
|---|---|---|
| 1 | 富文本制图 | 老版内置 CKEditor5，新版外移为独立产品「洋芋田富文本编辑器」，应用内保留跳转入口 |
| 2 | 水印模板 | 老版只有「模板码」分享参数；新版以本地模板库为主（命名/重命名/删除/编辑，数据存于本机），并支持「分享模板」复制模板码 |
| 3 | EXIF 方向自动校正 | 老版在拼接/转换/改尺寸/裁剪里手工做旋转；新版在主进程各 op 统一 `.rotate()`，预览与输出一致 |

---

## 6. 性能实测（新版，2000×3000 噪声图 = 最坏情况）

| 张数 | 输出 | 耗时 | 输出文件 | 进程 RSS |
|---|---|---|---|---|
| 15 | 2000×45000（90MP） | 3.9s | 369MB | 137MB |
| 30 | 2000×90000（180MP） | 7.7s | 737MB | 140MB |
| 40 | 2000×120000（240MP） | 10.4s | 983MB | 145MB |
| 46 | 2000×138000（276MP） | **失败**（268MP 上限） | — | — |

预览（等比缩放，长边 ≤10000 且 ≤6MP）：

| 张数 | 预览耗时 | 预览体积 |
|---|---|---|
| 3 | ~1.1s | ~25MB |
| 20 | ~0.9s | ~8MB |
| 46 | ~1.3s | ~3MB |

结论：耗时随像素线性增长，内存恒定在 150MB 量级；预览不再生成全尺寸图（旧代码路径下 40 张会生成近 1GB 再经 IPC 传回渲染进程，现已被预览缩放消除）。
