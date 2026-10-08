# 开发规范与统一约定

> 适用范围：本仓库后续所有开发维护。
> 最后更新：2026-10-08（输出/覆盖策略、拖放、窗口材质与圆角、禁用态令牌）

---

## 1. 可复用资产（优先复用，禁止复制粘贴重写）

### 1.1 组件（`src/renderer/components/`）

| 组件 | 用途 | 使用者 |
|---|---|---|
| `BatchImportPanel.vue` | 批量导入面板（选择文件 / 扫描文件夹 / 列表 / 清空） | 全部批量工具 |
| `SaveLocationSetting.vue` | 保存位置 + 常用位置 + **添加后缀名开关** + 保持相对目录（折叠卡形态，内部用 `SettingsCollapse` / `SettingsRow`） | 全部批量工具 |
| `BatchTool.vue` | 批量工具壳（resizer / compress / convert） | 3 个批量工具 |
| `WatermarkControls.vue` | 水印参数面板（含 `lockTile`、输出设置） | 水印单图 + 批量 + 全屏水印 |
| `CropControls.vue` | 裁剪参数面板（单位 px/比例、比例预设、九宫格定位、像素输入或百分比、使用整图） | 裁剪单图 + 批量 |
| `AppDialog.vue` | 全局对话框，支持 alert / confirm / **多选一（actions）** / **输入（prompt）** | 全局 |
| `template/TemplateEditor.vue` | 通用模板编辑页壳：左预览 + 右参数控件（`#controls` 插槽）+ 保存/另存/取消 | 水印模板编辑窗口（未来其它工具模板复用） |
| `template/TemplateLibrary.vue` | 通用模板库页壳：左类型侧栏 + 右模板卡片（样式对齐字体卡）+ 分体按钮（应用 + 更多） | 水印模板列表窗口（未来其它工具模板复用） |
| `ImagePicker.vue` | 单图工具的选图/预览占位，**已内置拖放**（`@drop` 回传本地路径） | 单图工具 |
| `FontSelect.vue` | 可搜索下拉（搜索 + 按字体本身渲染 + 滚动不穿透）；`fontPreview:false` 可当通用「可搜索选择器」用（如模板选择）。弹层固定 280px 并做窗口边界钳制；**宽度由使用方的 `ctl-*` 控制，组件内不要写 `width`** | 水印工具（字体 / 模板选择） |
| `settings/SettingsGroup.vue` | 设置分组：标题 + 圆角卡片容器（`title`、`count` 数量徽标） | **全部工具的设置区 / 应用设置页 / 批量导出（保存位置）** |
| `settings/SettingsRow.vue` | 设置行：左标签（可带 `desc`）+ 右控件 | 全部工具 |
| `settings/SettingsCollapse.vue` | 可折叠设置行：标题行点击展开，内部放 `SettingsRow`（`defaultOpen`） | 水印工具（位置基准 / 边距设置） |
| `AppDialog.vue` / `ToastHost.vue` | 全局对话框 / Toast | 全局 |
| `Layout.vue` / `WindowControls.vue` | 外壳与无边框窗口控制 | 全局 |
| `AppSidebar.vue` | 侧边栏（Logo + tablist 导航 + 可选「设置」），主窗口与内容型独立窗口（模板库）共用，`brand` / `showSettings` 区分 | 全局 |
| `ToolStub.vue` | 未实现工具占位 | 临时 |

### 1.2 组合式函数（`src/renderer/composables/`）

