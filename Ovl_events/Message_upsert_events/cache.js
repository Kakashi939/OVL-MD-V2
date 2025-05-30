const groupCache = new Map();

async function getMetadata(ovl, groupJid) {
    if (groupCache.has(groupJid)) {
        return groupCache.get(groupJid);
    }

    try {
        const metadata = await ovl.groupMetadata(groupJid);
        groupCache.set(groupJid, metadata);
        return metadata;
    } catch (e) {
        console.error("Erreur lors de la récupération des métadonnées du groupe :", e.message);
        return null;
    }
}

module.exports = getMetadata;
