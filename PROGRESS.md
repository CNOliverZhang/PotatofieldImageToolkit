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
- [ ] EXIF 方向自动校正（老版有、新版未做，见 `docs/LEGACY_COMPARISON.md` §5）
- [ ] 模板码（templateCode）能力是否保留
- [ ] 模板能力扩展到其它工具（先补 `consts/tools.ts` 的 templateRoute 与摘要适配器）

---

## 进度日志（倒序）

### 2026-10-08（本机 · Windows）

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

**官网与发布物料**
- 官网首页重写（吸顶导航 + Hero + sticky 三幕滚动叙事 + 亮点 + 下载），深色模式改走 CSS 变量
- 版本号跳过 4.0 直接 5.0；推文 `docs/WECHAT_ARTICLE_v5.md`
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

## 未决问题

- 后端 `/image_toolkit/usage` 接口是否存在？（见 PLANNING §4）
- asar:false 是否必须
- 是否在各 op 统一加 `.rotate()` 做 EXIF 方向校正
- `SettingsGroup` 的 `count` 徽标属性当前无人使用，是否保留
- 拼图图片列表维持自绘面板（自绘 + 固定 340px）还是改回设置卡片样式
- 官网 4.0 版本上架后下载按钮才生效；推文截图需人工精修

## 关键约束（勿忘）

- appId = `cn.potatofield.imagetoolkit`
- publish url = `https://files.potatofield.cn/ImageToolkit/Packages/`
- win=nsis、mac=dmg、asar=false
- 在线接口 baseURL = `https://api.potatofield.cn`
- 跨窗口共享状态一律放主进程，不要依赖多窗口共享 localStorage
