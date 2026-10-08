import { ipcMain, dialog, shell, app, BrowserWindow, nativeTheme } from 'electron';
import { processImage } from './image';
import {
  openWindow,
  getZoomFactor,
  setZoomFactor,
  hasWindowMaterial,
  hasAcrylicLib,
  refreshAcrylicVibrancy,
  runWithProgrammaticResize,
  setWindowBusy,
  closeWindowNow
} from './windows';
import {
  saveTemplateAsset,
  resolveTemplateAsset,
  removeTemplateAsset,
  ensurePlaceholderImage
} from './templateAssets';
import { importLegacyTemplates } from './legacy';
import { hasRichTextEditor, openRichTextEditor } from './companionApp';
import {
  readTemplateStore,
  addTemplate,
  updateTemplate,
  removeTemplate,
  setLegacyImported,
  setEditingPayload,
  takeEditingPayload
} from './templates';
import { getOpenAtLogin, setOpenAtLogin } from './system';
import {
  scanDirectory,
  readFileBase64,
  writeFileBase64,
  ensureDir,
  fileExists,
  fileStat,
  removeFile
} from './fs';
import { checkForUpdates, downloadUpdate, quitAndInstall } from './updater';
import { listInstalledFonts, isFontInstalled, matchInstalled } from './fonts';
import type {
  ImageProcessPayload,
  ImageProcessResult,
  SelectFileOptions
} from '../shared/types';

