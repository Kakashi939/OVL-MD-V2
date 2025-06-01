const fs = require('fs');
const path = require('path');
const pino = require("pino");
const axios = require('axios');
const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const config = require("./set");
const { message_upsert, group_participants_update, connection_update, dl_save_media_ms, recup_msg } = require('./Ovl_events');
const { getSession, getAllSessions } = require("./DataBase/connect");

async function Start_ovl_md_v2() {
  const sess = config.SESSION_ID || "";
  if (sess.startsWith("Ovl-MD_") && sess.endsWith("_SESSION-ID")) {
    const sessionId = sess.slice(7, -11);
    const dirPrincipale = path.join(__dirname, "auth", "principale");
    const filePath = path.join(dirPrincipale, "creds.json");

    if (!fs.existsSync(filePath)) {
      try {
        const response = await axios.get('https://pastebin.com/raw/' + sessionId);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        fs.mkdirSync(dirPrincipale, { recursive: true });
        fs.writeFileSync(filePath, data, 'utf8');
      } catch (e) {
        console.log("❌ Session principale invalide :", e.message);
        return;
      }
    }
  }

  const allSessionDirs = [];

  const principaleDir = path.join(__dirname, "auth", "principale");
  if (fs.existsSync(principaleDir) && fs.existsSync(path.join(principaleDir, "creds.json"))) {
    allSessionDirs.push(principaleDir);
  }

  const sessions = await getAllSessions();
  for (const id of sessions) {
    const sessionDir = path.join(__dirname, "auth", id);
    if (!fs.existsSync(sessionDir)) {
      const creds = await getSession(id);
      if (!creds) continue;
      fs.mkdirSync(sessionDir, { recursive: true });
      fs.writeFileSync(path.join(sessionDir, "creds.json"), JSON.stringify(creds, null, 2), "utf8");
    }
    allSessionDirs.push(sessionDir);
  }

  for (const sessionDir of allSessionDirs) {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

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
    ovl.ev.on("connection.update", async (con) => { connection_update(con, ovl, () => Start_ovl_md_v2()); });
    ovl.ev.on("creds.update", saveCreds);

    ovl.dl_save_media_ms = (msg, filename = '', attachExt = true, dir = './downloads') =>
      dl_save_media_ms(ovl, msg, filename, attachExt, dir);

    ovl.recup_msg = (params = {}) =>
      recup_msg({ ovl, ...params });
  }
}

Start_ovl_md_v2().catch(console.error);

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let dernierPingRecu = Date.now();

app.get('/', (req, res) => {
  dernierPingRecu = Date.now();
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OVL-Bot Web Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #121212; font-family: Arial, sans-serif; color: #fff; overflow: hidden; }
    .content { text-align: center; padding: 30px; background-color: #1e1e1e; border-radius: 12px; box-shadow: 0 8px 20px rgba(255,255,255,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .content:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(255,255,255,0.15); }
    h1 { font-size: 2em; color: #f0f0f0; margin-bottom: 15px; letter-spacing: 1px; }
    p { font-size: 1.1em; color: #d3d3d3; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="content">
    <h1>Bienvenue sur OVL-MD-V2</h1>
    <p>Votre assistant WhatsApp</p>
  </div>
</body>
</html>`);
});

app.listen(port, () => {
  console.log("Listening on port: " + port);
  setupAutoPing(`http://localhost:${port}/`);
});

function setupAutoPing(url) {
  setInterval(async () => {
    try {
      const res = await axios.get(url);
      if(res.data) {
        console.log(`Ping: OVL-MD-V2✅`);
      }
    } catch (err) {
      console.error('Erreur lors du ping', err.message);
    }
  }, 30000);
}
