# 进度跟踪（跨会话）

最后更新：**2026-10-08**

## 换电脑续接：先读这些

新会话（或另一台电脑）开工前按顺序读：
1. 本文件 —— 当前进度与未完成项（**日志倒序，最新在最上**）
2. `docs/DEVELOPMENT_GUIDE.md` —— 统一组件、样式规范、用户明确的统一性要求、新增工具检查清单（**动手前必读**）
3. `docs/TOOL_CONSISTENCY.md` —— 单图 vs 批量差异清单
4. `docs/LEGACY_COMPARISON.md` —— 新老版本实现/性能对比
5. `PLANNING.md` —— 总体架构（部分内容已过时，见其中标注）

代码在 GitHub：`git@github.com:CNOliverZhang/potatofield-image-toolkit.git`（分支 `main`）。换机器后先 `git pull`。
新环境若起不来：多半是 electron 二进制没下载，执行
`$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"; node node_modules/electron/install.js`
（`npm rebuild electron` 不触发它的下载脚本）。

---

## 当前状态（快照）

- [x] 单图工具：水印 / 裁剪 / 尺寸调整 / 压缩 / 格式转换 / 分割 / 长图拼接 —— 功能完成
- [x] 批量工具：水印（含全屏） / 尺寸 / 压缩 / 转换 / 裁剪 —— 功能完成，统一走 `useBatchRunner`
- [x] 字体管理、色彩提取、EXIF、设置页、水印模板 —— 完成
- [x] textToImage —— 已外移为独立产品「洋芋田富文本编辑器」
- [x] 设置区 UI 体系统一（settings 三组件覆盖全部工具 + 设置页）
- [ ] 打包/公证未跑（`npm run package:win` / `package:mac`）；打包后需确认 DevTools 已禁用、圆角与亚克力观感
- [ ] 模板能力扩展到其它工具（先补 `consts/tools.ts` 的 templateRoute 与摘要适配器）
- [ ] 「从模板码导入」入口（目前只有导出分享，`decodeTemplate` 无调用方）
- [ ] **图片水印模板的分享形态待定**：模板码只编码参数，不含图片素材数据（见「模板码分享」的限制说明）

---

## 进度日志（倒序）

### 2026-10-08（本机 · Windows）

**EXIF 方向自动校正**（老版有、新版缺失的能力补齐）
- 主进程各 op（resize / convert / compress / extract / append / watermark）统一加 `.rotate()`（按 EXIF 摆正，无 EXIF 为 no-op）
- 新增 `effectiveSize(meta)`：`metadata().width/height` 是未旋转尺寸，orientation 5~8 时显示尺寸宽高互换；
  裁剪钳制、拼接对齐、水印定位、回传渲染层的尺寸全部改用它
- 裁剪预览改用主进程摆正后的图（blob URL，替代原 base64 data URI），坐标与输出 1:1
- 实测：400×200 且 orientation=6 的图 → 元数据 200×400、resize 输出 100×200、裁剪与拼接尺寸均正确

**模板码分享（入口已隐藏，代码保留）**
- `utils/templateCode.ts` 恢复（此前误当死代码删除）：`encodeTemplate` / `decodeTemplate`
- 链路已通：模板列表卡片「更多」→ `share` 事件 → 使用方编码参数并复制到剪贴板（剪贴板不可用时退化为弹窗展示）
- **入口暂时不显示**：模板列表菜单里的「分享模板」菜单项已注释掉（交互方案待定，见下条限制）。
  恢复方式：`TemplateLibrary.vue` 菜单里加回 `<fluent-menu-item @click="emit('share', item)">分享模板</fluent-menu-item>`（注释里写了）
- **已知限制（重要）**：模板码只编码参数对象，图片水印的素材**不在里面** ——
  `params.watermarkPath` 存的是本机 `userData/template-assets/<hash>.png` 的**文件名**，
  主进程 `resolveTemplateAsset()` 只在本机查这个文件（`templateAssets.ts:54`），
  对方机器上必然不存在 → 应用该模板时水印图片读不到（`buildWatermarkComposites` 抛「未选择水印图片」）。
  文字水印模板无此问题（参数自包含；字体缺失时会降级为系统字体）。
