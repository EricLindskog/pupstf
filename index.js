let leavers = [];
let rostered = [];
let rosteredNames = [];
let processedPages = 0;
let total_pages = null;
let roster_size = null;
let processedPlayers = 0;
function init() {
    init_transfers();
    init_roster();
}
function init_roster() {
    $.getJSON("http://api.etf2l.org/team/19821.json",function(data) {
        
        let roster = data.team.players;
        if(roster==null) return;
        roster_size = roster.length;
        for (let i=0; i<roster_size; i++) {
            let player = roster[i];
            
            $.getJSON(player.url, function(pData) {
                addRostered(player, pData.player.classes);
            });
        }
    });
}
function init_transfers() {
    $.getJSON("http://api.etf2l.org/team/19821/transfers.json",function(data) {
        
        let pages = data.page.total_pages;
        total_pages = pages;
        addTransfers(data);
        for (let i=2; i<=pages; i++) {
            $.getJSON("http://api.etf2l.org/team/19821/transfers/"+i+".json",function(data) {
                addTransfers(data);
            });
        }
    });
}
function addRostered(player, classList) {
    rosteredNames.push(player.name);
    rostered.push({name : player.name, role : player.role, classes : classList, id : player.id});
    playerProcessed();
}
function addTransfers(data) {
    let transfers = data.transfers;
    for (let i=0; i<transfers.length; i++) {
        let transfer = transfers[i];
        if (transfer.type=="left")
            leavers.push({name : transfer.who.name, left : transfer.time, id : transfer.who.id})
    }  
    pageProcessed();           
}
function pageProcessed(){
    processedPages++;
    if (processedPages>=total_pages) {
        createLeavers();
    }
}
function playerProcessed() {
    processedPlayers++;
    if (processedPlayers>=roster_size) {
        createRoster();
    }
}
function createRoster() {
    let table = document.getElementById("roster").getElementsByTagName('tbody')[0];
    while (rostered.length) {
        let player = rostered.pop();
        let row = table.insertRow(-1);
        let cell = row.insertCell(0);
        cell.innerHTML = player.name;
        cell = row.insertCell(1);
        cell.innerHTML = player.role;
        cell = row.insertCell(2);
        cell.innerHTML = player.classes.toString().replace(/,/g, ', ');
        row.onclick = function(){
            window.location = "http://www.etf2l.org/forum/user/"+player.id;
        }
    }
}
function createLeavers() {
    leavers.sort(function(a,b) {
        return a.left - b.left;
    })
    let unique = [];
    let table = document.getElementById("leavers").getElementsByTagName('tbody')[0];
    while (leavers.length) {
        let player = leavers.pop();
        if (!unique.includes(player.name) && !rosteredNames.includes(player.name)) {
            unique.push(player.name);
            let row = table.insertRow(-1);
            let cell = row.insertCell(0);
            cell.innerHTML = player.name;
            cell = row.insertCell(1);
            cell.innerHTML = new Date(player.left*1000).toDateString();
            row.onclick = function(){
                window.location = "http://www.etf2l.org/forum/user/"+player.id;
            }
        }
    }
}