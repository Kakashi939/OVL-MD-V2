 if (ms.message?.[mtype]?.contextInfo?.mentionedJid?.length > 30) {

    try {
        const settings = await Antitag.findOne({ where: { id: ms_org } });

        if (verif_Groupe && settings && settings.mode === 'oui') {
            if (!verif_Admin && verif_Ovl_Admin) {
                const username = auteur_Message.split("@")[0];

                switch (settings.type) {
                    case 'supp':
                        await ovl.sendMessage(ms_org, {
                            text: `@${username}, l'envoi de tags multiples est interdit dans ce groupe.`,
                            mentions: [auteur_Message]
                        }, { quoted: ms });
                        await ovl.sendMessage(ms_org, { delete: ms.key });
                        break;

                    case 'kick':
                        await ovl.sendMessage(ms_org, {
                            text: `@${username} a été retiré du groupe pour avoir mentionné plus de 30 membres.`,
                            mentions: [auteur_Message]
                        });
                        await ovl.sendMessage(ms_org, { delete: ms.key });
                        await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                        break;

                    case 'warn':
                        let warning = await Antitag_warnings.findOne({
                            where: { groupId: ms_org, userId: auteur_Message }
                        });

                        if (!warning) {
                            await Antitag_warnings.create({ groupId: ms_org, userId: auteur_Message });
                            await ovl.sendMessage(ms_org, {
                                text: `@${username}, vous avez reçu un avertissement (1/3) pour avoir mentionné plus de 30 membres.`,
                                mentions: [auteur_Message]
                            });
                        } else {
                            warning.count += 1;
                            await warning.save();

                            if (warning.count >= 3) {
                                await ovl.sendMessage(ms_org, {
                                    text: `@${username} a été retiré du groupe après 3 avertissements.`,
                                    mentions: [auteur_Message]
                                });
                                await ovl.sendMessage(ms_org, { delete: ms.key });
                                await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                                await warning.destroy();
                            } else {
                                await ovl.sendMessage(ms_org, {
                                    text: `@${username}, avertissement ${warning.count}/3 pour avoir mentionné plus de 30 membres.`,
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
    } catch (error) {
        console.error("Erreur dans le système Antitag :", error);
    }
 }
