<template>
  <div class="settings">
    <!-- 标签页：与字体工具同一套用法（组件自带指示器不生效，共享指示条自行绘制） -->
    <div ref="tabsWrapEl" class="tabs-wrap">
      <fluent-tablist ref="tabsEl" class="settings-tabs" :activeid="tab" @change="onTabsChange">
        <fluent-tab id="general" :class="{ 'is-active': tab === 'general' }" @click="switchTab('general')">
          通用
        </fluent-tab>
        <fluent-tab id="about" :class="{ 'is-active': tab === 'about' }" @click="switchTab('about')">
          版权信息
        </fluent-tab>
      </fluent-tablist>
      <span class="tab-indicator" :style="indicatorStyle"></span>
    </div>

    <!-- ───────────────── 通用 ───────────────── -->
    <div v-show="tab === 'general'" class="tab-panel">
      <SettingsGroup title="外观">
        <SettingsRow label="主题色">
          <input class="color-input" type="color" :value="settings.themeColor" @input="onColor" />
          <span class="row-val">{{ settings.themeColor }}</span>
        </SettingsRow>
        <SettingsRow label="颜色模式" desc="跟随系统时，系统在深浅色之间切换会实时生效">
          <app-select class="ctl-md" :value="settings.themeMode" @change="onThemeMode">
            <fluent-option value="system">跟随系统</fluent-option>
            <fluent-option value="light">浅色</fluent-option>
            <fluent-option value="dark">深色</fluent-option>
          </app-select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="输出">
        <SettingsRow label="文件默认保存地址">
          <fluent-text-input
            class="dir-field"
            :value="settings.defaultSaveDirectory"
            readonly
          ></fluent-text-input>
          <fluent-button appearance="neutral" @click="pickDir">选择</fluent-button>
        </SettingsRow>
        <SettingsRow label="输出格式">
          <app-select class="ctl-md" :value="settings.defaultOutput.format" @change="onFormat">
            <fluent-option value="original">保持原格式</fluent-option>
            <fluent-option value="png">PNG（无损）</fluent-option>
            <fluent-option value="jpeg">JPG（有损）</fluent-option>
            <fluent-option value="webp">WebP（有损）</fluent-option>
          </app-select>
        </SettingsRow>
        <!-- 默认质量是通用默认值（工具里选 JPG/WebP 时才会用到），因此始终显示 -->
        <SettingsRow label="默认质量">
          <fluent-slider
            class="ctl-slider"
            :value="settings.defaultOutput.quality"
            :min="10"
            :max="100"
            :step="1"
            @change="onQuality"
          ></fluent-slider>
          <span class="row-val">{{ settings.defaultOutput.quality }}%</span>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="系统">
        <SettingsRow label="开机启动">
          <fluent-switch :checked="openAtLogin" @change="onOpenAtLogin"></fluent-switch>
        </SettingsRow>
        <SettingsRow label="界面缩放">
          <app-select class="ctl-md" :value="String(zoomFactor)" @change="onZoom">
            <fluent-option value="0.75">75%</fluent-option>
            <fluent-option value="1">100%</fluent-option>
            <fluent-option value="1.25">125%</fluent-option>
            <fluent-option value="1.5">150%</fluent-option>
            <fluent-option value="1.75">175%</fluent-option>
            <fluent-option value="2">200%</fluent-option>
          </app-select>
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="关于">
        <SettingsRow label="版本" :desc="version">
          <button class="link-btn" @click="onUpdateClick">{{ updateLabel }}</button>
        </SettingsRow>
      </SettingsGroup>
    </div>

    <!-- ───────────────── 版权信息 ───────────────── -->
    <div v-show="tab === 'about'" class="tab-panel">
      <div class="intro">
        <img class="intro-logo" src="@renderer/assets/logo.png" alt="logo" />
        <div class="intro-text">
          <div class="intro-title">洋芋田图像工具箱</div>
          <div class="intro-sub">一个专为摄影师设计的图像工具箱</div>
        </div>
        <button class="link-btn" @click="open(SITE_URL)">访问网站</button>
      </div>

      <!-- 开发者信息：不套卡片，一行轻量展示 -->
      <div class="developer-line">
        <span class="copyright">Copyright © 2019–{{ currentYear }} 张志毅</span>
        <button class="link-btn" @click="copyEmail">联系开发者</button>
        <button class="link-btn" @click="open(COMMUNITY_URL)">加入社区</button>
      </div>

      <SettingsGroup title="开源协议">
        <div class="about-text">
          本程序遵循
          <button class="inline-link" @click="open(MIT_URL)">MIT</button>
          开源许可协议发行，相关资源及源码已托管在 GitHub，欢迎
          <button class="inline-link" @click="open(HOME_URL)">点此访问</button>
          洋芋田官网。
        </div>
      </SettingsGroup>

      <SettingsGroup title="相关项目">
        <div class="about-text">本程序的开发过程中使用了下列开源程序和组件：</div>
        <div class="resources">
          <button
            v-for="item in resources"
            :key="item.title"
            class="resource-chip"
            @click="open(item.url)"
          >
            {{ item.title }}
          </button>
        </div>
      </SettingsGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useSettingsStore } from '@renderer/stores/settings';
