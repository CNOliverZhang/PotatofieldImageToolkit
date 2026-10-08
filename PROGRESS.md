# 进度跟踪（跨会话）

## 水印模板功能（进行中）

### 已完成
- [x] 类型：`TemplateToolKey`（目前仅 watermark）/ `TemplateItem`（id/name/createdAt/updatedAt/params/legacy）
- [x] 存储：`settings.templates`（Record<toolKey, TemplateItem[]>）+ `legacyImported` 标记，走已有点
pinia 持久化
- [x] 素材持久化：`main/templateAssets.ts` —— 水印图复制到 userData/template-assets/<内容hash>.<ext>，模板只记文件名；hash 复用 + 引用计数删除
- [x] 迁移：`main/legacy.ts` —— 读 userData/vuex.json（appId 相同故同目录），导入 watermark.templates 与 globalWatermark.templates（后者 tile=true）
  - 老版字段：title/text/position/offsetX/offsetY/color(rgba)/font/relativeFontSize/image/imageSize/imagePosition/imageOffsetX/Y/imageOpacity/imageRotation；无 type 字段（image 非空即图片水印）
  - **字号换算**：老版 relativeFontSize 是「单字占图宽百分比」，新版 sizePct 是「整行占图宽百分比」→ sizePct = relativeFontSize × 可视字符数（已实现；中英混排会偏大，精确版需用字体实测宽度）
  - 开发模式下 Electron userData 名为 Electron，统一用 `appDataDir()` 指向产品目录
- [x] 入口：tools.ts 加 `templateRoute`（水印=/watermark/templates）→ 首页卡片 + 水印工具页各加「模板」按钮（独立窗口）
- [x] 模板列表页（独立窗口，meta.standalone）：卡片摘要（类型·位置·大小·不透明度+字体）、图片缩略图、「旧版」标签、空态、首次运行自动导入
- [x] 跨窗口应用：模板窗口 `window.api.template.apply` → 主进程广播（排除发送者）+ 主窗口置前 → App.vue 存 `watermarkPending` 并跳转 → watermark.vue 用 watch 载入参数
  - 两个坑：① params 是 Pinia 响应式 Proxy，IPC 无法克隆，必须传 `JSON.parse(JSON.stringify())`；② 必须用 watch 而非 onMounted，否则主窗口已在本页时再次应用不生效

### 本轮（2026-10-01 深夜 13）：批量裁剪接入 cropper 画布
- [x] 抽出 `components/CropCanvas.vue`（cropper.js 画布）：单图与批量共用，负责
  「画布 ↔ 裁剪区域」双向同步（region / ratio / position / meta 变化 → 画布；拖拽裁剪框 → 写回 region + emit change），
  以及容器尺寸变化后重建、居中轴的锚点约束、两轴居中时禁止移动裁剪框
- [x] 单图裁剪页改用该组件，删掉内联的 cropper 代码（顺带修掉 `cropper.options` 这一个历史 TS 报错）
- [x] 批量裁剪：预览区改为 cropper 画布（选中图经 `fs.readFileBase64` 转 data URI，与单图一致），
  CropControls 传 `use-canvas`（比例预设交给画布），初始区域为整图；导出仍按 `fitTo()` 逐图适配
- [x] 移除批量页已无用的 extract 预览逻辑（`previewUrl` / `schedulePreview`）

### 本轮（2026-10-01 深夜 12）：分割工具预览只显示第一块
- [x] 根因：`slicer.vue` 的 `refresh()` 把 `tileRegions()[0]`（第一行第一列）extract 出来当预览
- [x] 改为整图预览（`op:'resize'` 1600 inside），并用 `#stage` 插槽叠一层网格线示意切割：
  行/列方向的 `repeating-linear-gradient`（步长 `100%/cols`、`100%/rows`）+ outline 补外框；
  图片与网格用 CSS grid 放同一单元格，网格层自动贴合图片实际尺寸（图片是 object-fit: contain）

### 本轮（2026-10-01 深夜 11）：批处理中的关闭/退出确认
- [x] 主进程：`windows.ts` 维护 `busyWindows`（由渲染层 `window.setBusy()` 上报）、`forceClosing`、`pendingQuit`；
  `close` 事件对忙碌窗口 preventDefault 并下发 `window:confirm-close`；`requestQuit()` 供托盘「退出」使用
  （先把忙碌窗口 show+focus 再询问；无忙碌窗口则直接 `app.quit()`）
- [x] IPC：`window:busy` / `window:close-now` / `window:hide`；托盘「退出」改走 `requestQuit()`
- [x] 渲染层：`useBatchRunner` watch(processing) 同步忙碌状态，并监听 `window:confirm-close`
  弹出三选一（**中断并关闭 / 最小化到托盘 / 取消**）：中断=先 cancel 再 closeNow；最小化=hide
- [x] 窗口去重改为先 show 再 focus：「最小化到托盘」的窗口可从托盘菜单的批量入口重新调出
- [x] 文案：官网 highlights / 工具速览 三处补上「支持系统已安装字体（老版本只是内置几款，不算自定义）」；
  公众号文章（`docs/WECHAT_ARTICLE_v5.md`）新增说明，并顺带补了「跟随系统」与批处理关闭确认

### 本轮（2026-10-01 深夜 10）：图片读取改为 blob（file:// 直读的三个坑）
- [x] 全项目已无 `file://` 直读（此前 3 处）：
  - EXIF：不产生处理结果，原来直接用 file:// 显示原图 → 被拦成裂图；改为 op=metadata 后
    再走一次 `op:'resize'`（1600 inside）回传 buffer 转 blob
  - 色彩提取：file:// 不仅裂图，还会污染 canvas 导致 ColorThief 取不到像素；改为 resize 1200 → blob
  - 水印：`previewUrl || inputSrc` 的兜底会在新预览生成前闪一帧裂图 → 去掉兜底
- [x] `useSingleTool.setPreviewBuffer`：先赋新 URL 再释放旧的，换预览不留空窗（不再闪占位框/裂图）
- 备注：EXIF 元数据容器（`.meta-card`）与色彩提取虚线占位（`.placeholder`）的代码均在工作区
  （exif.vue / palette.vue），若界面上看不到，多半是合并期间 dev 热更新留下的旧状态 —— 重启 dev 再看

### 本轮（2026-10-01 深夜 9）：带控件的主项不可折叠
- [x] `SettingsCollapse`：有 `#control` 的主项恒展开且不显示 chevron（控件是主要操作，收起会挡住设置入口）；
  无控件的主项（裁剪位置、位置基准等）保持可折叠 + chevron + hover 反馈不变

### 本轮（2026-10-01 深夜 8）：主项/子项改为折叠卡（照抄水印工具「位置基准」）
- [x] 放弃 SettingsRow 的 `sub` 形态（两张卡用负 margin 拼在一起，观感与主项-子项不一致），
  统一改用 `SettingsCollapse`：主项是一张卡（72px 头行），子项是卡内的行（56px + hairline），
  与水印工具「位置基准」及其下的「位置 / 定位基准」完全一致