| 函数 | 用途 |
|---|---|
| `useSingleTool.ts` | 单图工具通用逻辑：选图、防抖预览、`runSave(buildName, runFn)`（**先选目录再处理**）、`evVal/evNum/evChk/extOf` |
| `useOutputSettings.ts` | 输出格式 + 质量：`createOutputOpts()` / `isLossy` / `outExt` / `withOutput` |
| `useBatchRunner.ts` | **批量执行器**：输出路径计算、同名覆盖策略（重命名/覆盖/取消）、串行执行、中途取消、进度、失败继续、结束后打开输出文件 |
| `useCropGeometry.ts` | 裁剪几何换算：定位基准→对齐方式、区域钳制、比例预设计算、区域适配到目标图 |
| `useDialog.ts` | `message` / `alert` / `confirm` / `choose` / `prompt`（**Electron 下 `window.prompt` 不可用，一律用 `prompt`**） |
| `useLocalFonts.ts` | 系统字体枚举、按族聚合、已安装判定 |
| `useOutputConflict.ts` | **输出文件冲突处理（单图与批量共用）**：`resolveOutputConflicts(planned, inputs)` 预检 + 三选一（自动重命名 / 覆盖 / 取消）、`uniquePath` 逐候选 `fileExists` 复核、`samePath` |
| `useUpdater.ts` | 全局单例更新器（启动自动检查 + 发现新版本→下载→安装弹窗；「已是最新」只在手动检查时提示） |
| `useWindowState.ts` | 窗口状态（最大化等）同步给渲染层（`html[data-maximized]`） |
| `useOnlineApi.ts` | 在线接口（字体库、公告、版本、客户端注册） |
| `useTheme.ts` | 深色模式 + 主题色（跨窗口同步） |

### 1.3 工具层

`utils/filePicker.ts`（选文件/目录）、`utils/directoryScanner.ts`（异步递归扫描，返回 fileList + errorList）、`utils/fileIO.ts`（`buildOutputPath` / `resolveBatchOutputPath` / `relativePath` / `ensureDir`）。

### 1.4 主进程

`src/main/image.ts` 是**唯一**的图像处理入口（op 白名单）；`fs.ts`、`ipc.ts`、`windows.ts`、`updater.ts`、`fonts.ts`（系统字体实时检测）、`templates.ts`（模板库 `userData/templates.json` + 编辑窗口入参暂存）、`templateAssets.ts`（模板素材 + 预览占位图）、`legacy.ts`（旧版 3.x 迁移）。

---

## 2. 分层与调用链规范

1. **渲染进程不碰 fs / sharp / shell**：一律通过 `window.api.*`（preload 暴露）。
2. 新增主进程能力时，必须同步**四处**：
   - `src/main/ipc.ts` 注册 `ipcMain.handle`
   - `src/preload/index.ts` 暴露方法
   - `src/shared/api-types.ts` 声明类型
   - （涉及图像处理时）`src/shared/types.ts` 的 `ImageProcessOp` / `ImageProcessOptions` / `ImageProcessResult`
3. 新增图像 op 时：`main/image.ts` 的 switch 增加分支，并同步 `shared/types.ts` 的 op 联合类型与 `ImageProcessOptions` 字段（**漏字段会导致 TS2339**）。
4. 预览统一走「无 `outputPath` → 主进程返回 buffer」；导出统一走「带 `outputPath` → 落盘」。

---

## 3. 样式规范

> 2026-10-01 起 Fluent 已升级到 v3（@fluentui/web-components 3.x）。令牌命名随之变化：
> - 颜色用 v3 令牌：`--colorNeutralForeground1`、`--colorNeutralBackground1/2/3`、`--colorNeutralStroke1/2`、`--borderRadiusMedium/XLarge`、`--fontSizeBase200/300` 等
> - 保留的应用级变量（定义在 `global.css`）：`--design-unit`(4，配合 `calc(var(--design-unit) * N * 1px)`)、`--accent-base-color`（fluent.ts 按设置页主题色写入）、`--accent-fill-rest`、`--app-fg-secondary`（次级文字色，v3 的 Foreground2 与本项目调校值不同）
> - v3 组件普遍无 `::part(control)`，要改组件内部样式就在宿主元素上覆盖它消费的设计令牌；v3 主题由 `fluent.ts` 的 `setTheme()` 驱动，自定义主题色经 `buildBrandVariants` 生成 16 阶品牌色（brand[80]=所选色）
> - 下拉一律用 `AppSelect`（v3 dropdown 必须内包 fluent-listbox 且 value 时序特殊），数字输入一律用 `NumInput`（v3 无 number-field）；不要直接用 `<fluent-dropdown :value>`

