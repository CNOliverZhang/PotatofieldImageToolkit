import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const windows = new Set;

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createMainWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 500,
    width: 800,
    frame: false,
    fullscreenable: false,
    resizable: true,
    show: false
  })

  mainWindow.loadURL(winURL)
  
  mainWindow.on('ready-to-show', function () {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createWindow(path) {
  let newWindow = new BrowserWindow({
    height: 500,
    width: 800,
    frame: false,
    fullscreenable: false,
    resizable: true,
    show: false
  });

  newWindow.loadFile('app/index.html');

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow); //从已关闭的窗口Set中移除引用
    newWindow = null;
  });

  windows.add(newWindow); //将窗口添加到已打开时设置的窗口
  return newWindow;
}

ipcMain.on('minimize', function() {
  mainWindow.minimize();
})

ipcMain.on('exit', function() {
  mainWindow.close();
})

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
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
