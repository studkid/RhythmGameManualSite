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
let mapProgress = 0;
let songs = [];
let goalButton = null;
let songData = null

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

getSongData();

client.messages.on("message", (content) => {
    console.log(content);
    const logBox = document.getElementById("log");
    logBox.textContent = `${logBox.textContent}\n${content}`;
});

client.socket.on("connected", async (content) => {
    slotData = await client.players.self.fetchSlotData();

    locationTable = client.package.findPackage(game).locationTable;

    document.getElementById("tracker").innerText = `${mapProgress} / ${slotData.sheetWinCount} Map Progress to Goal.`;
    goalButton = document.getElementById("goal");
    goalButton.onclick = function(){goalGame()};
    goalButton.innerText = `Goal: ${slotData.victoryLocation}`;
    if(songData != null) {
        document.getElementById("goalVer").innerText = songData[slotData.victoryLocation].version;
        document.getElementById("goalCat").innerText = songData[slotData.victoryLocation].category;
        document.getElementById("goalDiff").innerText = getDiffString(songData[slotData.victoryLocation].difficulties);
    }
    if(mapProgress >= slotData.sheetWinCount) {
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
});

client.items.on("itemsReceived", (content) => {
    recieveItems(content);
});

function recieveItems(items) {
    items.forEach((item) => {
        console.log(`Receiving: ${item.name} ${item.flags}`)

        if(item.name == "Map Progress") {
            mapProgress++;
            if(slotData != null) {
                document.getElementById("tracker").innerHTML = `${mapProgress} / ${slotData.sheetWinCount} Map Progress to Goal.`
                if(mapProgress >= slotData.sheetWinCount) {
                    goalButton.disabled = false;
                }
            }
            return;
        }

        const button = songEntries[item.name];
        songs.push(item.name);
        if(button != null) {
            button.disabled = false;
        }
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

    buttontd.id = "locTable";
    versiontd.id = "locTable";
    categorytd.id = "locTable";
    difficultiestd.id = "locTable";

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

function getSongData() {
    fetch('./data/chuniSongData.json')
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
        else if(diff % 1 > .5) {
            modifiedDiff = `${Math.floor(diff)}+`;
        }
        else {
            modifiedDiff = Math.floor(diff);
        }

        diffString = `${diffString}${modifiedDiff}, `
    });

    return diffString.substring(0, diffString.length - 2);
}

await client.login(hostname, slot, game, connectionOptions)
    .then((value) => slotData = value)
    .catch(console.error);
