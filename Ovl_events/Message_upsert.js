module.exports = async message_upsert(m) => {
    if (m.type !== 'notify') return;

    const { messages } = m;
    const ms = messages[0];
    if (!ms.message) return;
 addMessage(ms.key.id, ms);

    const decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
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
    const verif_Groupe = ms_org?.endsWith("@g.us");
    const infos_Groupe = verif_Groupe ? await ovl.groupMetadata(ms_org) : "";
    const nom_Groupe = verif_Groupe ? infos_Groupe.subject : "";
    const msg_Repondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const auteur_Msg_Repondu = decodeJid(ms.message.extendedTextMessage?.contextInfo?.participant);
    const mr = ms.message.extendedTextMessage?.contextInfo?.mentionedJid;
    const auteur_Message = verif_Groupe ? ms.key.participant : decodeJid(ms.key.fromMe ? id_Bot : ms.key.remoteJid);
    const membre_Groupe = verif_Groupe ? ms.key.participant : '';
    const nom_Auteur_Message = ms.pushName;
    const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
    const verif_Cmd = texte ? texte.startsWith(prefixe) : false;
    const cmds = verif_Cmd ? texte.slice(prefixe.length).trim().split(/ +/).shift().toLowerCase() : false;
    const groupe_Admin = (participants) => participants.filter((m) => m.admin).map((m) => m.id);
    const mbre_membre = verif_Groupe ? await infos_Groupe.participants : '';
    const admins = verif_Groupe ? groupe_Admin(mbre_membre) : '';
    const verif_Ovl_Admin = verif_Groupe ? admins.includes(id_Bot) : false;
    const Ainz = '22651463203';
const Ainzbot = '22605463559';
const devNumbers = [Ainz, Ainzbot];
async function obtenirUsersPremium() {
  try {
    const sudos = await Sudo.findAll({ attributes: ['id'] });
    if (!sudos.length) {
      return [];
    }
    return sudos.map((entry) => entry.id.replace(/[^0-9]/g, ""));
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs sudo :", error);
    return [];
  }
}
const sudoUsers = await obtenirUsersPremium();
const premium_Users_id = [Ainz, Ainzbot, id_Bot_N, config.NUMERO_OWNER, sudoUsers]
  .flat()
  .map((s) => (typeof s === 'string' ? `${s.replace(/[^0-9]/g, "")}@s.whatsapp.net` : ''));
const prenium_id = premium_Users_id.includes(auteur_Message);
const dev_id = devNumbers
  .map((s) => (typeof s === 'string' ? `${s.replace(/[^0-9]/g, "")}@s.whatsapp.net` : ''))
  .includes(auteur_Message);
const dev_num = devNumbers
  .map((s) => (typeof s === 'string' ? `${s.replace(/[^0-9]/g, "")}@s.whatsapp.net` : ''));
const verif_Admin = verif_Groupe 
    ? admins.includes(auteur_Message) || premium_Users_id.includes(auteur_Message) 
    : false;
 function repondre(message) {
        ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
 };
    const cmd_options = {
        verif_Groupe,
        mbre_membre,
        membre_Groupe,
        verif_Admin,
        infos_Groupe,
        nom_Groupe,
        auteur_Message,
        nom_Auteur_Message,
        id_Bot,
        prenium_id,
        dev_id,
        dev_num,
        id_Bot_N,
        verif_Ovl_Admin,
        prefixe,
        arg,
        repondre,
        groupe_Admin,
        msg_Repondu,
        auteur_Msg_Repondu,
        ms,
        ms_org,
    };
 
//Rank messages && Level up

 // Fin Rank et Level up
 
 const settings = await WA_CONF.findOne({ where: { id: '1' } });
        if (settings) {
// Présence


// Auto read status


// Like status


// DL_STATUS


// Anti Vue Unique



   //antidelete

 //fin antidelete
 
//Antitag 

//Fin antitag
 
          //antilink
         // const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[^\s]+)/gi;



          //fin antilink

 // Antibot

// fin antibot

 // quelque fonctions 
 async function user_ban(userId) {
    const ban = await Bans.findOne({ where: { id: userId, type: 'user' } });
    return !!ban;
}
async function groupe_ban(groupId) {
    const ban = await Bans.findOne({ where: { id: groupId, type: 'group' } });
    return !!ban;
}
 //fin fonction    
 if (verif_Cmd) { 
        const cd = evt.cmd.find((ovlcmd) => ovlcmd.nom_cmd === cmds || (ovlcmd.alias && ovlcmd.alias.includes(cmds)));
        
        if (cd) {
             try {
                if (config.MODE !== 'public' && !prenium_id) {
                    return 
                }
                if ((!dev_id && auteur_Message !== '221772430620@s.whatsapp.net') && ms_org === "120363314687943170@g.us") {
                return;
            }
                if (!prenium_id) {
                const user_bans = await user_ban(auteur_Message);
                const groupe_bans = verif_Groupe ? await groupe_ban(ms_org) : false;

                if (user_bans || groupe_bans) {
                    return;
                }
                };
             if(cd.react) {
                await ovl.sendMessage(ms_org, { react: { text: cd.react, key: ms.key } });
             } else { await ovl.sendMessage(ms_org, { react: { text: "🎐", key: ms.key } });
                    }
              cd.fonction(ms_org, ovl, cmd_options);
            } catch (e) {
                console.log("Erreur: " + e);
                ovl.sendMessage(ms_org, { text: "Erreur: " + e }, { quoted: ms });
            }
        }
    }
};
