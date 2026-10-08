# 洋芋田图像工具箱 · 重写规划文档（跨会话接续用）

> 本文件同时供「人」阅读与「AI 跨会话接续」使用。每次会话开始时先读 `PLANNING.md` + `PROGRESS.md`。
> 最后更新：2026-07-31（会话 1：分析 + 骨架搭建）
>
> ⚠️ **这是 2026-07 的初期规划，部分内容已过时**：技术栈（原定 Element Plus，现为 Fluent v3）、
> 目录结构（缺 `useBatchRunner` / `useOutputConflict` / `components/settings/` / `main/templates.ts`）、
> 工具清单（12 → 11 项，富文本外移）均已与现状不符。
> **现行规范看 `docs/DEVELOPMENT_GUIDE.md`，进度看 `PROGRESS.md`。**
> 仍然有效的部分：老版本兼容约束（§2）、在线接口表（§4）。

---

## 0. 总览与目标

将原项目 `PotatofieldImageToolkit`（Electron 11 + Vue 2 + Webpack 4 + electron-vue 模板）用 **新 Electron + Vue 3** 完全重写。

- 新项目位置：`Potatofield/potatofield-image-toolkit/`（已 git init，分支 `main`）
- 作为子模块注册进大仓 `Potatofield`（`.gitmodules` 见会话 1 末尾）
- **不直接修改老项目**，老项目保留作为参考与对比基准

### 重写硬性要求（来自用户）
1. 详细拆解功能模块，评估更优雅/高性能实现。
2. 抽取跨模块通用基础组件（文件选择、目录选择、文件读取、文件夹扫描等），消除重复实现。
3. 实现深色模式 + 主题色（参照图笔记本/富文本编辑器），并持久化：
   - 文件默认保存地址
   - 各工具的默认导出参数
4. 自动更新与老版本兼容：**新包放到更新服务器后，老版本能自动更新到新版本**。
5. 在线功能与原来一致（用户数据上报、字体库管理等）；在线接口实现可参考博客后台 `potatofield-backend`。
6. 保持 win / mac 多平台兼容。

---

## 1. 老项目技术栈与架构（已分析）

| 项 | 老实现 |
|---|---|
| 构建 | electron-vue 模板（Webpack 4 + Babel 6） |
| 渲染进程框架 | Vue 2.6 + Vue Router 3（hash 模式）+ Vuex 3 |
| UI | Element UI + Font Awesome |
| 状态持久化 | `vuex-electron` 的 `createPersistedState` → localStorage；`createSharedMutations` 跨进程共享 |
| 主/渲染进程通信 | `electron-promise-ipc` + 自定义 `ActionPromise` 插件：重写 `store.dispatch`，让 Vuex action 实际跑到主进程 |
| 图像库 | `sharp`（渲染进程内，因 nodeIntegration=true） |
| 其他库 | colorthief、cropperjs、exif-js、html2canvas、CKEditor5、crypto-js |

### 主进程要点（`src/main/index.js`）
- 按 `title` 去重的窗口管理（`openWindow`）
- 单实例锁（`app.requestSingleInstanceLock`）
- 托盘
- `electron-updater`：`autoUpdater`（squirrel/sparkle 宏），事件：`update-available / update-not-available / update-download-progress / update-downloaded / error`
- IPC：`relaunch`、`open`、`version`（sendSync）、`app-data-path`（sendSync）、`select-folder`（`dialog.showOpenDialog`）
- `electron-squirrel-startup` 处理 Windows 安装事件

### 关键兼容性事实（需求 4：自动更新兼容）
- `appId: cn.potatofield.imagetoolkit`（**必须保持不变**）
- `publish: [{ provider: 'generic', url: 'https://files.potatofield.cn/ImageToolkit/Packages/' }]`（**必须保持不变**）
- `win.target: ['nsis']`，`mac.target: ['dmg']`（**必须保持相同安装器格式**）
- `artifactName: potatofield-image-toolkit-${version}.${ext}`
- `asar: false`，`directories.output: 'build'`

---

## 2. 功能模块拆解（12 个工具）

