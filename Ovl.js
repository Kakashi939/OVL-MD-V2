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


async function ovlAuth(session) {
    let sessionId;
    try {
        if (session.startsWith("Ovl-MD_") && session.endsWith("_SESSION-ID")) {
            sessionId = session.slice(7, -11);
        }
        const response = await axios.get('https://pastebin.com/raw/' + sessionId);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const filePath = path.join(__dirname, 'auth', 'creds.json');
            await fs.writeFileSync(filePath, data, 'utf8');
    } catch (e) {
        console.log("Session invalide: " + e.message || e);
    }
 }
ovlAuth(session);

async function main() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth'));
        try {
        const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store"
  })
});
         const ovl = makeWASocket({
            printQRInTerminal: true,
            logger: pino({ level: "silent" }),
            browser: [ "Ubuntu", "Chrome", "20.0.04" ],
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" }))
        },
            getMessage: async (key) => {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message;
           }
        });
store.bind(ovl.ev);
         //fin événement message 

         //group participants update
ovl.ev.on('group-participants.update', async (data) => {
    const parseID = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
        }
        return jid;
    };

    try {
        const groupInfo = await ovl.groupMetadata(data.id);
        const settings = await GroupSettings.findOne({ where: { id: data.id } });
        if (!settings) return;

        const { welcome, goodbye, antipromote, antidemote } = settings;

        for (const participant of data.participants) {
         let profilePic;
            try {
                profilePic = await ovl.profilePictureUrl(participant, 'image');
            } catch (err) {
             console.error(err);
                profilePic = 'https://files.catbox.moe/54ip7g.jpg';
            }

            const userMention = `@${participant.split("@")[0]}`;

            if (data.action === 'add' && welcome === 'oui') {
                const groupName = groupInfo.subject || "Groupe inconnu";
                const totalMembers = groupInfo.participants.length;
                const message = `*🎉Bienvenue ${userMention}🎉*\n*👥Groupe: ${groupName}*\n*🔆Membres: #${totalMembers}*\n*📃Description:* ${groupInfo.desc || "Aucune description"}`;

                await ovl.sendMessage(data.id, {
                    image: { url: profilePic },
                    caption: message,
                    mentions: [participant]
                });
            }

            if (data.action === 'remove' && goodbye === 'oui') {
                await ovl.sendMessage(data.id, { text: `👋Au revoir ${userMention}`, mentions: [participant] });
            }

            if (data.action === 'promote' && antipromote === 'oui') {
                await ovl.groupParticipantsUpdate(data.id, [participant], "demote");
                await ovl.sendMessage(data.id, {
                    text: `🚫Promotion non autorisée: ${userMention} a été rétrogradé.`,
                    mentions: [participant],
                });
            }

            if (data.action === 'demote' && antidemote === 'oui') {
                await ovl.groupParticipantsUpdate(data.id, [participant], "promote");
                await ovl.sendMessage(data.id, {
                    text: `🚫Rétrogradation non autorisée: ${userMention} a été promu à nouveau.`,
                    mentions: [participant],
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
});

         //Fin group participants update

         // Antidelete


// FIN ANTIDELETE        
         
ovl.ev.on("connection.update", async (con) => {
    const { connection, lastDisconnect } = con;

    if (connection === "connecting") {
        console.log("🌐 Connexion à WhatsApp en cours...");
    } else if (connection === 'open') {
        console.log("✅ Connexion établie ; Le bot est en ligne 🌐\n\n");
        
        console.log("Chargement des commandes...\n");
        const commandes = fs.readdirSync(path.join(__dirname, "commandes")).filter(fichier => path.extname(fichier).toLowerCase() === ".js");
        
        for (const fichier of commandes) {
            try {
                require(path.join(__dirname, "commandes", fichier));
                console.log(`${fichier} installé avec succès`);
                await  delay(300); // Pause de 300 ms
            } catch (e) {
                console.log(`Erreur lors du chargement de ${fichier} :    ${e}`);
            }
        }
        delay(700);
      let start_msg = `╭────《 OVL-MD 》─────⊷
⫸  *Préfixe*       : ${prefixe}
⫸  *Mode*          : ${config.MODE}
⫸  *Commandes*     : ${evt.cmd.length}

             𝙈𝙖𝙙𝙚 𝙗𝙮 Ainz`;
     if (ovl.user && ovl.user.id) {
        await ovl.sendMessage(ovl.user.id, { text: start_msg }); 
     }
    } else if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut) {
                    console.log('Connexion fermée: Déconnecté');
                } else {
                    console.log('Connexion fermée: Reconnexion en cours...');
                 main()
                }
    }
});

        // Gestion des mises à jour des identifiants
        ovl.ev.on("creds.update", saveCreds);

            //autre fonction de ovl
            ovl.dl_save_media_ms = async (message, filename = '', attachExtension = true, directory = './downloads') => {
    try {
        const quoted = message.msg || message;
        const mime = quoted.mimetype || '';
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        
        console.log(`Téléchargement du message de type: ${messageType}`);
        
        if (!mime) {
            throw new Error("Type MIME non spécifié ou non pris en charge.");
        }

        const stream = await downloadContentFromMessage(quoted, messageType);
        const bufferChunks = [];
        for await (const chunk of stream) {
            bufferChunks.push(chunk);
        }
        
        const buffer = Buffer.concat(bufferChunks);
        const type = await FileType.fromBuffer(buffer);
        if (!type) {
            throw new Error("Type de fichier non reconnu");
        }

        // Création du chemin du répertoire
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        
        const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
        const filePath = path.resolve(directory, trueFileName);

        // Écriture directe dans un fichier via un flux de création
        await fs.promises.writeFile(filePath, buffer);
        console.log(`Fichier sauvegardé à: ${filePath}`);
        
        return filePath;
    } catch (error) {
        console.error('Erreur lors du téléchargement et de la sauvegarde du fichier:', error);
        throw error;
    }
};
         ovl.recup_msg = async ({ expediteur, salon, limiteTemps = 0, condition = () => true } = {}) => {
    return new Promise((accepter, refuser) => {
        if (typeof expediteur !== 'string' || !expediteur) return refuser(new Error("L'expéditeur doit être une chaîne non vide."));
        if (typeof salon !== 'string' || !salon) return refuser(new Error("Le salon doit être une chaîne non vide."));
        if (limiteTemps && typeof limiteTemps !== 'number') return refuser(new Error("Le temps limite doit être un nombre."));
        if (typeof condition !== 'function') return refuser(new Error("Le paramètre condition doit être une fonction."));

        let chrono;

        const analyseur = ({ type, messages }) => {
            if (type !== "notify") return;

            for (const msg of messages) {
                const idSalon = msg.key.remoteJid;
                const idExpediteur = msg.key.fromMe
                    ? ovl.user.id.replace(/:.*@/g, '@')
                    : msg.key.participant
                        ? msg.key.participant.replace(/:.*@/g, '@')
                        : idSalon;

                if (idExpediteur === expediteur && idSalon === salon && condition(msg)) {
                    ovl.ev.off('messages.upsert', analyseur);
                    if (chrono) clearTimeout(chrono);
                    return accepter(msg);
                }
            }
        };

        ovl.ev.on('messages.upsert', analyseur);

        if (limiteTemps > 0) {
            chrono = setTimeout(() => {
                ovl.ev.off('messages.upsert', analyseur);
                refuser(new Error("Timeout"));
            }, limiteTemps);
        }
    });
};

            //fin autre fonction ovl
    } catch (error) {
        console.error("Erreur principale:", error);
    }
}

main();














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
