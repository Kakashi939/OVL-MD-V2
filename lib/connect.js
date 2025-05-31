const fs = require('fs');
const path = require('path');
const { delay, DisconnectReason, Browsers, makeCacheableSignalKeyStore, useMultiFileAuthState, default: makeWASocket } = require("@whiskeysockets/baileys");
const pino = require("pino");
const NodeCache = require('node-cache');
const msgRetryCounterCache = new NodeCache();


async function conn(numero, ovl, ms_org, ms, disconnect = false) {
  const tmpSessionPath = path.join(__dirname, '../session');
  const finalSessionPath = path.join(__dirname, `../connect/session_connect_${numero}`);

  if (!disconnect && fs.existsSync(finalSessionPath)) {
    return ovl.sendMessage(ms_org, { text: `⚠️ Ce numéro est déjà connecté.` }, { quoted: ms });
  }

  if (fs.existsSync(tmpSessionPath)) {
    fs.rmSync(tmpSessionPath, { recursive: true, force: true });
  }
  fs.mkdirSync(tmpSessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(tmpSessionPath);

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
    },
    logger: pino({ level: 'fatal' }),
    browser: Browsers.macOS("Safari"),
    markOnlineOnConnect: true,
    msgRetryCounterCache
  });

  sock.ev.on('creds.update', saveCreds);

  const isFirstLogin = !sock.authState.creds.registered;

  if (isFirstLogin && !disconnect) {
    await delay(1500);
    try {
      const code = await sock.requestPairingCode(numero);

      const sendCode = await ovl.sendMessage(ms_org, {
        text: `${code}`
      }, { quoted: ms });

      await ovl.sendMessage(ms_org, {
        text: "🔗 Voici votre code de parrainage. Suivez les instructions pour terminer la connexion."
      }, { quoted: sendCode });

    } catch (e) {
      await ovl.sendMessage(ms_org, { text: `❌ Erreur : ${e.message}` }, { quoted: ms });
      if (fs.existsSync(tmpSessionPath)) fs.rmSync(tmpSessionPath, { recursive: true, force: true });
      return;
    }
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      await delay(5000);
      try {
        fs.mkdirSync(finalSessionPath, { recursive: true });
        fs.copyFileSync(path.join(tmpSessionPath, 'creds.json'), path.join(finalSessionPath, 'creds.json'));

        await ovl.sendMessage(ms_org, {
          text: `✅ Connexion réussie !\nSession sauvegardée dans :\n*connect/session_connect_${numero}/creds.json*`
        }, { quoted: ms });

        sock.end();
        fs.rmSync(tmpSessionPath, { recursive: true, force: true });

      } catch (err) {
        await ovl.sendMessage(ms_org, { text: "❌ Erreur lors de la sauvegarde de session." }, { quoted: ms });
      }

    } else if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      reconnect(reason, numero, ovl, ms_org, ms);
    }
  });
}

function reconnect(reason, numero, ovl, ms_org, ms) {
  if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired].includes(reason)) {
    console.log("🔁 Reconnexion en cours...");
    conn(numero, ovl, ms_org, ms, true);
  } else {
    console.log(`❌ Déconnecté - Raison: ${reason}`);
    const tmpSessionPath = path.join(__dirname, '../session');
    if (fs.existsSync(tmpSessionPath)) fs.rmSync(tmpSessionPath, { recursive: true, force: true });
  }
}

module.exports = conn;