- 备注：`decodeTemplate` 目前**没有调用方**（未做「从模板码导入」），需要的话再补入口；否则可删

**裁剪自定义比例 + 自定义后缀名**
- 裁剪：比例预设新增「自定义」，可填 `3:2` 或宽高比数值（如 `1.5`）；`useCropGeometry` 新增 `parseRatio`（支持全角冒号）/ `ratioValue`，预设表里没有就按自定义解析，画布与批量无画布两条路都生效
- 输出文件名：后缀开关从「保存位置」子项抽出，成为独立设置项 `OutputNameSetting`（主项开关 + 子项「自定义后缀名」，说明「如不设置，则采用默认后缀名」）；
  `useBatchRunner` 新增 `customSuffix`，留空则用各工具默认后缀（`_compressed` / `_resized` / `_watermarked` / `_cropped`）；三个批量页全部接入

**自定义协议与富文本编辑器唤起**
- 本应用注册协议 **`potatofield-image-toolkit://`**（`package.json` 的 `build.protocols` + 启动时 `setAsDefaultProtocolClient` 兜底），
  支持 `://open`、`://tool/<route>`、`://open?route=/xxx`；Windows 冷启动 argv / second-instance、macOS open-url 三个入口都处理
- 富文本编辑器协议约定为 **`potatofield-richtext-editor://`**（单个常量，不再列多个候选）
- 新增 `main/companionApp.ts`：三级降级唤起 —— 协议 → 本地应用 → 返回 none（前端打开下载页）；
  Windows 用 PowerShell 查卸载项（匹配放 PS 内部避免中文乱码）、exe 取目录下第一个非卸载程序；
  macOS 在 /Applications 按名称找 .app
- 引导页（textToImage）按钮联动：装了显示「打开富文本编辑器」，没装显示「前往下载」
- 实测：检测到本机 1.3.1 → 点击走 `method: 'app'` 拉起 `C:\Program Files\potatofield-richtext-editor\洋芋田富文本编辑器.exe`（进程确认后已关闭）
  （它目前没注册协议，注册后代码无需改动会自动走协议）

**Win11 窗口圆角修复**
- 现象：有亚克力材质但四角是硬直角。根因是窗口无条件 `transparent: true`，transparent 窗口被 DWM 当分层窗口 → 既丢系统投影、也让 `roundedCorners`（对无边框窗口**默认就是 true**）失效（electron#47510）
- 修法：`supportsAcrylic()`（Win11 22H2+）走**不透明窗口 + 原生 `backgroundMaterial: 'acrylic'`**；`transparent` 只留给 macOS / 老 Windows
- `backgroundColor` 必须保持 `#00000000`：它是 DWM 材质**之下**的底色，给实色会把亚克力完全挡住
- 页面侧无需改动（`data-material='on'` 时 `--shell-radius: 0`，避免"圆角套圆角"）

**拖放选图 + 打包禁用 DevTools**
- `ImagePicker` 支持拖入：未选图落占位框、已选图落预览区直接替换；悬停描边 + 「松开鼠标以替换」遮罩；非图片格式提示
- 8 个单图页接入 `@drop`；`useSingleTool` 新增 `setImage(path)`
- **坑**：Electron 新版已移除 `File.path`，取路径必须用 preload 暴露的 `webUtils.getPathForFile`（`window.api.fs.getPathOfFile`），否则拖放静默失效
- 打包版禁用 DevTools：`before-input-event` 拦截 F12 / Ctrl+Shift+I、J、C / ⌘⌥I + `devtools-opened` 兜底关闭

