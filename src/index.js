const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const electron = require('electron')
const ipc = electron.ipcMain;

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const Store = require('electron-store')
Store.initRenderer();
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(app.getAppPath(), "btc_logo.png"),
    webPreferences: {      
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,

    }
  });
  mainWindow.setResizable(false);
  mainWindow.removeMenu()

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  ipc.on("new-coin", function(event, arg){
    mainWindow.webContents.send("new-coin-parse", arg)

  })
  
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  /*tray = new Tray(path.join(app.getAppPath(), 'btc_logo.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'normal' },
    { label: 'Item2', type: 'normal' },
    { label: 'Item3', type: 'normal' },
    { label: 'Item4', type: 'normal' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)*/
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
try {
  require('electron-reloader')(module)
} catch (_) {}
