
const btc_price = document.getElementById('btc-price')
const crypto_code = document.getElementById('crypto-to-add')
const add_btn = document.getElementById('add-crypto')
const usd_btn = document.getElementById('USD-btn')
const eur_btn = document.getElementById('EUR-btn')
const port_balance = document.getElementById('balance')
const add_port_coin = document.getElementById('add-portfolio-coin')
add_btn.onclick = addCryptoCurrency;
usd_btn.onclick = setUSD;
eur_btn.onclick = setEUR;
add_port_coin.onclick = addPortfolioCoinPopup;

const electron = require('electron')
const path = require('path')
const ipc = electron.ipcRenderer;

var cryptos = ['BTC']
var currency = 'USD'

let crypto_information = [
    
]
Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}
function removeCrypto(code){
    const index = cryptos.indexOf(code)
    if (index > -1){
      cryptos.splice(index, 1)
    }
}

function addPorfolioCoinWindow(){
    
    const app = electron.remote.app;
    const BrowserWindow = electron.remote.BrowserWindow;
    const screen = electron.remote.screen;
    const AddWindow = new BrowserWindow({
      height: 200,
      width: 350,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false,
      }
    });
    var cursor_pos = screen.getCursorScreenPoint()
    AddWindow.setPosition(cursor_pos.x, cursor_pos.y);
    AddWindow.setResizable(false);
    AddWindow.webContents.openDevTools();

    AddWindow.removeMenu()
    AddWindow.loadFile(path.join(app.getAppPath(), 'src/add.html'));
  }

function parsePrices(){
    return new Promise((resolve,reject) => {
        var result = "";
        console.log("parsePrices()");
        const net = electron.remote.net; 
        var path = "data/pricemultifull?fsyms=BTC"
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
}

async function setUSD(){
    currency = 'USD'
    //clear the information due to currency change
    crypto_information = []
    doParse()

}
async function setEUR(){
    currency = 'EUR'
    //clear the information due to currency change
    crypto_information = []
    doParse()
}

async function doParse(){
 
    const prices = await parsePrices();
    cryptos.forEach(crypto => {
        var lower_case = crypto.toLowerCase()
        const price_id = document.getElementById(`${lower_case}-price`)
        const change_id = document.getElementById(`${lower_case}-change`)
        const day_change = document.getElementById(`${lower_case}-box-daychange`)
        const day_change_text = document.getElementById(`${lower_case}-daychange-text`)
        const image = document.getElementById(`${lower_case}-img`)
        if (!prices.RAW[crypto]){
            const index = cryptos.indexOf(crypto)
            if (index > -1){
              cryptos.splice(index, 1)
            }
            removeCrypto(crypto)
            RenderCrypto()
            doParse()
        }
        const price = prices.RAW[crypto][currency]["PRICE"]
        image.src = "https://www.cryptocompare.com" + prices.RAW[crypto][currency]["IMAGEURL"]
        

        let old_information = crypto_information.find(crypto => crypto.name == lower_case)
        if (old_information != null && old_information.price != 0){
            const old_price = old_information.price

            if (old_price > price){
                price_id.style.color = "red"
            }else if (old_price < price){
                price_id.style.color = "green"
            }else{
                price_id.style.color = "white"
            }
            const difference = price - old_price
            if (difference != 0){
                var diff_to_print
                if (price < 1){
                    diff_to_print = difference.toFixed(4)
                }else{
                    diff_to_print = difference.toFixed(2)
                }
                change_id.innerHTML = difference > 0 ? `+${diff_to_print}` : `${diff_to_print}`
            }


        }
        var percentage = prices.RAW[crypto][currency]["CHANGEPCT24HOUR"].toFixed(2)
        if (percentage < 0){
            day_change.style.background = "red"
        }else{
            day_change.style.background = "green"
        }
        day_change_text.innerHTML = percentage + "%"

        price_id.innerHTML = (price.countDecimals() > 5 ? `${price.toFixed(5)}` : price.countDecimals() > 2 ? `${price.toFixed(price.countDecimals())}` : `${price}`) + (currency == 'USD' ? '$': '€')
        if (old_information == null){
            let information = {
                "name": lower_case,
                "price": price
            }
            crypto_information.push(information)
        }else{
            // No need to change the information if the price is same
            if (old_information.price == price){
                return
            }
            crypto_index = crypto_information.findIndex(crypto => crypto.name == lower_case)
            crypto_information[crypto_index].price = price
        }
    })


}
doParse()
setInterval(doParse, 6 * 1000)

function RenderCrypto(){
    //remove and re-render
    document.getElementById('cryptos').innerHTML = ''
    cryptos.forEach(crypto => {
        
        document.getElementById('cryptos').innerHTML += `<div class="crypto-${crypto}">
        <br>
        <span style="position: absolute; top: 5px; left: 5px; color: rgb(100,100,100)">${crypto}</span><img id="${crypto.toLowerCase()}-img" width="48" height="48" >
        <button style="color: white; border: none; position: absolute; top: -8px; right: 3px;" id="remove-${crypto}">X</button><br>
        <h2 id="${crypto.toLowerCase()}-price" style="display: inline-block; margin-top: 5px;">
        0.00$
        </h2>
        <small id="${crypto.toLowerCase()}-change"></small>
        <div class="hchange-${crypto.toLowerCase()}" id="${crypto.toLowerCase()}-box-daychange">
            <span id="${crypto.toLowerCase()}-daychange-text">0.00%</span>
        </div>
        </div>
        `

    })
    cryptos.forEach(crypto => {
        var crypto_tab = document.getElementsByClassName(`crypto-${crypto}`)[0]
        crypto_tab.addEventListener("contextmenu", function(e){
            e.stopPropagation();
            e.preventDefault();
        })
        document.getElementById(`remove-${crypto}`).addEventListener("click", function(){
            const index = cryptos.indexOf(crypto)
            if (index > -1){
              cryptos.splice(index, 1)
            }
            removeCrypto(crypto)
            RenderCrypto()
            doParse()
        })
    })

}
RenderCrypto()
function addCryptoCurrency(){
    if (crypto_code.value == ""){
        return
    }
    var corrected = crypto_code.value.toUpperCase()
    cryptos.push(corrected)
    crypto_code.value = ""
    RenderCrypto()
    doParse()

}
function addPortfolioCoinPopup(){
    addPorfolioCoinWindow();
}
ipc.on("new-coin", function(event, arg){
    console.log('here')
    console.log(arg.toString())
})