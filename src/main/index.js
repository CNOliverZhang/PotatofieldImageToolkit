import { app, protocol, BrowserWindow, ipcMain, dialog, nativeImage, Menu, Tray, screen } from 'electron'
import { autoUpdater } from 'electron-updater'
import '../renderer/store'

const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const devWindowHeight = 1080
const windows = new Set()
const windowTitles = new Set()
const baseURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

let mainWindow
let updateTargetWindow
let tray
let zoomFactor
let scale = 1.0

autoUpdater.autoDownload = false
autoUpdater.setFeedURL("https://files.potatofield.cn/ImageToolkit/Packages")

if (process.env.NODE_ENV === 'development') {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml')
} else {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
}

function createWindow(args) {
  let newWindow = new BrowserWindow({
    title: args.title,
    frame: false,
    fullscreenable: false,
    resizable: true,
    closable: false,
    show: false,
    minimizable: true,
    maximizable: false,
    transparent: args.transparent,
    hasShadow: args.hideShadow ? false : true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      allowRunningInsecureContent: true,
    }
  })

  newWindow.loadURL(baseURL + args.path)

  newWindow.on('restore', () => {
    if (!newWindow.isMaximized()) {
      newWindow.setSize(
        args.width ? Math.round(args.width * zoomFactor * scale) : Math.round(900 * zoomFactor * scale),
        args.height ? Math.round(args.height * zoomFactor * scale) : Math.round(600 * zoomFactor * scale)
      )
    }
  })

  newWindow.on('maximize', () => {
    newWindow.webContents.setZoomFactor(zoomFactor * scale)
  })

  newWindow.on('unmaximize', () => {
    newWindow.setSize(
      args.width ? Math.round(args.width * zoomFactor * scale) : Math.round(900 * zoomFactor * scale),
      args.height ? Math.round(args.height * zoomFactor * scale) : Math.round(600 * zoomFactor * scale)
    )
    newWindow.webContents.setZoomFactor(zoomFactor * scale)
  })

  newWindow.once('ready-to-show', () => {
    newWindow.show()
    newWindow.setSize(
      args.width ? Math.round(args.width * zoomFactor * scale) : Math.round(900 * zoomFactor * scale),
      args.height ? Math.round(args.height * zoomFactor * scale) : Math.round(600 * zoomFactor * scale)
    )
    newWindow.setMinimumSize(
      args.width ? Math.round(args.width * zoomFactor * scale) : Math.round(900 * zoomFactor * scale),
      args.height ? Math.round(args.height * zoomFactor * scale) : Math.round(600 * zoomFactor * scale)
    )
    newWindow.webContents.setZoomFactor(zoomFactor * scale)
    newWindow.center()
  })
  
  newWindow.on('close', (event) => {
    event.preventDefault()
  })

  newWindow.on('closed', () => {
    windowTitles.delete(args.title)
    windows.delete(newWindow)
    newWindow = null
  })

  windows.add(newWindow)
  windowTitles.add(args.title)
  return newWindow
}

function openWindow(args) {
  if (windowTitles.has(args.title)) {
    windows.forEach((window) => {
      if (window.webContents.browserWindowOptions.title == args.title) {
        window.show()
      }
    })
  } else {
    let targetArgs = {
      title: args.title,
      path: args.path,
    }
    if (args.width) {
      targetArgs.width = args.width
      targetArgs.height = args.height
    }
    createWindow(targetArgs)
  }
}

process.on('uncaughtException', () => {
  updateTargetWindow.send('error')
})

if (!app.requestSingleInstanceLock()) {
  app.exit()
}

