const fs = require('fs');
const pino = require("pino");
const path = require('path');
const axios = require('axios');
const { exec } = require("child_process");
const { default: makeWASocket, useMultiFileAuthState, logger, delay, makeCacheableSignalKeyStore, jidDecode, getContentType, downloadContentFromMessage, makeInMemoryStore, fetchLatestBaileysVersion, DisconnectReason } = require("ovl_wa_baileys");
const config = require("./set");
const session = config.SESSION_ID || "";
let evt = require(__dirname + "/lib/ovlcmd");
const FileType = require('file-type')
const prefixe = config.PREFIXE;
const { Antilink, Antilink_warnings } = require("./DataBase/antilink");
const { Antitag, Antitag_warnings } = require("./DataBase/antitag");
const { Antibot, AntibotWarnings } = require("./DataBase/antibot");
const { Bans } = require("./DataBase/ban");
const { GroupSettings } = require("./DataBase/events");
const { levels, calculateLevel } = require('./DataBase/levels');
const { Ranks } = require('./DataBase/rank');
const { Sudo } = require('./DataBase/sudo');
const { getMessage, addMessage } = require('./lib/store');
const { WA_CONF } = require('./DataBase/wa_conf');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;



let dernierPingRecu = Date.now();

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OVL-Bot Web Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #121212;
            font-family: Arial, sans-serif;
            color: #ffffff;
            overflow: hidden;
        }
        .content {
            text-align: center;
            padding: 30px;
            background-color: #1e1e1e;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .content:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(255, 255, 255, 0.15);
        }
        h1 {
            font-size: 2em;
            color: #f0f0f0;
            margin-bottom: 15px;
            letter-spacing: 1px;
        }
        p {
            font-size: 1.1em;
            color: #d3d3d3;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>Bienvenue sur OVL-MD</h1>
        <p>Votre assistant WhatsApp</p>
    </div>
</body>
</html>`);
});

app.get('/ping', (req, res) => {
    dernierPingRecu = Date.now();
    res.send('OVL-MD est en ligne');
});

app.listen(port, () => {
    console.log("Listening on port: " + port);
    setupAutoPing(`http://localhost:${port}/ping`);
    checkHealth();
});

function setupAutoPing(url) {
    setInterval(async () => {
        try {
            const res = await axios.get(url);
            console.log(`Ping réussi : ${res.data}`);
        } catch (err) {
            console.error('Erreur lors du ping', err.message);
        }
    }, 30000);
}

function checkHealth() {
    setInterval(() => {
        if (Date.now() - dernierPingRecu > 120000) {
            console.error('Le ping est inactif, redémarrage...');
            process.exit(1);
        }
    }, 60000);
}
