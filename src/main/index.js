import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const windows = new Set
const windowTitles = new Set
const baseURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow(args) {
  let x, y = 0
  let title = args.title
  const currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow) {
    const [ currentWindowX, currentWindowY ] = currentWindow.getPosition()
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
    show: false
  })

  newWindow.loadURL(baseURL + '/#' + args.path)

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
    event.sender.send('same-window-exists')
    return
  }
  createWindow({
    title: args.title,
    path: args.path
  })
})

app.on('ready', function () {
  createWindow({
    title: '洋芋田图像工具箱',
    path: '/'
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
      path: '/'
    })
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
