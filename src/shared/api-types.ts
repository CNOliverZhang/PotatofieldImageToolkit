import type {
  TemplateApplyPayload,
  TemplateEditPayload,
  TemplateItem,
  TemplateStoreData,
  TemplateToolKey
} from './types';
import type {
  ImageProcessPayload,
  ImageProcessResult,
  SelectFileOptions,
  UpdaterStatus
} from './types';

export interface ImageToolkitApi {
  app: {
    version: () => Promise<string>;
    appDataPath: () => Promise<string>;
    relaunch: () => Promise<void>;
    /** 是否为打包后运行（开发模式下 electron-updater 不会真正检查更新） */
    isPackaged: () => Promise<boolean>;
    /** 是否随系统开机启动 */
    getOpenAtLogin: () => Promise<boolean>;
    setOpenAtLogin: (open: boolean) => Promise<void>;
    /** 界面缩放比例（1 = 100%） */
    getZoomFactor: () => Promise<number>;
    setZoomFactor: (factor: number) => Promise<number>;
    /** 当前系统是否启用了窗口材质（macOS 玻璃 / Windows 11 亚克力）：为 true 时页面背景应全透明 */
    windowMaterial: boolean;
    /** 材质是否来自 electron-acrylic-window（Win11 22H2 以下的老 Windows）：
     *  该路径下窗口无系统圆角/阴影，渲染进程据此去掉假圆角，避免出现材质缺口 */
    acrylicLib: boolean;
  };
  dialog: {
    selectFile: (options: SelectFileOptions) => Promise<string[] | null>;
    selectDirectory: (defaultPath?: string) => Promise<string | null>;
  };
  shell: {
    openExternal: (url: string) => Promise<void>;
    showItemInFolder: (fullPath: string) => Promise<void>;
    /** 用系统默认程序打开（字体文件会调起系统字体安装器） */
    openPath: (fullPath: string) => Promise<string>;
  };
  image: {
    process: (payload: ImageProcessPayload) => Promise<ImageProcessResult>;
  };
  /** 模板相关：素材持久化（避免原图丢失）与旧版本数据导入 */
  template: {
    /** 保存素材文件，返回存储文件名（内容相同即复用） */
    saveAsset: (sourcePath: string) => Promise<{ fileName: string } | null>;
    /** 解析素材为绝对路径，缺失返回 null */
    resolveAsset: (fileName: string) => Promise<string | null>;
    removeAsset: (fileName: string) => Promise<void>;
    /** 读取旧版本（3.x）的水印模板 */
    importLegacy: () => Promise<TemplateItem[]>;
    /** 编辑页预览底图：中性占位图的绝对路径（无用户图片时用于渲染水印效果） */
    placeholder: () => Promise<string>;
    /**
     * 模板库：权威数据在主进程（userData/templates.json）。
     * 多窗口共享 localStorage 存在同步延迟、会互相覆盖，因此读写一律走 IPC。
     */
    list: () => Promise<TemplateStoreData>;
    add: (payload: {
      tool: TemplateToolKey;
      name: string;
      params: unknown;
      legacy?: boolean;
    }) => Promise<TemplateStoreData>;
    update: (payload: {
      tool: TemplateToolKey;
      id: string;
      name?: string;
      params?: unknown;
    }) => Promise<TemplateStoreData>;
    remove: (payload: { tool: TemplateToolKey; id: string }) => Promise<TemplateStoreData>;
    setLegacyImported: (value: boolean) => Promise<TemplateStoreData>;
    /** 编辑窗口入参：开窗口前由列表页暂存，编辑页挂载后取走 */
    setEditing: (payload: TemplateEditPayload) => Promise<void>;
    takeEditing: () => Promise<TemplateEditPayload | null>;
    /** 应用模板：通知主窗口载入参数并跳转（模板窗口自身不跳转） */
    apply: (payload: TemplateApplyPayload) => Promise<void>;
    /** 主窗口监听模板应用 */
    onApplied: (cb: (payload: TemplateApplyPayload) => void) => void;
    /** 模板库变更：主进程写入后推送最新全量数据给所有窗口 */
    onChanged: (cb: (payload: TemplateStoreData) => void) => void;
  };
  fs: {
    scanDirectory: (
      root: string,
      extensions: string[]
    ) => Promise<{ fileList: string[]; errorList: { path: string; error: string }[] }>;
    readFileBase64: (path: string) => Promise<string>;
    writeFileBase64: (path: string, base64: string) => Promise<void>;
    ensureDir: (path: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    stat: (path: string) => Promise<{ size: number; isDirectory: boolean } | null>;
    /** 删除文件或目录（不存在也不报错） */
    remove: (path: string) => Promise<void>;
    /** 取拖放文件的本地绝对路径（File.path 已被 Electron 移除，走 preload 的 webUtils） */
    getPathOfFile: (file: File) => string;
  };
  font: {
    /** 列出系统已安装字体（force 跳过缓存立即重读） */
    listInstalled: (force?: boolean) => Promise<{ family: string; style: string }[]>;
    isInstalled: (family: string, style?: string) => Promise<boolean>;
    matchInstalled: (
      list: { family: string; style: string }[],
      family: string,
      style?: string
    ) => Promise<boolean>;
  };
  updater: {
    check: () => Promise<void>;
    download: () => Promise<void>;
    quitAndInstall: () => Promise<void>;
    onStatus: (callback: (status: UpdaterStatus) => void) => () => void;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximizeChanged: (callback: (maximized: boolean) => void) => () => void;
    open: (options: {
      route?: string;
      key?: string;
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
    }) => void;
    /** 主进程要求本窗口跳转到指定路由（托盘菜单点击工具入口时用） */
    onNavigate: (callback: (route: string) => void) => () => void;
    /** 上报「批处理进行中」：主进程据此在关闭窗口 / 退出应用前要求确认 */
    setBusy: (busy: boolean) => void;
    /** 已在确认弹窗中选择中断：跳过确认直接关闭本窗口 */
    closeNow: () => void;
    /** 最小化到托盘：隐藏本窗口，进程驻留托盘 */
    hide: () => void;
    /** 主进程要求本窗口确认关闭（点关闭按钮，或托盘「退出」且本窗口正在批处理） */
    onConfirmClose: (callback: () => void) => () => void;
  };
  /** 跨窗口主题同步：任意窗口切换深色模式/主题色后广播给其它窗口 */
  theme: {
    /** 同步主题偏好：mode = 'system' 时主进程把 nativeTheme.themeSource 置为 system（跟随 OS） */
    set: (payload: { mode: 'system' | 'light' | 'dark'; darkMode: boolean; themeColor: string }) => void;
    onChanged: (
      callback: (payload: {
        mode: 'system' | 'light' | 'dark';
        darkMode: boolean;
        themeColor: string;
      }) => void
    ) => () => void;
  };
}
