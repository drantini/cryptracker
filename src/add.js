const add_btn = document.getElementById('add-coin-btn')
const name_coin = document.getElementById('name-coin')
const amount_coin = document.getElementById('amount-coin')



add_btn.addEventListener('click', function(){
    console.log('here')
    if (name_coin.value == "" || amount_coin.value == ""){
        return;
    }
    window.electron.requestAddCoin(name_coin.value,amount_coin.value);

})