- 颜色一律用 Fluent 设计令牌，禁止硬编码色值（取色器除外）。
- 尺寸一律 token 化：`padding/margin/gap` 用 `calc(var(--design-unit) * N * 1px)`，圆角用 `--borderRadiusMedium`（控件）/ `--borderRadiusXLarge`（面板）。
- 字号用 `--type-ramp-*-font-size`。
- 布局硬约束（面板宽高、图标尺寸）、`box-shadow`、`transform`、1px 边框可保留具体像素。
- 覆盖全局样式（如 `.preview-stage` / `.preview-img`）时在本页 `<style scoped>` 内覆盖，不要改 `global.css` 影响其它工具。
- Fluent v3 的间距/字号/圆角令牌经 `setTheme()` 以 CSS 变量暴露，**间距语义优先用令牌**：
  `var(--spacingHorizontalS, 8px)` / `var(--spacingHorizontalM, 12px)` / `var(--spacingHorizontalL, 16px)`（带兜底值防未注入）。
- 元数据（EXIF）展示只走主进程筛好的分组（`ImageProcessResult.meta.sections`，`main/image.ts` 的 `readImageMeta`），
  不要把 `sharp metadata()` 的 `exif`/`icc` Buffer 摊平展示（会是几百项废数据）。
- **设置区一律用设置组件**：分组用 `SettingsGroup`，设置项用 `SettingsRow`，相关项折叠用 `SettingsCollapse`；**不要再写旧的 `.group` / `.field` / `.field-label` 结构**。
  - 适用范围：**工具参数 + 应用设置页 + 批量导出（保存位置）**。
  - **不适用**：批量导入面板（`BatchImportPanel`）与拼图图片列表这类「带边框容器 + 内部列表」的面板，保持自绘样式（标题 + 数量徽标 + 按钮行 + 滚动列表 + 底部栏），不要套设置组件。
- 控件宽度用全局类：`ctl-lg`(200) / `ctl-md`(160) / `ctl-num`(110) / `ctl-slider`(flex:1)；滑块旁的数值用 `.row-val`。
  - 注意：Fluent 组件自带 `min-width`（`fluent-select` 为 250px），`ctl-*` 已统一加了 `min-width: 0` 才能生效；**新增控件若宽度不生效，先查组件的 `min-width`**。
  - 注意：组件内 `<style scoped>` 的 `width: 100%` 优先级高于全局类，会顶掉使用方传的 `ctl-*`（`FontSelect` 踩过，已修：组件内不再写宽度）。
- 禁用按钮不要靠 `opacity`（会透出下层内容）。v3 无 `::part(control)`，做法是**在宿主元素上覆盖组件消费的禁用令牌**（`global.css`）：
  - `--colorNeutralBackgroundDisabled` / `--colorNeutralForegroundDisabled` / `--colorNeutralStrokeDisabled`
  - 主按钮（原 accent）的覆盖规则**必须排在通用规则之后**才生效：底色 = `accent-fill-rest` 淡化 45% + `--app-card`，文字 **白色**。

---

## 4. 用户在需求中明确的统一性要求（必须遵守）