- [x] `SettingsCollapse` 新增 `#control` 插槽：主项右侧可放 select / 按钮 / checkbox 等控件，
  控件区独立容器并阻止冒泡（点控件不会误折叠）；chevron 单独成按钮
- [x] 改造点：保存位置（主项 + 常用位置/保持相对目录）、各工具「格式/输出格式/目标格式」（主项）+ 质量（子项）、
  水印「水印类型」（主项）+ 字段（子项）、拼接「添加边距/添加底色」（主项带开关）+ 边距宽度/底色（子项）、
  裁剪「裁剪位置」（主项）+ 定位基准/X/Y/宽/高/边距（子项）

### 本轮（2026-10-01 深夜 7）：侧边栏累积高亮复发（根因 fix）
- [x] 「工具 → 设置 → 工具」来回切换后多个导航项同时高亮复发。根因：Fluent v3 tablist 的
  `changeTab(oldId, newId)` 只按 oldId 清除上一个选中项，而上一轮为修「设置双高亮」把
  activeId 在 /settings 时置为 '/settings' —— 它不是真实 tab id，`getElementById` 查不到，
  旧高亮永远清不掉，每经过一次设置就多亮一个。
  修复：`normalizeSelection()` 在设置 activeid 后，以 activeId 为准全量同步所有 tab 的
  `aria-selected`（不再依赖组件的增量清除逻辑）

### 本轮（2026-10-01 深夜 6）：设置项层级化（主项/子项）
- [x] **SettingsRow 新增 `sub` 形态**：子项行并入主项卡片（抵消 sg-card 间距与主项下边框、无独立边框、
  左缩进 28px、行高 52px、顶部 hairline 分隔）；主项在后随子项时自动去下圆角（`:has(+ .is-sub)`）
- [x] **批量工具**：独立「保存位置」分组取消，控件并入「输出设置」组 ——
  「保存位置」（原「当前位置」改名，desc 显示当前目录）为主项，常用位置/保持相对目录为子项；
  SaveLocationSetting 改为行片段（不再自带标题），由 BatchTool（resizer 输出设置组 /
  compress、convert 设置组）、cropper-batch（输出设置组）、水印批量（WatermarkControls 新增
  `#output-extra` 插槽）各自放入
- [x] **质量 → 格式的子项**（所有出现处）：单图压缩/转换/尺寸、批量三类、水印输出设置、长图拼接
- [x] **水印工具**：模板行删「模板较多时可直接搜索」，「当前参数」desc 改「把下列参数保存为新模板」；
  WatermarkControls 的「文字/图片水印」分段 tab 删除，改为主项「水印类型」select，
  文本内容/颜色/不透明度/字体/字重（文字）与 水印图片/不透明度（图片）作为子项（按类型切换展示保留）
- [x] **长图拼接**：输出设置「提示」行删除；「边距宽度」为「添加边距」子项、「底色」为「添加底色」子项
- [x] **裁剪工具**（CropControls，单图/批量共用）：单位选项「比例」改名「百分比」；
  新增主项「裁剪位置」，定位基准/X/Y/宽度/高度/横向边距/纵向边距（随单位切换）全部为子项

### 本轮（2026-10-01 深夜 5）：三处小修
- [x] 「联系开发者 / 加入社区」链接间距 12 → 8px
- [x] **设置页与侧边栏同时高亮复发**：/settings 不在功能导航里，Layout 的 activeId 回退到
  lastNavId（上一次的工具），于是「上一次的工具」与底部「设置」入口同时亮。
  修复：路由为 /settings 时 activeId 给一个不在 items 里的 id，让 AppSidebar 走 `.is-inactive` 中和
- [x] **设置页滚到底间距偏大**：末尾 SettingsGroup 自带 22px margin-bottom 叠加在滚动内边距上；
  `:deep(.settings-group:last-child)` 置 0，与字体管理（28px）对齐

### 本轮（2026-10-01 深夜 4）：六项反馈
- [x] **颜色模式**：深色模式开关改为「跟随系统 / 浅色 / 深色」select（`settings.themeMode` 持久化，
  `darkMode` 变为由它推导的生效值）。跟随系统时经 `prefers-color-scheme` 监听实时响应
  （Electron 中它跟随 nativeTheme；`theme:set` 主进程把 themeSource 置为 system/dark/light），
  跨窗口同步载荷带上 mode。老用户无 themeMode 时默认 light，行为不变
- [x] **禁止拖拽调整窗口大小**：保持 `resizable: true`（否则会禁用 Windows 最大化按钮 / mac 绿灯），
  在 `will-resize`（darwin/win32）里拦截用户拖拽；最大化/还原走 `maximize()/unmaximize()`
  （程序化改尺寸不触发 will-resize），`runWithProgrammaticResize()` 供内部 setBounds 兜底放行
- [x] **版权信息页**：logo 行上下加间距；「开发者信息」白卡片去掉（一行轻量展示），
  「联系开发者」旁新增「加入社区」（频道链接 pd.qq.com）；MIT 链接改指向协议文本
  （opensource.org/licenses/MIT），「点此访问」指向洋芋田官网
- [x] **无用依赖清理**：element-plus、html2canvas 从 package.json 与「相关项目」列表移除
  （5.0 重写后已无引用）；其余依赖逐一核实均有使用（axios/crypto-js/exifr/vue-draggable-plus 等）
- [x] **裁剪页画布铺满整窗**：根因是 `#stage` 插槽的作用域样式盲区 —— `.preview-stage` 归 ImagePicker
  所有，cropper.vue 里对它的 scoped `position:relative` 不生效，`.cropper-box`（absolute; inset:0）
  退化到相对 `.app-shell` 定位、铺满整窗。修复：global.css 给 `.preview-stage` 加 `position: relative`
- [x] **Win11 材质**：`backgroundMaterial` 从 mica 改回 **acrylic**（质感与 Win10 库一致），
  页面叠色 `--material-tint-alpha` 78% → **60%**（对齐 Win10 库色调的 0x99）

### 本轮（2026-10-01 深夜 3）：边距收尾（用户 macOS 截图反馈）
- [x] **mac 红绿灯贴内容**：`--content-pad-top` macOS 从 28 → 32（与左右边距一致；红绿灯区约到 y≈26）
- [x] **下边距对齐上边距**：新增 `--content-pad-b` 并入全局（Windows 40 / macOS 32，与各自顶部一致），
  Layout 与页面级滚动的「末尾间距」都引用它；右侧控件滚动（controls-body）本就没有末尾补偿，
  footer 底部间距随 `--content-pad-b` 自动对齐顶部

### 本轮（2026-10-01 深夜 2）：滚动条与边距统一（用户 Windows 验证后反馈第二轮）
- [x] **滚动条不再占布局空间**：`::-webkit-scrollbar { width/height: 0 }`（Win11 悬浮滚动条语义），
  滚动功能保留（滚轮/触摸板/拖动）。此前经典滚动条吃掉滚动区右侧 10px，
  导致滚动内容比上下的固定元素（入口按钮/保存按钮）窄一条、右端对不齐；
  `--scrollbar-w` 同步改为 0，字体管理与模板列表里按滚动条宽度补偿内边距的写法（含 JS 检测）全部删除
