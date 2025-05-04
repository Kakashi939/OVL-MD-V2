const { Antibot, AntibotWarnings } = require("../../DataBase/antibot");

async function antibot(ovl, ms_org, ms, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message) {
    try {
        const botMsg = (ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16) ||
                       (ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16) ||
                       (ms.key?.id?.startsWith('3EB0') && ms.key?.id?.length >= 12);

        if (botMsg) {
            const settings = await Antibot.findOne({ where: { id: ms_org } });
            if (verif_Groupe && settings && settings.mode === 'oui') {
                if (!verif_Admin && verif_Ovl_Admin) {
                    const key = {
                        remoteJid: ms_org,
                        fromMe: false,
                        id: ms.key.id,
                        participant: auteur_Message
                    };

                    switch (settings.type) {
                        case 'supp':
                            await ovl.sendMessage(ms_org, {
                                text: `@${auteur_Message.split("@")[0]}, les bots ne sont pas autorisés ici.`,
                                mentions: [auteur_Message]
                            });
                            await ovl.sendMessage(ms_org, { delete: ms.key });
                            break;

                        case 'kick':
                            await ovl.sendMessage(ms_org, {
                                text: `@${auteur_Message.split("@")[0]} a été retiré pour avoir utilisé un bot.`,
                                mentions: [auteur_Message]
                            });
                            await ovl.sendMessage(ms_org, { delete: ms.key });
                            await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                            break;

                        case 'warn':
                            let warning = await Antibot_warnings.findOne({
                                where: { groupId: ms_org, userId: auteur_Message }
                            });

                            if (!warning) {
                                await Antibot_warnings.create({ groupId: ms_org, userId: auteur_Message });
                                await ovl.sendMessage(ms_org, {
                                    text: `@${auteur_Message.split("@")[0]}, avertissement 1/3 pour utilisation de bot.`,
                                    mentions: [auteur_Message]
                                });
                            } else {
                                warning.count += 1;
                                await warning.save();

                                if (warning.count >= 3) {
                                    await ovl.sendMessage(ms_org, {
                                        text: `@${auteur_Message.split("@")[0]} a été retiré après 3 avertissements.`,
                                        mentions: [auteur_Message]
                                    });
                                    await ovl.sendMessage(ms_org, { delete: ms.key });
                                    await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                                    await warning.destroy();
                                } else {
                                    await ovl.sendMessage(ms_org, {
                                        text: `@${auteur_Message.split("@")[0]}, avertissement ${warning.count}/3 pour utilisation de bot.`,
                                        mentions: [auteur_Message]
                                    });
                                }
                            }
                            break;

                        default:
                            console.error(`Action inconnue : ${settings.type}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Erreur dans le système Anti-Bot :", error);
    }
}

module.exports = antibot;