app.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    protocol.interceptFileProtocol('file', (req, callback) => {
      const url = req.url.substr(8);
      callback(decodeURI(url));
    }, () => {})
  }
  zoomFactor = screen.getPrimaryDisplay().workAreaSize.height / devWindowHeight * scale
  mainWindow = createWindow({
    title: '洋芋田图像工具箱',
    path: '#/',
    width: 800,
    height: 500,
    transparent: true,
    hideShadow: true
  })
  let icon = nativeImage.createFromPath(path.join(__static, 'images/icon.ico'))
  let menu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '打开工具',
      submenu: [
        {
          label: '图片加水印工具',
          click: () => {
            openWindow({
              title: '图片加水印工具',
              path: '#/watermark'
            })
          }
        },
        {
          label: '长图拼接工具',
          click: () => {
            openWindow({
              title: '长图拼接工具',
              path: '#/splicer'
            })
          }
        },
        {
          label: '图片裁剪工具',
          click: () => {
            openWindow({
              title: '图片裁剪工具',
              path: '#/cropper'
            })
          }
        },
        {
          label: '图片分割工具',
          click: () => {
            openWindow({
              title: '图片分割工具',
              path: '#/slicer'
            })
          }
        },
        {
          label: '富文本制图工具',
          click: () => {
            openWindow({
              title: '富文本制图工具',
              path: '#/textToImage'
            })
          }
        },
        {
          label: '尺寸调整工具',
          click: () => {
            openWindow({
              title: '尺寸调整工具',
              path: '#/resizer'
            })
          }
        },
        {
          label: '图片压缩工具',
          click: () => {
            openWindow({
              title: '图片压缩工具',
              path: '#/compress'
            })
          }
        },
        {
          label: '格式转换工具',
          click: () => {
            openWindow({
              title: '格式转换工具',
              path: '#/convert'
            })
          }
        },
        {
          label: 'EXIF 读取工具',
          click: () => {
            openWindow({
              title: 'EXIF 读取工具',
              path: '#/exif'
            })
          }
        },
        {
          label: '色彩提取工具',
          click: () => {
            openWindow({
              title: '色彩提取工具',
              path: '#/palette'
            })
          }
        },
        {
          label: '字体管理工具',
          click: () => {
            openWindow({
              title: '字体管理工具',
              path: '#/fonts'
            })
          }
        }
      ]
    },
    {
      label: '设置',
      click: () => {
        openWindow({
          title: '设置',
          path: '#/settings'
        })
      }
    },
    {
      label: '退出',
      click: () => {
        if (windows.size > 1) {
          mainWindow.show()
          mainWindow.webContents.send('exit')
        } else {
          app.exit()
        }
      }
    }
  ])
  tray = new Tray(icon)
  tray.setContextMenu(menu)
  tray.setToolTip('洋芋田图像工具箱')
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
})

app.on('second-instance', (event) => {
  mainWindow.show()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.exit()
  }
})

app.on('before-quit', () => {
  console.log(windows.size)
  if (windows.size > 1) {
    mainWindow.show()
    mainWindow.webContents.send('exit')
  } else {
    app.exit()
  }
})

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    mainWindow = createWindow({
      title: '洋芋田图像工具箱',
      path: '#/',
      width: 800,
      height: 500,
      transparent: true,
      hideShadow: true
    })
  }
})

ipcMain.on('check-for-update', (event) => {
  updateTargetWindow = event.sender
  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 200)
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('update-now', () => {
  autoUpdater.quitAndInstall(false, false)
  app.exit()
})

ipcMain.on('scale', (event, arg) => {
  scale = arg
})

ipcMain.on('auto-open-status', (event) => {
  event.returnValue = app.getLoginItemSettings().openAtLogin
})

ipcMain.on('open-at-login', (event, arg) => {
  app.setLoginItemSettings({
    openAtLogin: arg
  })
})

ipcMain.on('hide', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  currentWindow.hide()
})

ipcMain.on('show', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  currentWindow.show()
})

ipcMain.on('minimize', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  currentWindow.minimize()
})

ipcMain.on('unmaximize', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  currentWindow.unmaximize()
})

ipcMain.on('change-maximize-status', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  if (currentWindow.isMaximized()) {
    currentWindow.unmaximize()
  } else {
    currentWindow.maximize()
  }
})

ipcMain.on('close', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  currentWindow.destroy()
})

ipcMain.on('index-only', (event) => {
  if (windows.size <= 1) {
    event.returnValue = true
  } else {
    event.returnValue = false
  }
})

ipcMain.on('exit', () => {
  app.exit()
})

ipcMain.on('relaunch', () => {
  app.relaunch()
  app.exit()
})

ipcMain.on('open', (event, args) => {
  openWindow(args)
})

ipcMain.on('version', (event) => {
  event.returnValue = app.getVersion()
})

ipcMain.on('app-data-path', (event) => {
  event.returnValue = app.getPath('userData')
})

ipcMain.on('select-folder', (event) => {
  dialog.showOpenDialog({
    title: "选择文件夹",
    properties: ['openDirectory']
  }).then((result) => {
    if (result.filePaths != 0) {
      event.returnValue = result.filePaths[0]
    } else {
      event.returnValue = ''
    }
  })
})

autoUpdater.on('update-available', (info) => {
  updateTargetWindow.send('update-available', info)
})

autoUpdater.on('update-not-available', () => {
  updateTargetWindow.send('update-not-available')
})

autoUpdater.on('download-progress', (progress) => {
  updateTargetWindow.send('update-download-progress', progress.percent)
})

autoUpdater.on('update-downloaded', () => {
  updateTargetWindow.send('update-downloaded')
})

autoUpdater.on('error', () => {
  updateTargetWindow.send('error')
})