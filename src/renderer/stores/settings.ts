import { defineStore } from 'pinia';
import type { PngMode, TemplateItem, TemplateStoreData, TemplateToolKey } from '@shared/types';

/** 默认输出格式：original 表示保持原图格式 */
export type DefaultOutputFormat = 'original' | 'png' | 'jpeg' | 'webp';

/** 颜色模式：system = 跟随系统（系统切换时实时响应），light / dark = 手动固定 */
export type ThemeMode = 'system' | 'light' | 'dark';

interface DefaultOutput {
  format: DefaultOutputFormat;
  quality: number;
  /** PNG 输出模式，与 JPEG/WebP 的 quality 相互独立 */
  pngMode: PngMode;
}

interface SettingsState {
  themeColor: string;
  /** 颜色模式偏好；darkMode 是由此推导出的「当前生效值」 */
  themeMode: ThemeMode;
  darkMode: boolean;
  defaultSaveDirectory: string;
  defaultExportParams: Record<string, Record<string, unknown>>;
  /** 各工具新增「输出设置」时的默认值 */
  defaultOutput: DefaultOutput;
  recentSaveDirs: string[];
  /**
   * 各工具的模板库（目前仅 watermark）。
   * 权威数据在主进程 templates.json，这里是各窗口的展示用副本，
   * 通过 loadTemplates / 增删改 action（走 IPC）与主进程同步。
   */
  templates: Record<TemplateToolKey, TemplateItem[]>;
  /** 是否已完成旧版本（3.x）模板导入（只跑一次，标记同样存主进程） */
  legacyImported: boolean;
}

// 注：客户端标识（数据上报用）由主进程持有并上报（main/usage.ts，存 userData/client.json），
// 这里不再保存 identifier —— 渲染层每个窗口一份，会与主进程的身份不一致

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    themeColor: '#3a8ee6',
    // 默认手动浅色：与历史版本行为一致（老用户持久化里没有 themeMode，不会突然跟随系统）
    themeMode: 'light',
    darkMode: false,
    defaultSaveDirectory: '',
    defaultExportParams: {},
    defaultOutput: { format: 'original', quality: 90, pngMode: 'recommended' },
    recentSaveDirs: [],
    templates: { watermark: [] },
    legacyImported: false
  }),
  getters: {
    toolParams: (state) => (name: string) => state.defaultExportParams[name] ?? {}
  },
  actions: {
    setThemeColor(color: string) {
      this.themeColor = color;
    },
    setThemeMode(mode: ThemeMode) {
      this.themeMode = mode;
    },
    setDefaultSaveDirectory(dir: string) {
      this.defaultSaveDirectory = dir;
    },
    addRecentSaveDir(dir: string) {
      if (!dir) return;
      const list = this.recentSaveDirs.filter((d) => d !== dir);
      list.unshift(dir);
      this.recentSaveDirs = list.slice(0, 12);
      if (!this.defaultSaveDirectory) this.defaultSaveDirectory = dir;
    },
    removeRecentSaveDir(dir: string) {
      this.recentSaveDirs = this.recentSaveDirs.filter((d) => d !== dir);
    },
    setToolParams(name: string, params: Record<string, unknown>) {
      this.defaultExportParams = { ...this.defaultExportParams, [name]: params };
    },
    setDefaultOutput(patch: Partial<DefaultOutput>) {
      const next = { ...this.defaultOutput, ...patch };
      // 值没变时必须原样返回：Vue 每次渲染都会强制给 <fluent-slider> 的 value 赋值，
      // 而 v3 的 slider 在「被赋值」时也会同步抛一次 change 事件 → 写回 store → 再渲染。
      // 若这里无条件换成新对象，就会形成「渲染→赋值→change→写store→渲染」的死循环
      //（实测一次拖动触发上百次更新，界面直接卡死，直到 Vue 的递归保护中断并报错）
      if (
        next.format === this.defaultOutput.format
        && next.quality === this.defaultOutput.quality
        && next.pngMode === this.defaultOutput.pngMode
      ) {
        return;
      }
      this.defaultOutput = next;
    },
    /** 用主进程推送的全量数据刷新本地副本 */
    applyTemplateStore(data: TemplateStoreData) {
      this.templates = data.templates;
      this.legacyImported = data.legacyImported;
    },
    /** 首次进入模板相关页面时拉取一次 */
    async loadTemplates(): Promise<void> {
      this.applyTemplateStore(await window.api.template.list());
    },
    /** 新增模板（主进程落盘 + 广播），返回新项 */
    async addTemplate(
      tool: TemplateToolKey,
      name: string,
      params: unknown,
      legacy = false
    ): Promise<TemplateItem | null> {
      const before = new Set((this.templates[tool] ?? []).map((i) => i.id));
      const data = await window.api.template.add({ tool, name, params, legacy });
      this.applyTemplateStore(data);
      return (data.templates[tool] ?? []).find((i) => !before.has(i.id)) ?? null;
    },
    async updateTemplate(tool: TemplateToolKey, id: string, patch: { name?: string; params?: unknown }) {
      this.applyTemplateStore(await window.api.template.update({ tool, id, ...patch }));
    },
    async removeTemplate(tool: TemplateToolKey, id: string) {
      this.applyTemplateStore(await window.api.template.remove({ tool, id }));
    },
    async markLegacyImported() {
      this.applyTemplateStore(await window.api.template.setLegacyImported(true));
    }
  },
  // 模板库与旧版导入标记不落 localStorage：它们由主进程 templates.json 持有，
  // 若这里也持久化，窗口启动时会先显示一份可能过期的副本
  persist: {
    paths: [
      'themeColor',
      'themeMode',
      'darkMode',
      'defaultSaveDirectory',
      'defaultExportParams',
      'defaultOutput',
      'recentSaveDirs'
    ]
  }
});