| # | 要求 | 落地情况 |
|---|---|---|
| 1 | 单图工具**处理完成后再选择保存位置**（不做常驻的保存位置设置） | 拼图已从「保存位置设置」改为 `runSave`；与水印等单图工具一致 |
| 2 | 拼图预览：**滚轮=移动**（横向拼接横移、纵向拼接纵移），**不得用滚轮缩放** | 已实现，`@wheel.prevent` → `setOffset` |
| 3 | 拼图预览：**缩放由预览区下方滑块控制**，最小=contain、最大=cover | `fluent-slider`，`scaleT: 0→contain, 100→cover` |
| 4 | 拼图预览：横向拼接**始终垂直居中**、纵向拼接**始终水平居中**，任何缩放/移动下都不变 | `setOffset()` 强制另一轴为 0 |
| 5 | 拼图：**横向等高、纵向等宽**（取最大值，只放大不缩小） | 主进程 append 已实现 |
| 6 | 拼图支持：是否有边距、边距宽度、是否有底色、底色颜色 | 已实现（默认关闭，关闭时透明底） |
| 7 | 图片列表：容器 + 边框，**与批量工具左侧文件列表同款** | `.file-panel` 对齐 `BatchImportPanel` 视觉 |
| 8 | 右侧控制区**整体不滚动**，列表撑起高度，**列表内部滚动** | `.controls-body` 改为 flex column + `overflow:hidden`；`.file-list` 内部 `overflow-y:auto` |
| 9 | 拖拽 item 加高 + **迷你预览图**，能看出拖的是哪张 | 40×40 缩略图（主进程 sharp 生成 96px 再转 blob URL，按路径缓存并 revoke） |
| 10 | 拖拽用手感好的成熟方案 | `vue-draggable-plus`（SortableJS）：`forceFallback` + `fallbackOnBody` + `animation 220` + `handle='.grip'` |
| 11 | 手柄图标必须可见 | 内联 SVG 六点 grip（不要只用 3px 的 CSS 点，也不要依赖图标名解析） |
| 12 | 字体选择器：支持搜索、按字体本身渲染、展开后上下滚动不触发外层滚动 | `FontSelect.vue`（Teleport 到 body + `overscroll-behavior: contain`），搜索支持中文别名（雅黑→Microsoft YaHei 等） |
| 13 | 字体管理 UI 用 Fluent 官方组件（tablist） | `fluent-tabs` / `fluent-tab`（注意：需自绑 `@click` 驱动切换） |
| 14 | 输出设置（格式 + 质量）统一走 `useOutputSettings` | 拼图已接入；其余工具差异见 `TOOL_CONSISTENCY.md` |
| 15 | 文案统一 | 「文字转图片」→「富文本编辑器」（首页 + 侧边栏） |

---

## 5. 开发过程中确立的技术约定

### 5.1 图像处理

- **EXIF 方向**：所有 op 的 pipeline 都要 `.rotate()`（无参数 = 按 EXIF orientation 摆正，无 EXIF 时是 no-op）。
  老版本手工做过这件事，sharp **默认不随 EXIF 旋转**，漏掉会让手机竖拍照片躺着输出（见 `docs/LEGACY_COMPARISON.md`）。
- **尺寸换算必须用 `effectiveSize(meta)`**：`sharp.metadata().width/height` 是**未旋转**的原始尺寸，
  orientation 5~8 时显示尺寸宽高互换。凡涉及坐标/尺寸（裁剪区域钳制、拼接对齐、水印定位、回传渲染层的尺寸）
  一律用换算后的值，否则预览（已摆正）与输出会错位。
- 新增 op 时：pipeline 加 `.rotate()`；用到 metadata 尺寸的地方走 `effectiveSize`；裁剪类要先摆正再 extract。

- **大图必须考虑两件事**：① 预览要等比缩放（长边 ≤10000 且总像素 ≤6MP），避免生成/传输 GB 级预览；② 输出像素不得超过 libvips 上限 268402689（超限必须给中文提示并禁用保存按钮）。
- 真实输出尺寸由主进程通过 `ImageProcessResult.width/height` 返回，**不要拿预览图尺寸当真实尺寸显示**。
- JPG 不支持透明：任何 op 输出 jpeg 时，透明底必须兜底为白色，否则透明区变黑。
- 拼接对齐时的 resize 用 `fit:'fill'`（尺寸已按比例算好，避免 1px 舍入误差导致缝隙）。

### 5.1.1 水印的位置与大小

- 两种位置单位（`positionUnit`）：
  - `percent`：边距为占图宽/高的百分比（滑块）；大小为「水印整体宽度占图片宽度的百分比」（`sizePct`）
  - `pixel`：边距为绝对像素（输入框，**可为负**表示溢出）；字号为 px、图片水印沿用相对短边比例
- **允许溢出**（水印比图片大、或部分在图外）：sharp 要求 overlay 不得大于底图，因此合成前统一走 `clipComposite()` 按可见区域裁剪，**不要**再用水印超出底图就等比缩小的老逻辑。
- **不允许全部在图外**：`clipComposite` 会把位置钳到「至少保留水印自身 40%（不少于 4px）」可见。
- 水印渲染后统一 `trim()` 掉透明留白，否则「占图宽百分比」会把留白算进去（实测会偏差 30% 以上），极端边距也容易落在透明边上。
- 文字水印按百分比反算字号的做法：先用当前字号渲染一次量出实际宽度，再按比例换算字号重新渲染（librsvg 渲染结果为准，比按字符数估算准确）。

