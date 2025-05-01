try {
    if ((texte.includes('https://') || texte.includes('http://'))) {
   // if (linkRegex.test(texte)) {
     const settings = await Antilink.findOne({ where: { id: ms_org } });
        if (verif_Groupe && settings && settings.mode == 'oui') {
        if (!verif_Admin && verif_Ovl_Admin) {
          switch (settings.type) {
            case 'supp':
                await ovl.sendMessage(ms_org, {
                    text: `@${auteur_Message.split("@")[0]}, les liens ne sont pas autorisés ici.`,
                    mentions: [auteur_Message]
                });
                await ovl.sendMessage(ms_org, { delete: ms.key });
                break;

            case 'kick':
                await ovl.sendMessage(ms_org, {
                    text: `@${auteur_Message.split("@")[0]} a été retiré pour avoir envoyé un lien.`,
                    mentions: [auteur_Message]
                });
                await ovl.sendMessage(ms_org, { delete: ms.key });
                await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                break;

            case 'warn':
                let warning = await Antilink_warnings.findOne({
                    where: { groupId: ms_org, userId: auteur_Message }
                });

                if (!warning) {
                    await Antilink_warnings.create({ groupId: ms_org, userId: auteur_Message });
                    await ovl.sendMessage(ms_org, {
                        text: `@${auteur_Message.split("@")[0]}, avertissement 1/3 pour avoir envoyé un lien.`,
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
                            text: `@${auteur_Message.split("@")[0]}, avertissement ${warning.count}/3 pour avoir envoyé un lien.`,
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
    console.error("Erreur dans le système Antilink :", error);
}