| # | 旧页面 | 功能 | 核心库 | 输入 | 输出 | 备注 |
|---|---|---|---|---|---|---|
| 1 | `watermark.vue` + `watermark/` | 给图片加图片/文字水印 | sharp（composite + SVG 文本） | 图片 + 水印图/文字 | 带水印图 | 有「模板」保存；模板码用 crypto-js |
| 2 | `globalWatermark.vue` + `globalWatermark/` | 批量给一目录图片加水印 | 同上 + 目录扫描 | 目录 | 整目录输出 | 模板同 watermark |
| 3 | `splicer.vue` + `splicer/` | 多图拼接长图 | sharp（append） | 多图 | 拼接图 | 有模板 |
| 4 | `cropper.vue` + `cropper/` | 可视化裁剪 | cropperjs + sharp | 图片 | 裁剪图 | cropperjs 取区域，sharp 切割 |
| 5 | `slicer.vue` + `slicer/` | 按行/列/网格分割 | sharp（extract） | 图片 | 多张切片 | 设定行列 |
| 6 | `textToImage.vue` + `textToImage/` | 富文本制图 | CKEditor5 + html2canvas + sharp | 富文本 | 图片 | 有模板 |
| 7 | `resizer.vue` | 尺寸调整 | sharp（resize） | 图片 + 尺寸 | 缩放图 | 可批量 |
| 8 | `compress.vue` | 压缩 | sharp（quality/webp） | 图片 | 压缩图 | 可批量 |
| 9 | `convert.vue` | 格式转换 | sharp（toFormat） | 图片 | 转格式图 | 可批量 |
| 10 | `exif.vue` | EXIF 读取 | exif-js → 替换为 `exifr` | 图片 | EXIF 表 | 只读 |
| 11 | `palette.vue` | 色彩提取 | colorthief | 图片 | 调色板 | 取主色/调色板 |
| 12 | `fonts.vue` | 字体管理 | 在线接口 + fs | 本地/在线字体 | 安装字体 | 见 §4 |

**公共能力（每个工具都会用到，必须抽取为 base 模块，见 §3）**：文件选择、目录选择、文件读取、文件夹递归扫描、文件写出、模板码编解码、在线 API 客户端、对话框组件、图像预处理、深色模式 + 主题色、默认保存路径、各工具默认导出参数。

---

## 3. 抽取出的基础组件模块（需求 2）

集中放在 `src/renderer/utils/` 与 `src/shared/`，跨工具复用：

1. **`filePicker.ts`** —— 封装「选择文件 / 多选文件 / 选择目录」，底层走 preload 暴露的 `window.api.selectFile/selectDirectory`。替代老项目各页面里散落的 `dialog.showOpenDialog` 调用。
2. **`directoryScanner.ts`** —— 递归扫描目录，按扩展名白名单过滤，返回 `{ fileList, errorList }`。替代老项目 `utils/readdirectory.js` 以及各工具里重复写的 `fs.readdirSync`。
3. **`fileIO.ts`** —— `readFile` / `writeFile` / `ensureDir`（替代 `utils/createdirectory.js`），统一错误处理。主进程 `fs` IPC 执行。
4. **`templateCode.ts`** —— crypto-js 模板码编解码（watermark / splicer / textToImage 共用）。替代老项目三处重复实现。
5. **`image` 主进程模块** —— 所有 sharp 操作（resize / convert / compress / watermark composite / append / extract / metadata）移到**主进程**执行，渲染进程通过 `invoke` 调用。理由：渲染进程无法在沙箱 + contextIsolation 下直接 `require('sharp')`；且放到主进程可利用多核、避免卡 UI。
6. **`useOnlineApi.ts`** —— 统一的 axios 实例（baseURL `https://api.potatofield.cn`），封装字体列表、消息、版本、客户端注册、用量上报。替代老项目里硬编码的 5+ 处完整 URL。
7. **`DialogProvider` / `useDialog.ts`** —— 全局对话框（用 Element Plus ElMessage/ElMessageBox 实现）。
8. **`useTheme.ts`** —— 深色模式 + 主题色（CSS 变量）。
9. **`stores/settings.ts`** —— 持久化全局设置（主题色、深色模式、默认保存路径、各工具默认导出参数、identifier）。

---

## 4. 在线接口（需求 5：与原来一致 + 参考博客后台）

