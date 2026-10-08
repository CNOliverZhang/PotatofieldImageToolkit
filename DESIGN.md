# 洋芋田图像工具箱 · UI 设计语言（Windows 11 Fluent UI）

> 本文档定义整个重写的视觉风格。所有页面、组件、弹窗必须遵循本文档的变量与规范。
> 最后更新：2026-07-31（由液态玻璃切换为 Fluent UI）
>
> ⚠️ **历史文档（Fluent v2 时代）**：以下内容已随 Fluent v3 迁移失效 ——
> 组件属性（`appearance="accent"` → `primary`）、令牌名（`--accent` / `--card-bg` / `--mica` / `--main-color` 等已不存在）、
> 主题机制（`baseLayerLuminance` → `setTheme()` + `createLight/DarkTheme`）、
> 窗口材质（`transparent:true` + 假圆角 → `backgroundMaterial` + 条件 transparent 的真圆角）。
> **现行规范看 `docs/DEVELOPMENT_GUIDE.md` §3（样式规范）与 §5.9（窗口材质与圆角）。**

---

## 0. 设计语言总览

**风格：Windows 11 Fluent UI（类“设置”页面）**，采用微软官方出品的 **Fluent UI Web Components**（`@fluentui/web-components`，基于 FAST，框架无关，可在 Vue 中作为自定义元素使用）。

核心视觉特征：
- Mica 风格背景（纯 CSS 渐变模拟，无原生桌面捕获 → 无延迟、无性能问题）
- 左侧导航栏 + 右侧内容区的“设置”式布局
- 所有控件使用官方 fluent-* 组件，严格遵循 Fluent 设计令牌（圆角、间距、强调色、层级）
- 主题色（用户可在设置中调节）作为唯一强调色，作用于 Fluent 的 `accentBaseColor`
- 深浅色通过 Fluent 设计令牌 `baseLayerLuminance` + CSS 变量 `data-theme` 切换

> **为何放弃液态玻璃**：Windows 上 `backdrop-filter` 无法模糊 OS 桌面；用原生面板实时折射桌面虽有真实折射，但存在移动延迟与性能开销。FluentUI 更为干净、稳定、符合“设置”页预期。

---

## 1. 窗口层配置（主进程）

文件：`src/main/windows.ts`

| 配置 | 值 | 说明 |
|---|---|---|
| `transparent` | `true` | 仅用于实现圆角（CSS `.app-shell { border-radius }` 裁切，四角透明）；**不再做玻璃折射** |
| `backgroundColor` | `'#00000000'` | 全透明 |
| `frame` | `false` | 无系统边框（配合自定义标题栏） |
| `titleBarStyle` | `'hidden'` | 隐藏标题栏，自绘 WindowControls |
| 圆角 | 由 CSS `.app-shell { border-radius: 10px }` 负责 | transparent 窗口本体方形，由 CSS 切圆角 |

**背景**：Mica 视觉通过 `global.css` 中 `body { background: var(--mica) }` 的 CSS 渐变实现（浅色 `#fbfbfb→#f0f0f0`，深色 `#2a2a2a→#1c1c1c`）。窗口本体透明，故只有圆角外区域透出桌面。

---

## 2. 组件库：Fluent UI Web Components

依赖：`@fluentui/web-components`（v2.x，微软官方）。**已完全替代 Element Plus**。

### 2.1 注册与主题（src/renderer/fluent.ts）
- 启动时通过 `provideFluentDesignSystem(document.body).register(...)` 自动发现并注册全部 `fluent-*` 组件（逐个 try/catch，单组件失败不影响整体）。
- 主题由 `applyFluentTheme(dark, accentHex)` 驱动 Fluent 设计令牌：
  - `baseLayerLuminance.setValueFor(document.body, StandardLuminance.LightMode|DarkMode)`
  - `accentBaseColor.setValueFor(document.body, SwatchRGB.create(r,g,b))`
- `src/main/main.ts` 顶部 `import './fluent'` 触发注册（须在 `app.mount` 之前）。

### 2.2 Vue 集成
`electron.vite.config.ts` 的 `@vitejs/plugin-vue` 配置了：
```ts
template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('fluent-') } }
```
使 Vue 将 `<fluent-button>` 等视为原生自定义元素，而非组件。

### 2.3 常用映射（老 Element Plus → Fluent）

| Element Plus | Fluent 组件 | 注意 |
|---|---|---|
| `el-button` | `fluent-button` | 主按钮 `appearance="accent"`，普通 `appearance="neutral"`；禁用 `:disabled` |
| `el-input` / 只读 | `fluent-text-field` | `:value` + `@input`；只读加 `readonly` |
| `el-switch` | `fluent-switch` | `:checked` + `@change`，新值取 `e.target.checked` |
| `el-select` | `fluent-select` + `fluent-option` | |
| `el-checkbox` | `fluent-checkbox` | |
| `el-radio` | `fluent-radio` + `fluent-radio-group` | |
| `el-slider` | `fluent-slider` | |
| `el-divider` | `fluent-divider` 或分组标题 | 设置页用 `.group-title` 更贴近 Win11 |
| `el-dialog` | `fluent-dialog` | 见 §4 |
| `el-empty` | 自定义占位 div | 不复用组件 |
| `el-color-picker` | 原生 `<input type="color">` | Fluent 无取色器，用原生输入包一层 |

