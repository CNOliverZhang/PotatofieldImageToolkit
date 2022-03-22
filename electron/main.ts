import * as path from 'path';
import isDev from 'electron-is-dev';
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeImage,
  Menu,
  Tray,
  screen,
  WebContents,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { CreateWindowProps } from './types';

const devWindowHeight = 1080;
const defaultWindowWidth = 1280;
const defaultWindowHeight = 720;
const windowSet = new Set<BrowserWindow>();
const windowTitles = new Set<string>();
const baseURL = isDev
  ? 'http://localhost:9080'
  : `file://${path.join(__dirname, '..')}/build/index.html`;

let mainWindow: BrowserWindow;
let updateTargetWindow: WebContents;
let tray: Tray;
let zoomFactor: number;
let scale = 1.0;

autoUpdater.autoDownload = false;
autoUpdater.setFeedURL('https://files.potatofield.cn/ImageToolkit/Packages');

// if (process.env.NODE_ENV === 'development') {
//   autoUpdater.updateConfigPath = path.join(__dirname, '../dev-app-update.yml');
// } else {
//   autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml');
// }

function createWindow(args: CreateWindowProps) {
  let newWindow = new BrowserWindow({
    title: args.title,
    // frame: false,
    fullscreenable: false,
    resizable: true,
    closable: false,
    show: false,
    minimizable: true,
    maximizable: false,
    transparent: args.transparent,
    hasShadow: !args.hideShadow,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      allowRunningInsecureContent: true,
      contextIsolation: false,
    },
  });

  newWindow.loadURL(baseURL + args.path);

  newWindow.on('restore', () => {
    if (!newWindow.isMaximized()) {
      newWindow.setSize(
        Math.round(args.width || defaultWindowWidth * zoomFactor * scale),
        Math.round(args.height || defaultWindowHeight * zoomFactor * scale)
      );
    }
  });

  newWindow.on('maximize', () => {
    newWindow.webContents.setZoomFactor(zoomFactor * scale);
  });

  newWindow.on('unmaximize', () => {
    newWindow.setSize(
      Math.round(args.width || defaultWindowWidth * zoomFactor * scale),
      Math.round(args.height || defaultWindowHeight * zoomFactor * scale)
    );
    newWindow.webContents.setZoomFactor(zoomFactor * scale);
  });

  newWindow.once('ready-to-show', () => {
    newWindow.show();
    newWindow.setSize(
      Math.round(args.width || defaultWindowWidth * zoomFactor * scale),
      Math.round(args.height || defaultWindowHeight * zoomFactor * scale)
    );
    newWindow.setMinimumSize(
      Math.round(args.width || defaultWindowWidth * zoomFactor * scale),
      Math.round(args.height || defaultWindowHeight * zoomFactor * scale)
    );
    newWindow.webContents.setZoomFactor(zoomFactor * scale);
    newWindow.center();
  });

  newWindow.on('close', (event) => {
    event.preventDefault();
  });

  newWindow.on('closed', () => {
    windowTitles.delete(args.title);
    windowSet.delete(newWindow);
    newWindow = null;
  });

  windowSet.add(newWindow);
  windowTitles.add(args.title);
  return newWindow;
}

function openWindow(args: CreateWindowProps) {
  if (windowTitles.has(args.title)) {
    windowSet.forEach((window) => {
      if (window.webContents.getTitle() === args.title) {
        window.show();
      }
    });
  } else {
    createWindow(args);
  }
}

process.on('uncaughtException', () => {
  updateTargetWindow.send('error');
});

if (!app.requestSingleInstanceLock()) {
  app.exit();
}

