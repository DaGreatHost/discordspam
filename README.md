# Discord Anti-Spam Bot

Isang simple pero mabisang Discord bot na nagpoprotekta sa server laban sa mga spammer at hindi awtorisadong links.

## Mga Feature

- Awtomatikong nagde-detect at nagde-delete ng mga mensahe na naglalaman ng links
- May whitelist system para sa mga awtorisadong links
- Nagpapadala ng notification sa user kung bakit na-delete ang kanilang mensahe
- Madaling i-customize ang whitelist at detection settings

## Mga Whitelist Links
Ang mga sumusunod na links ay hindi ide-delete ng bot:
- https://tgreward.shop/pinaysecret.php
- https://t.me/VlPcontentbot?startapp=Product

## Pag-setup

### Mga Kinakailangan
- Node.js (Latest LTS version)
- NPM (kasama na sa Node.js)
- Discord account na may admin access sa server

### Pag-install
1. I-clone ang repository:
```
git clone https://github.com/DaGreatHost/discordspam.git
cd discord-anti-spam-bot
```

2. I-install ang mga dependencies:
```
npm install
```

3. Gumawa ng `.env` file sa root directory at i-add ang iyong Discord bot token:
```
DISCORD_TOKEN=your_bot_token_here
```

4. I-start ang bot:
```
npm start
```

## Paggawa ng Discord Bot

1. Pumunta sa [Discord Developer Portal](https://github.com/DaGreatHost/discordspam)
2. Gumawa ng bagong application
3. Pumunta sa "Bot" tab at gumawa ng bot
4. I-copy ang token at ilagay sa `.env` file
5. I-enable ang "MESSAGE CONTENT INTENT" sa Bot settings
6. Pumunta sa OAuth2 > URL Generator, piliin ang "bot" scope at ang mga permisyon: "Read Messages/View Channels", "Send Messages", "Manage Messages"
7. Gamitin ang generated URL para i-invite ang bot sa iyong server

## Pag-customize
Para baguhin ang whitelist o idagdag ang ibang security features, i-edit ang `index.js` file.

## License
ISC