import { selectDirectory } from '@renderer/utils/filePicker';
import { useDialog } from '@renderer/composables/useDialog';
import { useUpdaterState, manualCheckForUpdates } from '@renderer/composables/useUpdater';
import SettingsGroup from '@renderer/components/settings/SettingsGroup.vue';
import SettingsRow from '@renderer/components/settings/SettingsRow.vue';
import type { DefaultOutputFormat } from '@renderer/stores/settings';
import AppSelect from '@renderer/components/AppSelect.vue';

const SITE_URL = 'https://potatofield.cn/imagetoolkit';
const HOME_URL = 'https://potatofield.cn';
const MIT_URL = 'https://opensource.org/licenses/MIT';
const COMMUNITY_URL = 'https://pd.qq.com/s/ab8f83yxa?b=9';
const DEVELOPER_EMAIL = 'cnoliverzhang@gmail.com';

/** 本程序依赖的开源项目（取自当前 package.json 的实际依赖） */
const resources = [
  { title: 'Electron', url: 'https://github.com/electron/electron' },
  { title: 'electron-builder', url: 'https://github.com/electron-userland/electron-builder' },
  { title: 'electron-vite', url: 'https://github.com/alex8088/electron-vite' },
  { title: 'Vite', url: 'https://github.com/vitejs/vite' },
  { title: '@vitejs/plugin-vue', url: 'https://github.com/vitejs/vite-plugin-vue' },
  { title: 'Vue.js', url: 'https://github.com/vuejs/core' },
  { title: 'Vue Router', url: 'https://github.com/vuejs/router' },
  { title: 'Pinia', url: 'https://github.com/vuejs/pinia' },
  { title: 'pinia-plugin-persistedstate', url: 'https://github.com/prazdevs/pinia-plugin-persistedstate' },
  { title: 'vue-draggable-plus', url: 'https://github.com/Alfred-Skyblue/vue-draggable-plus' },
  { title: 'TypeScript', url: 'https://github.com/microsoft/TypeScript' },
  { title: 'vue-tsc', url: 'https://github.com/vuejs/language-tools' },
  { title: 'Fluent UI Web Components', url: 'https://github.com/microsoft/fluentui' },
  { title: 'Font Awesome', url: 'https://github.com/FortAwesome/Font-Awesome' },
  { title: 'vue-fontawesome', url: 'https://github.com/FortAwesome/vue-fontawesome' },
  { title: 'sharp', url: 'https://github.com/lovell/sharp' },
  { title: 'cropperjs', url: 'https://github.com/fengyuanchen/cropperjs' },
  { title: 'colorthief', url: 'https://github.com/lokesh/color-thief' },
  { title: 'exifr', url: 'https://github.com/MikeKovarik/exifr' },
  { title: 'crypto-js', url: 'https://github.com/brix/crypto-js' },
  { title: 'axios', url: 'https://github.com/axios/axios' }
];

const settings = useSettingsStore();
const { confirm, message } = useDialog();
const version = ref('');
const currentYear = new Date().getFullYear();

/* ───────────────── 标签页 ───────────────── */
type TabKey = 'general' | 'about';
const tab = ref<TabKey>('general');
const tabsWrapEl = ref<HTMLElement | null>(null);
const tabsEl = ref<HTMLElement | null>(null);
const indicatorStyle = ref({ left: '0px', width: '0px', opacity: '0' });

function updateIndicator(): void {
  const wrap = tabsWrapEl.value;
  const tabs = tabsEl.value;
  if (!wrap || !tabs) return;
  const el = tabs.querySelector(`fluent-tab#${tab.value}`) as HTMLElement | null;
  if (!el) return;
  const wr = wrap.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  indicatorStyle.value = {
    left: `${Math.round(er.left - wr.left)}px`,
    width: `${Math.round(er.width)}px`,
    opacity: '1'
  };
}

