const { rankAndLevelUp, lecture_status, like_status, presence, dl_status, antivv, antidelete, antitag, antilink, antibot } = require('./Message_upsert_events');
const { Bans } = require("../DataBase/ban");
const { Sudo } = require('../DataBase/sudo');
const { getMessage, addMessage } = require('../lib/store');
const { jidDecode, getContentType } = require("ovl_wa_baileys");
let evt = require("../lib/ovlcmd");
const config = require("../set");
const prefixe = config.PREFIXE;

async message_upsert(m, ovl) => {
    if (m.type !== 'notify') return;

    const ms = m.messages?.[0];
    if (!ms?.message) return;
    addMessage(ms.key.id, ms);

    const decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const d = jidDecode(jid) || {};
            return (d.user && d.server && `${d.user}@${d.server}`) || jid;
        }
        return jid;
    };

    const mtype = getContentType(ms.message);
    const texte = {
        conversation: ms.message.conversation,
        imageMessage: ms.message.imageMessage?.caption,
        videoMessage: ms.message.videoMessage?.caption,
        extendedTextMessage: ms.message.extendedTextMessage?.text,
        buttonsResponseMessage: ms.message.buttonsResponseMessage?.selectedButtonId,
        listResponseMessage: ms.message.listResponseMessage?.singleSelectReply?.selectedRowId,
        messageContextInfo: ms.message.buttonsResponseMessage?.selectedButtonId ||
            ms.message.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text
    }[mtype] || "";

    const ms_org = ms.key.remoteJid;
    const id_Bot = decodeJid(ovl.user.id);
    const id_Bot_N = id_Bot.split('@')[0];

    const isGroup = ms_org.endsWith("@g.us");
    const groupMeta = isGroup ? await ovl.groupMetadata(ms_org) : {};
    const groupName = groupMeta.subject || "";
    const participants = isGroup ? groupMeta.participants : [];
    const admins = participants.filter((p) => p.admin).map((p) => p.id);
    const isBotAdmin = isGroup && admins.includes(id_Bot);

    const msgReply = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const replyAuthor = decodeJid(ms.message.extendedTextMessage?.contextInfo?.participant);
    const mentioned = ms.message.extendedTextMessage?.contextInfo?.mentionedJid;

    const sender = isGroup ? ms.key.participant : decodeJid(ms.key.fromMe ? id_Bot : ms.key.remoteJid);
    const senderName = ms.pushName;

    const arg = texte.trim().split(/ +/).slice(1);
    const isCmd = texte.startsWith(prefixe);
    const cmdName = isCmd ? texte.slice(prefixe.length).trim().split(/ +/)[0].toLowerCase() : "";

    const Ainz = '22651463203';
    const Ainzbot = '22605463559';
    const devNumbers = [Ainz, Ainzbot];

    async function getSudoUsers() {
        try {
            const sudos = await Sudo.findAll({ attributes: ['id'] });
            return sudos.map(e => e.id.replace(/[^0-9]/g, ""));
        } catch (err) {
            console.error("Erreur récupération sudo:", err);
            return [];
        }
    }

    const sudoUsers = await getSudoUsers();
    const premiumUsers = [Ainz, Ainzbot, id_Bot_N, config.NUMERO_OWNER, ...sudoUsers]
        .map(n => `${n.replace(/[^0-9]/g, "")}@s.whatsapp.net`);
    const isPremium = premiumUsers.includes(sender);

    const devJids = devNumbers.map(n => `${n.replace(/[^0-9]/g, "")}@s.whatsapp.net`);
    const isDev = devJids.includes(sender);

    const isAdmin = isGroup && (admins.includes(sender) || isPremium);

    const reply = (msg) => ovl.sendMessage(ms_org, { text: msg }, { quoted: ms });

    const cmd_options = {
        verif_Groupe: isGroup,
        mbre_membre: participants,
        membre_Groupe: sender,
        verif_Admin: isAdmin,
        infos_Groupe: groupMeta,
        nom_Groupe: groupName,
        auteur_Message: sender,
        nom_Auteur_Message: senderName,
        id_Bot,
        prenium_id: isPremium,
        dev_id: isDev,
        dev_num: devJids,
        id_Bot_N,
        verif_Ovl_Admin: isBotAdmin,
        prefixe,
        arg,
        repondre: reply,
        groupe_Admin: () => admins,
        msg_Repondu: msgReply,
        auteur_Msg_Repondu: replyAuthor,
        ms,
        ms_org,
    };

    // Événements
    rankAndLevelUp(ovl, ms_org, texte, sender, senderName, config);
    presence(ovl, ms_org);
    lecture_status(ovl, ms, ms_org);
    like_status(ovl, ms, ms_org);
    dl_status(ovl, ms_org, ms);
    antivv(ovl, ms);
    antidelete(ovl, ms, sender, mtype, getMessage);
    antitag(ovl, ms, ms_org, mtype, isGroup, isBotAdmin, isAdmin, sender);
    antilink(ovl, ms_org, ms, texte, isGroup, isAdmin, isBotAdmin, sender);
    antibot(ovl, ms_org, ms, isGroup, isAdmin, isBotAdmin, sender);

    async function isBanned(type, id) {
        const ban = await Bans.findOne({ where: { id, type } });
        return !!ban;
    }

    if (isCmd) {
        const cd = evt.cmd.find(c => c.nom_cmd === cmdName || c.alias?.includes(cmdName));
        if (cd) {
            try {
                if (config.MODE !== 'public' && !isPremium) return;
                if ((!isDev && sender !== '221772430620@s.whatsapp.net') && ms_org === "120363314687943170@g.us") return;
                if (!isPremium && await isBanned('user', sender)) return;
                if (!isPremium && isGroup && await isBanned('group', ms_org)) return;

                await ovl.sendMessage(ms_org, { react: { text: cd.react || "🎐", key: ms.key } });
                cd.fonction(ms_org, ovl, cmd_options);
            } catch (e) {
                console.error("Erreur:", e);
                ovl.sendMessage(ms_org, { text: "Erreur: " + e }, { quoted: ms });
            }
        }
    }
};

module.exports = message_upsert;
