const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require("ovl_wa_baileys");
const FileType = require('file-type');

async function dl_save_media_ms(ovl, message, filename = '', attachExtension = true, directory = './downloads') {
    try {
        const quoted = message.msg || message;
        const mime = quoted.mimetype || '';
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];

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

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
        const filePath = path.resolve(directory, trueFileName);

        await fs.promises.writeFile(filePath, buffer);

        return filePath;
    } catch (error) {
        console.error('Erreur lors du téléchargement et de la sauvegarde du fichier:', error);
        throw error;
    }
}

async function recup_msg({ovl, expediteur, salon, limiteTemps = 0, condition = () => true } = {}) {
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
}

module.exports = { dl_save_media_ms, recup_msg };