- [x] **边距统一**：`Layout.vue` 的 `.content` 新增 `--content-pad-b`，左右/下边距统一为 32/28，
  顶部沿用平台值 `--content-pad-top`（Windows 40 让出自绘标题栏、macOS 28）；
  独立窗口不再收紧到 20px（`padMain` meta 与 `.pad-main` 样式一并移除）
- [x] **底部边距**：删掉 `.tool` / `.watermark-tool` / `.batch-tool` / 批量页 的 `-16px` 负 bottom margin
  （它们让工具区比内容区低一截，底部只剩 12px，与其它页面不一致）；`.batch-tool` 改为 `overflow: hidden`（滚动交给内部面板）
- [x] **右侧内边距全部变量化**：`.controls-pane` 的 `-32px`、`.controls-body` / `.controls-footer` / `.batch-entry`
  的 `24px` 以及 4 个文件里的本地同名声明，统一为 `var(--content-pad-x)`；
  设置页 / 字体管理 / 模板列表 的「延伸到窗口边缘」负 margin 也改用 `var(--content-pad-b)`
- [x] **模板列表整页滚动修复**：根因是独立窗口底部内边距是 20px、而列表的负 margin 写死 -28px，
  多出的 8px 让 `.content` 产生了整页滚动；改用 `--content-pad-b` 后与内边距严格抵消

### 本轮（2026-10-01 深夜）：八项体验修复（用户 Windows 验证后反馈）
- [x] **启动自动检查更新没人接**：更新状态与「发现新版本→下载→安装」弹窗原本只在设置页订阅，
  启动 3 秒的自动检查广播 `available` 时用户在首页 → 永远不提示（表现为"启动不提示更新，手动检查又可以"）。
  提升为全局单例 `composables/useUpdater.ts`（App.vue 启动接管），设置页复用同一状态；
  「已是最新/检查失败」提示只在**手动检查**时弹（避免每次开机噪音），下载中途失败仍会提示
- [x] **「常用位置」**（SaveLocationSetting，批量工具共用）：去掉「应用」按钮，选中即生效，desc 说明之
- [x] **右侧控件滚动区重构**（11 个文件）：`.batch-entry`（顶部入口）与 `.controls-footer`（底部按钮）
  移出滚动容器 `.controls-body`，成为 `.controls-pane` 的固定 flex 子项 —— 内容只在中间滚动，
  不再从顶部固定区/底部按钮底下穿过（原先靠 sticky + 透明背景，内容会透出来）；
  footer 顶部留 8px 间距；全局 CSS 相应去掉 sticky/z-index
- [x] **设置页**：页面本身不滚（tablist 固定），`.tab-panel` 独立滚动并延伸到窗口下缘
  （负 margin 抵消 `.content` 的 28px 底部内边距，滚到底由 padding-bottom 补回同样 28px）；
  tablist 与「外观」标题间距对齐分组间距（22px）
- [x] **字体管理 / 模板列表**：滚动区同样延伸到窗口下缘 + 滚到底补回 28px 间距；
  模板列表补上滚动条占位补偿（`has-scrollbar`，与字体管理同款），卡片右缘始终与「新建模板」按钮对齐
- [x] **EXIF**：读取前右栏显示虚线占位框（同色彩提取工具），读取后元数据放进带边框底色的容器（头部带「N 项」计数）
- [x] **尺寸调整**：提示统一为「填 0 等比缩放」并加到宽度处（单图 + 批量）；
  宽高都为 0 时禁用保存/开始按钮并 toast 提示（`invalidSize`，预览也跳过）
- [x] 顺手修 `AppSelect`：fluent v3 dropdown 在内部 control 就绪前赋值会同步抛 TypeError 并打断初始值重试链 → 接住后继续重试
- 备注：Windows 材质（mica/acrylic）相关规则都挂在 `[data-platform='win']`，本机（macOS）无法验证观感，需在 Windows 上确认

### 已完成（续，2026-10-01）
- [x] **独立编辑窗口** `pages/watermarkTemplateEditor.vue`（路由 `/watermark/templates/edit`，standalone，title『编辑水印模板』）
  - 左侧：中性占位图（主进程 `ensurePlaceholderImage()` 生成 1200×800 灰渐变，缓存在 template-assets 目录）经主进程套用水印参数渲染预览，不依赖用户图片
  - 右侧：直接复用 `<WatermarkControls v-model="params" />`，顶部加「模板名称」输入行
  - 底部：「保存模板」（新建/更新当前）/「另存模板」（存为新模板，窗口不关、切到新模板）/「取消」（关窗）
  - 保存前图片水印先 `template.saveAsset` 存素材，模板只记文件名
- [x] **常规模式**（watermark.vue）加「选择模板」下拉（app-select）+「存为模板」按钮；不再有编辑态
  - 应用模板时图片水印的素材文件名会先 `resolveAsset` 解析为绝对路径，否则主进程读不到图
- [x] **输入型对话框**：`ui.ts` 增加 `type:'prompt'` + `DialogInput`，`AppDialog.vue` 渲染输入框（打开即聚焦全选、回车=确定），`useDialog.prompt(msg, title, default, placeholder)`；**Electron 下 `window.prompt` 不可用**，重命名/存为模板/另存模板全部改走这里
- [x] 列表页「删除」（二次确认 + 素材引用计数清理）、「重命名」、「新建模板」均已实测通过

- [x] 模板库列表 header 与字体管理工具栏同高（40px）：标题行加左侧竖直强调条（呼应纵向 tablist 选中指示条），上下间距不再有差异

### 本轮（2026-10-01 晚）：六项反馈
- [x] **水印工具模板选择器支持搜索**：复用 `FontSelect`（新增 `fontPreview` / `searchPlaceholder` props，非字体场景关掉字体渲染与中文字体别名扩展）；选项 = 「不使用模板」+ 各模板
- [x] 水印工具页顶部「批量处理 / 模板管理」并列、各占一半（`gap: var(--spacingHorizontalM)`，Fluent 间距令牌经 setTheme 以 CSS 变量暴露，实测可用）；文案改为「模板管理」
- [x] 首页卡片两个入口也加 `gap: var(--spacingHorizontalS)`，文案改「模板管理」
- [x] 文本转图片页：去掉进入即弹的确认弹窗（页面本身就是指引）；文案「请前往下载」，按钮「前往下载」
- [x] 色彩提取右栏去掉与页面标题重复的「色彩提取」h2
- [x] **EXIF 读取重构**：
  - 旧版把 sharp metadata 的 `exif` Buffer 摊平 → 每个字节一条、几百项废数据
  - 主进程改用 `exifr` 解析，只保留摄影/设计关注字段，分组输出：文件 / 图像 / 拍摄信息 / 曝光参数 / 拍摄位置（有 GPS 才有）/ 归属与说明
    （`ImageProcessResult.meta.sections`，含快门分数化、光圈 f/x、ISO、焦距+等效焦距、曝光补偿 EV、测光/白平衡/曝光程序翻译、DPI、色度抽样等）
  - 布局：右栏整列不滚，「元数据」标题与卡片常驻，卡片 `flex:1` + 内部滚动（`:deep(.sg-card) overflow-y:auto`），空态有占位文案
