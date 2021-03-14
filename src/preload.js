const { contextBridge, ipcRenderer, Menu} = require('electron')
const electron = require('electron'); 
const path = require('path');


var cryptos = []
contextBridge.exposeInMainWorld(
  'electron',
  {
    addPorfolioCoinWindow: () =>{
      const app = electron.remote.app;
      const BrowserWindow = electron.remote.BrowserWindow;
      const AddWindow = new BrowserWindow({
        height: 300,
        width: 350,
      });
      AddWindow.setResizable(false);
      AddWindow.removeMenu()
      AddWindow.loadFile(path.join(app.getAppPath(), 'src/add.html'));
    },
    parsePrices:  () => {
      return new Promise((resolve,reject) => {
      var result = "";
      console.log("parsePrices()");
      const net = electron.remote.net; 
      var path = "data/pricemulti?fsyms=BTC"
      cryptos.forEach(crypto => {
        path += "," + crypto
      })
      path += "&tsyms=USD,EUR"
      const request = net.request({ 
        method: 'GET', 
        protocol: 'https:', 
        hostname: 'min-api.cryptocompare.com',

        path: path,
        redirect: 'follow'
      }); 
      request.on('response', (response) => {

          response.on('data', (chunk) => {
            var parsed = JSON.parse(chunk.toString())
            resolve(parsed);
          })
      })
      request.on('finish', () => { 
      }); 
      request.setHeader('Content-Type', 'application/json'); 
      request.end();
      })
    },

    addCryptoToList: (code) => {
      //TODO: add sanity checks
      cryptos.push(code)
    },
    removeCryptoFromList: (code) => {
      const index = cryptos.indexOf(code)
      if (index > -1){
        cryptos.splice(index, 1)
      }
    },

  }
)