**输出路径冲突与覆盖策略统一**
- 修复用户反馈「输出目录选原目录报错 Cannot use same file for input and output」
  - 根因：单图 `runSave` 没有同名/同路径检测（三选一只做在批量侧）；压缩在「保持原格式」时输出名 == 原文件名；主进程无校验
- 主进程 `processImage` 加包装：输出==输入时先写 `.pftmp` 再原子替换 → 支持覆盖原图且不损坏原图（实测 47ms、无残留）
- 抽出 `useOutputConflict.ts`（预检 + 三选一 + `uniquePath` 每步复核磁盘），单图与批量共用
- 批量保存位置新增「**添加后缀名**」开关（默认开），BatchTool / WatermarkBatchView / cropper-batch 三处接入

### 2026-10-01（另一台电脑 · macOS）

**框架升级：Electron 28→44、Fluent v2→v3**（含三轮用户回归修复）
- 依赖：electron 44.5.1 / electron-vite 5 / electron-builder 26.15.3 / electron-updater 6.8.9；Node ≥22.12
- 420 处设计令牌改名（如 `--neutral-foreground-rest`→`--colorNeutralForeground1`）；`--design-unit`、`--accent-base-color`、`--accent-fill-rest` 保留为应用级变量
- 组件：select→`AppSelect`、text-field→text-input、number-field→`NumInput`（v3 无此组件）、tabs→tablist、appearance accent→primary
- 主题重写：`createLight/DarkTheme(brand)` + `setTheme()`，自定义主题色按 HSL 生成 16 阶，brand[80] 精确等于所选色
- 回归修复：① v3 圆角令牌自带 px，乘 1px 会整条声明失效（37 处）；② `--app-card` 撞上 `--app-bg`；③ 下拉焦点黑环 + 弹层被盖（listbox 需 z-index）；④ 禁用主按钮必须覆盖 `--colorNeutralBackgroundDisabled/ForegroundDisabled`；⑤ `.controls-footer` 需 `z-index:10` 否则被 select 控件反压
- 注意：不要用 `define-all` 注册（会连 fluent-dialog 一起注册，破坏 AppDialog 的自绘行为）

**水印模板功能**（本轮最大新增）
- 数据由**主进程持有**（`main/templates.ts` → `userData/templates.json`）：跨窗口共享 localStorage 实测不可靠（写入延迟 / 旧副本覆盖）
- 素材持久化 `main/templateAssets.ts`（内容 hash 命名 + 引用计数删除）；老版模板迁移 `main/legacy.ts`（读 vuex.json，含 relativeFontSize→sizePct 换算）
- 通用组件 `TemplateEditor.vue` / `TemplateLibrary.vue` + 水印特化薄壳；独立编辑窗口（非页内编辑态）
- 坑：params 是 Pinia Proxy，IPC 前必须 `JSON.parse(JSON.stringify())`；应用模板必须用 watch 而非 onMounted

**体验修复（多轮反馈）**
- 更新检查提升为全局单例 `useUpdater.ts`（原来只在设置页订阅，启动时首页永不提示）
- 「常用位置」去掉「应用」按钮，选中即生效
- 右侧控件滚动区重构（11 文件）：顶部入口与底部按钮移出滚动容器
- 滚动条改悬浮式（width 0），边距全部变量化（`--content-pad-x/b`）
- EXIF 改用 `exifr` 解析并按组展示（旧版把 exif Buffer 摊平成几百项废数据）
- 图片读取全改 blob（EXIF / 色彩提取 / 水印三处 `file://` 直读的坑：裂图 + canvas 污染）
- 禁止拖拽改窗口大小（`will-resize` 拦截，保留 resizable 以留住最大化按钮）
- 深色模式改「跟随系统 / 浅色 / 深色」三档

**官网（独立仓库）**
- 官网首页重写（吸顶导航 + Hero + sticky 三幕滚动叙事 + 亮点 + 下载），深色模式改走 CSS 变量
- 坑：`.root` 的 `overflow-x:hidden` 会让内部 `position:sticky` 全部失效

### 2026-09-30

