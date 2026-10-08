# 工具一致性梳理（单图 vs 批量 · 批量导入导出）

> 梳理时间：2026-09-29 · 用于确认「是否统一、怎么处理」
> 说明：本文只做**现状梳理与建议**，标 `❓待确认` 的项需你拍板后再改。
>
> ⚠️ **本文是快照**：§1–§2 记录的是 2026-09-29 当时的现状（多数问题已在下方「更新（2026-09-30）」修掉），
> 读的时候请以「更新」段落的结论为准，不要照 §1–§2 的旧描述判断当前代码。

## 更新（2026-09-30）：已按确认方案全部实施

- 三个批量实现（BatchTool / WatermarkBatchView / cropper-batch）统一到 `useBatchRunner`
- 覆盖策略：开始处理前预检同名文件，弹窗三选一「自动重命名 / 覆盖 / 取消」
- 支持中途取消（已完成文件保留、不回滚）
- 批量参数与各自单图对齐（适配方式 5 项、输出设置、文案、质量范围、裁剪完全对齐）
- 修掉两个缺陷（打开文件夹路径错误、jpeg 扩展名两套写法）
- 扫描到的损坏文件改为导入时提示并跳过
- 输出设置默认值统一读设置页「默认输出」

`useBatchRunner` 已覆盖的公共行为：输出路径计算（`resolveBatchOutputPath` + 保持相对目录）、相对子目录 `ensureDir`、串行执行、进度、单张失败继续、结束提示、`showItemInFolder`（用真实输出路径）。各批量工具只保留参数控件与 `prepare()`。

---

## 0. 工具与形态一览

| 工具 | 单图页 | 批量形态 | 批量实现 |
|---|---|---|---|
| 加水印 | `pages/watermark.vue` | `pages/watermark-batch.vue` | `components/WatermarkBatchView.vue`（独立窗口） |
| 全屏水印 | 复用 watermark（lockTile） | `global-watermark-batch` | `WatermarkBatchView.vue` |
| 尺寸调整 | `pages/resizer.vue` | `pages/resizer-batch.vue` | `components/BatchTool.vue` |
| 压缩 | `pages/compress.vue` | `pages/compress-batch.vue` | `components/BatchTool.vue` |
| 格式转换 | `pages/convert.vue` | `pages/convert-batch.vue` | `components/BatchTool.vue` |
| 裁剪 | `pages/cropper.vue` | `pages/cropper-batch.vue` | 独立实现（不走 BatchTool） |
| 长图拼接 | `pages/splicer.vue` | 无（语义上单张输出） | — |
| 分割 | `pages/slicer.vue` | 无 | — |
| EXIF / 色彩提取 / 字体管理 | `exif.vue` / `palette.vue` / `fonts.vue` | 无 | — |
| 富文本制图 | `pages/textToImage.vue` | 无 | 已独立为「洋芋田富文本编辑器」 |

架构注记：`resizer/compress/convert` 的批量共用 `BatchTool.vue`；`cropper-batch` 与 `watermark-batch` 各有一份自己的 `run()`，三份循环逻辑约 60% 重复。

---

## 1. 单图 vs 批量：功能参数与控件差异

### 1.1 水印 —— ✅ 基本一致

单图与批量共用 `WatermarkControls.vue`，默认值逐字段相同（文本、字号 48、颜色、字体、旋转、九宫格定位、边距、平铺、不透明度、水印图缩放、输出格式/质量）。

- 差异：`WatermarkControls` 的 `lockTile` prop 仅批量侧暴露；单图页顶部多一个「批量处理」入口按钮。
- 结论：**无需处理**。

### 1.2 裁剪 —— ❗差异较大

| 项 | 单图 `cropper.vue` | 批量 `cropper-batch.vue` | 状态 |
|---|---|---|---|
| 单位切换 | 有（px / ratio） | 无 | ❓待确认 |
| 定位方式 | 九宫格「定位基准」（默认 nw） | 下拉「位置」（center/nw/ne/sw/se，默认 center） | ❓待确认（默认值也不同） |
| 比例模式百分比控件 | 有（横/纵边距%、宽%、高%） | 无 | ❓待确认 |
| 画布拖拽交互 | 有 | 无 | ❓待确认 |
| 宽高输入 max 约束 | 有 | 无 | ❓待确认 |
| 输出设置（格式/质量） | 有 | **无** | ❓建议补齐 |