app.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    protocol.interceptFileProtocol('file', (req, callback) => {
      const url = req.url.slice(8);
      callback(decodeURI(url));
    });
  }
  zoomFactor = (screen.getPrimaryDisplay().workAreaSize.height / devWindowHeight) * scale;
  mainWindow = createWindow({
    title: '洋芋田图像工具箱',
    path: '#/',
    width: 800,
    height: 500,
    transparent: true,
    hideShadow: true,
  });
  const icon = nativeImage.createFromPath(
    path.join(
      __dirname,
      `../static/icons/${
        process.platform === 'darwin' ? 'mac-tray/iconTemplate.png' : 'windows/icon.ico'
      }`
    )
  );
  const menu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: '打开工具',
      submenu: [
        {
          label: '图片加水印工具',
          click: () => {
            openWindow({
              title: '图片加水印工具',
              path: '#/watermark',
            });
          },
        },
        {
          label: '长图拼接工具',
          click: () => {
            openWindow({
              title: '长图拼接工具',
              path: '#/splicer',
            });
          },
        },
        {
          label: '图片裁剪工具',
          click: () => {
            openWindow({
              title: '图片裁剪工具',
              path: '#/cropper',
            });
          },
        },
        {
          label: '图片分割工具',
          click: () => {
            openWindow({
              title: '图片分割工具',
              path: '#/slicer',
            });
          },
        },
        {
          label: '富文本制图工具',
          click: () => {
            openWindow({
              title: '富文本制图工具',
              path: '#/textToImage',
            });
          },
        },
        {
          label: '尺寸调整工具',
          click: () => {
            openWindow({
              title: '尺寸调整工具',
              path: '#/resizer',
            });
          },
        },
        {
          label: '图片压缩工具',
          click: () => {
            openWindow({
              title: '图片压缩工具',
              path: '#/compress',
            });
          },
        },
        {
          label: '格式转换工具',
          click: () => {
            openWindow({
              title: '格式转换工具',
              path: '#/convert',
            });
          },
        },
        {
          label: 'EXIF 读取工具',
          click: () => {
            openWindow({
              title: 'EXIF 读取工具',
              path: '#/exif',
            });
          },
        },
        {
          label: '色彩提取工具',
          click: () => {
            openWindow({
              title: '色彩提取工具',
              path: '#/palette',
            });
          },
        },
        {
          label: '字体管理工具',
          click: () => {
            openWindow({
              title: '字体管理工具',
              path: '#/fonts',
            });
          },
        },
      ],
    },
    {
      label: '设置',
      click: () => {
        openWindow({
          title: '设置',
          path: '#/settings',
        });
      },
    },
    {
      label: '退出',
      click: () => {
        if (windowSet.size > 1) {
          mainWindow.show();
          mainWindow.webContents.send('exit');
        } else {
          app.exit();
        }
      },
    },
  ]);
  tray = new Tray(icon);
  tray.setContextMenu(menu);
  tray.setToolTip('洋芋田图像工具箱');
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
});

app.on('second-instance', () => {
  mainWindow.show();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.exit();
  }
});

app.on('before-quit', () => {
  if (windowSet.size > 1) {
    mainWindow.show();
    mainWindow.webContents.send('exit');
  } else {
    app.exit();
  }
});

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    mainWindow = createWindow({
      title: '洋芋田图像工具箱',
      path: '#/',
      width: 800,
      height: 500,
      transparent: true,
      hideShadow: true,
    });
  }
});

ipcMain.on('check-for-update', (event) => {
  updateTargetWindow = event.sender;
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 200);
});

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('update-now', () => {
  autoUpdater.quitAndInstall(false, false);
  app.exit();
});

ipcMain.on('scale', (event, arg) => {
  scale = arg;
});

ipcMain.on('auto-open-status', (event) => {
  event.returnValue = app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('open-at-login', (event, arg) => {
  app.setLoginItemSettings({
    openAtLogin: arg,
  });
});

ipcMain.on('hide', (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  currentWindow.hide();
});

ipcMain.on('show', (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  currentWindow.show();
});

ipcMain.on('minimize', (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  currentWindow.minimize();
});

ipcMain.on('unmaximize', (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  currentWindow.unmaximize();
});

ipcMain.on('change-maximize-status', (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize();
  } else {
    currentWindow.maximize();
  }
});

ipcMain.on('close', (event) => {
  const currentWindow = BrowserWindow.fromWebContents(event.sender);
  currentWindow.destroy();
});

ipcMain.on('index-only', (event) => {
  if (windowSet.size <= 1) {
    event.returnValue = true;
  } else {
    event.returnValue = false;
  }
});

ipcMain.on('exit', () => {
  app.exit();
});

ipcMain.on('relaunch', () => {
  app.relaunch();
  app.exit();
});

ipcMain.on('open', (event, args) => {
  openWindow(args);
});

ipcMain.on('version', (event) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('app-data-path', (event) => {
  event.returnValue = app.getPath('userData');
});

ipcMain.on('select-folder', (event) => {
  dialog
    .showOpenDialog({
      title: '选择文件夹',
      properties: ['openDirectory'],
    })
    .then((result) => {
      if (result.filePaths.length) {
        [event.returnValue] = result.filePaths;
      } else {
        event.returnValue = '';
      }
    });
});

autoUpdater.checkForUpdates();

autoUpdater.on('update-available', (info) => {
  console.log(info);
  updateTargetWindow.send('update-available', info);
});

autoUpdater.on('update-not-available', () => {
  updateTargetWindow.send('update-not-available');
});

autoUpdater.on('download-progress', (progress) => {
  updateTargetWindow.send('update-download-progress', progress.percent);
});

autoUpdater.on('update-downloaded', () => {
  updateTargetWindow.send('update-downloaded');
});

autoUpdater.on('error', () => {
  updateTargetWindow.send('error');
});