/** fluent-tablist 的 change 事件：不同版本 detail 可能是 id 字符串或对象，兼容读取 */
function onTabsChange(e: Event): void {
  const target = e.target as (HTMLElement & { activeid?: string }) | null;
  const detail = (e as CustomEvent).detail as unknown;
  const id =
    (typeof detail === 'string' ? detail : (detail as { id?: string } | null)?.id) ??
    target?.activeid;
  if (id === 'general' || id === 'about') switchTab(id);
}

function switchTab(next: TabKey): void {
  if (tab.value === next) return;
  tab.value = next;
  nextTick(updateIndicator);
}

/* ───────────────── 系统设置 ───────────────── */
const openAtLogin = ref(false);
const zoomFactor = ref(1);

async function onOpenAtLogin(e: Event): Promise<void> {
  const next = Boolean((e.target as HTMLInputElement).checked);
  openAtLogin.value = next;
  await window.api.app.setOpenAtLogin(next);
}

async function onZoom(e: Event): Promise<void> {
  const next = Number((e.target as HTMLInputElement).value);
  zoomFactor.value = next;
  await window.api.app.setZoomFactor(next);
}

/* ───────────────── 检查更新 ─────────────────
   状态与「下载/安装」弹窗流程在 composables/useUpdater.ts（全局单例，
   启动时由 App.vue 接管自动检查的提示），这里只复用状态和提供手动检查 */
const { phase, progress, promptDownload, promptInstall } = useUpdaterState();
let packaged = false;

const updateLabel = computed(() => {
  switch (phase.value) {
    case 'checking':
      return '检查中…';
    case 'available':
      return '下载更新';
    case 'downloading':
      return `下载中 ${progress.value}%`;
    case 'downloaded':
      return '安装更新';
    case 'error':
      return '重试';
    default:
      return '检查更新';
  }
});

/** electron-updater 的 releaseNotes 提示等流程都在 useUpdater.ts，这里只做手动检查 */
function onUpdateClick(): void {
  if (phase.value === 'downloaded') {
    void promptInstall();
    return;
  }
  if (phase.value === 'available') {
    void promptDownload();
    return;
  }
  void checkUpdate();
}

async function checkUpdate(): Promise<void> {
  // 未打包时 electron-updater 不会真正发起请求（启动日志里会打印 Skip checkForUpdates …），
  // 这里直接给出提示，避免按钮一直停在「检查中…」
  if (!packaged) {
    message('开发模式下不支持检查更新，需打包后运行', 'info');
    return;
  }
  await manualCheckForUpdates();
}

/* ───────────────── 版权信息页动作 ───────────────── */
async function open(url: string): Promise<void> {
  try {
    await window.api.shell.openExternal(url);
  } catch {
    message('打开浏览器失败，请手动访问：' + url, 'error');
  }
}

async function copyEmail(): Promise<void> {
  try {
    await navigator.clipboard.writeText(DEVELOPER_EMAIL);
    message('已复制邮箱到剪贴板：' + DEVELOPER_EMAIL, 'success');
  } catch {
    message('复制失败，开发者邮箱：' + DEVELOPER_EMAIL, 'warning');
  }
}

/* ───────────────── 外观 / 文件 / 输出 ───────────────── */
function onColor(e: Event): void {
  settings.setThemeColor((e.target as HTMLInputElement).value);
}
function onThemeMode(e: Event): void {
  settings.setThemeMode((e.target as HTMLInputElement).value as 'system' | 'light' | 'dark');
}
function onFormat(e: Event): void {
  settings.setDefaultOutput({ format: (e.target as HTMLInputElement).value as DefaultOutputFormat });
}
function onQuality(e: Event): void {
  settings.setDefaultOutput({ quality: Number((e.target as HTMLInputElement).value) });
}
async function pickDir(): Promise<void> {
  const dir = await selectDirectory(settings.defaultSaveDirectory || undefined);
  if (dir) settings.setDefaultSaveDirectory(dir);
}

/* ───────────────── 生命周期 ───────────────── */
onMounted(async () => {
  version.value = await window.api.app.version();
  packaged = await window.api.app.isPackaged();
  openAtLogin.value = await window.api.app.getOpenAtLogin();
  zoomFactor.value = await window.api.app.getZoomFactor();
  nextTick(updateIndicator);
  window.addEventListener('resize', updateIndicator);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIndicator);
});
</script>

