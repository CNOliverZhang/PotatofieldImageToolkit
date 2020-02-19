import { app, BrowserWindow, ipcMain, dialog } from 'electron'
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

const windows = new Set()
const windowTitles = new Set()
let mainWindow
let updateTargetWindow
const baseURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

autoUpdater.autoDownload = false
autoUpdater.setFeedURL("https://imagetoolkit.potatofield.cn/download/")

if (process.env.NODE_ENV === 'development') {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml')
} else {
  autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
}

function createWindow(args) {
  let x, y = 0
  let currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow) {
    let [ currentWindowX, currentWindowY ] = currentWindow.getPosition()
    x = currentWindowX + 30
    y = currentWindowY + 30
  }
  let newWindow = new BrowserWindow({
    title: args.title,
    x: x,
    y: y,
    height: args.height ? args.height : 500,
    width: args.width ? args.width : 800,
    frame: false,
    fullscreenable: false,
    resizable: true,
    closable: false,
    show: false,
    parent: args.modal ? args.parent : null,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  })

  newWindow.loadURL(baseURL + args.path)
  
  if (args.modal) {
    newWindow.on('minimize', () => {
      args.parent.minimize()
    })
  }

  newWindow.once('ready-to-show', () => {
    newWindow.show()
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

process.on('uncaughtException', () => {
  updateTargetWindow.webContents.send('error')
})

if (!app.requestSingleInstanceLock()) {
  app.exit()
}

app.on('ready', () => {
  mainWindow = createWindow({
    title: '洋芋田图像工具箱',
    path: '#/'
  })
})

app.on('second-instance', (event) => {
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.focus()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.exit()
  }
})

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    createWindow({
      title: '洋芋田图像工具箱',
      path: '#/'
    })
  }
})

ipcMain.on('check-for-update', (event) => {
  updateTargetWindow = event.sender
  autoUpdater.checkForUpdates()
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('update-now', () => {
  autoUpdater.quitAndInstall(true, true)
})

ipcMain.on('show', (event) => {
  let currentWindow = BrowserWindow.fromWebContents(event.sender)
  if (currentWindow.isMinimized()) {
    currentWindow.restore()
  }
  currentWindow.show()
})

ipcMain.on('minimize', () => {
  let currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.minimize()
})

ipcMain.on('close', () => {
  let currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow.webContents.browserWindowOptions.parent) {
    let parent = currentWindow.webContents.browserWindowOptions.parent
    currentWindow.destroy()
    parent.webContents.send('modal-window-closed')
    if (parent.isMinimized()) {
      parent.restore()
    }
    parent.focus()
  } else {
    currentWindow.destroy()
  }
})

ipcMain.on('index-only', (event) => {
  if (windows.size == 1) {
    event.returnValue = true
  } else {
    event.returnValue = false
  }
})

ipcMain.on('exit', () => {
  windows.forEach((window) => {
    if (window.isModal()) {
      window.destroy()
    }
  })
  app.exit()
})

ipcMain.on('relaunch', () => {
  windows.forEach((window) => {
    if (window.isModal()) {
      window.destroy()
    }
  })
  app.relaunch()
  app.exit()
})

ipcMain.on('open', (event, args) => {
  if (windowTitles.has(args.title)) {
    windows.forEach((window) => {
      if (window.webContents.browserWindowOptions.title == args.title) {
        if (window.isMinimized()) {
          window.restore()
        }
        window.focus()
      }
    })
  } else {
    let targetArgs = {
      title: args.title,
      path: args.path,
    }
    if (args.modal) {
      targetArgs.parent = BrowserWindow.getFocusedWindow()
      targetArgs.modal = true
    }
    if (args.width) {
      targetArgs.width = args.width
      targetArgs.height = args.height
    }
    createWindow(targetArgs)
  }
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
  updateTargetWindow.webContents.send('update-available', info)
})

autoUpdater.on('update-not-available', () => {
  updateTargetWindow.webContents.send('update-not-available')
})

autoUpdater.on('download-progress', (progress) => {
  updateTargetWindow.webContents.send('update-download-progress', progress.percent)
})

autoUpdater.on('update-downloaded', () => {
  updateTargetWindow.webContents.send('update-downloaded')
})

autoUpdater.on('error', () => {
  updateTargetWindow.webContents.send('error')
})