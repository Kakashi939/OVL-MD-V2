const fs = require('fs');
const path = require('path');
const pino = require("pino");
const axios = require('axios');
const express = require('express');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    logger,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    Browsers,
    downloadContentFromMessage,
    DisconnectReason
} = require("ovl_wa_baileys");

const config = require("./set");
const session = config.SESSION_ID || "";
const { message_upsert, group_participants_update, connection_update, dl_save_media_ms, recup_msg } = require('./Ovl_events');

const app = express();
const port = process.env.PORT || 3000;

async function ovlAuth(session) {
    try {
        if (session.startsWith("Ovl-MD_") && session.endsWith("_SESSION-ID")) {
            const sessionId = session.slice(7, -11);
            const response = await axios.get('https://pastebin.com/raw/' + sessionId);
            const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            const filePath = path.join(__dirname, 'auth', 'creds.json');
            fs.writeFileSync(filePath, data, 'utf8');
        }
    } catch (e) {
        console.log("Session invalide: " + (e.message || e));
    }
}
ovlAuth(session);

async function main() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    try {
        const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

        const ovl = makeWASocket({
            printQRInTerminal: true,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Safari"),
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
            },
            getMessage: async (key) => {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message;
            }
        });

        store.bind(ovl.ev);

        // Liaison des événements
        ovl.ev.on("messages.upsert", async (m) => { message_upsert(m, ovl); });
        ovl.ev.on('group-participants.update', async (data) => { group_participants_update(data, ovl); });
        ovl.ev.on("connection.update", async (con) => { connection_update(con, ovl, main); });
        ovl.ev.on("creds.update", saveCreds);

        // Ajout des fonctions au bot
        ovl.dl_save_media_ms = async (msg, filename = '', attachExt = true, dir = './downloads') =>
            dl_save_media_ms(ovl, msg, filename, attachExt, dir);

        ovl.recup_msg = async (params = {}) =>
            recup_msg({ ovl, ...params });

    } catch (error) {
        console.error("Erreur principale:", error);
    }
}
main();

// Serveur Express
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
        body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; font-family: Arial, sans-serif; color: #ffffff; overflow: hidden; }
        .content { text-align: center; padding: 30px; background-color: #1e1e1e; border-radius: 12px; box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .content:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(255, 255, 255, 0.15); }
        h1 { font-size: 2em; color: #f0f0f0; margin-bottom: 15px; letter-spacing: 1px; }
        p { font-size: 1.1em; color: #d3d3d3; line-height: 1.5; }
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
