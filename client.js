import {
    Client,
    itemsHandlingFlags,
} from "./scripts/archipelago.min.js";

const client = new Client();

const hostname = sessionStorage.getItem("host") + ":" + sessionStorage.getItem("port");
const slot = sessionStorage.getItem("slot");
const game = sessionStorage.getItem("game");

let slotData = null;
let buttons = {};
let locationTable = null;
let mapProgress = 0;
let songs = [];
let goalButton = null;

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

client.messages.on("message", (content) => {
    console.log(content);
    document.getElementById("log").innerHTML = content
});

client.socket.on("connected", async (content) => {
    slotData = await client.players.self.fetchSlotData();

    locationTable = client.package.findPackage(game).locationTable;

    document.getElementById("tracker").innerHTML = `${mapProgress} / ${slotData.sheetWinCount} Map Progress to Goal.`;
    goalButton = document.getElementById("goal");
    goalButton.onclick = function(){goalGame()};
    goalButton.innerText = `Goal: ${slotData.victoryLocation}`;
    if(mapProgress >= slotData.sheetWinCount) {
        console.log("Goal Reached!");
        goalButton.disabled = false;
    }

    const missingLoc = client.room.missingLocations;
    const locations = document.getElementById("locations")
    slotData.finalSongIDs.forEach((song) => {
        if(missingLoc.includes(locationTable[`${song}-0`]) && missingLoc.includes(locationTable[`${song}-1`])) {
            const button = document.createElement("button");
            button.innerText = song;
            button.disabled = !songs.includes(song);
            button.onclick = function(){sendLocation(song)};
            buttons[song] = button;
            locations.appendChild(button)
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

        const button = buttons[item.name];
        songs.push(item.name);
        if(button != null) {
            button.disabled = false;
        }
    });
}

async function sendLocation(name) {
    if(locationTable == null) return;

    const locId = locationTable[`${name}-0`]
    console.log(`Sending ${name}: ${locId}`);
    await client.check(locId, locId + 1);
    buttons[name].remove();
}

function goalGame() {
    client.goal();
}

await client.login(hostname, slot, game, connectionOptions)
    .then((value) => slotData = value)
    .catch(console.error);
