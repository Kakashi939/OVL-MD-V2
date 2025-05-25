const contactCache = {};

function updateContacts(contacts) {
    for (const contact of contacts) {
        contactCache[contact.id] = contact.name || contact.notify || null;
        console.log(`🔹 Contact ajouté : ${contact.id} → ${contactCache[contact.id]}`);
        console.log(contacts);
    }
}

function getUserName(jid) {
    return contactCache[jid] || "Nom inconnu";
}

module.exports = {
    updateContacts,
    getUserName,
    contactCache
};