export function registerIpc(): void {
  ipcMain.handle('app:version', () => app.getVersion());
  // 同步通道：渲染进程首帧就需要知道是否启用系统材质（决定页面背景是否全透明）
  ipcMain.on('app:windowMaterial', (e) => {
    e.returnValue = hasWindowMaterial();
  });
  // 同步通道：材质是否来自第三方库（老 Windows），决定要不要去掉假圆角
  ipcMain.on('app:acrylicLib', (e) => {
    e.returnValue = hasAcrylicLib();
  });
  ipcMain.handle('app:isPackaged', () => app.isPackaged);
  ipcMain.handle('app:openAtLogin', () => getOpenAtLogin());
  ipcMain.handle('app:setOpenAtLogin', (_e, open: boolean) => setOpenAtLogin(open));
  ipcMain.handle('app:zoomFactor', () => getZoomFactor());
  ipcMain.handle('app:setZoomFactor', (_e, factor: number) => setZoomFactor(Number(factor)));
  // 兄弟产品「洋芋田富文本编辑器」：先问在不在，点击时再唤起（协议 → 本地应用 → 由前端打开下载页）
  ipcMain.handle('app:hasRichTextEditor', () => hasRichTextEditor());
  ipcMain.handle('app:openRichTextEditor', () => openRichTextEditor());
  ipcMain.handle('app:appDataPath', () => app.getPath('userData'));

  ipcMain.handle('dialog:selectFile', async (_e, options: SelectFileOptions): Promise<string[] | null> => {
    const result = await dialog.showOpenDialog({
      title: options.title ?? '选择文件',
      defaultPath: options.defaultPath,
      filters: options.filters,
      properties: ['openFile', ...(options.multiSelections ? (['multiSelections'] as const) : [])]
    });
    return result.canceled ? null : result.filePaths;
  });

  ipcMain.handle('dialog:selectDirectory', async (_e, defaultPath?: string): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      title: '选择文件夹',
      defaultPath,
      properties: ['openDirectory', 'createDirectory']
    });
    return result.canceled ? null : result.filePaths[0] ?? null;
  });

  ipcMain.handle('shell:openExternal', (_e, url: string) => {
    shell.openExternal(url);
  });
  ipcMain.handle('shell:showItemInFolder', (_e, fullPath: string) => {
    shell.showItemInFolder(fullPath);
  });
  // 用系统默认程序打开：字体文件会调起 Windows 字体预览/安装器
  ipcMain.handle('shell:openPath', (_e, fullPath: string) => {
    return shell.openPath(fullPath);
  });

  ipcMain.handle('app:relaunch', () => {
    app.relaunch();
    app.quit();
  });

  const senderWindow = (e: Electron.IpcMainInvokeEvent): BrowserWindow | null =>
    BrowserWindow.fromWebContents(e.sender);

  ipcMain.on('window:minimize', (e) => senderWindow(e)?.minimize());
  // 批处理进行中标记：用于关闭/退出前的确认（由渲染层的 useBatchRunner 上报）
  ipcMain.on('window:busy', (e, busy: boolean) => {
    const w = senderWindow(e);
    if (w) setWindowBusy(w, !!busy);
  });
  // 用户在确认弹窗里选了「中断并关闭」：跳过关闭确认直接关；退出请求挂起时关完即退出
  ipcMain.on('window:close-now', (e) => {
    const w = senderWindow(e);
    if (w) closeWindowNow(w);
  });
  // 「最小化到托盘」：窗口隐藏但进程保留在托盘
  ipcMain.on('window:hide', (e) => {
    const w = senderWindow(e);
    if (!w) return;
    w.hide();
  });
  ipcMain.on('window:maximize', (e) => {
    const w = senderWindow(e);
    if (!w) return;
    // 最大化/还原是「程序化改尺寸」：放行 will-resize 拦截器（防拖拽调整大小的兜底）
    runWithProgrammaticResize(w, () => {
      w.isMaximized() ? w.unmaximize() : w.maximize();
    });
  });
  ipcMain.on('window:close', (e) => senderWindow(e)?.close());
  ipcMain.handle('window:isMaximized', (e) => senderWindow(e)?.isMaximized() ?? false);

  ipcMain.on('window:open', (_e, options: { route?: string; key?: string }) => {
    openWindow(options);
  });

  // 跨窗口主题同步：将主题变更广播给除发送者外的所有窗口
  ipcMain.on(
    'theme:set',
    (e, payload: { mode: 'system' | 'light' | 'dark'; darkMode: boolean; themeColor: string }) => {
      const sender = BrowserWindow.fromWebContents(e.sender);
      // macOS 玻璃材质的外观跟随窗口的 NSAppearance：
      // 应用切深色时必须同步系统外观，否则玻璃仍是亮色、与页面内容冲突。
      // mode = system 时交给 nativeTheme 跟随 OS（渲染层经 prefers-color-scheme 实时感知变化）
      nativeTheme.themeSource = payload.mode === 'system' ? 'system' : payload.darkMode ? 'dark' : 'light';
      // 旧系统（Win10）的第三方毛玻璃色调需要同步刷新
      refreshAcrylicVibrancy();
      for (const win of BrowserWindow.getAllWindows()) {
        if (win === sender || win.isDestroyed()) continue;
        win.webContents.send('theme:changed', payload);
      }
    }
  );

  ipcMain.handle('image:process', async (_e, payload: ImageProcessPayload): Promise<ImageProcessResult> => {
    return processImage(payload);
  });

  // 模板素材（图片水印等）：复制到 userData，避免原文件被移动/删除后模板失效
  ipcMain.handle('templateAsset:save', (_e, sourcePath: string) => saveTemplateAsset(sourcePath));
  ipcMain.handle('templateAsset:resolve', (_e, fileName: string) => resolveTemplateAsset(fileName));
  ipcMain.handle('templateAsset:remove', (_e, fileName: string) => removeTemplateAsset(fileName));
  // 模板编辑页的预览底图（无用户图片时的中性占位图）
  ipcMain.handle('template:placeholder', () => ensurePlaceholderImage());

  // 模板库：权威数据在主进程，任何写入后把最新数据推给所有窗口（含发起方），
  // 窗口之间不再各自维护副本 —— 多窗口共享 localStorage 存在同步延迟，会互相覆盖
  ipcMain.handle('template:list', () => readTemplateStore());
  const broadcastTemplates = (): void => {
    const data = readTemplateStore();
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue;
      win.webContents.send('template:updated', data);
    }
  };
  ipcMain.handle('template:add', (_e, payload: { tool: 'watermark'; name: string; params: unknown; legacy?: boolean }) => {
    addTemplate(payload.tool, payload.name, payload.params, payload.legacy ?? false);
    broadcastTemplates();
    return readTemplateStore();
  });
  ipcMain.handle(
    'template:update',
    (_e, payload: { tool: 'watermark'; id: string; name?: string; params?: unknown }) => {
      updateTemplate(payload.tool, payload.id, { name: payload.name, params: payload.params });
      broadcastTemplates();
      return readTemplateStore();
    }
  );
  ipcMain.handle('template:remove', (_e, payload: { tool: 'watermark'; id: string }) => {
    removeTemplate(payload.tool, payload.id);
    broadcastTemplates();
    return readTemplateStore();
  });
  ipcMain.handle('template:setLegacyImported', (_e, value: boolean) => {
    setLegacyImported(value);
    broadcastTemplates();
    return readTemplateStore();
  });
  // 编辑窗口入参：主进程暂存，窗口打开后取走（替代原先的 localStorage 传递）
  ipcMain.handle('template:setEditing', (_e, payload) => {
    setEditingPayload(payload);
  });
  ipcMain.handle('template:takeEditing', () => takeEditingPayload());
  // 模板应用：独立窗口的模板页不应自己跳转，交由主窗口处理（保持独立窗口语义与主窗口单例）
  ipcMain.handle('template:apply', (e, payload) => {
    const sender = BrowserWindow.fromWebContents(e.sender);
    let delivered = false;
    for (const win of BrowserWindow.getAllWindows()) {
      if (win === sender || win.isDestroyed()) continue;
      win.webContents.send('template:applied', payload);
      delivered = true;
    }
    // 把主窗口带到前台，让用户直接看到应用结果
    if (!delivered) {
      const main = BrowserWindow.getAllWindows().find((w) => w !== sender && !w.isDestroyed());
      main?.focus();
    } else {
      const main = BrowserWindow.getAllWindows().find((w) => w !== sender && !w.isDestroyed());
      main?.focus();
    }
  });

  // 旧版本（3.x）水印模板导入
  ipcMain.handle('legacy:importTemplates', () => importLegacyTemplates());

  ipcMain.handle('fs:scanDirectory', (_e, root: string, extensions: string[]) => scanDirectory(root, extensions));
  ipcMain.handle('fs:readFileBase64', (_e, path: string) => readFileBase64(path));
  ipcMain.handle('fs:writeFileBase64', (_e, path: string, base64: string) => writeFileBase64(path, base64));
  ipcMain.handle('fs:ensureDir', (_e, path: string) => ensureDir(path));
  ipcMain.handle('fs:exists', (_e, path: string) => fileExists(path));
  ipcMain.handle('fs:stat', (_e, path: string) => fileStat(path));
  ipcMain.handle('fs:remove', (_e, path: string) => removeFile(path));

  // 系统字体：直接读注册表/字体目录，不受 Chromium 字体缓存影响
  ipcMain.handle('font:listInstalled', (_e, force?: boolean) => listInstalledFonts(!!force));
  ipcMain.handle('font:isInstalled', (_e, family: string, style?: string) =>
    isFontInstalled(family, style)
  );
  ipcMain.handle('font:matchInstalled', (_e, list: { family: string; style: string }[], family: string, style?: string) =>
    matchInstalled(list ?? [], family, style)
  );

  ipcMain.handle('updater:check', () => checkForUpdates());
  ipcMain.handle('updater:download', () => downloadUpdate());
  ipcMain.handle('updater:quitAndInstall', () => quitAndInstall());
}
