
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

const Store = require('electron-store')
const store = new Store();
const electron = require('electron')
const path = require('path')
const ipc = electron.ipcRenderer;

var cryptos = ['BTC']
var owned_cryptos = []
var currency = 'USD'
if (store.get('currency') != null){
    currency = store.get('currency')
}
if (store.get('cryptos') != null){
    cryptos = store.get('cryptos')
}
let crypto_information = [
    
]
let owned_crypto_information = [

]

if (store.get('owned_cryptos') != null){
    owned_cryptos = store.get('owned_cryptos')
    owned_crypto_information = store.get('owned_cryptos_information')
    RenderPortfolio()
}

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
    AddWindow.setPosition(cursor_pos.x - 100, cursor_pos.y - 175);
    AddWindow.setResizable(false);
    //AddWindow.webContents.openDevTools();

    AddWindow.removeMenu()
    AddWindow.loadFile(path.join(app.getAppPath(), 'src/add.html'));
}
function addNotifyCoinWindow(){

    const app = electron.remote.app;
    const BrowserWindow = electron.remote.BrowserWindow;
    const screen = electron.remote.screen;
    const NotifyWindow = new BrowserWindow({
      height: 200,
      width: 350,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
        contextIsolation: false,
      }
    });
    var cursor_pos = screen.getCursorScreenPoint()
    NotifyWindow.setPosition(cursor_pos.x - 100, cursor_pos.y - 175);
    NotifyWindow.setResizable(false);
    //AddWindow.webContents.openDevTools();

    NotifyWindow.removeMenu()
    NotifyWindow.loadFile(path.join(app.getAppPath(), 'src/notify.html'));
}

function parsePrices(cryptos_to_parse){
    return new Promise((resolve,reject) => {
        var result = "";
        const net = electron.remote.net; 
        var path = "data/pricemultifull?fsyms=BTC"
        cryptos_to_parse.forEach(crypto => {
          path += "," + crypto.toUpperCase()
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
    UpdatePortfolio()
    store.set('currency', currency)
}
async function setEUR(){
    currency = 'EUR'
    //clear the information due to currency change
    crypto_information = []
    doParse()
    UpdatePortfolio()
    store.set('currency', currency)

}

async function doParse(){
 
    const prices = await parsePrices(cryptos);
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
    //        <button style="color: white; border: none; position: absolute; top: -8px; right: 23px;" id="notify-${crypto}">!</button><br>
    document.getElementById('cryptos').innerHTML = ''
    cryptos.forEach(crypto => {
        
        document.getElementById('cryptos').innerHTML += `<div class="crypto-${crypto}">
        <br>
        <span style="position: absolute; top: 5px; left: 5px; color: rgb(100,100,100)">${crypto}</span><img id="${crypto.toLowerCase()}-img" width="48" height="48" >
        <button style="color: white; border: none; position: absolute; top: -8px; right: 3px;" id="remove-${crypto}">X</button><br>


        <h2 id="${crypto.toLowerCase()}-price" style="display: inline-block; margin-top: -10px;">
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
        /*document.getElementById(`notify-${crypto}`).addEventListener("click", function(){
            addNotifyCoinWindow()
        })*/
        document.getElementById(`remove-${crypto}`).addEventListener("click", function(){
            removeCrypto(crypto)
            RenderCrypto()
            doParse()
        })
    })

}
function RenderPortfolio(){
    document.getElementById('owned-coins').innerHTML = ''

    owned_cryptos.forEach(crypto => {
        document.getElementById('owned-coins').innerHTML += `            
        <div class="owned-${crypto}" id="owned-${crypto}">
            <div>
            <img id="${crypto}-img-port" width="22" height="22" >
            <span id="${crypto}-owned-name" style="position: relative; top:-5px;">Parsing..</span>
            </div>
            
            <div style="text-align: right; position: relative;  top: -10px">
            <small id="${crypto}-owned-amount">NaN</small><br>
            <span id="${crypto}-owned-price">NaN$</span>
            </div>
        </div>`
    })
    owned_cryptos.forEach(crypto => {
        document.getElementById(`owned-${crypto}`).addEventListener('contextmenu', function(){

            const index = owned_cryptos.indexOf(crypto)
            const index_2 = owned_crypto_information.findIndex(crypto_buf => crypto_buf.name == crypto)
            if (index > -1){
                owned_cryptos.splice(index, 1)
            }
            if (index_2 > -1){
                owned_crypto_information.splice(index_2, 1)
            }

            store.set('owned_cryptos', owned_cryptos)
            store.set('owned_cryptos_information', owned_crypto_information)
            RenderPortfolio();

        })
    })
    UpdatePortfolio()

}
async function UpdatePortfolio(){
    if (owned_cryptos.length < 1){
        document.getElementById('owned-coins').innerHTML = ''
    }
    const prices = await parsePrices(owned_cryptos);
    var balance = 0;
    owned_cryptos.forEach(crypto => {
        var image = document.getElementById(`${crypto}-img-port`)
        var name = document.getElementById(`${crypto}-owned-name`)
        var amount = document.getElementById(`${crypto}-owned-amount`)
        var price_together = document.getElementById(`${crypto}-owned-price`)
        var upper_case = crypto.toUpperCase()
        let owned_index = owned_crypto_information.findIndex(crypto_buf => crypto_buf.name == crypto)
        amount.innerHTML = owned_crypto_information[owned_index].amount
        var price = (parseFloat(owned_crypto_information[owned_index].amount)*prices.RAW[upper_case][currency]["PRICE"]).toFixed(2)
        price_together.innerHTML = price + (currency == 'USD' ? '$': '€')
        balance += parseFloat(price);

        image.src = "https://www.cryptocompare.com" + prices.RAW[upper_case][currency]["IMAGEURL"];
        name.innerHTML = upper_case

    })
    var portfolio_balance = document.getElementById('balance')
    portfolio_balance.innerHTML = balance.toFixed(2) + (currency == 'USD' ? '$': '€')

}
setInterval(UpdatePortfolio, 7 * 1000)

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
    store.set('cryptos', cryptos)

}
function addPortfolioCoinPopup(){
    addPorfolioCoinWindow();
}
ipc.on("new-coin-parse", function(event, arg){

    let coin_name = arg.coin.toString()
    let old_information = owned_crypto_information.find(crypto => crypto.name == coin_name)
    if (old_information == null){
        let information = {
            "name": coin_name,
            "amount": parseFloat(arg.amount)
        }
        owned_cryptos.push(coin_name)
        owned_crypto_information.push(information)
    }else{
        if (owned_cryptos.findIndex(crypto => crypto == coin_name.toUpperCase()) < 0){
            owned_cryptos.push(coin_name)
            crypto_index = owned_crypto_information.findIndex(crypto => crypto.name == coin_name)
            owned_crypto_information[crypto_index].amount += parseFloat(arg.amount)
            
        }else{
            crypto_index = owned_crypto_information.findIndex(crypto => crypto.name == coin_name)
            owned_crypto_information[crypto_index].amount += parseFloat(arg.amount)
        }
    }
    RenderPortfolio();

    store.set('owned_cryptos', owned_cryptos)
    store.set('owned_cryptos_information', owned_crypto_information)

})