<style scoped>
.settings {
  max-width: 640px;
  /* 页面本身不滚：tablist 固定在顶部，滚动发生在下面的 tab-panel */
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ── 标签页（与字体工具保持一致）── */
.tabs-wrap {
  position: relative;
  flex-shrink: 0;
  /* 与下方分组标题的间距一致（SettingsGroup 的 margin-bottom），避免「外观」贴住 tablist */
  margin-bottom: calc(var(--design-unit) * 5.5 * 1px);
}
.settings-tabs {
  width: auto;
}
.settings-tabs::part(activeIndicator) {
  display: none;
}
.settings-tabs fluent-tab {
  cursor: pointer;
}
.settings-tabs fluent-tab.is-active {
  color: var(--accent-base-color);
}
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: calc(var(--design-unit) * 0.75 * 1px);
  border-radius: calc(var(--design-unit) * 0.375 * 1px);
  background: var(--accent-base-color);
  pointer-events: none;
  transition:
    left 0.24s cubic-bezier(0.33, 0, 0.67, 1),
    width 0.24s cubic-bezier(0.33, 0, 0.67, 1),
    opacity 0.12s ease;
}

.tab-panel {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* 滚动区延伸到窗口下缘（抵消 .content 的底部内边距），
     滚到底后再由 padding-bottom 补回与其它页面一致的底部间距 */
  margin-bottom: calc(-1 * var(--content-pad-b));
  padding-bottom: var(--content-pad-b);
}
/* 末尾分组的 margin-bottom 会叠加在滚动内边距上，使滚到底的间距比字体管理等页面大 —— 去掉 */
.tab-panel :deep(.settings-group:last-child) {
  margin-bottom: 0;
}

/* 首个分组不需要额外上边距（SettingsGroup 自带组间距） */
.tab-panel :deep(.settings-group:first-of-type) {
  margin-top: 0;
}
.color-input {
  width: 40px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--colorNeutralStroke1);
  border-radius: var(--borderRadiusMedium);
  background: none;
  cursor: pointer;
}
.dir-field {
  flex: 1;
  min-width: 0;
}
/* 链接式入口（检查更新 / 访问网站 / 联系开发者） */
.link-btn {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--accent-base-color);
  font: inherit;
  font-size: 13px;
  padding: 0;
  cursor: pointer;
}
.link-btn:hover {
  text-decoration: underline;
}
.inline-link {
  border: none;
  background: transparent;
  color: var(--accent-base-color);
  font: inherit;
  padding: 0;
  cursor: pointer;
}
.inline-link:hover {
  text-decoration: underline;
}

/* ── 版权信息 ── */
.intro {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 3 * 1px);
  /* 顶部 logo 行上下多留些纵向空间（视觉上是版权页的“头图”） */
  margin: calc(var(--design-unit) * 4 * 1px) 0 calc(var(--design-unit) * 7 * 1px);
}
/* 开发者信息：无卡片的一行（版权 + 联系开发者 + 加入社区） */
.developer-line {
  display: flex;
  align-items: center;
  gap: calc(var(--design-unit) * 2 * 1px);
  margin-bottom: calc(var(--design-unit) * 5.5 * 1px);
  font-size: var(--fontSizeBase200);
  color: var(--app-fg-secondary);
}
.copyright {
  margin-right: auto;
}
/* .link-btn 自带 margin-left:auto（设置行里把链接推到行尾），
   这里一行放两个链接，auto 外边距会把剩余空间均分、看起来各占一段 —— 覆盖掉 */
.developer-line .link-btn {
  margin-left: 0;
}
.intro-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
}
.intro-title {
  font-size: 16px;
  font-weight: 600;
}
.intro-sub {
  margin-top: calc(var(--design-unit) * 0.5 * 1px);
  font-size: 13px;
  color: var(--app-fg-secondary);
}
.about-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--app-fg-secondary);
}
.resources {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--design-unit) * 1 * 1px);
  margin-top: calc(var(--design-unit) * 2 * 1px);
}
.resource-chip {
  border: 1px solid var(--colorNeutralStroke1);
  background: transparent;
  color: var(--colorNeutralForeground1);
  font-size: 12px;
  padding: calc(var(--design-unit) * 0.75 * 1px) calc(var(--design-unit) * 1.5 * 1px);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.resource-chip:hover {
  background: color-mix(in srgb, var(--accent-base-color) 10%, transparent);
  border-color: color-mix(in srgb, var(--accent-base-color) 45%, var(--colorNeutralStroke1));
}
</style>