- 验证：node 脚本直跑 `processImage(op=metadata)`（合成带 EXIF 的 JPEG）：各分组输出正确；无 EXIF 的 PNG 只出文件/图像两组不报错；UI 侧（入口布局/选择器/文案/标题）用 CDP 实测

### 官网第二轮反馈（2026-10-01）
- [x] **官网自身深色模式**：jss 动态 sheet 不会随站点深色模式重建（react-jss 的 theming 与 MUI ThemeContext 不同源，整个项目的既有问题）——改为页面颜色全部走 CSS 变量，由 React 按 darkMode 在根元素注入（`--it-bg/paper/text/text2/divider/hover/nav-bg/渐变/阴影` 等），切换即时生效（已实测 body 与整页同步变深）
- [x] 滚动叙事从「上下渐隐」改为**横向滑动切换**（轨道 translateX，指示点在标题右侧、方向语义一致）；第三幕文案改「使用模板」（不再绑定具体工具）
- [x] 版本号：**跳过 4.0，直接 5.0**（应用 package.json version=5.0.0；官网 eyebrow、推文标题与正文同步改为 5.0；推文移至 `docs/WECHAT_ARTICLE_v5.md`）

### 发布准备（2026-10-01）：官网重写 + 5.0 公众号推文
- [x] **官网首页重写**（`potatofield-frontend/src/Pages/ImageToolkit/Home/`，旧「整页翻页」方案弃用）：
  - `constants.ts`：全部文案与截图素材集中管理；`hooks.ts`：useReveal（IntersectionObserver 渐入）/ useScrollProgress（把滚动推进写成 CSS 变量 `--p`）/ useStickyProgress（sticky 场景进度）/ useScrolled
  - 结构：玻璃拟态吸顶导航 → Hero（渐变光斑 + 大标题 + 截图随滚动放大上浮）→ **sticky 三幕滚动叙事**（单张/批量/模板，文字切换 + 截图交叉淡入 + 进度点）→ 亮点六卡（渐入）→ 数字条 → 工具速览网格 → 下载卡片（接口取最新版本）→ 页脚
  - 深浅色自适应、`prefers-reduced-motion` 降级；截图为本地资源（`src/Assets/Images/ImageToolkit/*.png`），由 CDP 从运行中的应用自动截取（16 张）
  - 坑：`.root` 上的 `overflow-x:hidden` 会让页面 div 变成滚动容器，内部 `position:sticky` 全部失效（滚动叙事空白）——已移除，横向溢出由各 section 自己裁剪
- [x] **5.0 公众号推文初稿**：`docs/WECHAT_ARTICLE_v5.md`（风格参考 50/77/142 三篇；技术名词+通俗解释；截图位置已标注，对应本地文件）
- [ ] 待人工：截图精修（建议把带示例图片的界面重截，见文内标注）；公众号后台逐张传图；官网 4.0 版本在管理后台上架后下载按钮即生效

### 微调（用户反馈第三轮）
- [x] 「更多」按钮对齐 Fluent 分体按钮次段样式：文字 | 全高分割线 | chevron
  （分割线用宿主 `::after` 全高绘制，`::part(content)` 加尾边距让文字在左段居中；
  此前 `::part(content)` 短线不像官方形态）
- [x] 模板库侧边栏顶部留白与主窗口一致：`.content.standalone` 的顶边距变量化（`--content-pad-top: 40px`），
  侧边栏负 margin 拉回窗口顶部，留白交给其 brand padding（含 `--titlebar-inset`，mac 红绿灯不重叠）
- [x] 列表上方恢复「水印模板」标题（与数量并排，中等字号），不再是光秃秃的数量

### 本轮（2026-10-01 傍晚）：模板列表页对齐主窗口侧边栏 + 分体按钮拆分（用户反馈第二轮）
- [x] **侧边栏抽成 `components/AppSidebar.vue`**（主窗口与模板库窗口共用）：
  Logo + tablist 导航 + 可选的底部「设置」，样式与原主窗口侧边栏完全一致；
  主窗口 `Layout.vue` 改为使用该组件。模板库窗口差异仅两处：品牌文字「模板列表」、无「设置」。
- [x] **模板列表页**：去掉顶部大标题；左侧边栏贴窗口左缘（负 margin 抵消 `--content-pad-x`，同字体管理右侧滚动区手法）；
  路由 meta 加 `hideTitle: true`（页面自带侧边栏品牌，顶栏不再重复显示标题）
- [x] **「应用」与「更多」拆成两个独立按钮**（间距 8px，不再连体）；
  「更多」内文字与 chevron 之间的分割线用 `.more-btn::part(content)` 补回
  （Fluent 分体按钮的分割线只在 `[split]` 形态里由组件提供，拆开后要自己画）
- [x] **独立窗口打开后显式置前**：`windows.ts` 的 `ready-to-show` 里 `show()` 后补 `focus()`
  —— macOS 上仅 show 不一定把新窗口带到前台，表现为「编辑图片水印模板时唤起的还是主窗口」。
  同时「应用」不再是分体按钮的主操作，菜单项点击也不可能误触应用。
- 备注：AppDialog 的遮罩层此前已修复（未注册的 fluent-dialog 会排进文档流）；本轮截图验证均基于 built 运行。

### 本轮（2026-10-01 下午）：模板页重构为通用组件 + 边距/样式修复（用户反馈）
- [x] **组件抽象**（为未来其它工具的模板铺路）：
  - `components/template/TemplateEditor.vue` —— 通用模板编辑页壳：左预览 / 右参数控件（`#controls` 插槽）/ 底部「保存·另存·取消」，使用方只提供预览渲染与保存逻辑（水印编辑页已改为薄壳）
  - `components/template/TemplateLibrary.vue` —— 通用模板库页壳：左侧「模板类型」侧栏（目前仅水印，`consts/templates.ts` 单一数据源）+ 右侧模板卡片；卡片样式对齐字体管理卡片（72px 高、4px 圆角、app-card 底、4px 间距、hover 高亮）；操作为 Fluent `fluent-menu split` 分体按钮：主按钮「应用」（默认大小）+「更多」子项（编辑/重命名/删除）
  - `pages/watermarkTemplates.vue` / `pages/watermarkTemplateEditor.vue` 改为两个通用组件的水印特化薄壳
- [x] **fluent-menu split 的坑**：`<fluent-menu split>` 写无值静态属性不生效 —— 元素升级后 Vue 走 DOM property 赋值，`''` 被组件当成 false；
  必须 `:split="true"`（fluent.ts 新增注册 menu / menu-button / menu-item / menu-list）
