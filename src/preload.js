const { contextBridge, ipcRenderer} = require('electron')
const electron = require('electron'); 
var cryptos = []
contextBridge.exposeInMainWorld(
  'electron',
  {
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
      cryptos.forEach(crypto => console.log(crypto))
    }
  }
)