> **重要**：后端正确路由文件是 `routes/image_toolkit.js` 和 `routes/font_library.js`。
> `routes/old.js` 是为兼容更早版本保留的旧路由，**不要以此为准**。

### 图像工具箱接口（`/image_toolkit` 前缀）

源文件：`potatofield-backend/app/routes/image_toolkit.js`

| 用途 | 方法 | 路径 | 认证 | Handler |
|---|---|---|---|---|
| 工具列表 | GET | `/image_toolkit/tool/list` | 无 | `tool.list` |
| 添加工具 | POST | `/image_toolkit/tool/add` | admin | `tool.add` |
| 更新工具 | POST | `/image_toolkit/tool/update` | admin | `tool.update` |
| 删除工具 | POST | `/image_toolkit/tool/remove` | admin | `tool.remove` |
| 添加版本 | POST | `/image_toolkit/version/add` | admin | `version.add` |
| 版本列表 | GET | `/image_toolkit/version/list` | 无 | `version.list` |
| 最新版本 | GET | `/image_toolkit/version/latest` | 无 | `version.latest` |
| 客户端注册 | POST | `/image_toolkit/client/register` | 无 | `client.register` |
| 新客户端数 | GET | `/image_toolkit/client/count_new` | admin | `client.countNew` |
| 活跃客户端数 | GET | `/image_toolkit/client/count_active` | admin | `client.countActive` |
| 客户端总数 | GET | `/image_toolkit/client/count` | admin | `client.count` |
| 消息列表 | GET | `/image_toolkit/message/list` | 无 | `message.list` |
| 最新消息 | GET | `/image_toolkit/message/latest` | 无 | `message.latest` |
| 添加消息 | POST | `/image_toolkit/message/add` | admin | `message.add` |
| 更新消息 | POST | `/image_toolkit/message/update` | admin | `message.update` |
| 删除消息 | POST | `/image_toolkit/message/remove` | admin | `message.remove` |

**客户端注册 = 用量上报**：`client.register` handler 每次调用时会自动创建一条 `ImageToolkit_usage` 记录（见 `handlers/image_toolkit/client.js:44-47`），**无需单独的 usage 端点**。

### 字体库接口（`/font_library` 前缀）

源文件：`potatofield-backend/app/routes/font_library.js`

| 用途 | 方法 | 路径 | 认证 | Handler |
|---|---|---|---|---|
| 字体列表 | GET | `/font_library/font/list` | 无 | `font.list` |
| 添加字体 | POST | `/font_library/font/add` | 登录 | `font.add` |
| 更新字体 | POST | `/font_library/font/update` | 登录 | `font.update` |
| 删除字体 | POST | `/font_library/font/remove` | 登录 | `font.remove` |
| 随机字体 | GET | `/font_library/font/random` | 无 | `font.random` |
| 字体族列表 | GET | `/font_library/font_family/list` | 无 | `fontFamily.list` |
| 添加字体族 | POST | `/font_library/font_family/add` | 登录 | `fontFamily.add` |
| 更新字体族 | POST | `/font_library/font_family/update` | 登录 | `fontFamily.update` |
| 删除字体族 | POST | `/font_library/font_family/remove` | 登录 | `fontFamily.remove` |
| 字体样式列表 | GET | `/font_library/font_style/list` | 无 | `fontStyle.list` |

### 新项目客户端调用的接口（已实现在 `useOnlineApi.ts`）

| 函数 | 方法 | 路径 | 说明 |
|---|---|---|---|
| `getFontList()` | GET | `/font_library/font/list` | 在线字体列表 |
| `getRandomFont()` | GET | `/font_library/font/random` | 随机推荐字体 |
| `downloadFont()` | GET | `font.fontFile`（完整 URL） | 下载字体二进制 |
| `getMessageList()` | GET | `/image_toolkit/message/list` | 公告消息列表 |
| `getLatestMessage()` | GET | `/image_toolkit/message/latest` | 最新公告 |
| `getVersions()` | GET | `/image_toolkit/version/list` | 版本列表（用于更新检查） |
| `getLatestVersion()` | GET | `/image_toolkit/version/latest` | 最新版本信息 |
| `getToolList()` | GET | `/image_toolkit/tool/list` | 工具列表 |
| `registerClient()` | POST | `/image_toolkit/client/register` | 注册+用量上报 |

