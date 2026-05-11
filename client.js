import {
    Client,
    itemsHandlingFlags,
} from "./scripts/archipelago.min.js";

const client = new Client();

const hostname = sessionStorage.getItem("host") + ":" + sessionStorage.getItem("port");
const slot = sessionStorage.getItem("slot");
const game = sessionStorage.getItem("game");

let slotData = null;
let songEntries = {};
let locationTable = null;
let curSheetCount = 0;
let songs = [];
let goalButton = null;
let songData = null
let lastSort = 0;

const connectionOptions = {
    items: itemsHandlingFlags.all,
    password: sessionStorage.getItem("password"),
    slotData: true,
    tags: ["AP"],
    uuid: Date.now(),
    version: {
        major: 0,
        minor: 6,
        build: 7,
    }
}

document.getElementById("sortName").onclick = function() {sortLocTable(0)};
document.getElementById("sortVer").onclick = function() {sortLocTable(1)};
document.getElementById("sortCat").onclick = function() {sortLocTable(2)};

getSongData(game);

client.messages.on("message", (content) => {
    console.log(content);
    const logBox = document.getElementById("log");
    logBox.textContent = `${logBox.textContent}\n${content}`;
    logBox.scrollTop = logBox.scrollHeight;
});

client.socket.on("connected", async (content) => {
    slotData = await client.players.self.fetchSlotData();

    locationTable = client.package.findPackage(game).locationTable;

    document.getElementById("tracker").innerText = `${curSheetCount} / ${slotData.sheetWinCount} ${slotData.sheetName} to Goal.`;
    goalButton = document.getElementById("goal");
    goalButton.onclick = function(){goalGame()};
    goalButton.innerText = `Goal: ${slotData.victoryLocation}`;
    if(songData != null) {
        document.getElementById("goalVer").innerText = songData[slotData.victoryLocation].version;
        document.getElementById("goalCat").innerText = songData[slotData.victoryLocation].category;
        document.getElementById("goalDiff").innerText = getDiffString(songData[slotData.victoryLocation].difficulties);
    }
    if(curSheetCount >= slotData.sheetWinCount) {
        console.log("Goal Reached!");
        goalButton.disabled = false;
    }

    const missingLoc = client.room.missingLocations;
    const locations = document.getElementById("locations")
    slotData.finalSongIDs.forEach((song) => {
        if(missingLoc.includes(locationTable[`${song}-0`]) && missingLoc.includes(locationTable[`${song}-1`])) {
            locations.appendChild(createSongEntry(song));
        }
    });

    sortLocTable(0);
});

client.items.on("itemsReceived", (content) => {
    recieveItems(content);
});

function recieveItems(items) {
    items.forEach((item) => {
        console.log(`Receiving: ${item.name} ${item.flags}`)

        if(item.name == "Map Progress" || item.name == "Maimile" || item.name == "Reverse Point") {
            curSheetCount++;
            if(slotData != null) {
                document.getElementById("tracker").innerHTML = `${curSheetCount} / ${slotData.sheetWinCount} ${slotData.sheetName} to Goal.`
                if(curSheetCount >= slotData.sheetWinCount) {
                    goalButton.disabled = false;
                }
            }
            return;
        }

        const button = songEntries[item.name];
        songs.push(item.name);
        if(button != null) {
            button.getElementsByTagName("Button")[0].disabled = false;
        }

        sortLocTable(lastSort);
    });
}

function createSongEntry(song) {
    const tr = document.createElement("tr");
    const button = document.createElement("button");
    const buttontd = document.createElement("td");
    const version = document.createElement("p");
    const category = document.createElement("p");
    const difficulties = document.createElement("p");
    const versiontd = document.createElement("td");
    const categorytd = document.createElement("td");
    const difficultiestd = document.createElement("td");

    buttontd.id = "locEntry";
    versiontd.id = "locEntry";
    categorytd.id = "locEntry";
    difficultiestd.id = "locEntry";

    button.innerText = song;
    button.disabled = !songs.includes(song);
    button.onclick = function(){sendLocation(song)};
    buttontd.appendChild(button);
    tr.appendChild(buttontd);

    if(songData != null) {
        version.innerText = songData[song].version;
        versiontd.appendChild(version);
        category.innerText = songData[song].category;
        categorytd.appendChild(category);
        difficulties.innerText = getDiffString(songData[song].difficulties);
        difficultiestd.appendChild(difficulties);
    }

    tr.appendChild(versiontd);
    tr.appendChild(categorytd);
    tr.appendChild(difficultiestd);
    songEntries[song] = tr;
    return tr;
}

async function sendLocation(name) {
    if(locationTable == null) return;

    const locId = locationTable[`${name}-0`]
    console.log(`Sending ${name}: ${locId}`);
    await client.check(locId, locId + 1);
    songEntries[name].remove();
}

function goalGame() {
    client.goal();
}

function getSongData(game) {
    let json

    if(game == "Chunithm") {
        json = './data/chuniSongData.json'
    }
    else if(game == "Maimai DX") {
        json = './data/maiSongData.json'
    }
    else if(game == "Wacca") {
        json = './data/waccaSongData.json'
    }

    fetch(json)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  
    })
    .then(data => songData = data)  
    .catch(error => console.error('Failed to fetch data:', error));
}

function getDiffString(diffArray) {
    let diffString = "";

    diffArray.forEach((diff) => {
        let modifiedDiff = "";

        if(diff == null) {
            return;
        }
        else if(diff % 1 >= .5) {
            modifiedDiff = `${Math.floor(diff)}+`;
        }
        else {
            modifiedDiff = Math.floor(diff);
        }

        diffString = `${diffString}${modifiedDiff}, `
    });

    return diffString.substring(0, diffString.length - 2);
}

function sortLocTable(sortBy) {
    var table = document.getElementById("locations");
    var sorting = true;
    var x, y, i, xDisabled, yDisabled

    while(sorting) {
        sorting = false;
        var rows = table.rows;

        for(i = 1; i < (rows.length - 1); i++) {
            var shouldSwitch = false;
            
            if(rows[i].id == "goalEntry") {
                continue;
            }

            x = rows[i].getElementsByTagName("TD")[sortBy];
            xDisabled = rows[i].getElementsByTagName("TD")[0].getElementsByTagName("Button")[0].disabled;
            y = rows[i + 1].getElementsByTagName("TD")[sortBy];
            yDisabled = rows[i + 1].getElementsByTagName("TD")[0].getElementsByTagName("Button")[0].disabled;

            if(xDisabled && !yDisabled) {
                shouldSwitch = true;
                break;
            }

            if(yDisabled && !xDisabled) {
                continue;
            }

            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }

        if(shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            sorting = true;
        } 
    }

    lastSort = sortBy;
}

const chat = document.getElementById("chat");
chat.addEventListener('keydown', (event) => {
    if(event.key == "Enter") {
        client.messages.say(event.currentTarget.value);
        event.currentTarget.value = "";
    }
});

await client.login(hostname, slot, game, connectionOptions)
    .then((value) => slotData = value)
    .catch(console.error);
