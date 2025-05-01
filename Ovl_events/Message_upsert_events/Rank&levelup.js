 if (texte && auteur_Message.endsWith("s.whatsapp.net")) {
    let userId = auteur_Message;
    const user = await Ranks.findOne({ where: { id: userId } });
    if (!user) {
        await Ranks.create({
            id: userId,
            name: nom_Auteur_Message,
            level: 0,
            exp: 10,
            messages: 1,
        });
    } else {
        user.name = nom_Auteur_Message;
        user.messages += 1;
        user.exp += 10;

        const newLevel = calculateLevel(user.exp);

        if (newLevel > user.level && config.LEVEL_UP == 'oui') {
            await ovl.sendMessage(ms_org, {
                text: `Félicitations ${nom_Auteur_Message}! Vous avez atteint le niveau ${newLevel}! 🎉`
            });
        }

        user.level = newLevel;
        await user.save();
    }
 };