### 后端模型

`ImageToolkit_client`、`ImageToolkit_version`、`ImageToolkit_usage`、`ImageToolkit_message`、`ImageToolkit_tool`、`FontLibrary_font`、`FontLibrary_fontFamily`、`FontLibrary_fontStyle`

---

## 5. 深色模式 + 主题色 + 持久化（需求 3）

- 主题色与深色模式通过 **CSS 变量** 实现（`--main-color` 等），挂在 `:root` / `body`
- `useTheme.ts`：`applyTheme({ color, dark })` 写入 CSS 变量，并切换 `dark` 类（Element Plus 深色模式）
- `stores/settings.ts` 用 **Pinia + `pinia-plugin-persistedstate`** 持久化到 localStorage
- 持久化字段：
  - `themeColor`
  - `darkMode`
  - `defaultSaveDirectory`
  - `defaultExportParams`（按工具名存默认导出参数）
  - `identifier`
- 文件保存对话框默认打开 `defaultSaveDirectory`；各工具「导出」时默认填入 `defaultExportParams[toolName]`

---

## 6. 新项目技术栈选型（最终）

- **构建**：[`electron-vite`](https://electron-vite.org)（Vite 驱动，main/preload/renderer 均用 TypeScript）
- **框架**：Vue 3 + `<script setup lang="ts">` + TypeScript
- **路由**：Vue Router 4（hash 模式）
- **状态**：Pinia + `pinia-plugin-persistedstate`
- **UI**：Element Plus + Font Awesome
- **图像**：`sharp`（**主进程侧**，经 IPC invoke）+ `exifr` + `cropperjs` + `colorthief` + `html2canvas` + CKEditor5 + `crypto-js`
- **更新**：`electron-updater`，配置保持老项目兼容
- **多平台**：`electron-builder` 同时出 win/nsis 与 mac/dmg

### 目录结构
```
src/
  main/        # 主进程：windows.ts, ipc.ts, updater.ts, image.ts, fs.ts, index.ts
  preload/     # index.ts contextBridge
  shared/      # types.ts, api-types.ts 主/渲染共享类型
  renderer/
    main.ts, App.vue, index.html
    router/
    stores/      # settings, fonts, messages
    composables/ # useTheme, useOnlineApi, useDialog
    utils/       # filePicker, directoryScanner, fileIO, templateCode
    components/  # WindowControls, Layout, ToolStub
    layouts/     # (合并进 components/Layout)
    pages/       # 12 个工具 + index + settings + fonts
```

---

## 7. 分阶段执行计划

- **会话 1（本次）**：分析 + `PLANNING.md` + 项目骨架（git init、package.json、electron-vite 配置、electron-builder 兼容配置、tsconfig、main/preload 骨架、renderer 核心）+ 实现 1 个示范工具 `palette.vue`。注册为子模块。
- **会话 2**：基础模块补全 + 简单工具批处理类（resizer / compress / convert / exif）—— 共用 `image` 主进程 IPC。
- **会话 3**：watermark + globalWatermark（含模板码 templateCode + 目录批量）。
- **会话 4**：splicer + slicer + cropper（含模板）。
- **会话 5**：textToImage（CKEditor5 + html2canvas）+ fonts（在线字体）+ settings（上报、备份）。
- **会话 6**：深色模式/主题色 UI 接入所有页面、默认保存路径/默认参数接入所有导出、自动更新联调、win/mac 打包验证。

---

## 8. 待确认 / 风险

- [x] ~~后端是否已有 `/image_toolkit/usage` 用量上报接口？~~ **已确认**：无需单独端点，`client.register` 每次调用自动创建 `ImageToolkit_usage` 记录。
- [ ] `asar: false` 是否必须？为兼容 `static/` 资源路径沿用；后续可评估改为 true。
- [ ] cropperjs 版本：v1（老）vs v2 API 不同，按 v1 渐进迁移。
- [ ] CKEditor5 体积大，textToImage 是否仍用 CKEditor5 或换更轻方案（TipTap/Quill）？暂沿用 CKEditor5。
- [ ] 老项目 `select-folder` 用 sendSync（阻塞）；新项目改用 `invoke`（Promise，非阻塞）。
