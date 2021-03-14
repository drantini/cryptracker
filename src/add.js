const add_btn = document.getElementById('add-coin-btn')
const name_coin = document.getElementById('name-coin')
const amount_coin = document.getElementById('amount-coin')

const electron = require("electron");
const remote = electron.remote;
const ipc = electron.ipcRenderer;

add_btn.addEventListener('click', function(){
    if (name_coin.value == "" || amount_coin.value == ""){
        return;
    }
    var name_of_coin = name_coin.value.toString();
    ipc.send("new-coin", name_of_coin);
    var window = remote.getCurrentWindow();
    window.close();

})