建议：批量侧补齐「输出设置」；其余交互差异若属有意简化（批量无需可视化微调）可保留，但**定位默认值应统一**（建议都默认 center 或都默认 nw）。

### 1.3 尺寸调整 —— ❗差异

| 项 | 单图 | 批量 |
|---|---|---|
| 适配方式 | 5 项（inside/cover/fill/contain/outside，带英文标注） | 3 项（等比缩放/裁剪填充/拉伸） |
| 宽/高输入 | 有 min 约束 | 无 min 约束 |
| 输出设置 | 有 | **无** |

建议：适配方式的**取值范围**需统一（批量缺 `contain`/`outside` 会让同样参数在两个形态下行为不同）；输出设置补齐。

### 1.4 压缩 —— ❗轻微差异

| 项 | 单图 | 批量 |
|---|---|---|
| 字段名/文案 | 「输出格式」，选项写 **JPEG** | 「格式」，选项写 **JPG** |
| 质量滑块下限 | min=1 | min=10 |
| 默认值 | original / 80 | original / 80 |

建议：文案统一为「JPG」（与输出扩展名一致）；质量下限统一（建议 10，避免 1 这种无意义值）。

### 1.5 格式转换 —— ❗差异

| 项 | 单图 | 批量 |
|---|---|---|
| 默认值 | `png`（硬编码，未读设置页默认值） | `undefined`（`opts.format \|\| 'png'` 仅显示层兜底） |
| 质量控件 | 有（90，仅 lossy 显示） | **无**（`buildOptions` 不传 quality） |
| 输出扩展名 | `.jpg` | `.jpeg` |
| 运行前校验 | 无 | 有（未选格式时拦截） |

建议：① 扩展名统一（`.jpg`）；② 批量补质量控件；③ 单图默认值改为读设置页 `defaultOutput`（与其它工具一致）；④ 批量保留「必选校验」，单图因有默认值可不加。

### 1.6 输出设置（格式/质量）总览

| 工具 | 单图 | 批量 | 默认值来源 |
|---|---|---|---|
| 水印 | ✅ | ✅ | 硬编码 original/90 |
| 裁剪 | ✅ | ❌ | `createOutputOpts()` |
| 尺寸调整 | ✅ | ❌ | `createOutputOpts()` |
| 压缩 | ✅（合并在压缩设置） | ❌ | 硬编码 original/80 |
| 格式转换 | ✅ | ❌ | 硬编码 png/90 |
| 分割 | ✅ | — | `createOutputOpts()` |
| 长图拼接 | ✅（本轮新增） | — | `createOutputOpts()` |

❓**待确认**：是否要求「所有工具的输出设置默认值都取自设置页『默认输出』」？目前只有裁剪/尺寸/分割/拼接是，其余四处硬编码。建议统一为 `createOutputOpts()`。

---

## 2. 批量工具：导入 / 导出 / 处理逻辑差异

### 2.1 导入 —— ✅ 已统一

5 个批量工具全部复用 `BatchImportPanel`：

- 导入方式：选择文件（多选）/ 扫描文件夹，一致
- `rel` 生成：选文件=文件名；扫文件夹=`relativePath(dir, p)`，一致
- 去重：按 path，一致
- 保存位置：`SaveLocationSetting`（选文件夹 + 常用位置 + 保持相对目录），一致

❗**共同缺陷**：扫描返回的 `errorList`（损坏/不支持的文件）被**静默混入**待处理列表，错误原因丢弃，直到运行时才逐张报错（`BatchImportPanel.vue:55`）。
❓是否改为「导入时提示 N 个文件无法读取，并询问是否跳过」？建议做。

### 2.2 导出 —— ❗有差异，含 2 处缺陷

| 工具 | 文件名后缀 | 扩展名规则 | 子目录 | 结束后打开的文件 |
|---|---|---|---|---|
| resizer | `_resized` | 恒沿用原扩展名 | keepRelative 时 ensureDir | ❌ `buildOutputPath(saveDir, 原文件名)` |
| compress | `_compressed` | 选了格式才换 | 同上 | ❌ 同上 |
| convert | `_converted` | 强制按目标格式 | 同上 | ❌ 同上 |
| cropper | `_cropped` | 恒沿用原扩展名 | 同上 | ✅ `resolveBatchOutputPath(...)` |
| watermark | `_watermarked` | original→输入扩展名，否则按格式 | 同上 | ❌ `buildOutputPath(...)` |