- [x] **独立窗口边距对齐主窗口**：路由 meta 加 `padMain: true` → Layout 给 `.content` 加 `pad-main` 类，`--content-pad-x` 用 32px（模板列表/编辑两个页面；批量窗口仍 20px）
- [x] **编辑页左右轻微滚动修复**：去掉从水印页抄来的 `.controls-pane { margin-right:-32px }` 与负 bottom margin（那是主窗口补偿内边距的写法），模板页左右完全固定
- [x] **吸底保存按钮下的背景色块**：删除 global.css 里 `.controls-footer` 的 `background: var(--app-bg)`
  —— 有系统材质（毛玻璃/亚克力）时这块实色底会浮在玻璃上很突兀；按钮自身有底色，滚动内容直接从下穿过

### 修复（用户反馈，2026-10-01）
- [x] **对话框没有浮在页面上层**：`fluent-dialog` 故意未注册（见 `fluent.ts` 注释），被当成普通元素排进文档流、落到页面末尾并「顶」页面。
  `AppDialog.vue` 自绘遮罩层：`position:fixed; inset:0; z-index:9999` + flex 居中 + 半透明遮罩；
  **必须同时写 `.app-dialog[hidden]{display:none}`** —— 作者样式的 `display:flex` 会盖掉 UA 的 `[hidden]` 规则。
  圆角/边框/阴影从无效的 `::part(control)` 移到卡片 `.dlg` 上。
- [x] **列表页图片水印缩略图裂开**：原先 `file://` 直读，渲染进程加载 file 子资源被拦（编辑页能看到是因为那里走 IPC buffer→blob）。
  改为与拼图列表一致：主进程 `resize` 到 96px → blob URL，按素材文件名缓存，组件卸载时 revoke。

### 架构修正（重要，实测发现）
- **模板库改由主进程持有**（`main/templates.ts` → `userData/templates.json`，IPC：`template:list/add/update/remove/setLegacyImported`）
  - 原方案「两窗口共享 localStorage」实测不可靠：跨 renderer 进程的 localStorage 写入存在同步延迟，
    出现「编辑窗口保存的模板根本没落盘」「A 窗口改动被 B 窗口旧副本覆盖」——先改成广播整份列表仍会覆盖，最终改为权威数据放主进程
  - 主进程写入后广播全量数据给**所有**窗口（含发起方），渲染层 `settings.applyTemplateStore(data)` 直接采用；
    Pinia 持久化用 `persist.paths` 排除 templates / legacyImported，避免启动时先显示过期副本
  - 编辑窗口入参同样改走主进程暂存（`template:setEditing` / `takeEditing`），不再经 localStorage
- 窗口 key 带模板 id（`watermark-template-editor-<id>`），避免复用已打开窗口时把新参数丢掉

### 待办
- [ ] 打包/公证未跑（`npm run package:mac`）；真实文件对话框与拖拽手感需人工实测
- [ ] 模板能力扩展到其它工具（splicer 等）时，先补 tools.ts 的 templateRoute 与摘要适配器

### 已定决策
- 只做水印一种模板（全局水印已合并为水印工具的一个选项 tile）
- **改为独立编辑窗口**（原计划在水印工具页做编辑模式，已推翻）：保存区/预览区与常规工具不同、无需侧边栏、且能规避编辑中点侧边栏跳走的体验问题；控件区复用 WatermarkControls
- 模板列表页为独立窗口；入口在首页卡片 + 水印工具页，与批量入口并列
- 通用性：tools.ts 的 templateRoute 模式，未来加新工具只需加一行 + 摘要适配器
- **跨窗口共享状态一律放主进程**（模板库、编辑入参），不要依赖多窗口共享 localStorage

最后更新：**2026-10-01 · 框架升级（Electron 44 + Fluent v3）**

## 本轮（2026-10-01）已完成：Electron 28→44 + Fluent v2→v3 框架升级

- [x] **Electron 链升级**：electron 28.3.3→44.5.1、electron-vite 2.3.0→5.0.0、electron-builder 24→26.15.3、electron-updater 6.8.9；Node 需 ≥22.12（本机用 v24.8.0，已写 `.nvmrc`）。electron 44 起 npm 包不再在 postinstall 下载二进制，新装环境需在 `node_modules/electron` 下手动 `node install.js`
- [x] **Fluent v3 迁移**（@fluentui/web-components 2.6.1→3.1.3 + 新增 @fluentui/tokens）：
  - 420 处设计令牌映射改名（如 `--neutral-foreground-rest`→`--colorNeutralForeground1`、`--control-corner-radius`→`--borderRadiusMedium`）；`--design-unit`(4)、`--accent-base-color`、`--accent-fill-rest`、`--app-fg-secondary` 保留为 global.css 应用级变量（v3 无对应物或取值与本项目调校不同）
  - 组件迁移：select→`AppSelect`（v3 dropdown 必须内包 `<fluent-listbox>`，且 value 属性时序早于 options 连接会丢失，封装内延后赋值+重试）、text-field→text-input、number-field→`NumInput`（v3 无此组件，原生 input[type=number] 对齐 v3 text-input 外观）、tabs→tablist、appearance accent→primary（index.vue 首页按钮改用 v3 原生 `size="small" shape="circular"`）
  - 主题重写（`fluent.ts`）：v2 的 baseLayerLuminance/accentBaseColor 全部移除，改为 `createLight/DarkTheme(brand)` + `setTheme()`；自定义主题色按 HSL 生成 16 阶 BrandVariants，**brand[80] 精确等于所选色**（亮色主按钮与所选色完全一致），暗色主色取 brand[100]
  - ::part 覆盖适配：v3 无 `::part(control)`，禁用按钮改为宿主级覆盖组件消费的令牌（`--colorNeutralBackgroundDisabled` 等）；slider 的 positioning-region→track-container，且 v3 有分步刻度需 `::part(track-container)::after{display:none}` 隐藏；SaveLocationSetting 的 select 内部 part 覆盖已删（v3 dropdown 无 part，待实测）
  - 注意：**不要用 define-all 注册**（会连 fluent-dialog 一起注册，而 AppDialog 依赖"未注册标签+自绘样式"的行为）；fluent.ts 按需 define
