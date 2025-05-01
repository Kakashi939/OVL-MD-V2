if (ms_org === "status@broadcast" && settings.like_status === "oui") {
    await ovl.sendMessage(ms_org, { react: { key: ms.key, text: "💚" } }, { statusJidList: [ms.key.participant, id_Bot], broadcast: true });
}
