const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const electron = require('electron')
const ipc = electron.ipcMain;

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const Store = require('electron-store')
Store.initRenderer();
let tray = null;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(app.getAppPath(), "cryptracker_big.png"),
    webPreferences: {      
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: 'CrypTracker'
  });
  mainWindow.setResizable(true);
  const img = electron.nativeImage.createFromPath(app.getAppPath() + "/cryptracker_big.png");
  app.dock.setIcon(img);
  app.setAboutPanelOptions({
    applicationName: 'CrypTracker',
    version: '0.0.9beta',
    credits: 'Made by drantini',
    iconPath: path.join(app.getAppPath() + "/cryptracker_medium.png")

  })
  mainWindow.removeMenu()

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  ipc.on("new-coin", function(event, arg){
    mainWindow.webContents.send("new-coin-parse", arg)

  })

  tray = new Tray(path.join(app.getAppPath(), "/cryptracker_small.png"))
  let contextMenu = Menu.buildFromTemplate([
    { label: 'Portfolio - 0.00$', type: 'normal' },
    { label: 'Separate', type: 'separator'},
    { role: 'about' },
    { label: 'Made by drantini', type: 'normal' }
  ])
  tray.setToolTip('CrypTracker')
  tray.setTitle('BTC - 36,800$')
  ipc.on('portfolio-update', (event, arg) => {
    contextMenu = Menu.buildFromTemplate([
      { label: 'Portfolio - ' + arg, type: 'normal' },
      { label: 'Separate', type: 'separator'},
      ...(process.platform === 'darwin' ? [{ role: 'about' }] : [{}]),
      { label: 'Made by drantini', type: 'normal' }
    ])    
    tray.setContextMenu(contextMenu);
  })
  ipc.on('update-tray', (event, arg) => {
    tray.setTitle(`${arg.name} - ${arg.price}`)
  })
  tray.setContextMenu(contextMenu);
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