- [x] **验证**：CDP 截图对比升级前基线（首页/设置/字体/水印/尺寸/压缩/转换/拼接/裁剪/色彩/EXIF/分割 12 页 + 批量独立窗口），视觉一致；运行时实测 sharp resize、界面缩放、开机启动、queryLocalFonts 均正常；暗色模式+自定义主题色（#8b5cf6）实测正常。vue-tsc 错误从迁移前 19 个降到 3 个（均为历史遗留：cropper/colorthief/compress 格式类型）
- [x] **用户实测反馈的回归修复**（2026-10-01）：① 圆角全丢——v2 圆角令牌是无单位数字（`calc(var(--x) * 1px)`），v3 的 `--borderRadius*` 自带 px，乘 1px 后成非法值整条声明被丢弃；codemod 去掉 37 处多余 `* 1px` 并化简 `calc(圆角)`。② 卡片与背景同色——`--app-card` 原映射撞上了 `--app-bg` 的令牌，改为 bg=`colorNeutralBackground3`(#f5f5f5)/card=`colorNeutralBackground1`(#ffffff)，并让原先与 layer-2 同源的区域改跟 `--app-bg`
- [x] **第二轮反馈修复**（2026-10-01）：① 下拉选择后出现黑色焦点环——v3 dropdown 的焦点环挂在 `:focus-within`（鼠标选择也触发）且外圈用 `--colorStrokeFocus2`(黑)，在 AppSelect 里覆盖这两个令牌去掉（保留展开时的主题色下划线作焦点指示）；② 下拉弹层被后面的卡片/按钮盖住——v3 展开时把光 DOM 的 `fluent-listbox` 变 `position:fixed` 但 z-index 为 auto，DOM 靠后的定位元素会画在其上，AppSelect 里给 `fluent-listbox` 设 `z-index:1000`；③ 禁用主按钮变灰——v3 对所有 appearance 的禁用态统一走 `--colorNeutralBackgroundDisabled/ForegroundDisabled`，主按钮的变体覆盖必须改这两个令牌（`accent-fill-rest 45% + app-card` 混底 + 白字），且必须排在通用禁用规则之后
- [x] **第三轮：收起的 select 控件盖住吸底保存按钮**——v3 给每个 dropdown 的 `.control` 设 `position:relative; z-index:1`，而 `.controls-footer` 只有 `isolation:isolate`（z=auto 的层叠上下文），滚动时被反压。已给 5 处 `.controls-footer`（global.css/watermark/BatchTool/cropper-batch/WatermarkBatchView）统一加 `z-index:10`（>控件 1，<弹层 1000）；ToastHost 本有 9999 不用动
- [ ] 待办：electron-builder 26 打包/公证未跑（`npm run package:mac`）；真实文件对话框与拖拽手感需人工实测；SaveLocationSetting 长路径截断在 v3 dropdown 下待实测

## 换电脑续接：先读这些

新会话（或另一台电脑）请先按顺序读：
1. 本文件 `PROGRESS.md` —— 当前进度与未完成项
2. `docs/DEVELOPMENT_GUIDE.md` —— **统一组件、样式规范、用户明确的统一性要求、新增工具检查清单**（动手前必读）
3. `docs/TOOL_CONSISTENCY.md` —— 单图 vs 批量差异、待确认清单
4. `docs/LEGACY_COMPARISON.md` —— 新老版本实现/性能对比
5. `PLANNING.md` —— 总体架构与规划

代码在 GitHub：`git@github.com:CNOliverZhang/potatofield-image-toolkit.git`（分支 `main`）。换机器后先 `git pull` 再开工。

> 本轮产出三份文档，后续会话请先读 `PLANNING.md` + `PROGRESS.md` + `docs/` 下三份：
> - `docs/TOOL_CONSISTENCY.md` —— 单图 vs 批量、批量导入导出的差异与待确认清单
> - `docs/LEGACY_COMPARISON.md` —— 新老版本实现/表现/性能对比
> - `docs/DEVELOPMENT_GUIDE.md` —— 统一组件、既有约定、开发维护规范

## 本轮（2026-09-30 下午）已完成：设置组件全量推广 + 样式细节修复

- [x] **设置组件已覆盖全部工具**：compress / convert / resizer / slicer / splicer / cropper(含共享 `CropControls`) / cropper-batch / `BatchTool`（批量尺寸·压缩·转换）/ palette（色彩提取）/ exif（数据卡片）/ settings（应用设置页）/ `SaveLocationSetting`（批量导出）
- [x] 全局旧结构（`.group` / `.field` / `.field-label` / `.row` / `.label`）在控制区内已清零，实测各路由残留 0
- [x] 控件宽度修复：Fluent 组件自带 `min-width`（`fluent-select` 250px）会顶掉 `ctl-*`，统一加 `min-width: 0` 后 select 恢复 160px
- [x] `FontSelect` 宽度不再随字体名变化（组件内 `width:100%` 的 scoped 优先级高于外部 `ctl-lg`，已移除）
- [x] 字体搜索面板：固定 280px + 窗口边界钳制（靠右时向左收，不再被截断）
- [x] 禁用按钮：不透明化（原来 `opacity:0.3` 会透出下层）；accent 用 `accent-fill-rest` 淡化 45% + **白字**，其余用卡片色混主文字色；两主题自适应
- [x] 补齐从未定义的主题令牌 `--neutral-foreground-secondary-rest`（此前全项目靠继承兜底）；`--accent-base-color` 实为 Fluent(fast) 运行时注入，静态值降级为兜底
- [x] **拼图页高度溢出修复**：图片列表面板固定 340px（列表内部滚动），控制区恢复全局 `overflow-y:auto` 可滚动
- [x] `SettingsGroup` 新增 `count` 数量徽标属性（当前无人使用，留作能力）

### 边界约定（重要，别越界）
- 设置组件适用于：**工具参数 + 应用设置页 + 批量导出（保存位置）**
- **不适用**：`BatchImportPanel`（批量导入）与拼图图片列表这类「带边框容器 + 内部列表」的面板，保持自绘样式
  （曾误改批量导入，已用 `git checkout` 回滚；拼图列表也已恢复自绘面板，仅保留固定高度）

## 本轮（2026-09-30）已完成：Windows 设置风格控件体系（进行中）
- [x] 新建设置组件体系 `components/settings/`：`SettingsGroup`（分组标题 + 卡片容器）、`SettingsRow`（左 label 右控件）、`SettingsCollapse`（可折叠行，子行不限高）
- [x] 行分隔用「卡片背景=分隔线色 + 行间 1px 间隙」实现；行背景 `--app-card`，hover 高亮
- [x] 全局控件宽度类：`ctl-lg`（200px）/ `ctl-md`（160px）/ `ctl-num`（110px）/ `ctl-slider`（弹性）/ `row-val`
- [x] 水印工具已迁移：三个分组卡片化；「位置基准」（位置单位 + 定位基准九宫格）、「边距设置」（横向/纵向）为默认展开的折叠组；旋转等独立设置为不可折叠行
- [x] 按钮禁用：所有单图工具保存按钮在未选图时禁用；批量工具在列表为空时禁用
- [ ] 待推广：裁剪/尺寸/压缩/转换/分割/拼接/EXIF/色彩/字体管理/设置页/批量参数区（组件已就绪，逐工具迁移即可）

## 本轮（2026-09-30）已完成：水印位置与大小模型改造
- [x] 位置支持两种单位：百分比相对位置 / 绝对像素位置
- [x] 百分比模式：大小为「水印整体宽度占图片宽度的百分比」（按渲染实测宽度反算字号，实测 10/20/50/100% 精确命中）
- [x] 像素模式：字号维持 px、图片水印维持相对短边比例；边距改为 px 输入框（可为负）
- [x] 允许溢出：水印比图大或部分在图外均可（合成前按可见区域裁剪，替代原先「超出就等比缩小」的旧逻辑）
- [x] 不允许全部在图外：位置钳到至少保留水印自身 40%（不少于 4px）可见
- [x] 水印渲染后 trim 掉透明留白（百分比与边距判定才准确）
- [x] 分组调整：「样式及内容」→「样式和位置」；字号/大小移入并置于横向边距之上；不透明度移入「基础设置」置于颜色之后

## 本轮（2026-09-30）已完成：批量工具统一

- [x] 新建 `useBatchRunner`：三个批量实现（BatchTool / WatermarkBatchView / cropper-batch）的 run() 统一，消除约 60% 重复代码
- [x] 覆盖策略：开始前预检同名文件，弹窗三选一「自动重命名（`a_1.png` 依次避让）/ 覆盖 / 取消」；无冲突不弹窗
- [x] 中途取消：处理中按钮变「取消」，已完成文件保留、不回滚
- [x] 对话框扩展多选一：`ui.ts` 加 `DialogAction` + `type:'choose'`，`useDialog.choose()`，`AppDialog.vue` 按 actions 渲染
- [x] 批量与单图对齐：尺寸调整适配方式补 5 项 + min 约束；压缩文案/质量范围统一；格式转换补质量、默认 png、扩展名 `.jpg`；裁剪完全对齐
- [x] 裁剪参数抽出 `CropControls.vue` + `useCropGeometry.ts`，单图（带 cropper.js 画布）与批量（无画布）共用
- [x] 批量裁剪越界处理：像素模式按图片裁剪并钳位、不足 1px 跳过并提示；比例模式按百分比换算
- [x] 输出设置默认值统一读设置页「默认输出」（compress / convert / cropper / watermark 四处原为硬编码）
- [x] 水印单图改用 `runSave`（与其它单图工具一致的保存流程与提示）
- [x] 两处缺陷修复：批量结束后打开的文件改用真实输出路径（原指向不存在的路径）；jpeg 扩展名统一 `.jpg`
- [x] `BatchImportPanel`：扫描到的损坏文件不再混入列表，改为导入时提示并跳过

## 本轮（2026-09-29）已完成：单图处理收尾
- [x] 字体管理改造：双 Tab（线上字体 / 系统已安装字体，基于 `queryLocalFonts`）
- [x] 线上字体「安装到系统」：`shell.openPath` 调起系统字体安装器；**已安装判定改由主进程实时检测**（`main/fonts.ts` 读注册表 + 字体目录），绕开 Chromium 字体枚举缓存；安装成功即删除下载缓存 + 启动兜底清理 + 手动「清理缓存」入口
- [x] 水印工具接入系统字体（字体选择器支持搜索、按字体本身渲染、中文字体别名搜索、滚动不穿透）
- [x] 字体管理 Tab 改用 Fluent 官方 `fluent-tabs`
- [x] 长图拼接：横向等高 / 纵向等宽对齐；可选边距（宽度）+ 可选底色（颜色），默认关闭（透明底）
- [x] 长图拼接：拖拽排序（`vue-draggable-plus`）、item 缩略图、列表面板化（与批量工具同款）、控制区不滚动 + 列表内部滚动
- [x] 长图拼接：预览改为「滚轮=移动、底部滑块=缩放（contain↔cover）」，横向拼接始终垂直居中、纵向始终水平居中
- [x] 长图拼接：保存改为单图流程（点按钮后选目录，输出一张，`xxx_spliced.ext`）+ 输出格式/质量设置
- [x] 大图加固：预览等比缩放（长边 ≤10000 且 ≤6MP，避免生成/传输 GB 级预览）；像素上限（268MP）中文提示 + 超限禁用保存；真实输出尺寸由主进程返回
- [x] 「文字转图片」改为引导页：进入即弹窗告知已独立为「洋芋田富文本编辑器」，可跳转 https://potatofield.cn/richtexteditor ；首页/侧边栏文案统一为「富文本编辑器」
- [x] 梳理并输出三份文档（一致性 / 老版本对比 / 开发规范）
- [x] 压测：240MP 拼接 10.4s、RSS 145MB；276MP 触发上限快速失败（详见 `docs/LEGACY_COMPARISON.md` §6）


## 已完成
- [x] 老项目完整分析（架构、12 工具、在线接口、更新兼容）
- [x] `PLANNING.md` 编写
- [x] 新项目目录 `potatofield-image-toolkit/` git init（分支 main）
- [x] 技术栈选型确定（electron-vite + Vue3 + Pinia + Element Plus + sharp 主进程）
- [x] 项目骨架文件：package.json / tsconfig / electron.vite.config / electron-builder 配置
- [x] 主进程骨架：index.ts / windows.ts / ipc.ts / updater.ts / image.ts / fs.ts
- [x] preload 骨架
- [x] renderer 核心：main.ts / App.vue / router / stores(settings,fonts,messages) / composables(useTheme,useOnlineApi,useDialog) / utils(filePicker,directoryScanner,fileIO,templateCode) / components(WindowControls,Layout,ToolStub) / index / settings / fonts / palette
- [x] 示范工具 palette.vue（色彩提取）实现完整链路
- [x] 11 个工具占位页
- [x] 注册为 `Potatofield` 大仓 submodule（已正确提交，gitlink 入 index；分支 main，SHA 3757c65）

## 本轮（2026-07-31 后续）已完成
- [x] 水印边距改造：单像素 `offset` → 横/纵双百分比 `offsetX`/`offsetY`（`shared/types.ts` / `main/image.ts` / `watermark.vue`），按 gravity 条件显隐
- [x] sharp `composite` 浮点坐标修复（`resolvePosition` 非居中分支加 `Math.round`）
- [x] 全站样式系统化迁移到 Fluent UI 设计令牌：颜色全部走 UI 库变量；清理 `global.css` 内自定义变量与暗色块，明暗主题由 Fluent `baseLayerLuminance` 经 JS 驱动
- [x] 左上角 logo 由 font-awesome 图标替换为资源图片（`renderer/assets/logo.png`，`Layout.vue` 改用 `<img>`）
- [x] 组件像素值 token 化：所有 `padding`/`margin`/`gap` 与圆角 `border-radius` 改用 `--design-unit` / `--layer-corner-radius` / `--control-corner-radius`（无单位令牌使用处乘 `1px`）；布局硬约束、图片/图标尺寸、`box-shadow`、`font-size`、1px 边框、`transform`、`letter-spacing` 保留

## 本轮（2026-08-03）已完成：批量处理独立窗口
- [x] 窗口机制打通：主进程 `windows.ts` 已有 `openWindow({route,key})` 工厂；新增 IPC `window:open`，preload/api-types 暴露 `window.api.window.open`，渲染进程可开独立窗口（按 key 去重 + hash 路由）
- [x] store（`settings.ts`）新增 `recentSaveDirs` 常用保存位置列表 + `addRecentSaveDir` / `removeRecentSaveDir`（持久化）
- [x] 全局可复用组件：`BatchImportPanel`（选择文件 / 扫描文件夹 / 已导入列表）、`SaveLocationSetting`（保存位置 + 常用位置）
- [x] 水印参数面板提取为 `WatermarkControls.vue`（支持 `lockTile`，全屏水印复用）；`watermark.vue` 单张页接入并在操作区顶部加 sticky「批量处理」入口
- [x] 独立窗口批量工具：`watermark-batch`（完整）、`global-watermark-batch`（平铺锁定）；`BatchTool` 通用组件支撑 resizer/compress/convert 批量（底层 image op 已存在）
- [x] 首页双入口：5 个批量工具卡片加「批量处理」按钮，点击开独立窗口

## 设计原则：单张 tab + 独立窗口批量（双形态）
- 支持「无人值守批量处理多张（含文件夹递归扫描 + 保持目录结构）」的工具，采用**双形态**：主窗口内以功能 tab 形式开「单张处理」，并提供独立窗口的「批量处理」入口。
- 批量工具清单（5 个，来自老项目能力确认）：加水印、全屏水印、尺寸调整、压缩、格式转换。
- 语义不同于「每张独立输出批量」的工具（长图拼接 splicer、裁剪 cropper）**保持纯 tab**，只以功能 tab 形式存在，无独立批量窗口。
- 首页支持批量的工具提供两个入口：单张 tab 入口 + 批量独立窗口入口。
- 复用要点：批量窗口的左侧导入/扫描/列表（`BatchImportPanel`）、保存位置设置（`SaveLocationSetting`）、水印参数面板（`WatermarkControls`）均为全局可复用组件，其它工具后续做批量时直接复用。
- **独立窗口不显示左侧功能导航**：路由 `meta.standalone = true` 标记独立窗口页面，`Layout.vue` 据此隐藏 `sidebar`；`WindowControls` 的 `inset` 置 0（主窗口为 232，需避开侧边栏），并以 `meta.title` 在左上角显示「logo + 工具名」替代缺失的系统标题栏，同时同步 `document.title`。后续新增独立窗口页面，只需在路由上加 `meta: { standalone: true, title: 'xxx' }`。

## 子模块注册说明（重要）
- 源仓库备份在 `C:/potatofield-image-toolkit-src`（二进制/备份用，可删）。
- `.gitmodules` 中 url 已设为 `git@github.com:CNOliverZhang/potatofield-image-toolkit.git`（占位，推到远端后生效）。
- 子模块自身 remote 当前指向本地备份路径，推送前需在子模块内执行：
  `git -C potatofield-image-toolkit remote set-url origin git@github.com:CNOliverZhang/potatofield-image-toolkit.git`
- 注册过程中遇到 git 限制：`file://` 传输被禁，需用 `git -c protocol.file.allow=always` 或本地绝对路径注册。

## 待做（按会话）
> 状态注记：样式系统、Fluent token 化、logo 资源替换、水印参数（offsetX/offsetY）已在本轮完成；以下为原始规划，工具业务逻辑仍按此推进，未变更。

### 当前状态（2026-09-29 更新）
- [x] 单图处理工具：水印、裁剪、尺寸调整、压缩、格式转换、分割、长图拼接 —— 功能均已完成
- [x] 批量工具：水印 / 全屏水印 / 尺寸 / 压缩 / 转换 / 裁剪 —— 功能均已完成（导入与保存位置已统一）
- [x] 字体管理、色彩提取、EXIF、设置页 —— 已完成
- [x] textToImage —— 已外移为独立产品「洋芋田富文本编辑器」
- [x] ~~待确认：单图/批量差异统一（11 项）~~ —— 2026-09-30 已全部完成，见 `docs/TOOL_CONSISTENCY.md` §3
- [ ] **待评估**：EXIF 方向自动校正（老版有、新版未做，见 `docs/LEGACY_COMPARISON.md` §5）
- [ ] **待定**：模板码（templateCode）能力是否保留（老版水印/拼接有）
- [ ] 主题/默认路径/参数接入全页面 + 自动更新联调 + win/mac 打包

## 本轮（2026-10-08）已完成：拖放选图 + 打包禁用 DevTools

- [x] `ImagePicker` 支持把图片拖进来：未选图落占位框、已选图落预览区可直接替换；悬停时整块描边 + 「松开鼠标以替换」遮罩；非图片格式给出提示
- [x] 8 个单图页面全部接入 `@drop`（compress / convert / resizer / slicer / cropper / watermark / exif / palette）；`useSingleTool` 新增 `setImage(path)`，与 `pickImage` 共用状态更新
- [x] 关键坑：Electron 新版**已移除 `File.path`**，改用 preload 暴露的 `webUtils.getPathForFile`（`window.api.fs.getPathOfFile`），否则拖放静默失效
- [x] 打包版禁用开发者工具：`before-input-event` 拦截 F12 / Ctrl+Shift+I、J、C / ⌘⌥I + `devtools-opened` 兜底关闭（dev 模式仍自动打开，不受影响）

## 本轮（2026-10-08）已完成：输出路径冲突与覆盖策略统一

- [x] 修复用户反馈「输出目录选原目录报错 `Cannot use same file for input and output`」
  - 根因 1：单图工具走 `useSingleTool.runSave`，**完全没有同名/同路径检测**（那套三选一只做在批量侧 `useBatchRunner`）
  - 根因 2：压缩工具在「保持原格式」时输出名 == 原文件名（`compress.vue:91-92`），存到原目录即撞车
  - 根因 3：主进程无任何输入==输出校验，各 op 直接 `toFile(outputPath)`
- [x] 主进程 `processImage` 加包装：输出==输入时先写 `.pftmp` 临时文件再原子替换，失败清理临时文件 → 支持「覆盖原图」且不损坏原图（实测压缩到自身 47ms、文件被替换、无残留；分隔符/大小写差异也能识别）
- [x] 抽出 `useOutputConflict.ts`：预检 + 三选一 + `uniquePath`（每步 `fileExists` 复核），单图与批量共用
- [x] 单图 `runSave` 接入冲突处理（此前会静默覆盖同名文件）
- [x] 批量侧：`useBatchRunner` 改用共享冲突处理；新增 `addSuffix` 配置
- [x] 保存位置新增「添加后缀名」开关（默认开，文案「输出文件添加后缀名以避免覆盖原文件」），BatchTool / WatermarkBatchView / cropper-batch 三处接入

## 未决问题
- 后端 `/image_toolkit/usage` 接口是否存在？（见 PLANNING §4）
- cropperjs 版本（v1 vs v2）
- asar:false 是否必须
- 单图/批量差异是否全部按建议统一（见 `docs/TOOL_CONSISTENCY.md` §3）
- 是否在各 op 统一加 `.rotate()` 做 EXIF 方向校正
- `SettingsGroup` 的 `count` 徽标属性当前无人使用，是否保留
- 拼图图片列表是否维持自绘面板样式（现为自绘 + 固定 340px），还是改回设置卡片样式

## 关键约束（勿忘）
- appId = cn.potatofield.imagetoolkit
- publish url = https://files.potatofield.cn/ImageToolkit/Packages/
- win=nsis, mac=dmg, asar=false
- 在线接口 baseURL = https://api.potatofield.cn