### 5.2 字体

- 导出侧：文本水印走 SVG `font-family` → librsvg **能直接命中系统字体**（中英文均已实测），**不需要传字体文件路径**。
- 预览侧：CSS `font-family` 同样可用；但 **Chromium 的 `queryLocalFonts()` 有进程级缓存**，装新字体后不刷新（需重启），所以：
  - 「是否已安装」的判定**必须走主进程实时检测**（注册表 + 字体目录），不要用渲染进程枚举结果；
  - 装完即可导出使用；预览要重启才生效 → 页面上给出「需重启」提示与重启入口。
- 字体安装流程：下载到 `appData/fonts/downloads/` → `shell.openPath` 调起系统安装器 → 轮询主进程检测 → 命中即标记已安装并**删除缓存文件**。

### 5.3 预览交互

- 预览区默认 `overflow:hidden`，不依赖滚动条；滚轮/拖动平移，缩放用滑块。
- `contain`/`cover` 随预览区尺寸变化重算（`ResizeObserver`），并把平移偏移夹回合法范围。
- 图片基础渲染尺寸按 contain 计算，再用 `transform: scale()` 放大 —— 避免大图按原始像素渲染。

### 5.4 批量

- 批量导入一律用 `BatchImportPanel`，保存位置一律用 `SaveLocationSetting`。
- **批量执行一律用 `useBatchRunner`**，不要再写自己的 `for` 循环；各工具只提供 `op`、`suffix`、`extOf`、`prepare(item)` 与可选的 `validate`。
- 覆盖策略：开始前用 `fileExists` 预检，有冲突才弹窗三选一（自动重命名 / 覆盖 / 取消），无冲突不打扰用户。
- 取消：`processing` 期间按钮切换为「取消」，调用 `cancel()`；已完成的文件保留、不回滚。
- 「保持相对目录」输出用 `resolveBatchOutputPath`，结束后打开的文件也必须用同一函数算（否则指向不存在的路径）。
- 参数控件与对应单图工具保持一致（同一套组件 / 同一套默认值来源）；新增参数时**两边一起改**。

### 5.5 对话框

- `message()` 走 Toast；`alert()` / `confirm()` 走全局对话框。
- 需要三个及以上选项时用 `choose(message, title, actions)`（返回被点击动作的 `value`），不要连套两个 confirm。
- 需要用户输入时用 `prompt(message, title, defaultValue, placeholder)`，返回输入文本、取消返回 `null`。
- 分体按钮（主操作 + 更多子项）用 `fluent-menu :split="true"` + `slot="primary-action"` / `slot="trigger"` + `fluent-menu-list`；
  **`:split` 必须绑布尔值**，写无值的静态属性时 Vue 走 DOM property 赋 `''`，组件不会进入分体形态。
  若主操作与「更多」要做成两个独立按钮（不连体），改用普通 `fluent-button` + 只带 trigger 的 `fluent-menu`；
  分体形态自带的分割线要自己补：`.more-btn::part(content) { border-inline-end: … }`（menu-button 的 content part 存在）。
- `AppDialog` 用**未注册**的 `fluent-dialog` 标签（不要去注册它）：因此必须自绘遮罩层（`position:fixed` + flex 居中），
  并且显式写 `.app-dialog[hidden]{display:none}`（作者样式的 `display` 会盖掉 UA 的 `[hidden]` 规则）。

### 5.6 跨窗口共享状态

- **一律放主进程**（模板库 `main/templates.ts`、编辑窗口入参 `template:setEditing` / `takeEditing`），
  不要依赖多窗口共享 localStorage：实测跨 renderer 进程的写入存在同步延迟，
  会出现「改动没落盘」「被另一个窗口的旧副本覆盖」。
- 主进程写入后广播全量数据给所有窗口（含发起方），渲染层直接采用即可，不要各自 hydrate / 合并。
- 需要持久化的用户数据统一走 `appDataDir()`（开发模式也指向产品目录，便于与老版本共用 userData）。

