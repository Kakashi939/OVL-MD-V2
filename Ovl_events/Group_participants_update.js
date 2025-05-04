module.exports = async group_participants_update (data) => {
    const parseID = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
        }
        return jid;
    };

    try {
        const groupInfo = await ovl.groupMetadata(data.id);
        const settings = await GroupSettings.findOne({ where: { id: data.id } });
        if (!settings) return;

        const { welcome, goodbye, antipromote, antidemote } = settings;

        for (const participant of data.participants) {
         let profilePic;
            try {
                profilePic = await ovl.profilePictureUrl(participant, 'image');
            } catch (err) {
             console.error(err);
                profilePic = 'https://files.catbox.moe/54ip7g.jpg';
            }

            const userMention = `@${participant.split("@")[0]}`;

            if (data.action === 'add' && welcome === 'oui') {
                const groupName = groupInfo.subject || "Groupe inconnu";
                const totalMembers = groupInfo.participants.length;
                const message = `*🎉Bienvenue ${userMention}🎉*\n*👥Groupe: ${groupName}*\n*🔆Membres: #${totalMembers}*\n*📃Description:* ${groupInfo.desc || "Aucune description"}`;

                await ovl.sendMessage(data.id, {
                    image: { url: profilePic },
                    caption: message,
                    mentions: [participant]
                });
            }

            if (data.action === 'remove' && goodbye === 'oui') {
                await ovl.sendMessage(data.id, { text: `👋Au revoir ${userMention}`, mentions: [participant] });
            }

            if (data.action === 'promote' && antipromote === 'oui') {
                await ovl.groupParticipantsUpdate(data.id, [participant], "demote");
                await ovl.sendMessage(data.id, {
                    text: `🚫Promotion non autorisée: ${userMention} a été rétrogradé.`,
                    mentions: [participant],
                });
            }

            if (data.action === 'demote' && antidemote === 'oui') {
                await ovl.groupParticipantsUpdate(data.id, [participant], "promote");
                await ovl.sendMessage(data.id, {
                    text: `🚫Rétrogradation non autorisée: ${userMention} a été promu à nouveau.`,
                    mentions: [participant],
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
};
