const { contextBridge, ipcRenderer, Menu} = require('electron')
const electron = require('electron'); 
contextBridge.exposeInMainWorld(
  'electron',
  {
    requestAddCoin: (name_coin, amount_coin) =>{
        //ipc.send("new-coin", {name: name_coin, amount: amount_coin});
        /*var window = electron.remote.getCurrentWindow();
        window.close();*/
        print('her')
      }
  })