---

### 5.7 输出路径与覆盖

- 冲突处理**只有一个实现**：`composables/useOutputConflict.ts` 的 `resolveOutputConflicts(planned, inputs)`（预检已存在 → 三选一「自动重命名 / 覆盖 / 取消」）。单图 `useSingleTool.runSave` 与批量 `useBatchRunner` 都调它，**禁止在各自页面里再写一套同名检测**（单图侧曾完全没有，导致静默覆盖）。
- 「覆盖」若指向**输入文件自身**（用户要覆盖原图）：主进程 `image.ts` 的 `processImage` 会先写 `xxx.pftmp` 再原子替换 —— sharp 不允许读写同一个文件，且这样处理失败也不会损坏原图。**新增 op 不要绕过这层包装**。
- 批量输出文件名是否加后缀由保存位置的「添加后缀名」开关（`addSuffix`，默认开）决定；关闭时输出名与原文件同名，会走到冲突三选一。新增批量工具必须把这个开关传进 `useBatchRunner`。
- `uniquePath` 每次候选都要 `fileExists` 复核磁盘，不能只在内存集合里避让。

### 5.8 拖放取路径与打包后限制

- **拖放进来的文件取本地路径必须用 `window.api.fs.getPathOfFile(file)`**（preload 走 `webUtils.getPathForFile`）。
  Electron 新版本已**移除 `File.path`**（实测 `File.prototype` 上没有该 getter），直接读 `(file as any).path` 会拿到空字符串，表现为「拖进来没反应」。
- `ImagePicker` 已内置拖放（未选图落占位框、已选图落预览区可直接替换），各单图页只需监听 `@drop` 并调用 `setImage(path)`（`useSingleTool` 提供）+ 各自的加载流程。
- **打包版禁用开发者工具**：`windows.ts` 在 `app.isPackaged` 时拦截 `before-input-event` 的 F12 / Ctrl+Shift+I、J、C / ⌘⌥I，并对 `devtools-opened` 兜底关闭。dev 模式不受影响（仍自动打开）。

### 5.9 Windows 窗口材质与圆角

- 材质（`backgroundMaterial: 'acrylic'`）与圆角（`roundedCorners`）是 DWM 的**两个独立属性**，都要满足才有「有亚克力 + 圆角」。
- `roundedCorners` 对无边框窗口**默认就是 true**，不用显式设；真正的前提是**窗口不能是 transparent** —— transparent 窗口被 DWM 当分层窗口，既丢系统投影、也让圆角失效（electron#47510）。
  因此 Win11 22H2+（`supportsAcrylic()`）走「不透明窗口 + 原生材质」；`transparent: true` 只留给 macOS vibrancy 与老 Windows 的第三方毛玻璃库。
- `backgroundColor` 必须保持 `#00000000`：它是 DWM 材质**之下**的底色，**给实色会把亚克力完全挡住**。
- 页面侧在 `data-material='on'` 时把 `--shell-radius` 置 0（避免与系统圆角叠成「圆角套圆角」），阴影改 inset 描边，`--window-pad` 归 0。

### 5.10 批量输出文件名与裁剪比例

- **输出文件名**：批量工具用 `OutputNameSetting`（主项「添加后缀名」开关 + 子项「自定义后缀名」输入框）。
  开关关闭 → 输出名与原文件同名（会走冲突三选一）；自定义后缀留空 → 用各工具默认后缀（`_compressed` / `_resized` / `_converted` / `_watermarked` / `_cropped`）
- **裁剪比例**：`ratio` 既可以是预设键（`1:1`、`4:3`、`16:9`…），也可以是自定义值（`21:9`、`1.85`）；
  解析统一走 `useCropGeometry` 的 `parseRatio` / `ratioValue`（预设表 `CROP_RATIOS` 查不到就解析字符串）。**不要假设 ratio 一定在预设表里**

### 5.11 自定义协议与跨应用互通

**协议名（约定，不要随意改）**