❗**缺陷 1（建议直接修）**：`BatchTool.vue:232-236` / `WatermarkBatchView.vue:180` 结束后「打开所在文件夹」用的是 `buildOutputPath(saveDir, 原文件名)` —— **没加后缀、也没加相对子目录**，keepRelative 时指向不存在的文件。cropper 用 `resolveBatchOutputPath` 是对的。建议统一。

❗**缺陷 2（建议直接修）**：jpeg 扩展名两处各写一套（`.jpg` vs `.jpeg`）。建议统一为 `.jpg`（`useOutputSettings.outExt` 已是 `.jpg`）。

❓**待确认：同名覆盖**。目前全部静默覆盖（无序号、无确认），`fileIO.ts` 的 `fileExists` 已定义但批量流程从未调用。是否在批量场景加「已存在则自动加序号 / 运行前提示将覆盖 N 个文件」？

### 2.3 处理逻辑 —— 基本一致，小差异

| 项 | 现状 |
|---|---|
| 循环 | 全部 `for...of` 串行 await |
| 进度 | 仅按钮文案「处理中 done/total」 |
| 单张失败 | catch 后 toast 提示并继续 |
| 取消 | 全部不支持 |
| cropper 额外 | 循环内多一次 `metadata` IPC；缺少裁剪区域合法性校验；按钮额外禁用 `files.length===0` |
| 文案 | 「批量裁剪完成」vs「批量处理完成」 |

建议：抽取 `useBatchRunner(files, saveDir, keepRelative, { op, suffix, extOf, buildOptions })` 统一循环/进度/ensureDir/错误处理/打开输出文件，各工具只提供 op 与参数构造。这样也顺带修掉上面两个缺陷。❓是否现在就做这次重构？

---

## 3. 确认结果（2026-09-30）与落地情况

| # | 事项 | 结论 | 落地 |
|---|---|---|---|
| 1 | 输出设置默认值 | 全部改为读设置页「默认输出」 | `createOutputOpts()` 已用于 resizer / cropper / slicer / splicer / compress / convert / watermark（单图与批量） |
| 2 | 批量补齐输出设置 | 是 | resizer / cropper 新增「输出设置」组；compress、convert 本就以格式+质量为参数；watermark 已有 |
| 3 | 裁剪批量对齐程度 | **完全对齐**（选 b） | 抽出 `CropControls.vue` + `useCropGeometry.ts`，单图与批量共用；批量补齐单位切换、比例模式百分比、九宫格定位（默认 nw，与单图一致） |
| 4 | 尺寸调整适配方式 | 统一 5 项 | 批量侧补齐 `contain` / `outside` |
| 5 | 压缩质量下限与文案 | 统一 10–100、统一「PNG（无损）/JPG（有损）/WebP（有损）」 | 单图与批量均已统一 |
| 6 | 格式转换 | 保持「默认 png、无保持原格式」；批量补质量；扩展名 `.jpg` | 已落地 |
| 7 | 两个缺陷 | 直接修 | `showItemInFolder` 改用真实输出路径；扩展名统一走 `outExt()` |
| 8 | 损坏文件 | 导入时提示并跳过 | `BatchImportPanel` 不再把 `errorList` 混入列表 |
| 9 | 同名覆盖 | 运行前弹窗三选一（自动重命名 / 覆盖 / 取消） | `useBatchRunner` + `useDialog.choose` |
| 10 | 消除三份重复 run() | 做 | `composables/useBatchRunner.ts` |
| 11 | 取消 | 加 | 处理中按钮变「取消」，已完成文件保留不回滚 |

### 裁剪越界的处理（批量，按确认的语义）

| 情况 | 处理 |
|---|---|
| 像素模式，目标图比区域小 | 尺寸按图片裁剪、位置钳到边界内；仍不足 1px 则跳过并提示「图片尺寸小于裁剪区域，已跳过」 |
| 像素模式，位置超出边界 | 钳到边界内 |
| 比例模式 | 按百分比换算到目标图，不会越界 |
