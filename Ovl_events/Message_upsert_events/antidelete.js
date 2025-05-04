const { WA_CONF } = require('../../DataBase/wa_conf');

async function antidelete(ovl, ms, auteur_Message, mtype, getMessage) {
    const settings = await WA_CONF.findOne({ where: { id: '1' } });
    if (!settings) return;

    try {
        if (
            mtype === 'protocolMessage' &&
            ['pm', 'gc', 'status', 'all', 'pm/gc', 'pm/status', 'gc/status'].includes(settings.antidelete)
        ) {
            const deletedMsgKey = ms.message.protocolMessage;
            const deletedMsg = getMessage(deletedMsgKey.key.id);

            if (!deletedMsg) return;

            const jid = deletedMsg.key.remoteJid;
            const isGroup = jid?.endsWith("@g.us");
            const sender = isGroup
                ? (deletedMsg.key.participant || deletedMsg.participant)
                : jid;
            const deletionTime = new Date().toISOString().substr(11, 8);

            if (!deletedMsg.key.fromMe) {
                const provenance = isGroup
                    ? `👥 Groupe : ${(await ovl.groupMetadata(jid)).subject}`
                    : `📩 Chat : @${jid.split('@')[0]}`;

                const header = `
✨ OVL-MD ANTI-DELETE MSG✨
👤 Envoyé par : @${sender.split('@')[0]}
❌ Supprimé par : @${auteur_Message.split('@')[0]}
⏰ Heure de suppression : ${deletionTime}
${provenance}
                `;

                const shouldSend = (
                    (settings.antidelete === 'gc' && jid.endsWith('@g.us')) ||
                    (settings.antidelete === 'pm' && jid.endsWith('@s.whatsapp.net')) ||
                    (settings.antidelete === 'status' && jid.endsWith('status@broadcast')) ||
                    (settings.antidelete === 'all') ||
                    (settings.antidelete === 'pm/gc' && (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net'))) ||
                    (settings.antidelete === 'pm/status' && (jid.endsWith('status@broadcast') || jid.endsWith('@s.whatsapp.net'))) ||
                    (settings.antidelete === 'gc/status' && (jid.endsWith('@g.us') || jid.endsWith('status@broadcast')))
                );

                if (shouldSend) {
                    await ovl.sendMessage(ovl.user.id, {
                        text: header.trim(),
                        mentions: [sender, auteur_Message]
                    }, { quoted: deletedMsg });

                    await ovl.sendMessage(ovl.user.id, {
                        forward: deletedMsg
                    }, { quoted: deletedMsg });
                }
            }
        }
    } catch (err) {
        console.error('❌ Une erreur est survenue dans antidelete :', err);
    }
}

module.exports = antidelete;