| 应用 | 协议 |
|---|---|
| 洋芋田图像工具箱（本应用，被唤起方） | `potatofield-image-toolkit://` |
| 洋芋田富文本编辑器（唤起目标） | `potatofield-richtext-editor://` |

**本应用被唤起（`main/index.ts` + `package.json` 的 `build.protocols`）**

- 声明写在 `build.protocols`（Windows 安装器写注册表、macOS 写 Info.plist），
  启动时再 `app.setAsDefaultProtocolClient(PROTOCOL)` 兜底注册一次
- 三个入口都要处理，缺一个就会出现"某些场景唤不起"：
  - Windows 冷启动：协议 URL 在 `process.argv`
  - Windows 已运行：`second-instance` 事件的 `argv`
  - macOS：`app.on('open-url')`
- 支持的 URL：`://open`（打开/聚焦主窗口）、`://tool/<route>`、`://open?route=/xxx`（打开指定工具），
  统一走 `openToolInMainWindow()`（主窗口在就复用并切路由）

**唤起富文本编辑器（`main/companionApp.ts`）**

三级降级，顺序不能变：
1. **协议**：`app.getApplicationNameForProtocol('potatofield-richtext-editor://')` 有值 → `shell.openExternal`
2. **本地应用**：没协议就找已安装的程序 ——
   - Windows：PowerShell 查卸载项，**匹配逻辑写在 PowerShell 内部**（避免主进程解析中文输出乱码）；
     目录从 `InstallLocation` 取，为空则从 `UninstallString` 推导；exe 取目录下第一个**非卸载程序**
     （exe 名是本地化的，如「洋芋田富文本编辑器.exe」，**不要硬编码**）
   - macOS：在 `/Applications`、`~/Applications` 按名称找 `.app`（不依赖 Spotlight 索引）
   - 然后 `shell.openPath()` 启动
3. **都没有**：返回 `method: 'none'`，由渲染层打开下载页

注意事项：
- **协议名只用约定的那一个，不要列多个候选**（早期实现列过三个，已简化为单个常量 `COMPANION_PROTOCOL`）
- **必须先检测再唤起**：不检测直接 `openExternal('xxx://')` 时，Windows 会弹「你要如何打开这个链接」的系统对话框，macOS 静默无反应
- `getApplicationInfoForProtocol()`（拿安装路径）**只有 macOS 可靠**，Windows 会报 `Unable to retrieve installation path`，不要依赖它

## 6. 新增工具的检查清单

1. 页面放在 `src/renderer/pages/`，路由加到 `router/index.ts`（独立窗口加 `meta: { standalone: true, title }`；
   内容型独立窗口——如模板库/模板编辑——再加 `padMain: true`，让左右边距与主窗口一致）。
2. **入口一律加到 `consts/tools.ts`**（工具清单单一数据源，首页卡片与侧边栏都从这里取，避免两处叫法/图标不一致）。
3. 单图工具：用 `useSingleTool` + `ImagePicker`（**接 `@drop` 以支持拖入**，`ImagePicker` 已内置拖放）；
   批量工具：用 `BatchImportPanel` + `SaveLocationSetting`，并把 `addSuffix` 传进 `useBatchRunner`。
4. 需要输出设置就用 `createOutputOpts()`，并用 `outExt` / `withOutput`。
5. 涉及大图：预览传 `maxDimension`，并处理像素超限提示。
6. 处理完：`message(..., 'success')` + `shell.showItemInFolder`。
7. 样式走 §3 令牌；不要复制其它页面的 run() 逻辑，先考虑抽象。

---

## 7. 验证方式

- 构建：`npm run build`（vite，不做类型检查）；类型检查另跑 `npx vue-tsc --noEmit`。
- 运行时验证：以 `--remote-debugging-port=9223` 启动，用 chrome-devtools/electron-cdt MCP 在页面上下文里直接调用 `window.api.*` 做端到端实测（本轮所有结论：字体命中、拼接对齐、像素上限、预览缩放、拖拽组件挂载，都是这样实测出来的，而不是靠推断）。
- 无法自动化的部分（真实文件选择对话框、鼠标拖拽手感）请在结论中明确标注「需人工实测」，不要声称已验证。
