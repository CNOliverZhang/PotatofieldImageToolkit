import { app, Tray, Menu, nativeImage, type MenuItemConstructorOptions } from 'electron';
import { openWindow, getWindows, resolveAppIcon, requestQuit } from './windows';
import { registerIpc } from './ipc';
import { initUpdater, checkForUpdates } from './updater';
import { reportUsage } from './usage';
// 工具清单是渲染进程的单一数据源（首页卡片/侧边栏都用它），托盘菜单直接复用，
// 保证入口名称与批量能力不会和界面不一致
import { tools } from '../renderer/consts/tools';

try {
  if (require('electron-squirrel-startup')) app.quit();
} catch {
  /* 开发环境无此依赖可忽略 */
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let tray: Tray | null = null;

/**
 * 在主窗口内打开指定工具：主窗口已存在就复用并切路由（不再开新窗），
 * 否则新建主窗口并直接落在该工具页
 */
function openToolInMainWindow(route: string): void {
  const main = getWindows().get('main');
  if (main && !main.isDestroyed()) {
    if (main.isMinimized()) main.restore();
    main.focus();
    main.webContents.send('window:navigate', route);
    return;
  }
  openWindow({ key: 'main', route });
}

/** 批量工具：独立窗口打开（与界面里首页卡片的「批量处理」入口一致，按 route 去重） */
function openBatchWindow(route: string): void {
  openWindow({ key: route, route });
}

/**
 * 自定义协议：`potatofield-image-toolkit://` —— 让其它应用（如富文本编辑器）
 * 能直接唤起本工具箱。打包后由安装器写入注册表 / Info.plist，这里再显式注册一次兜底。
 *
 * 支持的 URL：
 * - `potatofield-image-toolkit://open`            → 打开/聚焦主窗口
 * - `potatofield-image-toolkit://tool/watermark`  → 打开指定工具
 * - `potatofield-image-toolkit://open?route=/compress` → 同上
 */
const PROTOCOL = 'potatofield-image-toolkit';

function routeFromProtocolUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = (u.host || '').toLowerCase();
    const path = u.pathname.replace(/^\/+/, '');
    if (host === 'tool' && path) return path.startsWith('/') ? path : `/${path}`;
    const q = u.searchParams.get('route');
    if (q) return q.startsWith('/') ? q : `/${q}`;
  } catch {
    /* 解析不了就回首页 */
  }
  return '/';
}

function handleProtocolUrl(url: string): void {
  openToolInMainWindow(routeFromProtocolUrl(url));
}

/** 托盘菜单里的工具项：支持批量的工具挂二级菜单，其余直接打开 */
function buildToolMenuItems(): MenuItemConstructorOptions[] {
  return tools.map((tool) => {
    if (tool.batchRoute) {
      return {
        label: tool.label,
        submenu: [
          { label: `打开${tool.label}`, click: () => openToolInMainWindow(tool.path) },
          { label: `${tool.label}（批量）`, click: () => openBatchWindow(tool.batchRoute as string) }
        ]
      };
    }
    return { label: tool.label, click: () => openToolInMainWindow(tool.path) };
  });
}

function createTray(): void {
  const iconPath = resolveAppIcon().replace(/icon\.ico$/, 'icon.png');
  let image: Electron.NativeImage;
  try {
    image = nativeImage.createFromPath(iconPath);
  } catch {
    image = nativeImage.createEmpty();
  }
  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip('洋芋田图像工具箱');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '打开主窗口', click: () => openWindow({ key: 'main', route: '/' }) },
      { type: 'separator' },
      ...buildToolMenuItems(),
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          // 有窗口正在批处理：先把它们显示出来并让用户选择（中断关闭 / 最小化到托盘 / 取消），
          // 用户选择后由 useBatchRunner 的确认弹窗驱动收尾（见 windows.ts 的 requestQuit）
          requestQuit();
        }
      }
    ])
  );
  tray.on('click', () => openWindow({ key: 'main', route: '/' }));
}

app.whenReady().then(() => {
  registerIpc();
  initUpdater();

  // 注册自定义协议（供其它应用唤起）；macOS 的 open-url 在启动时可能先于 whenReady 触发，
  // 因此事件监听放在模块顶层（见下方 app.on('open-url')）
  if (process.platform === 'win32' || process.platform === 'darwin') {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
  // Windows 冷启动：协议 URL 出现在 argv 里
  const startupUrl = process.argv.find((a) => a.startsWith(`${PROTOCOL}://`));
  if (startupUrl) handleProtocolUrl(startupUrl);

  openWindow({ key: 'main', route: '/' });
  createTray();
  // 数据上报（老版本 3.x 的 register 机制）：放在主进程，保证每次启动只上报一次
  void reportUsage();
  setTimeout(checkForUpdates, 3000);
});

// macOS：通过协议唤起（已运行时由系统投递到本事件）
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (url.startsWith(`${PROTOCOL}://`)) handleProtocolUrl(url);
});

app.on('second-instance', (_e, argv) => {
  // Windows：第二个实例的 argv 里带协议 URL
  const url = argv.find((a) => a.startsWith(`${PROTOCOL}://`));
  const route = url ? routeFromProtocolUrl(url) : '/';
  const main = getWindows().get('main');
  if (main && !main.isDestroyed()) {
    if (main.isMinimized()) main.restore();
    main.focus();
    if (url) main.webContents.send('window:navigate', route);
  } else {
    openWindow({ key: 'main', route });
  }
});

app.on('window-all-closed', () => {});

app.on('activate', () => {
  openWindow({ key: 'main', route: '/' });
});
