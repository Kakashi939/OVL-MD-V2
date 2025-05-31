const groupCache = new Map();

async function getLid(jid, ovl) {
    try {
        if (!jid || typeof jid !== "string") return null;
        if (jid.endsWith("@lid")) return jid;
        if (groupCache.has(jid)) return groupCache.get(jid);

        const result = await ovl.onWhatsApp(jid);
        if (!result || !result[0]?.lid) return null;

        const lid = result[0].lid;
        groupCache.set(jid, lid);
        return lid;
    } catch (e) {
        console.error("Erreur dans JidToLid:", e.message);
        return null;
    }
}

module.exports = getLid;
