const btc_price = document.getElementById('btc-price')
const crypto_code = document.getElementById('crypto-to-add')
const add_btn = document.getElementById('add-crypto')
add_btn.onclick = addCryptoCurrency;

var cryptos = ['BTC']
    let crypto_information = [
    
    ]
async function doParse(){

    const prices = await window.electron.parsePrices();
    cryptos.forEach(crypto => {
        var lower_case = crypto.toLowerCase()
        const price_id = document.getElementById(`${lower_case}-price`)
        const price = prices[crypto].USD
        
        let old_information = crypto_information.find(crypto => crypto.name == lower_case)
        console.log(old_information)
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
        price_id.innerHTML = `${price}$`
        if (old_information == null){
            let information = {
                "name": lower_case,
                "price": price
            }
            crypto_information.push(information)
        }else{
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