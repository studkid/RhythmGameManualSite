# Archipelago Rhythm Game "Manual" Web Tracker
A web app built to allow for playing various (arcade) rhythm game with [Archipelago](https://archipelago.gg/).  The goal of this project is primarily to create app that can be used crossplatform, most notably on mobile, to make playing these types of games in ap more accessible without needing to lug a laptop around to the arcade.

# How to Use
1. Grab your desired apworld from the [releases page](https://github.com/studkid/RhythmGameManualSite/releases) and generate a game.
2. Open index.html (or use the current deployment [here](https://studkid.github.io/RhythmGameManualSite/)) and log in with your credentials.  Make sure to select the correct game from the drop down.
3. Upon connection, you should be presented with a simple text client and a full list if songs that were selected to shuffled.

Logic works similarly to most other rhythm game ap implementations (notably ones based off of Muse Dash).
If you sort the table by song name, version or category by clicking the respective table header.

# Currently Supported Games
- Chunithm (up to X-Verse-X)
- Maimai DX (up to CiRCLE PLUS)

# FAQ
## Can I still use the ap manual client for these worlds?
No.  While these worlds effectively work like a standard manual, they are not specifically build for use with the client.  Main reason for this is I find manual to be a bit too limiting for my use case, nor do I really like working with it's hooks.
Additionally with lots of rhythm game songs not being localized to english, currently the ap client doesn't have any support for japanense characters, so the majority of locations in the list will be entirely unreadable.

## Can you add support for X game?
I am open to adding support for more games down the line, if you have suggestions, feel free to post the game and preferably, a link to a data source with all song information, in the issue tracker or reach out directly to me on discord at @studkid.

## Do I need access to any specific version/regional release of the game?
No, you can toggle which region your local cabinent is on and add game versions you do not have access to into the `exclude_songs` list (may change in the future to be it's own setting).

## How often will these be updated?
I'm going to try to update them once a month or so.  May look into seeing if I can automate this process in the future though.

## HELP It's expecting me to play a song that is not accessible on my cabinet!!
Well, it is a manual so you can always just say you did click the button.  Nobody has to know.
...Also if this happens, please open an issue for it or alert me on discord at @studkid.

# Libraries
- [Archipelago.js](https://github.com/ThePhar/archipelago.js)

# Data Sources
- [Zetaraku's Arcade Songs Datasources](https://github.com/zetaraku/arcade-songs)