### 2.4 字体
`Segoe UI Variable Display` 为首的系统字体栈（见 global.css `--font-family`），含中文回退。

---

## 3. CSS 变量系统（src/renderer/styles/global.css）

```css
:root {
  --font-family: "Segoe UI Variable Display", "Segoe UI", system-ui, ...;

  --accent: #0f6cbd;            /* 浅色默认强调色（Win11 蓝）*/
  --text-color: #1b1b1b;
  --text-secondary: #5e5e5e;
  --border-color: #e2e2e2;
  --card-bg: #ffffff;
  --sidebar-bg: #f7f7f7;
  --hover-bg: rgba(0,0,0,.04);
  --active-bg: rgba(15,108,189,.1);
  --mica: linear-gradient(180deg, #fbfbfb 0%, #f0f0f0 100%);

  --main-color: #0f6cbd;        /* 兼容旧引用，与 --accent 同步 */
}
html[data-theme='dark'] {
  --accent: #4cc2ff;
  --text-color: #f3f3f3;
  --text-secondary: #b9b9b9;
  --border-color: #3a3a3a;
  --card-bg: #2b2b2b;
  --sidebar-bg: #232323;
  --hover-bg: rgba(255,255,255,.06);
  --active-bg: rgba(76,194,255,.14);
  --mica: linear-gradient(180deg, #2a2a2a 0%, #1c1c1c 100%);
  --main-color: #4cc2ff;
}
```

`body` 设置 `background: var(--mica)`、`overflow:hidden`、Segoe 字体。
`#app` 透明，`.app-shell` 透明（露出 body 的 Mica），侧边栏/卡片用各自变量。

---

## 4. 全局外壳与弹窗

### 4.1 外壳（Layout.vue）
- `.app-shell`：`flex` 列布局，`border-radius:10px`，`overflow:hidden`，`box-shadow` 模拟窗口描边与投影（透明窗口无系统阴影）。
- 顶部 `WindowControls` 自绘标题栏（拖拽区 + Win11 风格标题按钮：最小化/最大化/关闭；关闭按钮悬停变红）。
- 下方 `.body`：左侧 `.sidebar`（导航列表，激活态用 `--active-bg` + 强调色文字）+ 右侧 `.content`（承载各工具页）。
- 导航项用 `router-link`，`active-class="active"`，FontAwesome 图标 + 文字。

### 4.2 Toast（ToastHost.vue）
`useDialog().message(msg, type)` → 底部居中 Fluent 风格卡片 toast，2.6s 自动消失。替代 `ElMessage`。

### 4.3 Dialog（AppDialog.vue）
`useDialog().alert()/confirm()` → `fluent-dialog`（modal）+ `fluent-button` 按钮。替代 `ElMessageBox`。
状态由 `src/renderer/composables/ui.ts` 的 `ui` 响应式对象统一管理。

---

## 5. 组件规范（后续开发必须遵守）

1. **所有控件优先使用 `fluent-*` 官方组件**，不要混用 Element Plus（已移除）。
2. **主按钮**用 `appearance="accent"`；次要/取消用 `appearance="neutral"`。
3. **卡片/面板**：用 `.fluent-card` 或 `fluent-card`，圆角 8px。
4. **激活/选中态**：用 `--active-bg` + 强调色文字，不另起颜色。
5. **弹窗**：用 `useDialog().alert/confirm` 或 `fluent-dialog`，不要自绘原生 `alert`。
6. **深色模式**：颜色全部走变量，仅通过 `[data-theme='dark']` 切换；Fluent 令牌由 `applyFluentTheme` 同步。
7. **字体**：系统 Segoe 字体栈，勿写死。
8. **圆角统一**：窗口外壳 10px，卡片/面板 8px，按钮/输入 6px。
9. **图标**：当前沿用 FontAwesome（`<font-awesome-icon>`）；后续可迁移至 Fluent System Icons。

---

## 6. 主题色（用户可调）

- `--main-color` / `--accent` 由 `useTheme.ts` 在运行时注入（读取 `settings.themeColor`），不在 CSS 写死。
- `applyTheme()` 同时：设置 `data-theme`、CSS `--main-color`、并调用 `applyFluentTheme()` 同步 Fluent 的 `baseLayerLuminance` 与 `accentBaseColor`。
- 设置页“主题色”用原生 `<input type="color">` 取色并写入 `settings.themeColor`。

---

## 7. 跨平台注意

- **Windows（主力）**：Fluent 设计令牌在 Windows 上呈现标准 Win11 观感；窗口圆角依赖 `transparent:true` + CSS 裁切。
- **macOS / 其他**：Fluent 组件仍可用（设计令牌跨平台一致）；窗口无系统标题栏，沿用自绘 WindowControls。
- 透明窗口下 `fluent-dialog` 的 modal 遮罩由组件自身提供，确保可读。
