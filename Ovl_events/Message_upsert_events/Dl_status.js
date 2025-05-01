if (ms_org === "status@broadcast" && settings.dl_status === "oui") {
    if (ms.message.extendedTextMessage) {
        await ovl.sendMessage(id_Bot, { text: ms.message.extendedTextMessage.text }, { quoted: ms });
    } else if (ms.message.imageMessage) {
        let imgs = await ovl.dl_save_media_ms(ms.message.imageMessage);
        await ovl.sendMessage(id_Bot, { image: { url: imgs }, caption: ms.message.imageMessage.caption }, { quoted: ms });
    } else if (ms.message.videoMessage) {
        let vids = await ovl.dl_save_media_ms(ms.message.videoMessage);
        await ovl.sendMessage(id_Bot, { video: { url: vids }, caption: ms.message.videoMessage.caption }, { quoted: ms });
    }
}
