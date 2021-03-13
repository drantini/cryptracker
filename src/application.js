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
function setUSD(){
    currency = 'USD'
    doParse()
}
function setEUR(){
    currency = 'EUR'
    doParse()
}
async function doParse(){

    const prices = await window.electron.parsePrices();
    cryptos.forEach(crypto => {
        var lower_case = crypto.toLowerCase()
        const price_id = document.getElementById(`${lower_case}-price`)
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
        <span>${crypto}</span>
        <h2 id="${crypto.toLowerCase()}-price">
        0.00$
        </h2>
        `
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