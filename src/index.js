const electron = require('electron')

const electronRemote = process.type === 'browser'
  ? electron
  : require('@electron/remote')
;

const { BrowserWindow } = electronRemote;

const { app } = electronRemote;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: false
    }
  })

  mainWindow.loadFile('src/index.html')

  mainWindow.webContents.openDevTools()

  require('@electron/remote/main').initialize();
  require('@electron/remote/main').enable(mainWindow.webContents);
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})