**设置组件全量推广**（`components/settings/` 三组件覆盖全部工具）
- compress / convert / resizer / slicer / splicer / cropper(+共享 CropControls) / cropper-batch / BatchTool / palette / exif / settings / SaveLocationSetting
- 控件宽度：Fluent 组件自带 `min-width`（select 250px）会顶掉 `ctl-*`，统一加 `min-width: 0`
- `FontSelect` 组件内 `width:100%`（scoped 优先级更高）会盖掉外部 `ctl-lg`，已移除
- 禁用按钮不透明化：accent 用 `accent-fill-rest` 淡化 45% + 白字
- 补齐从未定义的次级文字色（现名 `--app-fg-secondary`，此前全项目靠继承兜底）；`--accent-base-color` 实为 Fluent 运行时注入（静态值仅兜底）
- 拼图页高度溢出：列表面板固定 340px，控制区恢复可滚动
- **边界约定**：设置组件适用于工具参数 + 设置页 + 批量导出；**不适用** `BatchImportPanel` 与拼图图片列表（带边框容器 + 内部列表，保持自绘）

**设置组件体系建立** + **水印位置与大小模型改造** + **批量工具统一**
- `useBatchRunner` 合并三个批量实现（消除约 60% 重复）；覆盖策略三选一、中途取消、进度、失败继续
- 单图/批量差异 11 项全部按建议统一
- 水印：百分比/像素双单位、允许溢出但不允许全在图外、渲染后 trim 透明留白

### 2026-09-29

**单图处理收尾**
- 字体管理双 Tab（线上 / 系统已安装，基于 `queryLocalFonts`）+ 安装到系统
- 长图拼接：等高/等宽对齐、边距与底色、拖拽排序、预览「滚轮=移动 + 滑块=缩放」、保存改单图流程
- 大图加固：预览缩放（≤6MP）、268MP 像素上限中文提示 + 超限禁用保存
- textToImage 改为引导页（外移「洋芋田富文本编辑器」）
- 压测：240MP 拼接 10.4s、RSS 145MB；276MP 触发上限快速失败
- 产出三份文档（一致性 / 老版本对比 / 开发规范）

### 2026-08-03

**批量处理独立窗口**
- `openWindow({route,key})` + IPC `window:open`；`BatchImportPanel` / `SaveLocationSetting` / `WatermarkControls` 三个复用组件
- 设计原则：支持批量输出的工具采用「单张 tab + 独立批量窗口」双形态；语义上不是"每张独立输出"的（拼图、裁剪）保持纯 tab
- 独立窗口 `meta.standalone` 隐藏侧边栏，左上角显示「logo + 工具名」

### 2026-07-31 及之前

- 水印边距改横/纵双百分比；sharp composite 浮点坐标修复
- 样式系统化迁移到 Fluent 设计令牌；组件像素值 token 化
- 项目骨架：主进程（index/windows/ipc/updater/image/fs）+ preload + renderer 核心；示范工具 palette；11 个占位页
- 注册为 `Potatofield` 大仓 submodule

---

## 待办与路线图

- [ ] 跑通打包与公证（`package:win` / `package:mac`），并确认打包版 DevTools 已禁用
- [ ] 模板能力扩展到其它工具（先补 `consts/tools.ts` 的 templateRoute 与摘要适配器）
- [ ] 确认后端 `/image_toolkit/usage` 接口形态（见 PLANNING §4）
- [ ] 评估是否保留 `SettingsGroup` 的 `count`（当前无人使用）
- [ ] 拼图图片列表样式最终确认（自绘面板 vs 设置卡片）

## 关键约束（勿忘）

- appId = `cn.potatofield.imagetoolkit`
- publish url = `https://files.potatofield.cn/ImageToolkit/Packages/`
- win=nsis、mac=dmg、asar=false
- 在线接口 baseURL = `https://api.potatofield.cn`
- 跨窗口共享状态一律放主进程，不要依赖多窗口共享 localStorage
