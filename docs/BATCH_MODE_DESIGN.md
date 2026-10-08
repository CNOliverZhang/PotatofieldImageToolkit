# 批量处理模式设计原则

每个图像处理工具都提供两种模式：

- **单图模式**（路径形如 `/cropper`）
- **批量模式**（路径形如 `/cropper/batch`）

水印工具的单图模式与批量模式均已实现完善，是本项目批量模式的设计基准。以下原则据此确立，新增/修改工具时应遵循。

> 补充（2026-10-08）：主体原则仍成立。两处已变化 ——
> ① 批量逻辑统一到 `useBatchRunner`（覆盖策略三选一、中途取消、进度、结束后打开输出文件）；
> ② 输出文件名后缀现可由保存位置的「**添加后缀名**」开关关闭（默认开，关闭后输出名与原文件同名）。
> 详见 `docs/DEVELOPMENT_GUIDE.md` §5.4 / §5.7。

---

## 1. 批量模式以独立窗口打开

- 单图模式操作区顶部有「批量处理」入口，点击后通过
  `window.api.window.open({ route: '/X/batch', key: 'batch-X', width, height, minWidth, minHeight })`
  在**新窗口**打开批量模式（不在主窗口内路由切换）。
- 批量模式对应路由在 `meta` 中标记 `standalone: true`；`Layout.vue` 据此隐藏左侧功能导航
  （`v-if="!standalone"`），使批量窗口表现为独立工具窗口。
- 因此批量模式不应从主窗口路由进入，也不应在主窗口内显示。

---

## 2. 批量模式界面为三栏布局

与水印工具（`watermark-batch.vue` → `WatermarkBatchView.vue`）一致，每个批量页为横向三栏：

### 左栏：文件列表（`BatchImportPanel` 组件）

- 负责导入「文件」或「文件夹」；
- 展示已导入文件列表，支持点选；
- 被选中的文件在中间栏预览。

### 中栏：预览区域

- 与**单图模式完全一致**（同一套 `.preview-pane` / `.preview-stage` / `.preview-img` 样式与交互）；
- 实时反映当前操作参数对选中文件的效果。

### 右栏：操作区域（`controls-pane`）

- 控件与**单图模式相同**（由各工具自己的操作控件/参数提供：
  `WatermarkControls`、`BatchTool.vue` 内按 `tool` 区分的 resizer/compress/convert 控件、
  以及 `cropper-batch.vue` 的裁剪参数）；
- 与单图模式有**两处区别**：
  1. **不含**「前往批量处理」入口（当前已在批量模式）；
  2. **额外提供**「保存位置」设置（`SaveLocationSetting` 组件：选择文件夹、常用位置、保持相对目录开关）。

---

## 3. 单图与批量复用同一套操作参数

- 单图模式与批量模式应尽量复用同一套操作控件/参数定义；
- 批量模式将同一组操作参数应用到所有导入文件，
  输出文件名带 `_cropped` / `_resized` / `_compressed` / `_converted` 等后缀（由 `resolveBatchOutputPath` 生成）。

---

## 4. 共享组件与样式

- `BatchImportPanel.vue`：左栏文件列表。
- `SaveLocationSetting.vue`：右栏「保存位置」设置（含 `keepRelative` 保持相对目录）。
- `BatchTool.vue`：resizer / compress / convert 三个批量页共用的三栏外壳，通过 `tool` 属性切换操作控件。
- `WatermarkBatchView.vue`：水印批量页的三栏外壳。
- 三栏外壳样式（`.batch-tool` / `.import-col` / `.preview-pane` / `.controls-pane` 等）
  在各自页面以 `<style scoped>` 维护，保证与水印基准一致。
