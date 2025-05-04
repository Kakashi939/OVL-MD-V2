const { WA_CONF } = require('../../../DataBase/wa_conf');

async function antivv (ovl, ms) {
  const settings = await WA_CONF.findOne({ where: { id: '1' } });
  if (settings && settings.antivv === "oui") {
    let viewOnceKey = Object.keys(ms.message).find(key => key.startsWith("viewOnceMessage"));
    let vue_Unique_Message = ms.message;

    if (viewOnceKey) {
      vue_Unique_Message = ms.message[viewOnceKey].message;
    }

    if (vue_Unique_Message) {
      if (
        (vue_Unique_Message.imageMessage && vue_Unique_Message.imageMessage.viewOnce === true) ||
        (vue_Unique_Message.videoMessage && vue_Unique_Message.videoMessage.viewOnce === true) ||
        (vue_Unique_Message.audioMessage && vue_Unique_Message.audioMessage.viewOnce === true)
      ) {
        try {
          let media;
          let options = { quoted: ms };

          if (vue_Unique_Message.imageMessage) {
            media = await ovl.dl_save_media_ms(vue_Unique_Message.imageMessage);
            await ovl.sendMessage(
              ovl.user.id,
              { image: { url: media }, caption: vue_Unique_Message.imageMessage.caption || "" },
              options
            );
          } else if (vue_Unique_Message.videoMessage) {
            media = await ovl.dl_save_media_ms(vue_Unique_Message.videoMessage);
            await ovl.sendMessage(
              ovl.user.id,
              { video: { url: media }, caption: vue_Unique_Message.videoMessage.caption || "" },
              options
            );
          } else if (vue_Unique_Message.audioMessage) {
            media = await ovl.dl_save_media_ms(vue_Unique_Message.audioMessage);
            await ovl.sendMessage(
              ovl.user.id,
              { audio: { url: media }, mimetype: "audio/mp4", ptt: false },
              options
            );
          }
        } catch (_error) {
          console.error("❌ Erreur lors du traitement du message en vue unique :", _error.message || _error);
        }
      }
    }
  }
};

module.exports = antivv;
