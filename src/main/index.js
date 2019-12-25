import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const windows = new Set;
const baseURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow(path) {
  let x, y
  const currentWindow = BrowserWindow.getFocusedWindow()
  if (currentWindow) {
    const [ currentWindowX, currentWindowY ] = currentWindow.getPosition()
    x = currentWindowX + 30
    y = currentWindowY + 30
  }
  let newWindow = new BrowserWindow({
    x,
    y,
    height: 500,
    width: 800,
    frame: false,
    fullscreenable: false,
    resizable: true,
    show: false
  })

  newWindow.loadURL(baseURL + '/#' + path)

  newWindow.once('ready-to-show', function () {
    newWindow.show()
  })

  newWindow.on('closed', () => {
    windows.delete(newWindow)
    newWindow = null
  });

  windows.add(newWindow)
  return newWindow
}

ipcMain.on('minimize', function () {
  let currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.minimize();
})

ipcMain.on('close', function () {
  let currentWindow = BrowserWindow.getFocusedWindow()
  currentWindow.close();
})

ipcMain.on('open', function (event, path) {
  createWindow(path)
})

app.on('ready', function () {
  createWindow('/')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    createWindow('/')
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
