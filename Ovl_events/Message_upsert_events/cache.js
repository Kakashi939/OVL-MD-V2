const groupCache = new Map();

async function getmetadata(ovl, jid) {
    if (!jid || typeof jid !== 'string' || !jid.endsWith('@g.us')) return null;

    if (groupCache.has(jid)) {
        return groupCache.get(jid);
    }

    try {
        const metadata = await ovl.groupMetadata(jid);
        groupCache.set(jid, metadata);
        return metadata;
    } catch (e) {
        console.error("❌ Erreur lors de la récupération des métadonnées du groupe :", e.message);
        return null;
    }
}

module.exports = getmetadata;
