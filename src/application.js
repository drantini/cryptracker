
const btc_price = document.getElementById('btc-price')
const crypto_code = document.getElementById('crypto-to-add')
const add_btn = document.getElementById('add-crypto')
const usd_btn = document.getElementById('USD-btn')
const eur_btn = document.getElementById('EUR-btn')
add_btn.onclick = addCryptoCurrency;
usd_btn.onclick = setUSD;
eur_btn.onclick = setEUR;

var cryptos = ['BTC']
var currency = 'USD'

let crypto_information = [
    
]


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

    const prices = await window.electron.parsePrices();
    cryptos.forEach(crypto => {
        var lower_case = crypto.toLowerCase()
        const price_id = document.getElementById(`${lower_case}-price`)
        const change_id = document.getElementById(`${lower_case}-change`)
        const price = prices[crypto][currency]
        

        let old_information = crypto_information.find(crypto => crypto.name == lower_case)
        if (old_information != null && old_information.price != 0){
            const old_price = old_information.price

            if (old_price > price){
                price_id.style.color = "red"
            }else if (old_price < price){
                price_id.style.color = "green"
            }else{
                price_id.style.color = "black"
            }
            const difference = price - old_price
            if (difference != 0){
                var diff_to_print
                if (price < 1){
                    diff_to_print = difference.toFixed(6)
                }else{
                    diff_to_print = difference.toFixed(2)
                }
                change_id.innerHTML = difference > 0 ? `+${diff_to_print}` : `${diff_to_print}`
            }


        }
        price_id.innerHTML = `${price}` + (currency == 'USD' ? '$': '€')
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
        
        document.getElementById('cryptos').innerHTML += `
        <br><br>
        <span>${crypto}</span>    <button id="remove-${crypto}">Remove</button><br>
        </br>
        <h2 id="${crypto.toLowerCase()}-price" style="display: inline-block;">
        0.00$
        </h2>
        <small id="${crypto.toLowerCase()}-change"></small>
        `
        document.getElementById(`remove-${crypto}`).addEventListener("click", function(){
            const index = cryptos.indexOf(crypto)
            if (index > -1){
              cryptos.splice(index, 1)
            }
            window.electron.removeCryptoFromList(crypto)
            RenderCrypto()
            doParse()
        })
    })

}
RenderCrypto()
function addCryptoCurrency(){
    
    cryptos.push(crypto_code.value)
    window.electron.addCryptoToList(crypto_code.value)
    crypto_code.value = ""
    RenderCrypto()
    doParse()

}
function removeCrypto(cryptocurrency){
    console.log(cryptocurrency)
}