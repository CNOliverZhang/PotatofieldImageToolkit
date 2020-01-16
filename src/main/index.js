import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
const path = require('path')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const windows = new Set
const windowTitles = new Set
let mainWindow
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
  let title = args.title
  let modal = false
  let parent = null
  if (args.modal) {
    modal = true
    parent = args.parent
  }
  let currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow) {
    let [ currentWindowX, currentWindowY ] = currentWindow.getPosition()
    x = currentWindowX + 30
    y = currentWindowY + 30
  }
  let newWindow = new BrowserWindow({
    title: title,
    x: x,
    y: y,
    height: 500,
    width: 800,
    frame: false,
    fullscreenable: false,
    resizable: true,
    show: false,
    parent: parent,
    modal: modal
  })

  newWindow.loadURL(baseURL + args.path)

  newWindow.once('ready-to-show', function () {
    newWindow.show()
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
  mainWindow.webContents.send('error')
})

app.on('ready', function () {
  mainWindow = createWindow({
    title: '洋芋田图像工具箱',
    path: '#/'
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
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

ipcMain.on('check-for-update', () => {
  autoUpdater.checkForUpdates()
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('update-now', () => {
  autoUpdater.quitAndInstall(true, true)
})

ipcMain.on('minimize', function () {
  let currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.minimize()
})

ipcMain.on('close', function () {
  let currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.close()
})

ipcMain.on('open', function (event, args) {
  if (windowTitles.has(args.title)) {
    event.returnValue = false
    return
  }
  if (args.modal) {
    createWindow({
      title: args.title,
      path: args.path,
      parent: BrowserWindow.getFocusedWindow(),
      modal: true
    })
  } else {
    createWindow({
      title: args.title,
      path: args.path
    })
  }
  event.returnValue = true
})

ipcMain.on('select-folder', function (event) {
  dialog.showOpenDialog({
    title: "选择文件夹",
    properties: ['openDirectory']
  }, function (folder) {
    if (folder) {
      event.returnValue = folder[0]
    }
  })
})

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info)
})

autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('update-download-progress', progress.percent)
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded')
})

autoUpdater.on('error', () => {
  mainWindow.webContents.send('error')
})