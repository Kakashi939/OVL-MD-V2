const fs = require('fs');
const path = require('path');
const pino = require("pino");
const axios = require('axios');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    Browsers
} = require("@whiskeysockets/baileys");
const config = require("./set");
const sessId = config.SESSION_ID || "";
const app = express();
const port = process.env.PORT || 3000;
const {
    message_upsert,
    group_participants_update,
    connection_update,
    dl_save_media_ms,
    recup_msg
} = require('./Ovl_events');

const dirAuth = path.join(__dirname, 'auth');
const dirConn = path.join(__dirname, 'connect');

async function recupSessPrincipale(sess) {
    try {
        if (sess.startsWith("Ovl-MD_") && sess.endsWith("_SESSION-ID")) {
            const id = sess.slice(7, -11);
            const res = await axios.get('https://pastebin.com/raw/' + id);
            const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
            if (!fs.existsSync(dirAuth)) fs.mkdirSync(dirAuth, { recursive: true });
            const fPath = path.join(dirAuth, 'creds.json');
            fs.writeFileSync(fPath, data, 'utf8');
        }
    } catch (e) {
        console.log("Session invalide: " + (e.message || e));
    }
}

function chargerSessSecondaires() {
    if (!fs.existsSync(dirConn)) return [];
    return fs.readdirSync(dirConn).filter(d => {
        const p = path.join(dirConn, d);
        return fs.lstatSync(p).isDirectory() && d.startsWith("session_connect_");
    });
}

async function demarrerSession(dossier) {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(dossier);

    const ovl = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Safari"),
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        }
    });

    ovl.ev.on("messages.upsert", async (m) => { message_upsert(m, ovl); });
    ovl.ev.on("group-participants.update", async (data) => { group_participants_update(data, ovl); });
    ovl.ev.on("connection.update", async (con) => {
        connection_update(con, ovl, () => demarrerSession(dossier));
    });
    ovl.ev.on("creds.update", saveCreds);

    ovl.dl_save_media_ms = (msg, filename = '', attachExt = true, dir = './downloads') =>
        dl_save_media_ms(ovl, msg, filename, attachExt, dir);

    ovl.recup_msg = (params = {}) =>
        recup_msg({ ovl, ...params });

    console.log(`Session démarrée : ${path.basename(dossier)}`);
    return ovl;
}

async function demarrerTout() {
    await recupSessPrincipale(sessId);

    const principale = await demarrerSession(dirAuth);

    const secondaires = [];
    const dossiers = chargerSessSecondaires();
    for (const d of dossiers) {
        const p = path.join(dirConn, d);
        const c = await demarrerSession(p);
        secondaires.push(c);
    }

    console.log(`Sessions secondaires lancées : ${dossiers.length}`);
}

demarrerTout().catch(console.error);

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
